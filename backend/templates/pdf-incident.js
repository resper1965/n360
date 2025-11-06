/**
 * Template PDF: Incident Report
 * 
 * Relatório de incidente com CAPA
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
    <div class="subtitle">Relatório de Incidente de Segurança #${id}</div>

    <!-- Incident Overview -->
    <div class="section">
      <div class="section-title">1. Informações do Incidente</div>
      <table>
        <tr>
          <td style="width: 25%; font-weight: 600;">ID do Incidente:</td>
          <td><strong>#${id}</strong></td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Descrição:</td>
          <td>${description || 'N/A'}</td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Severidade:</td>
          <td>
            <span class="badge badge-${severity}">
              ${severity === 'critical' ? 'CRÍTICO' : 
                severity === 'high' ? 'ALTO' : 
                severity === 'medium' ? 'MÉDIO' : 'BAIXO'}
            </span>
          </td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Status Atual:</td>
          <td>
            <span class="badge badge-${status === 'resolved' ? 'success' : 'info'}">
              ${status === 'resolved' ? 'Resolvido' : 
                status === 'in_progress' ? 'Em Progresso' : 
                status === 'investigating' ? 'Investigando' : 'Aberto'}
            </span>
          </td>
        </tr>
        <tr>
          <td style="font-weight: 600;">Data de Detecção:</td>
          <td>${detected_at ? new Date(detected_at).toLocaleString('pt-BR') : new Date(created_at).toLocaleString('pt-BR')}</td>
        </tr>
        ${resolved_at ? `
          <tr>
            <td style="font-weight: 600;">Data de Resolução:</td>
            <td>${new Date(resolved_at).toLocaleString('pt-BR')}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Tempo de Resolução:</td>
            <td><strong>${Math.round((new Date(resolved_at) - new Date(detected_at || created_at)) / (1000 * 60 * 60))} horas</strong></td>
          </tr>
        ` : ''}
        <tr>
          <td style="font-weight: 600;">Ativos Afetados:</td>
          <td>${affected_assets || 'Não especificado'}</td>
        </tr>
      </table>
    </div>

    <!-- Impact Analysis -->
    <div class="section">
      <div class="section-title">2. Análise de Impacto</div>
      ${impact_description ? `
        <p>${impact_description}</p>
      ` : `
        <p><em>Análise de impacto não disponível</em></p>
      `}
      
      ${severity === 'critical' || severity === 'high' ? `
        <div class="danger-box" style="margin-top: 15px;">
          <strong>⚠️ IMPACTO SIGNIFICATIVO</strong><br>
          Este incidente foi classificado como <strong>${severity === 'critical' ? 'CRÍTICO' : 'ALTO'}</strong> 
          e requer atenção imediata da alta gestão.
        </div>
      ` : ''}
    </div>

    <!-- Root Cause -->
    <div class="section">
      <div class="section-title">3. Causa Raiz (Root Cause Analysis)</div>
      ${root_cause ? `
        <p><strong>Causa identificada:</strong></p>
        <p>${root_cause}</p>
      ` : `
        <div class="warning-box">
          Causa raiz ainda em investigação
        </div>
      `}
    </div>

    <!-- CAPA - Corrective Actions -->
    <div class="section">
      <div class="section-title">4. CAPA - Ações Corretivas</div>
      ${corrective_actions && corrective_actions.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 50%;">Ação</th>
              <th style="width: 20%;">Responsável</th>
              <th style="width: 15%;">Prazo</th>
              <th style="text-align: center; width: 10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${corrective_actions.map((action, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${action.action || action}</td>
                <td>${action.responsible || 'TI/Segurança'}</td>
                <td>${action.deadline ? new Date(action.deadline).toLocaleDateString('pt-BR') : 'Imediato'}</td>
                <td style="text-align: center;">
                  <span class="badge badge-${action.completed ? 'success' : 'info'}">
                    ${action.completed ? 'Concluído' : 'Pendente'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <p><em>Nenhuma ação corretiva definida</em></p>
      `}
    </div>

    <!-- CAPA - Preventive Actions -->
    <div class="section">
      <div class="section-title">5. CAPA - Ações Preventivas</div>
      ${preventive_actions && preventive_actions.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 50%;">Ação</th>
              <th style="width: 20%;">Responsável</th>
              <th style="width: 15%;">Prazo</th>
              <th style="text-align: center; width: 10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${preventive_actions.map((action, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${action.action || action}</td>
                <td>${action.responsible || 'TI/Segurança'}</td>
                <td>${action.deadline ? new Date(action.deadline).toLocaleDateString('pt-BR') : '30 dias'}</td>
                <td style="text-align: center;">
                  <span class="badge badge-${action.completed ? 'success' : 'info'}">
                    ${action.completed ? 'Concluído' : 'Pendente'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <p><em>Nenhuma ação preventiva definida</em></p>
      `}
    </div>

    <!-- Lessons Learned -->
    <div class="section">
      <div class="section-title">6. Lições Aprendidas</div>
      <div class="info-box">
        <ul>
          <li>Revisar controles de acesso e autenticação em sistemas críticos</li>
          <li>Aumentar frequência de scans de vulnerabilidade</li>
          <li>Reforçar treinamentos de conscientização em segurança</li>
          <li>Implementar monitoramento adicional nas áreas afetadas</li>
        </ul>
      </div>
    </div>

    <!-- Approval -->
    <div class="section" style="margin-top: 50px;">
      <div class="section-title">Aprovações</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 30px;">
        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <strong>Responsável pela Investigação</strong><br>
          <small>CISO / Security Analyst</small><br>
          <small>Data: _____/_____/_______</small>
        </div>
        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <strong>Aprovação Final</strong><br>
          <small>CISO / CTO</small><br>
          <small>Data: _____/_____/_______</small>
        </div>
      </div>
    </div>

    <!-- Classification -->
    <div style="margin-top: 40px; padding: 15px; background: #f5f5f5; border-left: 4px solid #00ADE8;">
      <strong>CLASSIFICAÇÃO:</strong> Confidencial - Distribuição Restrita<br>
      <small>Este documento contém informações sensíveis sobre incidentes de segurança e deve ser tratado com confidencialidade.</small>
    </div>
  `;

  return getBaseTemplate(content, `Incident Report #${id}`);
};

module.exports = { generateIncidentReport };

