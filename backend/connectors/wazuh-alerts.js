/**
 * Wazuh Alerts Connector
 * Integra alertas do Wazuh Indexer com n360 SOC Dashboard
 * 
 * @module connectors/wazuh-alerts
 */

const { Client } = require('@opensearch-project/opensearch');
const logger = require('../utils/logger');
const { WAZUH_INDEXER_URL, WAZUH_INDEXER_PASSWORD } = require('../config/env');

// Cliente OpenSearch
const opensearchClient = new Client({
  node: WAZUH_INDEXER_URL || 'https://wazuh-indexer:9200',
  auth: {
    username: 'admin',
    password: WAZUH_INDEXER_PASSWORD || 'Nessnet@10'
  },
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Buscar alertas recentes do Wazuh
 * @param {Object} options - Opções de filtro
 * @returns {Promise<Array>} Lista de alertas
 */
async function getAlerts(options = {}) {
  const {
    timeRange = 'now-24h',
    minLevel = 0,
    limit = 100,
    offset = 0
  } = options;

  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      from: offset,
      size: limit,
      body: {
        query: {
          bool: {
            must: [
              { range: { '@timestamp': { gte: timeRange } } }
            ],
            filter: [
              { range: { 'rule.level': { gte: minLevel } } }
            ]
          }
        },
        sort: [
          { '@timestamp': { order: 'desc' } }
        ]
      }
    });

    const alerts = response.body.hits.hits.map(hit => ({
      id: hit._id,
      timestamp: hit._source['@timestamp'],
      agent_id: hit._source.agent?.id,
      agent_name: hit._source.agent?.name,
      rule_id: hit._source.rule?.id,
      rule_description: hit._source.rule?.description,
      rule_level: hit._source.rule?.level,
      rule_mitre: hit._source.rule?.mitre,
      rule_groups: hit._source.rule?.groups,
      location: hit._source.location,
      full_log: hit._source.full_log,
      data: hit._source.data
    }));

    logger.info(`[WazuhAlerts] Fetched ${alerts.length} alerts`);
    return alerts;

  } catch (error) {
    logger.error(`[WazuhAlerts] Error fetching alerts: ${error.message}`);
    throw error;
  }
}

/**
 * Buscar alertas críticos (level >= 12)
 * @returns {Promise<Array>} Alertas críticos
 */
async function getCriticalAlerts() {
  return getAlerts({ minLevel: 12, limit: 50 });
}

/**
 * Buscar stats de alertas para dashboard
 * @returns {Promise<Object>} Estatísticas
 */
async function getAlertStats() {
  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          range: { '@timestamp': { gte: 'now-24h' } }
        },
        aggs: {
          total: { value_count: { field: '_id' } },
          by_level: {
            range: {
              field: 'rule.level',
              ranges: [
                { key: 'low', from: 0, to: 5 },
                { key: 'medium', from: 5, to: 10 },
                { key: 'high', from: 10, to: 13 },
                { key: 'critical', from: 13 }
              ]
            }
          },
          by_agent: {
            terms: { field: 'agent.name', size: 10 }
          },
          by_rule: {
            terms: { field: 'rule.description', size: 10 }
          }
        },
        size: 0
      }
    });

    const aggs = response.body.aggregations;

    return {
      total: aggs.total.value,
      by_level: {
        low: aggs.by_level.buckets.find(b => b.key === 'low')?.doc_count || 0,
        medium: aggs.by_level.buckets.find(b => b.key === 'medium')?.doc_count || 0,
        high: aggs.by_level.buckets.find(b => b.key === 'high')?.doc_count || 0,
        critical: aggs.by_level.buckets.find(b => b.key === 'critical')?.doc_count || 0
      },
      top_agents: aggs.by_agent.buckets.map(b => ({
        name: b.key,
        count: b.doc_count
      })),
      top_rules: aggs.by_rule.buckets.map(b => ({
        description: b.key,
        count: b.doc_count
      }))
    };

  } catch (error) {
    logger.error(`[WazuhAlerts] Error fetching stats: ${error.message}`);
    throw error;
  }
}

/**
 * Verificar saúde do connector
 * @returns {Promise<Object>} Status
 */
async function getHealth() {
  try {
    const health = await opensearchClient.cluster.health();
    return {
      status: health.body.status,
      cluster_name: health.body.cluster_name,
      number_of_nodes: health.body.number_of_nodes
    };
  } catch (error) {
    logger.error(`[WazuhAlerts] Health check failed: ${error.message}`);
    return { status: 'offline', error: error.message };
  }
}

module.exports = {
  getAlerts,
  getCriticalAlerts,
  getAlertStats,
  getHealth
};


