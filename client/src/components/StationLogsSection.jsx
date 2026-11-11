import React, { useState, useEffect, useMemo } from 'react';
import { FileCheck, Search, Plus, Filter, AlertCircle, CheckCircle2, Clock, Printer, Building2, Send, Scale } from 'lucide-react';
import initialLogs from '../data/station_logs_data.json';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';

export default function StationLogsSection({ forceMembers = [], user = {} }) {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('ubari_station_logs');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  const [selectedStation, setSelectedStation] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);

  // New Log Form
  const [logForm, setLogForm] = useState({
    station: 'مركز شرطة أوباري المدينة',
    report_number: `${new Date().getFullYear()}/${Math.floor(Math.random() * 800) + 100}`,
    complainant: '',
    accused: '',
    subject: '',
    status: '🟡 قيد التحقيق بالمركز (طبيعي)',
    notes: 'فتح محضر جمع استدلالات بناءً على بلاغ الشاكي'
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ubari_station_logs', JSON.stringify(logs));
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchStation = selectedStation === 'all' || log.station === selectedStation;
      const matchSearch = !searchTerm ||
        log.report_number.includes(searchTerm) ||
        log.complainant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.accused.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.station.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStation && matchSearch;
    });
  }, [logs, selectedStation, searchTerm]);

  // Handle Add Log
  const handleAddLog = (e) => {
    e.preventDefault();
    if (!logForm.complainant || !logForm.subject) return;
    const newEntry = {
      id: Date.now(),
      report_date: new Date().toISOString().slice(0, 10),
      ...logForm
    };
    setLogs([newEntry, ...logs]);
    setIsAddLogOpen(false);
  };

  // Referral to Prosecution Action
  const handleReferToProsecution = (logId) => {
    const prosecutionNum = prompt('أدخل رقم قيد الإحالة للنيابة العامة الجزئية:', `${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`);
    if (prosecutionNum) {
      setLogs(logs.map(log => {
        if (log.id === logId) {
          return {
            ...log,
            status: '🟢 أحيل للنيابة العامة',
            notes: `تم استيفاء الاستدلالات وإحالة المحضر رسمياً إلى النيابة العامة الجزئية برقم قيد (${prosecutionNum})`
          };
        }
        return log;
      }));
    }
  };

  // Print Prosecution Referral Letter A4
  const handlePrintProsecutionLetter = (log) => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 22px 28px; color: #0a192f; max-width: 740px; margin: 0 auto;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <!-- Header -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px;">
          <tr>
            <td style="text-align: right; vertical-align: middle; width: 38%;">
              <div style="font-size: 14.5px; font-weight: 800; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 16px; font-weight: 900; color: #0a192f;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">${log.station} • وحدة الاستدلال والتحقيق</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 24%;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 68px; height: 68px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle; width: 38%;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">State of Libya • Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0a192f;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Public Prosecution Referral</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 18px;">
          <div style="display: inline-block; background: #1e3a8a; color: #ffffff; padding: 6px 24px; border-radius: 6px; font-size: 16px; font-weight: 900;">
            إحالة محضر استدلالات إلى النيابة العامة
          </div>
          <div style="font-size: 11.5px; color: #64748b; margin-top: 4px; font-weight: 800;">
            رقم المحضر: ${log.report_number} • تاريخ الإحالة: ${today}
          </div>
        </div>

        <!-- Salutation -->
        <div style="margin-bottom: 20px; font-size: 15px; font-weight: 800;">
          إلى السيد / رئيس النيابة الجزئية المحترم
          <div style="font-size: 13px; font-weight: normal; color: #475569; margin-top: 4px;">بعد التحية والاحترام،،،</div>
        </div>

        <div style="margin-bottom: 25px; font-size: 14px; line-height: 2;">
          نحيل إليكم طيه أوراق المحضر رقم (<strong>${log.report_number}</strong>) لمركزنا المؤرخ في <strong>${log.report_date}</strong>، وذلك للنظر والتصرف وفقاً للقانون واللوائح المعمول بها:
        </div>

        <!-- Case Box -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; margin-bottom: 25px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 14px; margin-bottom: 12px;">
            <div><strong>الشاكي / المبلغ:</strong> ${log.complainant}</div>
            <div><strong>المشكو في حقه:</strong> ${log.accused}</div>
          </div>
          <div style="font-size: 14px; margin-bottom: 12px;">
            <strong>موضوع البلاغ / الواقعة:</strong> ${log.subject}
          </div>
          <div style="font-size: 14px; border-top: 1px dashed #cbd5e1; padding-top: 10px; color: #1e3a8a;">
            <strong>إجراءات الاستدلال المنجزة:</strong> ${log.notes}
          </div>
        </div>

        <div style="margin-bottom: 40px; font-size: 14px; line-height: 1.8;">
          والأمر معروض على أنظاركم الموقرة لاتخاذ ما ترونه مناسباً حيال الواقعة المذكورة.
          <br /><br />
          <strong style="text-align: center; display: block;">والسلام عليكم ورحمة الله وبركاته</strong>
        </div>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 50px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 14px;">ضابط التحقيق ومأمور الضبط</div>
            <div style="margin-top: 40px; font-size: 13px;">نقيب / محمد سالم الفرجاني</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">رئيس ${log.station}</div>
            <div style="margin-top: 40px; font-size: 13px;">عقيد شرطة / فرج مصطفى</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 40px; font-size: 13px; font-weight: bold; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `إحالة_محضر_${log.report_number.replace('/', '-')}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck size={28} color="#1e3a8a" />
            رقابة المحاضر وسجلات مراكز الشرطة
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | الربط الإلكتروني الموحد لمراكز أوباري، الغريفة، بنت بية، والبحث الجنائي ومتابعة إحالات النيابة
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsAddLogOpen(true)}
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
            تسجيل قيد / محضر جديد
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي المحاضر المسجلة</span>
            <FileCheck size={20} color="#1e3a8a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0a192f' }}>{logs.length} <span style={{ fontSize: '14px', color: '#64748b' }}>محضر رسمي</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>أحيلت للنيابة العامة</span>
            <Scale size={20} color="#15803d" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#15803d' }}>
            {logs.filter(l => l.status.includes('أحيل للنيابة')).length} <span style={{ fontSize: '14px', color: '#64748b' }}>محضر منجز</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>قيد التحقيق بالمراكز</span>
            <Clock size={20} color="#d97706" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#d97706' }}>
            {logs.filter(l => l.status.includes('طبيعي')).length} <span style={{ fontSize: '14px', color: '#64748b' }}>جمع استدلالات</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>تنبيهات تأخير أو تجاوز</span>
            <AlertCircle size={20} color="#dc2626" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#dc2626' }}>
            {logs.filter(l => l.status.includes('تأخير')).length} <span style={{ fontSize: '14px', color: '#64748b' }}>محضر يحتاج متابعة</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'كافة المراكز' },
            { id: 'مركز شرطة أوباري المدينة', label: 'أوباري المدينة' },
            { id: 'مركز شرطة الغريفة', label: 'مركز الغريفة' },
            { id: 'قسم البحث الجنائي', label: 'البحث الجنائي' },
            { id: 'مركز شرطة بنت بية', label: 'مركز بنت بية' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStation(st.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '13px',
                background: selectedStation === st.id ? '#1e3a8a' : '#f1f5f9',
                color: selectedStation === st.id ? '#ffffff' : '#475569'
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
            placeholder="بحث بالرقم أو الشاكي أو الواقعة..."
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

      {/* Logs Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
              <th style={{ padding: '14px 16px' }}>رقم المحضر</th>
              <th style={{ padding: '14px 16px' }}>المركز / الجهة</th>
              <th style={{ padding: '14px 16px' }}>تاريخ المحضر</th>
              <th style={{ padding: '14px 16px' }}>الشاكي / المبلغ</th>
              <th style={{ padding: '14px 16px' }}>المشكو فيه</th>
              <th style={{ padding: '14px 16px' }}>موضوع الواقعة</th>
              <th style={{ padding: '14px 16px' }}>الحالة القانونية</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace' }}>{log.report_number}</td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Building2 size={14} color="#64748b" /> {log.station}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{log.report_date}</td>
                <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>{log.complainant}</td>
                <td style={{ padding: '14px 16px', color: '#b91c1c', fontWeight: 700 }}>{log.accused}</td>
                <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                  <div style={{ fontWeight: 700, color: '#0a192f' }}>{log.subject}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{log.notes}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                    background: log.status.includes('أحيل') ? '#dcfce7' : log.status.includes('تأخير') ? '#fee2e2' : '#fef3c7',
                    color: log.status.includes('أحيل') ? '#15803d' : log.status.includes('تأخير') ? '#dc2626' : '#b45309'
                  }}>
                    {log.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handlePrintProsecutionLetter(log)}
                      title="طباعة كتاب إحالة للنيابة A4"
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
                      <Printer size={14} /> إحالة النيابة
                    </button>

                    {!log.status.includes('أحيل للنيابة') && (
                      <button
                        onClick={() => handleReferToProsecution(log.id)}
                        title="تسجيل إحالة رسمية للنيابة العامة"
                        style={{
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        <Scale size={14} /> إحالة
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Log Modal */}
      {isAddLogOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '560px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>تسجيل محضر استدلالات وبلاغ أمني جديد</h3>
            <form onSubmit={handleAddLog}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>المركز / جهة القيد</label>
                  <select
                    value={logForm.station}
                    onChange={(e) => setLogForm({ ...logForm, station: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="مركز شرطة أوباري المدينة">مركز شرطة أوباري المدينة</option>
                    <option value="مركز شرطة الغريفة">مركز شرطة الغريفة</option>
                    <option value="قسم البحث الجنائي">قسم البحث الجنائي</option>
                    <option value="مركز شرطة بنت بية">مركز شرطة بنت بية</option>
                    <option value="مركز شرطة الحطية">مركز شرطة الحطية</option>
                    <option value="مركز شرطة المشروع">مركز شرطة المشروع</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>رقم المحضر</label>
                  <input
                    type="text"
                    required
                    value={logForm.report_number}
                    onChange={(e) => setLogForm({ ...logForm, report_number: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الشاكي / المبلغ</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الشاكي..."
                    value={logForm.complainant}
                    onChange={(e) => setLogForm({ ...logForm, complainant: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>المشكو في حقه</label>
                  <input
                    type="text"
                    placeholder="اسم المشكو فيه أو مجهول..."
                    value={logForm.accused}
                    onChange={(e) => setLogForm({ ...logForm, accused: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>موضوع البلاغ / الواقعة</label>
                <input
                  type="text"
                  required
                  placeholder="وصف مختصر للواقعة..."
                  value={logForm.subject}
                  onChange={(e) => setLogForm({ ...logForm, subject: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>ملاحظات وتوجيهات المركز</label>
                <textarea
                  rows="3"
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddLogOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  حفظ وقيد المحضر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

