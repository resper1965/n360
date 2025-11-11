/**
 * Template PDF: Executive Summary
 * 
 * Relatório executivo para reuniões de board
 */

const { getBaseTemplate } = require('./pdf-base');

const generateExecutiveSummary = (data) => {
  const {
    kpis = {},
    risks = [],
    incidents = [],
    compliance = {},
    period = 'Último mês'
  } = data;

  const content = `
    <div class="title">Executive Summary</div>
    <div class="subtitle">Resumo Executivo de Segurança da Informação - ${period}</div>

    <!-- KPIs Grid -->
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${kpis.riskScore || 0}</div>
        <div class="stat-label">Risk Score</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${kpis.incidents || 0}</div>
        <div class="stat-label">Incidentes</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${kpis.complianceScore || 0}%</div>
        <div class="stat-label">Compliance</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${kpis.vulnerabilities || 0}</div>
        <div class="stat-label">Vulnerabilidades</div>
      </div>
    </div>

    <!-- Executive Summary -->
    <div class="section">
      <div class="section-title">1. Resumo Executivo</div>
      <p>
        No período analisado (${period}), a organização apresentou um nível de segurança 
        ${kpis.riskScore >= 7 ? '<strong style="color: #c00;">CRÍTICO</strong>' : 
          kpis.riskScore >= 5 ? '<strong style="color: #f90;">ALTO</strong>' : 
          '<strong style="color: #0c5460;">MODERADO</strong>'} com score de risco ${kpis.riskScore}/10.
      </p>
      <p style="margin-top: 10px;">
        Foram registrados <strong>${kpis.incidents || 0} incidentes de segurança</strong>, 
        com <strong>${kpis.vulnerabilities || 0} vulnerabilidades</strong> identificadas e em processo de remediação.
      </p>
    </div>

    <!-- Top Risks -->
    <div class="section">
      <div class="section-title">2. Top 5 Riscos Críticos</div>
      ${risks.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Risco</th>
              <th>Ativo</th>
              <th style="text-align: center;">Score</th>
              <th style="text-align: center;">Severidade</th>
            </tr>
          </thead>
          <tbody>
            ${risks.slice(0, 5).map(risk => `
              <tr>
                <td><strong>${risk.description || 'N/A'}</strong></td>
                <td>${risk.asset_name || 'N/A'}</td>
                <td style="text-align: center;"><strong>${risk.inherent_risk || 'N/A'}</strong></td>
                <td style="text-align: center;">
                  <span class="badge badge-${risk.inherent_risk >= 8 ? 'critical' : risk.inherent_risk >= 6 ? 'high' : risk.inherent_risk >= 4 ? 'medium' : 'low'}">
                    ${risk.inherent_risk >= 8 ? 'Crítico' : risk.inherent_risk >= 6 ? 'Alto' : risk.inherent_risk >= 4 ? 'Médio' : 'Baixo'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p><em>Nenhum risco registrado no período.</em></p>'}
    </div>

    <!-- Recent Incidents -->
    <div class="section">
      <div class="section-title">3. Incidentes Recentes</div>
      ${incidents.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th style="text-align: center;">Severidade</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${incidents.slice(0, 10).map(incident => `
              <tr>
                <td>${new Date(incident.detected_at || incident.created_at).toLocaleDateString('pt-BR')}</td>
                <td><strong>${incident.description || 'N/A'}</strong></td>
                <td style="text-align: center;">
                  <span class="badge badge-${incident.severity}">
                    ${incident.severity === 'critical' ? 'Crítico' : 
                      incident.severity === 'high' ? 'Alto' : 
                      incident.severity === 'medium' ? 'Médio' : 'Baixo'}
                  </span>
                </td>
                <td style="text-align: center;">
                  <span class="badge badge-${incident.status === 'resolved' ? 'success' : 'info'}">
                    ${incident.status === 'resolved' ? 'Resolvido' : 
                      incident.status === 'in_progress' ? 'Em progresso' : 'Aberto'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p><em>Nenhum incidente registrado no período.</em></p>'}
    </div>

    <!-- Compliance Status -->
    <div class="section">
      <div class="section-title">4. Status de Conformidade</div>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${compliance.iso27001 || 0}%</div>
          <div class="stat-label">ISO 27001</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${compliance.lgpd || 0}%</div>
          <div class="stat-label">LGPD</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${compliance.nist || 0}%</div>
          <div class="stat-label">NIST CSF</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${compliance.cis || 0}%</div>
          <div class="stat-label">CIS Controls</div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="section">
      <div class="section-title">5. Recomendações Prioritárias</div>
      <div class="info-box">
        <strong>Ações Imediatas:</strong>
        <ul style="margin-top: 10px;">
          ${risks.length > 0 ? `
            <li><strong>Remediar ${risks.filter(r => r.inherent_risk >= 8).length} riscos críticos</strong> identificados no Risk Register</li>
          ` : ''}
          ${incidents.filter(i => i.status !== 'resolved').length > 0 ? `
            <li><strong>Resolver ${incidents.filter(i => i.status !== 'resolved').length} incidentes abertos</strong></li>
          ` : ''}
          <li><strong>Manter programas de conscientização</strong> em segurança para todos colaboradores</li>
          <li><strong>Revisar controles de acesso</strong> trimestralmente conforme política</li>
        </ul>
      </div>
    </div>

    <!-- Sign-off -->
    <div class="section" style="margin-top: 50px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px;">
        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <strong>CISO</strong><br>
          <small>Chief Information Security Officer</small>
        </div>
        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <strong>CEO</strong><br>
          <small>Chief Executive Officer</small>
        </div>
      </div>
    </div>
  `;

  return getBaseTemplate(content, 'Executive Summary');
};

module.exports = { generateExecutiveSummary };


