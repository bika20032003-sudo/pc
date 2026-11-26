import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  Printer,
  FileSpreadsheet,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import initialDepartments from '../data/departments_data.json';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import ForceNameAutocomplete from './ForceNameAutocomplete';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';

const STORAGE_KEY = 'ubari_departments';

function normalizeHeadDisplay(head) {
  if (!head || String(head).trim() === '' || String(head).trim() === 'null') {
    return 'غير محدد';
  }
  return String(head).trim();
}

function isHeadAssigned(head) {
  const val = normalizeHeadDisplay(head);
  return val !== 'غير محدد';
}

export default function DepartmentsSection({ forceMembers = [] }) {
  const [departments, setDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading departments from localStorage:', e);
    }
    return initialDepartments;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [headFilter, setHeadFilter] = useState('all'); // 'all' | 'assigned' | 'unassigned'

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formName, setFormName] = useState('');
  const [formHead, setFormHead] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
    } catch (e) {
      console.warn('Error saving departments to localStorage:', e);
    }
  }, [departments]);

  const stats = useMemo(() => {
    const total = departments.length;
    const assigned = departments.filter((d) => isHeadAssigned(d.HeadName)).length;
    const unassigned = total - assigned;
    return { total, assigned, unassigned };
  }, [departments]);

  const filteredDepartments = useMemo(() => {
    const q = normalizeArabicText(searchTerm.trim());
    return departments.filter((d) => {
      const assigned = isHeadAssigned(d.HeadName);
      if (headFilter === 'assigned' && !assigned) return false;
      if (headFilter === 'unassigned' && assigned) return false;

      if (!q) return true;
      const nameMatch = normalizeArabicText(d.DepartmentName || '').includes(q);
      const headMatch = normalizeArabicText(normalizeHeadDisplay(d.HeadName)).includes(q);
      return nameMatch || headMatch;
    });
  }, [departments, searchTerm, headFilter]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormName('');
    setFormHead('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormName(dept.DepartmentName || '');
    setFormHead(isHeadAssigned(dept.HeadName) ? dept.HeadName : '');
    setIsModalOpen(true);
  };

  const handleSaveDepartment = (e) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) return;
    const cleanHead = formHead.trim() ? formHead.trim() : 'غير محدد';

    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.DepartmentID === editingDept.DepartmentID
            ? { ...d, DepartmentName: cleanName, HeadName: cleanHead }
            : d
        )
      );
    } else {
      const nextId =
        departments.reduce((max, d) => Math.max(max, Number(d.DepartmentID) || 0), 0) + 1;
      setDepartments((prev) => [
        ...prev,
        {
          DepartmentID: nextId,
          DepartmentName: cleanName,
          HeadName: cleanHead
        }
      ]);
    }
    setIsModalOpen(false);
    setEditingDept(null);
    setFormName('');
    setFormHead('');
  };

  const handleDeleteDepartment = (dept) => {
    if (!window.confirm(`هل أنت متأكد من حذف القسم: "${dept.DepartmentName}"؟`)) {
      return;
    }
    setDepartments((prev) => prev.filter((d) => d.DepartmentID !== dept.DepartmentID));
  };

  const handleExportExcel = () => {
    const headers = ['ت', 'اسم القسم / المركز', 'الرئيس المعتمد'];
    const rows = filteredDepartments.map((d, idx) => [
      `"${idx + 1}"`,
      `"${(d.DepartmentName || '').replace(/"/g, '""')}"`,
      `"${normalizeHeadDisplay(d.HeadName).replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `الأقسام_والمراكز_مديرية_أمن_أوباري_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintDepartments = () => {
    const today = new Date().toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const html = `
      <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 8px 14px; color: #0f172a; background: #ffffff;">
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            thead { display: table-header-group !important; }
          }
        </style>
        <div style="height: 4px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 8px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; margin-bottom: 10px;">
          <tr>
            <td style="width: 34%; text-align: right; vertical-align: middle;">
              <div style="font-size: 14px; font-weight: 900; color: #1e3a8a;">دولة ليبيــــا</div>
              <div style="font-size: 13px; font-weight: 800; color: #0a192f;">وزارة الداخليـــــة</div>
              <div style="font-size: 12px; font-weight: 800; color: #0369a1;">مديرية أمن أوبــــاري</div>
            </td>
            <td style="width: 32%; text-align: center; vertical-align: middle;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 52px; height: 52px; object-fit: contain; display: block; margin: 0 auto 4px;" />
              <div style="display: inline-block; background: #0a192f; color: #ffffff; padding: 4px 14px; border-radius: 6px; font-size: 13px; font-weight: 900; border: 1px solid #d4af37;">
                كشف الأقسام والمراكز المعتمدة
              </div>
            </td>
            <td style="width: 34%; text-align: left; vertical-align: middle; font-size: 11px; font-weight: 700; color: #334155;">
              <div>التاريخ: ${today}</div>
              <div>عدد الأقسام: ${filteredDepartments.length}</div>
            </td>
          </tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right; border: 1.5px solid #0a192f;">
          <thead>
            <tr style="background: #0a192f; color: #ffffff;">
              <th style="padding: 8px 6px; border: 1px solid #475569; width: 45px; text-align: center;">ت</th>
              <th style="padding: 8px 12px; border: 1px solid #475569;">القسم / المركز</th>
              <th style="padding: 8px 12px; border: 1px solid #475569;">الرئيس المعتمد</th>
            </tr>
          </thead>
          <tbody>
            ${filteredDepartments
              .map(
                (d, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800;">${idx + 1}</td>
                <td style="padding: 6px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #0a192f;">${d.DepartmentName || ''}</td>
                <td style="padding: 6px 12px; border: 1px solid #cbd5e1; font-weight: 700; color: ${isHeadAssigned(d.HeadName) ? '#1e3a8a' : '#64748b'};">${normalizeHeadDisplay(d.HeadName)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
    printDocumentInIframe(html, 'كشف_الأقسام_والمراكز_مديرية_أمن_أوباري');
  };

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header Bar */}
      <div className="module-view-header">
        <div className="module-title-box">
          <div className="title-gold-bar" />
          <div>
            <h1>الأقسام والمراكز</h1>
            <span>مديرية أمن أوباري | إدارة الأقسام والمراكز المعتمدة ({departments.length})</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-toolbar-excel"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير إكسل</span>
          </button>

          <button
            type="button"
            className="btn-toolbar-print"
            onClick={handlePrintDepartments}
          >
            <Printer size={16} />
            <span>طباعة الكشف</span>
          </button>

          <button
            type="button"
            className="btn-official-primary"
            onClick={handleOpenAdd}
          >
            <span className="btn-icon-wrapper">
              <Plus size={16} strokeWidth={2.6} />
            </span>
            <span>إضافة قسم جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-summary-grid" style={{ marginBottom: '20px' }}>
        <div
          className="stat-box-card"
          onClick={() => setHeadFilter('all')}
          style={{ cursor: 'pointer', border: headFilter === 'all' ? '2px solid #1e3a8a' : undefined }}
        >
          <div className="stat-box-icon" style={{ background: '#eff6ff', color: '#1e3a8a' }}>
            <Building2 size={22} />
          </div>
          <div className="stat-box-content">
            <h3>{stats.total}</h3>
            <p>إجمالي الأقسام والمراكز</p>
          </div>
        </div>

        <div
          className="stat-box-card"
          onClick={() => setHeadFilter('assigned')}
          style={{ cursor: 'pointer', border: headFilter === 'assigned' ? '2px solid #15803d' : undefined }}
        >
          <div className="stat-box-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <UserCheck size={22} />
          </div>
          <div className="stat-box-content">
            <h3>{stats.assigned}</h3>
            <p>أقسام محددة الرئيس المعتمد</p>
          </div>
        </div>

        <div
          className="stat-box-card"
          onClick={() => setHeadFilter('unassigned')}
          style={{ cursor: 'pointer', border: headFilter === 'unassigned' ? '2px solid #b45309' : undefined }}
        >
          <div className="stat-box-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <AlertCircle size={22} />
          </div>
          <div className="stat-box-content">
            <h3>{stats.unassigned}</h3>
            <p>أقسام غير محدد رئيسها</p>
          </div>
        </div>
      </div>

      {/* Main Departments Panel */}
      <div className="table-panel-card" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Official 4-color Libyan Ribbon */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', display: 'flex' }}>
          <div style={{ flex: 1, background: '#e11d48' }} />
          <div style={{ flex: 2, background: '#000000' }} />
          <div style={{ flex: 1, background: '#16a34a' }} />
        </div>

        {/* Search & Filter Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
          marginTop: '6px',
          marginBottom: '18px'
        }}>
          <div className="table-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="بحث باسم القسم أو المركز أو الرئيس المعتمد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`filter-pill-btn ${headFilter === 'all' ? 'active' : ''}`}
              onClick={() => setHeadFilter('all')}
            >
              الكل ({stats.total})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${headFilter === 'assigned' ? 'active' : ''}`}
              onClick={() => setHeadFilter('assigned')}
            >
              محدد الرئيس ({stats.assigned})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${headFilter === 'unassigned' ? 'active' : ''}`}
              onClick={() => setHeadFilter('unassigned')}
            >
              غير محدد ({stats.unassigned})
            </button>
          </div>
        </div>

        {/* Departments Cards Grid */}
        {filteredDepartments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: 700 }}>
            لا توجد أقسام مطابقة لمعايير البحث الحالية
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '14px'
          }}>
            {filteredDepartments.map((dept, idx) => {
              const headText = normalizeHeadDisplay(dept.HeadName);
              const assigned = isHeadAssigned(dept.HeadName);

              return (
                <div
                  key={dept.DepartmentID}
                  style={{
                    background: '#ffffff',
                    border: assigned ? '1.5px solid #bfdbfe' : '1px solid #e2e8f0',
                    borderRight: `4px solid ${assigned ? '#1e3a8a' : '#d4af37'}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(10, 25, 47, 0.03)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '8px',
                          background: '#eff6ff',
                          color: '#1e3a8a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 900,
                          flexShrink: 0
                        }}>
                          {idx + 1}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#0a192f' }}>
                          {dept.DepartmentName}
                        </h3>
                      </div>

                      <Building2 size={16} color={assigned ? '#1e3a8a' : '#94a3b8'} style={{ flexShrink: 0 }} />
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: assigned ? '#0f172a' : '#64748b',
                      background: assigned ? '#f0fdf4' : '#f8fafc',
                      border: assigned ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      padding: '6px 10px',
                      borderRadius: '8px'
                    }}>
                      {assigned ? (
                        <CheckCircle2 size={15} color="#15803d" style={{ flexShrink: 0 }} />
                      ) : (
                        <UserCheck size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
                      )}
                      <span style={{ color: '#475569', fontWeight: 800 }}>الرئيس المعتمد:</span>
                      <span style={{ color: assigned ? '#15803d' : '#64748b', fontWeight: 800 }}>
                        {headText}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions: Edit & Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(dept)}
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1e3a8a',
                        cursor: 'pointer',
                        padding: '5px 12px',
                        borderRadius: '7px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="تعديل بيانات القسم والرئيس المعتمد"
                    >
                      <Edit2 size={13} color="#2563eb" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: '5px 12px',
                        borderRadius: '7px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="حذف القسم"
                    >
                      <Trash2 size={13} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              border: '1.5px solid #d4af37'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #d4af37'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={20} color="#d4af37" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>
                  {editingDept ? 'تعديل القسم والرئيس المعتمد' : 'إضافة قسم أو مركز جديد'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  اسم القسم / المركز:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قسم الشؤون القانونية"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  الرئيس المعتمد (اختيار من القوة العمومية أو كتابة الاسم مباشرة):
                </label>
                <ForceNameAutocomplete
                  value={formHead}
                  onChange={(val) => setFormHead(val)}
                  onSelect={(member) => {
                    const formatted =
                      member.rank && member.type === 'شرطي'
                        ? `${member.rank} / ${member.name}`
                        : member.name;
                    setFormHead(formatted);
                  }}
                  forceMembers={forceMembers}
                  placeholder="اكتب اسم الرئيس المعتمد أو اتركه فارغاً (غير محدد)..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-official-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)',
                    color: '#ffffff',
                    border: '1px solid #d4af37',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={15} />
                  <span>{editingDept ? 'حفظ التعديلات' : 'إضافة القسم'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
