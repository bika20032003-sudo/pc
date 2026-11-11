import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Printer,
  Filter,
  Briefcase,
  FileSpreadsheet,
  LogIn,
  LogOut,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  UserX,
  ShieldCheck,
  CheckCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';
import { normalizeArabicText } from '../utils/arabicUtils.js';

// Libyan Police Ranks Hierarchy for ordering
const getMilitaryRankScore = (rawRank, type) => {
  const r = String(rawRank || '').replace(/[\u0640]/g, '').trim().toLowerCase();
  const isCiv = (type && String(type).includes('مدني')) || r.includes('مدني');
  if (isCiv) return 1000;

  if (r.includes('لواء')) return 1;
  if (r.includes('عميد')) return 2;
  if (r.includes('عقيد')) return 3;
  if (r.includes('مقدم')) return 4;
  if (r.includes('رائد')) return 5;
  if (r.includes('نقيب')) return 6;
  if (r.includes('ملازم') && (r.includes('اول') || r.includes('أول') || r.includes('1') || r.includes('//'))) return 7;
  if (r.includes('ملازم')) return 8;
  if (r.includes('نائب ضابط اول') || r.includes('نائب ضابط أول') || r === 'ن.ض.أ' || r === 'ن ض ا') return 9;
  if (r.includes('نائب ضابط') || r === 'ن.ض' || r === 'ن ض') return 10;
  if (r.includes('مساعد ضابط اول') || r.includes('مساعد ضابط أول') || r === 'م.ض.أ' || r === 'م ض ا') return 11;
  if (r.includes('مساعد ضابط') || r === 'م.ض' || r === 'م ض' || r === 'م.ص') return 12;
  if (r.includes('رئيس عرفاء اول') || r.includes('رئيس عرفاء أول') || r.includes('ريس عرفاء اول') || r.includes('ر.ع.أ')) return 13;
  if (r.includes('رئيس عرفاء') || r.includes('ريس عرفاء') || r === 'ر.ع' || r === 'رع' || r === 'ر ع') return 14;
  if (r.includes('عريف') && !r.includes('نائب')) return 15;
  if (r.includes('نائب عريف')) return 16;
  if (r.includes('شرطي') || r.includes('شـرطـي')) return 17;

  return 900;
};

// Formats current time into readable Arabic time format (e.g. 08:30 ص)
const getCurrentArabicTime = () => {
  const d = new Date();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHours}:${displayMinutes} ${period}`;
};

export default function AttendanceSection({ forceMembers = [], user = {} }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [quickInputVal, setQuickInputVal] = useState('');
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Attendance Records State (persisted in localStorage and synced with API)
  const [attendanceMap, setAttendanceMap] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_attendance_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sync attendance with backend on date change
  useEffect(() => {
    fetch(`/api/attendance?date=${selectedDate}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.records) {
          setAttendanceMap(prev => ({
            ...prev,
            [selectedDate]: {
              ...(prev[selectedDate] || {}),
              ...json.records
            }
          }));
        }
      })
      .catch(() => {});
  }, [selectedDate]);

  // Extract unique departments from the REAL database
  const departmentsList = useMemo(() => {
    const set = new Set();
    forceMembers.forEach(m => {
      if (m.department && m.department.trim()) {
        set.add(m.department.trim());
      }
    });
    return Array.from(set).sort();
  }, [forceMembers]);

  // Real Daily Roster: strictly no fake/dummy data!
  const dailyRoster = useMemo(() => {
    const dateRecords = attendanceMap[selectedDate] || {};

    const list = forceMembers.map((m, idx) => {
      const rec = dateRecords[m.id] || dateRecords[m.financial_number] || dateRecords[m.national_id];

      // Default baseline: strictly determined by member's official job status from central database
      let status = 'لم يسجل بعد';
      let time_in = '---';
      let time_out = '---';
      let notes = '';
      let isExplicitlyRecorded = false;

      const rawJobStatus = (m.job_status || m.status || '').trim();

      if (rec) {
        status = rec.status;
        time_in = rec.time_in || '---';
        time_out = rec.time_out || '---';
        notes = rec.notes || '';
        isExplicitlyRecorded = true;
      } else if (rawJobStatus.includes('إجازة')) {
        status = 'إجازة رسمية';
        notes = 'مسجل بإجازة رسمية في قاعدة البيانات';
      } else if (rawJobStatus.includes('موقوف') || rawJobStatus.includes('إيقاف') || rawJobStatus.includes('معلق')) {
        status = 'موقوف عن العمل';
        notes = 'موقوف بموجب السجل الوظيفي';
      }

      return {
        id: m.id || idx + 1,
        key: m.id,
        member: m,
        name: m.name || '---',
        financial_number: m.financial_number || m.job_number || '---',
        national_id: m.national_id || '---',
        rank: m.job_title || m.rank || (m.type === 'شرطي' ? 'شرطي' : 'موظف مدني'),
        type: m.type || 'شرطي',
        department: m.department || 'ديوان مديرية أمن أوباري',
        status,
        time_in,
        time_out,
        notes,
        isExplicitlyRecorded
      };
    });

    // Sort hierarchically: Military rank first, then alphabetical by name
    return list.sort((a, b) => {
      const scoreA = getMilitaryRankScore(a.rank, a.type);
      const scoreB = getMilitaryRankScore(b.rank, b.type);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return (a.name || '').localeCompare(b.name || '', 'ar-LY', { sensitivity: 'base' });
    });
  }, [forceMembers, attendanceMap, selectedDate]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    const q = normalizeArabicText(searchTerm);

    return dailyRoster.filter(r => {
      const matchDept = selectedDept === 'all' || r.department === selectedDept;
      
      const matchStatus =
        selectedStatus === 'all' ? true :
        selectedStatus === 'حاضر' ? (r.status === 'حاضر' || r.status === 'انصرف') :
        selectedStatus === 'انصرف' ? r.status === 'انصرف' :
        selectedStatus === 'غائب' ? r.status === 'غائب' :
        selectedStatus === 'إجازة' ? r.status.includes('إجازة') :
        selectedStatus === 'مأمورية' ? r.status === 'مأمورية' :
        selectedStatus === 'متأخر' ? r.status === 'متأخر' :
        selectedStatus === 'معلق' ? r.status === 'لم يسجل بعد' : true;

      if (!matchDept || !matchStatus) return false;

      if (!q) return true;
      return (
        normalizeArabicText(r.name).includes(q) ||
        normalizeArabicText(r.financial_number).includes(q) ||
        normalizeArabicText(r.national_id).includes(q) ||
        normalizeArabicText(r.rank).includes(q) ||
        normalizeArabicText(r.department).includes(q)
      );
    });
  }, [dailyRoster, selectedDept, selectedStatus, searchTerm]);

  // Real Metrics based on actual records
  const metrics = useMemo(() => {
    const currentScope = selectedDept === 'all' ? dailyRoster : dailyRoster.filter(r => r.department === selectedDept);
    const total = currentScope.length;

    let present = 0;
    let checkedOut = 0;
    let absent = 0;
    let leave = 0;
    let mission = 0;
    let late = 0;
    let pending = 0;

    currentScope.forEach(r => {
      if (r.status === 'حاضر') present++;
      else if (r.status === 'انصرف') {
        present++;
        checkedOut++;
      } else if (r.status === 'غائب') absent++;
      else if (r.status.includes('إجازة')) leave++;
      else if (r.status === 'مأمورية') mission++;
      else if (r.status === 'متأخر') {
        present++;
        late++;
      } else {
        pending++;
      }
    });

    const activeDutyTotal = total - leave;
    const rate = activeDutyTotal > 0 ? ((present / activeDutyTotal) * 100).toFixed(1) : '0';

    return { total, present, checkedOut, absent, leave, mission, late, pending, rate };
  }, [dailyRoster, selectedDept]);

  // Pagination
  const totalPages = Math.ceil(filteredRoster.length / rowsPerPage) || 1;
  const paginatedRoster = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRoster.slice(start, start + rowsPerPage);
  }, [filteredRoster, currentPage, rowsPerPage]);

  // Save single attendance record
  const updateMemberAttendance = (memberKey, recordData) => {
    const dateRecords = { ...(attendanceMap[selectedDate] || {}) };
    dateRecords[memberKey] = {
      ...(dateRecords[memberKey] || {}),
      ...recordData,
      recorded_by: user.name || user.username || 'الضابط المناوب',
      updated_at: new Date().toISOString()
    };

    const updatedMap = {
      ...attendanceMap,
      [selectedDate]: dateRecords
    };

    setAttendanceMap(updatedMap);
    try {
      localStorage.setItem('ubari_attendance_map', JSON.stringify(updatedMap));
    } catch {}

    // Sync to backend
    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate,
        member_id: memberKey,
        ...dateRecords[memberKey]
      })
    }).catch(() => {});
  };

  // Instant Quick Check-in by Financial Number / National ID Scanner
  const handleQuickScannerCheckIn = (e) => {
    e.preventDefault();
    const query = quickInputVal.trim();
    if (!query) return;

    const normQuery = normalizeArabicText(query);

    // Look for exact match by financial number or national id first, then name
    const found = forceMembers.find(m =>
      String(m.financial_number || m.job_number || '').trim() === query ||
      String(m.national_id || '').trim() === query ||
      normalizeArabicText(m.name) === normQuery
    );

    if (!found) {
      setNotification({
        type: 'error',
        text: `⚠️ لم يتم العثور على أي منتسب بالرقم: "${query}". تأكد من صحة الرقم المالي.`
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    const currentTime = getCurrentArabicTime();
    updateMemberAttendance(found.id, {
      status: 'حاضر',
      time_in: currentTime,
      notes: 'تسجيل حضور فوري بالرقم المالي'
    });

    setNotification({
      type: 'success',
      text: `✅ تم تسجيل تمام الحضور لـ (${found.job_title || 'عضو'} / ${found.name}) - [${found.department || 'أوباري'}] في تمام الساعة ${currentTime}`
    });
    setQuickInputVal('');
    setTimeout(() => setNotification(null), 5000);
  };

  // Mark present with current real time
  const handleMarkPresent = (r) => {
    const time = getCurrentArabicTime();
    updateMemberAttendance(r.key, {
      status: 'حاضر',
      time_in: r.time_in !== '---' ? r.time_in : time
    });
  };

  // Mark Departure (انصراف) with current real time
  const handleMarkDeparture = (r) => {
    const time = getCurrentArabicTime();
    updateMemberAttendance(r.key, {
      status: 'انصرف',
      time_out: time
    });
  };

  // Mark Absent (غائب)
  const handleMarkAbsent = (r) => {
    updateMemberAttendance(r.key, {
      status: 'غائب',
      time_in: '---',
      time_out: '---',
      notes: 'غياب بدون إذن مسبق'
    });
  };

  // Mark Official Mission (مأمورية أمنية)
  const handleMarkMission = (r) => {
    updateMemberAttendance(r.key, {
      status: 'مأمورية',
      time_in: '---',
      time_out: '---',
      notes: 'مكلف بمأمورية أمنية خارجية'
    });
  };

  // Reset/Clear attendance for a member
  const handleResetStatus = (r) => {
    const dateRecords = { ...(attendanceMap[selectedDate] || {}) };
    delete dateRecords[r.key];

    const updatedMap = {
      ...attendanceMap,
      [selectedDate]: dateRecords
    };

    setAttendanceMap(updatedMap);
    try {
      localStorage.setItem('ubari_attendance_map', JSON.stringify(updatedMap));
    } catch {}
  };

  // Bulk check-in for the currently filtered department
  const handleBulkCheckInDepartment = () => {
    const targetDeptName = selectedDept === 'all' ? 'كافة أقسام المديرية' : selectedDept;
    
    // Only target members who are currently 'لم يسجل بعد'
    const pendingMembers = filteredRoster.filter(r => r.status === 'لم يسجل بعد');

    if (pendingMembers.length === 0) {
      alert(`كافة منتسبي (${targetDeptName}) مسجل تمامهم بالفعل!`);
      return;
    }

    if (confirm(`هل أنت متأكد من تسجيل حضور جماعي لـ (${pendingMembers.length}) منتسب في [${targetDeptName}]؟`)) {
      const currentTime = getCurrentArabicTime();
      const currentDayRecords = { ...(attendanceMap[selectedDate] || {}) };
      const batchToSend = {};

      pendingMembers.forEach(r => {
        const item = {
          status: 'حاضر',
          time_in: currentTime,
          notes: 'تمام جماعي معتمد للقسم',
          recorded_by: user.name || 'الضابط المناوب'
        };
        currentDayRecords[r.key] = item;
        batchToSend[r.key] = item;
      });

      const updatedMap = {
        ...attendanceMap,
        [selectedDate]: currentDayRecords
      };

      setAttendanceMap(updatedMap);
      try {
        localStorage.setItem('ubari_attendance_map', JSON.stringify(updatedMap));
      } catch {}

      fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          records: batchToSend
        })
      }).catch(() => {});

      setNotification({
        type: 'success',
        text: `✅ تم تسجيل تمام الحضور الجماعي لـ (${pendingMembers.length}) عضو في [${targetDeptName}] بنجاح!`
      });
      setTimeout(() => setNotification(null), 4500);
    }
  };

  // Export actual attendance to Excel / CSV with UTF-8 BOM
  const handleExportAttendanceExcel = () => {
    try {
      const headers = ['ت', 'الاسم الرباعي', 'الرقم المالي', 'الرقم الوطني', 'الرتبة', 'القسم / التبعية', 'حالة التمام', 'وقت الحضور', 'وقت الانصراف', 'الملاحظات'];
      const rows = filteredRoster.map((r, idx) => [
        `"${idx + 1}"`,
        `"${r.name}"`,
        `"${r.financial_number}"`,
        `"${r.national_id}"`,
        `"${r.rank}"`,
        `"${r.department}"`,
        `"${r.status}"`,
        `"${r.time_in}"`,
        `"${r.time_out}"`,
        `"${r.notes}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `كشف_حضور_تمام_مديرية_أمن_أوباري_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert('حدث خطأ أثناء تصدير ملف الإكسل');
    }
  };

  // Print Official A4 Daily Attendance Roster
  const handlePrintAttendanceSheet = () => {
    const printRows = filteredRoster.slice(0, 36);
    const html = `
      <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 20px; color: #0a192f; max-width: 800px; margin: 0 auto;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <!-- Header -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 16px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11.5px; font-weight: 700; color: #64748b;">قسم الشؤون الإدارية والمالية • وحدة التمام والانضباط العام</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 70px;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار الوزارة" style="width: 60px; height: 60px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ministry of Interior • Libya</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Daily Force Roll Call Roster</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 17px; font-weight: 900; color: #0f172a; text-decoration: underline;">
            كشف التمام والحضور اليومي المعتمد للقوة العمومية
          </h2>
          <div style="font-size: 12px; color: #64748b; font-weight: 700; margin-top: 4px;">
            تاريخ التمام: <strong>${selectedDate}</strong> • القسم: <strong>${selectedDept === 'all' ? 'كافة الأقسام والمراكز' : selectedDept}</strong>
          </div>
        </div>

        <!-- Summary Statistics -->
        <div style="display: flex; justify-content: space-around; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 16px; font-size: 11px;">
          <div><strong>إجمالي القوة:</strong> ${metrics.total}</div>
          <div><strong>الحاضرون فعلياً:</strong> <span style="color: #15803d; font-weight: bold;">${metrics.present}</span></div>
          <div><strong>انصراف رسمي:</strong> ${metrics.checkedOut}</div>
          <div><strong>الغياب غير المبرر:</strong> <span style="color: #dc2626; font-weight: bold;">${metrics.absent}</span></div>
          <div><strong>إجازات رسمية:</strong> ${metrics.leave}</div>
          <div><strong>مهمات أمنية:</strong> ${metrics.mission}</div>
          <div><strong>في انتظار التمام:</strong> ${metrics.pending}</div>
          <div><strong>نسبة الانضباط:</strong> <span style="color: #1e3a8a; font-weight: 900;">${metrics.rate}%</span></div>
        </div>

        <!-- Attendance Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; text-align: right; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 30px; text-align: center;">ت</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1;">الاسم الرباعي</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 80px;">الرقم المالي</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 80px;">الرتبة</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 150px;">القسم والتبعية</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 85px; text-align: center;">حالة التمام</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 75px; text-align: center;">وقت الحضور</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 75px; text-align: center;">الانصراف</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${printRows.map((r, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${r.name}</td>
                <td style="padding: 5px; border: 1px solid #cbd5e1;">${r.financial_number}</td>
                <td style="padding: 5px; border: 1px solid #cbd5e1;">${r.rank}</td>
                <td style="padding: 5px; border: 1px solid #cbd5e1;">${r.department}</td>
                <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${
                  r.status === 'حاضر' || r.status === 'انصرف' ? '#15803d' :
                  r.status === 'غائب' ? '#dc2626' :
                  r.status.includes('إجازة') ? '#2563eb' : '#64748b'
                };">
                  ${r.status}
                </td>
                <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center;">${r.time_in}</td>
                <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: center;">${r.time_out}</td>
                <td style="padding: 5px; border: 1px solid #cbd5e1; font-size: 9.5px; color: #64748b;">${r.notes || '---'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 35px; padding: 0 30px;">
          <div>
            <div style="font-weight: 800; font-size: 13px;">ضابط خفر التمام والانضباط</div>
            <div style="margin-top: 30px; font-size: 12px; font-weight: 700;">نقيب / علي محمد البشير</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">رئيس قسم الشؤون الإدارية</div>
            <div style="margin-top: 30px; font-size: 12px; font-weight: 700;">مقدم / سالم عبدالكريم</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">يعتمد / مدير مديرية أمن أوباري</div>
            <div style="margin-top: 30px; font-size: 12px; font-weight: 900; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `كشف_التمام_اليومي_${selectedDate}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Header Bar */}
      <div className="module-view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Clock size={28} color="#1e3a8a" />
            منظومة الحضور والانصراف والتمام اليومي المعتمد
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0', fontWeight: 700 }}>
            مديرية أمن أوباري • ربط حي مع قاعدة البيانات المركزية (قوة 2222) • رصد الحضور الفعلي بالوقت والتاريخ
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Date Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <Calendar size={16} color="#1e3a8a" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 800,
                fontSize: '13px',
                color: '#0a192f',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Bulk Check-In for Filtered Department */}
          <button
            onClick={handleBulkCheckInDepartment}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              background: '#f0fdf4',
              color: '#15803d',
              border: '1.5px solid #86efac',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="تسجيل تمام الحضور لكافة منتسبي القسم المختار الذين لم يسجلوا بعد"
          >
            <CheckCheck size={16} />
            <span>تثبيت حضور قوة القسم</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportAttendanceExcel}
            className="btn-toolbar-excel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              background: '#ffffff',
              color: '#166534',
              border: '1px solid #86efac',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير إكسل</span>
          </button>

          {/* Print Roster */}
          <button
            onClick={handlePrintAttendanceSheet}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30,58,138,0.25)'
            }}
          >
            <Printer size={16} />
            <span>طباعة كشف التمام اليومي (A4)</span>
          </button>
        </div>
      </div>

      {/* Instant Notification Banner */}
      {notification && (
        <div style={{
          background: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${notification.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: notification.type === 'error' ? '#991b1b' : '#166534',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontWeight: 800,
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Real Real-time Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>إجمالي القوة للقسم</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#0a192f' }}>{metrics.total.toLocaleString('ar-LY')}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>حضور فعلي مسجل</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803d' }}>{metrics.present.toLocaleString('ar-LY')}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>انصراف رسمي</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#0284c7' }}>{metrics.checkedOut}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>غياب غير مبرر</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#dc2626' }}>{metrics.absent}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>في انتظار التمام</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#d97706' }}>{metrics.pending}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>نسبة الانضباط الفعلي</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a' }}>{metrics.rate}%</div>
        </div>
      </div>

      {/* Quick Check-in Scanner Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        borderRadius: '14px',
        border: '1.5px solid #bfdbfe',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <LogIn size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>تسجيل حضور فوري (الرقم المالي أو الوطني)</strong>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>أدخل الرقم المالي للمنتسب وسيقوم النظام بتثبيت حضوره الفعلي بالوقت والتاريخ الحالي</p>
          </div>
        </div>

        <form onSubmit={handleQuickScannerCheckIn} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '420px' }}>
          <input
            type="text"
            placeholder="اكتب الرقم المالي (أو امسح بالباركود)..."
            value={quickInputVal}
            onChange={(e) => setQuickInputVal(e.target.value)}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '9px 18px',
              background: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            تسجيل حضور
          </button>
        </form>
      </div>

      {/* Filters and Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} color="#64748b" />
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                fontWeight: 800,
                outline: 'none',
                maxWidth: '240px',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="all">كافة الأقسام والمراكز ({forceMembers.length})</option>
              {departmentsList.map((d, i) => {
                const count = forceMembers.filter(m => m.department === d).length;
                return (
                  <option key={i} value={d}>{d} ({count})</option>
                );
              })}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} color="#64748b" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                fontWeight: 800,
                outline: 'none',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="all">كافة الحالات</option>
              <option value="حاضر">🟢 حاضرون اليوم ({metrics.present})</option>
              <option value="انصرف">🔵 انصراف رسمي ({metrics.checkedOut})</option>
              <option value="غائب">🔴 غياب غير مبرر ({metrics.absent})</option>
              <option value="إجازة">🟡 إجازات رسمية ({metrics.leave})</option>
              <option value="مأمورية">🟣 مهمة رسمية ({metrics.mission})</option>
              <option value="متأخر">🟠 متأخرون ({metrics.late})</option>
              <option value="معلق">⚪ في انتظار التمام ({metrics.pending})</option>
            </select>
          </div>
        </div>

        {/* Live Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم المالي أو الوطني..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 36px 8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12.5px',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>
            قائمة تمام القوة الفعلية • تاريخ {selectedDate}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
            المطابق: {filteredRoster.length.toLocaleString('ar-LY')} منتسب (الصفحة {currentPage} من {totalPages})
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#334155', fontWeight: 800 }}>
                <th style={{ padding: '12px 14px', width: '45px', textAlign: 'center' }}>ت</th>
                <th style={{ padding: '12px 14px' }}>الاسم الكامل</th>
                <th style={{ padding: '12px 14px', width: '110px' }}>الرقم المالي</th>
                <th style={{ padding: '12px 14px', width: '120px' }}>الرتبة / الصفة</th>
                <th style={{ padding: '12px 14px' }}>القسم والتبعية</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', width: '130px' }}>حالة التمام</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', width: '90px' }}>وقت الحضور</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', width: '90px' }}>الانصراف</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', width: '220px' }}>إجراءات التمام الفوري</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoster.map((r, idx) => {
                const globalIdx = (currentPage - 1) * rowsPerPage + idx + 1;
                const isPresent = r.status === 'حاضر' || r.status === 'انصرف' || r.status === 'متأخر';
                const isAbsent = r.status === 'غائب';
                const isLeave = r.status.includes('إجازة');
                const isMission = r.status === 'مأمورية';
                const isPending = r.status === 'لم يسجل بعد';

                return (
                  <tr key={r.key} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '12px 14px', color: '#64748b', textAlign: 'center', fontWeight: 700 }}>
                      {globalIdx}
                    </td>

                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: r.type === 'شرطي' ? '#1e3a8a' : '#64748b',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {r.name ? r.name.trim().charAt(0) : 'ع'}
                        </span>
                        <span>{r.name}</span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', color: '#1e3a8a', fontWeight: 800, fontFamily: 'monospace' }}>
                      {r.financial_number}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: r.type === 'شرطي' ? '#eff6ff' : '#f8fafc',
                        color: r.type === 'شرطي' ? '#1e3a8a' : '#475569',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '12px'
                      }}>
                        {r.rank}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12.5px' }}>
                      {r.department}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 900,
                        display: 'inline-block',
                        background:
                          isPresent ? '#dcfce7' :
                          isAbsent ? '#fee2e2' :
                          isLeave ? '#eff6ff' :
                          isMission ? '#f3e8ff' : '#f1f5f9',
                        color:
                          isPresent ? '#15803d' :
                          isAbsent ? '#dc2626' :
                          isLeave ? '#1d4ed8' :
                          isMission ? '#7e22ce' : '#64748b',
                        border: `1px solid ${
                          isPresent ? '#86efac' :
                          isAbsent ? '#fca5a5' :
                          isLeave ? '#bfdbfe' :
                          isMission ? '#d8b4fe' : '#cbd5e1'
                        }`
                      }}>
                        ● {r.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: r.time_in !== '---' ? '#15803d' : '#94a3b8', fontSize: '12px' }}>
                      {r.time_in}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: r.time_out !== '---' ? '#0284c7' : '#94a3b8', fontSize: '12px' }}>
                      {r.time_out}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        {/* Present Button */}
                        <button
                          onClick={() => handleMarkPresent(r)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: r.status === 'حاضر' ? '#15803d' : '#f0fdf4',
                            color: r.status === 'حاضر' ? '#ffffff' : '#15803d',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="تسجيل حضور الآن"
                        >
                          <UserCheck size={12} />
                          <span>حاضر</span>
                        </button>

                        {/* Departure Button */}
                        <button
                          onClick={() => handleMarkDeparture(r)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: r.status === 'انصرف' ? '#0284c7' : '#eff6ff',
                            color: r.status === 'انصرف' ? '#ffffff' : '#0284c7',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="تسجيل انصراف"
                        >
                          <LogOut size={12} />
                          <span>انصراف</span>
                        </button>

                        {/* Absent Button */}
                        <button
                          onClick={() => handleMarkAbsent(r)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: r.status === 'غائب' ? '#dc2626' : '#fef2f2',
                            color: r.status === 'غائب' ? '#ffffff' : '#dc2626',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="تسجيل غياب"
                        >
                          <UserX size={12} />
                          <span>غائب</span>
                        </button>

                        {/* Mission Button */}
                        <button
                          onClick={() => handleMarkMission(r)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: r.status === 'مأمورية' ? '#7e22ce' : '#faf5ff',
                            color: r.status === 'مأمورية' ? '#ffffff' : '#7e22ce',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="مأمورية أمنية"
                        >
                          <Briefcase size={12} />
                          <span>مهمة</span>
                        </button>

                        {/* Reset Button */}
                        {r.isExplicitlyRecorded && (
                          <button
                            onClick={() => handleResetStatus(r)}
                            style={{
                              padding: '4px 6px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#64748b',
                              fontSize: '10px',
                              cursor: 'pointer'
                            }}
                            title="إلغاء التسجيل والعودة للحالة الافتراضية"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedRoster.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '14px' }}>
                    لا توجد سجلات مطابقة للبحث أو التصفية الحالية
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '16px',
            background: '#f8fafc',
            borderTop: '1px solid #edf2f7'
          }}>
            <button
              type="button"
              className="btn-official-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, padding: '6px 12px', cursor: currentPage === 1 ? 'default' : 'pointer' }}
            >
              <ChevronRight size={16} />
              <span>السابق</span>
            </button>

            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', padding: '0 10px' }}>
              الصفحة {currentPage} من {totalPages}
            </span>

            <button
              type="button"
              className="btn-official-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, padding: '6px 12px', cursor: currentPage === totalPages ? 'default' : 'pointer' }}
            >
              <span>التالي</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
