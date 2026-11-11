import React, { useState, useMemo } from 'react';
import { CreditCard, Search, Download, Printer, Filter, DollarSign, Building, CheckCircle2, ChevronRight, ChevronLeft, Eye, FileText, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64.js';
import { createOfficialLetterHtml } from '../utils/officialLetterTemplate.js';

export default function PayrollSection({ forceMembers = [], user = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewMember, setPreviewMember] = useState(null);
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
    const printRows = filteredData.slice(0, 30); // 1-page fit
    const html = `
      <div style="font-family: 'Cairo', 'Amiri', Arial, sans-serif; direction: rtl; padding: 20px; color: #0a192f;">
        <!-- الشريط الوطني الليبي المعتمد (4 ألوان) -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <!-- الترويسة الرسمية لوزارة الداخلية -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 16px;">
          <tr>
            <td style="text-align: right; width: 38%; vertical-align: middle;">
              <div style="font-size: 14px; font-weight: 800; color: #1e3a8a;">دولة ليبيا - وزارة الداخلية</div>
              <div style="font-size: 16px; font-weight: 900; color: #0a192f;">مديرية أمن أوباري</div>
              <div style="font-size: 12px; color: #475569; font-weight: 700;">الشؤون المالية والميزانية | قسم المرتبات</div>
            </td>
            <td style="text-align: center; width: 24%; vertical-align: middle;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 68px; height: 68px; object-fit: contain; margin: 0 auto; display: block;" />
              <div style="font-size: 9.5px; font-weight: 800; color: #d4af37; margin-top: 2px;">مديرية أمن أوباري</div>
            </td>
            <td style="text-align: left; width: 38%; vertical-align: middle; font-size: 12px;">
              <div><strong>التاريخ:</strong> ${today}م</div>
              <div><strong>رقم الإحالة:</strong> MOI-UBR-PAY/${new Date().getFullYear()}/${selectedBank !== 'all' ? selectedBank.slice(0, 6) : 'ALL'}</div>
              <div><strong>المصرف المحال إليه:</strong> ${selectedBank === 'all' ? 'كافة المصارف المعتمدة' : selectedBank}</div>
            </td>
          </tr>
        </table>

        <!-- عنوان الكشف -->
        <div style="text-align: center; margin-bottom: 14px;">
          <div style="font-size: 19px; font-weight: 900; color: #1e3a8a;">حوالة إيداع رواتب القوة العمومية بالمصارف</div>
          <div style="font-size: 12.5px; color: #64748b; margin-top: 2px;">عن شهر: ${new Date().toLocaleDateString('ar-LY', { month: 'long', year: 'numeric' })}</div>
        </div>

        <!-- ملخص الإجماليات -->
        <div style="display: flex; justify-content: space-around; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 18px; font-size: 12px;">
          <div><strong>عدد الأعضاء:</strong> ${filteredData.length} عضو</div>
          <div><strong>إجمالي الرواتب الأساسية:</strong> ${totals.totalBasic.toLocaleString('ar-LY')} د.ل</div>
          <div><strong>إجمالي الاستقطاعات:</strong> <span style="color: #dc2626; font-weight: bold;">${totals.totalDeductions.toLocaleString('ar-LY')} د.ل</span></div>
          <div><strong>صافي المبلغ المحال:</strong> <span style="color: #1e3a8a; font-weight: 900; font-size: 13.5px;">${totals.totalNet.toLocaleString('ar-LY')} د.ل</span></div>
        </div>

        <!-- جدول الكشف -->
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right; margin-bottom: 22px;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 32px; text-align: center;">ت</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1;">الاسم الرباعي</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 80px;">الرقم المالي</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 130px;">المصرف والفرع</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 120px;">رقم الحساب المصرفي</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 80px;">الأساسي</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 75px;">الاستقطاع</th>
              <th style="padding: 7px; border: 1px solid #cbd5e1; width: 95px;">الصافي المحول</th>
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

        <!-- التوقيعات والختم المعتمد -->
        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 25px;">
          <tr>
            <td style="width: 32%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 12px; color: #1e3a8a;">المراجع المالي الداخلي</div>
              <div style="margin-top: 35px; font-size: 12px; font-weight: 800; color: #000000; border-top: 1px dashed #64748b; padding-top: 4px; width: 80%; margin-left: auto; margin-right: auto;">
                أ. الطاهر مسعود الشريف
              </div>
            </td>
            <td style="width: 36%; vertical-align: middle;">
              <div style="width: 72px; height: 72px; border-radius: 50%; border: 1.5px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5px; font-weight: 900; color: #1e3a8a; margin: 0 auto; line-height: 1.25; background: rgba(30,58,138,0.02);">
                <span>دولة ليبيا</span>
                <span>وزارة الداخلية</span>
                <span style="font-size: 8px; color: #000000; font-weight: 900;">مديرية أمن أوباري</span>
                <span style="color: #b91c1c; font-size: 7px; margin-top: 1px;">القسم المالي</span>
              </div>
            </td>
            <td style="width: 32%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 12px; color: #1e3a8a;">يعتمد / مدير أمن أوباري</div>
              <div style="margin-top: 35px; font-size: 12px; font-weight: 800; color: #000000; border-top: 1px dashed #64748b; padding-top: 4px; width: 80%; margin-left: auto; margin-right: auto;">
                لواء / موسى سعد البدين
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
    printDocumentInIframe(html, `كشف_حوالة_رواتب_${selectedBank}`);
  };

  // Official Bank Transfer Letter A4 (خطاب إحالة رسمي موجه لمدير المصرف)
  const handlePrintBankCoverLetter = () => {
    const bankName = selectedBank === 'all' ? 'السادة / مدراء فروع المصارف العاملة ببلدية أوباري' : `السيد / مدير ${selectedBank}`;
    const monthYear = new Date().toLocaleDateString('ar-LY', { month: 'long', year: 'numeric' });
    const letterHtml = createOfficialLetterHtml({
      reference: `FIN-PAY-${new Date().getFullYear()}/84`,
      recordNumber: '92/ح',
      department: 'قسم الشؤون المالية والميزانية | وحدة الرواتب والحوافظ',
      recipientTitle: bankName,
      subject: `إحالة حوافظ رواتب منتسبي مديرية أمن أوباري عن شهر (${monthYear})`,
      greeting: 'بعد التحية والتقدير والاحترام ،،،',
      bodyText: `نحيل إليكم طيه كشوفات وحوافظ صرف مرتبات السادة ضباط وضباط صف وأفراد وموظفي مديرية أمن أوباري لشهر (${monthYear})، بقيمة إجمالية قدرها (${totals.totalNet.toLocaleString('ar-LY')} دينار ليبي) فقط وقدره ${totals.totalNet.toLocaleString('ar-LY')} دينار ليبي لا غير.

عليه؛ يُرجى التفضل بالإيعاز للقسم المالي والمقاصة طرفكم بإيداع المستحقات المالية بحسابات السادة المذكورين بالكشوفات المرفقة كلٌ حسب رقم حسابه الجاري، مع موافاتنا بإشعار الخصم والإيداع المصرفي المعتمد لإتمام التسويات الدفترية والمحاسبية اللازمة لدينا.

شاكرين لكم حسن تعاونكم الدائم لما فيه الصالح العام وخدمة الوطن والمواطن.`,
      signerName: 'لواء / موسى سعد محمد',
      signerTitle: 'مدير مديرية أمن أوباري',
      deptOfficerName: 'مقدم / سالم محمد الناجم',
      deptOfficerTitle: 'رئيس قسم الشؤون المالية',
      ccList: [
        'مكتب السيد وزير الداخلية - للتفضل بالعلم',
        'الإدارة العامة للشؤون المالية بوزارة الداخلية',
        'مكتب المراجعة الداخلية بالمديرية',
        'الملف الدوري والمحفوظات'
      ]
    });
    printDocumentInIframe(letterHtml, `خطاب_إحالة_رواتب_${monthYear}`);
  };

  // Print Individual Pay Slip (قسيمة صرف مرتب فردية معتمدة)
  const handlePrintPaySlip = (member) => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const monthYear = new Date().toLocaleDateString('ar-LY', { month: 'long', year: 'numeric' });
    const html = `
      <div style="font-family: 'Cairo', 'Amiri', Arial, sans-serif; direction: rtl; padding: 25px; color: #0a192f; max-width: 720px; margin: 0 auto; border: 1.5px solid #cbd5e1; border-radius: 8px;">
        <!-- الشريط الوطني الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 16px;">
          <tr>
            <td style="text-align: right; width: 40%; vertical-align: middle;">
              <div style="font-size: 14px; font-weight: 800; color: #1e3a8a;">دولة ليبيا - وزارة الداخلية</div>
              <div style="font-size: 16px; font-weight: 900; color: #0a192f;">مديرية أمن أوباري</div>
              <div style="font-size: 12px; color: #475569;">قسم الشؤون المالية | قسيمة راتب معتمدة</div>
            </td>
            <td style="text-align: center; width: 20%; vertical-align: middle;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 65px; height: 65px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; width: 40%; vertical-align: middle; font-size: 12px;">
              <div><strong>رقم القسيمة:</strong> SLIP-${member.job_number}</div>
              <div><strong>تاريخ الإصدار:</strong> ${today}م</div>
              <div><strong>الشهر المالي:</strong> ${monthYear}</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 16px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #1e3a8a;">قسيمة صرف مرتب شهري</h2>
          <span style="font-size: 12px; color: #64748b;">(بيان رسمي بالمستحقات المالية والاستقطاعات القانونية)</span>
        </div>

        <!-- تفاصيل العضو -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
            <div><strong>الاسم الرباعي:</strong> <span style="font-weight: 800; color: #1e3a8a;">${member.name}</span></div>
            <div><strong>الرتبة / الوظيفة:</strong> ${member.rank}</div>
            <div><strong>الرقم المالي:</strong> ${member.job_number}</div>
            <div><strong>الرقم الوطني:</strong> ${member.national_id}</div>
            <div><strong>جهة العمل:</strong> ${member.department}</div>
            <div><strong>المصرف والفرع:</strong> ${member.bank_name}</div>
            <div style="grid-column: span 2;"><strong>رقم الحساب المصرفي:</strong> <span style="font-family: monospace; font-weight: 900; color: #0a192f;">${member.account_number}</span></div>
          </div>
        </div>

        <!-- جدول المستحقات والاستقطاعات -->
        <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 50%; text-align: center;">المستحقات (الإضافات)</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 50%; text-align: center;">الاستقطاعات القانونية</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #cbd5e1; vertical-align: top;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span>المرتب الأساسي:</span>
                  <strong>${member.basic_salary.toLocaleString('ar-LY')} د.ل</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span>علاوة خطر وميدان:</span>
                  <strong>+${member.risk_allowance.toLocaleString('ar-LY')} د.ل</strong>
                </div>
                <div style="border-top: 1px dashed #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-weight: 800; color: #1e3a8a;">
                  <span>إجمالي الراتب الإجمالي:</span>
                  <span>${(member.basic_salary + member.risk_allowance).toLocaleString('ar-LY')} د.ل</span>
                </div>
              </td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; vertical-align: top;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #dc2626;">
                  <span>صندوق الضمان (5.125%):</span>
                  <span>-${member.social_security.toLocaleString('ar-LY')} د.ل</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #dc2626;">
                  <span>التضامن الاجتماعي (1%):</span>
                  <span>-${member.solidarity.toLocaleString('ar-LY')} د.ل</span>
                </div>
                ${member.penalty_deduction ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #dc2626;">
                    <span>خصم عقوبات وجزاءات:</span>
                    <span>-${member.penalty_deduction.toLocaleString('ar-LY')} د.ل</span>
                  </div>
                ` : ''}
                <div style="border-top: 1px dashed #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-weight: 800; color: #dc2626;">
                  <span>إجمالي الاستقطاعات:</span>
                  <span>-${member.total_deductions.toLocaleString('ar-LY')} د.ل</span>
                </div>
              </td>
            </tr>
            <tr style="background: #f0fdf4; font-weight: 900; font-size: 14px;">
              <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; color: #15803d;">
                صافي المرتب المحول للمصرف: ${member.net_salary.toLocaleString('ar-LY')} دينار ليبي
              </td>
            </tr>
          </tbody>
        </table>

        <!-- التوقيعات والختم -->
        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 25px;">
          <tr>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 12px;">المراجع المالي</div>
              <div style="margin-top: 30px; font-size: 12px;">أ. الطاهر الشريف</div>
            </td>
            <td style="width: 34%; vertical-align: middle;">
              <div style="width: 70px; height: 70px; border-radius: 50%; border: 1.5px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5px; font-weight: 900; color: #1e3a8a; margin: 0 auto; line-height: 1.25;">
                <span>دولة ليبيا</span>
                <span>وزارة الداخلية</span>
                <span style="font-size: 8px; color: #000;">أمن أوباري</span>
                <span style="color: #b91c1c; font-size: 7px;">الختم المالي</span>
              </div>
            </td>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 12px;">رئيس قسم الشؤون المالية</div>
              <div style="margin-top: 30px; font-size: 12px; font-weight: bold; color: #1e3a8a;">مقدم / سالم محمد الناجم</div>
            </td>
          </tr>
        </table>
      </div>
    `;
    printDocumentInIframe(html, `قسيمة_راتب_${member.job_number}`);
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
            onClick={handlePrintBankCoverLetter}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#047857',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(4,120,87,0.2)'
            }}
            title="طباعة خطاب إحالة رسمي معتمد موجه لمدير المصرف"
          >
            <FileText size={16} />
            خطاب إحالة رسمي للمصرف 📜
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
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>قسيمة الراتب</th>
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
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => setPreviewMember(row)}
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
                      title="معاينة قسيمة الراتب"
                    >
                      <Eye size={13} /> معاينة
                    </button>
                    <button
                      onClick={() => handlePrintPaySlip(row)}
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
                      title="طباعة قسيمة الراتب الرسمية"
                    >
                      <Printer size={13} /> طباعة
                    </button>
                  </div>
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

      {/* Pay Slip Preview Modal */}
      {previewMember && (
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
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#1e3a8a' }}>معاينة قسيمة الراتب الرسمية</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>مديرية أمن أوباري | الشؤون المالية</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewMember(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><strong>الاسم:</strong> {previewMember.name}</div>
                <div><strong>الرقم المالي:</strong> {previewMember.job_number}</div>
                <div><strong>الرقم الوطني:</strong> {previewMember.national_id}</div>
                <div><strong>الرتبة:</strong> {previewMember.rank}</div>
                <div><strong>المصرف:</strong> {previewMember.bank_name}</div>
                <div><strong>رقم الحساب:</strong> <span style={{ fontFamily: 'monospace' }}>{previewMember.account_number}</span></div>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>المرتب الأساسي</td>
                    <td style={{ padding: '8px 12px', fontWeight: 800 }}>{previewMember.basic_salary.toLocaleString('ar-LY')} د.ل</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>علاوة خطر وميدان</td>
                    <td style={{ padding: '8px 12px', color: '#2563eb', fontWeight: 800 }}>+{previewMember.risk_allowance} د.ل</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>استقطاع الضمان الاجتماعي (5.125%)</td>
                    <td style={{ padding: '8px 12px', color: '#dc2626' }}>-{previewMember.social_security.toLocaleString('ar-LY')} د.ل</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>استقطاع التضامن (1%)</td>
                    <td style={{ padding: '8px 12px', color: '#dc2626' }}>-{previewMember.solidarity.toLocaleString('ar-LY')} د.ل</td>
                  </tr>
                  <tr style={{ background: '#f0fdf4', borderTop: '2px solid #16a34a' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 900, color: '#15803d', fontSize: '14px' }}>صافي المرتب المستحق للصرف</td>
                    <td style={{ padding: '10px 12px', fontWeight: 900, color: '#15803d', fontSize: '16px' }}>{previewMember.net_salary.toLocaleString('ar-LY')} د.ل</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPreviewMember(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePrintPaySlip(previewMember);
                  setPreviewMember(null);
                }}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} /> طباعة القسيمة الرسمية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

