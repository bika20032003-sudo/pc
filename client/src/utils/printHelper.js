// Isolated 1-Page Iframe Printing Engine
// Renders documents in a dedicated, isolated off-screen frame
// Completely decouples print rendering from main app DOM (#root, tables, sidebars)
// Prevents browser multi-page spill, ghost margins, or blank page bugs.

import { MOI_LOGO_BASE64 } from './logoBase64.js';

export const printDocumentInIframe = (contentHtml, documentTitle = 'وثيقة رسمية') => {
  try {
    const existing = document.getElementById('moi-print-isolated-iframe');
    if (existing) {
      existing.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'moi-print-isolated-iframe';
    // Position within viewport bounds so Chromium rasterizes and executes print properly, but keep completely invisible
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '10px';
    iframe.style.height = '10px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';
    iframe.style.opacity = '0.01';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    // Compute robust base href matching current path (handles /pc/ on GitHub Pages and / on localhost)
    let baseHref = './';
    if (typeof window !== 'undefined' && window.location) {
      const urlWithoutQuery = window.location.href.split('#')[0].split('?')[0];
      baseHref = urlWithoutQuery.endsWith('/')
        ? urlWithoutQuery
        : urlWithoutQuery.substring(0, urlWithoutQuery.lastIndexOf('/') + 1);
    }

    // Replace any relative or broken logo references with direct Base64 Data URI
    // This guarantees 100% reliable logo display across localhost, GitHub Pages (/pc/), and offline printing
    let sanitizedHtml = contentHtml;
    if (sanitizedHtml.includes('moi-logo.png')) {
      sanitizedHtml = sanitizedHtml.replace(/src=["'][^"']*moi-logo\.png[^"']*["']/gi, `src="${MOI_LOGO_BASE64}"`);
    }

    // Collect all stylesheets and style tags from current document to preserve design fidelity
    const parentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <base href="${baseHref}" />
        <title>${documentTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        ${parentStyles}
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
            size: ${contentHtml && (contentHtml.includes('size: A4 landscape') || contentHtml.includes('printable-force-roster') || contentHtml.includes('orientation-landscape') || contentHtml.includes('indictment-sheet-page')) ? 'A4 landscape' : 'A4 portrait'};
            margin: ${contentHtml && (contentHtml.includes('size: A4 landscape') || contentHtml.includes('printable-force-roster') || contentHtml.includes('orientation-landscape') || contentHtml.includes('indictment-sheet-page')) ? '6mm 8mm' : '10mm 12mm'};
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
          .official-a4-letter-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 186mm !important;
            min-height: auto !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
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
            letter-spacing: 0.5px !important;
            line-height: 1.25 !important;
          }
          .title-dir-ar {
            font-size: 15.5px !important;
            font-weight: 700 !important;
            color: #000000 !important;
            margin: 3px 0 0 0 !important;
            line-height: 1.25 !important;
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
            line-height: 1.8 !important;
            font-size: 15px !important;
            flex: 1 1 auto !important;
          }
          .body-main-clause {
            white-space: pre-line !important;
          }
          .body-prayer-line {
            font-size: 15px !important;
            font-weight: 700 !important;
            margin-top: 12px !important;
            margin-bottom: 0 !important;
          }
          /* Signature Block: Placed strictly on the LEFT in Libyan letters */
          .a4-signature-block {
            display: flex !important;
            flex-direction: row !important;
            justify-content: flex-end !important;
            width: 100% !important;
            margin-top: auto !important;
            margin-bottom: 10px !important;
            box-sizing: border-box !important;
          }
          .sig-inner {
            text-align: center !important;
            min-width: 240px !important;
            max-width: 300px !important;
            margin-right: auto !important;
            margin-left: 20px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
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
            width: 74px !important;
            height: 74px !important;
            border: 1.5px dashed #1e3a8a !important;
            border-radius: 50% !important;
            margin: 2px auto 0 auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
          }
          .stamp-inner-text {
            font-size: 8.5px !important;
            font-weight: 800 !important;
            color: #1e3a8a !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            line-height: 1.3 !important;
            text-align: center !important;
          }
          .a4-cc-distribution-block {
            margin-top: 6px !important;
            margin-bottom: 6px !important;
            border-right: 3px solid #d4af37 !important;
            padding-right: 10px !important;
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
        ${sanitizedHtml}
      </body>
      </html>
    `);
    doc.close();

    let printed = false;
    const trigger = () => {
      if (printed) return;
      printed = true;
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.warn('Iframe print error, attempting popup print fallback:', err);
        try {
          const win = window.open('', '_blank');
          if (win) {
            win.document.write(doc.documentElement.outerHTML);
            win.document.close();
            win.focus();
            setTimeout(() => {
              win.print();
              win.close();
            }, 300);
          } else {
            window.print();
          }
        } catch (e2) {
          window.print();
        }
      } finally {
        setTimeout(() => {
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 8000);
      }
    };

    // Trigger print after iframe renders
    iframe.onload = () => {
      setTimeout(trigger, 150);
    };
    setTimeout(trigger, 400);
  } catch (err) {
    console.error('Iframe creation error:', err);
  }
};
