import React, { useState, useEffect, useMemo } from 'react';
import { Scroll, Search, Plus, Calendar, CheckCircle2, Clock, Printer, Award, FileText, UserCheck } from 'lucide-react';
import initialDecisions from '../data/decisions_data.json';
import { printDocumentInIframe } from '../utils/printHelper';

export default function DecisionsSection({ forceMembers = [], user = {} }) {
  const [decisions, setDecisions] = useState(() => {
    const saved = localStorage.getItem('ubari_decisions');
    return saved ? JSON.parse(saved) : initialDecisions;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Decision Form
  const [form, setForm] = useState({
    number: String(Math.floor(Math.random() * 50) + 20),
    year: '2026',
    entity: 'كافة الأقسام والمراكز بالمديرية',
    subject: '',
    status: 'قيد التنفيذ',
    content: ''
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ubari_decisions', JSON.stringify(decisions));
  }, [decisions]);

  // Filtered
  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      const matchStatus = selectedStatus === 'all' || d.status === selectedStatus;
      const matchSearch = !searchTerm ||
        d.number.includes(searchTerm) ||
        d.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.subject.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [decisions, selectedStatus, searchTerm]);

  // Handle Add Decision
  const handleAddDecision = (e) => {
    e.preventDefault();
    if (!form.subject) return;
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      ...form
    };
    setDecisions([newEntry, ...decisions]);
    setIsAddModalOpen(false);
  };

  // Toggle status
  const handleToggleStatus = (id) => {
    setDecisions(decisions.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: d.status === 'تم التنفيذ' ? 'قيد التنفيذ' : 'تم التنفيذ'
        };
      }
      return d;
    }));
  };

  // Print Decision A4
  const handlePrintDecision = (d) => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 25px; color: #0a192f;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px;">
          <div style="text-align: right;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 800;">دولة ليبيا</h3>
            <h2 style="margin: 3px 0; font-size: 18px; font-weight: 900; color: #1e3a8a;">وزارة الداخلية</h2>
            <h4 style="margin: 0; font-size: 13px; color: #475569;">مديرية أمن أوباري | مكتب مدير الأمن</h4>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 22px; font-weight: 900; color: #1e3a8a;">قرار إداري رقم (${d.number}) لسنة ${d.year} م</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">صادر عن مدير أمن أوباري</div>
          </div>
          <div style="text-align: left; font-size: 13px;">
            <div><strong>تاريخ الصدور:</strong> ${d.date}</div>
            <div><strong>الإشارة:</strong> SEC-DEC-${d.year}/${d.number}</div>
          </div>
        </div>

        <!-- Preamble -->
        <div style="margin-bottom: 20px; font-size: 14px; line-height: 2;">
          <strong>مدير أمن أوباري،</strong><br />
          - بعد الاطلاع على قانون هيئة الشرطة رقم (10) لسنة 1992م وتعديلاته ولائحته التنفيذية.<br />
          - وعلى القرار الوزاري المنشئ لمديرية أمن أوباري وتحديد اختصاصاتها.<br />
          - ومقتضيات المصلحة العامة وحسن سير العمل الأمني والانضباطي بالمنطقة.
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <span style="font-size: 18px; font-weight: 900; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px;">
            قـــــــــــــــــرر
          </span>
        </div>

        <!-- Articles -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin-bottom: 25px; font-size: 14px; line-height: 2;">
          <p><strong>مـادة (1):</strong> ${d.subject}.</p>
          <p><strong>مـادة (2):</strong> يُكلف كل من (${d.entity}) باتخاذ الإجراءات العاجلة واللازمة لوضع هذا القرار موضع التنفيذ الفوري اعتباراً من تاريخ صدوره.</p>
          <p><strong>مـادة (3):</strong> يُعمل بهذا القرار من تاريخ صدوره، ويُلغى كل ما يخالفه من أحكام سابقة، وعلى كافة الجهات المختصة تنفيذه كل فيما يخصه.</p>
        </div>

        <!-- Signatures -->
        <div style="text-align: left; margin-top: 50px; padding-left: 50px;">
          <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">
            اللواء / موسى سعد محمد البدين
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #475569; margin-top: 4px;">
            مدير أمن أوباري
          </div>
          <div style="margin-top: 30px; font-size: 12px; color: #64748b;">
            الختم الرسمي لمديرية أمن أوباري
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `قرار_إداري_رقم_${d.number}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scroll size={28} color="#1e3a8a" />
            سجل القرارات والأوامر الإدارية
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | القرارات الصادرة عن مدير الأمن، الأوامر الإدارية والتعاميم وتتبع إنجازها
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
            إصدار قرار إداري جديد
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي القرارات الصادرة</span>
            <Scroll size={20} color="#1e3a8a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0a192f' }}>{decisions.length} <span style={{ fontSize: '14px', color: '#64748b' }}>قرار رسمي</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>تم التنفيذ بالكامل</span>
            <CheckCircle2 size={20} color="#15803d" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#15803d' }}>
            {decisions.filter(d => d.status === 'تم التنفيذ').length} <span style={{ fontSize: '14px', color: '#64748b' }}>منجز</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>قيد المتابعة والتنفيذ</span>
            <Clock size={20} color="#ea580c" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#ea580c' }}>
            {decisions.filter(d => d.status === 'قيد التنفيذ').length} <span style={{ fontSize: '14px', color: '#64748b' }}>جاري العمل به</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>جهة الاعتماد</span>
            <Award size={20} color="#d4af37" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#0a192f', marginTop: '6px' }}>مدير أمن أوباري</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'كافة القرارات' },
            { id: 'تم التنفيذ', label: '✅ تم التنفيذ' },
            { id: 'قيد التنفيذ', label: '⏳ قيد التنفيذ' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '13px',
                background: selectedStatus === st.id ? '#1e3a8a' : '#f1f5f9',
                color: selectedStatus === st.id ? '#ffffff' : '#475569'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث بالرقم أو الموضوع أو الجهة..."
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
              <th style={{ padding: '14px 16px' }}>رقم القرار</th>
              <th style={{ padding: '14px 16px' }}>السنة</th>
              <th style={{ padding: '14px 16px' }}>تاريخ الصدور</th>
              <th style={{ padding: '14px 16px' }}>الجهة المعنية بالتنفيذ</th>
              <th style={{ padding: '14px 16px' }}>موضوع القرار وفحواه</th>
              <th style={{ padding: '14px 16px' }}>حالة التنفيذ</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredDecisions.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 900, color: '#1e3a8a', fontSize: '14px' }}>قرار ({d.number})</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{d.year}</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{d.date}</td>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0a192f' }}>{d.entity}</td>
                <td style={{ padding: '14px 16px', maxWidth: '350px', fontWeight: 600 }}>{d.subject}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => handleToggleStatus(d.id)}
                    style={{
                      border: 'none',
                      background: d.status === 'تم التنفيذ' ? '#dcfce7' : '#fef3c7',
                      color: d.status === 'تم التنفيذ' ? '#15803d' : '#b45309',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {d.status} ↺
                  </button>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handlePrintDecision(d)}
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
                    <Printer size={14} /> طباعة القرار A4
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
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '560px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>إصدار قرار إداري / أمني جديد</h3>
            <form onSubmit={handleAddDecision}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>رقم القرار</label>
                  <input
                    type="text"
                    required
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>السنة</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الجهة المعنية بالتنفيذ</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قسم المرور والتراخيص / قسم الدوريات"
                  value={form.entity}
                  onChange={(e) => setForm({ ...form, entity: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>موضوع القرار وفحواه</label>
                <textarea
                  rows="3"
                  required
                  placeholder="نص مادة القرار..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
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
                  اعتماد وإصدار القرار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

