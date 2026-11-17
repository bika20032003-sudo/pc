import React, { useState, useEffect, useMemo } from 'react';
import {
  Plane, Search, Plus, Calendar, User, Printer, Trash2, CheckCircle2,
  AlertTriangle, Clock, AlertOctagon, Download, RefreshCw, UserCheck,
  Bell, FileText, CheckCheck, Filter, ChevronRight, ChevronLeft, X, ShieldAlert
} from 'lucide-react';
import initialLeaves from '../data/leaves_data.json';
import { normalizeArabicText } from '../utils/arabicUtils';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';

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

  // New Leave Form state with Bidirectional Automatic Calculation matching official form ن ش 1/99
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultEndStr = new Date(Date.now() + 29 * 86400000).toISOString().slice(0, 10);

  const [leaveForm, setLeaveForm] = useState({
    // القسم الأول
    general_dept: 'مديرية أمن أوباري',
    military_number: '',
    rank: 'شرطي',
    name: '',
    workplace: 'ديوان مديرية أمن أوباري',
    total_days: 30,
    start_date: todayStr,
    end_date: defaultEndStr,
    leave_type: 'سنوية اعتيادية',
    destination: 'محلية (داخل ليبيا)',
    request_date: todayStr,
    request_hijri: '',
    applicant_signature: '',

    // القسم الثاني: (( يعد من الجهة المختصة بشؤون الإجازات ))
    entitled_until: `${new Date().getFullYear()}/12/31م`,
    entitled_days: 30,
    requested_days: 30,
    remaining_days: 0,
    officer_signature: 'رئيس وحدة الإجازات والغياب',
    section2_date: todayStr,
    section2_hijri: '',

    // القسم الثالث: أوصي بالموافقة / عدم الموافقة
    recommendation: 'أوصي بالموافقة لعدم المانع والتزام المنتسب وحسن السيرة',
    direct_boss_signature: 'الرئيس المباشر',
    section3_date: todayStr,
    section3_hijri: '',

    // القسم الرابع: (( قرار الجهة المختصة ))
    approval_status: 'أوافق على الإجازة المطلوبة',
    approved_days: 30,
    approver_signature: 'مدير مديرية أمن أوباري',
    section4_date: todayStr,

    // القسم الخامس: عاد من إجازته وباشر العمل بتاريخ
    resumed_date: '',
    resumed_hijri: '',
    resumption_signature: '',

    // القسم السادس: ملاحظات
    notes: 'إجازة سنوية نظامية معتمدة بسجلات مديرية أمن أوباري'
  });

  // مزامنة البيانات مع الخادم المركزي
  const fetchLeavesFromApi = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaves');
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
      setLeaveForm(prev => {
        const ent = Number(prev.entitled_days) || 30;
        return {
          ...prev,
          total_days: days,
          requested_days: days,
          approved_days: days,
          remaining_days: Math.max(0, ent - days),
          end_date: e.toISOString().slice(0, 10)
        };
      });
    } else {
      setLeaveForm(prev => {
        const ent = Number(prev.entitled_days) || 30;
        return {
          ...prev,
          total_days: days,
          requested_days: days,
          approved_days: days,
          remaining_days: Math.max(0, ent - days)
        };
      });
    }
  };

  const handleEndDateChange = (newEnd) => {
    const s = new Date(leaveForm.start_date);
    const e = new Date(newEnd);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const diffTime = e.getTime() - s.getTime();
      const calcDays = Math.max(1, Math.round(diffTime / 86400000) + 1);
      setLeaveForm(prev => {
        const ent = Number(prev.entitled_days) || 30;
        return {
          ...prev,
          end_date: newEnd,
          total_days: calcDays,
          requested_days: calcDays,
          approved_days: calcDays,
          remaining_days: Math.max(0, ent - calcDays)
        };
      });
    } else {
      setLeaveForm(prev => ({ ...prev, end_date: newEnd }));
    }
  };

  // اختيار المنتسب وتعبئة بيانات النموذج آلياً
  const handleSelectMemberForLeave = (member) => {
    setModalSelectedMember(member);
    setModalMemberSearch('');
    setLeaveForm(prev => {
      const num = member.job_number || member.financial_number || member.national_id || '---';
      const rank = member.rank || member.job_title || 'شرطي';
      const dept = member.department || 'مديرية أمن أوباري';
      return {
        ...prev,
        name: member.name,
        rank: rank,
        military_number: num,
        workplace: dept,
        applicant_signature: member.name
      };
    });
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

  // حفظ إجازة جديدة بموجب النموذج الرسمي ن ش 1/99
  const handleSaveLeave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const name = leaveForm.name || (modalSelectedMember && modalSelectedMember.name) || (selectedMember && selectedMember.name);
    if (!name) {
      alert('⚠️ يرجى تحديد المنتسب أولاً لمنحه الإجازة الرسمية');
      return;
    }

    const targetMember = modalSelectedMember || selectedMember || {};

    const newLeave = {
      LeaveID: Date.now(),
      NationalNumber: leaveForm.military_number || targetMember.national_id || targetMember.financial_number || targetMember.job_number || '---',
      FullName: name,
      Rank: leaveForm.rank || targetMember.rank || targetMember.job_title || 'شرطي',
      DepartmentName: leaveForm.workplace || targetMember.department || 'مديرية أمن أوباري',
      general_dept: leaveForm.general_dept,
      LeaveType: leaveForm.leave_type || 'سنوية',
      StartDate: new Date(leaveForm.start_date).toISOString(),
      EndDate: new Date(leaveForm.end_date).toISOString(),
      TotalDays: leaveForm.total_days,
      Notes: leaveForm.destination ? `${leaveForm.destination} - ${leaveForm.notes}` : leaveForm.notes,
      Status: 'سارية',

      // بيانات النموذج الرسمي المعتمد ن ش 1/99
      request_date: leaveForm.request_date,
      request_hijri: leaveForm.request_hijri,
      applicant_signature: leaveForm.applicant_signature || name,
      entitled_until: leaveForm.entitled_until,
      entitled_days: leaveForm.entitled_days,
      requested_days: leaveForm.requested_days,
      remaining_days: leaveForm.remaining_days,
      officer_signature: leaveForm.officer_signature,
      recommendation: leaveForm.recommendation,
      direct_boss_signature: leaveForm.direct_boss_signature,
      approval_status: leaveForm.approval_status,
      approved_days: leaveForm.approved_days,
      approver_signature: leaveForm.approver_signature,
      resumed_date: leaveForm.resumed_date,
      resumed_hijri: leaveForm.resumed_hijri,
      resumption_signature: leaveForm.resumption_signature
    };

    // تحديث الحالة محلياً
    setLeaves(prev => [newLeave, ...prev]);

    // تحديث حالة المنتسب في القوة المركزية إلى إجازة رسمية
    if (setForceMembers && (targetMember.id || targetMember.national_id)) {
      setForceMembers(prev => prev.map(m => {
        if (m.id === targetMember.id || (targetMember.national_id && m.national_id === targetMember.national_id)) {
          return { ...m, job_status: 'إجازة رسمية' };
        }
        return m;
      }));
    }

    // إرسال للخادم
    try {
      await fetch('/api/leaves', {
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
      await fetch(`/api/leaves/${leaveId}/resume`, {
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
        await fetch(`/api/leaves/${id}`, { method: 'DELETE' });
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

  // توليد كود الطباعة للنموذج الرسمي المعتمد لرجال الشرطة (ن ش 1 / 99) بدقة 100%
  const generateOfficialLeaveFormHtml = (leave) => {
    const name = leave.FullName || leave.name || '';
    const rank = leave.Rank || leave.rank || 'شرطي';
    const number = leave.NationalNumber || leave.military_number || leave.job_number || leave.financial_number || '';
    const generalDept = leave.general_dept || leave.DepartmentName || 'مديرية أمن أوباري';
    const workplace = leave.workplace || leave.DepartmentName || 'ديوان مديرية أمن أوباري';

    const startDate = leave.StartDate ? (leave.StartDate.slice ? leave.StartDate.slice(0, 10) : leave.StartDate) : (leave.start_date || '');
    const endDate = leave.EndDate ? (leave.EndDate.slice ? leave.EndDate.slice(0, 10) : leave.EndDate) : (leave.end_date || '');
    const totalDays = leave.TotalDays || leave.total_days || 30;

    const leaveTypeAndLocation = leave.destination ? 
      `${leave.leave_type || leave.LeaveType || 'سنوية'} / ${leave.destination}` :
      (leave.Notes || `${leave.LeaveType || 'سنوية'} / محلية`);

    const requestDate = leave.request_date || (leave.StartDate ? leave.StartDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    const requestHijri = leave.request_hijri || '';
    const applicantSig = leave.applicant_signature || name;

    const dueDate = leave.entitled_until || `${new Date().getFullYear()}/12/31م`;
    const entitledDays = leave.entitled_days !== undefined ? leave.entitled_days : 30;
    const requestedDays = leave.requested_days !== undefined ? leave.requested_days : totalDays;
    const remainingDays = leave.remaining_days !== undefined ? leave.remaining_days : Math.max(0, entitledDays - requestedDays);
    const officerSig = leave.officer_signature || 'رئيس وحدة الإجازات والغياب';

    const recommendation = leave.recommendation || 'أوصي بالموافقة لعدم المانع وصالح العمل';
    const directBossSig = leave.direct_boss_signature || 'الرئيس المباشر';

    const approvedDays = leave.approved_days !== undefined ? leave.approved_days : totalDays;
    const approverSig = leave.approver_signature || leave.competent_authority_signature || 'مدير أمن أوباري';

    const resumedDate = leave.ActualResumptionDate || leave.resumed_date || '';
    const resumedHijri = leave.resumed_hijri || '';
    const resumptionSig = leave.resumption_signature || (leave.ActualResumptionDate ? 'رئيس الوحدة' : '');

    const notes = leave.notes || leave.ResumptionNotes || leave.Notes || 'إجازة سنوية نظامية معتمدة بسجلات المديرية';

    return `
      <div style="width: 100%; max-width: 720px; margin: 0 auto; padding: 15px 25px; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #000000; box-sizing: border-box; background: #ffffff; font-size: 13.5px; line-height: 2.1;">
        
        <!-- Header: ن ش 1 / 99 والتسمية السيادية الرسمية -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
          <tr>
            <td style="width: 25%; text-align: right; vertical-align: top; font-weight: 900; font-size: 14.5px;">
              ن ش 1 / 99
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <div style="font-size: 17.5px; font-weight: 900; margin-bottom: 2px;">دَوْلَةُ لِيبْيَا</div>
              <div style="font-size: 16px; font-weight: 900; margin-bottom: 8px;">وَزَارَةُ الدَّاخِلِيَّةِ</div>
              <div style="font-size: 16.5px; font-weight: 900; border-bottom: 1.5px solid #000; display: inline-block; padding-bottom: 1px;">
                نموذج طلب الحصول على إجازة سنوية لرجال الشرطة
              </div>
            </td>
            <td style="width: 25%;"></td>
          </tr>
        </table>

        <!-- القسم الأول -->
        <div style="margin-top: 8px;">
          <div style="font-weight: 900; font-size: 14.5px;">القسم الأول :</div>
          
          <div>
            <span style="font-weight: 700;">الإدارة العامة : </span>
            <span style="border-bottom: 1px dotted #000; display: inline-block; width: 85%; padding: 0 6px; font-weight: 800;">${generalDept}</span>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 30%;">
                <span style="font-weight: 700;">الرقم : </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 70%; text-align: center; font-weight: 800;">${number}</span>
              </td>
              <td style="width: 32%;">
                <span style="font-weight: 700;">الرتبة : </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 70%; text-align: center; font-weight: 800;">${rank}</span>
              </td>
              <td style="width: 38%;">
                <span style="font-weight: 700;">الاسم: </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 78%; text-align: center; font-weight: 900;">${name}</span>
              </td>
            </tr>
          </table>

          <div>
            <span style="font-weight: 700;">مكان العمل : </span>
            <span style="border-bottom: 1px dotted #000; display: inline-block; width: 86%; padding: 0 6px; font-weight: 800;">${workplace}</span>
          </div>

          <div style="font-weight: 900; margin-top: 4px;">
            أرجو منحي إجازة سنوية كما يلي:
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 36%;">
                <span style="font-weight: 700;">مدة الإجازة المطلوبة: </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 45%; text-align: center; font-weight: 900;">${totalDays} يوماً</span>
              </td>
              <td style="width: 32%;">
                <span style="font-weight: 700;">من: </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 75%; text-align: center; font-weight: 800;">${startDate}</span>
              </td>
              <td style="width: 32%;">
                <span style="font-weight: 700;">إلى غاية: </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 68%; text-align: center; font-weight: 800;">${endDate}</span>
              </td>
            </tr>
          </table>

          <div>
            <span style="font-weight: 700;">نوع الإجازة المطلوبة محلية / خارجية / العنوان خلال مدة الإجازة : </span>
            <span style="border-bottom: 1px dotted #000; display: inline-block; width: 48%; padding: 0 6px; font-weight: 800;">${leaveTypeAndLocation}</span>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%;">
                <span style="font-weight: 700;">تاريخ تقديم الطلب : </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 45%; text-align: center; font-weight: 800;">${requestDate}</span>
                <span style="font-weight: 700; margin-right: 8px;">الموافق : </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 30%; text-align: center; font-weight: 800;">${requestHijri}</span>
              </td>
              <td style="width: 50%; text-align: left;">
                <span style="font-weight: 900;">توقيع طالب الإجازة </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 50%; text-align: center; font-weight: 800;">${applicantSig}</span>
              </td>
            </tr>
          </table>
        </div>

        <hr style="border: none; border-top: 1.5px solid #000; margin: 9px 0;" />

        <!-- القسم الثاني -->
        <div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 25%; font-weight: 900; font-size: 14.5px;">القسم الثاني :</td>
              <td style="width: 50%; text-align: center; font-weight: 900; font-size: 14px;">(( يعد من الجهة المختصة بشؤون الإجازات ))</td>
              <td style="width: 25%;"></td>
            </tr>
          </table>

          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: 700; white-space: nowrap;">مدة الإجازة المستحقة لغاية : </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; margin: 0 8px; text-align: center; font-weight: 800;">${dueDate}</span>
            <span style="font-weight: 900; white-space: nowrap;">(&nbsp;&nbsp;&nbsp;${entitledDays}&nbsp;&nbsp;&nbsp;) يوماً</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: 700; white-space: nowrap;">مدة الإجازة المطلوبة : </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; margin: 0 8px;"></span>
            <span style="font-weight: 900; white-space: nowrap;">(&nbsp;&nbsp;&nbsp;${requestedDays}&nbsp;&nbsp;&nbsp;) يوماً</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: 700; white-space: nowrap;">مدة الإجازة المتبقية : </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; margin: 0 8px;"></span>
            <span style="font-weight: 900; white-space: nowrap;">(&nbsp;&nbsp;&nbsp;${remainingDays}&nbsp;&nbsp;&nbsp;) يوماً</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 4px;">
            <tr>
              <td style="width: 45%;">
                <span style="font-weight: 900;">توقيع الضابط المختص </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 45%; text-align: center; font-weight: 800;">${officerSig}</span>
              </td>
              <td style="width: 25%; text-align: center;">
                <span style="font-weight: 700;">الموافق </span>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
              <td style="width: 30%; text-align: left;">
                <span style="font-weight: 700;">التاريخ </span>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
            </tr>
          </table>
        </div>

        <hr style="border: none; border-top: 1.5px solid #000; margin: 9px 0;" />

        <!-- القسم الثالث -->
        <div>
          <div>
            <span style="font-weight: 900; font-size: 14.5px;">القسم الثالث : </span>
            <span style="font-weight: 700;">أوصي بالموافقة / عدم الموافقة للأسباب الآتية: </span>
            <span style="border-bottom: 1px dotted #000; display: inline-block; width: 55%; padding: 0 6px; font-weight: 800;">${recommendation}</span>
          </div>
          <div style="border-bottom: 1px dotted #000; width: 100%; min-height: 20px;"></div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 4px;">
            <tr>
              <td style="width: 45%;">
                <span style="font-weight: 900;">توقيع الرئيس المباشر </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 45%; text-align: center; font-weight: 800;">${directBossSig}</span>
              </td>
              <td style="width: 25%; text-align: center;">
                <span style="font-weight: 700;">الموافق </span>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
              <td style="width: 30%; text-align: left;">
                <span style="font-weight: 700;">التاريخ </span>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
            </tr>
          </table>
        </div>

        <hr style="border: none; border-top: 1.5px solid #000; margin: 9px 0;" />

        <!-- القسم الرابع -->
        <div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 25%; font-weight: 900; font-size: 14.5px;">القسم الرابع:</td>
              <td style="width: 50%; text-align: center; font-weight: 900; font-size: 14px;">(( قرار الجهة المختصة ))</td>
              <td style="width: 25%;"></td>
            </tr>
          </table>

          <div>
            <span>1- أوافق / لا أوافق على الإجازة المطلوبة أو على مدة ( </span>
            <span style="font-weight: 900; padding: 0 8px;">${approvedDays}</span>
            <span> ) يوماً.</span>
          </div>
          <div>
            <span>2- تحفظ مدة الإجازة المتجمعة أو المتبقية أو التي لم يوافق عليها لاعتبارات تتعلق بصالح العمل ومدتها.</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 4px;">
            <tr>
              <td style="width: 60%;">
                <span style="font-weight: 900;">توقيع المختص بمنح الإجازات </span>
                <span style="border-bottom: 1px dotted #000; display: inline-block; width: 45%; text-align: center; font-weight: 800;">${approverSig}</span>
              </td>
              <td style="width: 40%; text-align: left;">
                <span style="font-weight: 700;">التاريخ </span>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </td>
            </tr>
          </table>
        </div>

        <hr style="border: none; border-top: 1.5px solid #000; margin: 9px 0;" />

        <!-- القسم الخامس -->
        <div>
          <div>
            <span style="font-weight: 900; font-size: 14.5px;">القسم الخامس : </span>
            <span style="font-weight: 700;">عاد من إجازته وباشر العمل بتاريخ: </span>
            <span style="border-bottom: 1px dotted #000; display: inline-block; width: 25%; text-align: center; font-weight: 800;">${resumedDate}</span>
            <span style="font-weight: 700; margin-right: 12px;">الموافق: </span>
            <span style="border-bottom: 1px dotted #000; display: inline-block; width: 25%; text-align: center; font-weight: 800;">${resumedHijri}</span>
          </div>

          <div style="margin-top: 4px;">
            <span style="font-weight: 900;">توقيع المختص </span>
            <span style="border-bottom: 1px dotted #000; display: inline-block; width: 35%; text-align: center; font-weight: 800;">${resumptionSig}</span>
          </div>
        </div>

        <hr style="border: none; border-top: 1.5px solid #000; margin: 9px 0;" />

        <!-- القسم السادس -->
        <div>
          <div>
            <span style="font-weight: 900; font-size: 14.5px;">القسم السادس : </span>
            <span style="font-weight: 700;">ملاحظات </span>
            <span style="border-bottom: 1px dotted #000; display: inline-block; width: 80%; padding: 0 6px; font-weight: 800;">${notes}</span>
          </div>
          <div style="border-bottom: 1px dotted #000; width: 100%; min-height: 20px;"></div>
        </div>

        <hr style="border: none; border-top: 1.5px solid #000; margin: 9px 0;" />

        <!-- التوزيع والمطبعة -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11.5px;">
          <tr>
            <td style="width: 60%; vertical-align: bottom; line-height: 1.7;">
              <div style="font-weight: 900;">التوزيع : النسخة الأصلية لطالب الإجازة.</div>
              <div>نسخة للإدارة العامة لشؤون الضباط أو إدارة شؤون خدمة الأفراد.</div>
              <div>نسخة للفرع الذي يتبعه طالب الإجازة</div>
            </td>
            <td style="width: 40%; text-align: center; vertical-align: bottom;">
              <div style="display: inline-block; border: 1.5px solid #000; padding: 4px 14px; border-radius: 4px; font-weight: 900; font-size: 12px;">
                مطبعة إدارة شؤون العلاقات والتعاون
              </div>
            </td>
          </tr>
        </table>

      </div>
    `;
  };

  // طباعة النموذج الرسمي المعتمد A4 (ن ش 1 / 99)
  const handlePrintLeaveVoucher = (leave) => {
    const printHtml = generateOfficialLeaveFormHtml(leave);
    printDocumentInIframe(printHtml, `نموذج إجازة سنوية ن ش 1-99 - ${leave.FullName || leave.name || ''}`);
  };

  // طباعة النموذج الحالي قيد التعبئة في النافذة
  const handlePrintCurrentForm = () => {
    const printHtml = generateOfficialLeaveFormHtml(leaveForm);
    printDocumentInIframe(printHtml, `نموذج إجازة سنوية ن ش 1-99 - ${leaveForm.name || 'طلب إجازة'}`);
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

      {/* Modal 1: Official Police Leave Form (ن ش 1 / 99 - نموذج طلب الحصول على إجازة سنوية لرجال الشرطة) */}
      {isNewLeaveModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10500,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '860px',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            borderTop: '5px solid #1e3a8a',
            overflow: 'hidden'
          }}>
            {/* Modal Header Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 22px',
              background: '#f8fafc',
              borderBottom: '1.5px solid #e2e8f0',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={22} color="#1e3a8a" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#0f172a' }}>
                    نموذج طلب الحصول على إجازة سنوية لرجال الشرطة (ن ش 1 / 99)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                    النموذج الرسمي المعتمد بوزارة الداخلية دولة ليبيا
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrintCurrentForm}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#eff6ff',
                    border: '1.5px solid #1e3a8a',
                    borderRadius: '8px',
                    color: '#1e3a8a',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="طباعة النموذج بصيغة A4 الرسمية"
                >
                  <Printer size={16} />
                  <span>طباعة A4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewLeaveModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="إغلاق"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Quick Autocomplete Member Selector Banner */}
            <div style={{
              background: '#eff6ff',
              borderBottom: '1px solid #bfdbfe',
              padding: '10px 22px',
              position: 'relative',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', whiteSpace: 'nowrap' }}>
                  🔍 تحديد المنتسب من القوة العمومية (2,211 منتسب) لتعبئة النموذج آلياً:
                </span>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                  <input
                    type="text"
                    value={modalMemberSearch}
                    onChange={(e) => setModalMemberSearch(e.target.value)}
                    placeholder="ابحث بالاسم، الرقم المالي أو الوطني..."
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #93c5fd',
                      fontSize: '13px',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                  {/* Results Dropdown */}
                  {modalSearchedMembers.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      left: 0,
                      background: '#ffffff',
                      border: '1.5px solid #1e3a8a',
                      borderRadius: '8px',
                      marginTop: '4px',
                      zIndex: 1000,
                      boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                      maxHeight: '180px',
                      overflowY: 'auto'
                    }}>
                      {modalSearchedMembers.map(m => (
                        <div
                          key={m.id}
                          onClick={() => handleSelectMemberForLeave(m)}
                          style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                        >
                          <div>
                            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{m.name}</strong>
                            <span style={{ fontSize: '11.5px', color: '#64748b', marginRight: '6px' }}>({m.rank || m.job_title || 'شرطي'})</span>
                          </div>
                          <span style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 800 }}>{m.department || 'أوباري'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Paper Container (Exact Replica of Document) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 32px',
              background: '#ffffff',
              fontFamily: "'Cairo', Arial, sans-serif"
            }}>
              {/* Paper Document Form */}
              <div style={{
                border: '1.5px solid #000000',
                padding: '24px 30px',
                background: '#ffffff',
                color: '#000000',
                fontSize: '14px',
                lineHeight: '2.1'
              }}>

                {/* Top Bar: Code and Title */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '25%', textAlign: 'right', verticalAlign: 'top', fontWeight: 900, fontSize: '15px' }}>
                        ن ش 1 / 99
                      </td>
                      <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, marginBottom: '2px' }}>دَوْلَةُ لِيبْيَا</div>
                        <div style={{ fontSize: '16.5px', fontWeight: 900, marginBottom: '8px' }}>وَزَارَةُ الدَّاخِلِيَّةِ</div>
                        <div style={{ fontSize: '17px', fontWeight: 900, borderBottom: '1.5px solid #000', display: 'inline-block', paddingBottom: '2px' }}>
                          نموذج طلب الحصول على إجازة سنوية لرجال الشرطة
                        </div>
                      </td>
                      <td style={{ width: '25%' }}></td>
                    </tr>
                  </tbody>
                </table>

                {/* القسم الأول */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontWeight: 900, fontSize: '15px' }}>القسم الأول :</div>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>الإدارة العامة :&nbsp;</span>
                    <input
                      type="text"
                      value={leaveForm.general_dept}
                      onChange={(e) => setLeaveForm({ ...leaveForm, general_dept: e.target.value })}
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', flex: 1, padding: '2px 8px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                    />
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '30%' }}>
                          <span style={{ fontWeight: 700 }}>الرقم :&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.military_number}
                            onChange={(e) => setLeaveForm({ ...leaveForm, military_number: e.target.value })}
                            placeholder="الرقم المالي / الوطني"
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '65%', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ width: '32%' }}>
                          <span style={{ fontWeight: 700 }}>الرتبة :&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.rank}
                            onChange={(e) => setLeaveForm({ ...leaveForm, rank: e.target.value })}
                            placeholder="الرتبة العسكرية"
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '68%', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ width: '38%' }}>
                          <span style={{ fontWeight: 700 }}>الاسم:&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.name}
                            onChange={(e) => setLeaveForm({ ...leaveForm, name: e.target.value })}
                            placeholder="اسم المنتسب الرباعي"
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '75%', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 900 }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>مكان العمل :&nbsp;</span>
                    <input
                      type="text"
                      value={leaveForm.workplace}
                      onChange={(e) => setLeaveForm({ ...leaveForm, workplace: e.target.value })}
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', flex: 1, padding: '2px 8px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                    />
                  </div>

                  <div style={{ fontWeight: 900, marginTop: '4px' }}>
                    أرجو منحي إجازة سنوية كما يلي:
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '36%' }}>
                          <span style={{ fontWeight: 700 }}>مدة الإجازة المطلوبة:&nbsp;</span>
                          <input
                            type="number"
                            min="1"
                            max="180"
                            value={leaveForm.total_days}
                            onChange={(e) => handleTotalDaysChange(e.target.value)}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '42%', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 900 }}
                          />
                          <span style={{ fontWeight: 700 }}>&nbsp;يوماً</span>
                        </td>
                        <td style={{ width: '32%' }}>
                          <span style={{ fontWeight: 700 }}>من:&nbsp;</span>
                          <input
                            type="date"
                            value={leaveForm.start_date}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '75%', textAlign: 'center', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ width: '32%' }}>
                          <span style={{ fontWeight: 700 }}>إلى غاية:&nbsp;</span>
                          <input
                            type="date"
                            value={leaveForm.end_date}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '68%', textAlign: 'center', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 800 }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>نوع الإجازة المطلوبة محلية / خارجية / العنوان خلال مدة الإجازة :&nbsp;</span>
                    <input
                      type="text"
                      value={leaveForm.destination}
                      onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
                      placeholder="محلية (داخل ليبيا - أوباري / طرابلس)"
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', flex: 1, padding: '2px 8px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                    />
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '50%' }}>
                          <span style={{ fontWeight: 700 }}>تاريخ تقديم الطلب :&nbsp;</span>
                          <input
                            type="date"
                            value={leaveForm.request_date}
                            onChange={(e) => setLeaveForm({ ...leaveForm, request_date: e.target.value })}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '42%', textAlign: 'center', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 800 }}
                          />
                          <span style={{ fontWeight: 700, marginRight: '8px' }}>الموافق :&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.request_hijri}
                            onChange={(e) => setLeaveForm({ ...leaveForm, request_hijri: e.target.value })}
                            placeholder="هجري / هـ"
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '28%', textAlign: 'center', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ width: '50%', textAlign: 'left' }}>
                          <span style={{ fontWeight: 900 }}>توقيع طالب الإجازة&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.applicant_signature}
                            onChange={(e) => setLeaveForm({ ...leaveForm, applicant_signature: e.target.value })}
                            placeholder="توقيع طالب الإجازة"
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '55%', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '14px 0' }} />

                {/* القسم الثاني */}
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%', fontWeight: 900, fontSize: '15px' }}>القسم الثاني :</td>
                        <td style={{ width: '50%', textAlign: 'center', fontWeight: 900, fontSize: '14.5px' }}>(( يعد من الجهة المختصة بشؤون الإجازات ))</td>
                        <td style={{ width: '25%' }}></td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>مدة الإجازة المستحقة لغاية :&nbsp;</span>
                    <input
                      type="text"
                      value={leaveForm.entitled_until}
                      onChange={(e) => setLeaveForm({ ...leaveForm, entitled_until: e.target.value })}
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', flex: 1, margin: '0 8px', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                    />
                    <span style={{ fontWeight: 900, whiteSpace: 'nowrap' }}>
                      (&nbsp;
                      <input
                        type="number"
                        min="0"
                        value={leaveForm.entitled_days}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setLeaveForm(prev => ({
                            ...prev,
                            entitled_days: val,
                            remaining_days: Math.max(0, val - prev.requested_days)
                          }));
                        }}
                        style={{ border: 'none', outline: 'none', width: '38px', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 900 }}
                      />
                      &nbsp;) يوماً
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>مدة الإجازة المطلوبة :&nbsp;</span>
                    <span style={{ borderBottom: '1px dotted #000', flex: 1, margin: '0 8px' }}></span>
                    <span style={{ fontWeight: 900, whiteSpace: 'nowrap' }}>
                      (&nbsp;<span style={{ display: 'inline-block', width: '38px', textAlign: 'center' }}>{leaveForm.requested_days}</span>&nbsp;) يوماً
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>مدة الإجازة المتبقية :&nbsp;</span>
                    <span style={{ borderBottom: '1px dotted #000', flex: 1, margin: '0 8px' }}></span>
                    <span style={{ fontWeight: 900, whiteSpace: 'nowrap' }}>
                      (&nbsp;<span style={{ display: 'inline-block', width: '38px', textAlign: 'center', color: '#1e3a8a' }}>{leaveForm.remaining_days}</span>&nbsp;) يوماً
                    </span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '6px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '45%' }}>
                          <span style={{ fontWeight: 900 }}>توقيع الضابط المختص&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.officer_signature}
                            onChange={(e) => setLeaveForm({ ...leaveForm, officer_signature: e.target.value })}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '50%', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ width: '25%', textAlign: 'center' }}>
                          <span style={{ fontWeight: 700 }}>الموافق&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.section2_hijri}
                            onChange={(e) => setLeaveForm({ ...leaveForm, section2_hijri: e.target.value })}
                            placeholder="/  /"
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '60px', textAlign: 'center', fontFamily: 'inherit', fontSize: '13px' }}
                          />
                        </td>
                        <td style={{ width: '30%', textAlign: 'left' }}>
                          <span style={{ fontWeight: 700 }}>التاريخ&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.section2_date}
                            onChange={(e) => setLeaveForm({ ...leaveForm, section2_date: e.target.value })}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '90px', textAlign: 'center', fontFamily: 'inherit', fontSize: '13px' }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '14px 0' }} />

                {/* القسم الثالث */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 900, fontSize: '15px' }}>القسم الثالث :&nbsp;</span>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>أوصي بالموافقة / عدم الموافقة للأسباب الآتية:&nbsp;</span>
                    <input
                      type="text"
                      value={leaveForm.recommendation}
                      onChange={(e) => setLeaveForm({ ...leaveForm, recommendation: e.target.value })}
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', flex: 1, padding: '2px 8px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                    />
                  </div>
                  <div style={{ borderBottom: '1px dotted #000', width: '100%', minHeight: '22px' }}></div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '6px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '45%' }}>
                          <span style={{ fontWeight: 900 }}>توقيع الرئيس المباشر&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.direct_boss_signature}
                            onChange={(e) => setLeaveForm({ ...leaveForm, direct_boss_signature: e.target.value })}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '50%', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ width: '25%', textAlign: 'center' }}>
                          <span style={{ fontWeight: 700 }}>الموافق&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.section3_hijri}
                            onChange={(e) => setLeaveForm({ ...leaveForm, section3_hijri: e.target.value })}
                            placeholder="/  /"
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '60px', textAlign: 'center', fontFamily: 'inherit', fontSize: '13px' }}
                          />
                        </td>
                        <td style={{ width: '30%', textAlign: 'left' }}>
                          <span style={{ fontWeight: 700 }}>التاريخ&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.section3_date}
                            onChange={(e) => setLeaveForm({ ...leaveForm, section3_date: e.target.value })}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '90px', textAlign: 'center', fontFamily: 'inherit', fontSize: '13px' }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '14px 0' }} />

                {/* القسم الرابع */}
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%', fontWeight: 900, fontSize: '15px' }}>القسم الرابع:</td>
                        <td style={{ width: '50%', textAlign: 'center', fontWeight: 900, fontSize: '14.5px' }}>(( قرار الجهة المختصة ))</td>
                        <td style={{ width: '25%' }}></td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span>1-&nbsp;</span>
                    <select
                      value={leaveForm.approval_status}
                      onChange={(e) => setLeaveForm({ ...leaveForm, approval_status: e.target.value })}
                      style={{ border: 'none', borderBottom: '1px dotted #000', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                    >
                      <option value="أوافق على الإجازة المطلوبة">أوافق على الإجازة المطلوبة</option>
                      <option value="لا أوافق على الإجازة المطلوبة">لا أوافق على الإجازة المطلوبة</option>
                      <option value="أوافق على مدة محددة">أوافق على مدة محددة</option>
                    </select>
                    <span>&nbsp;أو على مدة (&nbsp;</span>
                    <input
                      type="number"
                      min="1"
                      value={leaveForm.approved_days}
                      onChange={(e) => setLeaveForm({ ...leaveForm, approved_days: Number(e.target.value) || 0 })}
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '40px', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 900 }}
                    />
                    <span>&nbsp;) يوماً.</span>
                  </div>
                  <div>
                    2- تحفظ مدة الإجازة المتجمعة أو المتبقية أو التي لم يوافق عليها لاعتبارات تتعلق بصالح العمل ومدتها.
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '6px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '60%' }}>
                          <span style={{ fontWeight: 900 }}>توقيع المختص بمنح الإجازات&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.approver_signature}
                            onChange={(e) => setLeaveForm({ ...leaveForm, approver_signature: e.target.value })}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '50%', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ width: '40%', textAlign: 'left' }}>
                          <span style={{ fontWeight: 700 }}>التاريخ&nbsp;</span>
                          <input
                            type="text"
                            value={leaveForm.section4_date}
                            onChange={(e) => setLeaveForm({ ...leaveForm, section4_date: e.target.value })}
                            style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '90px', textAlign: 'center', fontFamily: 'inherit', fontSize: '13px' }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '14px 0' }} />

                {/* القسم الخامس */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 900, fontSize: '15px' }}>القسم الخامس :&nbsp;</span>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>عاد من إجازته وباشر العمل بتاريخ:&nbsp;</span>
                    <input
                      type="date"
                      value={leaveForm.resumed_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, resumed_date: e.target.value })}
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '130px', textAlign: 'center', fontFamily: 'inherit', fontSize: '13px' }}
                    />
                    <span style={{ fontWeight: 700, margin: '0 8px' }}>الموافق:&nbsp;</span>
                    <input
                      type="text"
                      value={leaveForm.resumed_hijri}
                      onChange={(e) => setLeaveForm({ ...leaveForm, resumed_hijri: e.target.value })}
                      placeholder="هجري / هـ"
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '120px', textAlign: 'center', fontFamily: 'inherit', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontWeight: 900 }}>توقيع المختص&nbsp;</span>
                    <input
                      type="text"
                      value={leaveForm.resumption_signature}
                      onChange={(e) => setLeaveForm({ ...leaveForm, resumption_signature: e.target.value })}
                      placeholder="توقيع الضابط أو رئيس الوحدة"
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', width: '220px', textAlign: 'center', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                    />
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '14px 0' }} />

                {/* القسم السادس */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 900, fontSize: '15px' }}>القسم السادس :&nbsp;</span>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>ملاحظات&nbsp;</span>
                    <input
                      type="text"
                      value={leaveForm.notes}
                      onChange={(e) => setLeaveForm({ ...leaveForm, notes: e.target.value })}
                      style={{ border: 'none', borderBottom: '1px dotted #000', outline: 'none', flex: 1, padding: '2px 8px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 800 }}
                    />
                  </div>
                  <div style={{ borderBottom: '1px dotted #000', width: '100%', minHeight: '22px' }}></div>
                </div>

                <hr style={{ border: 'none', borderTop: '1.5px solid #000', margin: '14px 0' }} />

                {/* التوزيع والمطبعة */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '12px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '60%', verticalAlign: 'bottom', lineHeight: '1.7' }}>
                        <div style={{ fontWeight: 900 }}>التوزيع : النسخة الأصلية لطالب الإجازة.</div>
                        <div>نسخة للإدارة العامة لشؤون الضباط أو إدارة شؤون خدمة الأفراد.</div>
                        <div>نسخة للفرع الذي يتبعه طالب الإجازة</div>
                      </td>
                      <td style={{ width: '40%', textAlign: 'center', verticalAlign: 'bottom' }}>
                        <div style={{ display: 'inline-block', border: '1.5px solid #000', padding: '4px 16px', borderRadius: '4px', fontWeight: 900, fontSize: '12px' }}>
                          مطبعة إدارة شؤون العلاقات والتعاون
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>

            {/* Modal Bottom Actions Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 24px',
              background: '#f8fafc',
              borderTop: '1.5px solid #e2e8f0',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSaveLeave}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5,150,105,0.25)'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>اعتماد وحفظ الإجازة بالسجل</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintCurrentForm}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    background: '#1e3a8a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(30,58,138,0.25)'
                  }}
                >
                  <Printer size={18} />
                  <span>طباعة النموذج الرسمي (ن ش 1 / 99)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsNewLeaveModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
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
