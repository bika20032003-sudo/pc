import { MOI_LOGO_BASE64 } from './logoBase64.js';

/**
 * منشئ المراسلات والرسائل الرسمية المعتمدة لوزارة الداخلية - مديرية أمن أوباري
 * يولد قالباً رسمياً A4 عالي الدقة متوافقاً مع معايير المراسلات الحكومية الليبية
 */
export function createOfficialLetterHtml({
  reference = '12/2026',
  recordNumber = '1',
  date = new Date().toLocaleDateString('ar-LY'),
  codeNo = 'MOI-UBR-2026',
  department = 'قسم الشؤون الإدارية والمالية',
  recipientTitle = 'إلى السيد / آمر المنطقة العسكرية الجنوبية',
  subject = 'التنسيق الأمني وتسيير الدوريات الأمنية وتأمين المداخل',
  replyToReference = '',
  replyDate = '',
  greeting = 'بعد التحية والاحترام ،،،',
  bodyText = '',
  bodyHtml = '',
  closing = 'والسلام عليكم ورحمة الله وبركاته',
  signerName = 'لواء / موسى سعد محمد',
  signerTitle = 'مدير مديرية أمن أوباري',
  deptOfficerName = 'نقيب / علي سالم محمد',
  deptOfficerTitle = 'رئيس القسم المختص',
  ccList = [
    'مكتب السيد وزير الداخلية',
    'الإدارة العامة للعمليات الأمنية',
    'الإدارة العامة للتفتيش والمتابعة'
  ],
  editor = 'عبدالصمد',
  printer = 'عبدالصمد',
  phone = '0915938137',
  email = 'Info@ubari-security.ly',
  showStamp = true,
  showSignature = true,
  qrCodeUrl = ''
}) {
  const contentBody = bodyHtml || `<p style="line-height: 2.1; font-size: 15px; margin: 0; text-align: justify; white-space: pre-line;">${bodyText || 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وتدابير وفق ما تقتضيه المصلحة الأمنية العامة وخدمة الوطن والمواطن.'}</p>`;

  const halfCc = Math.ceil(ccList.length / 2);
  const ccCol1 = ccList.slice(0, halfCc);
  const ccCol2 = ccList.slice(halfCc);

  return `
    <div class="official-a4-letter-sheet" style="width: 100%; max-width: 760px; margin: 0 auto; background: #ffffff; padding: 22px 28px; font-family: 'Cairo', 'Amiri', Arial, sans-serif; direction: rtl; color: #000000; box-sizing: border-box; position: relative;">
      
      <!-- الشريط الوطني الليبي المعتمد (4 ألوان) -->
      <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
        <div style="flex: 1; background: #e11d48;"></div>
        <div style="flex: 2; background: #000000;"></div>
        <div style="flex: 1; background: #16a34a;"></div>
      </div>

      <!-- الترويسة الرسمية لوزارة الداخلية -->
      <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 14px;">
        <tr>
          <td style="text-align: right; vertical-align: middle; width: 40%;">
            <div style="font-size: 15px; font-weight: 900; color: #1e3a8a; line-height: 1.3;">دولة ليبيـــــــــــــــا</div>
            <div style="font-size: 14px; font-weight: 800; color: #000000; line-height: 1.3;">وزارة الداخليـــــــــــــــة</div>
            <div style="font-size: 13.5px; font-weight: 800; color: #1e3a8a; line-height: 1.3;">مديرية أمن أوبــــــــاري</div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 2px;">${department}</div>
          </td>
          <td style="text-align: center; vertical-align: middle; width: 20%;">
            <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 72px; height: 72px; object-fit: contain; margin: 0 auto; display: block;" />
          </td>
          <td style="text-align: left; direction: ltr; vertical-align: middle; width: 40%;">
            <div style="font-size: 11px; font-weight: 800; color: #1e3a8a; line-height: 1.3;">State of Libya</div>
            <div style="font-size: 10.5px; font-weight: 800; color: #000000; line-height: 1.3;">Ministry of Interior</div>
            <div style="font-size: 10px; font-weight: 800; color: #1e3a8a; line-height: 1.3;">Ubari Security Directorate</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Official Correspondence</div>
          </td>
        </tr>
      </table>

      <!-- جدول القيود والبيانات الرسمية ورمز QR -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
        <tr>
          <td style="width: 78%; vertical-align: top;">
            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 12px; background: #ffffff;">
              <tr>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 800; width: 18%; background: #f8fafc;">الإشـــــاري:</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 900; font-family: monospace; color: #1e3a8a; width: 32%;">${reference}</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 800; width: 18%; background: #f8fafc;">القيــــــد:</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 900; width: 32%;">${recordNumber}</td>
              </tr>
              <tr>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 800; background: #f8fafc;">المـوافــــق:</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 900;">${date}م</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 800; background: #f8fafc;">كــود (Code):</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 900; font-family: monospace; color: #0284c7;">${codeNo}</td>
              </tr>
            </table>
          </td>
          <td style="width: 22%; text-align: left; vertical-align: top; padding-right: 12px;">
            ${qrCodeUrl ? `
              <img src="${qrCodeUrl}" alt="رمز التحقق الأمني" style="width: 60px; height: 60px; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px; margin-right: auto; display: block;" />
            ` : `
              <div style="width: 60px; height: 60px; border: 1px dashed #cbd5e1; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 8px; color: #64748b; margin-right: auto;">
                <span>رمز التحقق</span>
                <span style="font-weight: 800; color: #1e3a8a;">QR CODE</span>
              </div>
            `}
          </td>
        </tr>
      </table>

      <!-- شريط الموضوع المعتمد -->
      <div style="background: #ffffff; border: 2px solid #000000; border-radius: 6px; padding: 7px 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 900; font-size: 13.5px; color: #000000; white-space: nowrap;">بخصــــــــوص /</span>
        <span style="font-weight: 900; font-size: 14px; color: #1e3a8a; flex: 1;">${subject}</span>
      </div>

      <!-- الإشارة إلى مراسلة سابقة (إن وجدت) -->
      ${replyToReference ? `
        <div style="font-size: 12px; color: #334155; margin-bottom: 12px; font-weight: 700;">
          إشارة إلى مراسلتكم رقم: <span style="font-family: monospace; font-weight: 900; color: #000000;">${replyToReference}</span> ${replyDate ? `بتاريخ ${replyDate}م` : ''}
        </div>
      ` : ''}

      <!-- اسم الجهة / الشخص الموجه إليه الخطاب -->
      <div style="margin-bottom: 10px;">
        <h3 style="font-size: 15px; font-weight: 900; color: #000000; margin: 0; line-height: 1.4;">${recipientTitle}</h3>
      </div>

      <!-- التحية الافتتاحية -->
      <div style="margin-bottom: 14px;">
        <p style="font-size: 14px; font-weight: 800; color: #000000; margin: 0;">${greeting}</p>
      </div>

      <!-- نص الرسالة والمضمون -->
      <div style="margin-bottom: 24px; min-height: 120px; font-size: 14.5px; color: #000000; line-height: 2;">
        ${contentBody}
      </div>

      <!-- الخاتمة الرسمية -->
      <div style="text-align: center; margin-bottom: 26px;">
        <p style="font-size: 14px; font-weight: 900; color: #000000; margin: 0;">${closing}</p>
      </div>

      <!-- كتلة التوقيعات والختم المعتمد -->
      <table style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px;">
        <tr>
          <td style="width: 35%; vertical-align: top;">
            <div style="font-weight: 800; font-size: 13px; color: #1e3a8a; margin-bottom: 45px;">${deptOfficerTitle}</div>
            <div style="font-weight: 900; font-size: 13px; color: #000000; border-top: 1px dashed #64748b; padding-top: 5px; width: 85%; margin: 0 auto;">
              ${deptOfficerName}
            </div>
          </td>
          <td style="width: 30%; vertical-align: middle;">
            ${showStamp ? `
              <div style="width: 76px; height: 76px; border-radius: 50%; border: 2px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5px; font-weight: 900; color: #1e3a8a; margin: 0 auto; line-height: 1.25; background: rgba(30,58,138,0.02);">
                <span>دولة ليبيا</span>
                <span>وزارة الداخلية</span>
                <span style="font-size: 8.5px; color: #000000; font-weight: 900;">مديرية أمن أوباري</span>
                <span style="color: #b91c1c; font-size: 7px; margin-top: 2px;">الختم المعتمد</span>
              </div>
            ` : ''}
          </td>
          <td style="width: 35%; vertical-align: top;">
            <div style="font-weight: 800; font-size: 13px; color: #1e3a8a; margin-bottom: 45px;">${signerTitle}</div>
            <div style="font-weight: 900; font-size: 13px; color: #000000; border-top: 1px dashed #64748b; padding-top: 5px; width: 85%; margin: 0 auto;">
              ${showSignature ? signerName : ''}
            </div>
          </td>
        </tr>
      </table>

      <!-- صورة منه إلى (إن وجدت) -->
      ${ccList && ccList.length > 0 ? `
        <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; margin-bottom: 14px; font-size: 11px;">
          <strong style="color: #1e3a8a; display: block; margin-bottom: 4px;">صورة منه إلى :-</strong>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; vertical-align: top;">
                <ul style="margin: 0; padding-right: 14px; list-style-type: square; color: #334155;">
                  ${ccCol1.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </td>
              <td style="width: 50%; vertical-align: top;">
                <ul style="margin: 0; padding-right: 14px; list-style-type: square; color: #334155;">
                  ${ccCol2.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </td>
            </tr>
          </table>
        </div>
      ` : ''}

      <!-- تذييل الصفحة الرسمي وبيانات الاتصال -->
      <div style="border-top: 2px solid #000000; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #475569; font-weight: 700;">
        <div>المحرر: <strong style="color: #000000;">${editor}</strong></div>
        <div>الطباعة: <strong style="color: #000000;">${printer}</strong></div>
        <div>الهاتف: <strong style="color: #000000; direction: ltr; display: inline-block;">${phone}</strong></div>
        <div>البريد: <strong style="color: #1e3a8a; direction: ltr; display: inline-block;">${email}</strong></div>
      </div>
    </div>
  `;
}

