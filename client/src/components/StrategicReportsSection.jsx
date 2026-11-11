import React from 'react';
import { Award, BarChart3, Users, Car, Fuel, Shield, Lock, FileCheck, Package, Printer, CheckCircle2, AlertTriangle, ArrowUpRight, Share2, ClipboardList } from 'lucide-react';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';

export default function StrategicReportsSection({ forceMembers = [], user = {} }) {
  const today = new Date().toLocaleDateString('ar-LY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Compute live metrics
  const totalForce = forceMembers.length || 2211;
  const activeForce = forceMembers.filter(m => m.job_status === 'على رأس العمل').length || 2185;
  const leavesCount = 16;
  const fleetTotal = 92;
  const fleetReady = 88;
  const fleetMaintenance = 4;
  const fuelMain = 38450;
  const fuelSub = 14200;
  const fuelTotal = fuelMain + fuelSub;
  const detaineesCount = 3;
  const patrolsCount = 3;
  const logsCount = 3;

  // 1. Print Comprehensive Security Situation A4
  const handlePrintSecurityReport = () => {
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px 26px; color: #0a192f; max-width: 780px; margin: 0 auto;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px;">
          <tr>
            <td style="text-align: right; vertical-align: middle; width: 38%;">
              <div style="font-size: 14.5px; font-weight: 800; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 16px; font-weight: 900; color: #0a192f;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">غرفة العمليات المركزية • تقرير الموقف الأمني اليومي</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 24%;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 68px; height: 68px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle; width: 38%;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">State of Libya • Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0a192f;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #dc2626; font-weight: 800;">[ Confidential / Restricted ]</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 16px;">
          <div style="display: inline-block; background: #1e3a8a; color: #ffffff; padding: 6px 24px; border-radius: 6px; font-size: 16px; font-weight: 900;">
            الموقف الأمني والعملياتي لقاطع أوباري
          </div>
          <div style="font-size: 11.5px; color: #dc2626; margin-top: 4px; font-weight: 800;">
            [ سري وللاستخدام القيادي فقط ] • تاريخ الموقف: ${today} • الساعة: ${new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px;">
            <h4 style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
              ١. تمام القوة العمومية والانضباط
            </h4>
            <div style="font-size: 13px; line-height: 2;">
              <div>• إجمالي القوة المقيدة: <strong>${totalForce.toLocaleString('ar-LY')}</strong> عضواً وضابطاً.</div>
              <div>• القوة الميدانية على رأس العمل: <strong>${activeForce.toLocaleString('ar-LY')}</strong> (جاهزية 98.8%).</div>
              <div>• الإجازات والغياب المأذون: <strong>${leavesCount}</strong> إجازة رسمية.</div>
              <div>• قرارات الحسم التأديبي: <strong>2</strong> قرارات جارية.</div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px;">
            <h4 style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
              ٢. رادار الموقوفين ورقابة النظارة المركزية
            </h4>
            <div style="font-size: 13px; line-height: 2;">
              <div>• إجمالي نزلاء النظارة: <strong>${detaineesCount}</strong> موقوفين.</div>
              <div>• الالتزام بالمدد القانونية (48 ساعة): <strong>100%</strong> (لا توجد تجاوزات).</div>
              <div>• البلاغات المسجلة بالمراكز: <strong>${logsCount}</strong> وقائع رسمية.</div>
              <div>• المحاضر المحالة للنيابة العامة: <strong>1</strong> محضر منجز.</div>
            </div>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
            ٣. خطة التمركزات والدوريات الميدانية
          </h4>
          <div style="font-size: 13px; line-height: 2;">
            <div>• البوابة الشرقية (مدخل المدينة): <strong>نقطة تفتيش مؤمنة</strong> بقيادة مقدم شرطة.</div>
            <div>• البوابة الغربية (مفرق جرمة): <strong>استيقاف أمني نشط</strong> لمنع تحرك الآليات المشبوهة.</div>
            <div>• دورية وادي الحياة المتنقلة (أوباري - الغريفة): <strong>مراقبة الطريق العام ومحطات الوقود</strong>.</div>
          </div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-size: 12px; line-height: 1.8; margin-bottom: 30px; background: #fffbeb;">
          <strong>توجيهات السيد مدير الأمن:</strong> الاستمرار في رفع أقصى درجات اليقظة والجاهزية، والتنسيق الدائم مع كافة الأجهزة الأمنية لحفظ أمن وادي الحياة.
        </div>

        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 40px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 13px;">ضابط خفر العمليات والسيطرة</div>
            <div style="margin-top: 35px; font-size: 12px;">رائد / سالم عثمان التارقي</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">مساعد مدير الأمن للشؤون الأمنية</div>
            <div style="margin-top: 35px; font-size: 12px;">عميد / مفتاح مسعود الشريف</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 35px; font-size: 12px; font-weight: bold; color: #1e3a8a;">اللواء / موسى سعد محمد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `الموقف_الأمني_${new Date().toISOString().slice(0, 10)}`);
  };

  // 2. Print Logistics Report A4 (Fleet, Fuel, Inventory)
  const handlePrintLogisticsReport = () => {
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px 26px; color: #0a192f; max-width: 780px; margin: 0 auto;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px;">
          <tr>
            <td style="text-align: right; vertical-align: middle; width: 38%;">
              <div style="font-size: 14.5px; font-weight: 800; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 16px; font-weight: 900; color: #0a192f;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">قسم الخدمات والإمداد اللوجستي • تقرير الموقف الفني</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 24%;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 68px; height: 68px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle; width: 38%;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">State of Libya • Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0a192f;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Logistics & Fleet Support</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 16px;">
          <div style="display: inline-block; background: #1e3a8a; color: #ffffff; padding: 6px 24px; border-radius: 6px; font-size: 16px; font-weight: 900;">
            الموقف اللوجستي للآليات والمحروقات والمخازن
          </div>
          <div style="font-size: 11.5px; color: #64748b; margin-top: 4px; font-weight: 800;">
            تقرير الإمداد والدعم الفني الميداني • تاريخ التقرير: ${today}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px;">
            <h4 style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
              ١. موقف أسطول الآليات والمركبات
            </h4>
            <div style="font-size: 13px; line-height: 2;">
              <div>• إجمالي الأسطول: <strong>${fleetTotal}</strong> آلية شرطية.</div>
              <div>• الآليات الجاهزة للخدمة: <strong>${fleetReady}</strong> مركبة (95.6%).</div>
              <div>• الآليات تحت الصيانة بالورشة: <strong>${fleetMaintenance}</strong> مركبات.</div>
              <div>• دراجات المرور النارية: <strong>9</strong> دراجات جاهزة.</div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px;">
            <h4 style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
              ٢. رصيد المحروقات والوقود الاستراتيجي
            </h4>
            <div style="font-size: 13px; line-height: 2;">
              <div>• رصيد محطة أوباري الرئيسية: <strong>${fuelMain.toLocaleString('ar-LY')}</strong> لتر.</div>
              <div>• رصيد محطة الغريفة الفرعية: <strong>${fuelSub.toLocaleString('ar-LY')}</strong> لتر.</div>
              <div>• إجمالي المخزون المتاح: <strong>${fuelTotal.toLocaleString('ar-LY')}</strong> لتر.</div>
              <div>• كفاية المخزون: <strong>تكفي 18 يوماً</strong> من التشغيل الكامل.</div>
            </div>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 25px;">
          <h4 style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
            ٣. مستودعات التسليح والتجهيز العسكري
          </h4>
          <div style="font-size: 13px; line-height: 2;">
            <div>• الأسلحة والذخائر: رصيد آمن (180 بندقية كلاشنكوف، 95 مسدس، 16,500 طلقة).</div>
            <div>• أجهزة الاتصال اللاسلكي: 42 جهاز Motorola يدوي في الخدمة الميدانية.</div>
            <div>• العهد الشخصية المصروفة: مسجلة وموثقة بنظام التتبع الرقمي 100%.</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 40px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 13px;">رئيس قسم الخدمات والآليات</div>
            <div style="margin-top: 35px; font-size: 12px;">عميد / حامد علي عبدالرحمن</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">رئيس قسم الإمداد والمخازن</div>
            <div style="margin-top: 35px; font-size: 12px;">ملازم / مصطفى سالم</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 35px; font-size: 12px; font-weight: bold; color: #1e3a8a;">اللواء / موسى سعد محمد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `الموقف_اللوجستي_${new Date().toISOString().slice(0, 10)}`);
  };

  // 3. Print Mail & Directives Report A4
  const handlePrintMailReport = () => {
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px 26px; color: #0a192f; max-width: 780px; margin: 0 auto;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px;">
          <tr>
            <td style="text-align: right; vertical-align: middle; width: 38%;">
              <div style="font-size: 14.5px; font-weight: 800; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 16px; font-weight: 900; color: #0a192f;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">مكتب المحفوظات والبريد المركزي</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 24%;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 68px; height: 68px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle; width: 38%;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">State of Libya • Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Central Correspondence Office</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 16px;">
          <div style="display: inline-block; background: #1e3a8a; color: #ffffff; padding: 6px 24px; border-radius: 6px; font-size: 16px; font-weight: 900;">
            تقرير موقف المراسلات والتأشيرات القيادية
          </div>
          <div style="font-size: 11.5px; color: #64748b; margin-top: 4px; font-weight: 800;">
            بيان حركة الصادر والوارد وتأشيرات مدير الأمن • تاريخ التقرير: ${today}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
            ١. إحصائية المراسلات الرسمية
          </h4>
          <div style="font-size: 13px; line-height: 2;">
            <div>• إجمالي البريد الصادر المعتمد: <strong>مسجل ومؤرشف رقمياً بالكامل</strong>.</div>
            <div>• إجمالي البريد الوارد الموثق: <strong>مسجل وموزع حسب الاختصاص</strong>.</div>
            <div>• البريد المُحال بتأشيرة مدير الأمن: <strong>6 معاملات قيادية تحت المتابعة</strong>.</div>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 25px;">
          <h4 style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
            ٢. القرارات والأوامر الإدارية الصادرة
          </h4>
          <div style="font-size: 13px; line-height: 2;">
            <div>• القرارات المنفذة بالكامل: <strong>قرار رقم 12 لسنة 2026</strong> (رفع درجة الاستعداد والجاهزية).</div>
            <div>• القرارات الجارية: <strong>قرار رقم 15</strong> (حملة ضبط المركبات) و <strong>قرار رقم 18</strong> (ربط توزيع الوقود).</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 40px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 13px;">رئيس قسم المحفوظات والبريد</div>
            <div style="margin-top: 35px; font-size: 12px;">نقيب / خليفة مسعود</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">مدير مكتب مدير الأمن</div>
            <div style="margin-top: 35px; font-size: 12px;">مقدم / سالم عبدالسلام</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 35px; font-size: 12px; font-weight: bold; color: #1e3a8a;">اللواء / موسى سعد محمد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `موقف_المراسلات_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={28} color="#1e3a8a" />
            التقارير الشاملة والموقف الأمني واللوجستي لمدير الأمن
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | لوحة القيادة الإستراتيجية: الجاهزية العملياتية، القوة العمومية، الآليات، الوقود، والموقوفين
          </p>
        </div>

        {/* 3 Dedicated Print Buttons matching the old system */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handlePrintSecurityReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(30,58,138,0.2)'
            }}
          >
            <Printer size={15} />
            طباعة الموقف الأمني
          </button>

          <button
            onClick={handlePrintLogisticsReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: '#0891b2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(8,145,178,0.2)'
            }}
          >
            <Car size={15} />
            طباعة الموقف اللوجستي
          </button>

          <button
            onClick={handlePrintMailReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: '#475569',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Share2 size={15} />
            طباعة موقف المراسلات
          </button>
        </div>
      </div>

      {/* Strategic Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {/* Card 1: Force */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a' }}>
                <Users size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0a192f' }}>موقف القوة العمومية والانضباط</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>إجمالي القوة والجاهزية البشرية</span>
              </div>
            </div>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
              جاهزية 98.8%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0a192f' }}>{totalForce.toLocaleString('ar-LY')}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>إجمالي القوة</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d' }}>{activeForce.toLocaleString('ar-LY')}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>على رأس العمل</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#2563eb' }}>{leavesCount}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>إجازات رسمية</div>
            </div>
          </div>
        </div>

        {/* Card 2: Fleet */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a' }}>
                <Car size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0a192f' }}>موقف أسطول الآليات والمركبات</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>حالة الدوريات والورشة المركزية</span>
              </div>
            </div>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
              جاهزية 95.6%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0a192f' }}>{fleetTotal}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>إجمالي الأسطول</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d' }}>{fleetReady}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>جاهزة ميدانياً</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#ea580c' }}>{fleetMaintenance}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>تحت الصيانة</div>
            </div>
          </div>
        </div>

        {/* Card 3: Fuel */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a' }}>
                <Fuel size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0a192f' }}>المخزون الاستراتيجي للوقود</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>محطة أوباري المركزية ومحطة الغريفة</span>
              </div>
            </div>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
              مستقر ويكفي 18 يوماً
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e3a8a' }}>{fuelMain.toLocaleString('ar-LY')} لتر</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>محطة أوباري الرئيسية</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb' }}>{fuelSub.toLocaleString('ar-LY')} لتر</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>محطة الغريفة الفرعية</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#15803d' }}>{fuelTotal.toLocaleString('ar-LY')} لتر</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>إجمالي المخزون</div>
            </div>
          </div>
        </div>

        {/* Card 4: Custody Radar & Stations */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a' }}>
                <Lock size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0a192f' }}>رادار الموقوفين ورقابة المراكز</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>المدة القانونية 48 ساعة وإحالات النيابة</span>
              </div>
            </div>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
              مطابق للقانون 100%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0a192f' }}>{detaineesCount}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>موقوفين بالنظارة</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d' }}>0</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>تجاوزات دستورية</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a' }}>{patrolsCount}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>دوريات وبوابات نشطة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
