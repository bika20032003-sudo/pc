import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Shield,
  CheckCircle2,
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
  Printer,
  Plus,
  X,
  Save,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import ForceNameAutocomplete from './ForceNameAutocomplete';
import { printDocumentInIframe } from '../utils/printHelper';

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
  clearExternalEditingMember
}) {
  const [showForceForm, setShowForceForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [forceFormData, setForceFormData] = useState(EMPTY_FORCE_FORM);
  const [forceSearchTerm, setForceSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('الكل'); // 'الكل', 'شرطي', 'مدني'
  const [statusFilter, setStatusFilter] = useState('الكل'); // 'الكل', 'على رأس العمل', 'إجازة', 'موقوف'
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

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

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    const term = forceSearchTerm.trim().toLowerCase();
    const list = forceMembers.filter((m) => {
      const matchesType = typeFilter === 'الكل' || m.type === typeFilter;
      if (!matchesType) return false;

      const rawSt = (m.job_status || m.status || 'على رأس العمل').trim();
      const matchesStatus =
        statusFilter === 'الكل' ||
        (statusFilter === 'على رأس العمل' && !rawSt.includes('إجازة') && !rawSt.includes('موقوف') && !rawSt.includes('إيقاف') && !rawSt.includes('معلق')) ||
        (statusFilter === 'إجازة' && rawSt.includes('إجازة')) ||
        (statusFilter === 'موقوف' && (rawSt.includes('موقوف') || rawSt.includes('إيقاف') || rawSt.includes('معلق'))) ||
        rawSt === statusFilter;

      if (!matchesStatus) return false;

      if (!term) return true;
      return (
        (m.name && m.name.toLowerCase().includes(term)) ||
        (m.financial_number && String(m.financial_number).includes(term)) ||
        (m.job_number && String(m.job_number).toLowerCase().includes(term)) ||
        (m.national_id && String(m.national_id).includes(term)) ||
        (m.bank_name && m.bank_name.toLowerCase().includes(term)) ||
        (m.account_number && String(m.account_number).includes(term)) ||
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
  }, [forceMembers, forceSearchTerm, typeFilter, statusFilter]);

  // Live Status Stats across all members
  const statusStats = useMemo(() => {
    let onDuty = 0, onLeave = 0, onSuspended = 0;
    forceMembers.forEach(m => {
      const st = (m.job_status || m.status || 'على رأس العمل').trim();
      if (st.includes('إجازة')) onLeave++;
      else if (st.includes('موقوف') || st.includes('إيقاف') || st.includes('معلق')) onSuspended++;
      else onDuty++;
    });
    return { onDuty, onLeave, onSuspended };
  }, [forceMembers]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMembers.slice(start, start + rowsPerPage);
  }, [filteredMembers, currentPage, rowsPerPage]);

  const policeTotal = forceMembers.filter(m => m.type === 'شرطي').length;
  const civilTotal = forceMembers.filter(m => m.type === 'مدني').length;

  // Handle Export to Excel/CSV with Arabic UTF-8 BOM
  const handleExportExcel = () => {
    try {
      const headers = ['رقم الموظف / المالي', 'الاسم الكامل', 'النوع', 'الوظيفة / الرتبة', 'الرقم الوطني', 'اسم المصرف', 'رقم الحساب', 'الوضع الوظيفي'];
      const rows = filteredMembers.map(m => [
        `"${m.financial_number || m.job_number || ''}"`,
        `"${m.name || ''}"`,
        `"${m.type || ''}"`,
        `"${m.rank || ''}"`,
        `"${m.national_id || ''}"`,
        `"${m.bank_name || ''}"`,
        `"${m.account_number || ''}"`,
        `"${m.status || 'على رأس العمل'}"`
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

  const handlePrintForceRoster = () => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const printRows = filteredMembers.slice(0, 32);
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #0a192f;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px;">
          <div style="text-align: right;">
            <h3 style="margin: 0; font-size: 14px; font-weight: 800;">دولة ليبيا - وزارة الداخلية</h3>
            <h2 style="margin: 2px 0; font-size: 17px; font-weight: 900; color: #1e3a8a;">مديرية أمن أوباري</h2>
            <h4 style="margin: 0; font-size: 12px; color: #475569;">قسم شؤون الضباط والأفراد | السجل العام للقوة العمومية</h4>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 20px; font-weight: 900; color: #1e3a8a;">كشف القوة العمومية المعتمد</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">تاريخ الاستخراج: ${today}</div>
          </div>
          <div style="text-align: left; font-size: 12px;">
            <div><strong>عدد السجلات:</strong> ${filteredMembers.length} عضو</div>
            <div><strong>القسم:</strong> كافة الأقسام</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 35px; text-align: center;">ت</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الاسم الرباعي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 90px;">الرقم المالي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 85px;">الرتبة</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">التبعية / جهة العمل</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 100px;">المصرف</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 85px; text-align: center;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${printRows.map((m, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${m.name}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.financial_number || m.job_number || '---'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.job_title || m.rank || 'شرطي'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.department || '---'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.bank_name || '---'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #15803d;">${m.job_status || m.status || 'على رأس العمل'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 35px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 13px;">مسؤول شؤون القوة</div>
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
    printDocumentInIframe(html, 'كشف_القوة_العمومية_أوباري');
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="module-view-header">
        <div className="module-title-box">
          <div className="title-gold-bar" />
          <div>
            <h1>إدارة القوة العمومية</h1>
            <span>مديرية أمن أوباري | قاعدة البيانات المركزية المعتمدة (قوة 2222)</span>
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
            onClick={handlePrintForceRoster}
          >
            <Printer size={16} />
            <span>طباعة القوة العمومية</span>
          </button>

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
            <p>إجمالي القوة المقيدة (قوة 2222)</p>
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
                        account_number: member.account_number || ''
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
            onClick={() => window.print()}
          >
            <Printer size={16} />
            <span>طباعة القوة العمومية</span>
          </button>
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
              placeholder="...بحث سريع باسم الموظف أو الرقم المالي أو الوطني أو المصرف"
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
              <span>الترتيب: حسب الرتبة العسكرية (لواء ← شرطي) والمدنيين أبجدياً</span>
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
                <th>رقم الموظف / المالي</th>
                <th>الاسم الكامل</th>
                <th>النوع</th>
                <th>الوظيفة / الرتبة</th>
                <th>الرقم الوطني</th>
                <th>اسم المصرف</th>
                <th>رقم الحساب</th>
                <th>الوضع الوظيفي</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 800, color: '#1e3a8a' }}>
                    {m.financial_number || m.job_number || '-'}
                  </td>
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
                    <span>{m.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: m.type === 'شرطي' ? '#eff6ff' : '#f8fafc',
                      color: m.type === 'شرطي' ? '#1e3a8a' : '#64748b',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}>
                      {m.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#1e293b' }}>{m.job_title || '-'}</td>
                  <td>{m.national_id || '-'}</td>
                  <td>{m.bank_name || '-'}</td>
                  <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 600 }}>
                    {m.account_number || '-'}
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
    </div>
  );
}

