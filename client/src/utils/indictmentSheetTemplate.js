import { MOI_LOGO_BASE64 } from './logoBase64';
import { printDocumentInIframe } from './printHelper';

/**
 * Creates the exact HTML for "صحيفة اتهام للحالات الموجزة" matching the sovereign MOI template.
 * Designed strictly for A4 Landscape printing with zero header overlap and perfect column alignment.
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
  const verdictOrAction = customFields.verdict || (penalty.PenaltyType ? `${penalty.PenaltyType}${penalty.DeductionDays > 0 ? ` (${penalty.DeductionDays} أيام)` : ''}` : 'خصم مالي');
  const trialDate = customFields.trialDate || '..... / ..... / 202 م';
  const trialLocation = customFields.trialLocation || 'مديرية أمن أوباري';
  const photo = member.photo || localStorage.getItem(`ubari_officer_photo_${member.id}`) || '';

  return `
    <div class="indictment-sheet-page orientation-landscape" style="width: 100%; max-width: 280mm; margin: 0 auto; background: #ffffff; color: #000000; font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 6mm 8mm; box-sizing: border-box;">
      
      <!-- Top Sovereign Header (Strict Fixed Table - Zero Overlap) -->
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 8px; direction: rtl; border: none;">
        <colgroup>
          <col style="width: 31%;" />
          <col style="width: 38%;" />
          <col style="width: 31%;" />
        </colgroup>
        <tr>
          <!-- Right (Col 1 in RTL): Official Ministry & Directorate Heading with Crest -->
          <td style="text-align: right; vertical-align: middle; padding: 0 4px; border: none; overflow: hidden;">
            <table style="border-collapse: collapse; border: none; margin: 0; direction: rtl;">
              <tr>
                <td style="vertical-align: middle; padding-left: 10px; border: none;">
                  <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 58px; height: 58px; object-fit: contain; display: block;" />
                </td>
                <td style="vertical-align: middle; border: none; text-align: right; white-space: nowrap;">
                  <div style="font-size: 15.5px; font-weight: 900; color: #1e3a8a; line-height: 1.35; letter-spacing: 0.2px;">وزارة الــداخــلــيــة</div>
                  <div style="font-size: 13.5px; font-weight: 800; color: #0f172a; line-height: 1.35;">مديرية أمن أوباري</div>
                </td>
              </tr>
            </table>
          </td>

          <!-- Center (Col 2 in RTL): Red Bordered Title Box -->
          <td style="text-align: center; vertical-align: middle; padding: 0 4px; border: none;">
            <div style="display: inline-block; border: 2.5px solid #b91c1c; border-radius: 10px; padding: 7px 22px; background: #ffffff; box-shadow: 0 1px 4px rgba(185, 28, 28, 0.08);">
              <h1 style="margin: 0; font-size: 19px; font-weight: 900; color: #b91c1c; letter-spacing: 0.5px; white-space: nowrap; line-height: 1.25;">
                صحـيـفـة اتـهـام لـلـحـالات الـمـوجـزة
              </h1>
            </div>
          </td>

          <!-- Left (Col 3 in RTL): Photo Box & Verification QR Code -->
          <td style="text-align: left; vertical-align: middle; padding: 0 4px; border: none;">
            <table style="border-collapse: collapse; border: none; margin-right: auto; margin-left: 0; direction: ltr;">
              <tr>
                <!-- Photo Box (At outer left edge) -->
                <td style="vertical-align: middle; padding-right: 12px; border: none;">
                  <div style="width: 76px; height: 96px; border: 1.5px solid #d97706; border-radius: 6px; overflow: hidden; background: #fafafa; display: flex; align-items: center; justify-content: center;">
                    ${photo ? `
                      <img src="${photo}" alt="${accusedName}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                    ` : `
                      <div style="color: #94a3b8; font-size: 13.5px; font-weight: 800; text-align: center;">
                        صورة
                      </div>
                    `}
                  </div>
                </td>

                <!-- QR Code (Placed beside photo towards center) -->
                <td style="vertical-align: middle; border: none;">
                  ${qrCodeUrl ? `
                    <div style="width: 72px; height: 72px; padding: 2px; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; display: flex; align-items: center; justify-content: center;">
                      <img src="${qrCodeUrl}" alt="QR" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
                    </div>
                  ` : `
                    <div style="width: 72px; height: 72px; border: 1px dashed #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; font-weight: 700;">
                      رمز التحقق
                    </div>
                  `}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Double Divider Line -->
      <div style="border-top: 3px double #000000; margin: 10px 0 20px 0;"></div>

      <!-- Main Case Summary Table -->
      <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; margin-bottom: 45px; table-layout: fixed;">
        <thead>
          <tr style="background: #cbd5e1; color: #0f172a;">
            <th style="border: 1.5px solid #000000; padding: 10px 4px; font-size: 13.5px; font-weight: 900; text-align: center; width: 12%;">الرقم</th>
            <th style="border: 1.5px solid #000000; padding: 10px 4px; font-size: 13.5px; font-weight: 900; text-align: center; width: 14%;">الرتبة / الصفة</th>
            <th style="border: 1.5px solid #000000; padding: 10px 6px; font-size: 14px; font-weight: 900; text-align: center; width: 24%;">اسم المتهم</th>
            <th style="border: 1.5px solid #000000; padding: 10px 4px; font-size: 13.5px; font-weight: 900; text-align: center; width: 18%;">تاريخ ومكان الواقعة</th>
            <th style="border: 1.5px solid #000000; padding: 10px 6px; font-size: 13.5px; font-weight: 900; text-align: center; width: 18%;">التهمة والمادة القانونية</th>
            <th style="border: 1.5px solid #000000; padding: 10px 4px; font-size: 13.5px; font-weight: 900; text-align: center; width: 14%;">الحكم / الإجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1.5px solid #000000; padding: 20px 6px; text-align: center; font-size: 14px; font-weight: 900; font-family: monospace, Arial;">
              ${number}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 6px; text-align: center; font-size: 13.5px; font-weight: 800; color: #0f172a;">
              ${rank}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 8px; text-align: center; font-size: 15.5px; font-weight: 900; color: #b91c1c;">
              ${accusedName}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 6px; text-align: center; font-size: 13px; font-weight: 800;">
              ${incidentLocation} - ${incidentDate}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 8px; text-align: center; font-size: 13px; font-weight: 800; color: #1e293b;">
              ${chargeAndArticle}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 6px; text-align: center; font-size: 13.5px; font-weight: 900; color: #0f172a;">
              ${verdictOrAction}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom Signatures & Trial Box Section -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 25px; table-layout: fixed; border: none;">
        <tr>
          <!-- Right (First TD in RTL): Signatures removed -->
          <td style="vertical-align: bottom; width: 50%; text-align: right; padding-right: 15px; border: none;">
          </td>

          <!-- Left (Second TD in RTL): Trial Schedule Box -->
          <td style="vertical-align: bottom; width: 50%; text-align: left; padding-left: 15px; border: none;">
            <table style="border-collapse: collapse; border: 1.5px solid #000000; width: 280px; font-size: 12.5px; margin-right: auto; margin-left: 0;">
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
        </tr>
      </table>

      <!-- Strict Print Styling for Single A4 Landscape Page -->
      <style>
        @page {
          size: A4 landscape !important;
          margin: 8mm 12mm !important;
        }
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 8mm 12mm !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            width: 100% !important;
            height: 100% !important;
          }
          .indictment-sheet-page {
            max-width: 100% !important;
            width: 100% !important;
            padding: 4mm 6mm !important;
            margin: 0 auto !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
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
