/**
 * Zabbix Collector
 * Coleta problemas do Zabbix a cada 60 segundos
 */

const axios = require('axios');

class ZabbixCollector {
  constructor(supabase, config) {
    this.supabase = supabase;
    this.apiUrl = config.apiUrl;
    this.username = config.username;
    this.password = config.password;
    this.authToken = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          jsonrpc: '2.0',
          method: 'user.login',
          params: {
            user: this.username,
            password: this.password
          },
          id: 1
        }
      );

      this.authToken = response.data.result;
      console.log('[Zabbix] Autenticado com sucesso');
    } catch (error) {
      console.error('[Zabbix] Erro ao autenticar:', error.message);
      this.authToken = null;
    }
  }

  async collectProblems(orgId) {
    if (!this.authToken) {
      await this.authenticate();
      if (!this.authToken) return;
    }

    try {
      // Buscar problemas ativos
      const response = await axios.post(
        this.apiUrl,
        {
          jsonrpc: '2.0',
          method: 'problem.get',
          params: {
            output: 'extend',
            selectAcknowledges: 'extend',
            recent: false,
            sortfield: 'eventid',
            sortorder: 'DESC',
            limit: 100
          },
          auth: this.authToken,
          id: 2
        }
      );

      const problems = response.data.result || [];
      console.log(`[Zabbix] ${problems.length} problemas coletados`);

      // Buscar problemas já salvos
      const { data: existingProblems } = await this.supabase
        .from('problems')
        .select('source_id')
        .eq('org_id', orgId)
        .eq('source', 'zabbix');

      const existingIds = new Set(existingProblems?.map(p => p.source_id) || []);

      // Inserir novos problemas
      for (const problem of problems) {
        if (!existingIds.has(problem.eventid)) {
          await this.supabase.from('problems').insert({
            org_id: orgId,
            source: 'zabbix',
            source_id: problem.eventid,
            severity: this.mapSeverity(problem.severity),
            name: problem.name,
            description: problem.opdata || '',
            status: problem.r_eventid === '0' ? 'active' : 'resolved',
            raw_data: problem
          });
        } else {
          // Atualizar status se já existe
          await this.supabase
            .from('problems')
            .update({
              status: problem.r_eventid === '0' ? 'active' : 'resolved',
              updated_at: new Date().toISOString()
            })
            .eq('source_id', problem.eventid);
        }
      }

    } catch (error) {
      if (error.response?.data?.error?.data === 'Session terminated, re-login, please.') {
        console.log('[Zabbix] Sessão expirada, re-autenticando...');
        this.authToken = null;
      } else {
        console.error('[Zabbix] Erro ao coletar problemas:', error.message);
      }
    }
  }

  mapSeverity(level) {
    // Zabbix: 0=not classified, 1=info, 2=warning, 3=average, 4=high, 5=disaster
    if (level === '5') return 'disaster';
    if (level === '4') return 'high';
    if (level === '3') return 'average';
    if (level === '2') return 'warning';
    return 'info';
  }
}

module.exports = ZabbixCollector;

