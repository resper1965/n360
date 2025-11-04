/**
 * Wazuh Collector
 * Coleta alertas do Wazuh a cada 30 segundos
 */

const axios = require('axios');
const https = require('https');

class WazuhCollector {
  constructor(supabase, config) {
    this.supabase = supabase;
    this.apiUrl = config.apiUrl;
    this.username = config.username;
    this.password = config.password;
    this.token = null;
    this.lastAlertTimestamp = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(
        `${this.apiUrl}/security/user/authenticate`,
        {},
        {
          auth: { username: this.username, password: this.password },
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        }
      );
      this.token = response.data.data.token;
      console.log('[Wazuh] Autenticado com sucesso');
    } catch (error) {
      console.error('[Wazuh] Erro ao autenticar:', error.message);
      this.token = null;
    }
  }

  async collectAlerts(orgId) {
    if (!this.token) {
      await this.authenticate();
      if (!this.token) return;
    }

    try {
      // Buscar alertas dos últimos 60 segundos
      const response = await axios.get(
        `${this.apiUrl}/security/alerts`,
        {
          params: {
            offset: 0,
            limit: 500,
            sort: '-timestamp',
            q: this.lastAlertTimestamp ? `timestamp>${this.lastAlertTimestamp}` : undefined
          },
          headers: { Authorization: `Bearer ${this.token}` },
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        }
      );

      const alerts = response.data.data.affected_items || [];
      console.log(`[Wazuh] ${alerts.length} novos alertas coletados`);

      // Inserir no Supabase
      for (const alert of alerts) {
        await this.supabase.from('alerts').insert({
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
        });
      }

      if (alerts.length > 0) {
        this.lastAlertTimestamp = alerts[0].timestamp;
      }

    } catch (error) {
      if (error.response?.status === 401) {
        console.log('[Wazuh] Token expirado, re-autenticando...');
        this.token = null;
      } else {
        console.error('[Wazuh] Erro ao coletar alertas:', error.message);
      }
    }
  }

  mapSeverity(level) {
    if (level >= 12) return 'critical';
    if (level >= 7) return 'high';
    if (level >= 4) return 'medium';
    if (level >= 2) return 'low';
    return 'info';
  }
}

module.exports = WazuhCollector;

