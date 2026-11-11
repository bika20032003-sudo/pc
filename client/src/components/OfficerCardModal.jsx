import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Shield,
  ShieldCheck,
  Camera,
  Trash2,
  Printer,
  Edit,
  X,
  RotateCw,
  Building2,
  CreditCard,
  User,
  BadgeCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';

import { printDocumentInIframe } from '../utils/printHelper';

export default function OfficerCardModal({
  member,
  onClose,
  onEdit,
  onUpdatePhoto
}) {
  if (!member) return null;

  // Officer core identifiers and status (computed first)
  const officerRank = member.rank || member.job_title || (member.type === 'شرطي' ? 'شرطي' : 'موظف مدني');
  const financialId = member.financial_number || member.job_number || '---';
  const isSuspended = member.job_status && (member.job_status.includes('موقوف') || member.job_status.includes('إيقاف'));
  const isLeave = member.job_status && member.job_status.includes('إجازة');
  const statusLabel = isSuspended ? 'موقوف مؤقتاً' : (isLeave ? 'إجازة رسمية' : 'على رأس العمل');
  const statusBg = isSuspended ? '#fee2e2' : (isLeave ? '#fef3c7' : '#dcfce7');
  const statusColor = isSuspended ? '#b91c1c' : (isLeave ? '#b45309' : '#15803d');
  const statusDot = isSuspended ? '🔴' : (isLeave ? '🟡' : '🟢');

  // Tabs: 'card' (البطاقة الأمنية الذكية) | 'dossier' (السجل والملف الوظيفي الشامل)
  const [activeTab, setActiveTab] = useState('card');
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState(member.photo || '');
  const [printTarget, setPrintTarget] = useState('card'); // 'card' or 'dossier'
  const fileInputRef = useRef(null);

  // Dedicated Print Triggers ensuring single-page print
  const handlePrintCard = () => {
    setPrintTarget('card');
    const cardHtml = `
      <div style="width: 100%; max-width: 520px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a;">
        <!-- Sovereign State Header -->
        <div style="text-align: center; margin-bottom: 8px; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 5px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 13px; font-weight: 900; color: #1e3a8a; line-height: 1.2;">دولة ليبيا • وزارة الداخلية</div>
                <div style="font-size: 12px; font-weight: 800; color: #0f172a; line-height: 1.2;">مديرية أمن أوباري</div>
              </td>
              <td style="text-align: center; vertical-align: middle; width: 60px;">
                <img src="${window.location.origin}/moi-logo.png" alt="شعار وزارة الداخلية" style="width: 42px; height: 42px; object-fit: contain;" />
              </td>
              <td style="text-align: left; direction: ltr; vertical-align: middle;">
                <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ministry of Interior</div>
                <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              </td>
            </tr>
          </table>
          <div style="margin-top: 4px; font-size: 10px; font-weight: 800; color: #92400e; background: #fef3c7; display: inline-block; padding: 2px 14px; border-radius: 12px; border: 1px solid #fde68a;">
            بطاقة إثبات الهوية الأمنية الرسمية المعتمدة (الوجهين A4 / طباعة وتغليف حراري PVC)
          </div>
        </div>

        <!-- Cards Container: Front & Back (100% on 1 Sheet) -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
          
          <!-- ── CARD FRONT ── -->
          <div style="width: 500px; height: 275px; max-height: 275px; background: #ffffff; border: 2px solid #1e3a8a; border-radius: 12px; padding: 10px 14px; box-sizing: border-box; position: relative; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; break-inside: avoid;">
            <div>
              <div style="height: 3.5px; border-radius: 2px; background: linear-gradient(90deg, #dc2626 0%, #dc2626 33.3%, #000000 33.3%, #000000 66.6%, #16a34a 66.6%, #16a34a 100%); margin-bottom: 6px;"></div>

              <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                <tr>
                  <td style="text-align: right; vertical-align: middle;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="${window.location.origin}/moi-logo.png" alt="شعار الوزارة" style="width: 36px; height: 36px; object-fit: contain;" />
                      <div>
                        <div style="font-size: 11px; font-weight: 900; color: #1e3a8a; line-height: 1.1;">دولة ليبيا • وزارة الداخلية</div>
                        <div style="font-size: 12.5px; font-weight: 900; color: #0f172a; line-height: 1.1;">مديرية أمن أوباري</div>
                        <div style="font-size: 8px; color: #64748b; font-weight: 700;">UBARI SECURITY DIRECTORATE</div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align: center; vertical-align: middle;">
                    <div style="background: #eff6ff; border: 1.5px solid #1e3a8a; padding: 2px 10px; border-radius: 15px; font-size: 9.5px; font-weight: 900; color: #1e3a8a; white-space: nowrap;">
                      بطاقة إثبات هوية أمنية
                    </div>
                    <div style="font-size: 7.5px; color: #64748b; margin-top: 1px; font-weight: 700;">
                      OFFICIAL POLICE IDENTIFICATION
                    </div>
                  </td>
                  <td style="text-align: left; vertical-align: middle; width: 40px;">
                    <div style="width: 30px; height: 22px; border-radius: 4px; background: linear-gradient(135deg, #fef08a 0%, #eab308 40%, #ca8a04 100%); border: 1px solid #b45309; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1px; margin-left: auto;">
                      <div style="width: 80%; height: 1px; background: rgba(0,0,0,0.35); margin: 1px 0;"></div>
                      <div style="width: 80%; height: 1px; background: rgba(0,0,0,0.35); margin: 1px 0;"></div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Middle Credentials -->
            <div style="display: flex; gap: 12px; align-items: center; margin: 4px 0;">
              <div style="width: 76px; height: 96px; border-radius: 8px; border: 1.5px solid #1e3a8a; overflow: hidden; flex-shrink: 0; background: #f8fafc; display: flex; align-items: center; justify-content: center;">
                ${currentPhoto ? `
                  <img src="${currentPhoto}" alt="${member.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                ` : `
                  <div style="text-align: center; color: #64748b; font-size: 8.5px; font-weight: 800;">
                    <div style="font-size: 22px;">🛡️</div>
                    <div>صورة عسكرية</div>
                  </div>
                `}
              </div>

              <div style="flex: 1;">
                <div style="margin-bottom: 4px;">
                  <div style="font-size: 8px; color: #64748b; font-weight: 700;">الاسم الرباعي واللقب:</div>
                  <div style="font-size: 14.5px; font-weight: 900; color: #0f172a; line-height: 1.2;">
                    ${member.name || '---'}
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;">
                  <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">الرتبة: </span>
                    <span style="font-size: 11px; font-weight: 900; color: #1e3a8a;">${officerRank}</span>
                  </div>
                  <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">التصنيف: </span>
                    <span style="font-size: 10.5px; font-weight: 900; color: #0f172a;">${member.type || 'كادر شرطة نظامي'}</span>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;">
                  <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">الرقم المالي: </span>
                    <span style="font-size: 11px; font-weight: 900; color: #0284c7; direction: ltr; display: inline-block;">${financialId}</span>
                  </div>
                  <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">الرقم الوطني: </span>
                    <span style="font-size: 10.5px; font-weight: 900; color: #0f172a; direction: ltr; display: inline-block;">${member.national_id || '---'}</span>
                  </div>
                </div>

                <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">التبعية: </span>
                    <span style="font-size: 10px; font-weight: 800; color: #1e293b;">${member.department || 'مديرية أمن أوباري'}</span>
                  </div>
                  <div style="text-align: left; padding-right: 6px; border-right: 1px solid #e2e8f0;">
                    <span style="font-size: 7px; color: #dc2626; font-weight: 800;">فصيلة الدم: </span>
                    <span style="font-size: 11px; font-weight: 900; color: #dc2626;">${member.blood_type || 'O+'}</span>
                  </div>
                </div>
              </div>

              ${qrCodeUrl ? `
                <div style="width: 64px; height: 64px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img src="${qrCodeUrl}" alt="QR" style="width: 54px; height: 54px;" />
                  <span style="font-size: 6px; color: #64748b; font-weight: 800;">رمز التحقق</span>
                </div>
              ` : ''}
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 3px; display: flex; align-items: center; justify-content: space-between; font-size: 8px; color: #475569; font-weight: 700;">
              <div>تاريخ الإصدار: 2024م • سارية حتى: 2029م</div>
              <div style="font-family: monospace; font-size: 9px; color: #1e3a8a; font-weight: 800;">*UBR-MOI-${financialId}*</div>
              <div style="color: #0f172a; font-weight: 800;">توقيع مدير أمن أوباري</div>
            </div>
          </div>

          <!-- ── CUT / FOLD DOTTED LINE ── -->
          <div style="width: 500px; border-top: 1.5px dashed #64748b; position: relative; margin: 4px 0; text-align: center;">
            <span style="position: relative; top: -8px; background: #ffffff; padding: 0 10px; font-size: 8.5px; font-weight: 800; color: #475569;">
              ✂ خط طي وقص البطاقة المعتمد (PVC Standard) ✂
            </span>
          </div>

          <!-- ── CARD BACK ── -->
          <div style="width: 500px; height: 275px; max-height: 275px; background: #ffffff; border: 2px solid #1e3a8a; border-radius: 12px; padding: 10px 16px; box-sizing: border-box; position: relative; color: #0f172a; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; break-inside: avoid;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">
                <div style="font-size: 10.5px; font-weight: 900; color: #1e3a8a;">
                  تعليمات أمنية وإذن حمل السلاح الفردي
                </div>
                <div style="font-size: 8px; color: #64748b; font-weight: 700;">
                  SECURITY INSTRUCTIONS & FIREARM PERMIT
                </div>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; margin: 5px 0; font-size: 8.5px; line-height: 1.45; color: #334155; text-align: justify;">
                <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 2px;">
                  ⚖️ تصريح وإشعار سيادي رسمي:
                </div>
                <div>
                  حامل هذه البطاقة يتبع رسمياً هيئة الشرطة بمديرية أمن أوباري - وزارة الداخلية. ومأذون له بموجب القانون رقم (10) لسنة 1992م والتشريعات المنظمة بحمل سلاحه الشخصي الميري وأداء مهامه الأمنية وضبط المخالفات في كامل التراب الليبي. يرجى من كافة الأجهزة الأمنية والعسكرية تسهيل مهامه والتعاون معه.
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 3px;">
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 4px 8px; display: flex; align-items: center; gap: 6px;">
                  <div style="font-size: 13px;">🛡️</div>
                  <div>
                    <div style="font-size: 7.5px; color: #991b1b; font-weight: 700;">إذن حمل السلاح:</div>
                    <div style="font-size: 9.5px; font-weight: 900; color: #b91c1c;">مسدس ميري فردي 9 ملم مصرح</div>
                  </div>
                </div>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 8px; display: flex; align-items: center; gap: 6px;">
                  <div style="font-size: 13px;">✅</div>
                  <div>
                    <div style="font-size: 7.5px; color: #166534; font-weight: 700;">سريان البطاقة:</div>
                    <div style="font-size: 9.5px; font-weight: 900; color: #15803d;">سارية المفعول حتى 2029/10/31م</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Signatures -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              <div>
                <div style="font-size: 7.5px; color: #64748b; font-weight: 700;">رئيس قسم الشؤون الإدارية:</div>
                <div style="font-size: 9.5px; font-weight: 800; color: #0f172a;">عقيد شرطة / فرج محمد السنوسي</div>
              </div>

              <div style="width: 48px; height: 48px; border-radius: 50%; border: 1.5px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 6.5px; font-weight: 800; color: #1e3a8a; text-align: center; line-height: 1.15;">
                <span>وزارة الداخلية</span>
                <span>مديرية أمن أوباري</span>
                <span style="color: #dc2626; font-size: 5.5px;">ختم معتمد</span>
              </div>

              <div style="text-align: left;">
                <div style="font-size: 7.5px; color: #64748b; font-weight: 700;">يعتمد مدير مديرية أمن أوباري:</div>
                <div style="font-size: 9.5px; font-weight: 800; color: #0f172a;">لواء / موسى سعد محمد</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    printDocumentInIframe(cardHtml, `بطاقة إثبات الهوية الأمنية - ${member.name || ''}`);
  };

  const handlePrintDossier = () => {
    setPrintTarget('dossier');
    const dossierHtml = `
      <div style="max-width: 760px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a;">
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 16px; font-weight: 900; color: #1e3a8a;">دولة ليبيــــا</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">وزارة الداخليـــــة</div>
              <div style="font-size: 12px; font-weight: 700; color: #334155;">مديرية أمن أوباري</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 80px;">
              <img src="${window.location.origin}/moi-logo.png" alt="شعار وزارة الداخلية" style="width: 60px; height: 60px; object-fit: contain;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 12px; font-weight: 800; color: #1e3a8a;">State of Libya</div>
              <div style="font-size: 11px; font-weight: 700; color: #0f172a;">Ministry of Interior</div>
              <div style="font-size: 10px; color: #475569;">Ubari Security Directorate</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 12px;">
          <h2 style="margin: 0; font-size: 17px; font-weight: 900; color: #0f172a; text-decoration: underline;">
            الملف والسجل الوظيفي والأمني الموحد
          </h2>
          <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b; font-weight: 700;">
            كشف رسمي مستخرج من المنظومة المركزية لشؤون الضباط وضباط الصف والأفراد
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px; background: #f8fafc;">
          <tr>
            <td style="width: 90px; padding: 10px; text-align: center; vertical-align: middle; border-left: 1px solid #cbd5e1;">
              <div style="width: 80px; height: 100px; border-radius: 6px; border: 1.5px solid #1e3a8a; overflow: hidden; background: #ffffff; margin: 0 auto;">
                ${currentPhoto ? `
                  <img src="${currentPhoto}" alt="${member.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                ` : `
                  <div style="text-align: center; color: #64748b; font-size: 9px; padding-top: 25px;">
                    <div style="font-size: 24px;">🛡️</div>
                    <div>صورة عسكرية</div>
                  </div>
                `}
              </div>
            </td>
            <td style="padding: 10px; vertical-align: middle;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <tr>
                  <td style="padding: 3px; color: #64748b;">الاسم الرباعي:</td>
                  <td style="padding: 3px; font-size: 14px; font-weight: 900; color: #0f172a;">${member.name}</td>
                  <td style="padding: 3px; color: #64748b;">الرتبة / الوظيفة:</td>
                  <td style="padding: 3px; font-weight: 800; color: #1e3a8a;">${officerRank}</td>
                </tr>
                <tr>
                  <td style="padding: 3px; color: #64748b;">الرقم المالي:</td>
                  <td style="padding: 3px; font-weight: 900; color: #0284c7; font-family: monospace;">${financialId}</td>
                  <td style="padding: 3px; color: #64748b;">الرقم الوطني:</td>
                  <td style="padding: 3px; font-weight: 900; color: #0f172a; font-family: monospace;">${member.national_id || '---'}</td>
                </tr>
                <tr>
                  <td style="padding: 3px; color: #64748b;">جهة العمل:</td>
                  <td style="padding: 3px; font-weight: 800;">${member.department || 'مديرية أمن أوباري'}</td>
                  <td style="padding: 3px; color: #64748b;">الوضع الوظيفي:</td>
                  <td style="padding: 3px; font-weight: 800; color: #16a34a;">${statusLabel}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px; margin-bottom: 8px;">
          <tr style="background: #1e3a8a; color: #ffffff;">
            <th colspan="4" style="padding: 5px 8px; text-align: right;">1. البيانات الوظيفية والإدارية</th>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">جهة العمل / المركز:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.department || 'مركز شرطة أوباري المدينة'}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">تاريخ المباشرة:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.start_date || '---'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">قرار وتاريخ التعيين:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.appointment_decision || '---'} ${member.appointment_date ? `(${member.appointment_date})` : ''}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">قرار وتاريخ آخر ترقية:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.last_promotion_decision || '---'} ${member.last_promotion_date ? `(${member.last_promotion_date})` : ''}</td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px; margin-bottom: 8px;">
          <tr style="background: #0284c7; color: #ffffff;">
            <th colspan="4" style="padding: 5px 8px; text-align: right;">2. البيانات المالية والمصرفية</th>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">اسم المصرف والفرع:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.bank_name || 'الصحاري'} - ${member.bank_branch || 'فرع أوباري'}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">رقم الحساب المصرفي:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace;">${member.account_number || '---'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">المرتب الأساسي:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800; color: #16a34a;">${member.basic_salary ? `${member.basic_salary} د.ل` : '2,200 د.ل'}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">فصيلة الدم واللياقة:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.blood_type || 'O+'} (${member.diseases || 'سليم ولائق'})</td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px; margin-bottom: 14px;">
          <tr style="background: #475569; color: #ffffff;">
            <th colspan="4" style="padding: 5px 8px; text-align: right;">3. البيانات الشخصية والاجتماعية</th>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">اسم الأم:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.mother_name || '---'}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">تاريخ ومكان الميلاد:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.birth_date || '---'} (${member.birth_place || 'أوباري'})</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">الحالة الاجتماعية:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.marital_status || 'متزوج'} ${member.children_count ? `(الأبناء: ${member.children_count})` : ''}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">رقم الهاتف والإقامة:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${member.phone || '---'} - ${member.residence || 'أوباري المدينة'}</td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; border-top: 2px solid #1e3a8a; padding-top: 8px;">
          <tr>
            <td style="text-align: center; vertical-align: top; width: 33%;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 3px;">الموثق والمدخل</div>
              <div style="font-size: 11px; font-weight: 800; color: #0f172a;">رئيس قسم الشؤون الإدارية</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 33%;">
              <div style="width: 54px; height: 54px; border-radius: 50%; border: 1.5px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7px; font-weight: 800; color: #1e3a8a; margin: 0 auto; line-height: 1.15;">
                <span>وزارة الداخلية</span>
                <span>مديرية أمن أوباري</span>
                <span style="color: #dc2626; font-size: 6px;">ختم رسمي</span>
              </div>
            </td>
            <td style="text-align: center; vertical-align: top; width: 33%;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 3px;">يعتمد مدير مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 800; color: #0f172a;">لواء / موسى سعد محمد</div>
            </td>
          </tr>
        </table>
      </div>
    `;

    printDocumentInIframe(dossierHtml, `الملف الوظيفي الشامل - ${member.name || ''}`);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('moi-printing-active');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      document.body.classList.remove('moi-printing-active');
    };
  }, []);

  // Sync photo if member changes
  useEffect(() => {
    const savedPhoto = member.photo || localStorage.getItem(`ubari_officer_photo_${member.id}`) || '';
    setCurrentPhoto(savedPhoto);
  }, [member]);

  // Generate official verification QR Code on load
  useEffect(() => {
    const rawRank = member.rank || member.job_title || (member.type === 'شرطي' ? 'شرطي' : 'موظف مدني');
    const qrPayload = [
      'دولة ليبيا - وزارة الداخلية',
      'مديرية أمن أوباري | السجل الأمني الموحد',
      `الاسم: ${member.name || '---'}`,
      `الرتبة/الوظيفة: ${rawRank}`,
      `الرقم المالي: ${member.financial_number || member.job_number || '---'}`,
      `الرقم الوطني: ${member.national_id || '---'}`,
      `التبعية: ${member.department || 'مديرية أمن أوباري'}`,
      `الوضع الوظيفي: ${member.job_status || 'على رأس العمل'}`,
      `الرقم المرجعي: UBR-MOI-${member.id || '2211'}`,
      `الحالة: بطاقة رسمية معتمدة وسارية المفعول`
    ].join('\n');

    QRCode.toDataURL(qrPayload, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [member]);

  // Process and upload image file (from input or drag-and-drop)
  const processImageFile = (file) => {
    if (!file) return;

    // Robust file type check (supports MIME type or common image extensions)
    const isImage = (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|jfif|bmp|gif|heic|avif|tiff?)$/i.test(file.name || '');

    if (!isImage) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setPhotoFeedback('جاري قراءة وضبط أبعاد الصورة...');

    const reader = new FileReader();

    reader.onloadend = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setPhotoFeedback('❌ تعذر قراءة ملف الصورة، يرجى المحاولة مرة أخرى');
      setTimeout(() => setPhotoFeedback(''), 4000);
    };

    reader.onabort = () => {
      setIsUploading(false);
      setPhotoFeedback('❌ تم إلغاء عملية رفع الصورة');
      setTimeout(() => setPhotoFeedback(''), 4000);
    };

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result;
      if (!rawDataUrl) {
        setIsUploading(false);
        setPhotoFeedback('❌ لم يتم استلام بيانات الصورة');
        setTimeout(() => setPhotoFeedback(''), 4000);
        return;
      }

      // Step 1: Immediate Optimistic Update (< 20ms) so user sees the photo right away!
      setCurrentPhoto(rawDataUrl);

      // Helper to finalize photo update
      const finishWithImage = (finalUrl) => {
        setCurrentPhoto(finalUrl);
        if (onUpdatePhoto) {
          try {
            onUpdatePhoto(member.id, finalUrl);
          } catch (err) {
            console.error('Error in onUpdatePhoto callback:', err);
          }
        }
        setIsUploading(false);
        setPhotoFeedback('✅ تم حفظ وتحديث صورة المنتسب بنجاح');
        setTimeout(() => setPhotoFeedback(''), 4000);
      };

      // Step 2: Compress and normalize dimensions using canvas for fast storage
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (!width || !height) {
            finishWithImage(rawDataUrl);
            return;
          }

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            finishWithImage(compressedDataUrl);
          } else {
            finishWithImage(rawDataUrl);
          }
        } catch (canvasErr) {
          console.warn('Canvas compression error, using raw image:', canvasErr);
          finishWithImage(rawDataUrl);
        }
      };

      img.onerror = () => {
        finishWithImage(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    try {
      reader.readAsDataURL(file);
    } catch (readErr) {
      console.error('Error starting FileReader:', readErr);
      setIsUploading(false);
      setPhotoFeedback('❌ حدث خطأ أثناء تشغيل قارئ الملفات');
      setTimeout(() => setPhotoFeedback(''), 4000);
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    if (confirm(`هل أنت متأكد من رغبتك في إزالة صورة المنتسب (${member.name})؟`)) {
      setCurrentPhoto('');
      if (onUpdatePhoto) {
        onUpdatePhoto(member.id, '');
      }
      setPhotoFeedback('تم إزالة الصورة الشخصية والعودة للشعار الرسمي');
      setTimeout(() => setPhotoFeedback(''), 3500);
    }
  };

  // Status visual attributes (declared at top)

  return (
    <div
      className="moi-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{ zIndex: 10500 }}
    >
      <style>{`
        @keyframes moiSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="moi-modal-box moi-officer-modal-container"
        style={{
          maxWidth: '920px',
          width: '95%',
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 25px rgba(212, 175, 55, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          color: '#0f172a'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Instant Photo Upload (Inside modal box to prevent overlay close) */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.bmp"
          style={{ display: 'none' }}
          onChange={handlePhotoUpload}
          onClick={(e) => {
            e.stopPropagation();
            e.target.value = '';
          }}
        />
        {/* ══════════════════════════════════════════════════════════════
            MODAL HEADER (White / Ivory Theme with Gold & Navy Trim)
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '16px 24px',
            borderBottom: '2px solid #1e3a8a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          {/* Top golden decorative line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3.5px',
              background: 'linear-gradient(90deg, #1e3a8a 0%, #d4af37 50%, #1e3a8a 100%)'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37',
                boxShadow: '0 3px 10px rgba(30, 58, 138, 0.25)',
                border: '1.5px solid #d4af37',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.2px' }}>
                  بطاقة الهوية الأمنية والملف الوظيفي الموحد
                </h3>
                <span
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#166534',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}
                >
                  ✓ معتمدة رسميـاً
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                وزارة الداخلية • مديرية أمن أوباري • السجل المركزي للقوة العمومية
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View Switcher Pills */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1'
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                style={{
                  background: activeTab === 'card' ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' : 'transparent',
                  color: activeTab === 'card' ? '#ffffff' : '#334155',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'card' ? '0 2px 6px rgba(37,99,235,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <BadgeCheck size={14} />
                <span>الهوية الذكية</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dossier')}
                style={{
                  background: activeTab === 'dossier' ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' : 'transparent',
                  color: activeTab === 'dossier' ? '#ffffff' : '#334155',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'dossier' ? '0 2px 6px rgba(37,99,235,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <FileText size={14} />
                <span>الملف والسجل الشامل</span>
              </button>
            </div>

            <button
              type="button"
              className="moi-modal-close-btn"
              onClick={onClose}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feedback Alert if photo was updated or processing */}
        {photoFeedback && (
          <div
            style={{
              background: photoFeedback.includes('❌') ? '#fef2f2' : (photoFeedback.includes('جاري') ? '#eff6ff' : '#f0fdf4'),
              color: photoFeedback.includes('❌') ? '#991b1b' : (photoFeedback.includes('جاري') ? '#1e40af' : '#166534'),
              padding: '10px 20px',
              fontSize: '12.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: `1px solid ${photoFeedback.includes('❌') ? '#fca5a5' : (photoFeedback.includes('جاري') ? '#bfdbfe' : '#86efac')}`
            }}
          >
            {photoFeedback.includes('❌') ? (
              <X size={16} color="#dc2626" />
            ) : photoFeedback.includes('جاري') ? (
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid #93c5fd',
                  borderTopColor: '#1d4ed8',
                  borderRadius: '50%',
                  animation: 'moiSpin 0.8s linear infinite'
                }}
              />
            ) : (
              <CheckCircle2 size={16} color="#16a34a" />
            )}
            <span>{photoFeedback}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            MODAL BODY (Crisp White Canvas)
            ══════════════════════════════════════════════════════════════ */}
        <div
          className="moi-modal-body"
          style={{
            padding: '24px',
            overflowY: 'auto',
            background: '#f8fafc',
            flex: 1
          }}
        >
          {activeTab === 'card' ? (
            /* ══════════════════════════════════════════════════════════════
               TAB 1: SMART SECURITY ID CARD (Official White PVC Format)
               ══════════════════════════════════════════════════════════════ */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              
              {/* Controls Toolbar for Card */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '650px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    background: '#ffffff',
                    color: '#1e3a8a',
                    border: '1.5px solid #bfdbfe',
                    padding: '7px 20px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  <RotateCw size={15} color="#2563eb" />
                  <span>{isFlipped ? 'عرض الوجه الأمامي للبطاقة' : 'عرض الوجه الخلفي (التعليمات وحمل السلاح)'}</span>
                </button>
              </div>

              {/* ── CARD DISPLAY AREA (3D Flip) ── */}
              <div
                className="moi-card-3d-wrapper"
                style={{
                  perspective: '1200px',
                  width: '100%',
                  maxWidth: '650px',
                  minHeight: '390px'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '390px',
                    transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* ─────────────────────────────────────────────────────────────
                      FRONT FACE OF WHITE SECURITY ID CARD
                      ───────────────────────────────────────────────────────────── */}
                  <div
                    id="moi-printable-card-front"
                    style={{
                      position: isFlipped ? 'absolute' : 'relative',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: '#ffffff',
                      border: '2px solid #cbd5e1',
                      borderRadius: '16px',
                      padding: '20px 22px',
                      boxShadow: '0 15px 35px rgba(15, 23, 42, 0.12), inset 0 0 0 1px rgba(212, 175, 55, 0.35)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      color: '#0f172a'
                    }}
                  >
                    {/* Watermark Crest Background */}
                    <div
                      style={{
                        position: 'absolute',
                        right: '50%',
                        top: '50%',
                        transform: 'translate(50%, -50%)',
                        width: '260px',
                        height: '260px',
                        backgroundImage: 'url("./moi-logo.png")',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        opacity: 0.05,
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Top Security Header with Tri-color Libyan Flag Banner */}
                    <div>
                      <div
                        style={{
                          height: '4px',
                          borderRadius: '2px',
                          background: 'linear-gradient(90deg, #dc2626 0%, #dc2626 33.3%, #000000 33.3%, #000000 66.6%, #16a34a 66.6%, #16a34a 100%)',
                          marginBottom: '10px'
                        }}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px' }}>
                        {/* Right: MOI Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src="${window.location.origin}/moi-logo.png"
                            alt="شعار وزارة الداخلية"
                            style={{
                              width: '48px',
                              height: '48px',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                            }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 900, color: '#1e3a8a', letterSpacing: '0.3px' }}>
                              دولة ليبيا • وزارة الداخلية
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                              مديرية أمن أوباري
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                              UBARI SECURITY DIRECTORATE
                            </div>
                          </div>
                        </div>

                        {/* Center: Card Type Title Badge */}
                        <div style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              background: '#eff6ff',
                              border: '1.5px solid #1e3a8a',
                              padding: '4px 14px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 900,
                              color: '#1e3a8a',
                              boxShadow: '0 1px 3px rgba(30,58,138,0.1)',
                              letterSpacing: '0.3px'
                            }}
                          >
                            بطاقة إثبات هوية أمنية
                          </div>
                          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '3px', fontWeight: 700 }}>
                            OFFICIAL POLICE IDENTIFICATION
                          </div>
                        </div>

                        {/* Left: Smart Chip simulation */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            title="شريحة الهوية الذكية المشفرة"
                            style={{
                              width: '36px',
                              height: '28px',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #fef08a 0%, #eab308 40%, #ca8a04 100%)',
                              border: '1px solid #b45309',
                              boxShadow: 'inset 0 0 2px rgba(0,0,0,0.3)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: '2px'
                            }}
                          >
                            <div style={{ width: '80%', height: '1px', background: 'rgba(0,0,0,0.35)', margin: '2px 0' }} />
                            <div style={{ width: '80%', height: '1px', background: 'rgba(0,0,0,0.35)', margin: '2px 0' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: Officer Photo + Official Credentials */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '14px 0' }}>
                      {/* Officer Photo Container */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                              fileInputRef.current.click();
                            }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const file = e.dataTransfer?.files?.[0];
                            if (file) processImageFile(file);
                          }}
                          style={{
                            position: 'relative',
                            width: '115px',
                            height: '145px',
                            borderRadius: '12px',
                            border: '2.5px solid #1e3a8a',
                            overflow: 'hidden',
                            background: '#f8fafc',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                          }}
                          title="اضغط هنا لاختيار صورة، أو اسحب وأفلت ملف الصورة هنا مباشرة"
                        >
                          {currentPhoto ? (
                            <img
                              src={currentPhoto}
                              alt={member.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            /* Default Dignified Police Silhouette Vector */
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
                                color: '#1e3a8a',
                                position: 'relative'
                              }}
                            >
                              <Shield size={46} strokeWidth={1.5} color="#1e3a8a" />
                              <span style={{ fontSize: '10px', color: '#1e3a8a', marginTop: '6px', fontWeight: 800 }}>
                                {member.type === 'شرطي' ? 'صورة عسكرية' : 'صورة مدنية'}
                              </span>
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'rgba(30,58,138,0.9)',
                                  padding: '4px 0',
                                  fontSize: '9px',
                                  color: '#ffffff',
                                  textAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '3px',
                                  fontWeight: 700
                                }}
                              >
                                <Camera size={10} />
                                <span>رفع صورة</span>
                              </div>
                            </div>
                          )}

                          {/* Hover camera badge overlay if photo exists */}
                          {currentPhoto && (
                            <>
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.88) 100%)',
                                  padding: '6px 0 4px 0',
                                  textAlign: 'center',
                                  color: '#ffffff',
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Camera size={12} color="#fef3c7" />
                                <span>تغيير الصورة</span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePhoto();
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '6px',
                                  left: '6px',
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  background: 'rgba(239, 68, 68, 0.9)',
                                  border: 'none',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                  zIndex: 4
                                }}
                                title="إزالة الصورة"
                              >
                                <Trash2 size={11} />
                              </button>
                            </>
                          )}

                          {/* Live In-Frame Upload Spinner Overlay */}
                          {isUploading && (
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(30, 58, 138, 0.82)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 800,
                                gap: '8px',
                                zIndex: 10
                              }}
                            >
                              <div
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  border: '3px solid rgba(255,255,255,0.35)',
                                  borderTopColor: '#ffffff',
                                  borderRadius: '50%',
                                  animation: 'moiSpin 0.8s linear infinite'
                                }}
                              />
                              <span>جاري الحفظ...</span>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div
                          style={{
                            background: statusBg,
                            color: statusColor,
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            border: `1px solid ${statusColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                          }}
                        >
                          <span>{statusDot}</span>
                          <span>{statusLabel}</span>
                        </div>
                      </div>

                      {/* Main Credentials Table */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name */}
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>الاسم الرباعي واللقب:</div>
                          <div style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', lineHeight: 1.3 }}>
                            {member.name || '---'}
                          </div>
                        </div>

                        {/* Rank & Type */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ background: '#f8fafc', padding: '5px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 700 }}>الرتبة / الوظيفة:</div>
                            <div style={{ fontSize: '13px', fontWeight: 900, color: '#1e3a8a' }}>
                              {officerRank}
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '5px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 700 }}>التصنيف:</div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: member.type === 'شرطي' ? '#1e40af' : '#7c3aed' }}>
                              {member.type === 'شرطي' ? 'كادر شرطة نظامي' : 'كادر مدني تخصصي'}
                            </div>
                          </div>
                        </div>

                        {/* Financial ID & National ID */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ background: '#f8fafc', padding: '5px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 700 }}>الرقم المالي / الوظيفي:</div>
                            <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#0284c7', direction: 'ltr', textAlign: 'right', fontFamily: 'monospace' }}>
                              {financialId}
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '5px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 700 }}>الرقم الوطني:</div>
                            <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', direction: 'ltr', textAlign: 'right', fontFamily: 'monospace' }}>
                              {member.national_id || '---'}
                            </div>
                          </div>
                        </div>

                        {/* Department & Blood Type */}
                        <div style={{ background: '#f8fafc', padding: '5px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 700 }}>جهة العمل والتبعية:</div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {member.department || 'مديرية أمن أوباري'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'left', paddingRight: '8px', borderRight: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '9px', color: '#dc2626', fontWeight: 800 }}>فصيلة الدم</div>
                            <div style={{ fontSize: '13px', fontWeight: 900, color: '#dc2626' }}>
                              {member.blood_type || 'O+'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Container */}
                      {qrCodeUrl && (
                        <div
                          style={{
                            background: '#ffffff',
                            padding: '6px',
                            borderRadius: '10px',
                            border: '1.5px solid #1e3a8a',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flexShrink: 0
                          }}
                          title="امسح الرمز للتحقق الرقمي الفوري من القيد الأمني"
                        >
                          <img
                            src={qrCodeUrl}
                            alt="QR Verification"
                            style={{ width: '74px', height: '74px', display: 'block' }}
                          />
                          <span style={{ fontSize: '8px', color: '#1e3a8a', fontWeight: 900, marginTop: '2px' }}>
                            مسح للتحقق
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Security Footer */}
                    <div
                      style={{
                        borderTop: '1px dashed #cbd5e1',
                        paddingTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '10.5px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#64748b' }}>تاريخ الإصدار: <strong>2024م</strong></span>
                        <span style={{ color: '#1e3a8a' }}>•</span>
                        <span style={{ color: '#64748b' }}>سارية حتى: <strong>2029م</strong></span>
                      </div>

                      <div style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '1.5px', color: '#1e3a8a', fontWeight: 800 }}>
                        *UBR-MOI-{(member.financial_number || member.id || '2211')}*
                      </div>

                      <div style={{ textAlign: 'left', color: '#0f172a', fontWeight: 800 }}>
                        توقيع مدير أمن أوباري
                      </div>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      BACK FACE OF WHITE SECURITY ID CARD
                      ───────────────────────────────────────────────────────────── */}
                  <div
                    id="moi-printable-card-back"
                    style={{
                      position: isFlipped ? 'relative' : 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: '#ffffff',
                      border: '2px solid #cbd5e1',
                      borderRadius: '16px',
                      padding: '20px 24px',
                      boxShadow: '0 15px 35px rgba(15, 23, 42, 0.12), inset 0 0 0 1px rgba(212, 175, 55, 0.35)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      color: '#0f172a'
                    }}
                  >
                    {/* Back Header */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 900, color: '#1e3a8a' }}>
                          تعليمات أمنية وإذن حمل السلاح الفردي
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                          SECURITY INSTRUCTIONS & FIREARM PERMIT
                        </div>
                      </div>

                      {/* Official Legal Authorization Text */}
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px',
                          margin: '12px 0',
                          fontSize: '11px',
                          lineHeight: 1.65,
                          color: '#334155',
                          textAlign: 'justify'
                        }}
                      >
                        <p style={{ margin: '0 0 6px 0', fontWeight: 800, color: '#1e3a8a' }}>
                          ⚖️ تصريح وإشعار سيادي رسمي:
                        </p>
                        بموجب أحكام القانون رقم (10) لسنة 1992م بشأن هيئة الشرطة وتعديلاته والتشريعات النافذة بدولة ليبيا، يُصرح لحامل هذه الهوية الأمنية بممارسة مهام الضبط القضائي وحمل السلاح الناري الفردي المخصص له رسمياً لأداء الواجب وتأمين الاستقرار. على كافة الأجهزة الأمنية والعسكرية والمدنية تقديم المساعدة اللازمة والتسهيلات المستوجبة لحاملها عند الطلب.
                      </div>

                      {/* Contact & Emergency Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', marginTop: '6px' }}>
                        <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>مكان السكن والإقامة: </span>
                          <strong style={{ color: '#0f172a' }}>{member.residence || 'أوباري'}</strong>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>هاتف الطوارئ / الاتصال: </span>
                          <strong style={{ color: '#0284c7', direction: 'ltr', display: 'inline-block' }}>{member.phone || '092-0000000'}</strong>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>المصرف والفرع: </span>
                          <strong style={{ color: '#0f172a' }}>{member.bank_name || 'الصحاري'} - {member.bank_branch || 'أوباري'}</strong>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>قرار التعيين: </span>
                          <strong style={{ color: '#1e3a8a' }}>{member.appointment_decision || 'قرار وزاري رسمي'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Back Footer with Directorate Circular Stamp */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        <div>في حال العثور عليها تُسلّم لأقرب مركز شرطة</div>
                        <div style={{ color: '#1e3a8a', fontWeight: 800 }}>غرفة عمليات مديرية أمن أوباري: 0773620000</div>
                      </div>

                      {/* Directorate Official Seal Stamp */}
                      <div
                        style={{
                          width: '68px',
                          height: '68px',
                          borderRadius: '50%',
                          border: '2px dashed #1e3a8a',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1e3a8a',
                          transform: 'rotate(-8deg)',
                          background: 'rgba(30, 58, 138, 0.04)'
                        }}
                      >
                        <Shield size={18} color="#1e3a8a" />
                        <span style={{ fontSize: '7.5px', fontWeight: 900, textAlign: 'center', lineHeight: 1.1, marginTop: '2px' }}>
                          مديرية أمن<br />أوباري
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons beneath card */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: '#334155',
                    border: '1.5px solid #cbd5e1',
                    fontWeight: 700,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <RotateCw size={14} />
                  <span>قلب البطاقة ({isFlipped ? 'الوجه الأمامي' : 'الوجه الخلفي'})</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintCard}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(2,132,199,0.3)'
                  }}
                >
                  <Printer size={15} />
                  <span>طباعة بطاقة الهوية (PVC / بطاقة بلاستيكية)</span>
                </button>
              </div>
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════════
               TAB 2: COMPREHENSIVE DOSSIER (White Theme)
               ══════════════════════════════════════════════════════════════ */
            <div>
              {/* Profile Header Bar (Pure White) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '14px',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  {/* Photo Frame with Integrated In-Frame Uploader */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                        fileInputRef.current.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer?.files?.[0];
                      if (file) processImageFile(file);
                    }}
                    style={{
                      width: '92px',
                      height: '116px',
                      borderRadius: '12px',
                      border: currentPhoto ? '2px solid #1e3a8a' : '2px dashed #1e3a8a',
                      background: currentPhoto ? '#f8fafc' : '#eff6ff',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.1)',
                      flexShrink: 0,
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}
                    title="انقر هنا لاختيار صورة، أو اسحب وأفلت ملف الصورة هنا مباشرة"
                  >
                    {currentPhoto ? (
                      <>
                        <img
                          src={currentPhoto}
                          alt={member.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* Inside Frame: Change overlay banner */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.88) 100%)',
                            padding: '6px 0 4px 0',
                            textAlign: 'center',
                            color: '#ffffff',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px'
                          }}
                        >
                          <Camera size={11} color="#fef3c7" />
                          <span>تغيير</span>
                        </div>

                        {/* Inside Frame: Delete photo button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto();
                          }}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            left: '5px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                            zIndex: 4
                          }}
                          title="إزالة الصورة"
                        >
                          <Trash2 size={10} />
                        </button>
                      </>
                    ) : (
                      /* Inside Frame: Empty state with camera button prompt */
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px', textAlign: 'center' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1e3a8a',
                            marginBottom: '6px'
                          }}
                        >
                          <Camera size={18} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#1e3a8a', lineHeight: 1.2 }}>
                          رفع صورة
                        </span>
                        <span style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                          انقر هنا
                        </span>
                      </div>
                    )}

                    {/* Live In-Frame Upload Spinner Overlay */}
                    {isUploading && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(30, 58, 138, 0.82)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 800,
                          gap: '6px',
                          zIndex: 10
                        }}
                      >
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            border: '3px solid rgba(255,255,255,0.35)',
                            borderTopColor: '#ffffff',
                            borderRadius: '50%',
                            animation: 'moiSpin 0.8s linear infinite'
                          }}
                        />
                        <span>جاري الحفظ...</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                      {member.name || '---'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#1e3a8a', color: '#ffffff', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                        {officerRank}
                      </span>
                      <span style={{ background: member.type === 'شرطي' ? '#dbeafe' : '#f1f5f9', color: member.type === 'شرطي' ? '#1e40af' : '#475569', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '12px' }}>
                        {member.type || 'شرطي'}
                      </span>
                      <span style={{ background: statusBg, color: statusColor, padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '12px', border: `1px solid ${statusColor}` }}>
                        {statusDot} {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Left Side: Financial Number (No external button sitting in the middle) */}
                <div style={{ textAlign: 'left', minWidth: '130px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الرقم المالي / الوظيفي</div>
                  <div style={{ fontSize: '19px', fontWeight: 900, color: '#0284c7', direction: 'ltr', textAlign: 'left', fontFamily: 'monospace' }}>
                    {financialId}
                  </div>
                </div>
              </div>

              {/* Three Detail Panels (Pure White Cards with High-Contrast Typography) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {/* 1. Official Career Info */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <Building2 size={16} color="#1e3a8a" />
                    <span>البيانات الوظيفية والتبعية</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                    <div><span style={{ color: '#64748b' }}>جهة العمل / المركز: </span><strong style={{ color: '#0f172a' }}>{member.department || 'مركز شرطة أوباري المدينة'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>الرقم الوطني: </span><strong style={{ color: '#0284c7', direction: 'ltr', display: 'inline-block' }}>{member.national_id || 'غير مسجل'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>المسمى الوظيفي: </span><span style={{ color: '#1e293b' }}>{officerRank}</span></div>
                    <div><span style={{ color: '#64748b' }}>تاريخ المباشرة: </span><span style={{ color: '#1e293b' }}>{member.start_date || '---'}</span></div>
                    <div><span style={{ color: '#64748b' }}>قرار وتاريخ التعيين: </span><span style={{ color: '#1e293b' }}>{member.appointment_decision || '---'} {member.appointment_date ? `(${member.appointment_date})` : ''}</span></div>
                    <div><span style={{ color: '#64748b' }}>قرار وتاريخ آخر ترقية: </span><span style={{ color: '#1e293b' }}>{member.last_promotion_decision || '---'} {member.last_promotion_date ? `(${member.last_promotion_date})` : ''}</span></div>
                  </div>
                </div>

                {/* 2. Financial & Medical Info */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <CreditCard size={16} />
                    <span>البيانات المالية والمصرفية</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                    <div><span style={{ color: '#64748b' }}>اسم المصرف: </span><strong style={{ color: '#0f172a' }}>{member.bank_name || 'الصحاري بنت بيه'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>فرع المصرف: </span><span style={{ color: '#1e293b' }}>{member.bank_branch || 'فرع أوباري'}</span></div>
                    <div><span style={{ color: '#64748b' }}>رقم الحساب المصرفي: </span><strong style={{ color: '#1e40af', direction: 'ltr', display: 'inline-block' }}>{member.account_number || '---'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>المرتب الأساسي: </span><strong style={{ color: '#16a34a' }}>{member.basic_salary ? `${member.basic_salary} د.ل` : '2,200 د.ل'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>فصيلة الدم: </span><strong style={{ color: '#dc2626' }}>{member.blood_type || 'O+'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>اللياقة الصحية: </span><span style={{ color: '#1e293b' }}>{member.diseases || 'سليم ولائق صحياً'}</span></div>
                  </div>
                </div>

                {/* 3. Personal & Social Info */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#7c3aed', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <User size={16} />
                    <span>البيانات الشخصية والاجتماعية</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                    <div><span style={{ color: '#64748b' }}>اسم الأم: </span><span style={{ color: '#1e293b' }}>{member.mother_name || '---'}</span></div>
                    <div><span style={{ color: '#64748b' }}>تاريخ ومكان الميلاد: </span><span style={{ color: '#1e293b' }}>{member.birth_date || '---'} ({member.birth_place || 'أوباري'})</span></div>
                    <div><span style={{ color: '#64748b' }}>الحالة الاجتماعية: </span><span style={{ color: '#1e293b' }}>{member.marital_status || 'متزوج'} {member.children_count ? `(الأبناء: ${member.children_count})` : ''}</span></div>
                    <div><span style={{ color: '#64748b' }}>القبيلة / المدينة: </span><span style={{ color: '#1e293b' }}>{member.tribe_city || 'أوباري'}</span></div>
                    <div><span style={{ color: '#64748b' }}>عنوان السكن: </span><span style={{ color: '#1e293b' }}>{member.residence || 'أوباري المدينة'}</span></div>
                    <div><span style={{ color: '#64748b' }}>رقم الهاتف: </span><strong style={{ color: '#0284c7', direction: 'ltr', display: 'inline-block' }}>{member.phone || '---'}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MODAL FOOTER (White Theme with Crisp Action Buttons)
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(member);
              }}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
              }}
            >
              <Edit size={15} />
              <span>تعديل بيانات القيد</span>
            </button>

            <button
              type="button"
              onClick={handlePrintDossier}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              <span>طباعة الملف الشامل</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 24px',
              borderRadius: '8px',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DEDICATED 2D PRINT DOCUMENT (ZERO 3D TRANSFORMS, 100% VISIBLE)
          ══════════════════════════════════════════════════════════════ */}
      <div id="moi-printable-officer-area">
        {printTarget === 'card' ? (
          <div style={{ width: '100%', maxWidth: '540px', margin: '0 auto', fontFamily: "'Cairo', sans-serif" }}>
            {/* Sovereign State Header (Compact) */}
            <div style={{ textAlign: 'center', marginBottom: '8px', borderBottom: '1.5px solid #1e3a8a', paddingBottom: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#1e3a8a', lineHeight: 1.2 }}>دولة ليبيا • وزارة الداخلية</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>مديرية أمن أوباري</div>
                </div>
                <img src="${window.location.origin}/moi-logo.png" alt="شعار وزارة الداخلية" style={{ width: '38px', height: '38px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div style={{ textAlign: 'left', direction: 'ltr' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#1e3a8a' }}>Ministry of Interior</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#0f172a' }}>Ubari Security Directorate</div>
                </div>
              </div>
              <div style={{ marginTop: '3px', fontSize: '9.5px', fontWeight: 800, color: '#92400e', background: '#fef3c7', display: 'inline-block', padding: '1px 12px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                بطاقة إثبات الهوية الأمنية الرسمية المعتمدة (الوجهين A4 / طباعة وتغليف حراري PVC)
              </div>
            </div>

            {/* Cards Container: Front & Back Fitted for 1 Single Page */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              
              {/* ── CARD FRONT (2D FLAT) ── */}
              <div
                className="printable-card-item"
                style={{
                  width: '500px',
                  height: '270px',
                  maxHeight: '270px',
                  background: '#ffffff',
                  border: '2px solid #1e3a8a',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  boxSizing: 'border-box',
                  position: 'relative',
                  color: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                {/* Tri-color flag ribbon */}
                <div>
                  <div
                    style={{
                      height: '3px',
                      borderRadius: '1.5px',
                      background: 'linear-gradient(90deg, #dc2626 0%, #dc2626 33.3%, #000000 33.3%, #000000 66.6%, #16a34a 66.6%, #16a34a 100%)',
                      marginBottom: '6px'
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src="${window.location.origin}/moi-logo.png" alt="شعار الوزارة" style={{ width: '34px', height: '34px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: '#1e3a8a', lineHeight: 1.1 }}>دولة ليبيا • وزارة الداخلية</div>
                        <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>مديرية أمن أوباري</div>
                        <div style={{ fontSize: '8px', color: '#64748b', fontWeight: 700 }}>UBARI SECURITY DIRECTORATE</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ background: '#eff6ff', border: '1.5px solid #1e3a8a', padding: '2px 10px', borderRadius: '15px', fontSize: '9.5px', fontWeight: 900, color: '#1e3a8a' }}>
                        بطاقة إثبات هوية أمنية
                      </div>
                      <div style={{ fontSize: '7.5px', color: '#64748b', marginTop: '1px', fontWeight: 700 }}>
                        OFFICIAL POLICE IDENTIFICATION
                      </div>
                    </div>

                    {/* Gold Smart Chip */}
                    <div style={{ width: '30px', height: '22px', borderRadius: '4px', background: 'linear-gradient(135deg, #fef08a 0%, #eab308 40%, #ca8a04 100%)', border: '1px solid #b45309', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1px' }}>
                      <div style={{ width: '80%', height: '1px', background: 'rgba(0,0,0,0.35)', margin: '1px 0' }} />
                      <div style={{ width: '80%', height: '1px', background: 'rgba(0,0,0,0.35)', margin: '1px 0' }} />
                    </div>
                  </div>
                </div>

                {/* Middle Section */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '4px 0' }}>
                  {/* Photo Frame */}
                  <div style={{ width: '74px', height: '94px', borderRadius: '8px', border: '1.5px solid #1e3a8a', overflow: 'hidden', flexShrink: 0, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentPhoto ? (
                      <img src={currentPhoto} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#64748b', fontSize: '8.5px', fontWeight: 800 }}>
                        <Shield size={24} color="#1e3a8a" />
                        <div>صورة عسكرية</div>
                      </div>
                    )}
                  </div>

                  {/* Officer Info Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '4px' }}>
                      <div style={{ fontSize: '8px', color: '#64748b', fontWeight: 700 }}>الاسم الرباعي واللقب:</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                        {member.name || '---'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '4px' }}>
                      <div style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>الرتبة / الوظيفة:</div>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: '#1e3a8a' }}>{officerRank}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>التصنيف:</div>
                        <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#0f172a' }}>{member.type || 'كادر شرطة نظامي'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '4px' }}>
                      <div style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>الرقم المالي / الوظيفي:</div>
                        <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#0284c7', direction: 'ltr', textAlign: 'right', fontFamily: 'monospace' }}>{financialId}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>الرقم الوطني:</div>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', direction: 'ltr', textAlign: 'right', fontFamily: 'monospace' }}>{member.national_id || '---'}</div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>جهة العمل والتبعية:</div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#1e293b' }}>{member.department || 'مديرية أمن أوباري'}</div>
                      </div>
                      <div style={{ textAlign: 'left', paddingRight: '6px', borderRight: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '7px', color: '#dc2626', fontWeight: 800 }}>فصيلة الدم</div>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: '#dc2626' }}>{member.blood_type || 'O+'}</div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div style={{ width: '64px', height: '64px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={qrCodeUrl} alt="QR" style={{ width: '54px', height: '54px' }} />
                      <span style={{ fontSize: '6.5px', color: '#64748b', fontWeight: 800 }}>رمز التحقق</span>
                    </div>
                  )}
                </div>

                {/* Footer of Card Front */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', color: '#475569', fontWeight: 700 }}>
                  <div>تاريخ الإصدار: 2024م • سارية حتى: 2029م</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#1e3a8a', fontWeight: 800 }}>*UBR-MOI-{financialId}*</div>
                  <div style={{ color: '#0f172a', fontWeight: 800 }}>توقيع مدير أمن أوباري</div>
                </div>
              </div>

              {/* ── CUTTING & FOLDING GUIDE ── */}
              <div style={{ width: '500px', borderTop: '1.5px dashed #64748b', position: 'relative', margin: '4px 0', textAlign: 'center' }}>
                <span style={{ position: 'relative', top: '-8px', background: '#ffffff', padding: '0 10px', fontSize: '8.5px', fontWeight: 800, color: '#475569' }}>
                  ✂ خط طي وقص البطاقة المعتمد (PVC Standard) ✂
                </span>
              </div>

              {/* ── CARD BACK (2D FLAT) ── */}
              <div
                className="printable-card-item"
                style={{
                  width: '500px',
                  height: '270px',
                  maxHeight: '270px',
                  background: '#ffffff',
                  border: '2px solid #1e3a8a',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  boxSizing: 'border-box',
                  position: 'relative',
                  color: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#1e3a8a' }}>
                      تعليمات أمنية وإذن حمل السلاح الفردي
                    </div>
                    <div style={{ fontSize: '8px', color: '#64748b', fontWeight: 700 }}>
                      SECURITY INSTRUCTIONS & FIREARM PERMIT
                    </div>
                  </div>

                  {/* Legal Text */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      margin: '5px 0',
                      fontSize: '8.5px',
                      lineHeight: 1.45,
                      color: '#334155',
                      textAlign: 'justify'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#1e3a8a', marginBottom: '2px' }}>
                      ⚖️ تصريح وإشعار سيادي رسمي:
                    </div>
                    <div>
                      حامل هذه البطاقة يتبع رسمياً هيئة الشرطة بمديرية أمن أوباري - وزارة الداخلية. ومأذون له بموجب القانون رقم (10) لسنة 1992م والتشريعات المنظمة بحمل سلاحه الشخصي الميري وأداء مهامه الأمنية وضبط المخالفات في كامل التراب الليبي. يرجى من كافة الأجهزة الأمنية والعسكرية تسهيل مهامه والتعاون معه.
                    </div>
                  </div>

                  {/* Firearm & Validity Badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '3px' }}>
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} color="#dc2626" />
                      <div>
                        <div style={{ fontSize: '7.5px', color: '#991b1b', fontWeight: 700 }}>إذن حمل السلاح:</div>
                        <div style={{ fontSize: '9.5px', fontWeight: 900, color: '#b91c1c' }}>مسدس ميري فردي 9 ملم مصرح</div>
                      </div>
                    </div>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BadgeCheck size={16} color="#16a34a" />
                      <div>
                        <div style={{ fontSize: '7.5px', color: '#166534', fontWeight: 700 }}>سريان البطاقة:</div>
                        <div style={{ fontSize: '9.5px', fontWeight: 900, color: '#15803d' }}>سارية المفعول حتى 2029/10/31م</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back Signatures & Stamp */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                  <div>
                    <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>رئيس قسم الشؤون الإدارية:</div>
                    <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#0f172a' }}>عقيد شرطة / فرج محمد السنوسي</div>
                  </div>

                  {/* Stamp Circle */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '1.5px dashed #1e3a8a',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '6.5px',
                      fontWeight: 800,
                      color: '#1e3a8a',
                      textAlign: 'center',
                      lineHeight: 1.15
                    }}
                  >
                    <span>وزارة الداخلية</span>
                    <span>مديرية أمن أوباري</span>
                    <span style={{ color: '#dc2626', fontSize: '5.5px' }}>ختم معتمد</span>
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>يعتمد مدير مديرية أمن أوباري:</div>
                    <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#0f172a' }}>لواء / موسى سعد محمد</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── COMPREHENSIVE DOSSIER A4 SHEET ── */
          <div style={{ maxWidth: '780px', margin: '0 auto', fontFamily: "'Cairo', sans-serif", pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            {/* Dossier Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2.5px solid #1e3a8a', paddingBottom: '10px', marginBottom: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#1e3a8a' }}>دولة ليبيــــا</h2>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>وزارة الداخليـــــة</h3>
                <h4 style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: 700, color: '#334155' }}>مديرية أمن أوباري</h4>
              </div>
              <img src="${window.location.origin}/moi-logo.png" alt="شعار وزارة الداخلية" style={{ width: '60px', height: '60px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div style={{ textAlign: 'left', direction: 'ltr' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a' }}>State of Libya</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Ministry of Interior</div>
                <div style={{ fontSize: '10px', color: '#475569' }}>Ubari Security Directorate</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#0f172a', textDecoration: 'underline' }}>
                الملف والسجل الوظيفي والأمني الموحد
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                كشف رسمي مستخرج من المنظومة المركزية لشؤون الضباط وضباط الصف والأفراد
              </p>
            </div>

            {/* Primary Details Box */}
            <div style={{ display: 'flex', gap: '16px', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '12px', marginBottom: '14px', background: '#f8fafc' }}>
              <div style={{ width: '85px', height: '108px', borderRadius: '6px', border: '2px solid #1e3a8a', overflow: 'hidden', flexShrink: 0, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentPhoto ? (
                  <img src={currentPhoto} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '9px' }}>
                    <Shield size={30} color="#1e3a8a" />
                    <div>صورة عسكرية</div>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div><span style={{ color: '#64748b' }}>الاسم الرباعي: </span><strong style={{ color: '#0f172a', fontSize: '14px' }}>{member.name}</strong></div>
                <div><span style={{ color: '#64748b' }}>الرتبة / الوظيفة: </span><strong style={{ color: '#1e3a8a' }}>{officerRank}</strong></div>
                <div><span style={{ color: '#64748b' }}>الرقم المالي / الوظيفي: </span><strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{financialId}</strong></div>
                <div><span style={{ color: '#64748b' }}>الرقم الوطني: </span><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{member.national_id || '---'}</strong></div>
                <div><span style={{ color: '#64748b' }}>جهة العمل والتبعية: </span><strong>{member.department || 'مديرية أمن أوباري'}</strong></div>
                <div><span style={{ color: '#64748b' }}>الوضع الوظيفي: </span><strong style={{ color: '#16a34a' }}>{statusLabel}</strong></div>
              </div>
            </div>

            {/* Tables of Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {/* Table 1: Career */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                    <th colSpan={4} style={{ padding: '6px 10px', textAlign: 'right' }}>1. البيانات الوظيفية والإدارية</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b', width: '25%' }}>جهة العمل / المركز:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.department || 'مركز شرطة أوباري المدينة'}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b', width: '25%' }}>تاريخ المباشرة:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.start_date || '---'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b' }}>قرار وتاريخ التعيين:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.appointment_decision || '---'} {member.appointment_date ? `(${member.appointment_date})` : ''}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b' }}>قرار وتاريخ آخر ترقية:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.last_promotion_decision || '---'} {member.last_promotion_date ? `(${member.last_promotion_date})` : ''}</td>
                  </tr>
                </tbody>
              </table>

              {/* Table 2: Financial & Banking */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: '#0284c7', color: '#ffffff' }}>
                    <th colSpan={4} style={{ padding: '6px 10px', textAlign: 'right' }}>2. البيانات المالية والمصرفية</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b', width: '25%' }}>اسم المصرف والفرع:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.bank_name || 'الصحاري'} - {member.bank_branch || 'فرع أوباري'}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b', width: '25%' }}>رقم الحساب المصرفي:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800, fontFamily: 'monospace' }}>{member.account_number || '---'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b' }}>المرتب الأساسي:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#16a34a' }}>{member.basic_salary ? `${member.basic_salary} د.ل` : '2,200 د.ل'}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b' }}>فصيلة الدم واللياقة:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.blood_type || 'O+'} ({member.diseases || 'سليم ولائق'})</td>
                  </tr>
                </tbody>
              </table>

              {/* Table 3: Personal & Social */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: '#475569', color: '#ffffff' }}>
                    <th colSpan={4} style={{ padding: '6px 10px', textAlign: 'right' }}>3. البيانات الشخصية والاجتماعية</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b', width: '25%' }}>اسم الأم:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.mother_name || '---'}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b', width: '25%' }}>تاريخ ومكان الميلاد:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.birth_date || '---'} ({member.birth_place || 'أوباري'})</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b' }}>الحالة الاجتماعية:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.marital_status || 'متزوج'} {member.children_count ? `(الأبناء: ${member.children_count})` : ''}</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', color: '#64748b' }}>رقم الهاتف والإقامة:</td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{member.phone || '---'} - {member.residence || 'أوباري المدينة'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dossier Footer with Signatures & Stamp */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px solid #1e3a8a', paddingTop: '10px', marginTop: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الموثق والمدخل</p>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>رئيس قسم الشؤون الإدارية</span>
              </div>

              <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1.5px dashed #1e3a8a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: '#1e3a8a', textAlign: 'center' }}>
                <span>وزارة الداخلية</span>
                <span>مديرية أمن أوباري</span>
                <span style={{ color: '#dc2626' }}>ختم رسمي</span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>يعتمد مدير مديرية أمن أوباري</p>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>لواء / موسى سعد محمد</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
