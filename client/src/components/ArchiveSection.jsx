import React, { useState, useMemo } from 'react';
import { Archive, Search, Plus, FileText, Folder, Eye, Download, Calendar, Tag, Shield } from 'lucide-react';
import { printDocumentInIframe } from '../utils/printHelper';

const INITIAL_ARCHIVE = [
  {
    id: 1,
    title: 'إضبارة الملف الأمني والوظيفي - مقدم / الزهره صالح الخيري',
    category: 'أضابير وملفات الضباط',
    ref_number: 'DOC-UBR-2026/891',
    officer_name: 'الزهره صالح عبدالقادر الخيري',
    financial_number: '1082235',
    date: '2026-10-18',
    file_type: 'PDF',
    size: '2.4 MB'
  },
  {
    id: 2,
    title: 'قرار ترقية ضباط الصف والجنود لسنة 2025/2026',
    category: 'قرارات التعيين والترقيات',
    ref_number: 'DOC-MOI-2025/1120',
    officer_name: 'تعميم القوة العمومية',
    financial_number: 'عام',
    date: '2026-09-15',
    file_type: 'PDF',
    size: '4.8 MB'
  },
  {
    id: 3,
    title: 'محضر استلام وتسليم مقار ونقاط وادي الحياة الأمنية',
    category: 'محاضر الاستلام والتسليم',
    ref_number: 'DOC-SEC-2026/044',
    officer_name: 'عقيد / إبراهيم عبدالكريم',
    financial_number: '104921',
    date: '2026-10-05',
    file_type: 'PDF',
    size: '1.8 MB'
  },
  {
    id: 4,
    title: 'مذكرة النيابة العامة بشأن المضبوطات والقضايا المحالة',
    category: 'مراسلات النيابة العامة',
    ref_number: 'DOC-JUST-2026/304',
    officer_name: 'رئيس قسم التحقيق الجنائي',
    financial_number: '1085610',
    date: '2026-10-24',
    file_type: 'PDF',
    size: '950 KB'
  },
  {
    id: 5,
    title: 'المخطط الجغرافي والأمني لنقاط التفتيش ومحطات الوقود أوباري',
    category: 'المخططات والخرائط الأمنية',
    ref_number: 'MAP-OPS-2026/01',
    officer_name: 'غرفة العمليات المركزية',
    financial_number: 'عمليات',
    date: '2026-10-01',
    file_type: 'PDF',
    size: '6.2 MB'
  }
];

export default function ArchiveSection({ forceMembers = [], user = {} }) {
  const [archives, setArchives] = useState(() => {
    const saved = localStorage.getItem('ubari_archive');
    return saved ? JSON.parse(saved) : INITIAL_ARCHIVE;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Doc Form
  const [form, setForm] = useState({
    title: '',
    category: 'أضابير وملفات الضباط',
    ref_number: `DOC-UBR-${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`,
    officer_name: '',
    financial_number: '',
    size: '1.5 MB'
  });

  // Filtered
  const filteredArchives = useMemo(() => {
    return archives.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ref_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.officer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.financial_number.includes(searchTerm);
      return matchCat && matchSearch;
    });
  }, [archives, selectedCategory, searchTerm]);

  // Handle Add Document
  const handleAddDoc = (e) => {
    e.preventDefault();
    if (!form.title) return;
    const newDoc = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      file_type: 'PDF',
      ...form
    };
    const updated = [newDoc, ...archives];
    setArchives(updated);
    localStorage.setItem('ubari_archive', JSON.stringify(updated));
    setIsAddModalOpen(false);
  };

  // Preview or Print Archival Certificate
  const handleViewArchive = (item) => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 25px; color: #0a192f;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px;">
          <div style="text-align: right;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 800;">دولة ليبيا</h3>
            <h2 style="margin: 3px 0; font-size: 18px; font-weight: 900; color: #1e3a8a;">وزارة الداخلية</h2>
            <h4 style="margin: 0; font-size: 13px; color: #475569;">مديرية أمن أوباري | مركز التوثيق والأرشيف الإلكتروني</h4>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 20px; font-weight: 900; color: #1e3a8a;">شهادة قيد وتوثيق مستند أرشيفي</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">مستند مصدق ومحفوظ رقمياً بالأرشيف السيادي</div>
          </div>
          <div style="text-align: left; font-size: 13px;">
            <div><strong>رقم القيد:</strong> ${item.ref_number}</div>
            <div><strong>تاريخ الطباعة:</strong> ${today}</div>
          </div>
        </div>

        <!-- Doc Box -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 16px; color: #1e3a8a; font-size: 17px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
            ${item.title}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 14px; line-height: 2;">
            <div><strong>التصنيف الأرشيفي:</strong> ${item.category}</div>
            <div><strong>تاريخ التوثيق والقيد:</strong> ${item.date}</div>
            <div><strong>المعني بالوثيقة / الضابط:</strong> ${item.officer_name || 'عام بالمديرية'}</div>
            <div><strong>الرقم المالي / الوظيفي:</strong> ${item.financial_number || '---'}</div>
            <div><strong>صيغة الملف وحجمه:</strong> ${item.file_type} (${item.size})</div>
            <div><strong>حالة الحفظ:</strong> <span style="color: #15803d; font-weight: 900;">مؤرشف ومحمي رقمياً</span></div>
          </div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.8; margin-bottom: 35px; background: #fffbeb;">
          <strong>إفادة توثيق رسمية:</strong> تشهد إدارة التوثيق والمعلومات بمديرية أمن أوباري بأن الوثيقة الموضحة بياناتها أعلاه قد تم فحصها ضوئياً وتدقيق أصلها وأرشفتها بالنظام الرقمي المركزي لوزارة الداخلية تحت الحماية المشددة والتشفير الأمني.
        </div>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 50px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 14px;">أمين الأرشيف والتوثيق</div>
            <div style="margin-top: 40px; font-size: 13px;">نقيب / خليفة مسعود</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">رئيس قسم المعلومات والتوثيق</div>
            <div style="margin-top: 40px; font-size: 13px;">مقدم / سالم عبدالسلام</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 40px; font-size: 13px; font-weight: bold; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `شهادة_توثيق_${item.ref_number.replace('/', '-')}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Archive size={28} color="#1e3a8a" />
            الأرشيف الإلكتروني ومستندات الضباط
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | التوثيق الرقمي لأضابير الضباط والأفراد، قرارات الترقية والتعيين، والمستندات السيادية
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
            أرشفة مستند جديد
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي الملفات المؤرشفة</span>
            <Folder size={20} color="#1e3a8a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0a192f' }}>{archives.length} <span style={{ fontSize: '14px', color: '#64748b' }}>ملف مؤمن</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>أضابير الضباط والأفراد</span>
            <FileText size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb' }}>
            {archives.filter(a => a.category.includes('أضابير')).length} <span style={{ fontSize: '14px', color: '#64748b' }}>إضبارة</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>القرارات والمحاضر</span>
            <Tag size={20} color="#0891b2" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0891b2' }}>
            {archives.filter(a => !a.category.includes('أضابير')).length} <span style={{ fontSize: '14px', color: '#64748b' }}>وثيقة</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>مستوى الأمان والتشفير</span>
            <Shield size={20} color="#15803d" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#15803d' }}>مشفر 100%</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'كافة التصنيفات' },
            { id: 'أضابير وملفات الضباط', label: 'أضابير الضباط' },
            { id: 'قرارات التعيين والترقيات', label: 'قرارات الترقيات' },
            { id: 'محاضر الاستلام والتسليم', label: 'محاضر التسليم' },
            { id: 'مراسلات النيابة العامة', label: 'مراسلات النيابة' },
            { id: 'المخططات والخرائط الأمنية', label: 'المخططات الأمنية' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '12px',
                background: selectedCategory === cat.id ? '#1e3a8a' : '#f1f5f9',
                color: selectedCategory === cat.id ? '#ffffff' : '#475569'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث بالعنوان أو الرقم أو الضابط..."
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

      {/* Grid of Documents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredArchives.map(item => (
          <div
            key={item.id}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: '#eff6ff',
                  color: '#1e3a8a'
                }}>
                  {item.category}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{item.ref_number}</span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0a192f', margin: '0 0 10px', lineHeight: 1.5 }}>
                {item.title}
              </h3>

              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.8 }}>
                <div><strong>المعني:</strong> {item.officer_name || 'عام بالمديرية'}</div>
                <div><strong>تاريخ التوثيق:</strong> {item.date}</div>
                <div><strong>الملف:</strong> {item.file_type} ({item.size})</div>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => handleViewArchive(item)}
                style={{
                  background: '#1e3a8a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Eye size={14} /> معاينة وطباعة الوثيقة
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '540px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>أرشفة وتوثيق مستند رسمي جديد</h3>
            <form onSubmit={handleAddDoc}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>عنوان الوثيقة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إضبارة التعيين - ملازم أول / ..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>التصنيف الأرشيفي</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="أضابير وملفات الضباط">أضابير وملفات الضباط</option>
                    <option value="قرارات التعيين والترقيات">قرارات التعيين والترقيات</option>
                    <option value="محاضر الاستلام والتسليم">محاضر الاستلام والتسليم</option>
                    <option value="مراسلات النيابة العامة">مراسلات النيابة العامة</option>
                    <option value="المخططات والخرائط الأمنية">المخططات والخرائط الأمنية</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>رقم الإشارة / القيد</label>
                  <input
                    type="text"
                    value={form.ref_number}
                    onChange={(e) => setForm({ ...form, ref_number: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>المعني بالوثيقة (الاسم)</label>
                  <input
                    type="text"
                    placeholder="اسم الضابط إن وجد..."
                    value={form.officer_name}
                    onChange={(e) => setForm({ ...form, officer_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الرقم المالي</label>
                  <input
                    type="text"
                    placeholder="الرقم المالي إن وجد..."
                    value={form.financial_number}
                    onChange={(e) => setForm({ ...form, financial_number: e.target.value })}
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
                  حفظ وتوثيق المستند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

