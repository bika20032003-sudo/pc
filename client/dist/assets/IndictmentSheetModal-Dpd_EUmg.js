import{r,j as e}from"./vendor-react-0RU1ubfM.js";import{b as E}from"./vendor-qrcode-CjSdxGTc.js";import{M as I}from"./index-DaTokJrZ.js";import{p as M}from"./printHelper-Da8XnqdD.js";import{i as F,ab as R,t as C,X as J,ac as H}from"./vendor-icons-BCWJvmsE.js";const Y=[{PenaltyID:11,FullName:"الخير  حسين محمد الخير",AdminNumber:null,NationalNumber:"119880134454",MilitaryNumber:"2178586",JobNumber:null,EmployeeCategory:"عسكري",PenaltyType:"خصم مالي",Reason:"غياب عن العمل",PenaltyDate:"2026-11-23",DeductionDays:5,IsApplied:!1},{PenaltyID:10,FullName:"محمد صالح عبدالله ابكة",AdminNumber:null,NationalNumber:"119940394820",MilitaryNumber:"2178722",JobNumber:null,EmployeeCategory:"عسكري",PenaltyType:"خصم مالي",Reason:"غياب عن العمل",PenaltyDate:"2026-11-23",DeductionDays:5,IsApplied:!1},{PenaltyID:9,FullName:"حسن يوسف الحبيب محمد",AdminNumber:null,NationalNumber:"119880397668",MilitaryNumber:"2178559",JobNumber:null,EmployeeCategory:"عسكري",PenaltyType:"خصم مالي",Reason:"غياب عن العمل",PenaltyDate:"2026-11-23",DeductionDays:5,IsApplied:!1},{PenaltyID:8,FullName:"الصديق الحسن مصطفي الأنصاري",AdminNumber:null,NationalNumber:"5198625601",MilitaryNumber:"2238960",JobNumber:null,EmployeeCategory:"عسكري",PenaltyType:"خصم مالي",Reason:"غياب عن العمل",PenaltyDate:"2026-11-23",DeductionDays:5,IsApplied:!1},{PenaltyID:7,FullName:"الهادي حسن عابدين محمد",AdminNumber:null,NationalNumber:"5198904008",MilitaryNumber:"2239055",JobNumber:null,EmployeeCategory:"عسكري",PenaltyType:"خصم مالي",Reason:"غياب عن العمل",PenaltyDate:"2026-11-23",DeductionDays:5,IsApplied:!1},{PenaltyID:6,FullName:"حسين الخير جمعه سلمي",AdminNumber:null,NationalNumber:"5198901344",MilitaryNumber:"2239245",JobNumber:null,EmployeeCategory:"عسكري",PenaltyType:"خصم مالي",Reason:"غياب عن العمل",PenaltyDate:"2026-11-23",DeductionDays:5,IsApplied:!1},{PenaltyID:5,FullName:"عبدالرحمن المهدي إبراهيم يونس",AdminNumber:null,NationalNumber:"119930563247",MilitaryNumber:null,JobNumber:"8163115",EmployeeCategory:"مدني",PenaltyType:"إيقاف عن العمل",Reason:"تقاعس عن أداء العمل المكلف به وتأخير متكرر وعدم الجدية في العمل و مخالفة أوامر الرئيس المباشر و إفشاء أسرار العمل و عدم التقيد بالتعليمات و مخالفة اللوائح و القوانين المنظمة للعمل",PenaltyDate:"2026-10-15",DeductionDays:0,IsApplied:!1},{PenaltyID:3,FullName:"عبدالرحمن المهدي إبراهيم يونس",AdminNumber:null,NationalNumber:"119930563247",MilitaryNumber:null,JobNumber:"8163115",EmployeeCategory:"مدني",PenaltyType:"خصم مالي",Reason:"عدم الانضباط",PenaltyDate:"2026-10-03",DeductionDays:3,IsApplied:!1}];function O({member:n={},penalty:t={},qrCodeUrl:a="",customFields:o={}}){const d=t.MilitaryNumber||n.military_number||t.JobNumber||n.financial_number||n.job_number||n.national_id||"---",c=n.rank||t.EmployeeCategory||n.type||"غير محدد",g=t.FullName||n.name||"---",s=t.PenaltyDate||t.penalty_date||o.incidentDate||new Date().toISOString().slice(0,10),u=o.incidentLocation||"أوباري",f=o.charge||t.Reason||"غياب عن العمل",m=o.verdict||(t.PenaltyType?`${t.PenaltyType}${t.DeductionDays>0?` (${t.DeductionDays} أيام)`:""}`:"خصم مالي"),p=o.trialDate||"..... / ..... / 202 م",j=o.trialLocation||"مديرية أمن أوباري",x=o.approverName||"",v=o.approverRank||"",l=n.photo||localStorage.getItem(`ubari_officer_photo_${n.id}`)||"";return`
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
                  <img src="${I}" alt="شعار وزارة الداخلية" style="width: 58px; height: 58px; object-fit: contain; display: block;" />
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
                    ${l?`
                      <img src="${l}" alt="${g}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
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
              ${d}
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
              ${f}
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
  `}function Q({member:n,penalty:t,qrCodeUrl:a="",customFields:o={}}){const d=O({member:n,penalty:t,qrCodeUrl:a,customFields:o}),c=t?.FullName||n?.name||"المنتسب";M(d,`صحيفة اتهام - ${c}`)}function Z({member:n={},penalty:t=null,onClose:a}){if(!n&&!t)return null;const o=t?.FullName||n?.name||"---",d=t?.MilitaryNumber||n?.military_number||t?.JobNumber||n?.financial_number||n?.job_number||n?.national_id||"---",c=n?.rank||t?.EmployeeCategory||n?.type||"غير محدد",g=n?.photo||localStorage.getItem(`ubari_officer_photo_${n?.id}`)||"",[s,u]=r.useState(t?.PenaltyDate||t?.penalty_date||new Date().toISOString().slice(0,10)),[f,m]=r.useState("أوباري"),[p,j]=r.useState(t?.Reason||"غياب عن العمل"),[x,v]=r.useState(t?.PenaltyType?`${t.PenaltyType}${t.DeductionDays>0?` (${t.DeductionDays} أيام)`:""}`:"خصم مالي"),[l,D]=r.useState(""),[w,W]=r.useState("مديرية أمن أوباري"),[S,P]=r.useState(""),[z,$]=r.useState(""),[y,T]=r.useState(!1),[k,L]=r.useState(""),h=r.useRef(null),N=i=>{if(!i||!i.includes("-"))return i||"..... / ..... / 202 م";const[b,B,_]=i.split("-");return`${_} / ${B} / ${b} م`};r.useEffect(()=>{const i=`وزارة الداخلية - مديرية أمن أوباري
صحيفة اتهام للحالات الموجزة
المتهم: ${o}
الرقم: ${d}
التهمة: ${p}
الحكم: ${x}
التاريخ: ${s}`;E.toDataURL(i,{width:140,margin:1}).then(b=>L(b)).catch(b=>console.error("QR generation error:",b))},[o,d,p,x,s]);const A=()=>{Q({member:n,penalty:t||{FullName:o,MilitaryNumber:d,Reason:p,PenaltyType:x,PenaltyDate:s},qrCodeUrl:k,customFields:{incidentDate:s,incidentLocation:f,charge:p,verdict:x,trialDate:l?N(l):"..... / ..... / 202 م",trialLocation:w,approverName:S,approverRank:z}})};return e.jsx("div",{className:"moi-modal-overlay",style:{position:"fixed",inset:0,backgroundColor:"rgba(15, 23, 42, 0.75)",backdropFilter:"blur(5px)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",direction:"rtl",fontFamily:"'Cairo', sans-serif"},onClick:a,children:e.jsxs("div",{className:"moi-modal-container",style:{background:"#ffffff",borderRadius:"16px",width:"100%",maxWidth:"920px",maxHeight:"94vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.25)",border:"1.5px solid #cbd5e1",overflow:"hidden"},onClick:i=>i.stopPropagation(),children:[e.jsxs("div",{style:{background:"linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)",color:"#ffffff",padding:"14px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"2px solid #d4af37"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx("div",{style:{width:"38px",height:"38px",borderRadius:"10px",background:"rgba(239, 68, 68, 0.2)",border:"1px solid #ef4444",color:"#f87171",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(F,{size:20})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"16px",fontWeight:900},children:"صحيفة اتهام للحالات الموجزة"}),e.jsxs("div",{style:{fontSize:"11.5px",color:"#93c5fd",fontWeight:600},children:["المتهم: ",o," | الرقم: ",d," | مديرية أمن أوباري"]})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsxs("button",{type:"button",onClick:()=>T(!y),style:{background:y?"#f59e0b":"rgba(255, 255, 255, 0.12)",color:"#ffffff",border:"1px solid rgba(255, 255, 255, 0.25)",padding:"6px 14px",borderRadius:"8px",fontSize:"12px",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"},children:[e.jsx(R,{size:14}),e.jsx("span",{children:y?"معاينة الصحيفة":"تعديل البيانات"})]}),e.jsxs("button",{type:"button",onClick:A,style:{background:"linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",color:"#ffffff",border:"none",padding:"6px 16px",borderRadius:"8px",fontSize:"12.5px",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",boxShadow:"0 2px 8px rgba(185, 28, 28, 0.4)"},children:[e.jsx(C,{size:15}),e.jsx("span",{children:"طباعة الصحيفة (A4)"})]}),e.jsx("button",{type:"button",onClick:a,style:{background:"rgba(255, 255, 255, 0.1)",border:"none",color:"#ffffff",width:"32px",height:"32px",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},title:"إغلاق",children:e.jsx(J,{size:18})})]})]}),e.jsxs("div",{style:{overflowY:"auto",padding:"24px",flex:1,background:"#f8fafc"},children:[y&&e.jsxs("div",{style:{background:"#ffffff",border:"1.5px solid #bfdbfe",borderRadius:"12px",padding:"16px 20px",marginBottom:"20px",boxShadow:"0 2px 8px rgba(30, 58, 138, 0.06)"},children:[e.jsxs("div",{style:{fontSize:"13px",fontWeight:800,color:"#1e3a8a",marginBottom:"12px",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(R,{size:15}),e.jsx("span",{children:"تخصيص بنود ومحاكمة صحيفة الاتهام:"})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))",gap:"12px"},children:[e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"مكان الواقعة"}),e.jsx("input",{type:"text",value:f,onChange:i=>m(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"تاريخ الواقعة"}),e.jsx("input",{type:"date",value:s,onChange:i=>u(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"التهمة والمادة القانونية"}),e.jsx("input",{type:"text",value:p,onChange:i=>j(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"الحكم / الإجراء"}),e.jsx("input",{type:"text",value:x,onChange:i=>v(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"تاريخ المحاكمة"}),e.jsx("input",{type:"date",value:l,onChange:i=>D(i.target.value),style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"مكان المحاكمة"}),e.jsx("input",{type:"text",value:w,onChange:i=>W(i.target.value),placeholder:"....................",style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"اسم معتمد المحاكمة (اختياري)"}),e.jsx("input",{type:"text",value:S,onChange:i=>P(i.target.value),placeholder:"يترك فارغاً للنقط ...........",style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"11px",fontWeight:800,color:"#475569",marginBottom:"4px"},children:"رتبة معتمد المحاكمة (اختياري)"}),e.jsx("input",{type:"text",value:z,onChange:i=>$(i.target.value),placeholder:"يترك فارغاً للنقط ...........",style:{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"12.5px",fontWeight:700}})]})]})]}),e.jsxs("div",{className:"indictment-sheet-page orientation-landscape",style:{background:"#ffffff",border:"2px solid #94a3b8",borderRadius:"8px",padding:"24px 30px",boxShadow:"0 4px 15px rgba(0, 0, 0, 0.05)",color:"#0f172a",width:"100%",boxSizing:"border-box"},children:[e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",tableLayout:"fixed",marginBottom:"8px",direction:"rtl",border:"none"},children:[e.jsxs("colgroup",{children:[e.jsx("col",{style:{width:"31%"}}),e.jsx("col",{style:{width:"38%"}}),e.jsx("col",{style:{width:"31%"}})]}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{textAlign:"right",verticalAlign:"middle",padding:"0 4px",border:"none",overflow:"hidden"},children:e.jsx("table",{style:{borderCollapse:"collapse",border:"none",margin:0,direction:"rtl"},children:e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{verticalAlign:"middle",paddingLeft:"10px",border:"none"},children:e.jsx("img",{src:I,alt:"شعار وزارة الداخلية",style:{width:"56px",height:"56px",objectFit:"contain",display:"block"}})}),e.jsxs("td",{style:{verticalAlign:"middle",border:"none",textAlign:"right",whiteSpace:"nowrap"},children:[e.jsx("div",{style:{fontSize:"15px",fontWeight:900,color:"#1e3a8a",lineHeight:1.35,letterSpacing:"0.2px"},children:"وزارة الــداخــلــيــة"}),e.jsx("div",{style:{fontSize:"13.5px",fontWeight:800,color:"#0f172a",lineHeight:1.35},children:"مديرية أمن أوباري"})]})]})})})}),e.jsx("td",{style:{textAlign:"center",verticalAlign:"middle",padding:"0 4px",border:"none"},children:e.jsx("div",{style:{display:"inline-block",border:"2.5px solid #b91c1c",borderRadius:"10px",padding:"7px 22px",background:"#ffffff",boxShadow:"0 1px 4px rgba(185, 28, 28, 0.08)"},children:e.jsx("h2",{style:{margin:0,fontSize:"19px",fontWeight:900,color:"#b91c1c",letterSpacing:"0.5px",whiteSpace:"nowrap",lineHeight:1.25},children:"صحـيـفـة اتـهـام لـلـحـالات الـمـوجـزة"})})}),e.jsx("td",{style:{textAlign:"left",verticalAlign:"middle",padding:"0 4px",border:"none"},children:e.jsx("table",{style:{borderCollapse:"collapse",border:"none",marginRight:"auto",marginLeft:0,direction:"ltr"},children:e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{verticalAlign:"middle",paddingRight:"12px",border:"none"},children:e.jsx("div",{style:{width:"76px",height:"96px",border:"1.5px solid #d97706",borderRadius:"6px",background:"#fafafa",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"},children:g?e.jsx("img",{src:g,alt:o,style:{width:"100%",height:"100%",objectFit:"cover",display:"block"}}):e.jsx("span",{style:{color:"#94a3b8",fontSize:"13.5px",fontWeight:800},children:"صورة"})})}),e.jsx("td",{style:{verticalAlign:"middle",border:"none"},children:k?e.jsx("div",{style:{width:"72px",height:"72px",padding:"2px",border:"1px solid #cbd5e1",borderRadius:"6px",background:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("img",{src:k,alt:"QR Code",style:{width:"100%",height:"100%",objectFit:"contain",display:"block"}})}):e.jsx("div",{style:{width:"72px",height:"72px",border:"1px dashed #cbd5e1",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"#94a3b8"},children:"QR"})})]})})})})]})})]}),e.jsx("div",{style:{borderTop:"3px double #000000",margin:"10px 0 20px 0"}}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:"1.5px solid #000000",marginBottom:"45px",tableLayout:"fixed"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"#cbd5e1",color:"#0f172a"},children:[e.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 4px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"12%"},children:"الرقم"}),e.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 4px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"14%"},children:"الرتبة / الصفة"}),e.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 6px",fontSize:"14px",fontWeight:900,textAlign:"center",width:"24%"},children:"اسم المتهم"}),e.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 4px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"18%"},children:"تاريخ ومكان الواقعة"}),e.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 6px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"18%"},children:"التهمة والمادة القانونية"}),e.jsx("th",{style:{border:"1.5px solid #000000",padding:"9px 4px",fontSize:"13px",fontWeight:900,textAlign:"center",width:"14%"},children:"الحكم / الإجراء"})]})}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 6px",textAlign:"center",fontSize:"14px",fontWeight:900,fontFamily:"monospace"},children:d}),e.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 6px",textAlign:"center",fontSize:"13px",fontWeight:800},children:c}),e.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 8px",textAlign:"center",fontSize:"15.5px",fontWeight:900,color:"#dc2626"},children:o}),e.jsxs("td",{style:{border:"1.5px solid #000000",padding:"20px 6px",textAlign:"center",fontSize:"13px",fontWeight:700},children:[f," - ",s]}),e.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 8px",textAlign:"center",fontSize:"13px",fontWeight:800,color:"#334155"},children:p}),e.jsx("td",{style:{border:"1.5px solid #000000",padding:"20px 6px",textAlign:"center",fontSize:"13.5px",fontWeight:900,color:"#0f172a"},children:x})]})})]}),e.jsx("table",{style:{width:"100%",borderCollapse:"collapse",marginTop:"25px",tableLayout:"fixed",border:"none"},children:e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{style:{verticalAlign:"bottom",width:"50%",textAlign:"right",paddingRight:"15px",border:"none"},children:e.jsxs("div",{style:{display:"inline-block",textAlign:"right",lineHeight:"2.1",fontSize:"13.5px",fontWeight:800,color:"#0f172a"},children:[e.jsx("div",{style:{fontSize:"15px",fontWeight:900,color:"#000000",textDecoration:"underline",marginBottom:"2px"},children:"اعتماد المحاكمة"}),e.jsxs("div",{children:["الاسم : ",S||"........................................"]}),e.jsxs("div",{children:["الرتبة : ",z||"........................................"]}),e.jsx("div",{children:"التوقيع : ........................................"})]})}),e.jsx("td",{style:{verticalAlign:"bottom",width:"50%",textAlign:"left",paddingLeft:"15px",border:"none"},children:e.jsx("table",{style:{borderCollapse:"collapse",border:"1.5px solid #000000",width:"300px",fontSize:"12.5px",marginRight:"auto",marginLeft:0},children:e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{style:{border:"1.5px solid #000000",padding:"7px 10px",background:"#f8fafc",fontWeight:800,width:"42%",textAlign:"center"},children:"تاريخ المحاكمة"}),e.jsx("td",{onClick:()=>{if(h.current)try{h.current.showPicker()}catch{h.current.focus(),h.current.click()}},style:{border:"1.5px solid #000000",padding:"7px 10px",textAlign:"center",fontWeight:700,cursor:"pointer",position:"relative"},title:"انقر لاختيار تاريخ المحاكمة من التقويم",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},children:[e.jsx("span",{style:{direction:"ltr",fontWeight:800,color:l?"#0f172a":"#64748b"},children:l?N(l):"..... / ..... / 202 م"}),e.jsx(H,{size:14,color:"#1e3a8a"}),e.jsx("input",{ref:h,type:"date",value:l,onChange:i=>D(i.target.value),style:{position:"absolute",opacity:0,width:"100%",height:"100%",inset:0,cursor:"pointer"}})]})})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{border:"1.5px solid #000000",padding:"7px 10px",background:"#f8fafc",fontWeight:800,textAlign:"center"},children:"مكان المحاكمة"}),e.jsx("td",{style:{border:"1.5px solid #000000",padding:"7px 10px",textAlign:"center",fontWeight:700},children:w})]})]})})})]})})})]})]}),e.jsxs("div",{style:{padding:"12px 24px",background:"#ffffff",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx("div",{style:{fontSize:"12px",color:"#64748b",fontWeight:700},children:"معتمدة رسمياً وفق نموذج صحائف الاتهام للحالات الموجزة - وزارة الداخلية دولة ليبيا"}),e.jsxs("div",{style:{display:"flex",gap:"10px"},children:[e.jsxs("button",{type:"button",onClick:A,style:{background:"#b91c1c",color:"#ffffff",border:"none",padding:"8px 18px",borderRadius:"8px",fontSize:"13px",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(C,{size:15}),e.jsx("span",{children:"طباعة المستند الرسمي"})]}),e.jsx("button",{type:"button",onClick:a,style:{background:"#f1f5f9",color:"#334155",border:"1px solid #cbd5e1",padding:"8px 18px",borderRadius:"8px",fontSize:"13px",fontWeight:800,cursor:"pointer"},children:"إغلاق"})]})]})]})})}export{Z as I,Y as i};
