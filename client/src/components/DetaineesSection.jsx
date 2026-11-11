import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle, Clock, Plus, Search, ShieldAlert, CheckCircle, Scale, Printer, UserX, Trash2 } from 'lucide-react';
import initialDetainees from '../data/detainees_data.json';
import { printDocumentInIframe } from '../utils/printHelper';

export default function DetaineesSection() {
  const [detainees, setDetainees] = useState(() => {
    const saved = localStorage.getItem('ubari_detainees');
    return saved ? JSON.parse(saved) : initialDetainees;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    national_id: '',
    station: 'مركز شرطة أوباري المدينة',
    charge: '',
    arrest_date: new Date().toISOString().slice(0, 16),
    prosecution: 'نيابة أوباري الجزئية',
    notes: ''
  });

  // Update clock every minute for real-time timer recalculation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ubari_detainees', JSON.stringify(detainees));
  }, [detainees]);

  // Calculate elapsed hours
  const calculateHours = (arrestDate) => {
    const start = new Date(arrestDate).getTime();
    const diffMs = currentTime - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return Math.max(0, diffHours);
  };

  const handleAddDetainee = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.charge.trim()) {
      alert('يرجى كتابة اسم الموقوف والتهمة المنسوبة إليه');
      return;
    }

    const newDet = {
      id: Date.now(),
      name: formData.name.trim(),
      national_id: formData.national_id.trim() || '---',
      station: formData.station,
      charge: formData.charge.trim(),
      arrest_date: new Date(formData.arrest_date).toISOString(),
      prosecution: formData.prosecution,
      status: 'موقوف بالنظارة',
      notes: formData.notes.trim()
    };

    setDetainees(prev => [newDet, ...prev]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      national_id: '',
      station: 'مركز شرطة أوباري المدينة',
      charge: '',
      arrest_date: new Date().toISOString().slice(0, 16),
      prosecution: 'نيابة أوباري الجزئية',
      notes: ''
    });
  };

  const handleUpdateStatus = (id, newStatus) => {
    setDetainees(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const handleDeleteDetainee = (id) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا القيد من سجل النظارة؟')) {
      setDetainees(prev => prev.filter(d => d.id !== id));
    }
  };

  // Filtered List
  const filteredDetainees = detainees.filter(d => {
    const matchSearch = d.name.includes(searchTerm) || (d.national_id && d.national_id.includes(searchTerm)) || d.charge.includes(searchTerm);
    const matchStation = selectedStation === 'all' || d.station === selectedStation;
    return matchSearch && matchStation;
  });

  // KPI counts
  const activeDetainees = detainees.filter(d => d.status === 'موقوف بالنظارة');
  const safeCount = activeDetainees.filter(d => calculateHours(d.arrest_date) < 24).length;
  const warningCount = activeDetainees.filter(d => {
    const h = calculateHours(d.arrest_date);
    return h >= 24 && h < 48;
  }).length;
  const alertCount = activeDetainees.filter(d => calculateHours(d.arrest_date) >= 48).length;

  // Print Detainees Roster
  const handlePrintRoster = () => {
    const printHtml = `
      <div style="width: 100%; max-width: 720px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a;">
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">قسم البحث الجنائي والنظارة المركزية</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 60px;">
              <img src="${window.location.origin}/moi-logo.png" alt="شعار الوزارة" style="width: 50px; height: 50px; object-fit: contain;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Central Custody Radar</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">48-Hour Legal Compliance</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #0f172a; text-decoration: underline;">
            كشف رقابة النظارة المركزية ورادار المدة القانونية (48 ساعة)
          </h2>
          <div style="font-size: 11px; color: #64748b; font-weight: 700; margin-top: 3px;">
            تاريخ وساعة التقرير: ${new Date().toLocaleString('ar-LY')}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 10.5px; margin-bottom: 14px;">
          <thead>
            <tr style="background: #1e3a8a; color: #ffffff;">
              <th style="padding: 6px; border: 1px solid #cbd5e1;">المركز المختص</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">اسم الموقوف</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">الرقم الوطني</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">التهمة المنسوبة</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">تاريخ وساعة القبض</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">مدة التوقيف</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">الحالة والإجراء</th>
            </tr>
          </thead>
          <tbody>
            ${detainees.map((d, idx) => {
              const h = calculateHours(d.arrest_date);
              let hColor = '#16a34a';
              let hText = h + ' ساعة (آمن)';
              if (h >= 48) {
                hColor = '#dc2626';
                hText = 'تجاوز 48 ساعة (' + h + ' ساعة)';
              } else if (h >= 24) {
                hColor = '#ea580c';
                hText = h + ' ساعة (إنذار)';
              }

              return `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: bold;">${d.station}</td>
                  <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${d.name}</td>
                  <td style="padding: 5px; border: 1px solid #cbd5e1; font-family: monospace;">${d.national_id}</td>
                  <td style="padding: 5px; border: 1px solid #cbd5e1;">${d.charge}</td>
                  <td style="padding: 5px; border: 1px solid #cbd5e1; font-size: 9.5px;">${new Date(d.arrest_date).toLocaleString('ar-LY')}</td>
                  <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800; color: ${hColor};">${hText}</td>
                  <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: bold;">${d.status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-right: 4px solid #dc2626; padding: 8px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 10px; color: #334155;">
          <strong>تنبيه قانوني دستوري:</strong> تنص التشريعات الليبية وقانون الإجراءات الجنائية على عدم جواز حجز أي موقوف في استيقافات مراكز الشرطة لأكثر من 48 ساعة دون إحالته للنيابة العامة المختصة أو الإفراج عنه قانوناً.
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 20px; font-size: 11px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">رئيس قسم البحث الجنائي</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">عقيد شرطة / فرج محمد السنوسي</div>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">يعتمد / مدير مديرية أمن أوباري</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">لواء / موسى سعد محمد</div>
            </td>
          </tr>
        </table>
      </div>
    `;

    printDocumentInIframe(printHtml, 'سجل رقابة الموقوفين والنظارة المركزية');
  };

  return (
    <div className="detainees-section-container" style={{ padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div className="module-view-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }}>
            <Lock size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>رادار الموقوفين والنظارة المركزية (مراقبة المدة القانونية)</h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>التتبع الدستوري لمهلة الـ 48 ساعة وضمان إحالة المحاضر للنيابة العامة بالموعد</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(220, 38, 38, 0.25)' }}
          >
            <Plus size={16} />
            <span>قيد موقوف جديد للنظارة</span>
          </button>

          <button
            onClick={handlePrintRoster}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}
          >
            <Printer size={16} />
            <span>طباعة كشف النظارة (A4)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', borderTop: '4px solid #1e3a8a', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>إجمالي الموقوفين بالنظارة</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>{activeDetainees.length}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', borderTop: '4px solid #16a34a', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>أقل من 24 ساعة (سليم قانونياً)</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>{safeCount}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', borderTop: '4px solid #ea580c', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>24 - 48 ساعة (تجهيز الإحالة)</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#ea580c', marginTop: '4px' }}>{warningCount}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', borderTop: '4px solid #dc2626', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 800 }}>تجاوز 48 ساعة (⚠️ مخالفة للمدة)</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>{alertCount}</div>
        </div>
      </div>

      {/* Legal Radar Indicator Legend */}
      <div style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', gap: '20px', alignItems: 'center', fontSize: '12px' }}>
        <span style={{ fontWeight: 800, color: '#0f172a' }}>مؤشرات رادار التوقيف:</span>
        <span style={{ color: '#16a34a', fontWeight: 800 }}>🟢 أقل من 24 ساعة: سليم قانونياً واستكمال جمع الاستدلالات</span>
        <span style={{ color: '#ea580c', fontWeight: 800 }}>🟡 24 - 48 ساعة: إنذار تجهيز أوراق الإحالة لنيابة الاختصاص</span>
        <span style={{ color: '#dc2626', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}></span>
          🔴 تجاوز 48 ساعة: مخالفة صريحة تستوجب الإحالة الفورية أو إخلاء السبيل!
        </span>
      </div>

      {/* Filters & Search */}
      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم الموقوف، الرقم الوطني، أو التهمة المنسوبة..."
            style={{ width: '100%', padding: '9px 38px 9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}
        >
          <option value="all">جميع المراكز والأقسام</option>
          <option value="مركز شرطة أوباري المدينة">مركز شرطة أوباري المدينة</option>
          <option value="مركز شرطة الغريفة">مركز شرطة الغريفة</option>
          <option value="مركز شرطة بنت بية">مركز شرطة بنت بية</option>
          <option value="قسم البحث الجنائي">قسم البحث الجنائي</option>
        </select>
      </div>

      {/* Detainees Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
              <th style={{ padding: '12px 14px' }}>اسم الموقوف</th>
              <th style={{ padding: '12px 14px' }}>الرقم الوطني</th>
              <th style={{ padding: '12px 14px' }}>المركز المُقيد لديه</th>
              <th style={{ padding: '12px 14px' }}>التهمة المنسوبة</th>
              <th style={{ padding: '12px 14px' }}>وقت القبض الفعلي</th>
              <th style={{ padding: '12px 14px' }}>رادار المدة القانونية ⏱️</th>
              <th style={{ padding: '12px 14px' }}>حالة الموقوف</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredDetainees.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  لا توجد قيود موقوفين مطابقة للبحث
                </td>
              </tr>
            ) : (
              filteredDetainees.map((det) => {
                const hours = calculateHours(det.arrest_date);
                let badgeBg = '#dcfce7';
                let badgeColor = '#166534';
                let badgeText = `${hours} ساعة (آمن)`;

                if (hours >= 48) {
                  badgeBg = '#fee2e2';
                  badgeColor = '#dc2626';
                  badgeText = `⚠️ تجاوز المدة (${hours} ساعة)`;
                } else if (hours >= 24) {
                  badgeBg = '#ffedd5';
                  badgeColor = '#c2410c';
                  badgeText = `🟡 إنذار إحالة (${hours} ساعة)`;
                }

                return (
                  <tr key={det.id} style={{ borderBottom: '1px solid #e2e8f0', background: hours >= 48 ? '#fef2f2' : 'transparent' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 900, color: '#0f172a' }}>
                      {det.name}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#0284c7', fontWeight: 800 }}>
                      {det.national_id}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#1e3a8a' }}>
                      {det.station}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#334155' }}>
                      {det.charge}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: '#64748b' }}>
                      {new Date(det.arrest_date).toLocaleString('ar-LY')}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 900, background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}40` }}>
                        {badgeText}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <select
                        value={det.status}
                        onChange={(e) => handleUpdateStatus(det.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, border: '1px solid #cbd5e1' }}
                      >
                        <option value="موقوف بالنظارة">موقوف بالنظارة</option>
                        <option value="أحيل للنيابة العامة">أحيل للنيابة العامة</option>
                        <option value="إفراج بكفالة ضامنة">إفراج بكفالة ضامنة</option>
                        <option value="إخلاء سبيل">إخلاء سبيل</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteDetainee(det.id)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                        title="حذف القيد"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10500, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', borderTop: '5px solid #dc2626' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 900, color: '#dc2626' }}>
              👤 قيد موقوف جديد بالنظارة المركزية
            </h3>

            <form onSubmit={handleAddDetainee} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>المركز المُقيد لديه الموقوف:</label>
                <select
                  value={formData.station}
                  onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                >
                  <option value="مركز شرطة أوباري المدينة">مركز شرطة أوباري المدينة</option>
                  <option value="مركز شرطة الغريفة">مركز شرطة الغريفة</option>
                  <option value="مركز شرطة بنت بية">مركز شرطة بنت بية</option>
                  <option value="قسم البحث الجنائي">قسم البحث الجنائي</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>اسم الموقوف الرباعي:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="الاسم واللقب..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>الرقم الوطني:</label>
                <input
                  type="text"
                  value={formData.national_id}
                  onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                  placeholder="119..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>التهمة المنسوبة / سبب التوقيف:</label>
                <input
                  type="text"
                  required
                  value={formData.charge}
                  onChange={(e) => setFormData({ ...formData, charge: e.target.value })}
                  placeholder="مثال: حيازة سلاح، سرقة، مشاجرة..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#dc2626', display: 'block', marginBottom: '4px' }}>تاريخ وساعة القبض الفعلية:</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.arrest_date}
                  onChange={(e) => setFormData({ ...formData, arrest_date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #dc2626', boxSizing: 'border-box', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>النيابة المختصة:</label>
                <select
                  value={formData.prosecution}
                  onChange={(e) => setFormData({ ...formData, prosecution: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="نيابة أوباري الجزئية">نيابة أوباري الجزئية</option>
                  <option value="نيابة أوباري الابتدائية">نيابة أوباري الابتدائية</option>
                  <option value="النيابة العامة العسكرية">النيابة العامة العسكرية</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>ملاحظات أمنية أو صحية:</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="الحالة الصحية، المضبوطات مع المتهم..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#dc2626', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  حفظ في سجل الموقوفين 🔒
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

