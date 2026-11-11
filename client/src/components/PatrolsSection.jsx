import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Shield, Search, Plus, Calendar, Clock, MapPin, Printer, CheckCircle2, AlertCircle, Car } from 'lucide-react';
import initialPatrols from '../data/patrols_data.json';
import { printDocumentInIframe } from '../utils/printHelper';

export default function PatrolsSection({ forceMembers = [], user = {} }) {
  const [patrols, setPatrols] = useState(() => {
    const saved = localStorage.getItem('ubari_patrols');
    return saved ? JSON.parse(saved) : initialPatrols;
  });

  const [selectedShift, setSelectedShift] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPatrolOpen, setIsAddPatrolOpen] = useState(false);

  // New Patrol Form
  const [patrolForm, setPatrolForm] = useState({
    officer_name: '',
    rank: 'نقيب',
    shift: 'صباحي (08:00 - 14:00)',
    location: 'البوابة الشرقية - نقطة تفتيش مدخل المدينة',
    tasks: 'استيقاف وتفتيش أمني للمركبات المشبوهة وتأمين قاطع المسؤولية',
    vehicle_plate: '31595',
    status: 'نشطة وميدانية'
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ubari_patrols', JSON.stringify(patrols));
  }, [patrols]);

  // Filtered Patrols
  const filteredPatrols = useMemo(() => {
    return patrols.filter(p => {
      const matchShift = selectedShift === 'all' || p.shift.includes(selectedShift);
      const matchSearch = !searchTerm ||
        p.officer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tasks.toLowerCase().includes(searchTerm.toLowerCase());
      return matchShift && matchSearch;
    });
  }, [patrols, selectedShift, searchTerm]);

  // Handle Add Patrol
  const handleAddPatrol = (e) => {
    e.preventDefault();
    if (!patrolForm.officer_name) return;
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      ...patrolForm
    };
    setPatrols([newEntry, ...patrols]);
    setIsAddPatrolOpen(false);
  };

  // Print Daily Operations Plan A4
  const handlePrintOperationsOrder = () => {
    const today = new Date().toLocaleDateString('ar-LY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #0a192f;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px;">
          <div style="text-align: right;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 800;">دولة ليبيا - وزارة الداخلية</h3>
            <h2 style="margin: 3px 0; font-size: 18px; font-weight: 900; color: #1e3a8a;">مديرية أمن أوباري</h2>
            <h4 style="margin: 0; font-size: 13px; color: #475569;">غرفة العمليات المركزية | إدارة الخطط والمناوبات</h4>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 22px; font-weight: 900; color: #1e3a8a;">أمر عمليات يومي وخطة التمركزات الأمنية</div>
            <div style="font-size: 14px; font-weight: 700; color: #b91c1c; margin-top: 4px;">[ سري للغاية - للتنفيذ الفوري ]</div>
          </div>
          <div style="text-align: left; font-size: 13px;">
            <div><strong>تاريخ الأمر:</strong> ${today}</div>
            <div><strong>رقم الأمر:</strong> OPS-UBR-${new Date().getFullYear()}/41</div>
          </div>
        </div>

        <!-- Directives Notice -->
        <div style="background: #f8fafc; border-right: 4px solid #1e3a8a; padding: 12px 16px; border-radius: 6px; font-size: 13px; line-height: 1.8; margin-bottom: 20px;">
          <strong>توجيهات السيد مدير الأمن:</strong> ترفع درجة الاستعداد واليقظة التامة لكافة الدوريات والتمركزات الأمنية بالبوابات الشرقية والغربية ومسار وادي الحياة، مع التشديد على ضبط المركبات التي تسير بدون لوحات معدنية أو المعتمة، والتبليغ الفوري لغرفة السيطرة عن أي تحركات مشبوهة.
        </div>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right; margin-bottom: 30px;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; width: 40px; text-align: center;">ت</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; width: 80px;">الرتبة</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; width: 170px;">قائد التمركز / الدورية</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; width: 130px;">الوردية والتوقيت</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; width: 160px;">الموقع وقطاع الاختصاص</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">المهام والواجبات الموكلة</th>
            </tr>
          </thead>
          <tbody>
            ${patrols.map((p, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a8a;">${p.rank || 'ضابط'}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${p.officer_name}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">${p.shift}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${p.location}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">${p.tasks}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 40px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 14px;">ضابط خفر العمليات والتحكم</div>
            <div style="margin-top: 40px; font-size: 13px;">رائد / سالم عثمان التارقي</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">رئيس قسم الدوريات والنجدة</div>
            <div style="margin-top: 40px; font-size: 13px;">مقدم / حسن المهدي الشريف</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 40px; font-size: 13px; font-weight: bold; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `أمر_عمليات_يومي_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={28} color="#1e3a8a" />
            الخطة والمناوبات وأوامر العمليات
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | إدارة المناوبات الأمنية، انتشار الدوريات، حراسة البوابات ومسارات وادي الحياة
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrintOperationsOrder}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#ffffff',
              color: '#1e3a8a',
              border: '1px solid #1e3a8a',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            طباعة أمر العمليات اليومي A4
          </button>

          <button
            onClick={() => setIsAddPatrolOpen(true)}
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
            تكليف دورية / تمركز جديد
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي التمركزات النشطة</span>
            <Shield size={20} color="#1e3a8a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0a192f' }}>{patrols.length} <span style={{ fontSize: '14px', color: '#64748b' }}>أطقم ميدانية</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>البوابات والمداخل الرئيسية</span>
            <MapPin size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb' }}>2 <span style={{ fontSize: '14px', color: '#64748b' }}>البوابة الشرقية والغربية</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>الدوريات المتحركة (وادي الحياة)</span>
            <Car size={20} color="#0891b2" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0891b2' }}>1 <span style={{ fontSize: '14px', color: '#64748b' }}>دورية مسار متحركة</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>درجة الاستعداد العملياتي</span>
            <AlertCircle size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#16a34a' }}>جاهزية 100% <span style={{ fontSize: '14px', color: '#64748b' }}>حالة الاستعداد ج</span></div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'كافة المناوبات' },
            { id: 'صباحي', label: '☀️ الوردية الصباحية (08:00 - 14:00)' },
            { id: 'مسائي', label: '🌅 الوردية المسائية (14:00 - 20:00)' },
            { id: 'ليلي', label: '🌙 الوردية الليلية (20:00 - 08:00)' }
          ].map(shift => (
            <button
              key={shift.id}
              onClick={() => setSelectedShift(shift.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '13px',
                background: selectedShift === shift.id ? '#1e3a8a' : '#f1f5f9',
                color: selectedShift === shift.id ? '#ffffff' : '#475569'
              }}
            >
              {shift.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث بالقائد أو الموقع أو المهمة..."
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

      {/* Patrols Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
              <th style={{ padding: '14px 16px' }}>ر.م</th>
              <th style={{ padding: '14px 16px' }}>قائد التمركز / الدورية</th>
              <th style={{ padding: '14px 16px' }}>الرتبة</th>
              <th style={{ padding: '14px 16px' }}>الوردية والتوقيت</th>
              <th style={{ padding: '14px 16px' }}>موقع الانتشار / التمركز</th>
              <th style={{ padding: '14px 16px' }}>المهام والواجبات الأمنية</th>
              <th style={{ padding: '14px 16px' }}>الحالة الميدانية</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatrols.map((patrol, idx) => (
              <tr key={patrol.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>{patrol.officer_name}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#eff6ff', color: '#1e3a8a', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                    {patrol.rank}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#475569' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="#64748b" /> {patrol.shift}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#2563eb" /> {patrol.location}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#334155', maxWidth: '350px' }}>{patrol.tasks}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: '#dcfce7',
                    color: '#15803d',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle2 size={13} /> نشطة وميدانية
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Patrol Modal */}
      {isAddPatrolOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '540px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>تكليف دورية أمنية / أمر عمليات جديد</h3>
            <form onSubmit={handleAddPatrol}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>اسم الضابط قائد القوة</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الضابط الرباعي..."
                    value={patrolForm.officer_name}
                    onChange={(e) => setPatrolForm({ ...patrolForm, officer_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الرتبة</label>
                  <select
                    value={patrolForm.rank}
                    onChange={(e) => setPatrolForm({ ...patrolForm, rank: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="عقيد">عقيد</option>
                    <option value="مقدم">مقدم</option>
                    <option value="رائد">رائد</option>
                    <option value="نقيب">نقيب</option>
                    <option value="ملازم أول">ملازم أول</option>
                    <option value="ملازم">ملازم</option>
                    <option value="رئيس عرفاء">رئيس عرفاء</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الوردية والتوقيت</label>
                <select
                  value={patrolForm.shift}
                  onChange={(e) => setPatrolForm({ ...patrolForm, shift: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="صباحي (08:00 - 14:00)">صباحي (08:00 - 14:00)</option>
                  <option value="مسائي (14:00 - 20:00)">مسائي (14:00 - 20:00)</option>
                  <option value="ليلي (20:00 - 08:00)">ليلي (20:00 - 08:00)</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>موقع التمركز / المسار الميداني</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: البوابة الشرقية مدخل المدينة أو مسار أوباري - الغريفة"
                  value={patrolForm.location}
                  onChange={(e) => setPatrolForm({ ...patrolForm, location: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>المهام والواجبات الموكلة</label>
                <textarea
                  rows="3"
                  value={patrolForm.tasks}
                  onChange={(e) => setPatrolForm({ ...patrolForm, tasks: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddPatrolOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  إصدار أمر التكليف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

