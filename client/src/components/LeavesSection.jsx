import React, { useState, useEffect, useMemo } from 'react';
import { Plane, Search, Plus, Calendar, User, Printer, Trash2, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import initialLeaves from '../data/leaves_data.json';
import { printDocumentInIframe } from '../utils/printHelper';

export default function LeavesSection({ forceMembers = [] }) {
  const [leaves, setLeaves] = useState(() => {
    const saved = localStorage.getItem('ubari_leaves');
    return saved ? JSON.parse(saved) : initialLeaves;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);

  // New Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'اجازة سنوية',
    destination: 'داخل ليبيا',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    total_days: 30,
    notes: 'إجازة اعتيادية معتمدة'
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ubari_leaves', JSON.stringify(leaves));
  }, [leaves]);

  // Set default selected member from forceMembers if available
  useEffect(() => {
    if (!selectedMember && forceMembers.length > 0) {
      setSelectedMember(forceMembers[0]);
    }
  }, [forceMembers, selectedMember]);

  // Recalculate days on date change
  useEffect(() => {
    if (leaveForm.start_date && leaveForm.end_date) {
      const start = new Date(leaveForm.start_date);
      const end = new Date(leaveForm.end_date);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setLeaveForm(prev => ({ ...prev, total_days: Math.max(1, diffDays) }));
    }
  }, [leaveForm.start_date, leaveForm.end_date]);

  // Search autocomplete members
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

  const handleSaveLeave = (e) => {
    e.preventDefault();
    if (!selectedMember) {
      alert('يرجى تحديد المنتسب أولاً');
      return;
    }

    const newLeave = {
      LeaveID: Date.now(),
      NationalNumber: selectedMember.national_id || selectedMember.id || '---',
      FullName: selectedMember.name,
      DepartmentName: selectedMember.department || 'مديرية أمن أوباري',
      LeaveType: leaveForm.leave_type,
      StartDate: leaveForm.start_date,
      EndDate: leaveForm.end_date,
      TotalDays: leaveForm.total_days,
      Notes: leaveForm.destination ? `${leaveForm.destination} - ${leaveForm.notes}` : leaveForm.notes
    };

    setLeaves(prev => [newLeave, ...prev]);
    setIsNewLeaveModalOpen(false);
  };

  const handleDeleteLeave = (id) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا القيد من سجل الإجازات؟')) {
      setLeaves(prev => prev.filter(l => l.LeaveID !== id));
    }
  };

  // Leaves for current selected member or all
  const displayedLeaves = useMemo(() => {
    if (selectedMember && selectedMember.name) {
      const match = leaves.filter(l => 
        (l.FullName && l.FullName.includes(selectedMember.name)) || 
        (l.NationalNumber && l.NationalNumber === selectedMember.national_id)
      );
      if (match.length > 0) return match;
    }
    return leaves;
  }, [leaves, selectedMember]);

  // Print Official Leave Voucher
  const handlePrintLeaveVoucher = (leave) => {
    const printHtml = `
      <div style="width: 100%; max-width: 680px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a;">
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">قسم الشؤون الإدارية • وحدة الإجازات</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 60px;">
              <img src="${window.location.origin}/moi-logo.png" alt="شعار الوزارة" style="width: 50px; height: 50px; object-fit: contain;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Official Leave Voucher</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #0f172a; text-decoration: underline;">
            إذن إجازة رسمية معتمدة
          </h2>
          <div style="font-size: 11px; color: #15803d; font-weight: 800; margin-top: 3px;">
            رقم القيد المركزي: MOI-UBR-LV-${leave.LeaveID}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; font-size: 12px; margin-bottom: 16px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">اسم المنتسب الرباعي:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 900; color: #0f172a;">${leave.FullName}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">الرقم الوطني / المالي:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace;">${leave.NationalNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b;">جهة العمل والتبعية:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">${leave.DepartmentName}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b;">نوع الإجازة الممنوحة:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 900; color: #16a34a;">${leave.LeaveType}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b;">تاريخ بداية الإجازة:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 800;">${new Date(leave.StartDate).toLocaleDateString('ar-LY')}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b;">تاريخ انتهاء الإجازة:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 800;">${new Date(leave.EndDate).toLocaleDateString('ar-LY')}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b;">المدة الإجمالية المعتمدة:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 900; color: #dc2626;">${leave.TotalDays} يوماً</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b;">جهة الإقامة / السفر:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 800;">${leave.Notes || 'داخل ليبيا'}</td>
          </tr>
        </table>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-right: 4px solid #16a34a; padding: 10px 14px; border-radius: 6px; font-size: 11px; margin-bottom: 20px; color: #334155; line-height: 1.6;">
          <strong>تعليمات العودة ومباشرة العمل:</strong>
          يلتزم المنتسب المأذون له بالحضور ومباشرة مهامه الرسمية فور انتهاء المدة المحددة أعلاه، وإخطار قسم الشؤون الإدارية بمحضر مباشرة عمل نظامي تجنباً للغياب والخصومات القانونية.
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 24px; font-size: 11px;">
          <tr>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">رئيس وحدة الإجازات</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">نقيب / علي سالم محمد</div>
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

    printDocumentInIframe(printHtml, `إذن إجازة - ${leave.FullName}`);
  };

  return (
    <div className="leaves-section-container" style={{ padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div className="module-view-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
            <Plane size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>سجل إجازات القوة العمومية</h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>التوثيق الرسمي للإجازات السنوية، المرضية، والطارئة واحتساب الأرصدة</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsNewLeaveModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)' }}
          >
            <Plus size={16} />
            <span>منح إجازة جديدة للمنتسب</span>
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
            placeholder="🔍 ابحث بالاسم، الرقم الوطني، أو الرقم المالي لاختيار منتسب..."
            style={{ width: '100%', padding: '12px 42px 12px 16px', borderRadius: '10px', border: '2px solid #10b981', fontSize: '14px', fontWeight: 800, boxSizing: 'border-box', textAlign: 'center' }}
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
                  style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>{m.name}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', marginRight: '8px' }}>({m.rank || 'شرطي'})</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 800 }}>{m.department}</span>
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

      {/* Selected Member Profile Card */}
      {selectedMember && (
        <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '14px', border: '1.5px solid #cbd5e1', borderTop: '5px solid #10b981', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '75px', height: '95px', borderRadius: '8px', border: '1.5px solid #10b981', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
              <div><span style={{ color: '#64748b' }}>رصيد الإجازات المتبقي: </span><strong style={{ color: '#16a34a' }}>90 يوماً</strong></div>
            </div>
          </div>

          <button
            onClick={() => setIsNewLeaveModalOpen(true)}
            style={{ padding: '10px 18px', borderRadius: '8px', background: '#10b981', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            ➕ منح إجازة للمنتسب
          </button>
        </div>
      )}

      {/* Leaves Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
              <th style={{ padding: '12px 14px' }}>اسم المنتسب</th>
              <th style={{ padding: '12px 14px' }}>الرقم الوطني / المالي</th>
              <th style={{ padding: '12px 14px' }}>نوع الإجازة</th>
              <th style={{ padding: '12px 14px' }}>من تاريخ</th>
              <th style={{ padding: '12px 14px' }}>إلى تاريخ</th>
              <th style={{ padding: '12px 14px' }}>المدة</th>
              <th style={{ padding: '12px 14px' }}>جهة السفر / الملاحظات</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>الإجراء والطباعة</th>
            </tr>
          </thead>
          <tbody>
            {displayedLeaves.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  لا توجد إجازات مسجلة
                </td>
              </tr>
            ) : (
              displayedLeaves.map((leave) => (
                <tr key={leave.LeaveID} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 900, color: '#0f172a' }}>
                    {leave.FullName}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#0284c7', fontWeight: 800 }}>
                    {leave.NationalNumber}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                      {leave.LeaveType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', color: '#475569' }}>
                    {new Date(leave.StartDate).toLocaleDateString('ar-LY')}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', color: '#475569' }}>
                    {new Date(leave.EndDate).toLocaleDateString('ar-LY')}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 900, color: '#dc2626' }}>
                    {leave.TotalDays} يوماً
                  </td>
                  <td style={{ padding: '12px 14px', color: '#334155', fontSize: '11.5px' }}>
                    {leave.Notes || 'داخل ليبيا'}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handlePrintLeaveVoucher(leave)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #10b981', background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Printer size={13} />
                        <span>إذن إجازة</span>
                      </button>
                      <button
                        onClick={() => handleDeleteLeave(leave.LeaveID)}
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

      {/* New Leave Modal */}
      {isNewLeaveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10500, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', borderTop: '5px solid #10b981' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 900, color: '#10b981' }}>
              ✈️ منح إجازة جديدة للمنتسب: {selectedMember ? selectedMember.name : ''}
            </h3>

            <form onSubmit={handleSaveLeave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>نوع الإجازة:</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                >
                  <option value="اجازة سنوية">اجازة سنوية اعتيادية</option>
                  <option value="اجازة طارئة">اجازة طارئة</option>
                  <option value="اجازة مرضية">اجازة مرضية (بتقرير طبي)</option>
                  <option value="اجازة حج / عمرة">اجازة حج / عمرة</option>
                  <option value="اجازة دراسية">اجازة دراسية / تدريب</option>
                  <option value="اجازة وضع وأمومة">اجازة وضع وأمومة</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>مصرح له بالسفر إلى:</label>
                <input
                  type="text"
                  value={leaveForm.destination}
                  onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
                  placeholder="داخل ليبيا / خارج ليبيا إلى..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>من تاريخ (البدء):</label>
                <input
                  type="date"
                  required
                  value={leaveForm.start_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>إلى تاريخ (الانتهاء):</label>
                <input
                  type="date"
                  required
                  value={leaveForm.end_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 800, color: '#dc2626', display: 'block', marginBottom: '4px' }}>المدة الإجمالية المحسوبة تلقائياً:</label>
                <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 900, color: '#dc2626' }}>
                  {leaveForm.total_days} يوماً
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

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#10b981', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  حفظ واعتماد الإجازة 💾
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewLeaveModalOpen(false)}
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

