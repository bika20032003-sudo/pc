import React, { useState, useEffect, useMemo } from 'react';
import { Scale, Search, Plus, AlertCircle, Printer, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import initialPenalties from '../data/penalties_data.json';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';
import { createOfficialLetterHtml } from '../utils/officialLetterTemplate';

export default function PenaltiesSection({ forceMembers = [] }) {
  const [penalties, setPenalties] = useState(() => {
    const saved = localStorage.getItem('ubari_penalties');
    return saved ? JSON.parse(saved) : initialPenalties;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Penalty Form State
  const [penaltyForm, setPenaltyForm] = useState({
    penalty_type: 'لفت نظر (إنذار)',
    deduction_days: 0,
    penalty_date: new Date().toISOString().slice(0, 10),
    reason: '',
    decision_number: '2026/' + Math.floor(100 + Math.random() * 900)
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ubari_penalties', JSON.stringify(penalties));
  }, [penalties]);

  // Set default selected member
  useEffect(() => {
    if (!selectedMember && forceMembers.length > 0) {
      setSelectedMember(forceMembers[0]);
    }
  }, [forceMembers, selectedMember]);

  // Search autocomplete
  const searchedMembers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return forceMembers.filter(m => 
      (m.name && m.name.includes(searchTerm)) || 
      (m.national_id && m.national_id.includes(searchTerm)) ||
      (m.job_number && m.job_number.includes(searchTerm))
    ).slice(0, 8);
  }, [forceMembers, searchTerm]);

  // Navigation handlers
  const handleNavigateMember = (direction) => {
    if (!forceMembers.length) return;
    const currentIndex = selectedMember ? forceMembers.findIndex(m => m.id === selectedMember.id) : 0;
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= forceMembers.length) newIndex = 0;
    if (newIndex < 0) newIndex = forceMembers.length - 1;
    setSelectedMember(forceMembers[newIndex]);
  };

  const handleSavePenalty = (e) => {
    e.preventDefault();
    if (!selectedMember) {
      alert('يرجى تحديد المنتسب أولاً');
      return;
    }
    if (!penaltyForm.reason.trim()) {
      alert('يرجى كتابة سبب وتفاصيل العقوبة أو المخالفة');
      return;
    }

    const newPenalty = {
      PenaltyID: Date.now(),
      FullName: selectedMember.name,
      NationalNumber: selectedMember.national_id || selectedMember.id || '---',
      JobNumber: selectedMember.job_number || selectedMember.financial_number || '---',
      EmployeeCategory: selectedMember.type || 'نظامي',
      PenaltyType: penaltyForm.penalty_type,
      Reason: penaltyForm.reason.trim(),
      PenaltyDate: penaltyForm.penalty_date,
      DeductionDays: penaltyForm.penalty_type === 'خصم مالي' ? Number(penaltyForm.deduction_days) : 0,
      IsApplied: false
    };

    setPenalties(prev => [newPenalty, ...prev]);
    setIsAddModalOpen(false);
    setPenaltyForm({
      penalty_type: 'لفت نظر (إنذار)',
      deduction_days: 0,
      penalty_date: new Date().toISOString().slice(0, 10),
      reason: '',
      decision_number: '2026/' + Math.floor(100 + Math.random() * 900)
    });
  };

  const handleDeletePenalty = (id) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا القيد من سجل العقوبات؟')) {
      setPenalties(prev => prev.filter(p => p.PenaltyID !== id));
    }
  };

  // Filtered list
  const displayedPenalties = useMemo(() => {
    if (selectedMember && selectedMember.name) {
      const match = penalties.filter(p => 
        (p.FullName && p.FullName.includes(selectedMember.name)) || 
        (p.NationalNumber && p.NationalNumber === selectedMember.national_id)
      );
      if (match.length > 0) return match;
    }
    return penalties;
  }, [penalties, selectedMember]);

  // Print Disciplinary Decree
  const handlePrintPenaltyDecree = (penalty) => {
    const printHtml = `
      <div style="width: 100%; max-width: 700px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">قسم التفتيش والمتابعة والانضباط</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 70px;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار الوزارة" style="width: 60px; height: 60px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Disciplinary Decree</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #dc2626; text-decoration: underline;">
            قرار وإشعار عقوبة انضباطية رسمية
          </h2>
          <div style="font-size: 11px; color: #64748b; font-weight: 700; margin-top: 3px;">
            رقم القيد التأديبي: MOI-UBR-DISC-${penalty.PenaltyID}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; font-size: 12px; margin-bottom: 16px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">اسم المنتسب المعاقب:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 900; color: #0f172a;">${penalty.FullName}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">الرقم المالي / الوظيفي:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace;">${penalty.JobNumber || penalty.NationalNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b;">نوع الجزاء التأديبي:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 900; color: #dc2626;">${penalty.PenaltyType}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b;">تاريخ صدور القرار:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 800;">${new Date(penalty.PenaltyDate).toLocaleDateString('ar-LY')}</td>
          </tr>
          ${penalty.DeductionDays > 0 ? `
            <tr style="background: #fef2f2;">
              <td style="padding: 8px; border: 1px solid #fecaca; color: #991b1b;">الخصم المالي من المرتب:</td>
              <td colspan="3" style="padding: 8px; border: 1px solid #fecaca; font-weight: 900; color: #b91c1c;">خصم ${penalty.DeductionDays} أيام من المرتب الأساسي لحساب الخزانة العامة</td>
            </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b; vertical-align: top;">موجبات وتفاصيل العقوبة:</td>
            <td colspan="3" style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #334155; line-height: 1.6; text-align: justify;">
              ${penalty.Reason}
            </td>
          </tr>
        </table>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-right: 4px solid #dc2626; padding: 10px 14px; border-radius: 6px; font-size: 11px; margin-bottom: 20px; color: #334155; line-height: 1.6;">
          <strong>الإحالة والتنفيذ:</strong>
          تُحال نسخة من هذا القرار إلى قسم الشؤون المالية لتطبيق الخصم المستحق، ونسخة إلى الملف والسجل الشخصي للمنتسب، مع إخطاره بعدم تكرار المخالفة تفادياً لتشديد العقوبة وإحالته لمجلس التأديب الأعلى.
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 24px; font-size: 11px;">
          <tr>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">رئيس قسم التفتيش والانضباط</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">عقيد شرطة / فرج محمد السنوسي</div>
            </td>
            <td style="width: 33%; vertical-align: middle;">
              <div style="width: 50px; height: 50px; border-radius: 50%; border: 1.5px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 6.5px; font-weight: 800; color: #1e3a8a; margin: 0 auto; line-height: 1.2;">
                <span>وزارة الداخلية</span>
                <span>مديرية أمن أوباري</span>
                <span style="color: #dc2626; font-size: 6px;">ختم رسمي</span>
              </div>
            </td>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">يعتمد مدير مديرية أمن أوباري</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">لواء / موسى سعد محمد</div>
            </td>
          </tr>
        </table>
      </div>
    `;

    printDocumentInIframe(printHtml, `قرار عقوبة - ${penalty.FullName}`);
  };

  return (
    <div className="penalties-section-container" style={{ padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div className="module-view-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(185, 28, 28, 0.3)' }}>
            <Scale size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>سجل العقوبات والانضباط وصحائف الاتهام</h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>التوثيق الرسمي للجزاءات التأديبية، الخصومات المالية، وقرارات مجالس التأديب</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#b91c1c', color: '#ffffff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(185, 28, 28, 0.25)' }}
          >
            <Plus size={16} />
            <span>تقييد عقوبة / اتهام جديد</span>
          </button>
        </div>
      </div>

      {/* Smart Member Search & Navigator Bar */}
      <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1.5px solid #cbd5e1', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button
          onClick={() => handleNavigateMember('prev')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, color: '#1e3a8a', cursor: 'pointer' }}
        >
          <ChevronRight size={18} />
          <span>السابق</span>
        </button>

        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 ابحث بالاسم، الرقم الوطني، أو المالي لتحديد المنتسب..."
            style={{ width: '100%', padding: '12px 42px 12px 16px', borderRadius: '10px', border: '2px solid #b91c1c', fontSize: '14px', fontWeight: 800, boxSizing: 'border-box', textAlign: 'center', color: '#b91c1c' }}
          />

          {searchedMembers.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', maxHeight: '220px', overflowY: 'auto' }}>
              {searchedMembers.map(m => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMember(m);
                    setSearchTerm('');
                  }}
                  style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>{m.name}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', marginRight: '8px' }}>({m.rank || 'شرطي'})</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 800 }}>{m.department}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => handleNavigateMember('next')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, color: '#1e3a8a', cursor: 'pointer' }}
        >
          <span>التالي</span>
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Selected Member Card */}
      {selectedMember && (
        <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '14px', border: '1.5px solid #cbd5e1', borderTop: '5px solid #b91c1c', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '75px', height: '95px', borderRadius: '8px', border: '1.5px solid #b91c1c', overflow: 'hidden', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {selectedMember.photo ? (
              <img src={selectedMember.photo} alt={selectedMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontSize: '28px' }}>🛡️</div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{selectedMember.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '12px' }}>
              <div><span style={{ color: '#64748b' }}>الرتبة: </span><strong style={{ color: '#1e3a8a' }}>{selectedMember.rank || 'شرطي'}</strong></div>
              <div><span style={{ color: '#64748b' }}>الرقم المالي: </span><strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{selectedMember.financial_number || selectedMember.job_number || '---'}</strong></div>
              <div><span style={{ color: '#64748b' }}>جهة التبعية: </span><strong>{selectedMember.department || 'مديرية أمن أوباري'}</strong></div>
              <div><span style={{ color: '#64748b' }}>الحالة الانضباطية: </span><strong style={{ color: '#16a34a' }}>قيد المتابعة الدورية</strong></div>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{ padding: '10px 18px', borderRadius: '8px', background: '#b91c1c', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            ➕ تقييد عقوبة للمنتسب
          </button>
        </div>
      )}

      {/* Penalties Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
              <th style={{ padding: '12px 14px' }}>اسم المنتسب</th>
              <th style={{ padding: '12px 14px' }}>تاريخ الواقعة / القرار</th>
              <th style={{ padding: '12px 14px' }}>نوع الجزاء التأديبي</th>
              <th style={{ padding: '12px 14px' }}>التهمة وموجبات العقوبة</th>
              <th style={{ padding: '12px 14px' }}>الخصم المالي</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>الطباعة والإجراء</th>
            </tr>
          </thead>
          <tbody>
            {displayedPenalties.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  لا توجد عقوبات مسجلة لهذا المنتسب
                </td>
              </tr>
            ) : (
              displayedPenalties.map((pen) => (
                <tr key={pen.PenaltyID} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 900, color: '#0f172a' }}>
                    {pen.FullName}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', color: '#475569' }}>
                    {pen.PenaltyDate}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                      {pen.PenaltyType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#334155', maxWidth: '380px', lineHeight: 1.5 }}>
                    {pen.Reason}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 900, color: pen.DeductionDays > 0 ? '#dc2626' : '#64748b' }}>
                    {pen.DeductionDays > 0 ? `خصم ${pen.DeductionDays} أيام` : 'بدون خصم'}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handlePrintPenaltyDecree(pen)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #b91c1c', background: '#fef2f2', color: '#b91c1c', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Printer size={13} />
                        <span>قرار العقوبة</span>
                      </button>
                      <button
                        onClick={() => handleDeletePenalty(pen.PenaltyID)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                        title="حذف"
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
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '560px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', borderTop: '5px solid #b91c1c' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 900, color: '#b91c1c' }}>
              ⚖️ تقييد عقوبة انضباطية للمنتسب: {selectedMember ? selectedMember.name : ''}
            </h3>

            <form onSubmit={handleSavePenalty} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>نوع الجزاء التأديبي:</label>
                <select
                  value={penaltyForm.penalty_type}
                  onChange={(e) => setPenaltyForm({ ...penaltyForm, penalty_type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                >
                  <option value="لفت نظر (إنذار)">لفت نظر (إنذار كتابي)</option>
                  <option value="خصم مالي">خصم مالي من المرتب</option>
                  <option value="حجز بالوحدة">حجز بالوحدة / الغرفة</option>
                  <option value="إيقاف عن العمل">إيقاف مؤقت عن العمل ومجلس تأديبي</option>
                  <option value="تأخير ترقية">تأخير أقدمية الترقية</option>
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
                  <label style={{ fontWeight: 800, color: '#dc2626', display: 'block', marginBottom: '4px' }}>عدد أيام الخصم من المرتب:</label>
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
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>موجبات وأسباب الاتهام والعقوبة بالتفصيل:</label>
                <textarea
                  required
                  rows={4}
                  value={penaltyForm.reason}
                  onChange={(e) => setPenaltyForm({ ...penaltyForm, reason: e.target.value })}
                  placeholder="اكتب التهمة والمخالفة المنسوبة بدقة (مثال: الغياب بدون إذن رسمي، مخالفة التعليمات الأمنية، التقاعس عن أداء الواجب المكلف به...)"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'none', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#b91c1c', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  حفظ القرار التأديبي في السجل 💾
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: '#e2e8f0', color: '#334155', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

