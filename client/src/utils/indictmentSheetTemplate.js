import { MOI_LOGO_BASE64 } from './logoBase64';
import { printDocumentInIframe } from './printHelper';

/**
 * Creates the exact HTML for "صحيفة اتهام للحالات الموجزة" matching the sovereign MOI template.
 * Perfectly calibrated for standard A4 Portrait (عمودي) printing without any header overlap or empty void.
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
  const nationalId = member.national_id || penalty.NationalId || member.national_number || '---';
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
    <div class="indictment-sheet-page" style="width: 100%; max-width: 186mm; margin: 0 auto; background: #ffffff; color: #000000; font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 0; box-sizing: border-box; line-height: 1.5;">
      
      <!-- Libyan 4-Color Sovereign Ribbon -->
      <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 8px;">
        <div style="flex: 1; background: #e11d48;"></div>
        <div style="flex: 2; background: #000000;"></div>
        <div style="flex: 1; background: #16a34a;"></div>
      </div>

      <!-- Top Sovereign Header (Robust Fixed Table - Zero Overlap in Portrait) -->
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 6px; direction: rtl; border: none;">
        <colgroup>
          <col style="width: 34%;" />
          <col style="width: 36%;" />
          <col style="width: 30%;" />
        </colgroup>
        <tr>
          <!-- Right: Official Ministry & Directorate Heading with Emblem -->
          <td style="text-align: right; vertical-align: middle; padding: 0 4px; border: none;">
            <table style="border-collapse: collapse; border: none; margin: 0; direction: rtl;">
              <tr>
                <td style="vertical-align: middle; padding-left: 8px; border: none;">
                  <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 52px; height: 52px; object-fit: contain; display: block;" />
                </td>
                <td style="vertical-align: middle; border: none; text-align: right; white-space: nowrap;">
                  <div style="font-size: 14px; font-weight: 900; color: #1e3a8a; line-height: 1.3;">وزارة الــداخــلــيــة</div>
                  <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; line-height: 1.3;">مديرية أمن أوباري</div>
                  <div style="font-size: 10.5px; font-weight: 700; color: #64748b; line-height: 1.2;">مكتب الانضباط والشؤون القانونية</div>
                </td>
              </tr>
            </table>
          </td>

          <!-- Center: Red Bordered Title Box -->
          <td style="text-align: center; vertical-align: middle; padding: 0 2px; border: none;">
            <div style="display: inline-block; border: 2.5px solid #b91c1c; border-radius: 8px; padding: 6px 14px; background: #ffffff; box-shadow: 0 1px 3px rgba(185, 28, 28, 0.08);">
              <h1 style="margin: 0; font-size: 16.5px; font-weight: 900; color: #b91c1c; letter-spacing: 0.3px; white-space: nowrap; line-height: 1.2;">
                صحـيـفـة اتـهـام لـلـحـالات الـمـوجـزة
              </h1>
            </div>
          </td>

          <!-- Left: Verification QR Code & Photo Box -->
          <td style="text-align: left; vertical-align: middle; padding: 0 4px; border: none;">
            <table style="border-collapse: collapse; border: none; margin-right: auto; margin-left: 0; direction: ltr;">
              <tr>
                <!-- QR Code -->
                <td style="vertical-align: middle; padding-left: 8px; border: none;">
                  ${qrCodeUrl ? `
                    <div style="width: 56px; height: 56px; padding: 2px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; display: flex; align-items: center; justify-content: center;">
                      <img src="${qrCodeUrl}" alt="QR" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
                    </div>
                  ` : `
                    <div style="width: 56px; height: 56px; border: 1px dashed #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 8.5px; color: #94a3b8; font-weight: 700;">
                      رمز التحقق
                    </div>
                  `}
                </td>

                <!-- Photo Box -->
                <td style="vertical-align: middle; border: none;">
                  <div style="width: 58px; height: 72px; border: 1.5px solid #d97706; border-radius: 4px; overflow: hidden; background: #fafafa; display: flex; align-items: center; justify-content: center;">
                    ${photo ? `
                      <img src="${photo}" alt="${accusedName}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                    ` : `
                      <div style="color: #94a3b8; font-size: 11px; font-weight: 800; text-align: center;">
                        صورة
                      </div>
                    `}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Double Divider Line -->
      <div style="border-top: 3px double #000000; margin: 6px 0 10px 0;"></div>

      <!-- Sovereign Metadata / Identification Bar -->
      <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; background: #f8fafc; font-size: 12.5px; margin-bottom: 12px; table-layout: fixed;">
        <tr>
          <td style="padding: 7px 10px; border: 1px solid #000000; width: 25%; font-weight: 800; color: #1e3a8a;">
            الرقم الوطني: <span style="font-family: monospace; font-size: 13.5px; font-weight: 900; color: #000000;">${nationalId}</span>
          </td>
          <td style="padding: 7px 10px; border: 1px solid #000000; width: 25%; font-weight: 800; color: #1e3a8a;">
            رقم القيد العسكري: <span style="font-family: monospace; font-size: 13.5px; font-weight: 900; color: #000000;">${number}</span>
          </td>
          <td style="padding: 7px 10px; border: 1px solid #000000; width: 25%; font-weight: 800; color: #1e3a8a;">
            تاريخ الواقعة: <span style="font-weight: 900; color: #000000;">${incidentDate}</span>
          </td>
          <td style="padding: 7px 10px; border: 1px solid #000000; width: 25%; font-weight: 800; color: #1e3a8a;">
            مكان الضبط: <span style="font-weight: 900; color: #000000;">${incidentLocation}</span>
          </td>
        </tr>
      </table>

      <!-- Section Title 1: ملخص الاتهام والواقعة -->
      <div style="font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 5px; display: flex; align-items: center; gap: 6px;">
        <span>■ بيانات المتهم والواقعة المنسوبة:</span>
      </div>

      <!-- Main Case Summary Table -->
      <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; margin-bottom: 14px; table-layout: fixed;">
        <thead>
          <tr style="background: #e2e8f0; color: #0f172a;">
            <th style="border: 1.5px solid #000000; padding: 8px 4px; font-size: 12.5px; font-weight: 900; text-align: center; width: 12%;">الرقم</th>
            <th style="border: 1.5px solid #000000; padding: 8px 4px; font-size: 12.5px; font-weight: 900; text-align: center; width: 14%;">الرتبة / الصفة</th>
            <th style="border: 1.5px solid #000000; padding: 8px 6px; font-size: 13.5px; font-weight: 900; text-align: center; width: 24%;">اسم المتهم</th>
            <th style="border: 1.5px solid #000000; padding: 8px 4px; font-size: 12.5px; font-weight: 900; text-align: center; width: 18%;">تاريخ ومكان الواقعة</th>
            <th style="border: 1.5px solid #000000; padding: 8px 6px; font-size: 12.5px; font-weight: 900; text-align: center; width: 18%;">التهمة والمادة القانونية</th>
            <th style="border: 1.5px solid #000000; padding: 8px 4px; font-size: 12.5px; font-weight: 900; text-align: center; width: 14%;">الحكم / الإجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1.5px solid #000000; padding: 14px 6px; text-align: center; font-size: 13.5px; font-weight: 900; font-family: monospace, Arial;">
              ${number}
            </td>
            <td style="border: 1.5px solid #000000; padding: 14px 6px; text-align: center; font-size: 13px; font-weight: 800; color: #0f172a;">
              ${rank}
            </td>
            <td style="border: 1.5px solid #000000; padding: 14px 8px; text-align: center; font-size: 14.5px; font-weight: 900; color: #b91c1c;">
              ${accusedName}
            </td>
            <td style="border: 1.5px solid #000000; padding: 14px 6px; text-align: center; font-size: 12.5px; font-weight: 800;">
              ${incidentLocation} - ${incidentDate}
            </td>
            <td style="border: 1.5px solid #000000; padding: 14px 8px; text-align: center; font-size: 12.5px; font-weight: 800; color: #1e293b;">
              ${chargeAndArticle}
            </td>
            <td style="border: 1.5px solid #000000; padding: 14px 6px; text-align: center; font-size: 13px; font-weight: 900; color: #0f172a;">
              ${verdictOrAction}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Section Title 2: حيثيات الاتهام والسند القانوني (Fills the Page Authentically) -->
      <div style="font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 5px;">
        <span>■ حيثيات الاتهام والسند القانوني للعقوبة الانضباطية:</span>
      </div>

      <!-- Legal Grounds Box -->
      <div style="border: 1.5px solid #000000; background: #ffffff; padding: 10px 14px; margin-bottom: 16px; font-size: 12.5px; line-height: 1.8; color: #000000;">
        <div style="margin-bottom: 6px;">
          <strong style="color: #1e3a8a;">1. وصف الواقعة والتحقيق:</strong>
          <span>بناءً على التقارير الأمنية والانضباطية الواردة ومذكرة الضبط المؤرخة في <strong>${incidentDate}</strong>، ثبت ارتكاب المتهم المذكور أعلاه للمخالفة الانضباطية المنسوبة إليه (<strong>${chargeAndArticle}</strong>) بما يخل بمقتضيات الواجب المسلكي وشرف الخدمة بهيئة الشرطة.</span>
        </div>
        <div style="margin-bottom: 6px;">
          <strong style="color: #1e3a8a;">2. السند القانوني:</strong>
          <span>تطبيقاً لأحكام القانون رقم (10) لسنة 1992م بشأن الشرطة، والقوانين واللوائح المنظمة للانضباط بالمديرية، ولما تقتضيه المصلحة الأمنية العامة لفرض الضبط والربط العسكري.</span>
        </div>
        <div>
          <strong style="color: #b91c1c;">3. منطوق قرار المحاكمة الموجزة:</strong>
          <span>تقرر توقيع عقوبة <strong>( ${verdictOrAction} )</strong> على المتهم المذكور، مع قيدها بالسجل الانضباطي وإحالة نسخة رسمية لإدارة الشؤون الإدارية والمالية للتنفيذ فوراً.</span>
        </div>
      </div>

      <!-- Bottom Signatures & Trial Box Section -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; table-layout: fixed; border: none;">
        <tr>
          <!-- Right: Official Officer Signatures -->
          <td style="vertical-align: top; width: 48%; text-align: right; padding-right: 8px; border: none;">
            <div style="display: inline-block; text-align: right; font-size: 12.5px; font-weight: 800; line-height: 2.1; color: #000000;">
              <div>التوقيع: .......................................</div>
              <div>الرتبة: .......................................</div>
              <div>المنصب: .......................................</div>
              <div>الاسم: .......................................</div>
            </div>
          </td>

          <!-- Center: Official Ministry Stamp Placeholder -->
          <td style="vertical-align: middle; width: 24%; text-align: center; border: none;">
            <div style="width: 78px; height: 78px; border-radius: 50%; border: 2px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 8px; font-weight: 900; color: #1e3a8a; margin: 0 auto; line-height: 1.25; background: rgba(30,58,138,0.02);">
              <span>دولة ليبيا</span>
              <span>وزارة الداخلية</span>
              <span style="font-size: 8.5px; color: #000000; font-weight: 900;">مديرية أمن أوباري</span>
              <span style="color: #b91c1c; font-size: 7.5px; margin-top: 1px;">الختم المعتمد</span>
            </div>
          </td>

          <!-- Left: Trial Schedule Box -->
          <td style="vertical-align: top; width: 28%; text-align: left; padding-left: 4px; border: none;">
            <table style="border-collapse: collapse; border: 1.5px solid #000000; width: 100%; font-size: 12px; margin-right: auto; margin-left: 0;">
              <tr>
                <td style="border: 1.5px solid #000000; padding: 6px 8px; background: #f8fafc; font-weight: 800; width: 45%; text-align: center;">
                  تاريخ المحاكمة
                </td>
                <td style="border: 1.5px solid #000000; padding: 6px 8px; text-align: center; font-weight: 800; direction: ltr;">
                  ${trialDate}
                </td>
              </tr>
              <tr>
                <td style="border: 1.5px solid #000000; padding: 6px 8px; background: #f8fafc; font-weight: 800; text-align: center;">
                  مكان المحاكمة
                </td>
                <td style="border: 1.5px solid #000000; padding: 6px 8px; text-align: center; font-weight: 800;">
                  ${trialLocation}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Official Directorate Endorsement Bar -->
      <table style="width: 100%; border-collapse: collapse; border-top: 1.5px solid #000000; padding-top: 8px; margin-bottom: 12px;">
        <tr>
          <td style="width: 60%; text-align: right; vertical-align: middle; font-size: 12px; font-weight: 800;">
            <div style="color: #1e3a8a;">يعتمد / مدير مديرية أمن أوباري</div>
            <div style="font-size: 13.5px; font-weight: 900; color: #000000; margin-top: 2px;">لواء / موسى سعد البدین</div>
          </td>
          <td style="width: 40%; text-align: left; vertical-align: middle; font-size: 12px; font-weight: 800;">
            <div>التوقيع: .......................................</div>
            <div style="margin-top: 3px;">التاريخ: ..... / ..... / 202 م</div>
          </td>
        </tr>
      </table>

      <!-- Carbon Copy Footer (صورة منه إلى) -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 6px; font-size: 10.5px; color: #475569; font-weight: 700; line-height: 1.6;">
        <div>صورة / مكتب الانضباط والشؤون القانونية</div>
        <div>صورة / مدير إدارة الشؤون الإدارية والمالية (قسم المرتبات للتنفيذ)</div>
        <div>صورة / الملف 2.2 ج الدوري للحفظ</div>
        <div>الملف الشخصي للمنتسب للحفظ</div>
      </div>

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
