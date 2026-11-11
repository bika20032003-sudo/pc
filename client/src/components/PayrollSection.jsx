import React, { useState, useMemo } from 'react';
import { CreditCard, Search, Download, Printer, Filter, DollarSign, Building, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import { printDocumentInIframe } from '../utils/printHelper';

export default function PayrollSection({ forceMembers = [], user = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Compute calculated payroll for forceMembers
  const payrollData = useMemo(() => {
    return forceMembers.map((member, idx) => {
      const basicSalary = Number(member.basic_salary) || 2200;
      const riskAllowance = 350; // علاوة خطر وميدان
      const socialSecurity = Math.round(basicSalary * 0.05125); // صندوق الضمان 5.125%
      const solidarity = Math.round(basicSalary * 0.01); // التضامن 1%
      const penaltyDeduction = member.penalty_days ? (basicSalary / 30) * Number(member.penalty_days) : 0;
      const totalDeductions = socialSecurity + solidarity + penaltyDeduction;
      const netSalary = (basicSalary + riskAllowance) - totalDeductions;

      return {
        id: member.id || idx + 1,
        name: member.name || 'عضو شرطة',
        job_number: member.job_number || member.financial_number || `MOI-${1000 + idx}`,
        national_id: member.national_id || '---',
        rank: member.job_title || 'شرطي',
        department: member.department || 'مديرية أمن أوباري',
        bank_name: member.bank_name || 'مصرف الصحاري - فرع أوباري',
        bank_branch: member.bank_branch || 'فرع أوباري',
        account_number: member.account_number || `0041-8892-${String(1000 + idx).padStart(4, '0')}`,
        basic_salary: basicSalary,
        risk_allowance: riskAllowance,
        social_security: socialSecurity,
        solidarity: solidarity,
        penalty_deduction: penaltyDeduction,
        total_deductions: totalDeductions,
        net_salary: netSalary
      };
    });
  }, [forceMembers]);

  // Banks List
  const bankOptions = useMemo(() => {
    const set = new Set();
    payrollData.forEach(p => {
      if (p.bank_name) set.add(p.bank_name);
    });
    return Array.from(set);
  }, [payrollData]);

  // Filtered
  const filteredData = useMemo(() => {
    return payrollData.filter(item => {
      const matchBank = selectedBank === 'all' || item.bank_name === selectedBank;
      const matchSearch = !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.job_number).includes(searchTerm) ||
        String(item.account_number).includes(searchTerm) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase());
      return matchBank && matchSearch;
    });
  }, [payrollData, selectedBank, searchTerm]);

  // Totals
  const totals = useMemo(() => {
    const totalBasic = filteredData.reduce((acc, curr) => acc + curr.basic_salary, 0);
    const totalNet = filteredData.reduce((acc, curr) => acc + curr.net_salary, 0);
    const totalDeductions = filteredData.reduce((acc, curr) => acc + curr.total_deductions, 0);
    return { totalBasic, totalNet, totalDeductions };
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Export to Excel
  const handleExportExcel = () => {
    const exportRows = filteredData.map((row, idx) => ({
      'ر.م': idx + 1,
      'الاسم الرباعي': row.name,
      'الرقم المالي': row.job_number,
      'الرقم الوطني': row.national_id,
      'الرتبة / الوظيفة': row.rank,
      'جهة التبعية': row.department,
      'المصرف': row.bank_name,
      'رقم الحساب المصرفي': row.account_number,
      'المرتب الأساسي': row.basic_salary,
      'علاوة الخطر': row.risk_allowance,
      'استقطاع الضمان 5.125%': row.social_security,
      'استقطاع التضامن 1%': row.solidarity,
      'إجمالي الاستقطاعات': row.total_deductions,
      'صافي المرتب المستحق': row.net_salary
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'كشف المرتبات');
    XLSX.writeFile(wb, `كشف_مرتبات_أمن_أوباري_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Print Bank Transfer Sheet A4
  const handlePrintBankRoster = () => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const printRows = filteredData.slice(0, 28); // 1-page fit
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #0a192f;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px;">
          <div style="text-align: right;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 800;">دولة ليبيا - وزارة الداخلية</h3>
            <h2 style="margin: 3px 0; font-size: 18px; font-weight: 900; color: #1e3a8a;">مديرية أمن أوباري</h2>
            <h4 style="margin: 0; font-size: 13px; color: #475569;">الشؤون المالية والميزانية | قسم المرتبات</h4>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 20px; font-weight: 900; color: #1e3a8a;">حوالة إيداع رواتب القوة العمومية بالمصارف</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">عن شهر: ${new Date().toLocaleDateString('ar-LY', { month: 'long', year: 'numeric' })}</div>
          </div>
          <div style="text-align: left; font-size: 13px;">
            <div><strong>التاريخ:</strong> ${today}</div>
            <div><strong>المصرف المحال إليه:</strong> ${selectedBank === 'all' ? 'كافة المصارف' : selectedBank}</div>
          </div>
        </div>

        <!-- Summary -->
        <div style="display: flex; justify-content: space-around; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 20px; font-size: 13px;">
          <div><strong>عدد الأعضاء:</strong> ${filteredData.length} عضو</div>
          <div><strong>إجمالي الرواتب الأساسية:</strong> ${totals.totalBasic.toLocaleString('ar-LY')} د.ل</div>
          <div><strong>إجمالي الاستقطاعات:</strong> ${totals.totalDeductions.toLocaleString('ar-LY')} د.ل</div>
          <div><strong>صافي المبلغ المحال:</strong> <span style="color: #1e3a8a; font-weight: 900;">${totals.totalNet.toLocaleString('ar-LY')} د.ل</span></div>
        </div>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 35px; text-align: center;">ت</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الاسم الرباعي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 85px;">الرقم المالي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 140px;">المصرف والفرع</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 120px;">رقم الحساب المصرفي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 85px;">الأساسي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 75px;">الاستقطاع</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 95px;">الصافي المحول</th>
            </tr>
          </thead>
          <tbody>
            ${printRows.map((r, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${r.name}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.job_number}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.bank_name}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-family: monospace; direction: ltr; text-align: right;">${r.account_number}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.basic_salary.toLocaleString('ar-LY')}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; color: #dc2626;">${r.total_deductions.toLocaleString('ar-LY')}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #15803d;">${r.net_salary.toLocaleString('ar-LY')} د.ل</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 35px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 13px;">المراجع المالي الداخلي</div>
            <div style="margin-top: 35px; font-size: 12px;">أ. الطاهر مسعود الشريف</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">رئيس القسم المالي</div>
            <div style="margin-top: 35px; font-size: 12px;">مقدم / سالم محمد الناجم</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 35px; font-size: 12px; font-weight: bold; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `كشف_حوالة_رواتب_${selectedBank}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={28} color="#1e3a8a" />
            منظومة المرتبات وكشوفات المصارف
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | الشؤون المالية والميزانية، حساب الاستقطاعات القانونية والضمان، وتجهيز حوالات المصارف
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
            تصدير إكسيل (Excel)
          </button>

          <button
            onClick={handlePrintBankRoster}
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
            <Printer size={16} />
            طباعة كشف الحوالة المصرفية A4
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>عدد الأعضاء المسجلين</span>
            <Building size={20} color="#1e3a8a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0a192f' }}>
            {filteredData.length.toLocaleString('ar-LY')} <span style={{ fontSize: '14px', color: '#64748b' }}>عضو</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي الرواتب الأساسية</span>
            <DollarSign size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563eb' }}>
            {totals.totalBasic.toLocaleString('ar-LY')} <span style={{ fontSize: '14px', color: '#64748b' }}>د.ل</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي الاستقطاعات (ضمان + تضامن)</span>
            <CreditCard size={20} color="#dc2626" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626' }}>
            {totals.totalDeductions.toLocaleString('ar-LY')} <span style={{ fontSize: '14px', color: '#64748b' }}>د.ل</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>صافي المبلغ المحول للمصارف</span>
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a' }}>
            {totals.totalNet.toLocaleString('ar-LY')} <span style={{ fontSize: '14px', color: '#64748b' }}>د.ل</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>تصفية حسب المصرف:</label>
          <select
            value={selectedBank}
            onChange={(e) => { setSelectedBank(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none',
              minWidth: '220px'
            }}
          >
            <option value="all">كافة المصارف التجارية</option>
            {bankOptions.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم المالي أو رقم الحساب..."
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

      {/* Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
              <th style={{ padding: '14px 16px' }}>ر.م</th>
              <th style={{ padding: '14px 16px' }}>اسم الضابط / العضو</th>
              <th style={{ padding: '14px 16px' }}>الرقم المالي</th>
              <th style={{ padding: '14px 16px' }}>الرتبة</th>
              <th style={{ padding: '14px 16px' }}>المصرف والفرع</th>
              <th style={{ padding: '14px 16px' }}>رقم الحساب المصرفي</th>
              <th style={{ padding: '14px 16px' }}>المرتب الأساسي</th>
              <th style={{ padding: '14px 16px' }}>علاوة خطر</th>
              <th style={{ padding: '14px 16px' }}>الاستقطاعات</th>
              <th style={{ padding: '14px 16px' }}>الصافي المستحق</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>{row.name}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{row.job_number}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#eff6ff', color: '#1e3a8a', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                    {row.rank}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{row.bank_name}</td>
                <td style={{ padding: '14px 16px', direction: 'ltr', textAlign: 'right', fontFamily: 'monospace' }}>
                  {row.account_number}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.basic_salary.toLocaleString('ar-LY')} د.ل</td>
                <td style={{ padding: '14px 16px', color: '#2563eb', fontWeight: 700 }}>+{row.risk_allowance} د.ل</td>
                <td style={{ padding: '14px 16px', color: '#dc2626', fontWeight: 700 }}>-{row.total_deductions.toLocaleString('ar-LY')} د.ل</td>
                <td style={{ padding: '14px 16px', fontWeight: 900, color: '#15803d', fontSize: '14px' }}>
                  {row.net_salary.toLocaleString('ar-LY')} د.ل
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            عرض صفحة <strong>{currentPage}</strong> من أصل <strong>{totalPages}</strong> (إجمالي النتائج: {filteredData.length})
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

