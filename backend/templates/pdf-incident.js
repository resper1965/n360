/**
 * Template PDF: Incident Report
 *
 * Incident report with CAPA
 */

const { getBaseTemplate } = require('./pdf-base');

const generateIncidentReport = (incident) => {
  const {
    id,
    description,
    severity,
    status,
    detected_at,
    resolved_at,
    affected_assets,
    root_cause,
    impact_description,
    corrective_actions = [],
    preventive_actions = [],
    created_at
  } = incident;

  const content = `
    <div class="title">Incident Report</div>
    <div class="subtitle">Security Incident Report #${id}</div>

    <!-- Incident Overview -->
    <div class="section">
      <div class="section-title">1. Incident Information</div>
      <table>
        <tr>
          <td style="width: 25%; font-weight: 600;">ID do Incidente:</td>
          <td><strong>#${id}</strong></td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Description:</td>
          <td>${description || 'N/A'}</td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Severity:</td>
          <td>
            <span class="badge badge-${severity}">
              ${severity === 'critical' ? 'CRITICAL' : 
                severity === 'high' ? 'HIGH' : 
                severity === 'medium' ? 'MEDIUM' : 'LOW'}
            </span>
          </td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Current Status:</td>
          <td>
            <span class="badge badge-${status === 'resolved' ? 'success' : 'info'}">
              ${status === 'resolved' ? 'Resolved' : 
                status === 'in_progress' ? 'In Progress' : 
                status === 'investigating' ? 'Investigating' : 'Open'}
            </span>
          </td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Detection Date:</td>
          <td>${detected_at ? new Date(detected_at).toLocaleString('en-US') : new Date(created_at).toLocaleString('en-US')}</td>
        </tr>
        ${resolved_at ? `
          <tr>
            <td style="font-weight: 600;">Resolution Date:</td>
            <td>${new Date(resolved_at).toLocaleString('en-US')}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Resolution Time:</td>
            <td><strong>${Math.round((new Date(resolved_at) - new Date(detected_at || created_at)) / (1000 * 60 * 60))} hours</strong></td>
          </tr>
        ` : ''}
        <tr>
          <td style="font-weight: 600;">Affected Assets:</td>
          <td>${affected_assets || 'Not specified'}</td>
        </tr>
      </table>
    </div>

    <!-- Impact Analysis -->
    <div class="section">
      <div class="section-title">2. Impact Analysis</div>
      ${impact_description ? `
        <p>${impact_description}</p>
      ` : `
        <p><em>Impact analysis not available</em></p>
      `}
      
      ${severity === 'critical' || severity === 'high' ? `
        <div class="danger-box" style="margin-top: 15px;">
          <strong>⚠️ SIGNIFICANT IMPACT</strong><br>
          This incident was classified as <strong>${severity === 'critical' ? 'CRITICAL' : 'HIGH'}</strong>
          and requires immediate executive attention.
        </div>
      ` : ''}
    </div>

    <!-- Root Cause -->
    <div class="section">
      <div class="section-title">3. Root Cause Analysis</div>
      ${root_cause ? `
        <p><strong>Identified cause:</strong></p>
        <p>${root_cause}</p>
      ` : `
        <div class="warning-box">
          Root cause still under investigation
        </div>
      `}
    </div>

    <!-- CAPA - Corrective Actions -->
    <div class="section">
      <div class="section-title">4. CAPA - Corrective Actions</div>
      ${corrective_actions && corrective_actions.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 50%;">Action</th>
              <th style="width: 20%;">Owner</th>
              <th style="width: 15%;">Due Date</th>
              <th style="text-align: center; width: 10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${corrective_actions.map((action, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${action.action || action}</td>
                <td>${action.responsible || 'Security/IT'}</td>
                <td>${action.deadline ? new Date(action.deadline).toLocaleDateString('en-US') : 'Immediate'}</td>
                <td style="text-align: center;">
                  <span class="badge badge-${action.completed ? 'success' : 'info'}">
                    ${action.completed ? 'Completed' : 'Pending'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <p><em>No corrective actions defined</em></p>
      `}
    </div>

    <!-- CAPA - Preventive Actions -->
    <div class="section">
      <div class="section-title">5. CAPA - Preventive Actions</div>
      ${preventive_actions && preventive_actions.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 50%;">Action</th>
              <th style="width: 20%;">Owner</th>
              <th style="width: 15%;">Due Date</th>
              <th style="text-align: center; width: 10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${preventive_actions.map((action, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${action.action || action}</td>
                <td>${action.responsible || 'Security/IT'}</td>
                <td>${action.deadline ? new Date(action.deadline).toLocaleDateString('en-US') : '30 days'}</td>
                <td style="text-align: center;">
                  <span class="badge badge-${action.completed ? 'success' : 'info'}">
                    ${action.completed ? 'Completed' : 'Pending'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <p><em>No preventive actions defined</em></p>
      `}
    </div>

    <!-- Lessons Learned -->
    <div class="section">
      <div class="section-title">6. Lessons Learned</div>
      <div class="info-box">
        <ul>
          <li>Review access and authentication controls on critical systems</li>
          <li>Increase the frequency of vulnerability scans</li>
          <li>Reinforce security awareness training</li>
          <li>Implement additional monitoring in affected areas</li>
        </ul>
      </div>
    </div>

    <!-- Approval -->
    <div class="section" style="margin-top: 50px;">
      <div class="section-title">Approvals</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 30px;">
        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <strong>Investigation Owner</strong><br>
          <small>CISO / Security Analyst</small><br>
          <small>Date: _____/_____/_______</small>
        </div>
        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <strong>Final Approval</strong><br>
          <small>CISO / CTO</small><br>
          <small>Date: _____/_____/_______</small>
        </div>
      </div>
    </div>

    <!-- Classification -->
    <div style="margin-top: 40px; padding: 15px; background: #f5f5f5; border-left: 4px solid #00ADE8;">
      <strong>CLASSIFICATION:</strong> Confidential - Restricted Distribution<br>
      <small>This document contains sensitive security incident information and must be handled confidentially.</small>
    </div>
  `;

  return getBaseTemplate(content, `Incident Report #${id}`);
};

module.exports = { generateIncidentReport };


