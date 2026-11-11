import React, { useState, useEffect, useMemo } from 'react';
import { Wrench, Car, Search, Plus, Calendar, DollarSign, CheckCircle2, Clock, Printer, AlertTriangle, Eye, Trash2, FileText, X } from 'lucide-react';
import initialMaintenance from '../data/maintenance_data.json';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64.js';
import { createOfficialLetterHtml } from '../utils/officialLetterTemplate.js';

export default function MaintenanceSection({ forceMembers = [], user = {} }) {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('ubari_maintenance');
    return saved ? JSON.parse(saved) : initialMaintenance;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState(null);

  // New Maintenance Form
  const [form, setForm] = useState({
    vehicle_plate: '31595',
    vehicle_type: 'هونداي ستار فيرد',
    maintenance_type: 'تغيير زيت وفلاتر',
    odometer: 45000,
    parts_replaced: 'زيت محرك 10W-40 (6 لتر) + فلتر زيت أصلي',
    mechanic_name: 'الورشة المركزية بالمديرية - فني / صالح علي',
    cost: '320 د.ل'
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ubari_maintenance', JSON.stringify(records));
  }, [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchType = selectedType === 'all' || r.maintenance_type.includes(selectedType);
      const matchSearch = !searchTerm ||
        r.vehicle_plate.includes(searchTerm) ||
        r.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.parts_replaced.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.mechanic_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [records, selectedType, searchTerm]);

  // Handle Add Record
  const handleAddRecord = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      maintenance_date: new Date().toISOString().slice(0, 10),
      ...form,
      odometer: Number(form.odometer)
    };
    setRecords([newEntry, ...records]);
    setIsAddModalOpen(false);
  };

  // Handle Delete Record
  const handleDeleteRecord = (id) => {
    if (window.confirm('هل أنت متأكد من حذف بطاقة الصيانة هذه نهائياً من السجلات؟')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // Official Letter for Maintenance / Parts Supply
  const handlePrintOfficialMaintenanceLetter = (record) => {
    const letterHtml = createOfficialLetterHtml({
      reference: `MECH-${new Date().getFullYear()}/${record.id % 1000}`,
      recordNumber: '114/ص',
      department: 'قسم الآليات والمركبات | شعبة الصيانة الفنية',
      recipientTitle: 'إلى السيد / مدير الإدارة العامة للشؤون الفنية والآليات - وزارة الداخلية',
      subject: `إذن صيانة وإصلاح الآلية الشرطية لوحة (${record.vehicle_plate} / شرطة)`,
      greeting: 'بعد التحية والتقدير والاحترام ،،،',
      bodyText: `نحيل إليكم طيه تقرير الفحص الفني المبدئي للآلية الشرطية التابعة لمديرية أمن أوباري نوع (${record.vehicle_type}) والمقيدة برقم لوحة (${record.vehicle_plate} / شرطة) بقراءة عداد (${Number(record.odometer).toLocaleString('ar-LY')} كم).

حيث تبيّن حاجتها الماسة لإجراء أعمال صيانة (${record.maintenance_type}) واستبدال قطع الغيار والمستهلكات التالية:
(${record.parts_replaced})، بتكلفة تقديرية بلغت (${record.cost}).

عليه؛ يرجى التفضل بالموافقة والإيعاز للجهات المختصة طرفكم لتوفير قطع الغيار اللازمة وصرف أمر التشغيل للورشة المعتمدة، ليتسنى إعادة الآلية للخدمة الميدانية وتأمين القطاع الأمني بالمنطقة.`,
      signerName: 'لواء / موسى سعد محمد',
      signerTitle: 'مدير مديرية أمن أوباري',
      deptOfficerName: 'عقيد / إبراهيم عبدالكريم',
      deptOfficerTitle: 'رئيس قسم الآليات والمركبات',
      ccList: [
        'مكتب السيد وكيل وزارة الداخلية للشؤون الفنية',
        'الإدارة العامة للآليات والمركبات بالوزارة',
        'قسم الشؤون الإدارية والمالية بالمديرية',
        'الملف الدوري والمحفوظات'
      ]
    });
    printDocumentInIframe(letterHtml, `خطاب_صيانة_آلية_${record.vehicle_plate}`);
  };

  // Print Job Card A4
  const handlePrintJobCard = (record) => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = `
      <div style="font-family: 'Cairo', 'Amiri', Arial, sans-serif; direction: rtl; padding: 25px; color: #0a192f;">
        <!-- الشريط الوطني الليبي المعتمد (4 ألوان) -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <!-- الترويسة الرسمية لوزارة الداخلية -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px;">
          <tr>
            <td style="text-align: right; width: 38%; vertical-align: middle;">
              <div style="font-size: 14px; font-weight: 800; color: #1e3a8a;">دولة ليبيا - وزارة الداخلية</div>
              <div style="font-size: 16px; font-weight: 900; color: #0a192f;">مديرية أمن أوباري</div>
              <div style="font-size: 12px; color: #475569; font-weight: 700;">قسم الآليات والمركبات | ورشة الصيانة المركزية</div>
            </td>
            <td style="text-align: center; width: 24%; vertical-align: middle;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 70px; height: 70px; object-fit: contain; margin: 0 auto; display: block;" />
              <div style="font-size: 9.5px; font-weight: 800; color: #d4af37; margin-top: 2px;">مديرية أمن أوباري</div>
            </td>
            <td style="text-align: left; width: 38%; vertical-align: middle; font-size: 12px;">
              <div><strong>رقم البطاقة:</strong> JOB-UBR-${record.id}</div>
              <div><strong>تاريخ الإصدار:</strong> ${today}م</div>
              <div><strong>تاريخ الصيانة:</strong> ${record.maintenance_date}م</div>
            </td>
          </tr>
        </table>

        <!-- عنوان البطاقة -->
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 20px; font-weight: 900; color: #1e3a8a;">بطاقة شغل وفحص فني لآلية شرطية</div>
          <div style="font-size: 13px; color: #64748b; margin-top: 3px;">إذن صيانة وإصلاح معتمد رسمياً</div>
        </div>

        <!-- Vehicle Box -->
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 18px;">
          <h4 style="margin: 0 0 12px; color: #1e3a8a; font-size: 15px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px;">
            أولاً: بيانات الآلية الخاضعة للصيانة
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; font-size: 13.5px;">
            <div><strong>رقم لوحة الآلية:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: 900; color: #1e3a8a;">${record.vehicle_plate} / شرطة</span></div>
            <div><strong>نوع وطراز المركبة:</strong> ${record.vehicle_type}</div>
            <div><strong>قراءة العداد (كم):</strong> ${Number(record.odometer).toLocaleString('ar-LY')} كم</div>
          </div>
        </div>

        <!-- Service Details -->
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px; color: #1e3a8a; font-size: 15px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px;">
            ثانياً: الأعمال المنجزة وقطع الغيار
          </h4>
          <div style="font-size: 13.5px; line-height: 2;">
            <div><strong>نوع الصيانة:</strong> <span style="font-weight: 800; color: #0a192f;">${record.maintenance_type}</span></div>
            <div><strong>قطع الغيار والمستهلكات:</strong> ${record.parts_replaced}</div>
            <div><strong>الورشة / الفني المسؤول:</strong> ${record.mechanic_name}</div>
            <div><strong>التكلفة الإجمالية:</strong> <span style="font-weight: 900; color: #15803d; font-size: 15px;">${record.cost}</span></div>
          </div>
        </div>

        <!-- Technical Certification -->
        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; font-size: 13px; line-height: 1.8; margin-bottom: 25px; background: #f0fdf4;">
          <strong>تقرير الفحص الفني:</strong> تمت المعاينة والتجربة الفنية للآلية بعد إتمام الصيانة، وتأكدت جاهزيتها التامة واستيفاء معايير السلامة للخدمة الميدانية بقطاع مديرية أمن أوباري.
        </div>

        <!-- Signatures & Stamp -->
        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 30px;">
          <tr>
            <td style="width: 32%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 13px; color: #1e3a8a;">الفني المسؤول عن الصيانة</div>
              <div style="margin-top: 35px; font-size: 12.5px; font-weight: 800; border-top: 1px dashed #64748b; padding-top: 5px; width: 80%; margin: 0 auto;">${record.mechanic_name.split('-')[1]?.trim() || 'فني / صالح علي'}</div>
            </td>
            <td style="width: 36%; vertical-align: middle;">
              <div style="width: 72px; height: 72px; border-radius: 50%; border: 1.5px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5px; font-weight: 900; color: #1e3a8a; margin: 0 auto; line-height: 1.25; background: rgba(30,58,138,0.02);">
                <span>دولة ليبيا</span>
                <span>وزارة الداخلية</span>
                <span style="font-size: 8px; color: #000000; font-weight: 900;">مديرية أمن أوباري</span>
                <span style="color: #b91c1c; font-size: 7px; margin-top: 1px;">قسم الآليات</span>
              </div>
            </td>
            <td style="width: 32%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 13px; color: #1e3a8a;">يعتمد / مدير أمن أوباري</div>
              <div style="margin-top: 35px; font-size: 12.5px; font-weight: 800; border-top: 1px dashed #64748b; padding-top: 5px; width: 80%; margin: 0 auto; color: #1e3a8a;">لواء / موسى سعد البدين</div>
            </td>
          </tr>
        </table>
      </div>
    `;
    printDocumentInIframe(html, `أمر_صيانة_${record.vehicle_plate}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wrench size={28} color="#1e3a8a" />
            ورشة الصيانة الفنية لأسطول الآليات
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | صيانة الدوريات والمركبات الشرطية، غيار الزيوت والإطارات، أوامر الفحص والشغل الفني
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
            إصدار بطاقة صيانة آلية
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>أوامر الصيانة المنجزة</span>
            <CheckCircle2 size={20} color="#15803d" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0a192f' }}>{records.length} <span style={{ fontSize: '14px', color: '#64748b' }}>أمر صيانة</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>مركبات قيد الصيانة بالورشة</span>
            <Clock size={20} color="#ea580c" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#ea580c' }}>4 <span style={{ fontSize: '14px', color: '#64748b' }}>آليات</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>جاهزية الأسطول</span>
            <Car size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb' }}>95.6% <span style={{ fontSize: '14px', color: '#64748b' }}>88 آلية جاهزة</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>مصروفات الصيانة المسجلة</span>
            <DollarSign size={20} color="#0f172a" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>2,180 د.ل</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'كافة أنواع الصيانة' },
            { id: 'تغيير زيت', label: '🛢️ تغيير زيت وفلاتر' },
            { id: 'إطارات', label: '🔘 إطارات وتوازن' },
            { id: 'ميكانيكا', label: '⚙️ ميكانيكا وعمرة' }
          ].map(tp => (
            <button
              key={tp.id}
              onClick={() => setSelectedType(tp.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '13px',
                background: selectedType === tp.id ? '#1e3a8a' : '#f1f5f9',
                color: selectedType === tp.id ? '#ffffff' : '#475569'
              }}
            >
              {tp.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث برقم اللوحة أو الفني..."
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

      {/* Records Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
              <th style={{ padding: '14px 16px' }}>رقم اللوحة</th>
              <th style={{ padding: '14px 16px' }}>نوع وطراز المركبة</th>
              <th style={{ padding: '14px 16px' }}>تاريخ الصيانة</th>
              <th style={{ padding: '14px 16px' }}>نوع الخدمة</th>
              <th style={{ padding: '14px 16px' }}>قراءة العداد</th>
              <th style={{ padding: '14px 16px' }}>قطع الغيار والمستهلكات</th>
              <th style={{ padding: '14px 16px' }}>الورشة / الفني</th>
              <th style={{ padding: '14px 16px' }}>التكلفة</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace', fontSize: '14px' }}>
                  {r.vehicle_plate}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>{r.vehicle_type}</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.maintenance_date}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#f1f5f9', color: '#1e3a8a', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                    {r.maintenance_type}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', direction: 'ltr', textAlign: 'right' }}>
                  {Number(r.odometer).toLocaleString('ar-LY')} كم
                </td>
                <td style={{ padding: '14px 16px', color: '#334155', maxWidth: '260px' }}>{r.parts_replaced}</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.mechanic_name}</td>
                <td style={{ padding: '14px 16px', fontWeight: 800, color: '#15803d' }}>{r.cost}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => setPreviewRecord(r)}
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                      title="معاينة بطاقة الصيانة والفحص"
                    >
                      <Eye size={13} /> معاينة
                    </button>
                    <button
                      onClick={() => handlePrintJobCard(r)}
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                      title="طباعة بطاقة الشغل A4"
                    >
                      <Printer size={13} /> طباعة
                    </button>
                    <button
                      onClick={() => handlePrintOfficialMaintenanceLetter(r)}
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
                      title="طباعة خطاب إذن صيانة وتوريد رسمي موجه للوزارة"
                    >
                      <FileText size={13} /> خطاب رسمي 📜
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(r.id)}
                      style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                      title="حذف بطاقة الصيانة نهائياً"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
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
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>تسجيل بطاقة صيانة آلية شرطية</h3>
            <form onSubmit={handleAddRecord}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>رقم اللوحة</label>
                  <input
                    type="text"
                    required
                    value={form.vehicle_plate}
                    onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>نوع وطراز المركبة</label>
                  <input
                    type="text"
                    required
                    value={form.vehicle_type}
                    onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>نوع الصيانة</label>
                  <select
                    value={form.maintenance_type}
                    onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="تغيير زيت وفلاتر">تغيير زيت وفلاتر</option>
                    <option value="تغيير إطارات وتوازن">تغيير إطارات وتوازن</option>
                    <option value="فرامل وهيدروليك">فرامل وهيدروليك</option>
                    <option value="ميكانيكا وعمرة محرك">ميكانيكا وعمرة محرك</option>
                    <option value="كهرباء وتكييف">كهرباء وتكييف</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>قراءة العداد (كم)</label>
                  <input
                    type="number"
                    value={form.odometer}
                    onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>قطع الغيار والمستهلكات</label>
                <input
                  type="text"
                  required
                  value={form.parts_replaced}
                  onChange={(e) => setForm({ ...form, parts_replaced: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الورشة / الفني القائم بالعمل</label>
                  <input
                    type="text"
                    value={form.mechanic_name}
                    onChange={(e) => setForm({ ...form, mechanic_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>التكلفة الإجمالية</label>
                  <input
                    type="text"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
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
                  حفظ البطاقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Card Preview Modal */}
      {previewRecord && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* National ribbon */}
            <div style={{ height: '5px', width: '100%', display: 'flex', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ flex: 1, background: '#e11d48' }}></div>
              <div style={{ flex: 2, background: '#000000' }}></div>
              <div style={{ flex: 1, background: '#16a34a' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={MOI_LOGO_BASE64} alt="شعار وزارة الداخلية" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#1e3a8a' }}>معاينة بطاقة شغل وفحص آلية</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>مديرية أمن أوباري | قسم الآليات والمركبات</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewRecord(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div><strong>رقم اللوحة:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#1e3a8a' }}>{previewRecord.vehicle_plate} / شرطة</span></div>
                <div><strong>نوع المركبة:</strong> {previewRecord.vehicle_type}</div>
                <div><strong>تاريخ الصيانة:</strong> {previewRecord.maintenance_date}</div>
                <div><strong>قراءة العداد:</strong> {Number(previewRecord.odometer).toLocaleString('ar-LY')} كم</div>
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                <div style={{ marginBottom: '6px' }}><strong>نوع الصيانة:</strong> <span style={{ fontWeight: 800, color: '#0a192f' }}>{previewRecord.maintenance_type}</span></div>
                <div style={{ marginBottom: '6px' }}><strong>قطع الغيار:</strong> {previewRecord.parts_replaced}</div>
                <div style={{ marginBottom: '6px' }}><strong>الورشة / الفني:</strong> {previewRecord.mechanic_name}</div>
                <div><strong>التكلفة:</strong> <span style={{ color: '#15803d', fontWeight: 900 }}>{previewRecord.cost}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPreviewRecord(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePrintOfficialMaintenanceLetter(previewRecord);
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={16} /> خطاب رسمي 📜
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePrintJobCard(previewRecord);
                  setPreviewRecord(null);
                }}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} /> طباعة بطاقة الشغل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
