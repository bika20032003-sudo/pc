import { MOI_LOGO_BASE64 } from './logoBase64';
import { printDocumentInIframe } from './printHelper';

/**
 * Creates the exact HTML for "صحيفة اتهام للحالات الموجزة" matching the sovereign MOI template.
 * 
 * @param {Object} params
 * @param {Object} params.member - Force member object
 * @param {Object} params.penalty - Penalty/charge record
 * @param {string} [params.qrCodeUrl] - Base64 or URL of QR code
 * @param {Object} [params.customFields] - Overrides for location, trialDate, trialLocation, etc.
 * @returns {string} HTML string
 */
export function createIndictmentSheetHtml({
  member = {},
  penalty = {},
  qrCodeUrl = '',
  customFields = {}
}) {
  const number = penalty.MilitaryNumber || member.military_number || penalty.JobNumber || member.financial_number || member.job_number || member.national_id || '---';
  const rank = member.rank || penalty.EmployeeCategory || member.type || 'غير محدد';
  const accusedName = penalty.FullName || member.name || '---';
  const incidentDate = penalty.PenaltyDate || penalty.penalty_date || customFields.incidentDate || new Date().toISOString().slice(0, 10);
  const incidentLocation = customFields.incidentLocation || 'أوباري';
  const chargeAndArticle = customFields.charge || penalty.Reason || 'غياب عن العمل';
  const verdictOrAction = customFields.verdict || penalty.PenaltyType || 'خصم مالي';
  const trialDate = customFields.trialDate || '..... / ..... / 202 م';
  const trialLocation = customFields.trialLocation || '....................';
  const photo = member.photo || localStorage.getItem(`ubari_officer_photo_${member.id}`) || '';

  return `
    <div class="indictment-sheet-page" style="width: 100%; max-width: 900px; margin: 0 auto; background: #ffffff; color: #0f172a; font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 24px 28px; box-sizing: border-box;">
      
      <!-- Top Sovereign Header -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
        <tr>
          <!-- Right: Official Ministry & Directorate Heading -->
          <td style="text-align: right; vertical-align: middle; width: 28%;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 58px; height: 58px; object-fit: contain;" />
              <div>
                <div style="font-size: 15px; font-weight: 900; color: #1e3a8a; line-height: 1.3;">وزارة الــداخــلــيــة</div>
                <div style="font-size: 13.5px; font-weight: 800; color: #0f172a; line-height: 1.3;">مديرية أمن أوباري</div>
              </div>
            </div>
          </td>

          <!-- Center: Red Bordered Title Box -->
          <td style="text-align: center; vertical-align: middle; width: 44%;">
            <div style="display: inline-block; border: 2px solid #b91c1c; border-radius: 12px; padding: 8px 24px; background: #ffffff; box-shadow: 0 1px 4px rgba(185, 28, 28, 0.08);">
              <h1 style="margin: 0; font-size: 21px; font-weight: 900; color: #b91c1c; letter-spacing: 0.5px; white-space: nowrap;">
                صحـيـفـة اتـهـام لـلـحـالات الـمـوجـزة
              </h1>
            </div>
          </td>

          <!-- Left: Photo Frame & QR Code -->
          <td style="text-align: left; vertical-align: middle; width: 28%;">
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px;">
              <!-- QR Code -->
              ${qrCodeUrl ? `
                <div style="width: 72px; height: 72px; padding: 2px; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; display: flex; align-items: center; justify-content: center;">
                  <img src="${qrCodeUrl}" alt="QR" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
              ` : `
                <div style="width: 72px; height: 72px; border: 1px dashed #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; font-weight: 700;">
                  رمز التحقق
                </div>
              `}

              <!-- Photo Box (Golden / Amber border matching official ID) -->
              <div style="width: 78px; height: 98px; border: 1.5px solid #d97706; border-radius: 8px; overflow: hidden; background: #fafafa; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${photo ? `
                  <img src="${photo}" alt="${accusedName}" style="width: 100%; height: 100%; object-fit: cover;" />
                ` : `
                  <div style="color: #94a3b8; font-size: 14px; font-weight: 800; text-align: center;">
                    صورة
                  </div>
                `}
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Double Divider Line -->
      <div style="border-top: 3px double #0f172a; margin: 12px 0 24px 0;"></div>

      <!-- Main Case Summary Table -->
      <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; margin-bottom: 70px;">
        <thead>
          <tr style="background: #cbd5e1; color: #0f172a;">
            <th style="border: 1.5px solid #000000; padding: 10px 4px; font-size: 13.5px; font-weight: 900; text-align: center; width: 12%;">الرقم</th>
            <th style="border: 1.5px solid #000000; padding: 10px 4px; font-size: 13.5px; font-weight: 900; text-align: center; width: 14%;">الرتبة / الصفة</th>
            <th style="border: 1.5px solid #000000; padding: 10px 6px; font-size: 13.5px; font-weight: 900; text-align: center; width: 24%;">اسم المتهم</th>
            <th style="border: 1.5px solid #000000; padding: 10px 4px; font-size: 13.5px; font-weight: 900; text-align: center; width: 18%;">تاريخ ومكان الواقعة</th>
            <th style="border: 1.5px solid #000000; padding: 10px 6px; font-size: 13.5px; font-weight: 900; text-align: center; width: 18%;">التهمة والمادة القانونية</th>
            <th style="border: 1.5px solid #000000; padding: 10px 4px; font-size: 13.5px; font-weight: 900; text-align: center; width: 14%;">الحكم / الإجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1.5px solid #000000; padding: 22px 6px; text-align: center; font-size: 14px; font-weight: 900; font-family: monospace, Arial;">
              ${number}
            </td>
            <td style="border: 1.5px solid #000000; padding: 22px 6px; text-align: center; font-size: 13.5px; font-weight: 800; color: #1e3a8a;">
              ${rank}
            </td>
            <td style="border: 1.5px solid #000000; padding: 22px 8px; text-align: center; font-size: 15px; font-weight: 900; color: #b91c1c;">
              ${accusedName}
            </td>
            <td style="border: 1.5px solid #000000; padding: 22px 6px; text-align: center; font-size: 13px; font-weight: 800;">
              ${incidentLocation} - ${incidentDate}
            </td>
            <td style="border: 1.5px solid #000000; padding: 22px 8px; text-align: center; font-size: 13px; font-weight: 800; color: #334155;">
              ${chargeAndArticle}
            </td>
            <td style="border: 1.5px solid #000000; padding: 22px 6px; text-align: center; font-size: 13.5px; font-weight: 900; color: #0f172a;">
              ${verdictOrAction}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom Signatures & Trial Box Section -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
        <tr>
          <!-- Left: Trial Schedule Box -->
          <td style="vertical-align: bottom; width: 45%; text-align: right;">
            <table style="border-collapse: collapse; border: 1.5px solid #000000; width: 270px; font-size: 12.5px;">
              <tr>
                <td style="border: 1.5px solid #000000; padding: 7px 10px; background: #f8fafc; font-weight: 800; width: 45%; text-align: center;">
                  تاريخ المحاكمة
                </td>
                <td style="border: 1.5px solid #000000; padding: 7px 10px; text-align: center; font-weight: 700; direction: ltr;">
                  ${trialDate}
                </td>
              </tr>
              <tr>
                <td style="border: 1.5px solid #000000; padding: 7px 10px; background: #f8fafc; font-weight: 800; text-align: center;">
                  مكان المحاكمة
                </td>
                <td style="border: 1.5px solid #000000; padding: 7px 10px; text-align: center; font-weight: 700;">
                  ${trialLocation}
                </td>
              </tr>
            </table>
          </td>

          <!-- Right: Official Officer Signatures -->
          <td style="vertical-align: bottom; width: 55%; text-align: left;">
            <div style="display: inline-block; text-align: right; font-size: 13.5px; font-weight: 800; line-height: 2.2; color: #0f172a; margin-right: 20px;">
              <div>التوقيع: ............................</div>
              <div>الرتبة: ............................</div>
              <div>المنصب: ............................</div>
              <div>الاسم: ............................</div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Print Styling for Single A4 Page -->
      <style>
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .indictment-sheet-page {
            max-width: 100% !important;
            width: 100% !important;
            padding: 15mm 15mm !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      </style>
    </div>
  `;
}

/**
 * Prints the Indictment Sheet in an isolated iframe.
 */
export function printIndictmentSheet({
  member,
  penalty,
  qrCodeUrl = '',
  customFields = {}
}) {
  const html = createIndictmentSheetHtml({
    member,
    penalty,
    qrCodeUrl,
    customFields
  });
  const name = penalty?.FullName || member?.name || 'المنتسب';
  printDocumentInIframe(html, `صحيفة اتهام - ${name}`);
}
