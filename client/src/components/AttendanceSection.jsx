import React, { useState, useMemo } from 'react';
import { Clock, Users, Search, CheckCircle2, XCircle, AlertCircle, Calendar, Printer, Filter, Briefcase } from 'lucide-react';
import { printDocumentInIframe } from '../utils/printHelper';

export default function AttendanceSection({ forceMembers = [], user = {} }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Attendance Records State (persisted in localStorage by date)
  const [attendanceMap, setAttendanceMap] = useState(() => {
    const saved = localStorage.getItem('ubari_attendance_map');
    return saved ? JSON.parse(saved) : {};
  });

  // Departments List
  const departmentsList = useMemo(() => {
    const set = new Set();
    forceMembers.forEach(m => {
      if (m.department) set.add(m.department);
    });
    return Array.from(set);
  }, [forceMembers]);

  // Daily roster based on forceMembers
  const dailyRoster = useMemo(() => {
    const dateRecords = attendanceMap[selectedDate] || {};
    return forceMembers.map((m, idx) => {
      const status = dateRecords[m.id || m.national_id] || (m.job_status === 'على رأس العمل' ? 'حاضر' : 'مجاز');
      return {
        id: m.id || idx + 1,
        key: m.id || m.national_id,
        name: m.name,
        job_number: m.job_number || m.financial_number,
        rank: m.job_title || 'شرطي',
        department: m.department || 'مديرية أمن أوباري',
        status: status,
        time_in: status === 'حاضر' ? '07:55 ص' : '---'
      };
    });
  }, [forceMembers, attendanceMap, selectedDate]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return dailyRoster.filter(r => {
      const matchDept = selectedDept === 'all' || r.department === selectedDept;
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      const matchSearch = !searchTerm ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.job_number).includes(searchTerm);
      return matchDept && matchStatus && matchSearch;
    });
  }, [dailyRoster, selectedDept, selectedStatus, searchTerm]);

  // Metrics
  const metrics = useMemo(() => {
    const total = dailyRoster.length;
    const present = dailyRoster.filter(r => r.status === 'حاضر').length;
    const absent = dailyRoster.filter(r => r.status === 'غائب').length;
    const leave = dailyRoster.filter(r => r.status === 'مجاز').length;
    const mission = dailyRoster.filter(r => r.status === 'مهمة').length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '100';
    return { total, present, absent, leave, mission, rate };
  }, [dailyRoster]);

  // Change individual status
  const handleStatusChange = (memberKey, newStatus) => {
    const updated = {
      ...attendanceMap,
      [selectedDate]: {
        ...(attendanceMap[selectedDate] || {}),
        [memberKey]: newStatus
      }
    };
    setAttendanceMap(updated);
    localStorage.setItem('ubari_attendance_map', JSON.stringify(updated));
  };

  // Mark all filtered as present
  const handleMarkAllPresent = () => {
    const currentDayRecords = { ...(attendanceMap[selectedDate] || {}) };
    filteredRoster.forEach(r => {
      currentDayRecords[r.key] = 'حاضر';
    });
    const updated = {
      ...attendanceMap,
      [selectedDate]: currentDayRecords
    };
    setAttendanceMap(updated);
    localStorage.setItem('ubari_attendance_map', JSON.stringify(updated));
  };

  // Print Daily Attendance Roster A4
  const handlePrintAttendanceSheet = () => {
    const printRows = filteredRoster.slice(0, 30);
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #0a192f;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px;">
          <div style="text-align: right;">
            <h3 style="margin: 0; font-size: 14px; font-weight: 800;">دولة ليبيا - وزارة الداخلية</h3>
            <h2 style="margin: 2px 0; font-size: 17px; font-weight: 900; color: #1e3a8a;">مديرية أمن أوباري</h2>
            <h4 style="margin: 0; font-size: 12px; color: #475569;">قسم الشؤون الإدارية | وحدة الانضباط والتمام اليومي</h4>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 20px; font-weight: 900; color: #1e3a8a;">كشف التمام والحضور اليومي الرسمي</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">تاريخ الكشف: ${selectedDate}</div>
          </div>
          <div style="text-align: left; font-size: 12px;">
            <div><strong>نسبة الحضور:</strong> ${metrics.rate}%</div>
            <div><strong>القسم:</strong> ${selectedDept === 'all' ? 'كافة الأقسام' : selectedDept}</div>
          </div>
        </div>

        <!-- Summary -->
        <div style="display: flex; justify-content: space-around; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 18px; font-size: 12px;">
          <div><strong>إجمالي القوة:</strong> ${metrics.total}</div>
          <div><strong>الحاضرون:</strong> <span style="color: #15803d; font-weight: bold;">${metrics.present}</span></div>
          <div><strong>الغياب بدون إذن:</strong> <span style="color: #dc2626; font-weight: bold;">${metrics.absent}</span></div>
          <div><strong>إجازات ومأذونين:</strong> ${metrics.leave}</div>
          <div><strong>مهمات رسمية:</strong> ${metrics.mission}</div>
        </div>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 35px; text-align: center;">ت</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الاسم الرباعي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 85px;">الرقم المالي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 80px;">الرتبة</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 150px;">جهة العمل</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 90px; text-align: center;">التمام اليومي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 80px; text-align: center;">وقت التواجد</th>
            </tr>
          </thead>
          <tbody>
            ${printRows.map((r, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${r.name}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.job_number}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.rank}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.department}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${r.status === 'حاضر' ? '#15803d' : r.status === 'غائب' ? '#dc2626' : '#2563eb'};">
                  ${r.status}
                </td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${r.time_in}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 35px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 13px;">ضابط تمام القوة اليومية</div>
            <div style="margin-top: 35px; font-size: 12px;">نقيب / علي محمد البشير</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">رئيس قسم الشؤون الإدارية</div>
            <div style="margin-top: 35px; font-size: 12px;">مقدم / سالم عبدالكريم</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 35px; font-size: 12px; font-weight: bold; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `كشف_التمام_اليومي_${selectedDate}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={28} color="#1e3a8a" />
            الحضور والانصراف والتمام اليومي للقوة
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | التمام الصباحي، رصد الحضور والغياب، التكليف بالمهام ومتابعة الانضباط العسكري
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontWeight: 800,
              fontSize: '13px',
              color: '#0a192f'
            }}
          />

          <button
            onClick={handleMarkAllPresent}
            style={{
              padding: '10px 16px',
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ✓ تثبيت حضور الجميع
          </button>

          <button
            onClick={handlePrintAttendanceSheet}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30,58,138,0.2)'
            }}
          >
            <Printer size={16} />
            طباعة كشف التمام اليومي A4
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>إجمالي القوة العمومية</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f' }}>{metrics.total.toLocaleString('ar-LY')}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>الحاضرون اليوم</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#15803d' }}>{metrics.present.toLocaleString('ar-LY')}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>الغياب غير المبرر</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626' }}>{metrics.absent}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>إجازات رسمية</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563eb' }}>{metrics.leave}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>نسبة الانضباط والتمام</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a' }}>{metrics.rate}%</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none',
              maxWidth: '220px'
            }}
          >
            <option value="all">كافة الأقسام والمراكز</option>
            {departmentsList.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none'
            }}
          >
            <option value="all">كافة الحالات</option>
            <option value="حاضر">حاضر</option>
            <option value="غائب">غائب</option>
            <option value="مجاز">مجاز</option>
            <option value="مهمة">مهمة رسمية</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم المالي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 36px 8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
              <th style={{ padding: '14px 16px', width: '50px' }}>ر.م</th>
              <th style={{ padding: '14px 16px' }}>الاسم الرباعي</th>
              <th style={{ padding: '14px 16px' }}>الرقم المالي</th>
              <th style={{ padding: '14px 16px' }}>الرتبة</th>
              <th style={{ padding: '14px 16px' }}>القسم / التبعية</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>التمام اليومي</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>إجراءات التحضير السريع</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoster.slice(0, 50).map((r, idx) => (
              <tr key={r.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>{r.name}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{r.job_number}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#eff6ff', color: '#1e3a8a', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                    {r.rank}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{r.department}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 900,
                    background: r.status === 'حاضر' ? '#dcfce7' : r.status === 'غائب' ? '#fee2e2' : '#eff6ff',
                    color: r.status === 'حاضر' ? '#15803d' : r.status === 'غائب' ? '#dc2626' : '#1d4ed8'
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleStatusChange(r.key, 'حاضر')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: r.status === 'حاضر' ? '#15803d' : '#f1f5f9',
                        color: r.status === 'حاضر' ? '#ffffff' : '#334155',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      حاضر
                    </button>
                    <button
                      onClick={() => handleStatusChange(r.key, 'غائب')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: r.status === 'غائب' ? '#dc2626' : '#f1f5f9',
                        color: r.status === 'غائب' ? '#ffffff' : '#334155',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      غائب
                    </button>
                    <button
                      onClick={() => handleStatusChange(r.key, 'مهمة')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: r.status === 'مهمة' ? '#2563eb' : '#f1f5f9',
                        color: r.status === 'مهمة' ? '#ffffff' : '#334155',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      مهمة
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

