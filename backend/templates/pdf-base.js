/**
 * Template Base para PDFs
 * 
 * Estrutura HTML comum a todos os relatórios
 */

const getBaseTemplate = (content, title = 'Relatório') => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - n360</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a1a1a;
      background: white;
      font-size: 11pt;
      line-height: 1.6;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 3px solid #00ADE8;
      margin-bottom: 30px;
    }

    .logo {
      font-size: 28pt;
      font-weight: 500;
      color: #1a1a1a;
    }

    .logo-dot {
      color: #00ADE8;
    }

    .header-info {
      text-align: right;
      font-size: 9pt;
      color: #666;
    }

    .header-info strong {
      color: #1a1a1a;
      display: block;
      margin-bottom: 4px;
    }

    /* Title */
    .title {
      font-size: 24pt;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 12pt;
      color: #666;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
    }

    /* Content */
    .content {
      margin-bottom: 50px;
    }

    /* Section */
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 16pt;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #00ADE8;
    }

    .section-subtitle {
      font-size: 12pt;
      font-weight: 600;
      color: #333;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10pt;
    }

    th {
      background: #f5f5f5;
      color: #1a1a1a;
      font-weight: 600;
      text-align: left;
      padding: 12px;
      border-bottom: 2px solid #00ADE8;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover {
      background: #f9f9f9;
    }

    /* Stats Box */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
    }

    .stat-box {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }

    .stat-value {
      font-size: 24pt;
      font-weight: 700;
      color: #00ADE8;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 9pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-critical {
      background: #fee;
      color: #c00;
    }

    .badge-high {
      background: #ffe5e5;
      color: #d63031;
    }

    .badge-medium {
      background: #fff3cd;
      color: #856404;
    }

    .badge-low {
      background: #d1ecf1;
      color: #0c5460;
    }

    .badge-success {
      background: #d4edda;
      color: #155724;
    }

    .badge-info {
      background: #d1ecf1;
      color: #0c5460;
    }

    /* Footer */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 15px 0;
      border-top: 1px solid #e0e0e0;
      font-size: 8pt;
      color: #999;
      text-align: center;
      background: white;
    }

    .footer-left {
      float: left;
    }

    .footer-center {
      display: inline-block;
    }

    .footer-right {
      float: right;
    }

    /* Page break control */
    .page-break {
      page-break-after: always;
    }

    .no-break {
      page-break-inside: avoid;
    }

    /* Lists */
    ul, ol {
      margin: 10px 0 10px 25px;
    }

    li {
      margin: 5px 0;
    }

    /* Highlight */
    .highlight {
      background: #fff3cd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin: 15px 0;
    }

    .info-box {
      background: #d1ecf1;
      padding: 15px;
      border-left: 4px solid #00ADE8;
      margin: 15px 0;
    }

    .warning-box {
      background: #fff3cd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin: 15px 0;
    }

    .danger-box {
      background: #f8d7da;
      padding: 15px;
      border-left: 4px solid #dc3545;
      margin: 15px 0;
    }

    /* Print styles */
    @media print {
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="logo">
      ness<span class="logo-dot">.</span>
    </div>
    <div class="header-info">
      <strong>n360 Security Platform</strong>
      <div>Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
      <div>Documento: ${title}</div>
    </div>
  </div>

  <!-- Content -->
  <div class="content">
    ${content}
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">Confidencial - ness.</div>
    <div class="footer-center">n360 Security Platform</div>
    <div class="footer-right">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>
  </div>

  <script>
    // Número de página (Puppeteer injeta automaticamente)
    const pageNumber = document.querySelector('.pageNumber');
    const totalPages = document.querySelector('.totalPages');
    if (pageNumber) pageNumber.textContent = new URLSearchParams(window.location.search).get('pageNumber') || '1';
    if (totalPages) totalPages.textContent = new URLSearchParams(window.location.search).get('totalPages') || '1';
  </script>
</body>
</html>
`;

module.exports = { getBaseTemplate };


