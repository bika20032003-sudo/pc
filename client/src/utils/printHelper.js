// Isolated 1-Page Iframe Printing Engine
// Renders documents in a dedicated, isolated off-screen frame
// Completely decouples print rendering from main app DOM (#root, tables, sidebars)
// Prevents browser multi-page spill, ghost margins, or blank page bugs.

export const printDocumentInIframe = (contentHtml, documentTitle = 'وثيقة رسمية') => {
  try {
    const existing = document.getElementById('moi-print-isolated-iframe');
    if (existing) {
      existing.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'moi-print-isolated-iframe';
    // Must NOT use visibility: hidden, display: none, or 0x0 size!
    // Off-screen layout allows the browser engine to fully layout vector graphics, fonts and CSS colors.
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    iframe.style.top = '-10000px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';
    iframe.style.opacity = '1';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

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
        <base href="${window.location.origin}/" />
        <title>${documentTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        ${parentStyles}
        <style>
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
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
            max-width: 195mm !important;
          }
        </style>
      </head>
      <body>
        ${contentHtml}
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
        console.error('Print execution error:', err);
      } finally {
        setTimeout(() => {
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 5000);
      }
    };

    // Allow images & fonts to decode and rasterize
    setTimeout(trigger, 400);
  } catch (err) {
    console.error('Iframe creation error:', err);
  }
};
