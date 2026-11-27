import{M as b}from"./index-GUrKJVqk.js";const x=(i,c="وثيقة رسمية")=>{try{const n=document.getElementById("moi-print-isolated-iframe");n&&n.remove();const t=document.createElement("iframe");t.id="moi-print-isolated-iframe",t.style.position="fixed",t.style.right="0",t.style.bottom="0",t.style.width="10px",t.style.height="10px",t.style.border="none",t.style.zIndex="-9999",t.style.opacity="0.01",t.style.pointerEvents="none",document.body.appendChild(t);let m="./";if(typeof window<"u"&&window.location){const o=window.location.href.split("#")[0].split("?")[0];m=o.endsWith("/")?o:o.substring(0,o.lastIndexOf("/")+1)}let p=i;p.includes("moi-logo.png")&&(p=p.replace(/src=["'][^"']*moi-logo\.png[^"']*["']/gi,`src="${b}"`));const f=Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(o=>o.outerHTML).join(`
`),r=t.contentWindow.document;r.open(),r.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <base href="${m}" />
        <title>${c}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800;900&family=Noto+Naskh+Arabic:wght@400;600;700&family=Scheherazade+New:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
        ${f}
        <style>
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body, body * {
            visibility: visible !important;
          }
          table, tbody, #printable-force-roster, .printable-force-roster-sheet, .printable-roster-container {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          .printable-force-roster,
          .printable-roster-container {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .roster-sovereign-header {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .roster-data-table {
            page-break-before: avoid !important;
            break-before: avoid !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
          .roster-data-table tbody {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
          .roster-data-table tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .roster-data-table thead {
            display: table-header-group !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .roster-data-table tfoot {
            display: table-footer-group !important;
          }
          @page {
            size: ${i&&(i.includes("size: A4 landscape")||i.includes("printable-force-roster")||i.includes("orientation-landscape")||i.includes("indictment-sheet-page"))?"A4 landscape":"A4 portrait"};
            margin: ${i&&(i.includes("size: A4 landscape")||i.includes("printable-force-roster")||i.includes("orientation-landscape")||i.includes("indictment-sheet-page"))?"6mm 8mm":"10mm 12mm"};
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Cairo', 'Amiri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            direction: rtl !important;
            overflow: visible !important;
            height: auto !important;
          }
          .sheet-container {
            width: 100%;
            max-width: 520px;
            margin: 0 auto;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #official-letter-to-print,
          #official-template-to-print,
          .official-a4-letter-sheet {
            position: relative !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 186mm !important;
            min-height: 273mm !important;
            height: auto !important;
            padding: 3mm 5mm !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: flex !important;
            flex-direction: column !important;
            direction: rtl !important;
          }
          /* Leaves Section Forms: Form ن ش 1/99 & Exit Permit (Strict 1-page A4) */
          #official-leave-form-99,
          .official-leave-form-sheet {
            display: block !important;
            width: 100% !important;
            max-width: 186mm !important;
            min-height: auto !important;
            max-height: 275mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            position: relative !important;
            direction: rtl !important;
            font-family: 'Cairo', Arial, sans-serif !important;
            font-size: 13px !important;
            line-height: 1.8 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #official-leave-form-99 table,
          .official-leave-form-sheet table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #moi-exit-permit-to-print,
          .official-exit-permit-sheet {
            display: block !important;
            width: 100% !important;
            max-width: 186mm !important;
            min-height: auto !important;
            max-height: 275mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            position: relative !important;
            direction: rtl !important;
            font-family: 'Cairo', Arial, sans-serif !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #moi-exit-permit-to-print table,
          .official-exit-permit-sheet table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border-collapse: collapse !important;
          }
          #moi-exit-permit-to-print td,
          .official-exit-permit-sheet td {
            font-family: 'Cairo', Arial, sans-serif !important;
          }
          /* Indictment Sheet (Strict 1-Page A4 Landscape) */
          .indictment-sheet-page {
            display: block !important;
            width: 100% !important;
            max-width: 280mm !important;
            margin: 0 auto !important;
            padding: 6mm 10mm !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            position: relative !important;
            direction: rtl !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .indictment-sheet-page table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* 3-Column Sovereign Official Header (Right Arabic, Center Logo, Left English) */
          .a4-letter-header {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            margin-bottom: 12px !important;
            box-sizing: border-box !important;
          }
          .header-lang-right {
            text-align: right !important;
            flex: 1 1 0% !important;
          }
          .title-moi-ar {
            font-size: 19px !important;
            font-weight: 800 !important;
            color: #000000 !important;
            margin: 0 !important;
            letter-spacing: 0 !important;
            line-height: 1.3 !important;
          }
          .title-dir-ar {
            font-size: 15.5px !important;
            font-weight: 700 !important;
            color: #000000 !important;
            margin: 3px 0 0 0 !important;
            letter-spacing: 0 !important;
            line-height: 1.3 !important;
          }
          .header-emblem-center {
            width: 80px !important;
            text-align: center !important;
            flex-shrink: 0 !important;
            margin: 0 10px !important;
          }
          .emblem-img {
            width: 66px !important;
            height: 66px !important;
            object-fit: contain !important;
            display: block !important;
            margin: 0 auto !important;
          }
          .header-lang-left {
            text-align: left !important;
            direction: ltr !important;
            flex: 1 1 0% !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
          .title-moi-en {
            font-size: 14px !important;
            font-weight: 800 !important;
            color: #000000 !important;
            margin: 0 !important;
            line-height: 1.25 !important;
          }
          .title-dir-en {
            font-size: 12px !important;
            font-weight: 700 !important;
            color: #000000 !important;
            margin: 2px 0 0 0 !important;
            line-height: 1.25 !important;
          }
          /* Metadata Table & QR Code Row */
          .a4-metadata-qr-row {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            margin-bottom: 14px !important;
            box-sizing: border-box !important;
          }
          .official-meta-table-box {
            border: 1px solid #94a3b8 !important;
            border-radius: 6px !important;
            background: #f8fafc !important;
            overflow: hidden !important;
            min-width: 320px !important;
            flex: 0 0 auto !important;
          }
          .meta-row {
            display: flex !important;
            flex-direction: row !important;
            border-bottom: 1px solid #cbd5e1 !important;
          }
          .meta-row:last-child {
            border-bottom: none !important;
          }
          .meta-cell {
            flex: 1 1 0% !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 5px 12px !important;
            font-size: 13px !important;
            border-left: 1px solid #cbd5e1 !important;
            white-space: nowrap !important;
          }
          .meta-cell:last-child {
            border-left: none !important;
          }
          .meta-lbl {
            font-weight: 700 !important;
            color: #334155 !important;
            margin-left: 6px !important;
          }
          .meta-val {
            font-weight: 800 !important;
            color: #000000 !important;
            font-family: Arial, sans-serif !important;
            direction: ltr !important;
          }
          .qr-code-box {
            width: 90px !important;
            height: 90px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 4px !important;
            padding: 2px !important;
            background: #ffffff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
          }
          .qr-img {
            width: 86px !important;
            height: 86px !important;
            display: block !important;
          }
          /* Subject Box */
          .a4-subject-bordered-box {
            border: 1.5px solid #d4af37 !important;
            border-radius: 6px !important;
            padding: 7px 16px !important;
            background: #fffdfa !important;
            margin-bottom: 12px !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 10px !important;
          }
          .subject-title-lbl {
            font-size: 15px !important;
            font-weight: 800 !important;
            color: #000000 !important;
            white-space: nowrap !important;
          }
          .subject-title-content {
            font-size: 15px !important;
            font-weight: 700 !important;
            color: #000000 !important;
            flex: 1 1 0% !important;
          }
          .a4-reference-subline {
            font-size: 14px !important;
            font-weight: 700 !important;
            color: #000000 !important;
            margin-bottom: 14px !important;
          }
          .a4-recipient-headline {
            text-align: center !important;
            margin-bottom: 14px !important;
          }
          .a4-recipient-headline h3 {
            font-size: 19px !important;
            font-weight: 800 !important;
            color: #000000 !important;
            margin: 0 !important;
          }
          .a4-greetings-section {
            margin-bottom: 14px !important;
          }
          .greeting-line-1 {
            font-size: 16px !important;
            font-weight: 700 !important;
            margin: 0 0 4px 0 !important;
          }
          .greeting-line-2 {
            font-size: 15px !important;
            font-weight: 700 !important;
            margin: 0 !important;
            line-height: 1.5 !important;
          }
          .a4-body-content {
            margin-bottom: 18px !important;
            line-height: 1.85 !important;
            font-size: 15.5px !important;
            flex: 0 0 auto !important;
          }
          .body-main-clause {
            white-space: pre-line !important;
          }
          .body-prayer-line {
            font-size: 15px !important;
            font-weight: 700 !important;
            margin-top: 14px !important;
            margin-bottom: 0 !important;
          }
          /* Signature Block: Anchored cleanly below body closing, aligned per sig_position */
          .a4-signature-block {
            display: flex !important;
            flex-direction: row !important;
            justify-content: flex-end !important;
            width: 100% !important;
            margin-top: 22px !important;
            margin-bottom: 16px !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .a4-signature-block.pos-center {
            justify-content: center !important;
          }
          .a4-signature-block.pos-right {
            justify-content: flex-start !important;
          }
          .sig-inner {
            text-align: center !important;
            min-width: 220px !important;
            max-width: 340px !important;
            margin-right: auto !important;
            margin-left: 14px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 8px !important;
          }
          .a4-signature-block.pos-center .sig-inner {
            margin-right: auto !important;
            margin-left: auto !important;
          }
          .a4-signature-block.pos-right .sig-inner {
            margin-right: 14px !important;
            margin-left: auto !important;
          }
          .sig-inner.layout-side {
            flex-direction: row !important;
            gap: 16px !important;
          }
          .sig-officer-name {
            font-size: 16px !important;
            font-weight: 800 !important;
            margin: 0 0 2px 0 !important;
            color: #000000 !important;
            white-space: nowrap !important;
          }
          .sig-officer-rank {
            font-size: 14px !important;
            font-weight: 700 !important;
            margin: 0 0 5px 0 !important;
            color: #000000 !important;
            white-space: nowrap !important;
          }
          .official-stamp-seal-circle {
            width: 76px !important;
            height: 76px !important;
            border: 1.5px dashed #1e3a8a !important;
            border-radius: 50% !important;
            margin: 2px auto 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
            text-align: center !important;
          }
          .stamp-inner-text,
          .stamp-top-arc,
          .stamp-center-title,
          .stamp-sub-title {
            font-size: 8.5px !important;
            font-weight: 800 !important;
            color: #1e3a8a !important;
            line-height: 1.25 !important;
            text-align: center !important;
          }
          .stamp-inner-text {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .stamp-sub-title {
            color: #b91c1c !important;
            font-size: 7.5px !important;
          }
          .a4-cc-distribution-block {
            margin-top: auto !important;
            margin-bottom: 8px !important;
            border-right: 3px solid #d4af37 !important;
            padding-right: 10px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .cc-header {
            font-size: 12px !important;
            font-weight: 800 !important;
            color: #000000 !important;
            margin-bottom: 3px !important;
            text-decoration: underline !important;
          }
          .cc-grid-2cols {
            display: flex !important;
            flex-direction: row !important;
            gap: 20px !important;
          }
          .cc-col {
            list-style: none !important;
            padding: 0 !important;
            margin: 0 !important;
            font-size: 11px !important;
            color: #334155 !important;
          }
          .cc-col li {
            margin-bottom: 2px !important;
          }
          .a4-letter-footer {
            margin-top: auto !important;
            width: 100% !important;
            font-size: 11px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .a4-cc-distribution-block + .a4-letter-footer {
            margin-top: 6px !important;
          }
          .footer-solid-divider {
            height: 1px !important;
            background: #cbd5e1 !important;
            margin-bottom: 5px !important;
          }
          .footer-details-row {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            color: #64748b !important;
          }
          /* Ensure emblems and stamps render at top quality */
          img {
            max-width: 100%;
            image-rendering: -webkit-optimize-contrast;
          }
          /* Force all print elements to be 100% visible inside isolated print iframe */
          body, body * {
            visibility: visible !important;
          }
        </style>
      </head>
      <body>
        ${p}
      </body>
      </html>
    `),r.close();let l=!1;const g=()=>{if(!l){l=!0;try{t.contentWindow.focus(),t.contentWindow.print()}catch(o){console.warn("Iframe print error, attempting popup print fallback:",o);try{const a=window.open("","_blank");a?(a.document.write(r.documentElement.outerHTML),a.document.close(),a.focus(),setTimeout(()=>{a.print(),a.close()},300)):window.print()}catch{window.print()}}finally{setTimeout(()=>{t&&t.parentNode&&t.parentNode.removeChild(t)},8e3)}}},s=async()=>{try{const o=Array.from(r.querySelectorAll("img")).map(e=>e.complete?Promise.resolve():new Promise(d=>{e.addEventListener("load",d,{once:!0}),e.addEventListener("error",d,{once:!0})})),a=r.fonts&&r.fonts.ready?r.fonts.ready.catch(()=>{}):Promise.resolve();await Promise.race([Promise.all([a,...o]),new Promise(e=>setTimeout(e,650))])}catch{}g()};t.onload=()=>{setTimeout(s,80)},setTimeout(s,500)}catch(n){console.error("Iframe creation error:",n)}};export{x as p};
