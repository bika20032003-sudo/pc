import React, { useState, useEffect, useMemo } from 'react';
import { Share2, Search, Plus, Calendar, Building2, CheckCircle2, Clock, Printer, Eye, FileText, ArrowRight } from 'lucide-react';
import initialReferred from '../data/referred_mail_data.json';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';

export default function ReferredMailSection({ user = {} }) {
  const [referredList, setReferredList] = useState(() => {
    const saved = localStorage.getItem('ubari_referred_mail');
    return saved ? JSON.parse(saved) : (Array.isArray(initialReferred) ? initialReferred : []);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Referral Form
  const [form, setForm] = useState({
    MailNumber: `${Math.floor(Math.random() * 800) + 100}`,
    Subject: '',
    TargetDept: 'الشؤون الأمنية',
    DirectorNotes: 'للإجراء اللازم والعرض',
    Status: 'تحت الإجراء'
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ubari_referred_mail', JSON.stringify(referredList));
  }, [referredList]);

  // Unique Depts
  const deptList = useMemo(() => {
    const set = new Set();
    referredList.forEach(r => {
      if (r.TargetDept) set.add(r.TargetDept);
    });
    return Array.from(set);
  }, [referredList]);

  // Filtered
  const filteredList = useMemo(() => {
    return referredList.filter(item => {
      const matchDept = selectedDept === 'all' || item.TargetDept === selectedDept;
      const matchSearch = !searchTerm ||
        String(item.MailNumber).includes(searchTerm) ||
        (item.Subject && item.Subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.DirectorNotes && item.DirectorNotes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.TargetDept && item.TargetDept.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchDept && matchSearch;
    });
  }, [referredList, selectedDept, searchTerm]);

  // Add Referral
  const handleAddReferral = (e) => {
    e.preventDefault();
    if (!form.Subject) return;
    const newEntry = {
      ReferralID: Date.now(),
      MailID: Date.now(),
      ...form,
      ReferralDate: new Date().toISOString()
    };
    setReferredList([newEntry, ...referredList]);
    setIsAddModalOpen(false);
    setForm({
      MailNumber: `${Math.floor(Math.random() * 800) + 100}`,
      Subject: '',
      TargetDept: 'الشؤون الأمنية',
      DirectorNotes: 'للإجراء اللازم والعرض',
      Status: 'تحت الإجراء'
    });
  };

  // Print Referral Card A4
  const handlePrintReferral = (item) => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px 26px; color: #0a192f; max-width: 740px; margin: 0 auto;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <!-- Header -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px;">
          <tr>
            <td style="text-align: right; vertical-align: middle; width: 38%;">
              <div style="font-size: 14.5px; font-weight: 800; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 16px; font-weight: 900; color: #0a192f;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">مكتب مدير الأمن • قسم الإحالات والمتابعة</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 24%;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 65px; height: 65px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle; width: 38%;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">State of Libya • Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0a192f;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Director Endorsements Office</div>
            </td>
          </tr>
        </table>

        <!-- Mail Details -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin-bottom: 25px; font-size: 14px; line-height: 2;">
          <div><strong>رقم الكتاب والمراسلة:</strong> <span style="font-family: monospace; font-weight: 900; color: #1e3a8a;">${item.MailNumber || 'بدون رقم'}</span></div>
          <div><strong>موضوع الكتاب:</strong> ${item.Subject || 'بدون موضوع'}</div>
          <div><strong>الإدارة / القسم المحال إليه:</strong> <span style="font-weight: 800; color: #2563eb;">${item.TargetDept}</span></div>
          <div><strong>تاريخ ووقت الإحالة:</strong> ${item.ReferralDate ? item.ReferralDate.replace('T', ' ').slice(0, 16) : '---'}</div>
          <div><strong>حالة الإجراء:</strong> ${item.Status || 'تحت الإجراء'}</div>
        </div>

        <!-- Director Endorsement Card -->
        <div style="background: #fffbeb; border: 2px dashed #d97706; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
          <h4 style="margin: 0 0 10px; color: #b45309; font-size: 16px; font-weight: 900;">
            ✍️ تأشيرة وتوجيهات السيد مدير أمن أوباري:
          </h4>
          <div style="font-size: 18px; font-weight: 900; color: #0a192f; line-height: 1.8;">
            "${item.DirectorNotes || 'للإجراء اللازم والعرض'}"
          </div>
        </div>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 50px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 14px;">مستلم الإحالة بالقسم المختص</div>
            <div style="margin-top: 40px; font-size: 13px;">الاسم: ................................</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">مدير أمن أوباري</div>
            <div style="margin-top: 40px; font-size: 13px; font-weight: bold; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `إحالة_بريد_${item.ReferralID}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Share2 size={28} color="#1e3a8a" />
            البريد المُحال وتأشيرات مدير الأمن
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | متابعة المراسلات المحالة إلى الأقسام والمراكز، وتأشيرات وتوجيهات سيادة اللواء مدير الأمن
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
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
            <Plus size={16} />
            قيد إحالة جديدة بتأشيرة القيادة
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي البريد المحال</span>
            <Share2 size={20} color="#1e3a8a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0a192f' }}>{referredList.length} <span style={{ fontSize: '14px', color: '#64748b' }}>مراسلة</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>تحت الإجراء والمتابعة</span>
            <Clock size={20} color="#d97706" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#d97706' }}>
            {referredList.filter(r => r.Status === 'تحت الإجراء').length} <span style={{ fontSize: '14px', color: '#64748b' }}>قيد التنفيذ</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>الأقسام المحال إليها</span>
            <Building2 size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb' }}>{deptList.length} <span style={{ fontSize: '14px', color: '#64748b' }}>إدارات</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>جهة التأشيرة</span>
            <CheckCircle2 size={20} color="#15803d" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#0a192f', marginTop: '6px' }}>سيادة اللواء مدير الأمن</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>تصفية حسب القسم المحال إليه:</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none',
              minWidth: '200px'
            }}
          >
            <option value="all">كافة الأقسام والمراكز</option>
            {deptList.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث بالرقم أو الموضوع أو التأشيرة..."
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
              <th style={{ padding: '14px 16px', width: '60px' }}>ر.م</th>
              <th style={{ padding: '14px 16px', width: '110px' }}>رقم المراسلة</th>
              <th style={{ padding: '14px 16px' }}>الموضوع وفحوى الكتاب</th>
              <th style={{ padding: '14px 16px', width: '160px' }}>القسم المحال إليه</th>
              <th style={{ padding: '14px 16px', width: '130px' }}>تاريخ الإحالة</th>
              <th style={{ padding: '14px 16px' }}>تأشيرة وتوجيه مدير الأمن</th>
              <th style={{ padding: '14px 16px', width: '120px' }}>حالة الإنجاز</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', width: '120px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, idx) => (
              <tr key={item.ReferralID || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ padding: '14px 16px', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace' }}>
                  {item.MailNumber || 'بدون رقم'}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0a192f', maxWidth: '300px' }}>
                  {item.Subject || 'بدون موضوع'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontWeight: 800, color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Building2 size={14} /> {item.TargetDept}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                  {item.ReferralDate ? item.ReferralDate.replace('T', ' ').slice(0, 16) : '---'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                    background: '#fffbeb',
                    color: '#b45309',
                    border: '1px solid #fef3c7',
                    display: 'inline-block'
                  }}>
                    ✍️ {item.DirectorNotes || 'للإجراء'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: '#fef3c7',
                    color: '#b45309'
                  }}>
                    {item.Status || 'تحت الإجراء'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handlePrintReferral(item)}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    <Printer size={13} /> طباعة التأشيرة
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '540px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>قيد إحالة بريد وتأشيرة قيادية جديدة</h3>
            <form onSubmit={handleAddReferral}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>رقم المراسلة</label>
                  <input
                    type="text"
                    required
                    value={form.MailNumber}
                    onChange={(e) => setForm({ ...form, MailNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>القسم المحال إليه</label>
                  <select
                    value={form.TargetDept}
                    onChange={(e) => setForm({ ...form, TargetDept: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="الشؤون الأمنية">الشؤون الأمنية</option>
                    <option value="الشؤون العامة">الشؤون العامة</option>
                    <option value="قسم الخدمات">قسم الخدمات</option>
                    <option value="البحث الجنائي">البحث الجنائي</option>
                    <option value="مركز شرطة أوباري">مركز شرطة أوباري</option>
                    <option value="مركز شرطة الغريفة">مركز شرطة الغريفة</option>
                    <option value="قسم المرور">قسم المرور</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>موضوع الكتاب</label>
                <input
                  type="text"
                  required
                  placeholder="موضوع المراسلة المحالة..."
                  value={form.Subject}
                  onChange={(e) => setForm({ ...form, Subject: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>تأشيرة وتوجيه السيد مدير الأمن</label>
                <textarea
                  rows="3"
                  required
                  placeholder="مثال: العامة للإجراء / فتح تحقيق / تحال للمركز المختص..."
                  value={form.DirectorNotes}
                  onChange={(e) => setForm({ ...form, DirectorNotes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  قيد وتعميم الإحالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

