/**
 * Template PDF: Risk Register
 * 
 * Registro completo de riscos para auditoria
 */

const { getBaseTemplate } = require('./pdf-base');

const generateRiskRegister = (risks = []) => {
  const content = `
    <div class="title">Risk Register</div>
    <div class="subtitle">Registro de Riscos - ISO 27001 / ISO 31000</div>

    <!-- Summary Stats -->
    <div class="section">
      <div class="section-title">Resumo</div>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${risks.length}</div>
          <div class="stat-label">Total de Riscos</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: #c00;">${risks.filter(r => r.inherent_risk >= 8).length}</div>
          <div class="stat-label">Críticos</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: #f90;">${risks.filter(r => r.inherent_risk >= 6 && r.inherent_risk < 8).length}</div>
          <div class="stat-label">Altos</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: #00ADE8;">${risks.filter(r => r.residual_risk < r.inherent_risk).length}</div>
          <div class="stat-label">Mitigados</div>
        </div>
      </div>
    </div>

    <!-- Risk Matrix -->
    <div class="section">
      <div class="section-title">1. Matriz de Riscos</div>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 20%;">Ativo</th>
            <th style="width: 25%;">Ameaça</th>
            <th style="width: 20%;">Vulnerabilidade</th>
            <th style="text-align: center; width: 10%;">Risco Inerente</th>
            <th style="text-align: center; width: 10%;">Risco Residual</th>
            <th style="text-align: center; width: 10%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${risks.length > 0 ? risks.map((risk, index) => `
            <tr>
              <td>${index + 1}</td>
              <td><strong>${risk.asset_name || 'N/A'}</strong></td>
              <td>${risk.threat_name || 'N/A'}</td>
              <td>${risk.vulnerability_name || 'N/A'}</td>
              <td style="text-align: center;">
                <strong style="color: ${
                  risk.inherent_risk >= 8 ? '#c00' : 
                  risk.inherent_risk >= 6 ? '#f90' : 
                  risk.inherent_risk >= 4 ? '#ffc107' : '#0c5460'
                };">
                  ${risk.inherent_risk ? risk.inherent_risk.toFixed(1) : 'N/A'}
                </strong>
              </td>
              <td style="text-align: center;">
                <strong style="color: ${
                  risk.residual_risk >= 8 ? '#c00' : 
                  risk.residual_risk >= 6 ? '#f90' : 
                  risk.residual_risk >= 4 ? '#ffc107' : '#28a745'
                };">
                  ${risk.residual_risk ? risk.residual_risk.toFixed(1) : 'N/A'}
                </strong>
              </td>
              <td style="text-align: center;">
                <span class="badge badge-${risk.treatment_status === 'mitigated' ? 'success' : 'info'}">
                  ${risk.treatment_status === 'mitigated' ? 'Mitigado' : 
                    risk.treatment_status === 'accepted' ? 'Aceito' : 
                    risk.treatment_status === 'transferred' ? 'Transferido' : 'Aberto'}
                </span>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="7" style="text-align: center; padding: 30px;">
                <em>Nenhum risco registrado</em>
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <!-- Detalhamento de Riscos Críticos -->
    ${risks.filter(r => r.inherent_risk >= 8).length > 0 ? `
      <div class="page-break"></div>
      <div class="section">
        <div class="section-title">2. Detalhamento de Riscos Críticos</div>
        ${risks.filter(r => r.inherent_risk >= 8).map((risk, index) => `
          <div class="no-break" style="margin-bottom: 25px;">
            <div class="section-subtitle">${index + 1}. ${risk.asset_name} - ${risk.threat_name}</div>
            
            <table style="font-size: 9pt;">
              <tr>
                <td style="width: 25%; font-weight: 600;">Ativo:</td>
                <td>${risk.asset_name}</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Ameaça:</td>
                <td>${risk.threat_name}</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Vulnerabilidade:</td>
                <td>${risk.vulnerability_name}</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Descrição:</td>
                <td>${risk.description || 'N/A'}</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Risco Inerente:</td>
                <td><strong style="color: #c00;">${risk.inherent_risk ? risk.inherent_risk.toFixed(1) : 'N/A'}/10</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Risco Residual:</td>
                <td><strong style="color: ${risk.residual_risk < 6 ? '#28a745' : '#f90'};">${risk.residual_risk ? risk.residual_risk.toFixed(1) : 'N/A'}/10</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Controles Aplicados:</td>
                <td>${risk.applied_controls || 'Nenhum'}</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Tratamento:</td>
                <td>
                  <span class="badge badge-${risk.treatment_status === 'mitigated' ? 'success' : 'warning'}">
                    ${risk.treatment_status === 'mitigated' ? 'Mitigado' : 
                      risk.treatment_status === 'accepted' ? 'Aceito' : 
                      risk.treatment_status === 'transferred' ? 'Transferido' : 'Em tratamento'}
                  </span>
                </td>
              </tr>
            </table>

            ${risk.mitigation_plan ? `
              <div class="info-box" style="margin-top: 10px;">
                <strong>Plano de Mitigação:</strong><br>
                ${risk.mitigation_plan}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Metodologia -->
    <div class="page-break"></div>
    <div class="section">
      <div class="section-title">Anexo A: Metodologia de Avaliação de Riscos</div>
      
      <div class="section-subtitle">Cálculo de Risco</div>
      <p><strong>Risco = Probabilidade × Impacto × Criticidade do Ativo</strong></p>
      
      <div style="margin-top: 20px;">
        <strong>Probabilidade (Likelihood):</strong>
        <ul>
          <li><strong>Muito Alta (5):</strong> Evento ocorrerá quase certamente</li>
          <li><strong>Alta (4):</strong> Evento provavelmente ocorrerá</li>
          <li><strong>Média (3):</strong> Evento pode ocorrer</li>
          <li><strong>Baixa (2):</strong> Evento improvável</li>
          <li><strong>Muito Baixa (1):</strong> Evento raro</li>
        </ul>
      </div>

      <div style="margin-top: 20px;">
        <strong>Impacto (Impact):</strong>
        <ul>
          <li><strong>Catastrófico (5):</strong> Perda > R$ 1M, reputação irreparável</li>
          <li><strong>Crítico (4):</strong> Perda R$ 500k-1M, danos severos</li>
          <li><strong>Moderado (3):</strong> Perda R$ 100k-500k</li>
          <li><strong>Menor (2):</strong> Perda R$ 10k-100k</li>
          <li><strong>Insignificante (1):</strong> Perda < R$ 10k</li>
        </ul>
      </div>

      <div style="margin-top: 20px;">
        <strong>Criticidade do Ativo:</strong>
        <ul>
          <li><strong>Crítico (2.0):</strong> Operação paralisa sem este ativo</li>
          <li><strong>Alto (1.5):</strong> Operação severamente afetada</li>
          <li><strong>Médio (1.2):</strong> Operação parcialmente afetada</li>
          <li><strong>Baixo (1.0):</strong> Operação pouco afetada</li>
        </ul>
      </div>

      <div class="info-box" style="margin-top: 20px;">
        <strong>Classificação de Severidade:</strong><br>
        • <strong style="color: #c00;">Crítico:</strong> Score ≥ 8.0<br>
        • <strong style="color: #f90;">Alto:</strong> Score 6.0-7.9<br>
        • <strong style="color: #ffc107;">Médio:</strong> Score 4.0-5.9<br>
        • <strong style="color: #0c5460;">Baixo:</strong> Score < 4.0
      </div>
    </div>
  `;

  return getBaseTemplate(content, 'Risk Register');
};

module.exports = { generateRiskRegister };

