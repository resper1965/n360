/**
 * Auto-Create Incidents Job
 * Monitora alertas críticos do Wazuh e cria incidentes automaticamente
 */

const wazuhAlerts = require('../connectors/wazuh-alerts');
const { prisma } = require('../lib/prisma');
const logger = require('../utils/logger');

// Cache de alertas já processados (últimas 24h)
const processedAlerts = new Set();

/**
 * Processar alertas críticos e criar incidentes
 */
async function processAlert(alert) {
  try {
    // Verificar se já processamos este alert
    if (processedAlerts.has(alert.id)) {
      return null;
    }

    // Criar incidente
    const incident = await prisma.incident.create({
      data: {
        title: `[Auto] ${alert.rule_description}`,
        description: `Incidente criado automaticamente a partir de alerta crítico do Wazuh.\n\nAgent: ${alert.agent_name || 'N/A'}\nRule ID: ${alert.rule_id}\nLevel: ${alert.rule_level}\n\nLog completo:\n${alert.full_log || 'N/A'}`,
        severity: getSeverityFromLevel(alert.rule_level),
        status: 'open',
        detected_at: new Date(alert.timestamp),
        impact_description: alert.rule_description,
        org_id: '00000000-0000-0000-0000-000000000000',
        // Metadata adicional
        metadata: {
          wazuh_alert_id: alert.id,
          wazuh_agent_id: alert.agent_id,
          wazuh_rule_id: alert.rule_id,
          wazuh_mitre: alert.rule_mitre,
          auto_created: true
        }
      }
    });

    // Marcar como processado
    processedAlerts.add(alert.id);

    logger.info(`[AutoIncidents] Created incident ${incident.id} from alert ${alert.id}`);
    return incident;

  } catch (error) {
    logger.error(`[AutoIncidents] Error processing alert ${alert.id}: ${error.message}`);
    return null;
  }
}

/**
 * Mapear level do Wazuh para severidade do incidente
 */
function getSeverityFromLevel(level) {
  if (level >= 15) return 'critical';
  if (level >= 12) return 'high';
  if (level >= 8) return 'medium';
  return 'low';
}

/**
 * Job principal - executado a cada 5 minutos
 */
async function runAutoIncidentsJob() {
  try {
    logger.info('[AutoIncidents] Starting job...');

    // Buscar alertas críticos (level >= 12)
    const criticalAlerts = await wazuhAlerts.getCriticalAlerts();

    if (criticalAlerts.length === 0) {
      logger.info('[AutoIncidents] No critical alerts found');
      return { processed: 0, created: 0 };
    }

    // Processar cada alerta
    const results = await Promise.all(
      criticalAlerts.map(alert => processAlert(alert))
    );

    const created = results.filter(r => r !== null).length;

    logger.info(`[AutoIncidents] Job completed: ${created}/${criticalAlerts.length} incidents created`);

    // Limpar cache antigo (manter últimas 24h)
    if (processedAlerts.size > 1000) {
      processedAlerts.clear();
    }

    return { processed: criticalAlerts.length, created };

  } catch (error) {
    logger.error(`[AutoIncidents] Job failed: ${error.message}`);
    return { error: error.message };
  }
}

// Exportar job
module.exports = { runAutoIncidentsJob };


