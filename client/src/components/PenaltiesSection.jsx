import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Scale,
  Search,
  Plus,
  AlertCircle,
  Printer,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  FileText,
  CheckCircle2,
  X,
  ShieldAlert,
  Award,
  DollarSign,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import initialPenalties from '../data/penalties_data.json';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import IndictmentSheetModal from './IndictmentSheetModal';
import { apiFetch } from '../utils/apiClient';

export default function PenaltiesSection({ forceMembers = [], user = {} }) {
  // State for penalties ledger
  const [penalties, setPenalties] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_penalties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Guarantee that all official initial penalties (including suspended "إيقاف عن العمل") are preserved
          const parsedIds = new Set(parsed.map(p => p.PenaltyID));
          const missingInitial = initialPenalties.filter(p => !parsedIds.has(p.PenaltyID));
          if (missingInitial.length > 0) {
            const merged = [...parsed, ...missingInitial];
            localStorage.setItem('ubari_penalties', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse ubari_penalties from storage', e);
    }
    return initialPenalties;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('جاهز');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalMemberSearch, setModalMemberSearch] = useState('');
  const [selectedPenaltyType, setSelectedPenaltyType] = useState('all');
  const [viewScope, setViewScope] = useState('all'); // Default: show all directorate penalties without a pinned person
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [indictmentModal, setIndictmentModal] = useState({ isOpen: false, member: null, penalty: null });

  // Open Indictment Sheet for specific penalty
  const handleOpenIndictment = (penalty) => {
    const member = forceMembers.find(m => 
      (penalty.NationalNumber && m.national_id === penalty.NationalNumber) ||
      (penalty.MilitaryNumber && m.military_number === penalty.MilitaryNumber) ||
      (penalty.FullName && normalizeArabicText(m.name) === normalizeArabicText(penalty.FullName))
    ) || selectedMember || { name: penalty.FullName, military_number: penalty.MilitaryNumber, national_id: penalty.NationalNumber };

    setIndictmentModal({ isOpen: true, member, penalty });
  };

  // Open Indictment Sheet for currently selected or target member
  const handleOpenIndictmentForMember = (member) => {
    if (!member) return;
    const memberPenalty = penalties.find(p => 
      (member.national_id && p.NationalNumber === member.national_id) ||
      (member.military_number && p.MilitaryNumber === member.military_number) ||
      normalizeArabicText(p.FullName) === normalizeArabicText(member.name)
    ) || null;

    setIndictmentModal({ isOpen: true, member, penalty: memberPenalty });
  };

  // Live API Fetching & Synchronization
  const fetchLivePenalties = async () => {
    try {
      setIsLoading(true);
      setSyncStatus('جارٍ المزامنة...');
      // 1. Try Node.js Express server
      let res = await apiFetch('/api/penalties').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.penalties || data?.data);
        if (Array.isArray(list) && list.length > 0) {
          setPenalties(list);
          localStorage.setItem('ubari_penalties', JSON.stringify(list));
          setSyncStatus('متزامن مع الخادم المركزي');
          return;
        }
      }

      // 2. Try PHP backend endpoint (cPanel / Hostinger / Apache)
      res = await apiFetch('api/get-penalties.php').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.penalties || data?.data);
        if (Array.isArray(list) && list.length > 0) {
          setPenalties(list);
          localStorage.setItem('ubari_penalties', JSON.stringify(list));
          setSyncStatus('متزامن عبر بوابة cPanel');
          return;
        }
      }

      // 3. Try Static JSON endpoint in public directory
      res = await fetch('api/data/penalties_data.json').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPenalties(data);
          localStorage.setItem('ubari_penalties', JSON.stringify(data));
          setSyncStatus('متزامن مع البيانات المعتمدة');
          return;
        }
      }

      setSyncStatus('قاعدة البيانات المحلية المعتمدة');
    } catch (err) {
      console.warn('Notice: loading live penalties failed, using local ledger:', err);
      setSyncStatus('قاعدة البيانات المحلية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePenalties();
  }, []);

  // New Penalty Form State
  const [penaltyForm, setPenaltyForm] = useState({
    penalty_type: 'لفت نظر (إنذار)',
    deduction_days: 0,
    penalty_date: new Date().toISOString().slice(0, 10),
    reason: '',
    decision_number: '2026/ق.ت/' + Math.floor(100 + Math.random() * 900),
    is_applied: false
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ubari_penalties', JSON.stringify(penalties));
    } catch (e) {
      console.error('Failed to save ubari_penalties', e);
    }
  }, [penalties]);

  // Ensure all official suspended/penalized cases from initial data are preserved
  useEffect(() => {
    setPenalties(prev => {
      const prevIds = new Set(prev.map(p => p.PenaltyID));
      const missing = initialPenalties.filter(p => !prevIds.has(p.PenaltyID));
      if (missing.length > 0) {
        const merged = [...prev, ...missing];
        try {
          localStorage.setItem('ubari_penalties', JSON.stringify(merged));
        } catch (e) {}
        return merged;
      }
      return prev;
    });
  }, []);

  // Manual reset & restore of official penalties and suspended members
  const handleRestoreOfficialPenalties = () => {
    const userAdded = penalties.filter(p => p.PenaltyID > 1000000 && !initialPenalties.some(init => init.PenaltyID === p.PenaltyID));
    const full = [...initialPenalties, ...userAdded];
    setPenalties(full);
    try {
      localStorage.setItem('ubari_penalties', JSON.stringify(full));
    } catch (e) {}
    alert('✅ تم استرجاع كافة الموقوفين عن العمل والقيود التأديبية الرسمية بنجاح.');
  };

  // Search autocomplete for picking member
  const searchedMembers = useMemo(() => {
    const q = normalizeArabicText(memberSearchTerm.trim());
    if (!q) return [];
    return forceMembers.filter(m => {
      const name = normalizeArabicText(m.name || '');
      const nat = (m.national_id || '').toString();
      const job = (m.job_number || m.financial_number || '').toString();
      return name.includes(q) || nat.includes(q) || job.includes(q);
    }).slice(0, 8);
  }, [forceMembers, memberSearchTerm]);

  // Search autocomplete for picking member inside modal
  const searchedModalMembers = useMemo(() => {
    const q = normalizeArabicText(modalMemberSearch.trim());
    if (!q) return [];
    return forceMembers.filter(m => {
      const name = normalizeArabicText(m.name || '');
      const nat = (m.national_id || '').toString();
      const job = (m.job_number || m.financial_number || '').toString();
      return name.includes(q) || nat.includes(q) || job.includes(q);
    }).slice(0, 6);
  }, [forceMembers, modalMemberSearch]);

  // Navigation handlers for next/prev member
  const handleNavigateMember = (direction) => {
    if (!forceMembers.length) return;
    const currentIndex = selectedMember ? forceMembers.findIndex(m => m.id === selectedMember.id) : 0;
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= forceMembers.length) newIndex = 0;
    if (newIndex < 0) newIndex = forceMembers.length - 1;
    setSelectedMember(forceMembers[newIndex]);
  };

  // Save New Penalty
  const handleSavePenalty = async (e) => {
    e.preventDefault();
    if (!selectedMember) {
      alert('يرجى تحديد المنتسب أولاً من شريط البحث أو القائمة');
      return;
    }
    if (!penaltyForm.reason.trim()) {
      alert('يرجى كتابة سبب وتفاصيل العقوبة أو المخالفة المنسوبة');
      return;
    }

    const newPenalty = {
      PenaltyID: Date.now(),
      FullName: selectedMember.name,
      AdminNumber: selectedMember.id || null,
      NationalNumber: selectedMember.national_id || selectedMember.id || '---',
      MilitaryNumber: selectedMember.military_number || null,
      JobNumber: selectedMember.financial_number || selectedMember.job_number || '---',
      EmployeeCategory: selectedMember.type || (selectedMember.rank?.includes('موظف') ? 'مدني' : 'نظامي'),
      PenaltyType: penaltyForm.penalty_type,
      Reason: penaltyForm.reason.trim(),
      PenaltyDate: penaltyForm.penalty_date,
      DeductionDays: penaltyForm.penalty_type === 'خصم مالي' ? Number(penaltyForm.deduction_days) : 0,
      DecisionNumber: penaltyForm.decision_number,
      IsApplied: Boolean(penaltyForm.is_applied),
      CreatedAt: new Date().toISOString()
    };

    // Optimistic UI update
    setPenalties(prev => [newPenalty, ...prev]);
    setIsAddModalOpen(false);
    setSelectedMember(null);
    setModalMemberSearch('');
    setViewScope('all');
    setPenaltyForm({
      penalty_type: 'لفت نظر (إنذار)',
      deduction_days: 0,
      penalty_date: new Date().toISOString().slice(0, 10),
      reason: '',
      decision_number: '2026/ق.ت/' + Math.floor(100 + Math.random() * 900),
      is_applied: false
    });

    // Sync to backend and PHP API using unified authenticated moi_token
    try {
      const res = await apiFetch('/api/penalties', {
        method: 'POST',
        body: JSON.stringify(newPenalty)
      }).catch(() => null);

      if (!res || !res.ok) {
        // Fallback to PHP script
        await apiFetch('api/penalties-update.php', {
          method: 'POST',
          body: JSON.stringify({ action: 'add', penalty: newPenalty })
        }).catch(err => console.warn('PHP sync notice:', err));
      }
    } catch (err) {
      console.warn('Network sync notice on save penalty:', err);
    }
  };

  // Toggle IsApplied
  const handleToggleApplied = async (id) => {
    setPenalties(prev => prev.map(p => {
      if (p.PenaltyID === id) {
        return { ...p, IsApplied: !p.IsApplied };
      }
      return p;
    }));

    try {
      const res = await apiFetch(`/api/penalties/${id}/toggle-applied`, {
        method: 'POST'
      }).catch(() => null);

      if (!res || !res.ok) {
        await apiFetch('api/penalties-update.php', {
          method: 'POST',
          body: JSON.stringify({ action: 'toggle_applied', penalty_id: id })
        }).catch(err => console.warn('PHP toggle notice:', err));
      }
    } catch (err) {
      console.warn('Network sync notice on toggle applied:', err);
    }
  };

  // Delete penalty
  const handleDeletePenalty = async (id) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا القيد من سجل العقوبات والانضباط؟')) {
      setPenalties(prev => prev.filter(p => p.PenaltyID !== id));

      try {
        const res = await apiFetch(`/api/penalties/${id}`, {
          method: 'DELETE'
        }).catch(() => null);

        if (!res || !res.ok) {
          await apiFetch('api/penalties-update.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', penalty_id: id })
          }).catch(err => console.warn('PHP delete notice:', err));
        }
      } catch (err) {
        console.warn('Network sync notice on delete penalty:', err);
      }
    }
  };

  // Filtered list based on viewScope, filterType, and tableSearchTerm
  const displayedPenalties = useMemo(() => {
    let list = penalties;

    // View scope: member vs all
    if (viewScope === 'member' && selectedMember) {
      const memberNorm = normalizeArabicText(selectedMember.name || '');
      list = list.filter(p => {
        const pNorm = normalizeArabicText(p.FullName || '');
        const pNat = (p.NationalNumber || '').toString();
        const selNat = (selectedMember.national_id || '').toString();
        return (memberNorm && pNorm.includes(memberNorm)) || (selNat && pNat === selNat);
      });
    }

    // Filter by Penalty Type
    if (selectedPenaltyType !== 'all') {
      list = list.filter(p => p.PenaltyType === selectedPenaltyType);
    }

    // Filter by table search term
    const q = normalizeArabicText(tableSearchTerm.trim());
    if (q) {
      list = list.filter(p => {
        const name = normalizeArabicText(p.FullName || '');
        const reason = normalizeArabicText(p.Reason || '');
        const job = (p.JobNumber || '').toString();
        const nat = (p.NationalNumber || '').toString();
        const type = normalizeArabicText(p.PenaltyType || '');
        return name.includes(q) || reason.includes(q) || job.includes(q) || nat.includes(q) || type.includes(q);
      });
    }

    return list;
  }, [penalties, viewScope, selectedMember, selectedPenaltyType, tableSearchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = penalties.length;
    const deductions = penalties.filter(p => p.PenaltyType === 'خصم مالي');
    const totalDeductionDays = deductions.reduce((acc, p) => acc + (Number(p.DeductionDays) || 0), 0);
    const warnings = penalties.filter(p => p.PenaltyType === 'لفت نظر (إنذار)' || p.PenaltyType?.includes('إنذار') || p.PenaltyType?.includes('توبيخ')).length;
    const suspensions = penalties.filter(p => p.PenaltyType === 'إيقاف عن العمل' || p.PenaltyType?.includes('مجلس')).length;
    const unitArrests = penalties.filter(p => p.PenaltyType === 'حجز بالوحدة' || p.PenaltyType === 'تأخير ترقية').length;
    const appliedCount = penalties.filter(p => p.IsApplied).length;

    return {
      total,
      deductionsCount: deductions.length,
      totalDeductionDays,
      warnings,
      suspensions,
      unitArrests,
      appliedCount
    };
  }, [penalties]);

  // Export to Excel
  const handleExportExcel = () => {
    if (displayedPenalties.length === 0) {
      alert('لا توجد بيانات لتصديرها');
      return;
    }

    const rows = displayedPenalties.map((p, idx) => ({
      'ت': idx + 1,
      'رقم القيد التأديبي': `MOI-UBR-DISC-${p.PenaltyID}`,
      'اسم المنتسب': p.FullName || '---',
      'الرقم المالي': p.JobNumber || '---',
      'الرقم الوطني': p.NationalNumber || '---',
      'الصفة الوظيفية': p.EmployeeCategory || 'نظامي',
      'نوع الجزاء التأديبي': p.PenaltyType || '---',
      'أيام الخصم من المرتب': p.DeductionDays > 0 ? p.DeductionDays : 0,
      'تاريخ القرار': p.PenaltyDate || '---',
      'موجبات وأسباب العقوبة': p.Reason || '---',
      'حالة التنفيذ': p.IsApplied ? 'تم التنفيذ رسمياً' : 'قيد المتابعة والإحالة'
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل العقوبات والانضباط');
    XLSX.writeFile(wb, `سجل_العقوبات_والانضباط_مديرية_أمن_أوباري_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Print Disciplinary Decree (Individual Official Decision)
  const handlePrintPenaltyDecree = (penalty) => {
    const printHtml = `
      <div style="width: 100%; max-width: 720px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a; padding: 20px; border: 2px solid #1e3a8a; border-radius: 12px; background: #ffffff;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 6px; width: 100%; display: flex; border-radius: 3px; overflow: hidden; margin-bottom: 14px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 16px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">قسم التفتيش والمتابعة والانضباط</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 80px;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار الوزارة" style="width: 65px; height: 65px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">State of Libya • Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Disciplinary Affairs Division</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 18px;">
          <span style="display: inline-block; background: #fee2e2; border: 1.5px solid #f87171; color: #991b1b; padding: 4px 18px; border-radius: 20px; font-size: 11px; font-weight: 900; margin-bottom: 8px;">
            وثيقة ضبط تأديبي رسمية معتمدة
          </span>
          <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 900; color: #b91c1c;">
            قرار وإشعار توقيع جزاء انضباطي
          </h2>
          <div style="font-size: 11.5px; color: #475569; font-weight: 700; margin-top: 4px;">
            رقم القيد التأديبي المركزي: <span style="font-family: monospace; font-weight: 900; color: #1e3a8a;">MOI-UBR-DISC-${penalty.PenaltyID}</span>
          </div>
        </div>

        <!-- السند القانوني -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-right: 4px solid #1e3a8a; padding: 10px 14px; border-radius: 6px; font-size: 11.5px; margin-bottom: 16px; color: #334155; line-height: 1.6;">
          <strong>السند القانوني والإجرائي:</strong>
          بناءً على الصلاحيات القانونية المخولة لمدير أمن أوباري، واستناداً لأحكام <strong>القانون رقم (10) لسنة 1992 م</strong> بشأن إصدار قانون الشرطة واللوائح التأديبية المنظمة للعمل الأمني، وبناءً على ما أسفرت عنه نتائج التحقيق ومحضر ضبط المخالفات المرفوع من قسم التفتيش والمتابعة:
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; font-size: 12.5px; margin-bottom: 18px;">
          <tr style="background: #f1f5f9;">
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; width: 25%; font-weight: 700;">اسم المنتسب المعاقب:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #0f172a;">${penalty.FullName}</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; width: 25%; font-weight: 700;">الرقم المالي / الوظيفي:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace; color: #1e3a8a;">${penalty.JobNumber || '---'}</td>
          </tr>
          <tr>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 700;">الرقم الوطني:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace;">${penalty.NationalNumber || '---'}</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 700;">الصفة الوظيفية:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800;">${penalty.EmployeeCategory || 'نظامي'}</td>
          </tr>
          <tr style="background: #fef2f2;">
            <td style="padding: 9px 12px; border: 1px solid #fecaca; color: #991b1b; font-weight: 800;">نوع الجزاء التأديبي:</td>
            <td style="padding: 9px 12px; border: 1px solid #fecaca; font-weight: 900; color: #dc2626; font-size: 13.5px;">${penalty.PenaltyType}</td>
            <td style="padding: 9px 12px; border: 1px solid #fecaca; color: #991b1b; font-weight: 800;">تاريخ صدور القرار:</td>
            <td style="padding: 9px 12px; border: 1px solid #fecaca; font-weight: 800; color: #0f172a;">${new Date(penalty.PenaltyDate).toLocaleDateString('ar-LY')}</td>
          </tr>
          ${penalty.DeductionDays > 0 ? `
            <tr style="background: #fff1f2;">
              <td style="padding: 9px 12px; border: 1.5px solid #fda4af; color: #be123c; font-weight: 900;">الخصم المالي الإلزامي:</td>
              <td colspan="3" style="padding: 9px 12px; border: 1.5px solid #fda4af; font-weight: 900; color: #be123c; font-size: 13px;">
                ⚠️ خصم عدد (${penalty.DeductionDays}) أيام من المرتب الأساسي الشهري لحساب الخزانة العامة للدولة.
              </td>
            </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 700; vertical-align: top;">موجبات وتفاصيل الاتهام:</td>
            <td colspan="3" style="padding: 10px 12px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; line-height: 1.7; text-align: justify;">
              ${penalty.Reason}
            </td>
          </tr>
        </table>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-right: 4px solid #dc2626; padding: 10px 14px; border-radius: 6px; font-size: 11px; margin-bottom: 24px; color: #334155; line-height: 1.6;">
          <strong>الإحالة والتنفيذ:</strong>
          تُحال نسخة رسمية من هذا القرار إلى قسم الشؤون المالية لتطبيق الخصم المستحق على المرتب فوراً، ونسخة إلى قسم الشؤون الإدارية لحفظها بالسجل الشخصي للمنتسب، مع إخطار المعني رسمياً بعدم تكرار المخالفة تفادياً لتشديد العقوبة وإحالته لمجلس التأديب الابتدائي المختص.
        </div>

      </div>
    `;

    printDocumentInIframe(printHtml, `قرار عقوبة - ${penalty.FullName}`);
  };

  // Print Comprehensive Disciplinary Ledger (All or filtered)
  const handlePrintComprehensiveLedger = () => {
    if (displayedPenalties.length === 0) {
      alert('لا توجد سجلات لطباعتها في العرض الحالي');
      return;
    }

    const rowsHtml = displayedPenalties.map((p, idx) => `
      <tr style="border-bottom: 1px solid #cbd5e1; font-size: 11px;">
        <td style="padding: 7px; text-align: center; font-weight: 700;">${idx + 1}</td>
        <td style="padding: 7px; font-weight: 800; color: #0f172a;">${p.FullName}</td>
        <td style="padding: 7px; text-align: center; font-family: monospace;">${p.JobNumber || '---'}</td>
        <td style="padding: 7px; text-align: center;">${p.PenaltyDate}</td>
        <td style="padding: 7px; text-align: center; font-weight: 800; color: #b91c1c;">${p.PenaltyType}</td>
        <td style="padding: 7px; text-align: center; font-weight: 800;">${p.DeductionDays > 0 ? p.DeductionDays + ' يوم' : '---'}</td>
        <td style="padding: 7px; line-height: 1.4; max-width: 280px;">${p.Reason}</td>
        <td style="padding: 7px; text-align: center; font-weight: 700;">${p.IsApplied ? 'منفذ' : 'قيد المتابعة'}</td>
      </tr>
    `).join('');

    const printHtml = `
      <div style="width: 100%; max-width: 900px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a; padding: 15px;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 6px; width: 100%; display: flex; border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 14px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 14px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">قسم التفتيش والمتابعة والانضباط</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 70px;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار الوزارة" style="width: 55px; height: 55px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ubari Security Directorate</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Disciplinary & Inspection Records</div>
              <div style="font-size: 9px; color: #64748b;">General Penalties Ledger</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #b91c1c;">
            كشف حصر العقوبات والجزاءات التأديبية المسجلة
          </h2>
          <div style="font-size: 11px; color: #64748b; font-weight: 700; margin-top: 3px;">
            تاريخ الطباعة: ${new Date().toLocaleDateString('ar-LY')} | إجمالي القيود المعروضة: ${displayedPenalties.length} قيد
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; margin-bottom: 20px;">
          <thead>
            <tr style="background: #1e3a8a; color: #ffffff; font-size: 11px;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">ت</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">اسم المنتسب</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الرقم المالي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">تاريخ القرار</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">نوع العقوبة</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">أيام الخصم</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">موجبات وتفاصيل العقوبة</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

      </div>
    `;

    printDocumentInIframe(printHtml, 'سجل العقوبات والانضباط - مديرية أمن أوباري');
  };

  return (
    <div className="penalties-section-container" style={{ padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div className="module-view-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(185, 28, 28, 0.3)' }}>
            <Scale size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>سجل العقوبات والانضباط وصحائف الاتهام</h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>التوثيق الرسمي للجزاءات التأديبية، الخصومات المالية، وقرارات مجالس التأديب بمديرية أمن أوباري</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={fetchLivePenalties}
            disabled={isLoading}
            title="إعادة تحميل ومزامنة العقوبات من الخادم المركزي"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
          >
            <span style={{ display: 'inline-block', transform: isLoading ? 'rotate(180deg)' : 'none', transition: 'all 0.4s' }}>🔄</span>
            <span>{syncStatus}</span>
          </button>

          <button
            onClick={handleExportExcel}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #059669', background: '#ecfdf5', color: '#059669', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer' }}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={handlePrintComprehensiveLedger}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #1e3a8a', background: '#eff6ff', color: '#1e3a8a', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer' }}
          >
            <Printer size={16} />
            <span>طباعة السجل</span>
          </button>

          <button
            type="button"
            onClick={handleRestoreOfficialPenalties}
            title="استرجاع كافة الموقوفين والقيود التأديبية الرسمية المعتمدة"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #dc2626', background: '#fef2f2', color: '#dc2626', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
          >
            <span>🔄</span>
            <span>استعادة الموقوفين والعقوبات</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#b91c1c', color: '#ffffff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(185, 28, 28, 0.25)' }}
          >
            <Plus size={16} />
            <span>تقييد عقوبة / اتهام جديد</span>
          </button>
        </div>
      </div>

      {/* Disciplinary Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>إجمالي القيود التأديبية</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a' }}>{stats.total} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>قيداً</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #fecaca', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 700 }}>خصومات مالية من المرتب</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#b91c1c' }}>{stats.deductionsCount} <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>({stats.totalDeductionDays} يوم خصم)</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #fde68a', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#78350f', fontWeight: 700 }}>إنذارات ولفت نظر رسمي</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#b45309' }}>{stats.warnings} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>إشعار</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>إيقافات ومجالس تأديب</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#334155' }}>{stats.suspensions} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>إجراء</span></div>
          </div>
        </div>
      </div>

      {/* Optional Member Search & Filter Bar */}
      <div style={{ background: '#ffffff', padding: '12px 18px', borderRadius: '12px', border: '1.5px solid #cbd5e1', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={memberSearchTerm}
            onChange={(e) => setMemberSearchTerm(e.target.value)}
            placeholder="🔍 تصفية عقوبات منتسب محدد بالاسم، الرقم الوطني، أو الرقم المالي (اختياري)..."
            style={{ width: '100%', padding: '9px 38px 9px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
          />

          {searchedMembers.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: '#ffffff', border: '1.5px solid #b91c1c', borderRadius: '10px', marginTop: '6px', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.18)', maxHeight: '240px', overflowY: 'auto' }}>
              {searchedMembers.map(m => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMember(m);
                    setMemberSearchTerm('');
                    setViewScope('member');
                  }}
                  style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '11px' }}>
                      {m.rank ? m.rank.slice(0, 2) : 'ش'}
                    </div>
                    <div>
                      <strong style={{ color: '#0f172a', fontSize: '12.5px' }}>{m.name}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', marginRight: '6px' }}>({m.rank || 'شرطي'})</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 800, display: 'block' }}>{m.department || 'مديرية أمن أوباري'}</span>
                    <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>ر.م: {m.financial_number || m.job_number || '---'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedMember && (
          <button
            onClick={() => {
              setSelectedMember(null);
              setViewScope('all');
              setMemberSearchTerm('');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #dc2626', background: '#fef2f2', color: '#dc2626', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
            title="إلغاء تصفية المنتسب والعودة لعرض كافة عقوبات المديرية"
          >
            <X size={15} />
            <span>إلغاء التحديد وعرض كافة العقوبات</span>
          </button>
        )}
      </div>

      {/* Selected Member Dossier Card (Displayed ONLY when a member is actively selected) */}
      {selectedMember && (
        <div style={{ background: '#ffffff', padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #cbd5e1', borderTop: '4px solid #b91c1c', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', flexWrap: 'wrap' }}>
          <div style={{ width: '62px', height: '78px', borderRadius: '6px', border: '1.5px solid #b91c1c', overflow: 'hidden', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {selectedMember.photo ? (
              <img src={selectedMember.photo} alt={selectedMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontSize: '24px' }}>👮</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{selectedMember.name}</h3>
              <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                {selectedMember.rank || 'شرطي'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '11.5px' }}>
              <div><span style={{ color: '#64748b' }}>الرقم المالي: </span><strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{selectedMember.financial_number || selectedMember.job_number || '---'}</strong></div>
              <div><span style={{ color: '#64748b' }}>الرقم الوطني: </span><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{selectedMember.national_id || '---'}</strong></div>
              <div><span style={{ color: '#64748b' }}>جهة التبعية: </span><strong>{selectedMember.department || 'مديرية أمن أوباري'}</strong></div>
              <div>
                <span style={{ color: '#64748b' }}>سجل الجزاءات: </span>
                {penalties.filter(p => p.FullName === selectedMember.name || p.NationalNumber === selectedMember.national_id).length > 0 ? (
                  <strong style={{ color: '#dc2626' }}>
                    {penalties.filter(p => p.FullName === selectedMember.name || p.NationalNumber === selectedMember.national_id).length} عقوبة مقيدة
                  </strong>
                ) : (
                  <strong style={{ color: '#16a34a' }}>نظيف (لا توجد قيود)</strong>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setViewScope(viewScope === 'member' ? 'all' : 'member');
              }}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #1e3a8a', background: viewScope === 'member' ? '#1e3a8a' : '#eff6ff', color: viewScope === 'member' ? '#ffffff' : '#1e3a8a', fontWeight: 800, fontSize: '11.5px', cursor: 'pointer' }}
            >
              {viewScope === 'member' ? 'عرض السجل العام' : 'تصفية هذا المنتسب'}
            </button>

            <button
              type="button"
              onClick={() => handleOpenIndictmentForMember(selectedMember)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #b91c1c', background: '#fef2f2', color: '#b91c1c', fontWeight: 900, fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="إصدار وطباعة صحيفة اتهام للحالات الموجزة لهذا المنتسب"
            >
              <FileText size={14} />
              <span>صحيفة اتهام</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{ padding: '8px 14px', borderRadius: '6px', background: '#b91c1c', color: '#ffffff', border: 'none', fontWeight: 800, fontSize: '11.5px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Plus size={14} />
              <span>تقييد عقوبة</span>
            </button>

            <button
              onClick={() => {
                setSelectedMember(null);
                setViewScope('all');
              }}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}
              title="إلغاء التحديد وإخفاء البطاقة"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar for Penalties Table */}
      <div style={{ background: '#ffffff', padding: '12px 18px', borderRadius: '12px', border: '1.5px solid #cbd5e1', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={15} /> تصفية حسب الجزاء:
          </span>
          {['all', 'لفت نظر (إنذار)', 'خصم مالي', 'حجز بالوحدة', 'إيقاف عن العمل', 'تأخير ترقية'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedPenaltyType(type)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: selectedPenaltyType === type ? '1.5px solid #b91c1c' : '1px solid #cbd5e1',
                background: selectedPenaltyType === type ? '#fee2e2' : '#f8fafc',
                color: selectedPenaltyType === type ? '#b91c1c' : '#475569',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {type === 'all' ? 'كافة الأنواع' : type}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={tableSearchTerm}
            onChange={(e) => setTableSearchTerm(e.target.value)}
            placeholder="بحث في الجدول (الاسم، التهمة...)"
            style={{ width: '100%', padding: '7px 32px 7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
          />
          {tableSearchTerm && (
            <button
              onClick={() => setTableSearchTerm('')}
              style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Penalties Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
              <th style={{ padding: '12px 14px' }}>اسم المنتسب</th>
              <th style={{ padding: '12px 14px' }}>الرقم المالي / الوطني</th>
              <th style={{ padding: '12px 14px' }}>تاريخ القرار</th>
              <th style={{ padding: '12px 14px' }}>نوع الجزاء التأديبي</th>
              <th style={{ padding: '12px 14px' }}>التهمة وموجبات العقوبة</th>
              <th style={{ padding: '12px 14px' }}>الخصم المالي</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>حالة التنفيذ</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>الطباعة والإجراء</th>
            </tr>
          </thead>
          <tbody>
            {displayedPenalties.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  <Scale size={36} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
                  {viewScope === 'member'
                    ? `لا توجد عقوبات مسجلة للمنتسب المحدد (${selectedMember?.name || ''})`
                    : 'لا توجد عقوبات مطابقة لمعايير البحث في السجل'}
                </td>
              </tr>
            ) : (
              displayedPenalties.map((pen) => (
                <tr key={pen.PenaltyID} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 900, color: '#0f172a' }}>
                    {pen.FullName}
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{pen.EmployeeCategory || 'نظامي'}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', fontFamily: 'monospace' }}>
                    <div style={{ color: '#0284c7', fontWeight: 800 }}>{pen.JobNumber || '---'}</div>
                    <div style={{ color: '#64748b' }}>{pen.NationalNumber || '---'}</div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', color: '#475569' }}>
                    {pen.PenaltyDate}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: pen.PenaltyType === 'خصم مالي' ? '#fee2e2' : (pen.PenaltyType === 'إيقاف عن العمل' ? '#fef2f2' : '#f1f5f9'),
                      color: pen.PenaltyType === 'خصم مالي' ? '#b91c1c' : (pen.PenaltyType === 'إيقاف عن العمل' ? '#991b1b' : '#334155'),
                      border: pen.PenaltyType === 'خصم مالي' ? '1px solid #fecaca' : '1px solid #cbd5e1'
                    }}>
                      {pen.PenaltyType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#334155', maxWidth: '340px', lineHeight: 1.5, fontSize: '12px' }}>
                    {pen.Reason}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 900, color: pen.DeductionDays > 0 ? '#dc2626' : '#64748b' }}>
                    {pen.DeductionDays > 0 ? `خصم ${pen.DeductionDays} أيام` : 'بدون خصم'}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleApplied(pen.PenaltyID)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: pen.IsApplied ? '#dcfce7' : '#fef3c7',
                        color: pen.IsApplied ? '#15803d' : '#b45309',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                      title="انقر لتغيير حالة التنفيذ المالي"
                    >
                      {pen.IsApplied ? '✅ تم التنفيذ' : '⏳ قيد المتابعة'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handlePrintPenaltyDecree(pen)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #b91c1c', background: '#fef2f2', color: '#b91c1c', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="طباعة قرار العقوبة الرسمي"
                      >
                        <Printer size={13} />
                        <span>قرار العقوبة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenIndictment(pen)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1.5px solid #b91c1c', background: '#ffffff', color: '#b91c1c', fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 1px 3px rgba(185,28,28,0.1)' }}
                        title="عرض وطباعة صحيفة الاتهام للحالات الموجزة"
                      >
                        <FileText size={13} />
                        <span>صحيفة اتهام</span>
                      </button>
                      <button
                        onClick={() => handleDeletePenalty(pen.PenaltyID)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                        title="حذف القيد التأديبي"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Penalty Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10500, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', borderTop: '6px solid #b91c1c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={20} />
                <span>تقييد عقوبة انضباطية رسمية</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedMember ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 900, color: '#991b1b', fontSize: '13.5px' }}>{selectedMember.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {selectedMember.rank || 'شرطي'} | الرقم المالي: {selectedMember.financial_number || selectedMember.job_number || '---'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#ffffff', border: '1px solid #f87171', color: '#b91c1c', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    {selectedMember.department || 'مديرية أمن أوباري'}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setSelectedMember(null); setModalMemberSearch(''); }}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '11px', fontWeight: 800 }}
                    title="تغيير المنتسب"
                  >
                    تغيير
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <label style={{ fontWeight: 800, color: '#1e3a8a', display: 'block', marginBottom: '6px', fontSize: '12px' }}>
                  اختر المنتسب المتهم من القوة العمومية:
                </label>
                <input
                  type="text"
                  placeholder="🔍 اكتب اسم المنتسب، الرقم الوطني، أو الرقم المالي..."
                  value={modalMemberSearch}
                  onChange={(e) => setModalMemberSearch(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #b91c1c', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
                {searchedModalMembers.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: '#ffffff', border: '1.5px solid #b91c1c', borderRadius: '8px', marginTop: '4px', zIndex: 11000, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', maxHeight: '180px', overflowY: 'auto' }}>
                    {searchedModalMembers.map(m => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMember(m);
                          setModalMemberSearch('');
                        }}
                        style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                      >
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{m.name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', marginRight: '6px' }}>({m.rank || 'شرطي'})</span>
                        </div>
                        <span style={{ fontSize: '10.5px', color: '#0284c7', fontFamily: 'monospace' }}>{m.financial_number || m.job_number || '---'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSavePenalty} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>نوع الجزاء التأديبي:</label>
                <select
                  value={penaltyForm.penalty_type}
                  onChange={(e) => setPenaltyForm({ ...penaltyForm, penalty_type: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                >
                  <option value="لفت نظر (إنذار)">لفت نظر (إنذار كتابي)</option>
                  <option value="خصم مالي">خصم مالي من المرتب</option>
                  <option value="حجز بالوحدة">حجز بالوحدة / الغرفة</option>
                  <option value="إيقاف عن العمل">إيقاف مؤقت عن العمل ومجلس تأديبي</option>
                  <option value="تأخير ترقية">تأخير أقدمية الترقية</option>
                  <option value="لوم وتوبيخ رسمي">لوم وتوبيخ رسمي</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>تاريخ صدور القرار:</label>
                <input
                  type="date"
                  required
                  value={penaltyForm.penalty_date}
                  onChange={(e) => setPenaltyForm({ ...penaltyForm, penalty_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              {penaltyForm.penalty_type === 'خصم مالي' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontWeight: 800, color: '#dc2626', display: 'block', marginBottom: '4px' }}>عدد أيام الخصم من المرتب الأساسي:</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={penaltyForm.deduction_days}
                    onChange={(e) => setPenaltyForm({ ...penaltyForm, deduction_days: e.target.value })}
                    placeholder="مثال: 3"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #dc2626', boxSizing: 'border-box', fontWeight: 900, color: '#dc2626' }}
                  />
                </div>
              )}

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>رقم القرار التأديبي الإداري:</label>
                <input
                  type="text"
                  value={penaltyForm.decision_number}
                  onChange={(e) => setPenaltyForm({ ...penaltyForm, decision_number: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontWeight: 800, fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>موجبات وأسباب الاتهام والعقوبة بالتفصيل:</label>
                <textarea
                  required
                  rows={4}
                  value={penaltyForm.reason}
                  onChange={(e) => setPenaltyForm({ ...penaltyForm, reason: e.target.value })}
                  placeholder="اكتب التهمة والمخالفة المنسوبة بدقة (مثال: الغياب بدون إذن رسمي، مخالفة التعليمات الأمنية، التقاعس عن أداء الواجب المكلف به، مخالفة أوامر الرئيس المباشر...)"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'none', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="penaltyIsApplied"
                  checked={penaltyForm.is_applied}
                  onChange={(e) => setPenaltyForm({ ...penaltyForm, is_applied: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="penaltyIsApplied" style={{ fontWeight: 800, color: '#334155', cursor: 'pointer' }}>
                  تم تنفيذ العقوبة إدارياً ومالياً وإحالتها للمرتبات والملف الشخصي
                </label>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#b91c1c', color: '#ffffff', border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(185, 28, 28, 0.25)' }}
                >
                  حفظ القرار التأديبي في السجل 💾
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '11px 20px', borderRadius: '8px', background: '#e2e8f0', color: '#334155', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Indictment Sheet Modal */}
      {indictmentModal.isOpen && (
        <IndictmentSheetModal
          member={indictmentModal.member}
          penalty={indictmentModal.penalty}
          onClose={() => setIndictmentModal({ isOpen: false, member: null, penalty: null })}
        />
      )}
    </div>
  );
}
