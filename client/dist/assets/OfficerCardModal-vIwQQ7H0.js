import{r as a,j as e}from"./vendor-react-0RU1ubfM.js";import{b as he}from"./vendor-qrcode-CjSdxGTc.js";import{p as Q}from"./printHelper-Da8XnqdD.js";import{M as v,n as te}from"./index-DaTokJrZ.js";import{r as be,O as ie,a as ye}from"./editorFonts-BrLT2E2l.js";import{i as ue,I as ve}from"./IndictmentSheetModal-Dpd_EUmg.js";import{r as X,a3 as oe,$ as O,i as de,X as ne,f as le,a4 as se,S as J,d as q,n as re,t as Z,B as je,a5 as me,A as we,g as ze,q as Se}from"./vendor-icons-BCWJvmsE.js";import"./data-force-db-CUxU07jc.js";function ke({reference:t="12/2026",recordNumber:C="1",date:P=new Date().toLocaleDateString("ar-LY"),codeNo:R="MOI-UBR-2026",department:j="قسم الشؤون الإدارية والمالية",recipientTitle:b="إلى السيد / آمر المنطقة العسكرية الجنوبية",subject:$="التنسيق الأمني وتسيير الدوريات الأمنية وتأمين المداخل",replyToReference:k="",replyDate:I="",greeting:E="بعد التحية والاحترام ،،،",bodyText:_="",bodyHtml:N="",closing:d="والسلام عليكم ورحمة الله وبركاته",signerName:F="لواء / موسى سعد محمد",signerTitle:m="مدير مديرية أمن أوباري",deptOfficerName:U="نقيب / علي سالم محمد",deptOfficerTitle:z="رئيس القسم المختص",ccList:W=["مكتب السيد وزير الداخلية","الإدارة العامة للعمليات الأمنية","الإدارة العامة للتفتيش والمتابعة"],editor:M="عبدالصمد",printer:S="عبدالصمد",phone:c=ie.phone,email:s=ie.email,showStamp:n=!0,showSignature:T=!0,qrCodeUrl:L=""}){const H=be(c),G=ye(s),D=N||`<p style="line-height: 2.1; font-size: 15px; margin: 0; text-align: justify; white-space: pre-line;">${_||"إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وتدابير وفق ما تقتضيه المصلحة الأمنية العامة وخدمة الوطن والمواطن."}</p>`,V=Math.ceil(W.length/2),A=W.slice(0,V),p=W.slice(V);return`
    <div class="official-a4-letter-sheet" style="width: 100%; max-width: 186mm; min-height: 273mm; margin: 0 auto; background: #ffffff; padding: 3mm 5mm; font-family: 'Cairo', 'Amiri', Arial, sans-serif; direction: rtl; color: #000000; box-sizing: border-box; position: relative; display: flex; flex-direction: column;">
      
      <!-- الشريط الوطني الليبي المعتمد -->
      <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <div style="flex: 1; background: #e11d48;"></div>
        <div style="flex: 2; background: #000000;"></div>
        <div style="flex: 1; background: #16a34a;"></div>
      </div>

      <!-- الترويسة الرسمية لوزارة الداخلية -->
      <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 14px;">
        <tr>
          <td style="text-align: right; vertical-align: middle; width: 40%;">
            <div style="font-size: 15px; font-weight: 900; color: #1e3a8a; line-height: 1.3;">دولة ليبيا</div>
            <div style="font-size: 14px; font-weight: 800; color: #000000; line-height: 1.3;">وزارة الداخلية</div>
            <div style="font-size: 13.5px; font-weight: 800; color: #1e3a8a; line-height: 1.3;">مديرية أمن أوباري</div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 2px;">${j}</div>
          </td>
          <td style="text-align: center; vertical-align: middle; width: 20%;">
            <img src="${v}" alt="شعار وزارة الداخلية" style="width: 72px; height: 72px; object-fit: contain; margin: 0 auto; display: block;" />
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
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 900; font-family: monospace; color: #1e3a8a; width: 32%;">${t}</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 800; width: 18%; background: #f8fafc;">القيــــــد:</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 900; width: 32%;">${C}</td>
              </tr>
              <tr>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 800; background: #f8fafc;">المـوافــــق:</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 900;">${P}م</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 800; background: #f8fafc;">كــود (Code):</td>
                <td style="padding: 5px 10px; border: 1px solid #000000; font-weight: 900; font-family: monospace; color: #0284c7;">${R}</td>
              </tr>
            </table>
          </td>
          <td style="width: 22%; text-align: left; vertical-align: top; padding-right: 12px;">
            ${L?`
              <img src="${L}" alt="رمز التحقق الأمني" style="width: 60px; height: 60px; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px; margin-right: auto; display: block;" />
            `:`
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
        <span style="font-weight: 900; font-size: 14px; color: #1e3a8a; flex: 1;">${$}</span>
      </div>

      <!-- الإشارة إلى مراسلة سابقة (إن وجدت) -->
      ${k?`
        <div style="font-size: 12px; color: #334155; margin-bottom: 12px; font-weight: 700;">
          إشارة إلى مراسلتكم رقم: <span style="font-family: monospace; font-weight: 900; color: #000000;">${k}</span> ${I?`بتاريخ ${I}م`:""}
        </div>
      `:""}

      <!-- اسم الجهة / الشخص الموجه إليه الخطاب -->
      <div style="margin-bottom: 10px;">
        <h3 style="font-size: 15px; font-weight: 900; color: #000000; margin: 0; line-height: 1.4;">${b}</h3>
      </div>

      <!-- التحية الافتتاحية -->
      <div style="margin-bottom: 14px;">
        <p style="font-size: 14px; font-weight: 800; color: #000000; margin: 0;">${E}</p>
      </div>

      <!-- نص الرسالة والمضمون -->
      <div style="margin-bottom: 24px; min-height: 120px; font-size: 14.5px; color: #000000; line-height: 2;">
        ${D}
      </div>

      <!-- الخاتمة الرسمية -->
      <div style="text-align: center; margin-bottom: 26px;">
        <p style="font-size: 14px; font-weight: 900; color: #000000; margin: 0;">${d}</p>
      </div>

      ${T?`
      <!-- كتلة التوقيعات والختم المعتمد -->
      <table style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px;">
        <tr>
          <td style="width: 35%; vertical-align: top;">
            <div style="font-weight: 800; font-size: 13px; color: #1e3a8a; margin-bottom: 45px;">${z}</div>
            <div style="font-weight: 900; font-size: 13px; color: #000000; border-top: 1px dashed #64748b; padding-top: 5px; width: 85%; margin: 0 auto;">
              ${U}
            </div>
          </td>
          <td style="width: 30%; vertical-align: middle;">
            ${n?`
              <div style="width: 76px; height: 76px; border-radius: 50%; border: 2px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5px; font-weight: 900; color: #1e3a8a; margin: 0 auto; line-height: 1.25; background: rgba(30,58,138,0.02);">
                <span>دولة ليبيا</span>
                <span>وزارة الداخلية</span>
                <span style="font-size: 8.5px; color: #000000; font-weight: 900;">مديرية أمن أوباري</span>
                <span style="color: #b91c1c; font-size: 7px; margin-top: 2px;">الختم المعتمد</span>
              </div>
            `:""}
          </td>
          <td style="width: 35%; vertical-align: top;">
            <div style="font-weight: 800; font-size: 13px; color: #1e3a8a; margin-bottom: 45px;">${m}</div>
            <div style="font-weight: 900; font-size: 13px; color: #000000; border-top: 1px dashed #64748b; padding-top: 5px; width: 85%; margin: 0 auto;">
              ${F}
            </div>
          </td>
        </tr>
      </table>`:""}

      <!-- صورة منه إلى (إن وجدت) -->
      ${W&&W.length>0?`
        <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; margin-bottom: 14px; font-size: 11px;">
          <strong style="color: #1e3a8a; display: block; margin-bottom: 4px;">صورة منه إلى :-</strong>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; vertical-align: top;">
                <ul style="margin: 0; padding-right: 14px; list-style-type: square; color: #334155;">
                  ${A.map(x=>`<li>${x}</li>`).join("")}
                </ul>
              </td>
              <td style="width: 50%; vertical-align: top;">
                <ul style="margin: 0; padding-right: 14px; list-style-type: square; color: #334155;">
                  ${p.map(x=>`<li>${x}</li>`).join("")}
                </ul>
              </td>
            </tr>
          </table>
        </div>
      `:""}

      <!-- تذييل الصفحة الرسمي وبيانات الاتصال -->
      <div class="a4-letter-footer" style="margin-top: auto; border-top: 2px solid #000000; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #475569; font-weight: 700;">
        <div>المحرر: <strong style="color: #000000;">${M}</strong></div>
        <div>الطباعة: <strong style="color: #000000;">${S}</strong></div>
        <div>الهاتف: <strong style="color: #000000; direction: ltr; display: inline-block;">${H}</strong></div>
        <div>البريد: <strong style="color: #1e3a8a; direction: ltr; display: inline-block;">${G}</strong></div>
      </div>
    </div>
  `}function Ae({member:t,onClose:C,onEdit:P,onUpdatePhoto:R}){if(!t)return null;const j=t.rank||t.job_title||(t.type==="شرطي"?"شرطي":"موظف مدني"),b=t.financial_number||t.job_number||"---",$=t.job_status&&(t.job_status.includes("موقوف")||t.job_status.includes("إيقاف")),k=t.job_status&&t.job_status.includes("إجازة"),I=$?"موقوف مؤقتاً":k?"إجازة رسمية":"على رأس العمل",E=$?"#fee2e2":k?"#fef3c7":"#dcfce7",_=$?"#b91c1c":k?"#b45309":"#15803d",N=$?"🔴":k?"🟡":"🟢",[d,F]=a.useState("card"),[m,U]=a.useState(!1),[z,W]=a.useState(""),[M,S]=a.useState(!1),[c,s]=a.useState(""),[n,T]=a.useState(t.photo||""),[L,H]=a.useState("card"),[G,D]=a.useState(!1),[V,A]=a.useState(null),p=a.useRef(null),x=a.useMemo(()=>{let i=ue;try{const r=localStorage.getItem("ubari_penalties");if(r){const l=JSON.parse(r);Array.isArray(l)&&l.length>0&&(i=l)}}catch{}const o=te(t.name||""),f=String(t.national_id||"").trim(),B=String(t.military_number||"").trim(),u=String(t.financial_number||t.job_number||"").trim();return i.filter(r=>{const l=te(r.FullName||""),g=String(r.NationalNumber||"").trim(),y=String(r.MilitaryNumber||"").trim(),h=String(r.JobNumber||"").trim();return f&&g&&f===g||B&&y&&B===y||o&&l&&(o.includes(l)||l.includes(o))||u&&h&&u===h})},[t]),ae=i=>{const o=`
      <div style="width: 100%; max-width: 720px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a; padding: 20px; border: 2px solid #1e3a8a; border-radius: 12px; background: #ffffff;">
        <div style="height: 6px; width: 100%; display: flex; border-radius: 3px; overflow: hidden; margin-bottom: 14px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 16px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 14px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">قسم التفتيش والمتابعة والانضباط</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 80px;">
              <img src="${v}" alt="شعار الوزارة" style="width: 60px; height: 60px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Discipline & Sanctions Office</div>
            </td>
          </tr>
        </table>
        <div style="text-align: center; margin-bottom: 18px;">
          <h2 style="margin: 0; font-size: 17px; font-weight: 900; color: #b91c1c;">
            قرار جزاء تأديبي رقم (${i.DecisionNumber||i.decision_number||"2026/ق.ت/01"})
          </h2>
          <div style="font-size: 11px; color: #64748b; font-weight: 700; margin-top: 4px;">
            تاريخ الإجراء: ${i.PenaltyDate||i.penalty_date||"---"} | قيد المنظومة: MOI-UBR-DISC-${i.PenaltyID}
          </div>
        </div>
        <div style="line-height: 1.8; font-size: 12.5px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0;"><strong>بناءً على أحكام قانون هيئة الشرطة واللوائح الانضباطية المعمول بها في وزارة الداخلية:</strong></p>
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 4px 8px; color: #64748b; width: 25%;">اسم المنتسب المعاقب:</td>
                <td style="padding: 4px 8px; font-weight: 900; color: #0f172a;">${i.FullName||t.name}</td>
                <td style="padding: 4px 8px; color: #64748b; width: 25%;">الرقم الوطني:</td>
                <td style="padding: 4px 8px; font-weight: 800;">${i.NationalNumber||t.national_id||"---"}</td>
              </tr>
              <tr>
                <td style="padding: 4px 8px; color: #64748b;">الرقم المالي:</td>
                <td style="padding: 4px 8px; font-weight: 800; color: #0284c7;">${i.JobNumber||t.financial_number||t.job_number||"---"}</td>
                <td style="padding: 4px 8px; color: #64748b;">الرقم العسكري:</td>
                <td style="padding: 4px 8px; font-weight: 800;">${i.MilitaryNumber||t.military_number||"---"}</td>
              </tr>
            </table>
          </div>
          <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <div style="font-weight: 900; color: #991b1b; font-size: 13.5px; margin-bottom: 6px;">
              مادة (1): تقرر توقيع جزاء [ ${i.PenaltyType} ] ${i.DeductionDays>0?`بخصم (${i.DeductionDays}) أيام من المرتب الشهري`:""}.
            </div>
            <div style="font-size: 12px; color: #7f1d1d; font-weight: 700;">
              <strong>الموجبات والأسباب القانونية:</strong> ${i.Reason||"عدم الانضباط ومخالفة التعليمات"}
            </div>
          </div>
          <p style="margin: 0; font-size: 11.5px; color: #475569;">
            مادة (2): يودع هذا القرار بملف الخدمة للمنتسب وتخطر به الشؤون المالية لتنفيذ الاستقطاع، وتخطر جهة عمله للتنفيذ.
          </p>
        </div>
      </div>
    `;Q(o,`قرار جزاء - ${i.FullName||t.name}`)},pe=()=>{H("card");const i=`
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
                <img src="${v}" alt="شعار وزارة الداخلية" style="width: 42px; height: 42px; object-fit: contain;" />
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
                      <img src="${v}" alt="شعار الوزارة" style="width: 36px; height: 36px; object-fit: contain;" />
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
                ${n?`
                  <img src="${n}" alt="${t.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                `:`
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
                    ${t.name||"---"}
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;">
                  <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">الرتبة: </span>
                    <span style="font-size: 11px; font-weight: 900; color: #1e3a8a;">${j}</span>
                  </div>
                  <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">التصنيف: </span>
                    <span style="font-size: 10.5px; font-weight: 900; color: #0f172a;">${t.type||"كادر شرطة نظامي"}</span>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;">
                  <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">الرقم المالي: </span>
                    <span style="font-size: 11px; font-weight: 900; color: #0284c7; direction: ltr; display: inline-block;">${b}</span>
                  </div>
                  <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">الرقم الوطني: </span>
                    <span style="font-size: 10.5px; font-weight: 900; color: #0f172a; direction: ltr; display: inline-block;">${t.national_id||"---"}</span>
                  </div>
                </div>

                <div style="background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <span style="font-size: 7.5px; color: #64748b; font-weight: 700;">التبعية: </span>
                    <span style="font-size: 10px; font-weight: 800; color: #1e293b;">${t.department||"مديرية أمن أوباري"}</span>
                  </div>
                  <div style="text-align: left; padding-right: 6px; border-right: 1px solid #e2e8f0;">
                    <span style="font-size: 7px; color: #dc2626; font-weight: 800;">فصيلة الدم: </span>
                    <span style="font-size: 11px; font-weight: 900; color: #dc2626;">${t.blood_type||"O+"}</span>
                  </div>
                </div>
              </div>

              ${z?`
                <div style="width: 64px; height: 64px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img src="${z}" alt="QR" style="width: 54px; height: 54px;" />
                  <span style="font-size: 6px; color: #64748b; font-weight: 800;">رمز التحقق</span>
                </div>
              `:""}
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 3px; display: flex; align-items: center; justify-content: space-between; font-size: 8px; color: #475569; font-weight: 700;">
              <div>تاريخ الإصدار: 2024م • سارية حتى: 2029م</div>
              <div style="font-family: monospace; font-size: 9px; color: #1e3a8a; font-weight: 800;">*UBR-MOI-${b}*</div>
              <div></div>
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

          </div>
        </div>
      </div>
    `;Q(i,`بطاقة إثبات الهوية الأمنية - ${t.name||""}`)},xe=()=>{H("dossier");const i=`
      <div style="max-width: 760px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a;">
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 16px; font-weight: 900; color: #1e3a8a;">دولة ليبيــــا</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">وزارة الداخليـــــة</div>
              <div style="font-size: 12px; font-weight: 700; color: #334155;">مديرية أمن أوباري</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 80px;">
              <img src="${v}" alt="شعار وزارة الداخلية" style="width: 60px; height: 60px; object-fit: contain;" />
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
                ${n?`
                  <img src="${n}" alt="${t.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                `:`
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
                  <td style="padding: 3px; font-size: 14px; font-weight: 900; color: #0f172a;">${t.name}</td>
                  <td style="padding: 3px; color: #64748b;">الرتبة / الوظيفة:</td>
                  <td style="padding: 3px; font-weight: 800; color: #1e3a8a;">${j}</td>
                </tr>
                <tr>
                  <td style="padding: 3px; color: #64748b;">الرقم المالي:</td>
                  <td style="padding: 3px; font-weight: 900; color: #0284c7; font-family: monospace;">${b}</td>
                  <td style="padding: 3px; color: #64748b;">الرقم الوطني:</td>
                  <td style="padding: 3px; font-weight: 900; color: #0f172a; font-family: monospace;">${t.national_id||"---"}</td>
                </tr>
                <tr>
                  <td style="padding: 3px; color: #64748b;">جهة العمل:</td>
                  <td style="padding: 3px; font-weight: 800;">${t.department||"مديرية أمن أوباري"}</td>
                  <td style="padding: 3px; color: #64748b;">الوضع الوظيفي:</td>
                  <td style="padding: 3px; font-weight: 800; color: #16a34a;">${I}</td>
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
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.department||"مركز شرطة أوباري المدينة"}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">تاريخ المباشرة:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.start_date||"---"}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">قرار وتاريخ التعيين:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.appointment_decision||"---"} ${t.appointment_date?`(${t.appointment_date})`:""}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">قرار وتاريخ آخر ترقية:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.last_promotion_decision||"---"} ${t.last_promotion_date?`(${t.last_promotion_date})`:""}</td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px; margin-bottom: 8px;">
          <tr style="background: #0284c7; color: #ffffff;">
            <th colspan="4" style="padding: 5px 8px; text-align: right;">2. البيانات المالية والمصرفية</th>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">اسم المصرف والفرع:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.bank_name||"الصحاري"} - ${t.bank_branch||"فرع أوباري"}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">رقم الحساب المصرفي:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace;">${t.account_number||"---"}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">المرتب الأساسي:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800; color: #16a34a;">${t.basic_salary?`${t.basic_salary} د.ل`:"2,200 د.ل"}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">فصيلة الدم واللياقة:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.blood_type||"O+"} (${t.diseases||"سليم ولائق"})</td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px; margin-bottom: 14px;">
          <tr style="background: #475569; color: #ffffff;">
            <th colspan="4" style="padding: 5px 8px; text-align: right;">3. البيانات الشخصية والاجتماعية</th>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">اسم الأم:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.mother_name||"---"}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">تاريخ ومكان الميلاد:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.birth_date||"---"} (${t.birth_place||"أوباري"})</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">الحالة الاجتماعية:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.marital_status||"متزوج"} ${t.children_count?`(الأبناء: ${t.children_count})`:""}</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; color: #64748b;">رقم الهاتف والإقامة:</td>
            <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: 800;">${t.phone||"---"} - ${t.residence||"أوباري المدينة"}</td>
          </tr>
        </table>
      </div>
    `;Q(i,`الملف الوظيفي الشامل - ${t.name||""}`)},ce=()=>{const i=ke({reference:`MOI-UBR-SRV-${t.financial_number||t.job_number||t.id||"2026"}`,recordNumber:`${t.id||"1"}`,date:new Date().toLocaleDateString("ar-LY"),codeNo:`SRV-${t.national_id?t.national_id.slice(-4):"2026"}`,department:"قسم الشؤون الإدارية والمالية • وحدة شؤون الضباط والأفراد",recipientTitle:"إلى السادة / كافة الجهات الرسمية ذات العلاقة المحترمين",subject:`إفادة خدمة وإثبات صفة أمنية رسمية للمنتسب: ${t.name}`,greeting:"بعد التحية والتقدير والاحترام ،،،",bodyHtml:`
        <div style="font-size: 14.5px; line-height: 2.2; text-align: justify; color: #000000;">
          <p style="margin-bottom: 14px;">
            تشهد <strong>مديرية أمن أوباري بوزارة الداخلية</strong> بأن السيد المذكورة بياناته الرسمية بالجدول أدناه:
          </p>
          <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 13px; margin-bottom: 16px;">
            <tr style="background: #f8fafc;">
              <td style="padding: 9px 12px; border: 1px solid #000000; width: 25%; font-weight: 800; color: #475569;">الاسم الرباعي:</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 900; color: #0f172a; font-size: 14px;" colspan="3">${t.name}</td>
            </tr>
            <tr>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 800; color: #475569;">الرتبة والصفة:</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 900; color: #1e3a8a;">${t.rank||t.job_title||"عضو هيئة شرطة"}</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 800; color: #475569; width: 25%;">الرقم المالي:</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 900; font-family: monospace; color: #0284c7;">${t.financial_number||t.job_number||"---"}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 800; color: #475569;">الرقم الوطني:</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 900; font-family: monospace;">${t.national_id||"---"}</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 800; color: #475569;">جهة العمل والتبعية:</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 900; color: #1e3a8a;">${t.department||"مديرية أمن أوباري"}</td>
            </tr>
            <tr>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 800; color: #475569;">الحالة الوظيفية:</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 900; color: #16a34a;">${t.job_status||"على رأس العمل"}</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 800; color: #475569;">تاريخ التعيين والمباشرة:</td>
              <td style="padding: 9px 12px; border: 1px solid #000000; font-weight: 800;">${t.appointment_date||t.start_date||"مسجل بالقوة الرسمية"}</td>
            </tr>
          </table>
          <p style="margin-bottom: 12px;">
            هو أحد منتسبي هيئة الشرطة التابعين لملاك مديرية أمن أوباري، وهو مستمر في أداء مهامه وواجباته الوظيفية والأمنية حتى تاريخه دون أي انقطاع.
          </p>
          <p style="margin-bottom: 0;">
            وقد أعطيت له هذه الإفادة الرسمية المعتمدة بناءً على طلبه لتقديمها إلى من يلزم من الجهات الرسمية ذات العلاقة، دون أدنى مسؤولية أو التزام مالي على عاتق وزارة الداخلية ومديرية أمن أوباري تجاه حقوق الغير.
          </p>
        </div>
      `,showStamp:!1,showSignature:!1});Q(i,`إفادة خدمة رسمية - ${t.name}`)};a.useEffect(()=>{const i=()=>{document.body.classList.remove("moi-printing-active")};return window.addEventListener("afterprint",i),()=>{window.removeEventListener("afterprint",i),document.body.classList.remove("moi-printing-active")}},[]),a.useEffect(()=>{const i=t.photo||localStorage.getItem(`ubari_officer_photo_${t.id}`)||"";T(i)},[t]),a.useEffect(()=>{const i=t.rank||t.job_title||(t.type==="شرطي"?"شرطي":"موظف مدني"),o=["دولة ليبيا - وزارة الداخلية","مديرية أمن أوباري | السجل الأمني الموحد",`الاسم: ${t.name||"---"}`,`الرتبة/الوظيفة: ${i}`,`الرقم المالي: ${t.financial_number||t.job_number||"---"}`,`الرقم الوطني: ${t.national_id||"---"}`,`التبعية: ${t.department||"مديرية أمن أوباري"}`,`الوضع الوظيفي: ${t.job_status||"على رأس العمل"}`,`الرقم المرجعي: UBR-MOI-${t.id||"2211"}`,"الحالة: بطاقة رسمية معتمدة وسارية المفعول"].join(`
`);he.toDataURL(o,{width:140,margin:1,color:{dark:"#0f172a",light:"#ffffff"},errorCorrectionLevel:"M"}).then(f=>W(f)).catch(f=>console.error("QR code generation error:",f))},[t]);const K=i=>{if(!i)return;if(!(i.type&&i.type.startsWith("image/")||/\.(jpe?g|png|webp|jfif|bmp|gif|heic|avif|tiff?)$/i.test(i.name||""))){alert("يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)"),p.current&&(p.current.value="");return}S(!0),s("جاري قراءة وضبط أبعاد الصورة...");const f=new FileReader;f.onloadend=()=>{p.current&&(p.current.value="")},f.onerror=()=>{S(!1),s("❌ تعذر قراءة ملف الصورة، يرجى المحاولة مرة أخرى"),setTimeout(()=>s(""),4e3)},f.onabort=()=>{S(!1),s("❌ تم إلغاء عملية رفع الصورة"),setTimeout(()=>s(""),4e3)},f.onload=B=>{const u=B.target?.result;if(!u){S(!1),s("❌ لم يتم استلام بيانات الصورة"),setTimeout(()=>s(""),4e3);return}T(u);const r=g=>{if(T(g),R)try{R(t.id,g)}catch(y){console.error("Error in onUpdatePhoto callback:",y)}S(!1),s("✅ تم حفظ وتحديث صورة المنتسب بنجاح"),setTimeout(()=>s(""),4e3)},l=new Image;l.onload=()=>{try{const g=document.createElement("canvas"),y=400;let h=l.naturalWidth||l.width,w=l.naturalHeight||l.height;if(!h||!w){r(u);return}h>w?h>y&&(w=Math.round(w*y/h),h=y):w>y&&(h=Math.round(h*y/w),w=y),g.width=h,g.height=w;const Y=g.getContext("2d");if(Y){Y.imageSmoothingEnabled=!0,Y.imageSmoothingQuality="high",Y.drawImage(l,0,0,h,w);const ge=g.toDataURL("image/jpeg",.85);r(ge)}else r(u)}catch(g){console.warn("Canvas compression error, using raw image:",g),r(u)}},l.onerror=()=>{r(u)},l.src=u};try{f.readAsDataURL(i)}catch(B){console.error("Error starting FileReader:",B),S(!1),s("❌ حدث خطأ أثناء تشغيل قارئ الملفات"),setTimeout(()=>s(""),4e3)}},fe=i=>{const o=i.target.files?.[0];o&&K(o)},ee=()=>{confirm(`هل أنت متأكد من رغبتك في إزالة صورة المنتسب (${t.name})؟`)&&(T(""),R&&R(t.id,""),s("تم إزالة الصورة الشخصية والعودة للشعار الرسمي"),setTimeout(()=>s(""),3500))};return e.jsxs("div",{className:"moi-modal-overlay",onClick:i=>{i.target===i.currentTarget&&C()},style:{zIndex:10500},children:[e.jsx("style",{children:`
        @keyframes moiSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}),e.jsxs("div",{className:"moi-modal-box moi-officer-modal-container",style:{maxWidth:"920px",width:"95%",background:"#ffffff",border:"1.5px solid #cbd5e1",borderRadius:"16px",boxShadow:"0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 25px rgba(212, 175, 55, 0.15)",overflow:"hidden",display:"flex",flexDirection:"column",maxHeight:"92vh",color:"#0f172a"},onClick:i=>i.stopPropagation(),children:[e.jsx("input",{type:"file",ref:p,accept:"image/*,.jpg,.jpeg,.png,.webp,.jfif,.bmp",style:{display:"none"},onChange:fe,onClick:i=>{i.stopPropagation(),i.target.value=""}}),e.jsxs("div",{style:{background:"linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",padding:"16px 24px",borderBottom:"2px solid #1e3a8a",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative"},children:[e.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,height:"3.5px",background:"linear-gradient(90deg, #1e3a8a 0%, #d4af37 50%, #1e3a8a 100%)"}}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"14px"},children:[e.jsx("div",{style:{width:"46px",height:"46px",borderRadius:"12px",background:"linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",color:"#d4af37",boxShadow:"0 3px 10px rgba(30, 58, 138, 0.25)",border:"1.5px solid #d4af37",flexShrink:0},children:e.jsx(X,{size:26})}),e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("h3",{style:{margin:0,fontSize:"18px",fontWeight:900,color:"#0f172a",letterSpacing:"0.2px"},children:"بطاقة الهوية الأمنية والملف الوظيفي الموحد"}),e.jsx("span",{style:{background:"#f0fdf4",border:"1px solid #86efac",color:"#166534",padding:"2px 8px",borderRadius:"6px",fontSize:"11px",fontWeight:800},children:"✓ معتمدة رسميـاً"})]}),e.jsx("p",{style:{margin:"3px 0 0 0",fontSize:"12px",color:"#64748b",fontWeight:600},children:"وزارة الداخلية • مديرية أمن أوباري • السجل المركزي للقوة العمومية"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[e.jsxs("div",{style:{display:"flex",background:"#f1f5f9",padding:"4px",borderRadius:"10px",border:"1px solid #cbd5e1"},children:[e.jsxs("button",{type:"button",onClick:()=>F("card"),style:{background:d==="card"?"linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)":"transparent",color:d==="card"?"#ffffff":"#334155",border:"none",padding:"6px 14px",borderRadius:"7px",fontSize:"12.5px",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",boxShadow:d==="card"?"0 2px 6px rgba(37,99,235,0.3)":"none",transition:"all 0.2s"},children:[e.jsx(oe,{size:14}),e.jsx("span",{children:"الهوية الذكية"})]}),e.jsxs("button",{type:"button",onClick:()=>F("dossier"),style:{background:d==="dossier"?"linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)":"transparent",color:d==="dossier"?"#ffffff":"#334155",border:"none",padding:"6px 14px",borderRadius:"7px",fontSize:"12.5px",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",boxShadow:d==="dossier"?"0 2px 6px rgba(37,99,235,0.3)":"none",transition:"all 0.2s"},children:[e.jsx(O,{size:14}),e.jsx("span",{children:"الملف والسجل الشامل"}),(t.self_updated||t.self_updated_at||t.phone||t.mother_name)&&e.jsx("span",{style:{background:d==="dossier"?"#22c55e":"#dcfce7",color:d==="dossier"?"#ffffff":"#15803d",padding:"1px 6px",borderRadius:"10px",fontSize:"9.5px",fontWeight:900},children:"محدث"})]}),e.jsxs("button",{type:"button",onClick:()=>F("penalties"),style:{background:d==="penalties"?"linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)":"transparent",color:d==="penalties"?"#ffffff":"#334155",border:"none",padding:"6px 14px",borderRadius:"7px",fontSize:"12.5px",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",boxShadow:d==="penalties"?"0 2px 6px rgba(220,38,38,0.3)":"none",transition:"all 0.2s"},children:[e.jsx(de,{size:14}),e.jsx("span",{children:"سجل الانضباط"}),x.length>0&&e.jsxs("span",{style:{background:d==="penalties"?"#ffffff":"#fee2e2",color:d==="penalties"?"#b91c1c":"#991b1b",padding:"1px 6px",borderRadius:"10px",fontSize:"9.5px",fontWeight:900},children:[x.length," جزاء"]})]})]}),e.jsx("button",{type:"button",className:"moi-modal-close-btn",onClick:C,style:{background:"#f8fafc",border:"1px solid #cbd5e1",borderRadius:"8px",width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",color:"#475569",cursor:"pointer",transition:"all 0.15s"},title:"إغلاق",children:e.jsx(ne,{size:18})})]})]}),c&&e.jsxs("div",{style:{background:c.includes("❌")?"#fef2f2":c.includes("جاري")?"#eff6ff":"#f0fdf4",color:c.includes("❌")?"#991b1b":c.includes("جاري")?"#1e40af":"#166534",padding:"10px 20px",fontSize:"12.5px",fontWeight:800,display:"flex",alignItems:"center",gap:"8px",borderBottom:`1px solid ${c.includes("❌")?"#fca5a5":c.includes("جاري")?"#bfdbfe":"#86efac"}`},children:[c.includes("❌")?e.jsx(ne,{size:16,color:"#dc2626"}):c.includes("جاري")?e.jsx("div",{style:{width:"14px",height:"14px",border:"2px solid #93c5fd",borderTopColor:"#1d4ed8",borderRadius:"50%",animation:"moiSpin 0.8s linear infinite"}}):e.jsx(le,{size:16,color:"#16a34a"}),e.jsx("span",{children:c})]}),e.jsx("div",{className:"moi-modal-body",style:{padding:"24px",overflowY:"auto",background:"#f8fafc",flex:1},children:d==="card"?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"20px"},children:[e.jsx("div",{style:{width:"100%",maxWidth:"650px",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsxs("button",{type:"button",onClick:()=>U(!m),style:{background:"#ffffff",color:"#1e3a8a",border:"1.5px solid #bfdbfe",padding:"7px 20px",borderRadius:"8px",fontSize:"12.5px",fontWeight:800,display:"flex",alignItems:"center",gap:"6px",cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"},children:[e.jsx(se,{size:15,color:"#2563eb"}),e.jsx("span",{children:m?"عرض الوجه الأمامي للبطاقة":"عرض الوجه الخلفي (التعليمات وحمل السلاح)"})]})}),e.jsx("div",{className:"moi-card-3d-wrapper",style:{perspective:"1200px",width:"100%",maxWidth:"650px",minHeight:"390px"},children:e.jsxs("div",{style:{position:"relative",width:"100%",minHeight:"390px",transition:"transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",transformStyle:"preserve-3d",transform:m?"rotateY(180deg)":"rotateY(0deg)"},children:[e.jsxs("div",{id:"moi-printable-card-front",style:{position:m?"absolute":"relative",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",background:"#ffffff",border:"2px solid #cbd5e1",borderRadius:"16px",padding:"20px 22px",boxShadow:"0 15px 35px rgba(15, 23, 42, 0.12), inset 0 0 0 1px rgba(212, 175, 55, 0.35)",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"space-between",color:"#0f172a"},children:[e.jsx("div",{style:{position:"absolute",right:"50%",top:"50%",transform:"translate(50%, -50%)",width:"260px",height:"260px",backgroundImage:`url("${v}")`,backgroundSize:"contain",backgroundRepeat:"no-repeat",backgroundPosition:"center",opacity:.05,pointerEvents:"none"}}),e.jsxs("div",{children:[e.jsx("div",{style:{height:"4px",borderRadius:"2px",background:"linear-gradient(90deg, #dc2626 0%, #dc2626 33.3%, #000000 33.3%, #000000 66.6%, #16a34a 66.6%, #16a34a 100%)",marginBottom:"10px"}}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1.5px solid #e2e8f0",paddingBottom:"10px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[e.jsx("img",{src:v,alt:"شعار وزارة الداخلية",style:{width:"48px",height:"48px",objectFit:"contain",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.15))"},onError:i=>{i.currentTarget.style.display="none"}}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"13px",fontWeight:900,color:"#1e3a8a",letterSpacing:"0.3px"},children:"دولة ليبيا • وزارة الداخلية"}),e.jsx("div",{style:{fontSize:"15px",fontWeight:900,color:"#0f172a"},children:"مديرية أمن أوباري"}),e.jsx("div",{style:{fontSize:"10px",color:"#64748b",fontWeight:700},children:"UBARI SECURITY DIRECTORATE"})]})]}),e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("div",{style:{background:"#eff6ff",border:"1.5px solid #1e3a8a",padding:"4px 14px",borderRadius:"20px",fontSize:"11px",fontWeight:900,color:"#1e3a8a",boxShadow:"0 1px 3px rgba(30,58,138,0.1)",letterSpacing:"0.3px"},children:"بطاقة إثبات هوية أمنية"}),e.jsx("div",{style:{fontSize:"9px",color:"#64748b",marginTop:"3px",fontWeight:700},children:"OFFICIAL POLICE IDENTIFICATION"})]}),e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:e.jsxs("div",{title:"شريحة الهوية الذكية المشفرة",style:{width:"36px",height:"28px",borderRadius:"6px",background:"linear-gradient(135deg, #fef08a 0%, #eab308 40%, #ca8a04 100%)",border:"1px solid #b45309",boxShadow:"inset 0 0 2px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"2px"},children:[e.jsx("div",{style:{width:"80%",height:"1px",background:"rgba(0,0,0,0.35)",margin:"2px 0"}}),e.jsx("div",{style:{width:"80%",height:"1px",background:"rgba(0,0,0,0.35)",margin:"2px 0"}})]})})]})]}),e.jsxs("div",{style:{display:"flex",gap:"20px",alignItems:"center",margin:"14px 0"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",flexShrink:0},children:[e.jsxs("div",{onClick:i=>{i.stopPropagation(),p.current&&(p.current.value="",p.current.click())},onDragOver:i=>{i.preventDefault(),i.stopPropagation()},onDrop:i=>{i.preventDefault(),i.stopPropagation();const o=i.dataTransfer?.files?.[0];o&&K(o)},style:{position:"relative",width:"115px",height:"145px",borderRadius:"12px",border:"2.5px solid #1e3a8a",overflow:"hidden",background:"#f8fafc",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer"},title:"اضغط هنا لاختيار صورة، أو اسحب وأفلت ملف الصورة هنا مباشرة",children:[n?e.jsx("img",{src:n,alt:t.name,style:{width:"100%",height:"100%",objectFit:"cover"}}):e.jsxs("div",{style:{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",color:"#1e3a8a",position:"relative"},children:[e.jsx(J,{size:46,strokeWidth:1.5,color:"#1e3a8a"}),e.jsx("span",{style:{fontSize:"10px",color:"#1e3a8a",marginTop:"6px",fontWeight:800},children:t.type==="شرطي"?"صورة عسكرية":"صورة مدنية"}),e.jsxs("div",{style:{position:"absolute",bottom:0,left:0,right:0,background:"rgba(30,58,138,0.9)",padding:"4px 0",fontSize:"9px",color:"#ffffff",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:"3px",fontWeight:700},children:[e.jsx(q,{size:10}),e.jsx("span",{children:"رفع صورة"})]})]}),n&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.88) 100%)",padding:"6px 0 4px 0",textAlign:"center",color:"#ffffff",fontSize:"10.5px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"},children:[e.jsx(q,{size:12,color:"#fef3c7"}),e.jsx("span",{children:"تغيير الصورة"})]}),e.jsx("button",{type:"button",onClick:i=>{i.stopPropagation(),ee()},style:{position:"absolute",top:"6px",left:"6px",width:"22px",height:"22px",borderRadius:"50%",background:"rgba(239, 68, 68, 0.9)",border:"none",color:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 4px rgba(0,0,0,0.3)",zIndex:4},title:"إزالة الصورة",children:e.jsx(re,{size:11})})]}),M&&e.jsxs("div",{style:{position:"absolute",inset:0,background:"rgba(30, 58, 138, 0.82)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#ffffff",fontSize:"11px",fontWeight:800,gap:"8px",zIndex:10},children:[e.jsx("div",{style:{width:"26px",height:"26px",border:"3px solid rgba(255,255,255,0.35)",borderTopColor:"#ffffff",borderRadius:"50%",animation:"moiSpin 0.8s linear infinite"}}),e.jsx("span",{children:"جاري الحفظ..."})]})]}),e.jsxs("div",{style:{background:E,color:_,fontSize:"11px",fontWeight:800,padding:"3px 10px",borderRadius:"20px",border:`1px solid ${_}`,display:"flex",alignItems:"center",gap:"5px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"},children:[e.jsx("span",{children:N}),e.jsx("span",{children:I})]})]}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{marginBottom:"8px"},children:[e.jsx("div",{style:{fontSize:"10px",color:"#64748b",fontWeight:700},children:"الاسم الرباعي واللقب:"}),e.jsx("div",{style:{fontSize:"17px",fontWeight:900,color:"#0f172a",lineHeight:1.3},children:t.name||"---"})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:"8px",marginBottom:"8px"},children:[e.jsxs("div",{style:{background:"#f8fafc",padding:"5px 8px",borderRadius:"6px",border:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"9.5px",color:"#64748b",fontWeight:700},children:"الرتبة / الوظيفة:"}),e.jsx("div",{style:{fontSize:"13px",fontWeight:900,color:"#1e3a8a"},children:j})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"5px 8px",borderRadius:"6px",border:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"9.5px",color:"#64748b",fontWeight:700},children:"التصنيف:"}),e.jsx("div",{style:{fontSize:"13px",fontWeight:800,color:t.type==="شرطي"?"#1e40af":"#7c3aed"},children:t.type==="شرطي"?"كادر شرطة نظامي":"كادر مدني تخصصي"})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"},children:[e.jsxs("div",{style:{background:"#f8fafc",padding:"5px 8px",borderRadius:"6px",border:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"9.5px",color:"#64748b",fontWeight:700},children:"الرقم المالي / الوظيفي:"}),e.jsx("div",{style:{fontSize:"13.5px",fontWeight:900,color:"#0284c7",direction:"ltr",textAlign:"right",fontFamily:"monospace"},children:b})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"5px 8px",borderRadius:"6px",border:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"9.5px",color:"#64748b",fontWeight:700},children:"الرقم الوطني:"}),e.jsx("div",{style:{fontSize:"13px",fontWeight:900,color:"#0f172a",direction:"ltr",textAlign:"right",fontFamily:"monospace"},children:t.national_id||"---"})]})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"5px 8px",borderRadius:"6px",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"9.5px",color:"#64748b",fontWeight:700},children:"جهة العمل والتبعية:"}),e.jsx("div",{style:{fontSize:"12px",fontWeight:800,color:"#1e293b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:t.department||"مديرية أمن أوباري"})]}),e.jsxs("div",{style:{textAlign:"left",paddingRight:"8px",borderRight:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"9px",color:"#dc2626",fontWeight:800},children:"فصيلة الدم"}),e.jsx("div",{style:{fontSize:"13px",fontWeight:900,color:"#dc2626"},children:t.blood_type||"O+"})]})]})]}),z&&e.jsxs("div",{style:{background:"#ffffff",padding:"6px",borderRadius:"10px",border:"1.5px solid #1e3a8a",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0},title:"امسح الرمز للتحقق الرقمي الفوري من القيد الأمني",children:[e.jsx("img",{src:z,alt:"QR Verification",style:{width:"74px",height:"74px",display:"block"}}),e.jsx("span",{style:{fontSize:"8px",color:"#1e3a8a",fontWeight:900,marginTop:"2px"},children:"مسح للتحقق"})]})]}),e.jsxs("div",{style:{borderTop:"1px dashed #cbd5e1",paddingTop:"8px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"10.5px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsxs("span",{style:{color:"#64748b"},children:["تاريخ الإصدار: ",e.jsx("strong",{children:"2024م"})]}),e.jsx("span",{style:{color:"#1e3a8a"},children:"•"}),e.jsxs("span",{style:{color:"#64748b"},children:["سارية حتى: ",e.jsx("strong",{children:"2029م"})]})]}),e.jsxs("div",{style:{fontFamily:"monospace",fontSize:"11px",letterSpacing:"1.5px",color:"#1e3a8a",fontWeight:800},children:["*UBR-MOI-",t.financial_number||t.id||"2211","*"]}),e.jsx("div",{style:{textAlign:"left",color:"#0f172a",fontWeight:800}})]})]}),e.jsxs("div",{id:"moi-printable-card-back",style:{position:m?"relative":"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)",background:"#ffffff",border:"2px solid #cbd5e1",borderRadius:"16px",padding:"20px 24px",boxShadow:"0 15px 35px rgba(15, 23, 42, 0.12), inset 0 0 0 1px rgba(212, 175, 55, 0.35)",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"space-between",color:"#0f172a"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1.5px solid #e2e8f0",paddingBottom:"8px"},children:[e.jsx("div",{style:{fontSize:"12px",fontWeight:900,color:"#1e3a8a"},children:"تعليمات أمنية وإذن حمل السلاح الفردي"}),e.jsx("div",{style:{fontSize:"10px",color:"#64748b",fontWeight:700},children:"SECURITY INSTRUCTIONS & FIREARM PERMIT"})]}),e.jsxs("div",{style:{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"8px",padding:"12px",margin:"12px 0",fontSize:"11px",lineHeight:1.65,color:"#334155",textAlign:"justify"},children:[e.jsx("p",{style:{margin:"0 0 6px 0",fontWeight:800,color:"#1e3a8a"},children:"⚖️ تصريح وإشعار سيادي رسمي:"}),"بموجب أحكام القانون رقم (10) لسنة 1992م بشأن هيئة الشرطة وتعديلاته والتشريعات النافذة بدولة ليبيا، يُصرح لحامل هذه الهوية الأمنية بممارسة مهام الضبط القضائي وحمل السلاح الناري الفردي المخصص له رسمياً لأداء الواجب وتأمين الاستقرار. على كافة الأجهزة الأمنية والعسكرية والمدنية تقديم المساعدة اللازمة والتسهيلات المستوجبة لحاملها عند الطلب."]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",fontSize:"11px",marginTop:"6px"},children:[e.jsxs("div",{style:{background:"#f8fafc",padding:"8px 10px",borderRadius:"6px",border:"1px solid #e2e8f0"},children:[e.jsx("span",{style:{color:"#64748b"},children:"مكان السكن والإقامة: "}),e.jsx("strong",{style:{color:"#0f172a"},children:t.residence||"أوباري"})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"8px 10px",borderRadius:"6px",border:"1px solid #e2e8f0"},children:[e.jsx("span",{style:{color:"#64748b"},children:"هاتف الاتصال: "}),e.jsx("strong",{style:{color:"#0284c7",direction:"ltr",display:"inline-block"},children:t.phone||"غير مسجل"})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"8px 10px",borderRadius:"6px",border:"1px solid #e2e8f0"},children:[e.jsx("span",{style:{color:"#64748b"},children:"اسم الأم: "}),e.jsx("strong",{style:{color:"#0f172a"},children:t.mother_name||"غير مسجل"})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"8px 10px",borderRadius:"6px",border:"1px solid #e2e8f0"},children:[e.jsx("span",{style:{color:"#64748b"},children:"المصرف والحساب: "}),e.jsx("strong",{style:{color:"#0f172a"},children:t.bank_name?`${t.bank_name} (${t.account_number||""})`:"الصحاري"})]})]})]}),e.jsxs("div",{style:{borderTop:"1px solid #e2e8f0",paddingTop:"10px",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{style:{fontSize:"10px",color:"#64748b"},children:[e.jsx("div",{children:"في حال العثور عليها تُسلّم لأقرب مركز شرطة"}),e.jsx("div",{style:{color:"#1e3a8a",fontWeight:800},children:"غرفة عمليات مديرية أمن أوباري: 0773620000"})]}),e.jsxs("div",{style:{width:"68px",height:"68px",borderRadius:"50%",border:"2px dashed #1e3a8a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#1e3a8a",transform:"rotate(-8deg)",background:"rgba(30, 58, 138, 0.04)"},children:[e.jsx(J,{size:18,color:"#1e3a8a"}),e.jsxs("span",{style:{fontSize:"7.5px",fontWeight:900,textAlign:"center",lineHeight:1.1,marginTop:"2px"},children:["مديرية أمن",e.jsx("br",{}),"أوباري"]})]})]})]})]})}),e.jsxs("div",{style:{display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center"},children:[e.jsxs("button",{type:"button",onClick:()=>U(!m),style:{padding:"8px 16px",borderRadius:"8px",background:"#ffffff",color:"#334155",border:"1.5px solid #cbd5e1",fontWeight:700,fontSize:"12px",display:"flex",alignItems:"center",gap:"6px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"},children:[e.jsx(se,{size:14}),e.jsxs("span",{children:["قلب البطاقة (",m?"الوجه الأمامي":"الوجه الخلفي",")"]})]}),e.jsxs("button",{type:"button",onClick:pe,style:{padding:"8px 18px",borderRadius:"8px",background:"linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",color:"#ffffff",border:"none",fontWeight:800,fontSize:"12px",display:"flex",alignItems:"center",gap:"6px",cursor:"pointer",boxShadow:"0 2px 8px rgba(2,132,199,0.3)"},children:[e.jsx(Z,{size:15}),e.jsx("span",{children:"طباعة بطاقة الهوية (PVC / بطاقة بلاستيكية)"})]})]})]}):d==="dossier"?e.jsxs("div",{children:[e.jsxs("div",{style:{background:"#ffffff",border:"1.5px solid #bfdbfe",borderRadius:"14px",padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px",marginBottom:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",flexWrap:"wrap"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"18px"},children:[e.jsxs("div",{onClick:i=>{i.stopPropagation(),p.current&&(p.current.value="",p.current.click())},onDragOver:i=>{i.preventDefault(),i.stopPropagation()},onDrop:i=>{i.preventDefault(),i.stopPropagation();const o=i.dataTransfer?.files?.[0];o&&K(o)},style:{width:"92px",height:"116px",borderRadius:"12px",border:n?"2px solid #1e3a8a":"2px dashed #1e3a8a",background:n?"#f8fafc":"#eff6ff",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 12px rgba(30, 58, 138, 0.1)",flexShrink:0,position:"relative",transition:"all 0.2s ease"},title:"انقر هنا لاختيار صورة، أو اسحب وأفلت ملف الصورة هنا مباشرة",children:[n?e.jsxs(e.Fragment,{children:[e.jsx("img",{src:n,alt:t.name,style:{width:"100%",height:"100%",objectFit:"cover"}}),e.jsxs("div",{style:{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.88) 100%)",padding:"6px 0 4px 0",textAlign:"center",color:"#ffffff",fontSize:"10.5px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:"3px"},children:[e.jsx(q,{size:11,color:"#fef3c7"}),e.jsx("span",{children:"تغيير"})]}),e.jsx("button",{type:"button",onClick:i=>{i.stopPropagation(),ee()},style:{position:"absolute",top:"5px",left:"5px",width:"20px",height:"20px",borderRadius:"50%",background:"rgba(239, 68, 68, 0.9)",border:"none",color:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.3)",zIndex:4},title:"إزالة الصورة",children:e.jsx(re,{size:10})})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px",textAlign:"center"},children:[e.jsx("div",{style:{width:"36px",height:"36px",borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",color:"#1e3a8a",marginBottom:"6px"},children:e.jsx(q,{size:18})}),e.jsx("span",{style:{fontSize:"11px",fontWeight:800,color:"#1e3a8a",lineHeight:1.2},children:"رفع صورة"}),e.jsx("span",{style:{fontSize:"9px",color:"#64748b",marginTop:"2px"},children:"انقر هنا"})]}),M&&e.jsxs("div",{style:{position:"absolute",inset:0,background:"rgba(30, 58, 138, 0.82)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#ffffff",fontSize:"11px",fontWeight:800,gap:"6px",zIndex:10},children:[e.jsx("div",{style:{width:"22px",height:"22px",border:"3px solid rgba(255,255,255,0.35)",borderTopColor:"#ffffff",borderRadius:"50%",animation:"moiSpin 0.8s linear infinite"}}),e.jsx("span",{children:"جاري الحفظ..."})]})]}),e.jsxs("div",{children:[e.jsx("h2",{style:{margin:"0 0 6px 0",fontSize:"20px",fontWeight:900,color:"#0f172a"},children:t.name||"---"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:[e.jsx("span",{style:{background:"#1e3a8a",color:"#ffffff",padding:"3px 10px",borderRadius:"6px",fontWeight:800,fontSize:"12px"},children:j}),e.jsx("span",{style:{background:t.type==="شرطي"?"#dbeafe":"#f1f5f9",color:t.type==="شرطي"?"#1e40af":"#475569",padding:"3px 10px",borderRadius:"6px",fontWeight:700,fontSize:"12px"},children:t.type||"شرطي"}),e.jsxs("span",{style:{background:E,color:_,padding:"3px 10px",borderRadius:"6px",fontWeight:800,fontSize:"12px",border:`1px solid ${_}`},children:[N," ",I]})]})]})]}),e.jsxs("div",{style:{textAlign:"left",minWidth:"130px"},children:[e.jsx("div",{style:{fontSize:"11px",color:"#64748b",fontWeight:700},children:"الرقم المالي / الوظيفي"}),e.jsx("div",{style:{fontSize:"19px",fontWeight:900,color:"#0284c7",direction:"ltr",textAlign:"left",fontFamily:"monospace"},children:b})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",gap:"16px",marginBottom:"16px"},children:[e.jsxs("div",{style:{background:"#ffffff",border:"1px solid #e2e8f0",borderRadius:"12px",padding:"16px",boxShadow:"0 2px 6px rgba(0,0,0,0.03)"},children:[e.jsxs("div",{style:{fontSize:"13px",fontWeight:800,color:"#1e3a8a",marginBottom:"12px",display:"flex",alignItems:"center",gap:"6px",borderBottom:"1px solid #f1f5f9",paddingBottom:"8px"},children:[e.jsx(je,{size:16,color:"#1e3a8a"}),e.jsx("span",{children:"البيانات الوظيفية والتبعية"})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"9px",fontSize:"12.5px"},children:[e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"جهة العمل / المركز: "}),e.jsx("strong",{style:{color:"#0f172a"},children:t.department||"مركز شرطة أوباري المدينة"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"الرقم الوطني: "}),e.jsx("strong",{style:{color:"#0284c7",direction:"ltr",display:"inline-block"},children:t.national_id||"غير مسجل"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"المسمى الوظيفي: "}),e.jsx("span",{style:{color:"#1e293b"},children:j})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"تاريخ المباشرة: "}),e.jsx("span",{style:{color:"#1e293b"},children:t.start_date||"---"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"قرار وتاريخ التعيين: "}),e.jsxs("span",{style:{color:"#1e293b"},children:[t.appointment_decision||"---"," ",t.appointment_date?`(${t.appointment_date})`:""]})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"قرار وتاريخ آخر ترقية: "}),e.jsxs("span",{style:{color:"#1e293b"},children:[t.last_promotion_decision||"---"," ",t.last_promotion_date?`(${t.last_promotion_date})`:""]})]})]})]}),e.jsxs("div",{style:{background:"#ffffff",border:"1px solid #e2e8f0",borderRadius:"12px",padding:"16px",boxShadow:"0 2px 6px rgba(0,0,0,0.03)"},children:[e.jsxs("div",{style:{fontSize:"13px",fontWeight:800,color:"#0284c7",marginBottom:"12px",display:"flex",alignItems:"center",gap:"6px",borderBottom:"1px solid #f1f5f9",paddingBottom:"8px"},children:[e.jsx(me,{size:16}),e.jsx("span",{children:"البيانات المالية والمصرفية"})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"9px",fontSize:"12.5px"},children:[e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"اسم المصرف: "}),e.jsx("strong",{style:{color:"#0f172a"},children:t.bank_name||"الصحاري بنت بيه"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"فرع المصرف: "}),e.jsx("span",{style:{color:"#1e293b"},children:t.bank_branch||"فرع أوباري"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"رقم الحساب المصرفي: "}),e.jsx("strong",{style:{color:"#1e40af",direction:"ltr",display:"inline-block"},children:t.account_number||"---"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"المرتب الأساسي: "}),e.jsx("strong",{style:{color:"#16a34a"},children:t.basic_salary?`${t.basic_salary} د.ل`:"2,200 د.ل"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"فصيلة الدم: "}),e.jsx("strong",{style:{color:"#dc2626"},children:t.blood_type||"O+"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"اللياقة الصحية: "}),e.jsx("span",{style:{color:"#1e293b"},children:t.diseases||"سليم ولائق صحياً"})]})]})]}),e.jsxs("div",{style:{background:"#ffffff",border:"1px solid #e2e8f0",borderRadius:"12px",padding:"16px",boxShadow:"0 2px 6px rgba(0,0,0,0.03)"},children:[e.jsxs("div",{style:{fontSize:"13px",fontWeight:800,color:"#7c3aed",marginBottom:"12px",display:"flex",alignItems:"center",gap:"6px",borderBottom:"1px solid #f1f5f9",paddingBottom:"8px"},children:[e.jsx(we,{size:16}),e.jsx("span",{children:"البيانات الشخصية والاجتماعية"})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"9px",fontSize:"12.5px"},children:[e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"اسم الأم: "}),e.jsx("span",{style:{color:"#1e293b"},children:t.mother_name||"---"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"تاريخ ومكان الميلاد: "}),e.jsxs("span",{style:{color:"#1e293b"},children:[t.birth_date||"---"," (",t.birth_place||"أوباري",")"]})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"الحالة الاجتماعية: "}),e.jsxs("span",{style:{color:"#1e293b"},children:[t.marital_status||"متزوج"," ",t.children_count?`(الأبناء: ${t.children_count})`:""]})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"القبيلة / المدينة: "}),e.jsx("span",{style:{color:"#1e293b"},children:t.tribe_city||"أوباري"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"عنوان السكن: "}),e.jsx("span",{style:{color:"#1e293b"},children:t.residence||"أوباري المدينة"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"رقم الهاتف: "}),e.jsx("strong",{style:{color:"#0284c7",direction:"ltr",display:"inline-block"},children:t.phone||"---"})]})]})]})]})]}):e.jsxs("div",{style:{maxWidth:"850px",margin:"0 auto"},children:[e.jsxs("div",{style:{background:"#ffffff",border:"1.5px solid #fecaca",borderRadius:"14px",padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px",marginBottom:"20px",boxShadow:"0 2px 8px rgba(185,28,28,0.06)",flexWrap:"wrap"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"14px"},children:[e.jsx("div",{style:{width:"46px",height:"46px",borderRadius:"12px",background:x.length>0?"#fee2e2":"#dcfce7",color:x.length>0?"#b91c1c":"#15803d",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(de,{size:24})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:"16px",fontWeight:900,color:"#0f172a"},children:"السجل الانضباطي وقرارات الجزاءات"}),e.jsxs("div",{style:{fontSize:"12px",color:"#64748b",fontWeight:700,marginTop:"2px"},children:["المنتسب: ",t.name," | الرقم الوطني: ",t.national_id||"---"," | الرقم المالي: ",b]})]})]}),e.jsx("div",{children:x.length>0?e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:[e.jsxs("span",{style:{background:"#fee2e2",color:"#b91c1c",border:"1.5px solid #f87171",padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:800,display:"inline-flex",alignItems:"center",gap:"5px"},children:[e.jsx(ze,{size:14}),"مسجل بحقه (",x.length,") عقوبة تأديبية"]}),e.jsxs("button",{type:"button",onClick:()=>{A(x[0]),D(!0)},style:{background:"#b91c1c",color:"#ffffff",border:"none",padding:"5px 12px",borderRadius:"8px",fontSize:"11.5px",fontWeight:900,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px",boxShadow:"0 2px 6px rgba(185, 28, 28, 0.25)"},title:"فتح وإصدار صحيفة اتهام للحالات الموجزة",children:[e.jsx(O,{size:13}),e.jsx("span",{children:"صحيفة اتهام للمنتسب"})]})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:[e.jsxs("span",{style:{background:"#dcfce7",color:"#15803d",border:"1.5px solid #86efac",padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:800,display:"inline-flex",alignItems:"center",gap:"5px"},children:[e.jsx(le,{size:14}),"السجل الانضباطي نظيف تماماً"]}),e.jsxs("button",{type:"button",onClick:()=>{A(null),D(!0)},style:{background:"#ffffff",color:"#b91c1c",border:"1.5px solid #b91c1c",padding:"5px 12px",borderRadius:"8px",fontSize:"11.5px",fontWeight:900,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"5px"},title:"تحرير صحيفة اتهام لهذا المنتسب",children:[e.jsx(O,{size:13}),e.jsx("span",{children:"تحرير صحيفة اتهام"})]})]})})]}),x.length===0?e.jsxs("div",{style:{background:"#ffffff",border:"1.5px solid #cbd5e1",borderRadius:"14px",padding:"40px 20px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.03)"},children:[e.jsx("div",{style:{width:"64px",height:"64px",borderRadius:"50%",background:"#dcfce7",color:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"},children:e.jsx(X,{size:32})}),e.jsx("h4",{style:{margin:"0 0 6px 0",fontSize:"16px",fontWeight:900,color:"#0f172a"},children:"لا توجد أي عقوبات أو مخالفات تأديبية مسجلة"}),e.jsx("p",{style:{margin:0,fontSize:"13px",color:"#64748b",fontWeight:600},children:"هذا المنتسب يتمتع بسجل انضباطي سليم ولائق، ولم يصدر بحقه أي قرار لفت نظر، خصم، أو إحالة لمجلس تأديبي."})]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"14px"},children:x.map((i,o)=>e.jsxs("div",{style:{background:"#ffffff",border:"1.5px solid #fecaca",borderRadius:"12px",padding:"16px 20px",boxShadow:"0 2px 6px rgba(0,0,0,0.03)"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px",marginBottom:"12px",borderBottom:"1px solid #fee2e2",paddingBottom:"10px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("span",{style:{width:"24px",height:"24px",borderRadius:"50%",background:"#b91c1c",color:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:800},children:o+1}),e.jsxs("div",{children:[e.jsxs("div",{style:{fontSize:"14px",fontWeight:900,color:"#991b1b"},children:[i.PenaltyType,i.DeductionDays>0?` (${i.DeductionDays} أيام خصم)`:""]}),e.jsxs("div",{style:{fontSize:"11px",color:"#64748b",fontWeight:700},children:["قرار رقم: ",i.DecisionNumber||"2026/ق.ت/01"," | بتاريخ: ",i.PenaltyDate||"---"]})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("span",{style:{background:i.IsApplied?"#dcfce7":"#fef3c7",color:i.IsApplied?"#15803d":"#b45309",border:`1px solid ${i.IsApplied?"#86efac":"#fde68a"}`,padding:"3px 10px",borderRadius:"12px",fontSize:"11px",fontWeight:800},children:i.IsApplied?"✓ تم تنفيذ الجزاء":"⏳ قيد المتابعة والإحالة"}),e.jsxs("button",{type:"button",onClick:()=>ae(i),style:{display:"flex",alignItems:"center",gap:"5px",padding:"4px 10px",borderRadius:"6px",border:"1px solid #1e3a8a",background:"#eff6ff",color:"#1e3a8a",fontSize:"11px",fontWeight:800,cursor:"pointer"},title:"طباعة القرار التأديبي الرسمي",children:[e.jsx(Z,{size:13}),e.jsx("span",{children:"طباعة القرار"})]}),e.jsxs("button",{type:"button",onClick:()=>{A(i),D(!0)},style:{display:"flex",alignItems:"center",gap:"5px",padding:"4px 10px",borderRadius:"6px",border:"1.5px solid #b91c1c",background:"#fef2f2",color:"#b91c1c",fontSize:"11px",fontWeight:900,cursor:"pointer"},title:"عرض وطباعة صحيفة اتهام للحالات الموجزة",children:[e.jsx(O,{size:13}),e.jsx("span",{children:"صحيفة اتهام"})]})]})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"10px 14px",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"12px"},children:[e.jsx("span",{style:{fontWeight:800,color:"#475569"},children:"الموجبات والأسباب القانونية: "}),e.jsx("span",{style:{color:"#0f172a",fontWeight:700},children:i.Reason||"---"})]})]},i.PenaltyID||o))})]})}),e.jsxs("div",{style:{borderTop:"1px solid #e2e8f0",background:"#ffffff",padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"},children:[e.jsxs("div",{style:{display:"flex",gap:"10px"},children:[e.jsxs("button",{type:"button",onClick:()=>{C(),P&&P(t)},style:{padding:"9px 18px",borderRadius:"8px",background:"linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",color:"#ffffff",border:"none",fontWeight:800,fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"6px",cursor:"pointer",boxShadow:"0 2px 8px rgba(37,99,235,0.25)"},children:[e.jsx(Se,{size:15}),e.jsx("span",{children:"تعديل بيانات القيد"})]}),e.jsxs("button",{type:"button",onClick:xe,style:{padding:"9px 16px",borderRadius:"8px",background:"#f8fafc",color:"#334155",border:"1px solid #cbd5e1",fontWeight:700,fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"6px",cursor:"pointer"},children:[e.jsx(Z,{size:15}),e.jsx("span",{children:"طباعة الملف الشامل"})]}),e.jsxs("button",{type:"button",onClick:ce,style:{padding:"9px 16px",borderRadius:"8px",background:"linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)",color:"#ffffff",border:"none",fontWeight:800,fontSize:"13px",display:"inline-flex",alignItems:"center",gap:"6px",cursor:"pointer",boxShadow:"0 2px 8px rgba(30,58,138,0.25)"},children:[e.jsx(O,{size:15}),e.jsx("span",{children:"طباعة إفادة خدمة رسمية 📜"})]})]}),e.jsx("button",{type:"button",onClick:C,style:{padding:"9px 24px",borderRadius:"8px",background:"#f1f5f9",color:"#334155",border:"1px solid #cbd5e1",fontWeight:800,fontSize:"13px",cursor:"pointer"},children:"إغلاق"})]})]}),e.jsx("div",{id:"moi-printable-officer-area",children:L==="card"?e.jsxs("div",{style:{width:"100%",maxWidth:"540px",margin:"0 auto",fontFamily:"'Cairo', sans-serif"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"8px",borderBottom:"1.5px solid #1e3a8a",paddingBottom:"5px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{style:{textAlign:"right"},children:[e.jsx("div",{style:{fontSize:"12px",fontWeight:900,color:"#1e3a8a",lineHeight:1.2},children:"دولة ليبيا • وزارة الداخلية"}),e.jsx("div",{style:{fontSize:"11px",fontWeight:800,color:"#0f172a",lineHeight:1.2},children:"مديرية أمن أوباري"})]}),e.jsx("img",{src:v,alt:"شعار وزارة الداخلية",style:{width:"38px",height:"38px",objectFit:"contain"}}),e.jsxs("div",{style:{textAlign:"left",direction:"ltr"},children:[e.jsx("div",{style:{fontSize:"10px",fontWeight:800,color:"#1e3a8a"},children:"Ministry of Interior"}),e.jsx("div",{style:{fontSize:"9px",fontWeight:700,color:"#0f172a"},children:"Ubari Security Directorate"})]})]}),e.jsx("div",{style:{marginTop:"3px",fontSize:"9.5px",fontWeight:800,color:"#92400e",background:"#fef3c7",display:"inline-block",padding:"1px 12px",borderRadius:"10px",border:"1px solid #fde68a"},children:"بطاقة إثبات الهوية الأمنية الرسمية المعتمدة (الوجهين A4 / طباعة وتغليف حراري PVC)"})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"},children:[e.jsxs("div",{className:"printable-card-item",style:{width:"500px",height:"270px",maxHeight:"270px",background:"#ffffff",border:"2px solid #1e3a8a",borderRadius:"12px",padding:"10px 14px",boxSizing:"border-box",position:"relative",color:"#0f172a",display:"flex",flexDirection:"column",justifyContent:"space-between",pageBreakInside:"avoid",breakInside:"avoid"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{height:"3px",borderRadius:"1.5px",background:"linear-gradient(90deg, #dc2626 0%, #dc2626 33.3%, #000000 33.3%, #000000 66.6%, #16a34a 66.6%, #16a34a 100%)",marginBottom:"6px"}}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e2e8f0",paddingBottom:"4px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("img",{src:v,alt:"شعار الوزارة",style:{width:"34px",height:"34px",objectFit:"contain"}}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"11px",fontWeight:900,color:"#1e3a8a",lineHeight:1.1},children:"دولة ليبيا • وزارة الداخلية"}),e.jsx("div",{style:{fontSize:"12.5px",fontWeight:900,color:"#0f172a",lineHeight:1.1},children:"مديرية أمن أوباري"}),e.jsx("div",{style:{fontSize:"8px",color:"#64748b",fontWeight:700},children:"UBARI SECURITY DIRECTORATE"})]})]}),e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("div",{style:{background:"#eff6ff",border:"1.5px solid #1e3a8a",padding:"2px 10px",borderRadius:"15px",fontSize:"9.5px",fontWeight:900,color:"#1e3a8a"},children:"بطاقة إثبات هوية أمنية"}),e.jsx("div",{style:{fontSize:"7.5px",color:"#64748b",marginTop:"1px",fontWeight:700},children:"OFFICIAL POLICE IDENTIFICATION"})]}),e.jsxs("div",{style:{width:"30px",height:"22px",borderRadius:"4px",background:"linear-gradient(135deg, #fef08a 0%, #eab308 40%, #ca8a04 100%)",border:"1px solid #b45309",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"1px"},children:[e.jsx("div",{style:{width:"80%",height:"1px",background:"rgba(0,0,0,0.35)",margin:"1px 0"}}),e.jsx("div",{style:{width:"80%",height:"1px",background:"rgba(0,0,0,0.35)",margin:"1px 0"}})]})]})]}),e.jsxs("div",{style:{display:"flex",gap:"12px",alignItems:"center",margin:"4px 0"},children:[e.jsx("div",{style:{width:"74px",height:"94px",borderRadius:"8px",border:"1.5px solid #1e3a8a",overflow:"hidden",flexShrink:0,background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center"},children:n?e.jsx("img",{src:n,alt:t.name,style:{width:"100%",height:"100%",objectFit:"cover"}}):e.jsxs("div",{style:{textAlign:"center",color:"#64748b",fontSize:"8.5px",fontWeight:800},children:[e.jsx(J,{size:24,color:"#1e3a8a"}),e.jsx("div",{children:"صورة عسكرية"})]})}),e.jsxs("div",{style:{flex:1},children:[e.jsxs("div",{style:{marginBottom:"4px"},children:[e.jsx("div",{style:{fontSize:"8px",color:"#64748b",fontWeight:700},children:"الاسم الرباعي واللقب:"}),e.jsx("div",{style:{fontSize:"14.5px",fontWeight:900,color:"#0f172a",lineHeight:1.2},children:t.name||"---"})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px",marginBottom:"4px"},children:[e.jsxs("div",{style:{background:"#f8fafc",padding:"2px 6px",borderRadius:"4px",border:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"7.5px",color:"#64748b",fontWeight:700},children:"الرتبة / الوظيفة:"}),e.jsx("div",{style:{fontSize:"11px",fontWeight:900,color:"#1e3a8a"},children:j})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"2px 6px",borderRadius:"4px",border:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"7.5px",color:"#64748b",fontWeight:700},children:"التصنيف:"}),e.jsx("div",{style:{fontSize:"10.5px",fontWeight:900,color:"#0f172a"},children:t.type||"كادر شرطة نظامي"})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px",marginBottom:"4px"},children:[e.jsxs("div",{style:{background:"#f8fafc",padding:"2px 6px",borderRadius:"4px",border:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"7.5px",color:"#64748b",fontWeight:700},children:"الرقم المالي / الوظيفي:"}),e.jsx("div",{style:{fontSize:"11.5px",fontWeight:900,color:"#0284c7",direction:"ltr",textAlign:"right",fontFamily:"monospace"},children:b})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"2px 6px",borderRadius:"4px",border:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"7.5px",color:"#64748b",fontWeight:700},children:"الرقم الوطني:"}),e.jsx("div",{style:{fontSize:"11px",fontWeight:900,color:"#0f172a",direction:"ltr",textAlign:"right",fontFamily:"monospace"},children:t.national_id||"---"})]})]}),e.jsxs("div",{style:{background:"#f8fafc",padding:"2px 6px",borderRadius:"4px",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"7.5px",color:"#64748b",fontWeight:700},children:"جهة العمل والتبعية:"}),e.jsx("div",{style:{fontSize:"10px",fontWeight:800,color:"#1e293b"},children:t.department||"مديرية أمن أوباري"})]}),e.jsxs("div",{style:{textAlign:"left",paddingRight:"6px",borderRight:"1px solid #e2e8f0"},children:[e.jsx("div",{style:{fontSize:"7px",color:"#dc2626",fontWeight:800},children:"فصيلة الدم"}),e.jsx("div",{style:{fontSize:"11px",fontWeight:900,color:"#dc2626"},children:t.blood_type||"O+"})]})]})]}),z&&e.jsxs("div",{style:{width:"64px",height:"64px",border:"1px solid #cbd5e1",borderRadius:"4px",padding:"2px",background:"#ffffff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0},children:[e.jsx("img",{src:z,alt:"QR",style:{width:"54px",height:"54px"}}),e.jsx("span",{style:{fontSize:"6.5px",color:"#64748b",fontWeight:800},children:"رمز التحقق"})]})]}),e.jsxs("div",{style:{borderTop:"1px solid #e2e8f0",paddingTop:"3px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"8px",color:"#475569",fontWeight:700},children:[e.jsx("div",{children:"تاريخ الإصدار: 2024م • سارية حتى: 2029م"}),e.jsxs("div",{style:{fontFamily:"monospace",fontSize:"9px",color:"#1e3a8a",fontWeight:800},children:["*UBR-MOI-",b,"*"]}),e.jsx("div",{})]})]}),e.jsx("div",{style:{width:"500px",borderTop:"1.5px dashed #64748b",position:"relative",margin:"4px 0",textAlign:"center"},children:e.jsx("span",{style:{position:"relative",top:"-8px",background:"#ffffff",padding:"0 10px",fontSize:"8.5px",fontWeight:800,color:"#475569"},children:"✂ خط طي وقص البطاقة المعتمد (PVC Standard) ✂"})}),e.jsxs("div",{className:"printable-card-item",style:{width:"500px",height:"270px",maxHeight:"270px",background:"#ffffff",border:"2px solid #1e3a8a",borderRadius:"12px",padding:"10px 16px",boxSizing:"border-box",position:"relative",color:"#0f172a",display:"flex",flexDirection:"column",justifyContent:"space-between",pageBreakInside:"avoid",breakInside:"avoid"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e2e8f0",paddingBottom:"3px"},children:[e.jsx("div",{style:{fontSize:"10.5px",fontWeight:900,color:"#1e3a8a"},children:"تعليمات أمنية وإذن حمل السلاح الفردي"}),e.jsx("div",{style:{fontSize:"8px",color:"#64748b",fontWeight:700},children:"SECURITY INSTRUCTIONS & FIREARM PERMIT"})]}),e.jsxs("div",{style:{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"6px",padding:"6px 10px",margin:"5px 0",fontSize:"8.5px",lineHeight:1.45,color:"#334155",textAlign:"justify"},children:[e.jsx("div",{style:{fontWeight:800,color:"#1e3a8a",marginBottom:"2px"},children:"⚖️ تصريح وإشعار سيادي رسمي:"}),e.jsx("div",{children:"حامل هذه البطاقة يتبع رسمياً هيئة الشرطة بمديرية أمن أوباري - وزارة الداخلية. ومأذون له بموجب القانون رقم (10) لسنة 1992م والتشريعات المنظمة بحمل سلاحه الشخصي الميري وأداء مهامه الأمنية وضبط المخالفات في كامل التراب الليبي. يرجى من كافة الأجهزة الأمنية والعسكرية تسهيل مهامه والتعاون معه."})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"3px"},children:[e.jsxs("div",{style:{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"6px",padding:"4px 8px",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(X,{size:16,color:"#dc2626"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"7.5px",color:"#991b1b",fontWeight:700},children:"إذن حمل السلاح:"}),e.jsx("div",{style:{fontSize:"9.5px",fontWeight:900,color:"#b91c1c"},children:"مسدس ميري فردي 9 ملم مصرح"})]})]}),e.jsxs("div",{style:{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"6px",padding:"4px 8px",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(oe,{size:16,color:"#16a34a"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"7.5px",color:"#166534",fontWeight:700},children:"سريان البطاقة:"}),e.jsx("div",{style:{fontSize:"9.5px",fontWeight:900,color:"#15803d"},children:"سارية المفعول حتى 2029/10/31م"})]})]})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid #e2e8f0",paddingTop:"4px"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"7.5px",color:"#64748b",fontWeight:700},children:"رئيس قسم الشؤون الإدارية:"}),e.jsx("div",{style:{fontSize:"9.5px",fontWeight:800,color:"#0f172a"},children:"عقيد شرطة / فرج محمد السنوسي"})]}),e.jsxs("div",{style:{width:"48px",height:"48px",borderRadius:"50%",border:"1.5px dashed #1e3a8a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:"6.5px",fontWeight:800,color:"#1e3a8a",textAlign:"center",lineHeight:1.15},children:[e.jsx("span",{children:"وزارة الداخلية"}),e.jsx("span",{children:"مديرية أمن أوباري"}),e.jsx("span",{style:{color:"#dc2626",fontSize:"5.5px"},children:"ختم معتمد"})]}),e.jsx("div",{style:{textAlign:"left"}})]})]})]})]}):e.jsxs("div",{style:{maxWidth:"780px",margin:"0 auto",fontFamily:"'Cairo', sans-serif",pageBreakInside:"avoid",breakInside:"avoid"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"2.5px solid #1e3a8a",paddingBottom:"10px",marginBottom:"14px"},children:[e.jsxs("div",{style:{textAlign:"right"},children:[e.jsx("h2",{style:{margin:0,fontSize:"16px",fontWeight:900,color:"#1e3a8a"},children:"دولة ليبيــــا"}),e.jsx("h3",{style:{margin:"2px 0 0 0",fontSize:"14px",fontWeight:800,color:"#0f172a"},children:"وزارة الداخليـــــة"}),e.jsx("h4",{style:{margin:"2px 0 0 0",fontSize:"12px",fontWeight:700,color:"#334155"},children:"مديرية أمن أوباري"})]}),e.jsx("img",{src:v,alt:"شعار وزارة الداخلية",style:{width:"60px",height:"60px",objectFit:"contain"}}),e.jsxs("div",{style:{textAlign:"left",direction:"ltr"},children:[e.jsx("div",{style:{fontSize:"12px",fontWeight:800,color:"#1e3a8a"},children:"State of Libya"}),e.jsx("div",{style:{fontSize:"11px",fontWeight:700,color:"#0f172a"},children:"Ministry of Interior"}),e.jsx("div",{style:{fontSize:"10px",color:"#475569"},children:"Ubari Security Directorate"})]})]}),e.jsxs("div",{style:{textAlign:"center",marginBottom:"14px"},children:[e.jsx("h2",{style:{margin:0,fontSize:"17px",fontWeight:900,color:"#0f172a",textDecoration:"underline"},children:"الملف والسجل الوظيفي والأمني الموحد"}),e.jsx("p",{style:{margin:"3px 0 0 0",fontSize:"11px",color:"#64748b",fontWeight:700},children:"كشف رسمي مستخرج من المنظومة المركزية لشؤون الضباط وضباط الصف والأفراد"})]}),e.jsxs("div",{style:{display:"flex",gap:"16px",border:"1.5px solid #cbd5e1",borderRadius:"10px",padding:"12px",marginBottom:"14px",background:"#f8fafc"},children:[e.jsx("div",{style:{width:"85px",height:"108px",borderRadius:"6px",border:"2px solid #1e3a8a",overflow:"hidden",flexShrink:0,background:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center"},children:n?e.jsx("img",{src:n,alt:t.name,style:{width:"100%",height:"100%",objectFit:"cover"}}):e.jsxs("div",{style:{textAlign:"center",color:"#64748b",fontSize:"9px"},children:[e.jsx(J,{size:30,color:"#1e3a8a"}),e.jsx("div",{children:"صورة عسكرية"})]})}),e.jsxs("div",{style:{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",fontSize:"12px"},children:[e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"الاسم الرباعي: "}),e.jsx("strong",{style:{color:"#0f172a",fontSize:"14px"},children:t.name})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"الرتبة / الوظيفة: "}),e.jsx("strong",{style:{color:"#1e3a8a"},children:j})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"الرقم المالي / الوظيفي: "}),e.jsx("strong",{style:{color:"#0284c7",fontFamily:"monospace"},children:b})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"الرقم الوطني: "}),e.jsx("strong",{style:{color:"#0f172a",fontFamily:"monospace"},children:t.national_id||"---"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"جهة العمل والتبعية: "}),e.jsx("strong",{children:t.department||"مديرية أمن أوباري"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{color:"#64748b"},children:"الوضع الوظيفي: "}),e.jsx("strong",{style:{color:"#16a34a"},children:I})]})]})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"18px"},children:[e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:"1px solid #cbd5e1",fontSize:"11.5px"},children:[e.jsx("thead",{children:e.jsx("tr",{style:{background:"#1e3a8a",color:"#ffffff"},children:e.jsx("th",{colSpan:4,style:{padding:"6px 10px",textAlign:"right"},children:"1. البيانات الوظيفية والإدارية"})})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b",width:"25%"},children:"جهة العمل / المركز:"}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:t.department||"مركز شرطة أوباري المدينة"}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b",width:"25%"},children:"تاريخ المباشرة:"}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:t.start_date||"---"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b"},children:"قرار وتاريخ التعيين:"}),e.jsxs("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:[t.appointment_decision||"---"," ",t.appointment_date?`(${t.appointment_date})`:""]}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b"},children:"قرار وتاريخ آخر ترقية:"}),e.jsxs("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:[t.last_promotion_decision||"---"," ",t.last_promotion_date?`(${t.last_promotion_date})`:""]})]})]})]}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:"1px solid #cbd5e1",fontSize:"11.5px"},children:[e.jsx("thead",{children:e.jsx("tr",{style:{background:"#0284c7",color:"#ffffff"},children:e.jsx("th",{colSpan:4,style:{padding:"6px 10px",textAlign:"right"},children:"2. البيانات المالية والمصرفية"})})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b",width:"25%"},children:"اسم المصرف والفرع:"}),e.jsxs("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:[t.bank_name||"الصحاري"," - ",t.bank_branch||"فرع أوباري"]}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b",width:"25%"},children:"رقم الحساب المصرفي:"}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800,fontFamily:"monospace"},children:t.account_number||"---"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b"},children:"المرتب الأساسي:"}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800,color:"#16a34a"},children:t.basic_salary?`${t.basic_salary} د.ل`:"2,200 د.ل"}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b"},children:"فصيلة الدم واللياقة:"}),e.jsxs("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:[t.blood_type||"O+"," (",t.diseases||"سليم ولائق",")"]})]})]})]}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:"1px solid #cbd5e1",fontSize:"11.5px"},children:[e.jsx("thead",{children:e.jsx("tr",{style:{background:"#475569",color:"#ffffff"},children:e.jsx("th",{colSpan:4,style:{padding:"6px 10px",textAlign:"right"},children:"3. البيانات الشخصية والاجتماعية"})})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b",width:"25%"},children:"اسم الأم:"}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:t.mother_name||"---"}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b",width:"25%"},children:"تاريخ ومكان الميلاد:"}),e.jsxs("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:[t.birth_date||"---"," (",t.birth_place||"أوباري",")"]})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b"},children:"الحالة الاجتماعية:"}),e.jsxs("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:[t.marital_status||"متزوج"," ",t.children_count?`(الأبناء: ${t.children_count})`:""]}),e.jsx("td",{style:{padding:"6px",border:"1px solid #cbd5e1",color:"#64748b"},children:"رقم الهاتف والإقامة:"}),e.jsxs("td",{style:{padding:"6px",border:"1px solid #cbd5e1",fontWeight:800},children:[t.phone||"---"," - ",t.residence||"أوباري المدينة"]})]})]})]})]})]})}),G&&e.jsx(ve,{member:t,penalty:V,onClose:()=>{D(!1),A(null)}})]})}export{Ae as default};
