/**
 * Zabbix Collector
 * Coleta problemas do Zabbix a cada 60 segundos
 */

const axios = require('axios');
const BaseCollector = require('./BaseCollector');
const logger = require('../utils/logger');
const { SEVERITY_THRESHOLDS, MAX_PROBLEMS_PER_FETCH } = require('../config/constants');

class ZabbixCollector extends BaseCollector {
  constructor(supabase, config) {
    super(supabase, config, 'Zabbix');
    this.apiUrl = config.apiUrl;
    this.username = config.username;
    this.password = config.password;
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
        },
        {
          timeout: this.getTimeout(),
        }
      );

      this.token = response.data.result;
      logger.info('[Zabbix] ✅ Autenticado com sucesso');
    } catch (error) {
      logger.errorWithContext('[Zabbix] Erro ao autenticar', error);
      this.token = null;
      throw error; // Propaga erro
    }
  }

  async collect(orgId) {
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
            limit: MAX_PROBLEMS_PER_FETCH
          },
          auth: this.token,
          id: 2
        },
        {
          timeout: this.getTimeout(),
        }
      );

      const problems = response.data.result || [];
      logger.info(`[Zabbix] ${problems.length} problemas coletados`);

      if (problems.length === 0) return;

      // Buscar problemas já salvos (para upsert)
      const { data: existingProblems } = await this.supabase
        .from('problems')
        .select('source_id')
        .eq('org_id', orgId)
        .eq('source', 'zabbix');

      const existingIds = new Set(existingProblems?.map(p => p.source_id) || []);

      // Separar novos problemas e atualizações
      const newProblems = [];
      const updatedProblems = [];

      for (const problem of problems) {
        const problemData = {
          org_id: orgId,
          source: 'zabbix',
          source_id: problem.eventid,
          severity: this.mapSeverity(problem.severity),
          name: problem.name,
          description: problem.opdata || '',
          status: problem.r_eventid === '0' ? 'active' : 'resolved',
          raw_data: problem
        };

        if (existingIds.has(problem.eventid)) {
          updatedProblems.push(problemData);
        } else {
          newProblems.push(problemData);
        }
      }

      // Batch upsert (insert + update)
      const upsertData = [...newProblems, ...updatedProblems];
      await this.batchUpsert('problems', upsertData, {
        onConflict: 'source_id',
        ignoreDuplicates: false,
      });

      logger.info('[Zabbix] Sincronização completa', {
        new: newProblems.length,
        updated: updatedProblems.length,
      });

    } catch (error) {
      logger.errorWithContext('[Zabbix] Erro ao coletar problemas', error, { orgId });
      throw error; // Propaga erro
    }
  }

  mapSeverity(level) {
    const thresholds = SEVERITY_THRESHOLDS.ZABBIX;
    
    // Zabbix: 0=not classified, 1=info, 2=warning, 3=average, 4=high, 5=disaster
    if (level === thresholds.DISASTER) return 'disaster';
    if (level === thresholds.HIGH) return 'high';
    if (level === thresholds.AVERAGE) return 'average';
    if (level === thresholds.WARNING) return 'warning';
    return 'info';
  }

  isTokenExpiredError(error) {
    return (
      error.response?.data?.error?.data === 'Session terminated, re-login, please.' ||
      error.response?.status === 401
    );
  }
}

module.exports = ZabbixCollector;
