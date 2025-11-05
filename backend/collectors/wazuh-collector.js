/**
 * Wazuh Collector
 * Coleta alertas do Wazuh a cada 30 segundos
 */

const axios = require('axios');
const https = require('https');
const BaseCollector = require('./BaseCollector');
const logger = require('../utils/logger');
const { SEVERITY_THRESHOLDS, MAX_ALERTS_PER_FETCH } = require('../config/constants');
const env = require('../config/env');

class WazuhCollector extends BaseCollector {
  constructor(supabase, config) {
    super(supabase, config, 'Wazuh');
    this.apiUrl = config.apiUrl;
    this.username = config.username;
    this.password = config.password;
    this.lastAlertTimestamp = null;
    
    // HTTPS Agent com SSL configurável
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: env.WAZUH_CA_CERT ? true : false,
      ca: env.WAZUH_CA_CERT || undefined,
    });
  }

  async authenticate() {
    try {
      const response = await axios.post(
        `${this.apiUrl}/security/user/authenticate`,
        {},
        {
          auth: { username: this.username, password: this.password },
          httpsAgent: this.httpsAgent,
          timeout: this.getTimeout(),
        }
      );
      
      this.token = response.data.data.token;
      logger.info('[Wazuh] ✅ Autenticado com sucesso');
    } catch (error) {
      logger.errorWithContext('[Wazuh] Erro ao autenticar', error);
      this.token = null;
      throw error; // Propaga erro
    }
  }

  async collect(orgId) {
    try {
      // Buscar alertas dos últimos 60 segundos
      const response = await axios.get(
        `${this.apiUrl}/manager/alerts`,
        {
          params: {
            offset: 0,
            limit: MAX_ALERTS_PER_FETCH,
            sort: '-timestamp',
            q: this.lastAlertTimestamp ? `timestamp>${this.lastAlertTimestamp}` : undefined
          },
          headers: { Authorization: `Bearer ${this.token}` },
          httpsAgent: this.httpsAgent,
          timeout: this.getTimeout(),
        }
      );

      const alerts = response.data.data.affected_items || [];
      logger.info(`[Wazuh] ${alerts.length} novos alertas coletados`);

      if (alerts.length === 0) return;

      // Transformar alertas para formato do banco
      const alertsData = alerts.map(alert => ({
        org_id: orgId,
        source: 'wazuh',
        source_id: alert.id,
        severity: this.mapSeverity(alert.rule.level),
        title: alert.rule.description,
        description: alert.full_log || alert.data?.dstuser || '',
        rule_id: alert.rule.id,
        rule_description: alert.rule.description,
        raw_data: alert,
        status: 'open'
      }));

      // Batch insert (elimina N+1)
      await this.batchInsert('alerts', alertsData);

      // Atualizar timestamp do último alerta
      this.lastAlertTimestamp = alerts[0].timestamp;

    } catch (error) {
      logger.errorWithContext('[Wazuh] Erro ao coletar alertas', error, { orgId });
      throw error; // Propaga erro
    }
  }

  mapSeverity(level) {
    const thresholds = SEVERITY_THRESHOLDS.WAZUH;
    
    if (level >= thresholds.CRITICAL) return 'critical';
    if (level >= thresholds.HIGH) return 'high';
    if (level >= thresholds.MEDIUM) return 'medium';
    if (level >= thresholds.LOW) return 'low';
    return 'info';
  }

  isTokenExpiredError(error) {
    return (
      error.response?.status === 401 ||
      error.message?.includes('Unauthorized')
    );
  }
}

module.exports = WazuhCollector;

