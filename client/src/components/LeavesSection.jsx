import React, { useState, useEffect, useMemo } from 'react';
import {
  Plane, Search, Plus, Calendar, User, Printer, Trash2, CheckCircle2,
  AlertTriangle, Clock, AlertOctagon, Download, RefreshCw, UserCheck,
  Bell, FileText, CheckCheck, Filter, ChevronRight, ChevronLeft, X, ShieldAlert
} from 'lucide-react';
import initialLeaves from '../data/leaves_data.json';
import { normalizeArabicText } from '../utils/arabicUtils';
import { printDocumentInIframe } from '../utils/printHelper';

// دالة احتساب الحالات الزمنية والتنبيهات بدقة عالية
function calculateLeaveStatus(leave, baseDate = new Date()) {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  const start = new Date(leave.StartDate || leave.start_date || new Date());
  start.setHours(0, 0, 0, 0);

  const end = new Date(leave.EndDate || leave.end_date || new Date());
  end.setHours(0, 0, 0, 0);

  const totalDays = Number(leave.TotalDays || leave.total_days) ||
    Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / 86400000);

  const isResumed = leave.Status === 'باشر العمل' || Boolean(leave.ActualResumptionDate);
  const isOverdue = !isResumed && diffDays < 0;
  const isEndsToday = !isResumed && diffDays === 0;
  const isEndingIn2Days = !isResumed && diffDays === 2;
  const isEndingIn1Day = !isResumed && diffDays === 1;
  const isEndingSoon = !isResumed && diffDays > 0 && diffDays <= 3;

  let alertType = 'active';
  let alertText = '';
  let badgeColor = '#10b981';
  let badgeBg = '#f0fdf4';

  if (isResumed) {
    alertType = 'resumed';
    alertText = 'تمت مباشرة العمل رسمياً';
    badgeColor = '#059669';
    badgeBg = '#ecfdf5';
  } else if (isOverdue) {
    alertType = 'overdue';
    alertText = `⛔ متأخر عن المباشرة: انتهت إجازته منذ ${Math.abs(diffDays)} أيام ولم يباشر بعد!`;
    badgeColor = '#dc2626';
    badgeBg = '#fef2f2';
  } else if (isEndsToday) {
    alertType = 'today';
    alertText = '🚨 تنبيه: إجازة المنتسب تنتهي اليوم! يتوجب مباشرة العمل غداً';
    badgeColor = '#ea580c';
    badgeBg = '#fff7ed';
  } else if (isEndingIn2Days) {
    alertType = 'two_days';
    alertText = `⚠️ تنبيه: تبقى يومين على انتهاء إجازة ${leave.FullName || leave.name}`;
    badgeColor = '#d97706';
    badgeBg = '#fffbeb';
  } else if (isEndingIn1Day) {
    alertType = 'one_day';
    alertText = `⚠️ تنبيه عاجل: تبقى يوم واحد على انتهاء إجازة ${leave.FullName || leave.name}`;
    badgeColor = '#b45309';
    badgeBg = '#fffbeb';
  } else if (isEndingSoon) {
    alertType = 'soon';
    alertText = `⏳ تبقى ${diffDays} أيام على انتهاء الإجازة`;
    badgeColor = '#eab308';
    badgeBg = '#fefce8';
  } else {
    alertType = 'active';
    alertText = `🟢 إجازة سارية (متبقي ${diffDays} يوماً)`;
    badgeColor = '#16a34a';
    badgeBg = '#f0fdf4';
  }

  return {
    diffDays,
    totalDays,
    isResumed,
    isOverdue,
    isEndsToday,
    isEndingIn2Days,
    isEndingIn1Day,
    isEndingSoon,
    alertType,
    alertText,
    badgeColor,
    badgeBg
  };
}

export default function LeavesSection({ forceMembers = [], setForceMembers, user }) {
  const [leaves, setLeaves] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_leaves');
      return saved ? JSON.parse(saved) : initialLeaves;
    } catch {
      return initialLeaves;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'alerts_soon', 'overdue', 'active', 'resumed'
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);

  // Modals state
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [activeLeaveForResumption, setActiveLeaveForResumption] = useState(null);
  const [resumptionNotes, setResumptionNotes] = useState('باشر مهامه الرسمية بالقسم دون تأخير');
  const [resumptionDate, setResumptionDate] = useState(new Date().toISOString().slice(0, 10));

  // Autocomplete search state inside New Leave Modal
  const [modalMemberSearch, setModalMemberSearch] = useState('');
  const [modalSelectedMember, setModalSelectedMember] = useState(null);

  // New Leave Form state with Bidirectional Automatic Calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultEndStr = new Date(Date.now() + 29 * 86400000).toISOString().slice(0, 10);

  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'اجازة سنوية',
    destination: 'داخل ليبيا',
    start_date: todayStr,
    end_date: defaultEndStr,
    total_days: 30,
    notes: 'إجازة اعتيادية معتمدة بقرار إداري'
  });

  // مزامنة البيانات مع الخادم المركزي
  const fetchLeavesFromApi = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5050/api/leaves');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leaves)) {
          setLeaves(data.leaves);
          localStorage.setItem('ubari_leaves', JSON.stringify(data.leaves));
        }
      }
    } catch (err) {
      console.warn('خادم الإجازات غير متصل، تم الاعتماد على التخزين المحلي:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesFromApi();
  }, []);

  // حفظ في localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ubari_leaves', JSON.stringify(leaves));
    } catch (e) {
      console.error('فشل حفظ الإجازات في التخزين المحلي', e);
    }
  }, [leaves]);

  // تعيين العضو المختار الافتراضي
  useEffect(() => {
    if (!selectedMember && forceMembers.length > 0) {
      setSelectedMember(forceMembers[0]);
    }
  }, [forceMembers, selectedMember]);

  // الحساب التلقائي ثنائي الاتجاه للمدد وتواريخ الانتهاء
  const handleStartDateChange = (newStart) => {
    const days = Number(leaveForm.total_days) || 1;
    const s = new Date(newStart);
    if (!isNaN(s.getTime())) {
      const e = new Date(s.getTime() + (days - 1) * 86400000);
      setLeaveForm(prev => ({
        ...prev,
        start_date: newStart,
        end_date: e.toISOString().slice(0, 10)
      }));
    } else {
      setLeaveForm(prev => ({ ...prev, start_date: newStart }));
    }
  };

  const handleTotalDaysChange = (newDays) => {
    const days = Math.max(1, parseInt(newDays, 10) || 1);
    const s = new Date(leaveForm.start_date);
    if (!isNaN(s.getTime())) {
      const e = new Date(s.getTime() + (days - 1) * 86400000);
      setLeaveForm(prev => ({
        ...prev,
        total_days: days,
        end_date: e.toISOString().slice(0, 10)
      }));
    } else {
      setLeaveForm(prev => ({ ...prev, total_days: days }));
    }
  };

  const handleEndDateChange = (newEnd) => {
    const s = new Date(leaveForm.start_date);
    const e = new Date(newEnd);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const diffTime = e.getTime() - s.getTime();
      const calcDays = Math.max(1, Math.round(diffTime / 86400000) + 1);
      setLeaveForm(prev => ({
        ...prev,
        end_date: newEnd,
        total_days: calcDays
      }));
    } else {
      setLeaveForm(prev => ({ ...prev, end_date: newEnd }));
    }
  };

  // البحث في المنتسبين داخل نافذة إضافة إجازة جديدة
  const modalSearchedMembers = useMemo(() => {
    if (!modalMemberSearch.trim()) return [];
    const query = normalizeArabicText(modalMemberSearch);
    return forceMembers.filter(m => {
      const name = normalizeArabicText(m.name || '');
      const nat = normalizeArabicText(m.national_id || '');
      const job = normalizeArabicText(m.job_number || m.financial_number || '');
      const dept = normalizeArabicText(m.department || '');
      return name.includes(query) || nat.includes(query) || job.includes(query) || dept.includes(query);
    }).slice(0, 6);
  }, [forceMembers, modalMemberSearch]);

  // البحث العام في شريط التنقل
  const navigatorSearchedMembers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = normalizeArabicText(searchTerm);
    return forceMembers.filter(m => {
      const name = normalizeArabicText(m.name || '');
      const nat = normalizeArabicText(m.national_id || '');
      const job = normalizeArabicText(m.job_number || m.financial_number || '');
      return name.includes(query) || nat.includes(query) || job.includes(query);
    }).slice(0, 8);
  }, [forceMembers, searchTerm]);

  // إحصائيات وتنبيهات الإجازات اللحظية
  const enrichedLeaves = useMemo(() => {
    return leaves.map(leave => {
      const calc = calculateLeaveStatus(leave);
      return { ...leave, ...calc };
    });
  }, [leaves]);

  const stats = useMemo(() => {
    let overdueCount = 0;
    let twoDaysCount = 0;
    let endsSoonCount = 0;
    let activeCount = 0;
    let resumedCount = 0;

    enrichedLeaves.forEach(l => {
      if (l.isResumed) resumedCount++;
      else if (l.isOverdue) overdueCount++;
      else if (l.isEndingIn2Days || l.isEndingIn1Day || l.isEndsToday) twoDaysCount++;
      else if (l.isEndingSoon) endsSoonCount++;
      else activeCount++;
    });

    return {
      total: enrichedLeaves.length,
      overdueCount,
      twoDaysCount,
      endsSoonCount,
      activeCount,
      resumedCount,
      urgentAlerts: enrichedLeaves.filter(l => !l.isResumed && (l.isOverdue || l.diffDays <= 2))
    };
  }, [enrichedLeaves]);

  // التصفية بحسب التبويب ونوع الإجازة والبحث
  const filteredLeaves = useMemo(() => {
    return enrichedLeaves.filter(leave => {
      // تصفية التبويب
      if (filterTab === 'alerts_soon' && (leave.isResumed || leave.diffDays > 3 || leave.diffDays < 0)) return false;
      if (filterTab === 'overdue' && (leave.isResumed || !leave.isOverdue)) return false;
      if (filterTab === 'active' && (leave.isResumed || leave.isOverdue)) return false;
      if (filterTab === 'resumed' && !leave.isResumed) return false;

      // تصفية نوع الإجازة
      if (typeFilter !== 'all' && leave.LeaveType !== typeFilter) return false;

      // تصفية البحث
      if (searchTerm.trim()) {
        const query = normalizeArabicText(searchTerm);
        const name = normalizeArabicText(leave.FullName || '');
        const nat = normalizeArabicText(leave.NationalNumber || '');
        const dept = normalizeArabicText(leave.DepartmentName || '');
        const notes = normalizeArabicText(leave.Notes || '');
        return name.includes(query) || nat.includes(query) || dept.includes(query) || notes.includes(query);
      }

      return true;
    });
  }, [enrichedLeaves, filterTab, typeFilter, searchTerm]);

  // حفظ إجازة جديدة
  const handleSaveLeave = async (e) => {
    e.preventDefault();
    const targetMember = modalSelectedMember || selectedMember;
    if (!targetMember) {
      alert('⚠️ يرجى تحديد المنتسب أولاً لمنحه الإجازة');
      return;
    }

    const newLeave = {
      LeaveID: Date.now(),
      NationalNumber: targetMember.national_id || targetMember.financial_number || targetMember.job_number || '---',
      FullName: targetMember.name,
      Rank: targetMember.rank || targetMember.job_title || 'شرطي',
      DepartmentName: targetMember.department || 'مديرية أمن أوباري',
      LeaveType: leaveForm.leave_type,
      StartDate: new Date(leaveForm.start_date).toISOString(),
      EndDate: new Date(leaveForm.end_date).toISOString(),
      TotalDays: leaveForm.total_days,
      Notes: leaveForm.destination ? `${leaveForm.destination} - ${leaveForm.notes}` : leaveForm.notes,
      Status: 'سارية'
    };

    // تحديث الحالة محلياً
    setLeaves(prev => [newLeave, ...prev]);

    // تحديث حالة المنتسب في القوة المركزية إلى إجازة رسمية
    if (setForceMembers) {
      setForceMembers(prev => prev.map(m => {
        if (m.id === targetMember.id || m.national_id === targetMember.national_id) {
          return { ...m, job_status: 'إجازة رسمية' };
        }
        return m;
      }));
    }

    // إرسال للخادم
    try {
      await fetch('http://localhost:5050/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave)
      });
    } catch (err) {
      console.warn('تم الحفظ محلياً فقط:', err.message);
    }

    setIsNewLeaveModalOpen(false);
    setModalSelectedMember(null);
    setModalMemberSearch('');
  };

  // تأكيد مباشرة العمل وإعادة المنتسب على رأس العمل
  const handleConfirmResumption = async () => {
    if (!activeLeaveForResumption) return;

    const leaveId = activeLeaveForResumption.LeaveID;

    // تحديث سجل الإجازات محلياً
    setLeaves(prev => prev.map(l => {
      if (l.LeaveID === leaveId) {
        return {
          ...l,
          Status: 'باشر العمل',
          ActualResumptionDate: resumptionDate,
          ResumptionNotes: resumptionNotes
        };
      }
      return l;
    }));

    // إعادة حالة المنتسب في القوة العمومية إلى (على رأس العمل)
    if (setForceMembers && activeLeaveForResumption.NationalNumber) {
      setForceMembers(prev => prev.map(m => {
        if (
          m.national_id === activeLeaveForResumption.NationalNumber ||
          m.job_number === activeLeaveForResumption.NationalNumber ||
          m.financial_number === activeLeaveForResumption.NationalNumber ||
          m.name === activeLeaveForResumption.FullName
        ) {
          return { ...m, job_status: 'على رأس العمل' };
        }
        return m;
      }));
    }

    // إرسال للخادم
    try {
      await fetch(`http://localhost:5050/api/leaves/${leaveId}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumptionDate,
          resumptionNotes
        })
      });
    } catch (err) {
      console.warn('تم حفظ المباشرة محلياً:', err.message);
    }

    setIsResumeModalOpen(false);
    setActiveLeaveForResumption(null);
  };

  // حذف إجازة
  const handleDeleteLeave = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القيد من سجل الإجازات المركزي؟')) {
      setLeaves(prev => prev.filter(l => l.LeaveID !== id));
      try {
        await fetch(`http://localhost:5050/api/leaves/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('تم الحذف محلياً:', err.message);
      }
    }
  };

  // تصدير إكسل CSV بمحاذاة عربية UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'رقم القيد',
      'اسم المنتسب',
      'الرقم الوطني / المالي',
      'جهة العمل',
      'نوع الإجازة',
      'تاريخ البدء',
      'تاريخ الانتهاء',
      'المدة بالأيام',
      'المتبقي / التأخير',
      'حالة الإجازة',
      'تاريخ مباشرة العمل',
      'ملاحظات ومقر الإقامة'
    ];

    const rows = enrichedLeaves.map(l => [
      l.LeaveID,
      `"${l.FullName || ''}"`,
      `"${l.NationalNumber || ''}"`,
      `"${l.DepartmentName || ''}"`,
      `"${l.LeaveType || ''}"`,
      l.StartDate ? l.StartDate.slice(0, 10) : '',
      l.EndDate ? l.EndDate.slice(0, 10) : '',
      l.TotalDays || '',
      l.isResumed ? 'باشر العمل' : (l.diffDays < 0 ? `متأخر ${Math.abs(l.diffDays)} يوم` : `${l.diffDays} يوم متبقي`),
      l.isResumed ? 'باشر العمل' : (l.diffDays < 0 ? 'متأخر عن المباشرة' : 'سارية'),
      l.ActualResumptionDate || '---',
      `"${l.Notes || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `سجل_اجازات_مديرية_امن_اوباري_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // طباعة إذن إجازة رسمي معتمد A4
  const handlePrintLeaveVoucher = (leave) => {
    const calc = calculateLeaveStatus(leave);
    const printHtml = `
      <div style="width: 100%; max-width: 680px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a; position: relative;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 6px; width: 100%; display: flex; border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <!-- الترويسة الرسمية لوزارة الداخلية -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 14px;">
          <tr>
            <td style="text-align: right; vertical-align: middle; width: 40%;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">قسم الشؤون الإدارية والمالية • وحدة الإجازات</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 20%;">
              <img src="${window.location.origin}/moi-logo.png" alt="شعار الوزارة" style="width: 65px; height: 65px; object-fit: contain;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle; width: 40%;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">State of Libya • Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Official Leave Authorization Voucher</div>
            </td>
          </tr>
        </table>

        <!-- عنوان الوثيقة والرقم الإشاري -->
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="display: inline-block; background: #1e3a8a; color: #ffffff; padding: 6px 24px; border-radius: 6px; font-size: 16px; font-weight: 900; letter-spacing: 0.5px;">
            إذن إجازة رسمية معتمدة
          </div>
          <div style="font-size: 11px; color: #64748b; font-weight: 800; margin-top: 6px;">
            الرقم الإشاري الموحد: <span style="color: #1e3a8a; font-family: monospace; font-size: 12px;">MOI-UBR-LV-${leave.LeaveID}</span>
            &nbsp;|&nbsp; التاريخ: ${new Date().toLocaleDateString('ar-LY')}
          </div>
        </div>

        <!-- جدول بيانات المنتسب والإجازة -->
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; font-size: 12px; margin-bottom: 16px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; width: 24%; font-weight: 800;">اسم المنتسب الرباعي:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #0f172a; font-size: 13.5px;" colspan="3">
              ${leave.FullName}
            </td>
          </tr>
          <tr>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">الرقم الوطني / المالي:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace; color: #0284c7;">
              ${leave.NationalNumber}
            </td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800; width: 22%;">الرتبة والوظيفة:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #1e3a8a;">
              ${leave.Rank || 'عضو هيئة شرطة'}
            </td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">جهة العمل والتبعية:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">
              ${leave.DepartmentName}
            </td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">نوع الإجازة الممنوحة:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #16a34a;">
              ${leave.LeaveType}
            </td>
          </tr>
          <tr>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">تاريخ بداية الإجازة:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800;">
              ${new Date(leave.StartDate).toLocaleDateString('ar-LY')}
            </td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">تاريخ انتهاء الإجازة:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #dc2626;">
              ${new Date(leave.EndDate).toLocaleDateString('ar-LY')}
            </td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">المدة الإجمالية المعتمدة:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #dc2626; font-size: 13px;">
              ${calc.totalDays} يوماً (محسوبة نظامياً)
            </td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">جهة الإقامة / السفر:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800;">
              ${leave.Notes || 'داخل ليبيا'}
            </td>
          </tr>
        </table>

        <!-- ضوابط وتعليمات العودة ومباشرة العمل -->
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-right: 5px solid #1e3a8a; padding: 12px 16px; border-radius: 8px; font-size: 11.5px; margin-bottom: 22px; color: #1e293b; line-height: 1.7;">
          <strong style="color: #1e3a8a; font-size: 12px; display: block; margin-bottom: 4px;">⚠️ ضوابط استئناف ومباشرة العمل:</strong>
          يلتزم المنتسب المأذون له بالإجازة بالحضور ومباشرة مهامه الرسمية فور انتهاء المدة المحددة أعلاه، ويعد اليوم التالي لانتهاء الإجازة موعداً إلزامياً لمباشرة العمل. وفي حال التأخر دون عذر قاهر ومسند رسمياً تطبق أحكام قانون هيئة الشرطة بشأن الغياب والانقطاع عن العمل.
        </div>

        <!-- مربعات التوقيعات والاعتماد الرسمي -->
        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 30px; font-size: 11.5px;">
          <tr>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 35px;">رئيس وحدة الإجازات والغياب</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 6px;">نقيب / علي سالم محمد</div>
            </td>
            <td style="width: 33%; vertical-align: middle;">
              <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: #1e3a8a; margin: 0 auto; line-height: 1.2;">
                <span>وزارة الداخلية</span>
                <span>مديرية أمن أوباري</span>
                <span style="color: #dc2626; font-size: 7px; margin-top: 2px;">الختم الرسمي المعتمد</span>
              </div>
            </td>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 35px;">يعتمد مدير مديرية أمن أوباري</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 6px;">لواء / موسى سعد محمد</div>
            </td>
          </tr>
        </table>
      </div>
    `;

    printDocumentInIframe(printHtml, `إذن إجازة رسمي - ${leave.FullName}`);
  };

  return (
    <div className="leaves-section-container" style={{ padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* 4-Color Libyan Flag Ribbon Banner */}
      <div style={{ height: '4px', width: '100%', display: 'flex', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ flex: 1, background: '#e11d48' }}></div>
        <div style={{ flex: 2, background: '#000000' }}></div>
        <div style={{ flex: 1, background: '#16a34a' }}></div>
      </div>

      {/* Main Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 22px', borderRadius: '14px', border: '1.5px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)' }}>
            <Plane size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>سجل إجازات القوة العمومية</h1>
              <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e3a8a', padding: '3px 10px', borderRadius: '20px', fontWeight: 800 }}>
                {stats.total} إجازة مسجلة
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
              الرصد الآلي لمدد الإجازات، احتساب تاريخ الانتهاء تلقائياً، والتنبيه الاستباقي ومباشرة العمل
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchLeavesFromApi}
            disabled={isLoading}
            title="تحديث البيانات"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 800, cursor: 'pointer' }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>

          <button
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#1e3a8a', fontWeight: 800, cursor: 'pointer' }}
          >
            <Download size={15} />
            <span>تصدير إكسل</span>
          </button>

          <button
            onClick={() => {
              setModalSelectedMember(selectedMember || (forceMembers.length > 0 ? forceMembers[0] : null));
              setIsNewLeaveModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#ffffff', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
          >
            <Plus size={17} />
            <span>منح إجازة جديدة</span>
          </button>
        </div>
      </div>

      {/* Proactive Urgent Alert Banner (لوحة التنبيهات الذكية الاستباقية) */}
      {stats.urgentAlerts.length > 0 && (
        <div style={{ background: '#ffffff', border: '2px solid #f59e0b', borderRadius: '14px', marginBottom: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.12)' }}>
          <div style={{ background: 'linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #fcd34d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#d97706', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#92400e' }}>
                  مركز التنبيهات الذكي للإجازات: يتطلب اتخاذ إجراء فوري
                </strong>
                <div style={{ fontSize: '11px', color: '#b45309' }}>
                  تنبيهات استباقية للمنتسبين الذين أوشكت إجازاتهم على الانتهاء أو تجاوزوا المدة القانونية
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '11px', background: '#b45309', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontWeight: 800 }}>
                {stats.urgentAlerts.length} تنبيه نشط
              </span>
            </div>
          </div>

          <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
            {stats.urgentAlerts.map(alertLeave => {
              const is2Days = alertLeave.diffDays === 2;
              const is1Day = alertLeave.diffDays === 1;
              const isToday = alertLeave.diffDays === 0;
              const isOverdue = alertLeave.diffDays < 0;

              let icon = <AlertTriangle size={18} color="#d97706" />;
              let title = alertLeave.alertText;
              let itemBg = '#fffbeb';
              let borderColor = '#fef08a';

              if (isOverdue) {
                icon = <AlertOctagon size={18} color="#dc2626" />;
                itemBg = '#fef2f2';
                borderColor = '#fecaca';
              } else if (isToday) {
                icon = <AlertTriangle size={18} color="#ea580c" />;
                itemBg = '#fff7ed';
                borderColor = '#ffedd5';
              }

              return (
                <div
                  key={alertLeave.LeaveID}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: itemBg, border: `1px solid ${borderColor}`, borderRadius: '10px', gap: '12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {icon}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>
                        {title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {alertLeave.DepartmentName} • تاريخ الانتهاء: <strong style={{ color: '#0f172a' }}>{alertLeave.EndDate ? alertLeave.EndDate.slice(0, 10) : ''}</strong>
                        {isOverdue && <span style={{ color: '#dc2626', marginRight: '6px', fontWeight: 800 }}>• متأخر {Math.abs(alertLeave.diffDays)} يوم عن المباشرة</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setActiveLeaveForResumption(alertLeave);
                        setIsResumeModalOpen(true);
                      }}
                      style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: '#16a34a', color: '#ffffff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)' }}
                    >
                      <UserCheck size={14} />
                      <span>تسجيل مباشرة العمل</span>
                    </button>
                    <button
                      onClick={() => handlePrintLeaveVoucher(alertLeave)}
                      style={{ padding: '6px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                      title="طباعة إذن الإجازة"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Counters Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div
          onClick={() => setFilterTab('all')}
          style={{ background: filterTab === 'all' ? '#eff6ff' : '#ffffff', border: filterTab === 'all' ? '2px solid #1e3a8a' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
        >
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>📋 إجمالي الإجازات المسجلة</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>{stats.total}</div>
        </div>

        <div
          onClick={() => setFilterTab('alerts_soon')}
          style={{ background: filterTab === 'alerts_soon' ? '#fef3c7' : '#ffffff', border: filterTab === 'alerts_soon' ? '2px solid #d97706' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
        >
          <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800 }}>⚠️ أوشكت على الانتهاء (≤ 3 أيام)</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>{stats.twoDaysCount + stats.endsSoonCount}</div>
        </div>

        <div
          onClick={() => setFilterTab('overdue')}
          style={{ background: filterTab === 'overdue' ? '#fee2e2' : '#ffffff', border: filterTab === 'overdue' ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
        >
          <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 800 }}>⛔ متأخرون عن المباشرة</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>{stats.overdueCount}</div>
        </div>

        <div
          onClick={() => setFilterTab('active')}
          style={{ background: filterTab === 'active' ? '#ecfdf5' : '#ffffff', border: filterTab === 'active' ? '2px solid #16a34a' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
        >
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: 800 }}>🟢 إجازات سارية ومعتمدة</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>{stats.activeCount}</div>
        </div>

        <div
          onClick={() => setFilterTab('resumed')}
          style={{ background: filterTab === 'resumed' ? '#f1f5f9' : '#ffffff', border: filterTab === 'resumed' ? '2px solid #475569' : '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
        >
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 800 }}>🏁 باشروا العمل رسمياً</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#475569', marginTop: '4px' }}>{stats.resumedCount}</div>
        </div>
      </div>

      {/* Search and Filter Tools Bar */}
      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1.5px solid #cbd5e1', marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 ابحث بالاسم، الرقم الوطني، الرقم المالي، أو الإدارة..."
            style={{ width: '100%', padding: '10px 42px 10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>نوع الإجازة:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12.5px', fontWeight: 800, background: '#ffffff', color: '#0f172a' }}
          >
            <option value="all">كافة الأنواع</option>
            <option value="اجازة سنوية">إجازة سنوية</option>
            <option value="اجازة طارئة">إجازة طارئة</option>
            <option value="اجازة مرضية">إجازة مرضية</option>
            <option value="اجازة حج / عمرة">إجازة حج / عمرة</option>
            <option value="اجازة دراسية">إجازة دراسية</option>
            <option value="اجازة وضع وأمومة">إجازة وضع وأمومة</option>
          </select>
        </div>
      </div>

      {/* Main Leaves Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
              <th style={{ padding: '12px 14px' }}>اسم المنتسب والرتبة</th>
              <th style={{ padding: '12px 14px' }}>الرقم الوطني / المالي</th>
              <th style={{ padding: '12px 14px' }}>الإدارة / جهة العمل</th>
              <th style={{ padding: '12px 14px' }}>نوع الإجازة</th>
              <th style={{ padding: '12px 14px' }}>تاريخ البدء</th>
              <th style={{ padding: '12px 14px' }}>تاريخ الانتهاء</th>
              <th style={{ padding: '12px 14px' }}>المدة</th>
              <th style={{ padding: '12px 14px' }}>الحالة والتنبيه الآلي</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <Plane size={36} style={{ color: '#cbd5e1', margin: '0 auto 8px', display: 'block' }} />
                  <div>لا توجد إجازات مطابقة لمعايير البحث والتصفية المحددة</div>
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => {
                const is2Days = leave.diffDays === 2;
                const is1Day = leave.diffDays === 1;
                const isToday = leave.diffDays === 0;
                const isOverdue = leave.diffDays < 0 && !leave.isResumed;

                return (
                  <tr
                    key={leave.LeaveID}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: isOverdue ? '#fff5f5' : (is2Days || is1Day || isToday ? '#fffbeb' : '#ffffff'),
                      transition: 'background 0.15s'
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 900, color: '#0f172a' }}>{leave.FullName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{leave.Rank || 'عضو هيئة شرطة'}</div>
                    </td>

                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#0284c7', fontWeight: 800 }}>
                      {leave.NationalNumber}
                    </td>

                    <td style={{ padding: '12px 14px', color: '#334155' }}>
                      {leave.DepartmentName}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: '#f1f5f9', color: '#1e3a8a', border: '1px solid #cbd5e1' }}>
                        {leave.LeaveType}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', fontSize: '11.5px', color: '#475569' }}>
                      {leave.StartDate ? leave.StartDate.slice(0, 10) : ''}
                    </td>

                    <td style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 800, color: isOverdue ? '#dc2626' : '#0f172a' }}>
                      {leave.EndDate ? leave.EndDate.slice(0, 10) : ''}
                    </td>

                    <td style={{ padding: '12px 14px', fontWeight: 900, color: '#dc2626' }}>
                      {leave.totalDays} يوماً
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      {leave.isResumed ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '11px', fontWeight: 800 }}>
                          <CheckCheck size={13} />
                          <span>باشر في {leave.ActualResumptionDate || '---'}</span>
                        </div>
                      ) : isOverdue ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '11px', fontWeight: 900 }}>
                          <AlertOctagon size={13} />
                          <span>متأخر {Math.abs(leave.diffDays)} يوم عن المباشرة!</span>
                        </div>
                      ) : is2Days ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '11px', fontWeight: 900 }}>
                          <AlertTriangle size={13} />
                          <span>⚠️ متبقي يومين فقط!</span>
                        </div>
                      ) : is1Day ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '11px', fontWeight: 900 }}>
                          <AlertTriangle size={13} />
                          <span>⚠️ متبقي يوم واحد!</span>
                        </div>
                      ) : isToday ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', fontSize: '11px', fontWeight: 900 }}>
                          <Clock size={13} />
                          <span>🚨 تنتهي اليوم!</span>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '11px', fontWeight: 800 }}>
                          <Clock size={13} />
                          <span>سارية (متبقي {leave.diffDays} يوم)</span>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {!leave.isResumed && (
                          <button
                            onClick={() => {
                              setActiveLeaveForResumption(leave);
                              setIsResumeModalOpen(true);
                            }}
                            title="تسجيل مباشرة العمل"
                            style={{ padding: '5px 9px', borderRadius: '6px', border: '1px solid #16a34a', background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <UserCheck size={13} />
                            <span>مباشرة</span>
                          </button>
                        )}

                        <button
                          onClick={() => handlePrintLeaveVoucher(leave)}
                          title="طباعة إذن إجازة رسمي"
                          style={{ padding: '5px 9px', borderRadius: '6px', border: '1px solid #1e3a8a', background: '#eff6ff', color: '#1e3a8a', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Printer size={13} />
                          <span>إذن</span>
                        </button>

                        <button
                          onClick={() => handleDeleteLeave(leave.LeaveID)}
                          title="حذف القيد"
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: New Leave Modal with Real Autocomplete & Bidirectional Date Calculation */}
      {isNewLeaveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10500, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', borderTop: '5px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plane size={20} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#0f172a' }}>
                  منح إجازة رسمية جديدة لمنتسب
                </h3>
              </div>
              <button
                onClick={() => setIsNewLeaveModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Member Autocomplete Picker */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px', fontSize: '12px' }}>
                تحديد المنتسب من القوة العمومية (2,211 منتسب):
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={modalMemberSearch}
                  onChange={(e) => setModalMemberSearch(e.target.value)}
                  placeholder="🔍 اكتب اسم المنتسب، الرقم الوطني، أو الرقم المالي..."
                  style={{ width: '100%', padding: '9px 36px 9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Autocomplete Results Dropdown */}
              {modalSearchedMembers.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '8px', marginTop: '4px', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', maxHeight: '180px', overflowY: 'auto' }}>
                  {modalSearchedMembers.map(m => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setModalSelectedMember(m);
                        setModalMemberSearch('');
                      }}
                      style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <div>
                        <strong style={{ fontSize: '12px', color: '#0f172a' }}>{m.name}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', marginRight: '6px' }}>({m.rank || 'شرطي'})</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 800 }}>{m.department}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Member Preview Pill */}
              {modalSelectedMember && (
                <div style={{ marginTop: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#166534', fontWeight: 800 }}>المنتسب المختار: </span>
                    <strong style={{ fontSize: '12.5px', color: '#15803d' }}>{modalSelectedMember.name}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', marginRight: '8px' }}>({modalSelectedMember.rank || 'شرطي'} - {modalSelectedMember.department})</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#0284c7', fontFamily: 'monospace', fontWeight: 800 }}>
                    ر.و: {modalSelectedMember.national_id || '---'}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveLeave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>نوع الإجازة:</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                >
                  <option value="اجازة سنوية">إجازة سنوية اعتيادية</option>
                  <option value="اجازة طارئة">إجازة طارئة</option>
                  <option value="اجازة مرضية">إجازة مرضية (بتقرير طبي)</option>
                  <option value="اجازة حج / عمرة">إجازة حج / عمرة</option>
                  <option value="اجازة دراسية">إجازة دراسية / تدريب</option>
                  <option value="اجازة وضع وأمومة">إجازة وضع وأمومة</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>مصرح بالسفر إلى:</label>
                <input
                  type="text"
                  value={leaveForm.destination}
                  onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
                  placeholder="داخل ليبيا / خارج ليبيا إلى..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              {/* Start Date */}
              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>تاريخ البدء:</label>
                <input
                  type="date"
                  required
                  value={leaveForm.start_date}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontWeight: 800 }}
                />
              </div>

              {/* Duration in Days (Automatic calculation trigger) */}
              <div>
                <label style={{ fontWeight: 800, color: '#1e3a8a', display: 'block', marginBottom: '4px' }}>المدة بالأيام (يحدد تاريخ الانتهاء):</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  required
                  value={leaveForm.total_days}
                  onChange={(e) => handleTotalDaysChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #1e3a8a', boxSizing: 'border-box', fontWeight: 900, color: '#1e3a8a' }}
                />
              </div>

              {/* End Date (Automatic calculation trigger) */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 800, color: '#dc2626', display: 'block', marginBottom: '4px' }}>
                  تاريخ الانتهاء (محسوب آلياً أو اختره لتعديل الأيام):
                </label>
                <input
                  type="date"
                  required
                  value={leaveForm.end_date}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #dc2626', boxSizing: 'border-box', fontWeight: 900, color: '#dc2626' }}
                />
              </div>

              {/* Live Automatic Calculation Badge */}
              <div style={{ gridColumn: 'span 2', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>الاحتساب الآلي للمدة: </span>
                  <strong style={{ color: '#0f172a', fontSize: '12.5px' }}>{leaveForm.total_days} يوماً</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#1e3a8a', fontWeight: 800 }}>
                  تاريخ استئناف العمل المفترض: {new Date(new Date(leaveForm.end_date).getTime() + 86400000).toISOString().slice(0, 10)}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>ملاحظات أو قرار الموافقة:</label>
                <input
                  type="text"
                  value={leaveForm.notes}
                  onChange={(e) => setLeaveForm({ ...leaveForm, notes: e.target.value })}
                  placeholder="ملاحظات رئيس القسم أو الإدارة..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#10b981', color: '#ffffff', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '13px' }}
                >
                  اعتماد وحفظ الإجازة 💾
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewLeaveModalOpen(false)}
                  style={{ padding: '11px 20px', borderRadius: '8px', background: '#e2e8f0', color: '#334155', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Duty Resumption Modal (تسجيل مباشرة العمل) */}
      {isResumeModalOpen && activeLeaveForResumption && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10600, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', borderTop: '5px solid #16a34a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={22} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#0f172a' }}>
                  تسجيل مباشرة العمل واستئناف المهام
                </h3>
              </div>
              <button
                onClick={() => setIsResumeModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>اسم المنتسب:</span>
                <strong style={{ color: '#0f172a', fontSize: '13px' }}>{activeLeaveForResumption.FullName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>جهة التبعية:</span>
                <strong>{activeLeaveForResumption.DepartmentName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>فترة الإجازة:</span>
                <span>{activeLeaveForResumption.StartDate ? activeLeaveForResumption.StartDate.slice(0, 10) : ''} إلى {activeLeaveForResumption.EndDate ? activeLeaveForResumption.EndDate.slice(0, 10) : ''}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>حالة المدة:</span>
                <span style={{ fontWeight: 800, color: activeLeaveForResumption.diffDays < 0 ? '#dc2626' : '#16a34a' }}>
                  {activeLeaveForResumption.diffDays < 0 ? `متأخر ${Math.abs(activeLeaveForResumption.diffDays)} يوم عن الموعد` : 'في الموعد المحدد'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>تاريخ مباشرة العمل الفعلي:</label>
                <input
                  type="date"
                  value={resumptionDate}
                  onChange={(e) => setResumptionDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #16a34a', boxSizing: 'border-box', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>محضر / إفادة المباشرة والعودة:</label>
                <textarea
                  rows="3"
                  value={resumptionNotes}
                  onChange={(e) => setResumptionNotes(e.target.value)}
                  placeholder="تفاصيل العودة، استلام العهدة، والمباشرة الفعلية..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', color: '#166534', lineHeight: 1.6 }}>
                💡 <strong>تحديث تلقائي للمنظومة المركزية:</strong> عند التأكيد، سيتم إعادة حالة المنتسب في قاعدة بيانات القوة العمومية (2,211 فرد) فوراً من "إجازة رسمية" إلى "على رأس العمل".
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleConfirmResumption}
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '13px' }}
                >
                  تأكيد المباشرة وإعادة المنتسب للعمل ✅
                </button>
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  style={{ padding: '11px 20px', borderRadius: '8px', background: '#e2e8f0', color: '#334155', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
