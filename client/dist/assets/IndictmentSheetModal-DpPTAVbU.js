import{r as d,j as t}from"./vendor-react-0RU1ubfM.js";import{b as E}from"./vendor-qrcode-CjSdxGTc.js";import{M as $}from"./index-zGwUayBE.js";import{p as H}from"./printHelper-0VHxJuYs.js";import{i as M,ab as A,t as D,X as O,ac as Q}from"./vendor-icons-BCWJvmsE.js";function F({member:n={},penalty:e={},qrCodeUrl:a="",customFields:o={}}){const l=e.MilitaryNumber||n.military_number||e.JobNumber||n.financial_number||n.job_number||n.national_id||"---",c=n.rank||e.EmployeeCategory||n.type||"غير محدد",g=e.FullName||n.name||"---",s=e.PenaltyDate||e.penalty_date||o.incidentDate||new Date().toISOString().slice(0,10),u=o.incidentLocation||"أوباري",h=o.charge||e.Reason||"غياب عن العمل",m=o.verdict||(e.PenaltyType?`${e.PenaltyType}${e.DeductionDays>0?` (${e.DeductionDays} أيام)`:""}`:"خصم مالي"),p=o.trialDate||"..... / ..... / 202 م",j=o.trialLocation||"مديرية أمن أوباري",x=o.approverName||"",v=o.approverRank||"",r=n.photo||localStorage.getItem(`ubari_officer_photo_${n.id}`)||"";return`
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
                  <img src="${$}" alt="شعار وزارة الداخلية" style="width: 58px; height: 58px; object-fit: contain; display: block;" />
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
                    ${r?`
                      <img src="${r}" alt="${g}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                    `:`
                      <div style="color: #94a3b8; font-size: 13.5px; font-weight: 800; text-align: center;">
                        صورة
                      </div>
                    `}
                  </div>
                </td>

                <!-- QR Code (Placed beside photo towards center) -->
                <td style="vertical-align: middle; border: none;">
                  ${a?`
                    <div style="width: 72px; height: 72px; padding: 2px; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; display: flex; align-items: center; justify-content: center;">
                      <img src="${a}" alt="QR" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
                    </div>
                  `:`
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
              ${l}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 6px; text-align: center; font-size: 13.5px; font-weight: 800; color: #0f172a;">
              ${c}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 8px; text-align: center; font-size: 15.5px; font-weight: 900; color: #b91c1c;">
              ${g}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 6px; text-align: center; font-size: 13px; font-weight: 800;">
              ${u} - ${s}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 8px; text-align: center; font-size: 13px; font-weight: 800; color: #1e293b;">
              ${h}
            </td>
            <td style="border: 1.5px solid #000000; padding: 20px 6px; text-align: center; font-size: 13.5px; font-weight: 900; color: #0f172a;">
              ${m}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom Signatures & Trial Box Section -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 25px; table-layout: fixed; border: none;">
        <tr>
          <!-- Right (First TD in RTL): اعتماد المحاكمة -->
          <td style="vertical-align: bottom; width: 50%; text-align: right; padding-right: 15px; border: none;">
            <div style="display: inline-block; text-align: right; line-height: 2.1; font-size: 13.5px; font-weight: 800; color: #0f172a;">
              <div style="font-size: 15px; font-weight: 900; color: #000000; text-decoration: underline; margin-bottom: 2px;">
                اعتماد المحاكمة
              </div>
              <div>الاسم : ${x||"........................................"}</div>
              <div>الرتبة : ${v||"........................................"}</div>
              <div>التوقيع : ........................................</div>
            </div>
          </td>

          <!-- Left (Second TD in RTL): Trial Schedule Box -->
          <td style="vertical-align: bottom; width: 50%; text-align: left; padding-left: 15px; border: none;">
            <table style="border-collapse: collapse; border: 1.5px solid #000000; width: 280px; font-size: 12.5px; margin-right: auto; margin-left: 0;">
              <tr>
                <td style="border: 1.5px solid #000000; padding: 7px 10px; background: #f8fafc; font-weight: 800; width: 45%; text-align: center;">
                  تاريخ المحاكمة
                </td>
                <td style="border: 1.5px solid #000000; padding: 7px 10px; text-align: center; font-weight: 700; direction: ltr;">
                  ${p}
                </td>
              </tr>
              <tr>
                <td style="border: 1.5px solid #000000; padding: 7px 10px; background: #f8fafc; font-weight: 800; text-align: center;">
                  مكان المحاكمة
                </td>
                <td style="border: 1.5px solid #000000; padding: 7px 10px; text-align: center; font-weight: 700;">
                  ${j}
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
  `}function J({member:n,penalty:e,qrCodeUrl:a="",customFields:o={}}){const l=F({member:n,penalty:e,qrCodeUrl:a,customFields:o}),c=e?.FullName||n?.name||"المنتسب";H(l,`صحيفة اتهام - ${c}`)}function Y({member:n={},penalty:e=null,onClose:a}){if(!n&&!e)return null;const o=e?.FullName||n?.name||"---",l=e?.MilitaryNumber||n?.military_number||e?.JobNumber||n?.financial_number||n?.job_number||n?.national_id||"---",c=n?.rank||e?.EmployeeCategory||n?.type||"غير محدد",g=n?.photo||localStorage.getItem(`ubari_officer_photo_${n?.id}`)||"",[s,u]=d.useState(e?.PenaltyDate||e?.penalty_date||new Date().toISOString().slice(0,10)),[h,m]=d.useState("أوباري"),[p,j]=d.useState(e?.Reason||"غياب عن العمل"),[x,v]=d.useState(e?.PenaltyType?`${e.PenaltyType}${e.DeductionDays>0?` (${e.DeductionDays} أيام)`:""}`:"خصم مالي"),[r,R]=d.useState(""),[w,I]=d.useState("مديرية أمن أوباري"),[S,L]=d.useState(""),[z,T]=d.useState(""),[y,B]=d.useState(!1),[k,P]=d.useState(""),f=d.useRef(null),C=i=>{if(!i||!i.includes("-"))return i||"..... / ..... / 202 م";const[b,N,_]=i.split("-");return`${_} / ${N} / ${b} م`};d.useEffect(()=>{const i=`وزارة الداخلية - مديرية أمن أوباري
صحيفة اتهام للحالات الموجزة
المتهم: ${o}
الرقم: ${l}
التهمة: ${p}
الحكم: ${x}
التاريخ: ${s}`;E.toDataURL(i,{width:140,margin:1}).then(b=>P(b)).catch(b=>console.error("QR generation error:",b))},[o,l,p,x,s]);const W=()=>{J({member:n,penalty:e||{FullName:o,MilitaryNumber:l,Reason:p,PenaltyType:x,PenaltyDate:s},qrCodeUrl:k,customFields:{incidentDate:s,incidentLocation:h,charge:p,verdict:x,trialDate:r?C(r):"..... / ..... / 202 م",trialLocation:w,approverName:S,approverRank:z}})};return t.jsx("div",{className:"moi-modal-overlay",style:{position:"fixed",inset:0,backgroundColor:"rgba(15, 23, 42, 0.75)",backdropFilter:"blur(5px)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",direction:"rtl",fontFamily:"'Cairo', sans-serif"},onClick:a,children:t.jsxs("div",{className:"moi-modal-container",style:{background:"#ffffff",borderRadius:"16px",width:"100%",maxWidth:"920px",maxHeight:"94vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.25)",border:"1.5px solid #cbd5e1",overflow:"hidden"},onClick:i=>i.stopPropagation(),children:[t.jsxs("div",{style:{background:"linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)",color:"#ffffff",padding:"14px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"2px solid #d4af37"},children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[t.jsx("div",{style:{width:"38px",height:"38px",borderRadius:"10px",background:"rgba(239, 68, 68, 0.2)",border:"1px solid #ef4444",color:"#f87171",display:"flex",alignItems:"center",justifyContent:"center"},children:t.jsx(M,{size:20})}),t.jsxs("div",{children:[t.jsx("div",{style:{fontSize:"16px",fontWeight:900},children:"صحيفة اتهام للحالات الموجزة"}),t.jsxs("div",{style:{fontSize:"11.5px",color:"#93c5fd",fontWeight:600},children:["المتهم: ",o," | الرقم: ",l," | مديرية أمن أوباري"]})]})]}),t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[t.jsxs("button",{type:"button",onClick:()=>B(!y),style:{background:y?"#f59e0b":"rgba(255, 255, 255, 0.12)",color:"#ffffff",border:"1px solid rgba(255, 255, 255, 0.25)",padding:"6px 14px",borderRadius:"8px",fontSize:"12px",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"},children:[t.jsx(A,{size:14}),t.jsx("span",{children:y?"معاينة الصحيفة":"تعديل البيانات"})]}),t.jsxs("button",{type:"button",onClick:W,style:{background:"linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",color:"#ffffff",border:"none",padding:"6px 16px",borderRadius:"8px",fontSize:"12.5px",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",boxShadow:"0 2px 8px rgba(185, 28, 28, 0.4)"},children:[t.jsx(D,{size:15}),t.jsx("span",{children:"طباعة الصحيفة (A4)"})]}),t.jsx("button",{type:"button",onClick:a,style:{background:"rgba(255, 255, 255, 0.1)",border:"none",color:"#ffffff",width:"32px",height:"32px",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},title:"إغلاق",children:t.jsx(O,{size:18})})]})]}),t.jsxs("div",{style:{overflowY:"auto",padding:"24px",flex:1,background:"#f8fafc"},children:[y&&t.jsxs("div",{style:{background:"#ffffff",border:"1.5px solid #bfdbfe",borderRadius:"12px",padding:"16px 20px",marginBottom:"20px",boxShadow:"0 2px 8px rgba(30, 58, 138, 0.06)"},children:[t.jsxs("div",{style:{fontSize:"13px",fontWeight:800,color:"#1e3a8a",marginBottom:"12px",display:"flex",alignItems:"center",gap:"6px"},children:[t.jsx(A,{size:15}),t.jsx("span",{children:"تخصيص بنود ومحاكمة صحيفة الاتهام:"})]}),t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))",gap:"12px"},children:[t.jsxs("div",{children:[t.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"مكان الواقعة"}),t.jsx("input",{type:"text",value:h,onChange:i=>m(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),t.jsxs("div",{children:[t.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"تاريخ الواقعة"}),t.jsx("input",{type:"date",value:s,onChange:i=>u(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),t.jsxs("div",{children:[t.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"التهمة والمادة القانونية"}),t.jsx("input",{type:"text",value:p,onChange:i=>j(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),t.jsxs("div",{children:[t.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"الحكم / الإجراء"}),t.jsx("input",{type:"text",value:x,onChange:i=>v(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),t.jsxs("div",{children:[t.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"تاريخ المحاكمة"}),t.jsx("input",{type:"date",value:r,onChange:i=>R(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),t.jsxs("div",{children:[t.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"مكان المحاكمة"}),t.jsx("input",{type:"text",value:w,onChange:i=>I(i.target.value),placeholder:"....................",style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),t.jsxs("div",{children:[t.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"اسم معتمد المحاكمة (اختياري)"}),t.jsx("input",{type:"text",value:S,onChange:i=>L(i.target.value),placeholder:"يترك فارغاً للنقط ...........",style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),t.jsxs("div",{children:[t.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"رتبة معتمد المحاكمة (اختياري)"}),t.jsx("input",{type:"text",value:z,onChange:i=>T(i.target.value),placeholder:"يترك فارغاً للنقط ...........",style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]})]})]}),t.jsxs("div",{className:"indictment-sheet-page orientation-landscape",style:{background:"#ffffff",border:"2px solid #94a3b8",borderRadius:"8px",padding:"24px 30px",boxShadow:"0 4px 15px rgba(0, 0, 0, 0.05)",color:"#0f172a",width:"100%",boxSizing:"border-box"},children:[t.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",tableLayout:"fixed",marginBottom:"8px",direction:"rtl",border:"none"},children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"31%"}}),t.jsx("col",{style:{width:"38%"}}),t.jsx("col",{style:{width:"31%"}})]}),t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{style:{textAlign:"right",verticalAlign:"middle",padding:"0 4px",border:"none",overflow:"hidden"},children:t.jsx("table",{style:{borderCollapse:"collapse",border:"none",margin:0,direction:"rtl"},children:t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{style:{verticalAlign:"middle",paddingLeft:"10px",border:"none"},children:t.jsx("img",{src:$,alt:"شعار وزارة الداخلية",style:{width:"56px",height:"56px",objectFit:"contain",display:"block"}})}),t.jsxs("td",{style:{verticalAlign:"middle",border:"none",textAlign:"right",whiteSpace:"nowrap"},children:[t.jsx("div",{style:{fontSize:"15px",fontWeight:900,color:"#1e3a8a",lineHeight:1.35,letterSpacing:"0.2px"},children:"وزارة الــداخــلــيــة"}),t.jsx("div",{style:{fontSize:"13.5px",fontWeight:800,color:"#0f172a",lineHeight:1.35},children:"مديرية أمن أوباري"})]})]})})})}),t.jsx("td",{style:{textAlign:"center",verticalAlign:"middle",padding:"0 4px",border:"none"},children:t.jsx("div",{style:{display:"inline-block",border:"2.5px solid #b91c1c",borderRadius:"10px",padding:"7px 22px",background:"#ffffff",boxShadow:"0 1px 4px rgba(185, 28, 28, 0.08)"},children:t.jsx("h2",{style:{margin:0,fontSize:"19px",fontWeight:900,color:"#b91c1c",letterSpacing:"0.5px",whiteSpace:"nowrap",lineHeight:1.25},children:"صحـيـفـة اتـهـام لـلـحـالات الـمـوجـزة"})})}),t.jsx("td",{style:{textAlign:"left",verticalAlign:"middle",padding:"0 4px",border:"none"},children:t.jsx("table",{style:{borderCollapse:"collapse",border:"none",marginRight:"auto",marginLeft:0,direction:"ltr"},children:t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{style:{verticalAlign:"middle",paddingRight:"12px",border:"none"},children:t.jsx("div",{style:{width:"76px",height:"96px",border:"1.5px solid #d97706",borderRadius:"6px",background:"#fafafa",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"},children:g?t.jsx("img",{src:g,alt:o,style:{width:"100%",height:"100%",objectFit:"cover",display:"block"}}):t.jsx("span",{style:{color:"#94a3b8",fontSize:"13.5px",fontWeight:800},children:"صورة"})})}),t.jsx("td",{style:{verticalAlign:"middle",border:"none"},children:k?t.jsx("div",{style:{width:"72px",height:"72px",padding:"2px",border:"1px solid #cbd5e1",borderRadius:"6px",background:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center"},children:t.jsx("img",{src:k,alt:"QR Code",style:{width:"100%",height:"100%",objectFit:"contain",display:"block"}})}):t.jsx("div",{style:{width:"72px",height:"72px",border:"1px dashed #cbd5e1",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"#94a3b8"},children:"QR"})})]})})})})]})})]}),t.jsx("div",{style:{borderTop:"3px double #000000",margin:"10px 0 20px 0"}}),t.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:"1.5px solid #000000",marginBottom:"45px",tableLayout:"fixed"},children:[t.jsx("thead",{children:t.jsxs("tr",{style:{background:"#cbd5e1",color:"#0f172a"},children:[t.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 4px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"12%"},children:"الرقم"}),t.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 4px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"14%"},children:"الرتبة / الصفة"}),t.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 6px",fontSize:"14px",fontWeight:900,textAlign:"center",width:"24%"},children:"اسم المتهم"}),t.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 4px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"18%"},children:"تاريخ ومكان الواقعة"}),t.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 6px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"18%"},children:"التهمة والمادة القانونية"}),t.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 4px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"14%"},children:"الحكم / الإجراء"})]})}),t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 6px",textAlign:"center",fontSize:"14px",fontWeight:900,fontFamily:"monospace"},children:l}),t.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 6px",textAlign:"center",fontSize:"13px",fontWeight:800},children:c}),t.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 8px",textAlign:"center",fontSize:"15.5px",fontWeight:900,color:"#dc2626"},children:o}),t.jsxs("td",{style:{border:"1.5px solid #000000",padding:"20px 6px",textAlign:"center",fontSize:"13px",fontWeight:700},children:[h," - ",s]}),t.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 8px",textAlign:"center",fontSize:"13px",fontWeight:800,color:"#334155"},children:p}),t.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 6px",textAlign:"center",fontSize:"13.5px",fontWeight:900,color:"#0f172a"},children:x})]})})]}),t.jsx("table",{style:{width:"100%",borderCollapse:"collapse",marginTop:"25px",tableLayout:"fixed",border:"none"},children:t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{style:{verticalAlign:"bottom",width:"50%",textAlign:"right",paddingRight:"15px",border:"none"},children:t.jsxs("div",{style:{display:"inline-block",textAlign:"right",lineHeight:"2.1",fontSize:"13.5px",fontWeight:800,color:"#0f172a"},children:[t.jsx("div",{style:{fontSize:"15px",fontWeight:900,color:"#000000",textDecoration:"underline",marginBottom:"2px"},children:"اعتماد المحاكمة"}),t.jsxs("div",{children:["الاسم : ",S||"........................................"]}),t.jsxs("div",{children:["الرتبة : ",z||"........................................"]}),t.jsx("div",{children:"التوقيع : ........................................"})]})}),t.jsx("td",{style:{verticalAlign:"bottom",width:"50%",textAlign:"left",paddingLeft:"15px",border:"none"},children:t.jsx("table",{style:{borderCollapse:"collapse",border:"1.5px solid #000000",width:"300px",fontSize:"12.5px",marginRight:"auto",marginLeft:0},children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{style:{border:"1.5px solid #000000",padding:"7px 10px",background:"#f8fafc",fontWeight:800,width:"42%",textAlign:"center"},children:"تاريخ المحاكمة"}),t.jsx("td",{onClick:()=>{if(f.current)try{f.current.showPicker()}catch{f.current.focus(),f.current.click()}},style:{border:"1.5px solid #000000",padding:"7px 10px",textAlign:"center",fontWeight:700,cursor:"pointer",position:"relative"},title:"انقر لاختيار تاريخ المحاكمة من التقويم",children:t.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},children:[t.jsx("span",{style:{direction:"ltr",fontWeight:800,color:r?"#0f172a":"#64748b"},children:r?C(r):"..... / ..... / 202 م"}),t.jsx(Q,{size:14,color:"#1e3a8a"}),t.jsx("input",{ref:f,type:"date",value:r,onChange:i=>R(i.target.value),style:{position:"absolute",opacity:0,width:"100%",height:"100%",inset:0,cursor:"pointer"}})]})})]}),t.jsxs("tr",{children:[t.jsx("td",{style:{border:"1.5px solid #000000",padding:"7px 10px",background:"#f8fafc",fontWeight:800,textAlign:"center"},children:"مكان المحاكمة"}),t.jsx("td",{style:{border:"1.5px solid #000000",padding:"7px 10px",textAlign:"center",fontWeight:700},children:w})]})]})})})]})})})]})]}),t.jsxs("div",{style:{padding:"12px 24px",background:"#ffffff",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[t.jsx("div",{style:{fontSize:"12px",color:"#64748b",fontWeight:700},children:"معتمدة رسمياً وفق نموذج صحائف الاتهام للحالات الموجزة - وزارة الداخلية دولة ليبيا"}),t.jsxs("div",{style:{display:"flex",gap:"10px"},children:[t.jsxs("button",{type:"button",onClick:W,style:{background:"#b91c1c",color:"#ffffff",border:"none",padding:"8px 18px",borderRadius:"8px",fontSize:"13px",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"},children:[t.jsx(D,{size:15}),t.jsx("span",{children:"طباعة المستند الرسمي"})]}),t.jsx("button",{type:"button",onClick:a,style:{background:"#f1f5f9",color:"#334155",border:"1px solid #cbd5e1",padding:"8px 18px",borderRadius:"8px",fontSize:"13px",fontWeight:800,cursor:"pointer"},children:"إغلاق"})]})]})]})})}export{Y as I};
