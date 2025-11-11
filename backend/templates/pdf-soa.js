/**
 * Template PDF: Statement of Applicability (SoA)
 *
 * Statement of Applicability - ISO 27001
 */

const { getBaseTemplate } = require('./pdf-base');

const generateSoA = (data) => {
  const {
    controls = [],
    framework = 'ISO/IEC 27001:2022',
    organizationName = 'Organization',
    scope = 'All IT systems and processes'
  } = data;

  const implemented = controls.filter(c => c.implementation_status === 'implemented').length;
  const partiallyImplemented = controls.filter(c => c.implementation_status === 'partially_implemented').length;
  const notImplemented = controls.filter(c => c.implementation_status === 'not_implemented').length;
  const notApplicable = controls.filter(c => c.implementation_status === 'not_applicable').length;

  const content = `
    <div class="title">Statement of Applicability</div>
    <div class="subtitle">Statement of Applicability - ${framework}</div>

    <!-- Organization Info -->
    <div class="section">
      <table style="font-size: 10pt;">
        <tr>
          <td style="width: 25%; font-weight: 600;">Organization:</td>
          <td>${organizationName}</td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Framework:</td>
          <td>${framework}</td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Scope:</td>
          <td>${scope}</td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Issue Date:</td>
          <td>${new Date().toLocaleDateString('pt-BR')}</td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Next Review:</td>
          <td>${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('pt-BR')}</td>
        </tr>
      </table>
    </div>

    <!-- Summary Stats -->
    <div class="section">
      <div class="section-title">Implementation Summary</div>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value" style="color: #28a745;">${implemented}</div>
          <div class="stat-label">Implemented</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: #ffc107;">${partiallyImplemented}</div>
          <div class="stat-label">Partially</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: #dc3545;">${notImplemented}</div>
          <div class="stat-label">Not Implemented</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: #6c757d;">${notApplicable}</div>
          <div class="stat-label">N/A</div>
        </div>
      </div>
    </div>

    <!-- Controls List -->
    <div class="section">
      <div class="section-title">2. Applicable Controls</div>
      <table style="font-size: 9pt;">
        <thead>
          <tr>
            <th style="width: 15%;">Control</th>
            <th style="width: 30%;">Name</th>
            <th style="width: 15%;">Category</th>
            <th style="text-align: center; width: 15%;">Status</th>
            <th style="text-align: center; width: 10%;">Efetividade</th>
            <th style="width: 15%;">Next Test</th>
          </tr>
        </thead>
        <tbody>
          ${controls.length > 0 ? controls.map(control => `
            <tr>
              <td><strong>${control.name}</strong></td>
              <td>${control.description ? control.description.substring(0, 100) + (control.description.length > 100 ? '...' : '') : 'N/A'}</td>
              <td>${control.category || 'N/A'}</td>
              <td style="text-align: center;">
                <span class="badge badge-${
                  control.implementation_status === 'implemented' ? 'success' : 
                  control.implementation_status === 'partially_implemented' ? 'medium' : 
                  control.implementation_status === 'not_implemented' ? 'high' : 'low'
                }">
                  ${control.implementation_status === 'implemented' ? 'Implemented' : 
                    control.implementation_status === 'partially_implemented' ? 'Partial' : 
                    control.implementation_status === 'not_implemented' ? 'Not Impl.' : 'N/A'}
                </span>
              </td>
              <td style="text-align: center;">
                ${control.effectiveness ? `<strong>${control.effectiveness}%</strong>` : 'N/A'}
              </td>
              <td style="text-align: center; font-size: 8pt;">
                ${control.next_test_date ? new Date(control.next_test_date).toLocaleDateString('en-US') : 'N/A'}
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="6" style="text-align: center; padding: 30px;">
                <em>No controls registered</em>
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <!-- Detailed Controls (only implemented) -->
    ${controls.filter(c => c.implementation_status === 'implemented').length > 0 ? `
      <div class="page-break"></div>
      <div class="section">
        <div class="section-title">3. Implemented Control Details</div>
        ${controls.filter(c => c.implementation_status === 'implemented').map((control, index) => `
          <div class="no-break" style="margin-bottom: 20px;">
            <div class="section-subtitle">${control.name}</div>
            <table style="font-size: 9pt;">
              <tr>
                <td style="width: 25%; font-weight: 600;">Category:</td>
                <td>${control.category || 'N/A'}</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Status:</td>
                <td><span class="badge badge-success">Implemented</span></td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Effectiveness:</td>
                <td><strong>${control.effectiveness || 0}%</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Description:</td>
                <td>${control.description || 'N/A'}</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Last Test:</td>
                <td>${control.last_test_date ? new Date(control.last_test_date).toLocaleDateString('en-US') : 'N/A'}</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Next Test:</td>
                <td>${control.next_test_date ? new Date(control.next_test_date).toLocaleDateString('en-US') : 'N/A'}</td>
              </tr>
            </table>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Justification for Non-Implemented -->
    ${controls.filter(c => c.implementation_status === 'not_implemented' || c.implementation_status === 'not_applicable').length > 0 ? `
      <div class="page-break"></div>
      <div class="section">
        <div class="section-title">4. Justifications - Non-Implemented / Not Applicable Controls</div>
        <table style="font-size: 9pt;">
          <thead>
            <tr>
              <th style="width: 20%;">Control</th>
              <th style="width: 20%;">Status</th>
              <th>Justification / Plan</th>
            </tr>
          </thead>
          <tbody>
            ${controls.filter(c => c.implementation_status === 'not_implemented' || c.implementation_status === 'not_applicable').map(control => `
              <tr>
                <td><strong>${control.name}</strong></td>
                <td>
                  <span class="badge badge-${control.implementation_status === 'not_applicable' ? 'low' : 'high'}">
                    ${control.implementation_status === 'not_applicable' ? 'N/A' : 'Not Implemented'}
                  </span>
                </td>
                <td>
                  ${control.implementation_status === 'not_applicable' 
                    ? 'Control not applicable to the organization’s current scope' 
                    : 'Planned for implementation in the next phase (within 6 months)'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    <!-- Approval -->
    <div class="section" style="margin-top: 50px;">
      <div class="section-title">Approvals</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 30px;">
        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <strong>CISO</strong><br>
          <small>Chief Information Security Officer</small><br>
          <small>Date: _____/_____/_______</small>
        </div>
        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <strong>CEO / Executive Director</strong><br>
          <small>Final Approval</small><br>
          <small>Date: _____/_____/_______</small>
        </div>
      </div>
    </div>
  `;

  return getBaseTemplate(content, 'Statement of Applicability');
};

module.exports = { generateSoA };


