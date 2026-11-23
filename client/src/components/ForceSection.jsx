import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Shield,
  CheckCircle2,
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Plus,
  X,
  Save,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Scale
} from 'lucide-react';
import ForceNameAutocomplete from './ForceNameAutocomplete';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';
import initialPenalties from '../data/penalties_data.json';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import IndictmentSheetModal from './IndictmentSheetModal';

const EMPTY_FORCE_FORM = {
  type: 'شرطي', // شرطي أو مدني
  name: '',
  job_number: '',
  national_id: '',
  birth_date: '',
  birth_place: 'أوباري',
  mother_name: '',
  marital_status: 'متزوج',
  wife_name: '',
  children_count: '0',
  tribe_city: 'أوباري',
  residence: 'أوباري المدينة',
  phone: '',
  languages: 'العربية',
  education_level: 'دورة شرطة / ثانوية',
  // المستندات والعهد
  family_book: '',
  family_paper: '',
  family_record: '',
  passport_number: '',
  suit_number: '',
  shoe_size: '42',
  headwear_size: '58',
  shirt_size: 'L',
  blood_type: 'O+',
  diseases: 'سليم ولائق صحياً',
  height: '175',
  weight: '75',
  // الوظيفية والمالية
  department: 'مركز شرطة أوباري المدينة',
  job_title: 'شـرطـي',
  job_status: 'على رأس العمل',
  start_date: '',
  appointment_decision: '',
  appointment_date: '',
  last_promotion_decision: '',
  last_promotion_date: '',
  financial_number: '',
  basic_salary: '2200',
  bank_name: 'الصحاري بنت بيه',
  bank_branch: 'فرع أوباري',
  account_number: ''
};

// Score hierarchy for Libyan Police / Security Ranks (1 = highest: لواء, down to شرطي = 17, civilians = 1000)
const getMilitaryRankScore = (rawRank, type) => {
  const r = String(rawRank || '').replace(/[\u0640]/g, '').trim().toLowerCase();
  const isCiv = (type && String(type).includes('مدني')) || r.includes('مدني');
  if (isCiv) return 1000;

  // Commissioned Officers (الضباط)
  if (r.includes('لواء')) return 1;
  if (r.includes('عميد')) return 2;
  if (r.includes('عقيد')) return 3;
  if (r.includes('مقدم')) return 4;
  if (r.includes('رائد')) return 5;
  if (r.includes('نقيب')) return 6;
  if (r.includes('ملازم') && (r.includes('اول') || r.includes('أول') || r.includes('1') || r.includes('//'))) return 7;
  if (r.includes('ملازم')) return 8;

  // Warrant & Non-Commissioned Officers (ضباط الصف والشرف)
  if (r.includes('نائب ضابط اول') || r.includes('نائب ضابط أول') || r === 'ن.ض.أ' || r === 'ن ض ا') return 9;
  if (r.includes('نائب ضابط') || r === 'ن.ض' || r === 'ن ض') return 10;
  if (r.includes('مساعد ضابط اول') || r.includes('مساعد ضابط أول') || r === 'م.ض.أ' || r === 'م ض ا') return 11;
  if (r.includes('مساعد ضابط') || r === 'م.ض' || r === 'م ض' || r === 'م.ص') return 12;
  if (r.includes('رئيس عرفاء اول') || r.includes('رئيس عرفاء أول') || r.includes('ريس عرفاء اول') || r.includes('ر.ع.أ') || r.includes('ر.ع. أ') || r.includes('ر ع ا') || r.includes('ع.أ.ر')) return 13;
  if (r.includes('رئيس عرفاء') || r.includes('ريس عرفاء') || r === 'ر.ع' || r === 'رع' || r === 'ر ع' || r === 'ر .ع') return 14;
  if (r.includes('عريف') && !r.includes('نائب') && !r.includes('ن.ع')) return 15;
  if (r.includes('نائب عريف') || r === 'ن.ع') return 16;
  if (r.includes('شرطي') || r.includes('شـرطـي')) return 17;

  return 900;
};

export default function ForceSection({
  forceMembers = [],
  setForceMembers,
  onTriggerImport,
  isImporting = false,
  onOpenPreview,
  notificationMsg,
  setNotificationMsg,
  externalEditingMember = null,
  clearExternalEditingMember,
  onOpenInquiry,
  onSyncForce
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showForceForm, setShowForceForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [forceFormData, setForceFormData] = useState(EMPTY_FORCE_FORM);
  const [forceSearchTerm, setForceSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('الكل'); // 'الكل', 'شرطي', 'مدني'
  const [statusFilter, setStatusFilter] = useState('الكل'); // 'الكل', 'على رأس العمل', 'إجازة', 'موقوف'
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [rosterScope, setRosterScope] = useState('all'); // 'all' or 'filtered'
  const [rosterModalSearch, setRosterModalSearch] = useState('');

  // Watch for external edit requests (e.g., from preview modal)
  useEffect(() => {
    if (externalEditingMember) {
      setEditingMemberId(externalEditingMember.id);
      setForceFormData({ ...externalEditingMember });
      setShowForceForm(true);
      window.scrollTo({ top: 180, behavior: 'smooth' });
      if (clearExternalEditingMember) clearExternalEditingMember();
    }
  }, [externalEditingMember, clearExternalEditingMember]);

  // Open Form to Add Personnel
  const handleOpenAdd = () => {
    setEditingMemberId(null);
    setForceFormData(EMPTY_FORCE_FORM);
    setShowForceForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Form to Edit Existing Personnel
  const handleOpenEdit = (member) => {
    setEditingMemberId(member.id);
    setForceFormData({ ...member });
    setShowForceForm(true);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Handle Manual Server Sync
  const handleManualSync = async () => {
    if (!onSyncForce || isSyncing) return;
    setIsSyncing(true);
    try {
      await onSyncForce(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Instant Live Status Change for Member
  const handleQuickStatusChange = (id, newStatus) => {
    let memberName = '';
    const updated = forceMembers.map((m) => {
      if (m.id === id) {
        memberName = m.name;
        return { ...m, job_status: newStatus, status: newStatus };
      }
      return m;
    });

    if (setForceMembers) setForceMembers(updated);
    try {
      localStorage.setItem('ubari_force_members', JSON.stringify(updated));
    } catch (e) {}

    fetch(`/api/force/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_status: newStatus, status: newStatus })
    }).catch(() => {});

    if (setNotificationMsg) {
      setNotificationMsg(`✅ تم تحديث الوضع الوظيفي لـ (${memberName}) إلى: [${newStatus}] بنجاح`);
      setTimeout(() => setNotificationMsg(''), 4500);
    }
  };

  // Save or Update Personnel
  const handleSaveMember = async (e) => {
    if (e) e.preventDefault();
    if (!forceFormData.name.trim()) {
      alert('يرجى إدخال الاسم الكامل');
      return;
    }

    if (editingMemberId) {
      // Update existing person
      const updated = forceMembers.map((m) =>
        m.id === editingMemberId ? { ...forceFormData, id: editingMemberId } : m
      );
      if (setForceMembers) setForceMembers(updated);
      try {
        localStorage.setItem('ubari_force_members', JSON.stringify(updated));
      } catch (e) {}

      // Sync with API
      fetch(`/api/force/${editingMemberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forceFormData)
      }).catch(() => {});

      if (setNotificationMsg) {
        setNotificationMsg(`تم تحديث وتعديل بيانات (${forceFormData.name}) بنجاح`);
      }
    } else {
      // Add new person
      const newMember = {
        ...forceFormData,
        id: Date.now()
      };
      const updated = [newMember, ...forceMembers];
      if (setForceMembers) setForceMembers(updated);
      try {
        localStorage.setItem('ubari_force_members', JSON.stringify(updated));
      } catch (e) {}

      // Sync with API
      fetch('/api/force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      }).catch(() => {});

      if (setNotificationMsg) {
        setNotificationMsg(`تم حفظ وتوثيق بيانات (${forceFormData.name}) بنجاح في القوة العمومية`);
      }
    }

    setShowForceForm(false);
    setEditingMemberId(null);
    setForceFormData(EMPTY_FORCE_FORM);
    if (setNotificationMsg) {
      setTimeout(() => setNotificationMsg(''), 4500);
    }
  };

  const handleDeleteMember = (id, name) => {
    if (confirm(`هل أنت متأكد من حذف قيد (${name}) نهائياً من القوة العمومية؟`)) {
      const updated = forceMembers.filter((m) => m.id !== id);
      if (setForceMembers) setForceMembers(updated);
      try {
        localStorage.setItem('ubari_force_members', JSON.stringify(updated));
      } catch (e) {}

      fetch(`/api/force/${id}`, { method: 'DELETE' }).catch(() => {});

      if (setNotificationMsg) {
        setNotificationMsg(`تم حذف قيد (${name}) بنجاح`);
        setTimeout(() => setNotificationMsg(''), 4000);
      }
    }
  };

  // Disciplinary penalties fast lookup map
  const [indictmentTarget, setIndictmentTarget] = useState(null);
  const penalizedMembersMap = useMemo(() => {
    let list = initialPenalties;
    try {
      const saved = localStorage.getItem('ubari_penalties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      }
    } catch (e) {}

    const map = new Map();
    list.forEach(p => {
      if (p.NationalNumber && p.NationalNumber !== '---') {
        map.set(String(p.NationalNumber).trim(), p);
      }
      if (p.MilitaryNumber && p.MilitaryNumber !== '---') {
        map.set(String(p.MilitaryNumber).trim(), p);
      }
      if (p.JobNumber && p.JobNumber !== '---') {
        map.set(String(p.JobNumber).trim(), p);
      }
      if (p.FullName) {
        map.set(normalizeArabicText(p.FullName), p);
      }
    });
    return map;
  }, []);

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    const term = forceSearchTerm.trim().toLowerCase();
    const list = forceMembers.filter((m) => {
      const matchesType = typeFilter === 'الكل' || m.type === typeFilter;
      if (!matchesType) return false;

      if (statusFilter === 'معاقبين') {
        const isPenalized =
          penalizedMembersMap.has(String(m.national_id || '').trim()) ||
          penalizedMembersMap.has(String(m.military_number || '').trim()) ||
          penalizedMembersMap.has(String(m.financial_number || m.job_number || '').trim()) ||
          penalizedMembersMap.has(normalizeArabicText(m.name || ''));
        if (!isPenalized) return false;
      } else {
        const rawSt = (m.job_status || m.status || 'على رأس العمل').trim();
        const matchesStatus =
          statusFilter === 'الكل' ||
          (statusFilter === 'على رأس العمل' && !rawSt.includes('إجازة') && !rawSt.includes('موقوف') && !rawSt.includes('إيقاف') && !rawSt.includes('معلق')) ||
          (statusFilter === 'إجازة' && rawSt.includes('إجازة')) ||
          (statusFilter === 'موقوف' && (rawSt.includes('موقوف') || rawSt.includes('إيقاف') || rawSt.includes('معلق'))) ||
          rawSt === statusFilter;

        if (!matchesStatus) return false;
      }

      if (!term) return true;
      return (
        (m.name && m.name.toLowerCase().includes(term)) ||
        (m.financial_number && String(m.financial_number).includes(term)) ||
        (m.job_number && String(m.job_number).toLowerCase().includes(term)) ||
        (m.national_id && String(m.national_id).includes(term)) ||
        (m.phone && String(m.phone).includes(term)) ||
        (m.mother_name && m.mother_name.toLowerCase().includes(term)) ||
        (m.wife_name && m.wife_name.toLowerCase().includes(term)) ||
        (m.residence && m.residence.toLowerCase().includes(term)) ||
        (m.tribe_city && m.tribe_city.toLowerCase().includes(term)) ||
        (m.bank_name && m.bank_name.toLowerCase().includes(term)) ||
        (m.account_number && String(m.account_number).includes(term)) ||
        (m.appointment_decision && m.appointment_decision.toLowerCase().includes(term)) ||
        (m.job_title && m.job_title.toLowerCase().includes(term)) ||
        (m.department && m.department.toLowerCase().includes(term)) ||
        (m.job_status && m.job_status.toLowerCase().includes(term))
      );
    });

    return list.sort((a, b) => {
      const scoreA = getMilitaryRankScore(a.rank || a.job_title, a.type);
      const scoreB = getMilitaryRankScore(b.rank || b.job_title, b.type);

      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }

      const nameA = a.name ? String(a.name).trim() : '';
      const nameB = b.name ? String(b.name).trim() : '';
      return nameA.localeCompare(nameB, 'ar-LY', { sensitivity: 'base' });
    });
  }, [forceMembers, forceSearchTerm, typeFilter, statusFilter, penalizedMembersMap]);

  // Live Status Stats across all members
  const statusStats = useMemo(() => {
    let onDuty = 0, onLeave = 0, onSuspended = 0, penalizedCount = 0;
    forceMembers.forEach(m => {
      const st = (m.job_status || m.status || 'على رأس العمل').trim();
      if (st.includes('إجازة')) onLeave++;
      else if (st.includes('موقوف') || st.includes('إيقاف') || st.includes('معلق')) onSuspended++;
      else onDuty++;

      const isPenalized =
        penalizedMembersMap.has(String(m.national_id || '').trim()) ||
        penalizedMembersMap.has(String(m.military_number || '').trim()) ||
        penalizedMembersMap.has(String(m.financial_number || m.job_number || '').trim()) ||
        penalizedMembersMap.has(normalizeArabicText(m.name || ''));
      if (isPenalized) penalizedCount++;
    });
    return { onDuty, onLeave, onSuspended, penalizedCount };
  }, [forceMembers, penalizedMembersMap]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMembers.slice(start, start + rowsPerPage);
  }, [filteredMembers, currentPage, rowsPerPage]);

  const policeTotal = forceMembers.filter(m => m.type === 'شرطي').length;
  const civilTotal = forceMembers.filter(m => m.type === 'مدني').length;

  // Fully sorted list of all force members (by military rank score, then alphabetically)
  const sortedAllMembers = useMemo(() => {
    const list = [...forceMembers];
    return list.sort((a, b) => {
      const scoreA = getMilitaryRankScore(a.rank || a.job_title, a.type);
      const scoreB = getMilitaryRankScore(b.rank || b.job_title, b.type);

      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }

      const nameA = a.name ? String(a.name).trim() : '';
      const nameB = b.name ? String(b.name).trim() : '';
      return nameA.localeCompare(nameB, 'ar-LY', { sensitivity: 'base' });
    });
  }, [forceMembers]);

  const getArabicDayName = (date = new Date()) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  const getArabicDateString = (date = new Date()) => {
    const day = date.getDate();
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}م`;
  };

  const getRosterStats = (list) => {
    let total = list.length;
    let officers = 0;
    let ncos = 0;
    let civilians = 0;
    let onDuty = 0;
    let onLeave = 0;
    let suspended = 0;

    list.forEach(m => {
      const s = getMilitaryRankScore(m.rank || m.job_title, m.type);
      const isCiv = (m.type && String(m.type).includes('مدني')) || s === 1000;
      if (isCiv) {
        civilians++;
      } else if (s >= 1 && s <= 8) {
        officers++;
      } else {
        ncos++;
      }

      const st = (m.job_status || m.status || 'على رأس العمل').trim();
      if (st.includes('إجازة')) onLeave++;
      else if (st.includes('موقوف') || st.includes('إيقاف') || st.includes('معلق')) suspended++;
      else onDuty++;
    });

    return { total, officers, ncos, civilians, onDuty, onLeave, suspended };
  };

  // Handle Export to Excel/CSV with Arabic UTF-8 BOM
  const handleExportExcel = (targetList = null) => {
    try {
      const listToExport = Array.isArray(targetList) ? targetList : filteredMembers;
      const headers = ['ت', 'الاسم', 'الرقم الوطني', 'الرتبة', 'الرقم الوظيفي', 'جهة العمل'];
      const rows = listToExport.map((m, idx) => [
        `"${idx + 1}"`,
        `"${m.name || ''}"`,
        `"${m.national_id || ''}"`,
        `"${m.rank || m.job_title || (m.type === 'مدني' ? 'مدني' : 'شرطي')}"`,
        `"${m.job_number || m.financial_number || ''}"`,
        `"${m.department || 'مديرية أمن أوباري'}"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `كشف_القوة_العمومية_مديرية_أمن_أوباري_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تصدير الملف');
    }
  };

  const handlePrintForceRoster = (scope = rosterScope) => {
    const targetList = scope === 'filtered' ? filteredMembers : sortedAllMembers;
    const dayName = getArabicDayName();
    const fullArabicDate = getArabicDateString();
    const stats = getRosterStats(targetList);

    const html = `
      <div class="printable-force-roster printable-roster-container" style="font-family: 'Cairo', 'Amiri', -apple-system, sans-serif; direction: rtl; padding: 6px 12px; color: #0a192f; width: 100%; box-sizing: border-box; background: #ffffff;">
        <style>
          @page {
            size: A4 landscape;
            margin: 6mm 8mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .printable-roster-container {
              padding: 0 !important;
              width: 100% !important;
            }
            table {
              page-break-inside: auto !important;
              break-inside: auto !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            thead {
              display: table-header-group !important;
            }
            tfoot {
              display: table-footer-group !important;
            }
          }
        </style>

        <!-- Sovereign Header Block (Attached to Table) -->
        <div class="roster-sovereign-header" style="page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: avoid !important; break-after: avoid !important; margin-bottom: 4px;">
          <!-- الشريط الرسمي بألوان العلم الليبي -->
          <div style="height: 4px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 6px;">
            <div style="flex: 1; background: #e11d48;"></div>
            <div style="flex: 2; background: #000000;"></div>
            <div style="flex: 1; background: #16a34a;"></div>
          </div>

          <!-- الترويسة السيادية الرسمية ثلاثية الأعمدة -->
          <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 6px;">
            <tr>
              <td style="text-align: right; vertical-align: middle; width: 32%;">
                <div style="font-size: 14px; font-weight: 900; color: #1e3a8a; line-height: 1.2;">دولة ليبيــــا</div>
                <div style="font-size: 13px; font-weight: 800; color: #0a192f; line-height: 1.2;">وزارة الداخليـــــة</div>
                <div style="font-size: 12px; font-weight: 800; color: #0369a1; line-height: 1.2;">مديرية أمن أوبــــاري</div>
                <div style="font-size: 10px; font-weight: 700; color: #475569;">قسم شؤون الضباط والأفراد • الشؤون الإدارية والمالية</div>
              </td>
              <td style="text-align: center; vertical-align: middle; width: 36%;">
                <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 58px; height: 58px; object-fit: contain; margin: 0 auto 2px; display: block;" />
                <div style="display: inline-block; background: linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%); color: #ffffff; padding: 3px 16px; border-radius: 6px; font-size: 13.5px; font-weight: 900; letter-spacing: 0.5px; border: 1px solid #d4af37;">
                  كشف القوة العمومية المعتمد
                </div>
                <div style="font-size: 10px; font-weight: 800; color: #b45309; margin-top: 2px;">
                  قاعدة البيانات الرسمية لقوة منتسبي مديرية أمن أوباري
                </div>
              </td>
              <td style="text-align: left; direction: rtl; vertical-align: middle; width: 32%;">
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 10px; display: inline-block; min-width: 200px;">
                  <div style="font-size: 11.5px; font-weight: 800; color: #0a192f; margin-bottom: 2px;">
                    <span style="color: #1e3a8a; font-weight: 900;">اليوم:</span> ${dayName}
                  </div>
                  <div style="font-size: 11px; font-weight: 800; color: #0a192f; margin-bottom: 2px;">
                    <span style="color: #1e3a8a; font-weight: 900;">التاريخ:</span> ${fullArabicDate}
                  </div>
                  <div style="font-size: 10px; font-weight: 700; color: #475569;">
                    <span style="color: #1e3a8a; font-weight: 800;">إجمالي القوة بالكشف:</span> <span style="color: #0284c7; font-weight: 900; font-size: 11.5px;">${targetList.length.toLocaleString('ar-LY')}</span> عضواً
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- شريط الإحصائيات الموجز -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; background: #f1f5f9; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 10px;">
            <tr>
              <td style="padding: 3px 6px; text-align: center; border-left: 1px solid #cbd5e1;">
                <span style="color: #475569; font-weight: 700;">إجمالي القوة:</span>
                <strong style="color: #0a192f; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.total}</strong>
              </td>
              <td style="padding: 3px 6px; text-align: center; border-left: 1px solid #cbd5e1;">
                <span style="color: #475569; font-weight: 700;">الضباط:</span>
                <strong style="color: #1e3a8a; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.officers}</strong>
              </td>
              <td style="padding: 3px 6px; text-align: center; border-left: 1px solid #cbd5e1;">
                <span style="color: #475569; font-weight: 700;">ضباط الصف والأفراد:</span>
                <strong style="color: #0369a1; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.ncos}</strong>
              </td>
              <td style="padding: 3px 6px; text-align: center; border-left: 1px solid #cbd5e1;">
                <span style="color: #475569; font-weight: 700;">الموظفون المدنيون:</span>
                <strong style="color: #7c3aed; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.civilians}</strong>
              </td>
              <td style="padding: 3px 6px; text-align: center;">
                <span style="color: #475569; font-weight: 700;">على رأس العمل:</span>
                <strong style="color: #16a34a; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.onDuty}</strong>
              </td>
            </tr>
          </table>
        </div>

        <!-- جدول القوة العمومية المعتمد لجميع العناصر -->
        <table class="roster-data-table" style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: right; border: 1.5px solid #0a192f; margin-bottom: 12px; page-break-before: avoid !important; break-before: avoid !important; page-break-inside: auto !important; break-inside: auto !important;">
          <thead>
            <tr style="background: #0a192f; color: #ffffff;">
              <th style="padding: 7px 4px; border: 1px solid #475569; width: 35px; text-align: center; font-weight: 800;">ت</th>
              <th style="padding: 7px 10px; border: 1px solid #475569; font-weight: 800;">الاسم</th>
              <th style="padding: 7px 8px; border: 1px solid #475569; width: 140px; text-align: center; font-weight: 800;">الرقم الوطني</th>
              <th style="padding: 7px 8px; border: 1px solid #475569; width: 125px; text-align: center; font-weight: 800;">الرتبة</th>
              <th style="padding: 7px 8px; border: 1px solid #475569; width: 110px; text-align: center; font-weight: 800;">الرقم الوظيفي</th>
              <th style="padding: 7px 10px; border: 1px solid #475569; width: 200px; font-weight: 800;">جهة العمل</th>
            </tr>
          </thead>
          <tbody>
            ${targetList.map((m, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; page-break-inside: avoid; break-inside: avoid;">
                <td style="padding: 5px 3px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #475569;">${idx + 1}</td>
                <td style="padding: 5px 10px; border: 1px solid #cbd5e1; font-weight: 800; color: #0a192f; white-space: nowrap;">${m.name}</td>
                <td style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; color: #1e293b; font-weight: 700; font-size: 11px;">${m.national_id || '---'}</td>
                <td style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800; color: #1e3a8a;">${m.rank || m.job_title || (m.type === 'مدني' ? 'مدني' : 'شرطي')}</td>
                <td style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; color: #0284c7; font-weight: 800; font-size: 11px;">${m.job_number || m.financial_number || '---'}</td>
                <td style="padding: 5px 10px; border: 1px solid #cbd5e1; color: #334155; font-weight: 600;">${m.department || 'مديرية أمن أوباري'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- مربعات التوقيعات والختم المعتمد -->
        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 14px; page-break-inside: avoid; break-inside: avoid;">
          <tr>
            <td style="width: 28%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 11.5px; color: #1e3a8a; margin-bottom: 34px;">مسؤول شؤون القوة والتحريات</div>
              <div style="font-weight: 800; font-size: 10.5px; border-top: 1.5px dashed #64748b; padding-top: 4px; color: #0a192f;">نقيب / علي محمد البشير</div>
            </td>
            <td style="width: 24%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 11.5px; color: #1e3a8a; margin-bottom: 34px;">رئيس قسم الشؤون الإدارية والمالية</div>
              <div style="font-weight: 800; font-size: 10.5px; border-top: 1.5px dashed #64748b; padding-top: 4px; color: #0a192f;">عقيد / إبراهيم عبدالسلام</div>
            </td>
            <td style="width: 20%; vertical-align: middle;">
              <div style="width: 72px; height: 72px; border-radius: 50%; border: 2px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5px; font-weight: 800; color: #1e3a8a; margin: 0 auto; line-height: 1.3; background: rgba(30,58,138,0.03);">
                <span>وزارة الداخلية</span>
                <span style="font-size: 8px; color: #0a192f; font-weight: 900;">مديرية أمن أوباري</span>
                <span style="color: #dc2626; font-size: 7px; font-weight: 900;">الختم الرسمي</span>
              </div>
            </td>
            <td style="width: 28%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 11.5px; color: #1e3a8a; margin-bottom: 34px;">يعتمد مدير أمن أوباري</div>
              <div style="font-weight: 800; font-size: 10.5px; border-top: 1.5px dashed #64748b; padding-top: 4px; color: #1e3a8a;">لواء / موسى سعد البدين</div>
            </td>
          </tr>
        </table>

        <!-- تذييل الوثيقة الرسمية المعتمدة -->
        <div style="border-top: 1px solid #cbd5e1; margin-top: 12px; padding-top: 5px; display: flex; justify-content: space-between; font-size: 8.5px; color: #64748b; font-weight: 600;">
          <div>وثيقة أمنية رسمية معتمدة صادرة عن منظومة مديرية أمن أوباري المركزية - وزارة الداخلية - دولة ليبيا</div>
          <div>تاريخ الاستخراج: ${dayName} ${fullArabicDate} | عدد السجلات المقيدة: ${targetList.length}</div>
        </div>
      </div>
    `;

    const scopeTitle = scope === 'filtered' ? 'المفلترة' : 'العمومية_الكاملة';
    printDocumentInIframe(html, `كشف_القوة_${scopeTitle}_مديرية_أمن_أوباري`);
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="module-view-header">
        <div className="module-title-box">
          <div className="title-gold-bar" />
          <div>
            <h1>إدارة القوة العمومية</h1>
            <span>مديرية أمن أوباري</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-toolbar-import"
            onClick={onTriggerImport}
            disabled={isImporting}
            title="استيراد وإضافة أفراد جدد إلى القوة العمومية الحالية (تضاف السجلات الجديدة فوق القديمة دون حذف)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: isImporting ? 'wait' : 'pointer',
              boxShadow: '0 2px 10px rgba(2,132,199,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <UploadCloud size={16} />
            <span>{isImporting ? 'جاري قراءة الملف...' : 'استيراد وإضافة أفراد للقوة'}</span>
          </button>

          <button
            type="button"
            className="btn-toolbar-excel"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير إكسل</span>
          </button>

          <button
            type="button"
            className="btn-toolbar-print"
            onClick={() => setShowRosterModal(true)}
          >
            <Printer size={16} />
            <span>طباعة القوة العمومية</span>
          </button>

          {onOpenInquiry && (
            <button
              type="button"
              onClick={onOpenInquiry}
              title="بوابة استعلام وتحديث بيانات المنتسبين واستكمال الحقول الفارغة"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
                color: '#d4af37',
                border: '1.5px solid #d4af37',
                padding: '9px 15px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(10,25,47,0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Search size={15} />
              <span>استعلام المنتسبين (خدمة ذاتية)</span>
            </button>
          )}

          {onSyncForce && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              title="مزامنة فورية وتحديث بيانات القوة مع السيرفر المركزي"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                background: isSyncing ? '#f1f5f9' : '#f0fdf4',
                color: isSyncing ? '#64748b' : '#166534',
                border: '1.5px solid #86efac',
                padding: '9px 15px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(22, 101, 52, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw size={15} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة السيرفر المركزي'}</span>
            </button>
          )}

          <button
            type="button"
            className={`btn-official-primary ${showForceForm ? 'is-open' : ''}`}
            onClick={showForceForm ? () => setShowForceForm(false) : handleOpenAdd}
          >
            <span className="btn-icon-wrapper">
              {showForceForm ? <X size={15} strokeWidth={2.6} /> : <Plus size={15} strokeWidth={2.6} />}
            </span>
            <span>{showForceForm ? 'إغلاق النموذج' : 'إضافة موظف جديد'}</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontWeight: 700,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Statistics summary */}
      <div className="stats-summary-grid">
        <div className="stat-box-card" onClick={() => { setTypeFilter('الكل'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
          <div className="stat-box-icon"><Users size={22} /></div>
          <div className="stat-box-content">
            <h3>{forceMembers.length.toLocaleString('ar-LY')}</h3>
            <p>إجمالي القوة المقيدة</p>
          </div>
        </div>

        <div className="stat-box-card" onClick={() => { setTypeFilter('شرطي'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
          <div className="stat-box-icon" style={{ background: '#eff6ff', color: '#1e3a8a' }}>
            <Shield size={22} />
          </div>
          <div className="stat-box-content">
            <h3>{policeTotal.toLocaleString('ar-LY')}</h3>
            <p>أفراد وضباط الشرطة</p>
          </div>
        </div>

        <div className="stat-box-card" onClick={() => { setTypeFilter('مدني'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
          <div className="stat-box-icon" style={{ background: '#f8fafc', color: '#475569' }}>
            <Users size={22} />
          </div>
          <div className="stat-box-content">
            <h3>{civilTotal.toLocaleString('ar-LY')}</h3>
            <p>الموظفين المدنيين</p>
          </div>
        </div>

        <div className="stat-box-card">
          <div className="stat-box-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-box-content">
            <h3>100%</h3>
            <p>حالة التوثيق بقاعدة البيانات</p>
          </div>
        </div>
      </div>

      {/* Form Section: ALL fields unified strictly under "البيانات الشخصية والتعريفية" */}
      {showForceForm && (
        <div className="force-form-card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            borderBottom: '1px solid #edf2f7',
            paddingBottom: '12px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0a192f' }}>
              {editingMemberId ? `تعديل وتحديث بيانات: ${forceFormData.name}` : 'إضافة قيد موظف / منتسب جديد بالقوة العمومية'}
            </h3>
            <button
              type="button"
              onClick={() => setShowForceForm(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveMember}>
            {/* Top Radio Bar: شرطي vs مدني strictly */}
            <div className="type-radio-bar">
              <label className="type-radio-item">
                <input
                  type="radio"
                  name="person_type"
                  checked={forceFormData.type === 'شرطي'}
                  onChange={() => setForceFormData({ ...forceFormData, type: 'شرطي' })}
                />
                <span>شرطي</span>
              </label>

              <label className="type-radio-item">
                <input
                  type="radio"
                  name="person_type"
                  checked={forceFormData.type === 'مدني'}
                  onChange={() => setForceFormData({ ...forceFormData, type: 'مدني' })}
                />
                <span>مدني</span>
              </label>
            </div>

            {/* All fields grouped under "البيانات الشخصية والتعريفية" */}
            <div className="box-personal-data">
              <div className="box-title-personal">
                <Users size={18} />
                <span>البيانات الشخصية والتعريفية</span>
              </div>

              {/* Row 1 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>الاسم الكامل</label>
                  <ForceNameAutocomplete
                    value={forceFormData.name}
                    onChange={(val) => setForceFormData({ ...forceFormData, name: val })}
                    onSelect={(member) => {
                      setForceFormData({
                        ...forceFormData,
                        ...member,
                        name: member.name,
                        job_number: member.job_number || member.financial_number || '',
                        national_id: member.national_id || '',
                        birth_date: member.birth_date || '',
                        birth_place: member.birth_place || 'أوباري',
                        mother_name: member.mother_name || '',
                        marital_status: member.marital_status || 'متزوج',
                        wife_name: member.wife_name || '',
                        children_count: member.children_count || '0',
                        tribe_city: member.tribe_city || 'أوباري',
                        residence: member.residence || 'أوباري',
                        phone: member.phone || '',
                        languages: member.languages || 'العربية',
                        education_level: member.education_level || 'مؤهل مدني',
                        type: member.type || 'مدني',
                        department: member.department || '',
                        job_title: member.job_title || '',
                        job_status: member.job_status || 'على رأس العمل',
                        financial_number: member.financial_number || member.job_number || '',
                        basic_salary: member.basic_salary || '',
                        bank_name: member.bank_name || '',
                        bank_branch: member.bank_branch || '',
                        account_number: member.account_number || '',
                        family_book: member.family_book || '',
                        family_paper: member.family_paper || '',
                        family_record: member.family_record || '',
                        passport_number: member.passport_number || '',
                        suit_number: member.suit_number || '',
                        shoe_size: member.shoe_size || '42',
                        headwear_size: member.headwear_size || '58',
                        shirt_size: member.shirt_size || 'L',
                        blood_type: member.blood_type || 'O+',
                        diseases: member.diseases || 'سليم ولائق صحياً',
                        height: member.height || '175',
                        weight: member.weight || '75',
                        start_date: member.start_date || '',
                        appointment_decision: member.appointment_decision || '',
                        appointment_date: member.appointment_date || '',
                        last_promotion_decision: member.last_promotion_decision || '',
                        last_promotion_date: member.last_promotion_date || ''
                      });
                    }}
                    forceMembers={forceMembers}
                    placeholder="اكتب أول حرف لعرض الأسماء المطابقة..."
                    required
                  />
                </div>

                <div className="input-field-group">
                  <label>الرقم الوظيفي</label>
                  <input
                    type="text"
                    placeholder="رقم الموظف..."
                    value={forceFormData.job_number}
                    onChange={(e) => setForceFormData({ ...forceFormData, job_number: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>الرقم الوطني / الإداري (10-12 رقم)</label>
                  <input
                    type="text"
                    placeholder="119..."
                    value={forceFormData.national_id}
                    onChange={(e) => setForceFormData({ ...forceFormData, national_id: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>تاريخ الميلاد (يوم/شهر/سنة)</label>
                  <input
                    type="date"
                    value={forceFormData.birth_date}
                    onChange={(e) => setForceFormData({ ...forceFormData, birth_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>مكان الميلاد</label>
                  <input
                    type="text"
                    placeholder="المدينة / المنطقة..."
                    value={forceFormData.birth_place}
                    onChange={(e) => setForceFormData({ ...forceFormData, birth_place: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>اسم الأم</label>
                  <input
                    type="text"
                    placeholder="اسم الأم ثلاثياً..."
                    value={forceFormData.mother_name}
                    onChange={(e) => setForceFormData({ ...forceFormData, mother_name: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>الحالة الاجتماعية</label>
                  <select
                    value={forceFormData.marital_status}
                    onChange={(e) => setForceFormData({ ...forceFormData, marital_status: e.target.value })}
                  >
                    <option value="أعزب">أعزب</option>
                    <option value="متزوج">متزوج</option>
                    <option value="مطلق">مطلق</option>
                    <option value="أرمل">أرمل</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label>اسم الزوجة</label>
                  <input
                    type="text"
                    placeholder="اسم الزوجة..."
                    value={forceFormData.wife_name}
                    onChange={(e) => setForceFormData({ ...forceFormData, wife_name: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>عدد الأبناء</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={forceFormData.children_count}
                    onChange={(e) => setForceFormData({ ...forceFormData, children_count: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>القبيلة / المدينة</label>
                  <input
                    type="text"
                    placeholder="القبيلة أو المدينة..."
                    value={forceFormData.tribe_city}
                    onChange={(e) => setForceFormData({ ...forceFormData, tribe_city: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>الإقامة</label>
                  <input
                    type="text"
                    placeholder="عنوان السكن الحالي..."
                    value={forceFormData.residence}
                    onChange={(e) => setForceFormData({ ...forceFormData, residence: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="091-..."
                    value={forceFormData.phone}
                    onChange={(e) => setForceFormData({ ...forceFormData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>اللغة التي يجيدها</label>
                  <input
                    type="text"
                    placeholder="العربية، التارقية..."
                    value={forceFormData.languages}
                    onChange={(e) => setForceFormData({ ...forceFormData, languages: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>المستوى الدراسي (المؤهل)</label>
                  <input
                    type="text"
                    placeholder="المؤهل العلمي والتخصص..."
                    value={forceFormData.education_level}
                    onChange={(e) => setForceFormData({ ...forceFormData, education_level: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>رقم كتيب العائلة</label>
                  <input
                    type="text"
                    placeholder="رقم كتيب العائلة..."
                    value={forceFormData.family_book}
                    onChange={(e) => setForceFormData({ ...forceFormData, family_book: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>رقم ورقة العائلة</label>
                  <input
                    type="text"
                    placeholder="رقم ورقة العائلة..."
                    value={forceFormData.family_paper}
                    onChange={(e) => setForceFormData({ ...forceFormData, family_paper: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>رقم قيد العائلة</label>
                  <input
                    type="text"
                    placeholder="رقم قيد العائلة..."
                    value={forceFormData.family_record}
                    onChange={(e) => setForceFormData({ ...forceFormData, family_record: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>رقم الجواز</label>
                  <input
                    type="text"
                    placeholder="P..."
                    value={forceFormData.passport_number}
                    onChange={(e) => setForceFormData({ ...forceFormData, passport_number: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>رقم البدلة</label>
                  <input
                    type="text"
                    placeholder="MOI-..."
                    value={forceFormData.suit_number}
                    onChange={(e) => setForceFormData({ ...forceFormData, suit_number: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>رقم الحذاء</label>
                  <input
                    type="text"
                    placeholder="42..."
                    value={forceFormData.shoe_size}
                    onChange={(e) => setForceFormData({ ...forceFormData, shoe_size: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 6 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>رقم غطاء الرأس</label>
                  <input
                    type="text"
                    placeholder="58..."
                    value={forceFormData.headwear_size}
                    onChange={(e) => setForceFormData({ ...forceFormData, headwear_size: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>رقم القميص</label>
                  <input
                    type="text"
                    placeholder="L, XL..."
                    value={forceFormData.shirt_size}
                    onChange={(e) => setForceFormData({ ...forceFormData, shirt_size: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>فصيلة الدم / البطاقة الضمانية</label>
                  <select
                    value={forceFormData.blood_type}
                    onChange={(e) => setForceFormData({ ...forceFormData, blood_type: e.target.value })}
                  >
                    <option value="O+">O+ (موجب)</option>
                    <option value="O-">O- (سالب)</option>
                    <option value="A+">A+ (موجب)</option>
                    <option value="A-">A- (سالب)</option>
                    <option value="B+">B+ (موجب)</option>
                    <option value="B-">B- (سالب)</option>
                    <option value="AB+">AB+ (موجب)</option>
                    <option value="AB-">AB- (سالب)</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label>الأمراض (إن وجدت)</label>
                  <input
                    type="text"
                    placeholder="سليم، أو حدد إن وجد..."
                    value={forceFormData.diseases}
                    onChange={(e) => setForceFormData({ ...forceFormData, diseases: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 7 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>الطول (سم)</label>
                  <input
                    type="number"
                    placeholder="175"
                    value={forceFormData.height}
                    onChange={(e) => setForceFormData({ ...forceFormData, height: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>الوزن (كجم)</label>
                  <input
                    type="number"
                    placeholder="75"
                    value={forceFormData.weight}
                    onChange={(e) => setForceFormData({ ...forceFormData, weight: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>اختر القسم</label>
                  <select
                    value={forceFormData.department}
                    onChange={(e) => setForceFormData({ ...forceFormData, department: e.target.value })}
                  >
                    <option value="ديوان مديرية أمن أوباري">ديوان مديرية أمن أوباري</option>
                    <option value="مركز شرطة أوباري المدينة">مركز شرطة أوباري المدينة</option>
                    <option value="قسم البحث الجنائي أوباري">قسم البحث الجنائي أوباري</option>
                    <option value="وحدة النجدة والدوريات">وحدة النجدة والدوريات</option>
                    <option value="قسم المرور والتراخيص">قسم المرور والتراخيص</option>
                    <option value="غرفة العمليات والاتصالات">غرفة العمليات والاتصالات</option>
                    <option value="الأمن الوقائي والدوريات">الأمن الوقائي والدوريات</option>
                    <option value="ورشة الصيانة والآليات">ورشة الصيانة والآليات</option>
                    <option value="إدارة المحروقات والتموين">إدارة المحروقات والتموين</option>
                    <option value="المخازن والعهد العسكرية">المخازن والعهد العسكرية</option>
                    <option value="الشؤون الإدارية والمالية">الشؤون الإدارية والمالية</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label>اختر الوظيفة / الرتبة</label>
                  <input
                    type="text"
                    placeholder="المسمى الوظيفي أو الرتبة..."
                    value={forceFormData.job_title}
                    onChange={(e) => setForceFormData({ ...forceFormData, job_title: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 8 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>الوضع الوظيفي...</label>
                  <select
                    value={forceFormData.job_status}
                    onChange={(e) => setForceFormData({ ...forceFormData, job_status: e.target.value })}
                  >
                    <option value="على رأس العمل">على رأس العمل</option>
                    <option value="إجازة رسمية">إجازة رسمية</option>
                    <option value="موقوف مؤقتاً">موقوف مؤقتاً</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label>تاريخ المباشرة (يوم/شهر/سنة)</label>
                  <input
                    type="date"
                    value={forceFormData.start_date}
                    onChange={(e) => setForceFormData({ ...forceFormData, start_date: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>قرار التعيين</label>
                  <input
                    type="text"
                    placeholder="رقم وتاريخ قرار التعيين..."
                    value={forceFormData.appointment_decision}
                    onChange={(e) => setForceFormData({ ...forceFormData, appointment_decision: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>تاريخ التعيين (يوم/شهر/سنة)</label>
                  <input
                    type="date"
                    value={forceFormData.appointment_date}
                    onChange={(e) => setForceFormData({ ...forceFormData, appointment_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 9 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>قرار آخر ترقية</label>
                  <input
                    type="text"
                    placeholder="رقم وتفاصيل قرار آخر ترقية..."
                    value={forceFormData.last_promotion_decision}
                    onChange={(e) => setForceFormData({ ...forceFormData, last_promotion_decision: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>تاريخ آخر ترقية (يوم/شهر/سنة)</label>
                  <input
                    type="date"
                    value={forceFormData.last_promotion_date}
                    onChange={(e) => setForceFormData({ ...forceFormData, last_promotion_date: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>الرقم المالي</label>
                  <input
                    type="text"
                    placeholder="الرقم المالي..."
                    value={forceFormData.financial_number}
                    onChange={(e) => setForceFormData({ ...forceFormData, financial_number: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>المرتب الأساسي</label>
                  <input
                    type="text"
                    placeholder="دينار ليبي..."
                    value={forceFormData.basic_salary}
                    onChange={(e) => setForceFormData({ ...forceFormData, basic_salary: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 10 */}
              <div className="grid-4-cols">
                <div className="input-field-group">
                  <label>اسم المصرف</label>
                  <input
                    type="text"
                    placeholder="الصحاري، الجمهورية، التجاري..."
                    value={forceFormData.bank_name}
                    onChange={(e) => setForceFormData({ ...forceFormData, bank_name: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>الفرع المصرفي</label>
                  <input
                    type="text"
                    placeholder="فرع أوباري..."
                    value={forceFormData.bank_branch}
                    onChange={(e) => setForceFormData({ ...forceFormData, bank_branch: e.target.value })}
                  />
                </div>

                <div className="input-field-group">
                  <label>رقم الحساب المصرفي</label>
                  <input
                    type="text"
                    placeholder="رقم الحساب المصرفي الكامل..."
                    value={forceFormData.account_number}
                    onChange={(e) => setForceFormData({ ...forceFormData, account_number: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Button (Save) */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', marginTop: '16px' }}>
              <button type="submit" className="btn-toolbar-save">
                <Save size={18} />
                <span>{editingMemberId ? 'تحديث وتعديل بيانات الموظف' : 'حفظ بيانات الموظف'}</span>
              </button>

              <button
                type="button"
                className="btn-official-secondary"
                onClick={() => {
                  setShowForceForm(false);
                  setEditingMemberId(null);
                }}
              >
                <span>إلغاء</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Toolbar Below Form - Keep only Print and Export */}
      <div className="table-panel-card">
        <div className="toolbar-actions-row">
          <button
            type="button"
            className="btn-toolbar-excel"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير إكسل</span>
          </button>

          <button
            type="button"
            className="btn-toolbar-print"
            onClick={() => setShowRosterModal(true)}
          >
            <Printer size={16} />
            <span>طباعة القوة العمومية</span>
          </button>

          {onOpenInquiry && (
            <button
              type="button"
              onClick={onOpenInquiry}
              title="بوابة استعلام وتحديث بيانات المنتسبين واستكمال الحقول الفارغة"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
                color: '#d4af37',
                border: '1.5px solid #d4af37',
                padding: '9px 15px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(10,25,47,0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Search size={15} />
              <span>استعلام المنتسبين (خدمة ذاتية)</span>
            </button>
          )}

          {onSyncForce && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              title="مزامنة فورية وتحديث بيانات القوة مع السيرفر المركزي"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                background: isSyncing ? '#f1f5f9' : '#f0fdf4',
                color: isSyncing ? '#64748b' : '#166534',
                border: '1.5px solid #86efac',
                padding: '9px 15px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(22, 101, 52, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw size={15} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة السيرفر المركزي'}</span>
            </button>
          )}
        </div>

        {/* Quick Search Bar + Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginTop: '20px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <div className="table-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="...بحث سريع بالاسم أو الرقم الوطني أو الرتبة أو الرقم الوظيفي أو جهة العمل"
              value={forceSearchTerm}
              onChange={(e) => {
                setForceSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Type Filter Buttons + Status Filter Dropdown */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`filter-pill-btn ${typeFilter === 'الكل' ? 'active' : ''}`}
                onClick={() => { setTypeFilter('الكل'); setCurrentPage(1); }}
              >
                الكل ({forceMembers.length})
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${typeFilter === 'شرطي' ? 'active' : ''}`}
                onClick={() => { setTypeFilter('شرطي'); setCurrentPage(1); }}
              >
                شرطة ({policeTotal})
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${typeFilter === 'مدني' ? 'active' : ''}`}
                onClick={() => { setTypeFilter('مدني'); setCurrentPage(1); }}
              >
                مدني ({civilTotal})
              </button>
            </div>

            {/* Live Status Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 800,
                  background: statusFilter === 'الكل' ? '#f8fafc' : '#eff6ff',
                  color: statusFilter === 'الكل' ? '#334155' : '#1e40af',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                title="فرز القوة حسب الوضع الوظيفي الفعلي"
              >
                <option value="الكل">الوضع الوظيفي: الكل ({forceMembers.length})</option>
                <option value="على رأس العمل">🟢 على رأس العمل ({statusStats.onDuty})</option>
                <option value="إجازة">🟡 إجازات رسمية ({statusStats.onLeave})</option>
                <option value="موقوف">🔴 موقوف مؤقتاً ({statusStats.onSuspended})</option>
                <option value="معاقبين">⚖️ مطلوبين للتحقيق / معاقبين تأديبياً ({statusStats.penalizedCount})</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#166534',
              fontWeight: 700
            }}>
              <ShieldCheck size={14} color="#16a34a" />
              <span>الترتيب: حسب الرتبة الشرطية (لواء ← شرطي) والمدنيين أبجدياً</span>
            </div>

            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
              المطابق: {filteredMembers.length.toLocaleString('ar-LY')} قيد (الصفحة {currentPage} من {totalPages})
            </div>
          </div>
        </div>

        {/* Personnel Table with Edit & Delete actions */}
        <div style={{ overflowX: 'auto' }}>
          <table className="official-data-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الرقم الوطني</th>
                <th>الرتبة</th>
                <th>الرقم الوظيفي</th>
                <th>جهة العمل</th>
                <th>الوضع الوظيفي</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((m) => (
                <tr
                  key={m.id}
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  onClick={(e) => {
                    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
                      onOpenPreview && onOpenPreview(m);
                    }
                  }}
                  title="اضغط على الصف لعرض الملف الشامل وبطاقة المنتسب"
                >
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(() => {
                        const rowPhoto = m.photo || localStorage.getItem(`ubari_officer_photo_${m.id}`);
                        return rowPhoto ? (
                          <img
                            src={rowPhoto}
                            alt={m.name}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #d4af37',
                              flexShrink: 0
                            }}
                          />
                        ) : (
                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: m.type === 'شرطي' ? '#1e3a8a' : '#64748b',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 800,
                            flexShrink: 0
                          }}
                        >
                          {m.name ? m.name.trim().charAt(0) : 'ش'}
                        </span>
                      );
                    })()}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{m.name}</span>
                          {(m.self_updated || m.self_updated_at || m.mother_name || m.phone || m.bank_name) && (
                            <span
                              style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                padding: '1px 6px',
                                borderRadius: '10px',
                                fontSize: '10px',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              title="قام المنتسب باستكمال وتحديث بياناته ذاتياً بنجاح"
                            >
                              ✓ تم استكمال وتحديث البيانات
                            </span>
                          )}
                          {(() => {
                            const penalty =
                              penalizedMembersMap.get(String(m.national_id || '').trim()) ||
                              penalizedMembersMap.get(String(m.military_number || '').trim()) ||
                              penalizedMembersMap.get(String(m.financial_number || m.job_number || '').trim()) ||
                              penalizedMembersMap.get(normalizeArabicText(m.name || ''));
                            return penalty ? (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIndictmentTarget({ member: m, penalty });
                                }}
                                style={{
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  border: '1px solid #fca5a5',
                                  padding: '1px 7px',
                                  borderRadius: '10px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  cursor: 'pointer'
                                }}
                                title={`عقوبة مسجلة: ${penalty.PenaltyType} - ${penalty.Reason || ''} (${penalty.PenaltyDate}) - انقر لفتح صحيفة الاتهام`}
                              >
                                ⚖️ {penalty.PenaltyType}
                                {penalty.DeductionDays > 0 ? ` (${penalty.DeductionDays} أيام)` : ''}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        {(m.phone || m.mother_name || m.residence) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                            {m.phone && (
                              <span style={{ color: '#0284c7', direction: 'ltr', fontWeight: 700 }}>
                                📞 {m.phone}
                              </span>
                            )}
                            {m.mother_name && (
                              <span style={{ color: '#475569' }}>
                                الأم: {m.mother_name}
                              </span>
                            )}
                            {m.residence && (
                              <span style={{ color: '#64748b' }}>
                                📍 {m.residence}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
                    {m.national_id || '-'}
                  </td>
                  <td style={{ fontWeight: 800, color: '#1e3a8a' }}>
                    {m.rank || m.job_title || (m.type === 'مدني' ? 'مدني' : 'شرطي')}
                  </td>
                  <td style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                    {m.job_number || m.financial_number || '-'}
                  </td>
                  <td style={{ fontWeight: 600, color: '#334155' }}>
                    {m.department || 'مديرية أمن أوباري'}
                  </td>
                  <td>
                    <select
                      value={m.job_status || 'على رأس العمل'}
                      onChange={(e) => handleQuickStatusChange(m.id, e.target.value)}
                      style={{
                        cursor: 'pointer',
                        border: '1px solid rgba(0,0,0,0.08)',
                        outline: 'none',
                        fontWeight: 800,
                        fontSize: '11px',
                        borderRadius: '20px',
                        padding: '4px 8px',
                        textAlign: 'center',
                        fontFamily: 'inherit',
                        background:
                          (!m.job_status || m.job_status === 'على رأس العمل') ? '#dcfce7' :
                          m.job_status.includes('إجازة') ? '#fef3c7' :
                          m.job_status.includes('موقوف') || m.job_status.includes('إيقاف') ? '#fee2e2' : '#dcfce7',
                        color:
                          (!m.job_status || m.job_status === 'على رأس العمل') ? '#15803d' :
                          m.job_status.includes('إجازة') ? '#b45309' :
                          m.job_status.includes('موقوف') || m.job_status.includes('إيقاف') ? '#b91c1c' : '#15803d'
                      }}
                      title="الوضع الوظيفي: اضغط لتغيير الحالة وتفعيلها مباشرة"
                    >
                      <option value="على رأس العمل">🟢 على رأس العمل</option>
                      <option value="إجازة رسمية">🟡 إجازة رسمية</option>
                      <option value="موقوف مؤقتاً">🔴 موقوف مؤقتاً</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onOpenPreview && onOpenPreview(m)}
                        style={{
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 4px rgba(2,132,199,0.3)',
                          transition: 'all 0.15s ease'
                        }}
                        title="معاينة الملف الشامل للمنتسب"
                      >
                        <Eye size={13} />
                        <span>معاينة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(m)}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1e3a8a',
                          cursor: 'pointer',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          transition: 'all 0.15s ease'
                        }}
                        title="تعديل وتحديث بيانات الشخص"
                      >
                        <Edit size={13} color="#2563eb" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMember(m.id, m.name)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '5px 7px',
                          borderRadius: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        title="حذف القيد"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedMembers.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '34px', color: '#64748b' }}>
                    لا توجد نتائج مطابقة للبحث
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
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #edf2f7'
          }}>
            <button
              type="button"
              className="btn-official-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, padding: '6px 12px' }}
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
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, padding: '6px 12px' }}
            >
              <span>التالي</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Certified General Force Roster Modal (كشف القوة العمومية المعتمد) */}
      {showRosterModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10600,
            padding: '16px'
          }}
          onClick={() => setShowRosterModal(false)}
        >
          <div
            style={{
              maxWidth: '1320px',
              width: '98%',
              maxHeight: '94vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
              background: '#ffffff',
              border: '1.5px solid #d4af37'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 4-Color Libyan Ribbon */}
            <div style={{ height: '6px', width: '100%', display: 'flex' }}>
              <div style={{ flex: 1, background: '#e11d48' }} />
              <div style={{ flex: 2, background: '#000000' }} />
              <div style={{ flex: 1, background: '#16a34a' }} />
            </div>

            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
              color: '#ffffff',
              padding: '14px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #d4af37'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={MOI_LOGO_BASE64}
                  alt="شعار وزارة الداخلية"
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>كشف القوة العمومية المعتمد</span>
                    <span style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                      color: '#d4af37',
                      border: '1px solid #d4af37',
                      padding: '2px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 800
                    }}>
                      السجل العام المعتمد
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '2px' }}>
                    مديرية أمن أوباري • قسم شؤون الضباط والأفراد • وزارة الداخلية - دولة ليبيا
                  </div>
                </div>
              </div>

              {/* Day & Date Banner */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                padding: '6px 16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fef08a' }}>
                  اليوم: {getArabicDayName()}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                  الموافق: {getArabicDateString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRosterModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                title="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scope Selector & Toolbar Actions */}
            <div style={{
              background: '#f8fafc',
              padding: '12px 22px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Scope Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>نطاق الكشف المطلوب:</span>
                <button
                  type="button"
                  onClick={() => setRosterScope('all')}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: rosterScope === 'all' ? '2px solid #1e3a8a' : '1px solid #cbd5e1',
                    background: rosterScope === 'all' ? '#1e3a8a' : '#ffffff',
                    color: rosterScope === 'all' ? '#ffffff' : '#334155',
                    transition: 'all 0.2s',
                    boxShadow: rosterScope === 'all' ? '0 2px 6px rgba(30, 58, 138, 0.3)' : 'none'
                  }}
                >
                  كامل القوة العمومية ({sortedAllMembers.length.toLocaleString('ar-LY')} منتسباً)
                </button>
                <button
                  type="button"
                  onClick={() => setRosterScope('filtered')}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: rosterScope === 'filtered' ? '2px solid #1e3a8a' : '1px solid #cbd5e1',
                    background: rosterScope === 'filtered' ? '#1e3a8a' : '#ffffff',
                    color: rosterScope === 'filtered' ? '#ffffff' : '#334155',
                    transition: 'all 0.2s',
                    boxShadow: rosterScope === 'filtered' ? '0 2px 6px rgba(30, 58, 138, 0.3)' : 'none'
                  }}
                >
                  النتائج المفلترة بالبحث ({filteredMembers.length.toLocaleString('ar-LY')} منتسباً)
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const target = rosterScope === 'filtered' ? filteredMembers : sortedAllMembers;
                    handleExportExcel(target);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    color: '#059669',
                    border: '1.5px solid #059669',
                    padding: '7px 16px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <FileSpreadsheet size={16} />
                  <span>تصدير Excel (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintForceRoster(rosterScope)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)',
                    color: '#ffffff',
                    border: '1px solid #d4af37',
                    padding: '7px 20px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
                  }}
                >
                  <Printer size={18} />
                  <span>طباعة الكشف الرسمي الكامل (A4 أفقي)</span>
                </button>
              </div>
            </div>

            {/* Summary Statistics Bar */}
            {(() => {
              const currentList = rosterScope === 'filtered' ? filteredMembers : sortedAllMembers;
              const currentStats = getRosterStats(currentList);
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '8px',
                  padding: '10px 22px',
                  background: '#ffffff',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '6px 12px' }}>
                    <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 700 }}>إجمالي القوة بالكشف</div>
                    <div style={{ fontSize: '17px', color: '#1e3a8a', fontWeight: 900 }}>{currentStats.total.toLocaleString('ar-LY')} <span style={{ fontSize: '11px' }}>عضواً</span></div>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 12px' }}>
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>الضباط</div>
                    <div style={{ fontSize: '17px', color: '#15803d', fontWeight: 900 }}>{currentStats.officers.toLocaleString('ar-LY')} <span style={{ fontSize: '11px' }}>ضابطاً</span></div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px' }}>
                    <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>ضباط الصف والأفراد</div>
                    <div style={{ fontSize: '17px', color: '#0369a1', fontWeight: 900 }}>{currentStats.ncos.toLocaleString('ar-LY')} <span style={{ fontSize: '11px' }}>فرداً</span></div>
                  </div>
                  <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '6px 12px' }}>
                    <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 700 }}>الموظفون المدنيون</div>
                    <div style={{ fontSize: '17px', color: '#7c3aed', fontWeight: 900 }}>{currentStats.civilians.toLocaleString('ar-LY')} <span style={{ fontSize: '11px' }}>موظفاً</span></div>
                  </div>
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '6px 12px' }}>
                    <div style={{ fontSize: '11px', color: '#065f46', fontWeight: 700 }}>على رأس العمل</div>
                    <div style={{ fontSize: '17px', color: '#059669', fontWeight: 900 }}>{currentStats.onDuty.toLocaleString('ar-LY')} <span style={{ fontSize: '11px' }}>مباشراً</span></div>
                  </div>
                </div>
              );
            })()}

            {/* Modal Table Body (Scrollable Live Roster Preview) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px', background: '#f8fafc' }}>
              {/* Quick Search inside Modal */}
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  flex: 1,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Search size={16} style={{ position: 'absolute', right: '12px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="تصفية سريعة داخل الكشف بالاسم أو الرقم الوطني أو الرتبة أو الرقم الوظيفي أو جهة العمل..."
                    value={rosterModalSearch}
                    onChange={(e) => setRosterModalSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 36px 8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'Cairo, sans-serif'
                    }}
                  />
                </div>
                {rosterModalSearch && (
                  <button
                    type="button"
                    onClick={() => setRosterModalSearch('')}
                    style={{
                      padding: '6px 12px',
                      background: '#e2e8f0',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    مسح البحث
                  </button>
                )}
              </div>

              {/* The Live Manifest Table */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr style={{ background: '#0a192f', color: '#ffffff' }}>
                        <th style={{ padding: '9px 6px', borderBottom: '2px solid #d4af37', width: '45px', textAlign: 'center' }}>ت</th>
                        <th style={{ padding: '9px 12px', borderBottom: '2px solid #d4af37' }}>الاسم</th>
                        <th style={{ padding: '9px 10px', borderBottom: '2px solid #d4af37', textAlign: 'center', width: '140px' }}>الرقم الوطني</th>
                        <th style={{ padding: '9px 10px', borderBottom: '2px solid #d4af37', textAlign: 'center', width: '130px' }}>الرتبة</th>
                        <th style={{ padding: '9px 10px', borderBottom: '2px solid #d4af37', textAlign: 'center', width: '120px' }}>الرقم الوظيفي</th>
                        <th style={{ padding: '9px 12px', borderBottom: '2px solid #d4af37' }}>جهة العمل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const baseList = rosterScope === 'filtered' ? filteredMembers : sortedAllMembers;
                        const displayList = rosterModalSearch.trim()
                          ? baseList.filter(m => {
                              const term = rosterModalSearch.toLowerCase();
                              return (
                                (m.name && m.name.toLowerCase().includes(term)) ||
                                (m.national_id && String(m.national_id).includes(term)) ||
                                (m.rank && m.rank.toLowerCase().includes(term)) ||
                                (m.job_title && m.job_title.toLowerCase().includes(term)) ||
                                (m.job_number && String(m.job_number).toLowerCase().includes(term)) ||
                                (m.financial_number && String(m.financial_number).includes(term)) ||
                                (m.department && m.department.toLowerCase().includes(term))
                              );
                            })
                          : baseList;

                        return displayList.map((m, idx) => (
                          <tr
                            key={m.id || idx}
                            style={{
                              background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                              borderBottom: '1px solid #f1f5f9'
                            }}
                          >
                            <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 800, color: '#64748b' }}>{idx + 1}</td>
                            <td style={{ padding: '7px 12px', fontWeight: 800, color: '#0a192f' }}>{m.name}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'monospace', color: '#1e293b', fontWeight: 700 }}>{m.national_id || '---'}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 800, color: '#1e3a8a' }}>{m.rank || m.job_title || (m.type === 'مدني' ? 'مدني' : 'شرطي')}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'monospace', color: '#0284c7', fontWeight: 800 }}>{m.job_number || m.financial_number || '---'}</td>
                            <td style={{ padding: '7px 12px', color: '#334155', fontWeight: 600 }}>{m.department || 'مديرية أمن أوباري'}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              background: '#ffffff',
              padding: '12px 22px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                كشف رسمي معتمد • اليوم: {getArabicDayName()} • التاريخ: {getArabicDateString()} • مديرية أمن أوباري
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRosterModal(false)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#e2e8f0',
                    color: '#334155',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintForceRoster(rosterScope)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 22px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)',
                    color: '#ffffff',
                    border: '1px solid #d4af37',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
                  }}
                >
                  <Printer size={16} />
                  <span>طباعة الكشف الرسمي الكامل (A4 أفقي)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indictment Sheet Modal */}
      {indictmentTarget && (
        <IndictmentSheetModal
          member={indictmentTarget.member}
          penalty={indictmentTarget.penalty}
          onClose={() => setIndictmentTarget(null)}
        />
      )}
    </div>
  );
}

