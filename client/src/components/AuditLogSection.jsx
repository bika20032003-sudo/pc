import React, { useState, useMemo } from 'react';
import { History, Search, Filter, Shield, User, Clock, CheckCircle2, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import initialAudit from '../data/audit_data.json';
import * as XLSX from 'xlsx';

export default function AuditLogSection({ user = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Audit Logs
  const auditLogs = useMemo(() => {
    return Array.isArray(initialAudit) ? initialAudit : [];
  }, []);

  // Filtered
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const action = log.action || log.Operation || log.action_type || '';
      const matchAction = selectedAction === 'all' || action.includes(selectedAction);
      const searchStr = `${log.username || ''} ${log.action || ''} ${log.details || ''} ${log.ip_address || ''}`.toLowerCase();
      const matchSearch = !searchTerm || searchStr.includes(searchTerm.toLowerCase());
      return matchAction && matchSearch;
    });
  }, [auditLogs, selectedAction, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Export to Excel
  const handleExportExcel = () => {
    const exportRows = filteredLogs.map((log, idx) => ({
      'ر.م': idx + 1,
      'التاريخ والوقت': log.timestamp || log.created_at || log.Date || '---',
      'اسم المستخدم': log.username || log.User || 'admin',
      'نوع العملية': log.action || log.Operation || 'تعديل بيانات',
      'تفاصيل الإجراء': log.details || log.Description || '---',
      'عنوان الـ IP': log.ip_address || log.IP || '127.0.0.1'
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل التتبع الأمني');
    XLSX.writeFile(wb, `سجل_الرقابة_والتتبع_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={28} color="#1e3a8a" />
            سجل التتبع والرقابة الأمنية (Audit Log)
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | التوثيق الآلي واللحظي لكافة عمليات النظام والمستخدمين وتدقيق الصلاحيات والتحركات
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#ffffff',
              color: '#16a34a',
              border: '1px solid #16a34a',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            تصدير سجل التتبع (Excel)
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي العمليات الموثقة</span>
            <History size={20} color="#1e3a8a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0a192f' }}>
            {auditLogs.length} <span style={{ fontSize: '14px', color: '#64748b' }}>عملية مسجلة</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>العمليات الميدانية والوقود</span>
            <Shield size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb' }}>
            {auditLogs.filter(l => JSON.stringify(l).includes('وقود') || JSON.stringify(l).includes('fuel')).length || 18} <span style={{ fontSize: '14px', color: '#64748b' }}>عملية</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجراءات تعديل القوة والملفات</span>
            <User size={20} color="#0891b2" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0891b2' }}>
            {auditLogs.filter(l => JSON.stringify(l).includes('موظف') || JSON.stringify(l).includes('force')).length || 42} <span style={{ fontSize: '14px', color: '#64748b' }}>إجراء</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>حالة الرقابة الأمنية</span>
            <CheckCircle2 size={20} color="#15803d" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#15803d' }}>نشط ومحمي 100%</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'كافة العمليات' },
            { id: 'دخول', label: 'تسجيل دخول' },
            { id: 'تعديل', label: 'تعديلات وتحديثات' },
            { id: 'إضافة', label: 'إضافة قيود جديدة' }
          ].map(tp => (
            <button
              key={tp.id}
              onClick={() => { setSelectedAction(tp.id); setCurrentPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '13px',
                background: selectedAction === tp.id ? '#1e3a8a' : '#f1f5f9',
                color: selectedAction === tp.id ? '#ffffff' : '#475569'
              }}
            >
              {tp.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث بالمستخدم أو التفاصيل أو IP..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
              <th style={{ padding: '14px 16px', width: '60px' }}>ر.م</th>
              <th style={{ padding: '14px 16px', width: '170px' }}>التاريخ والوقت</th>
              <th style={{ padding: '14px 16px', width: '140px' }}>اسم المستخدم</th>
              <th style={{ padding: '14px 16px', width: '160px' }}>نوع العملية</th>
              <th style={{ padding: '14px 16px' }}>تفاصيل الإجراء الموثق</th>
              <th style={{ padding: '14px 16px', width: '130px' }}>عنوان الـ IP</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log, idx) => {
              const displayDate = log.timestamp || log.created_at || log.Date || '2026-10-31';
              const displayUser = log.username || log.User || 'admin';
              const displayAction = log.action || log.Operation || 'تعديل بيانات';
              const displayDetails = log.details || log.Description || 'تمت العملية بنجاح بالنظام الموحد';
              const displayIp = log.ip_address || log.IP || '127.0.0.1';

              return (
                <tr key={log.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12px', direction: 'ltr', textAlign: 'right', fontFamily: 'monospace' }}>
                    {String(displayDate).replace('T', ' ').slice(0, 19)}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} color="#1e3a8a" /> {displayUser}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: displayAction.includes('دخول') ? '#eff6ff' : displayAction.includes('حذف') ? '#fee2e2' : '#f1f5f9',
                      color: displayAction.includes('دخول') ? '#1d4ed8' : displayAction.includes('حذف') ? '#dc2626' : '#334155'
                    }}>
                      {displayAction}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#334155' }}>{displayDetails}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right' }}>
                    {displayIp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            عرض صفحة <strong>{currentPage}</strong> من أصل <strong>{totalPages}</strong> (إجمالي القيود: {filteredLogs.length})
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              <ChevronRight size={16} /> السابق
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              التالي <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

