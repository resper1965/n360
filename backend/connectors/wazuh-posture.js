/**
 * Wazuh Posture Management Connector
 * Integra Security Configuration Assessment (SCA) do Wazuh com n360
 * 
 * @module connectors/wazuh-posture
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
 * Buscar resumo geral de postura de segurança
 * @returns {Promise<Object>} Summary com score, policies e stats
 */
async function getPostureSummary() {
  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { 'rule.groups': 'sca' } },
              { range: { '@timestamp': { gte: 'now-24h' } } }
            ]
          }
        },
        aggs: {
          total_checks: { value_count: { field: 'sca.check.id' } },
          passed: {
            filter: { term: { 'sca.check.result': 'passed' } }
          },
          failed: {
            filter: { term: { 'sca.check.result': 'failed' } }
          },
          not_applicable: {
            filter: { term: { 'sca.check.result': 'not applicable' } }
          },
          by_policy: {
            terms: { field: 'sca.policy.keyword', size: 20 },
            aggs: {
              passed: { filter: { term: { 'sca.check.result': 'passed' } } },
              failed: { filter: { term: { 'sca.check.result': 'failed' } } },
              not_applicable: { filter: { term: { 'sca.check.result': 'not applicable' } } }
            }
          }
        },
        size: 0
      }
    });

    const aggs = response.body.aggregations;
    const total = aggs.total_checks.value;
    const passed = aggs.passed.doc_count;
    const failed = aggs.failed.doc_count;
    const notApplicable = aggs.not_applicable.doc_count;
    
    // Calcular score (ignorando N/A)
    const applicable = passed + failed;
    const score = applicable > 0 ? ((passed / applicable) * 100).toFixed(2) : 0;

    const result = {
      score: parseFloat(score),
      total,
      passed,
      failed,
      not_applicable: notApplicable,
      policies: aggs.by_policy.buckets.map(bucket => {
        const policyPassed = bucket.passed.doc_count;
        const policyFailed = bucket.failed.doc_count;
        const policyApplicable = policyPassed + policyFailed;
        const policyScore = policyApplicable > 0 
          ? ((policyPassed / policyApplicable) * 100).toFixed(2)
          : 0;

        return {
          name: bucket.key,
          total: bucket.doc_count,
          passed: policyPassed,
          failed: policyFailed,
          not_applicable: bucket.not_applicable.doc_count,
          score: parseFloat(policyScore)
        };
      }).sort((a, b) => a.score - b.score) // Ordenar por score (pior primeiro)
    };

    logger.info('[Wazuh Posture] Summary obtido:', { score: result.score, total: result.total });
    return result;

  } catch (error) {
    logger.error('[Wazuh Posture] Erro ao buscar summary:', error.message);
    throw new Error('Falha ao buscar resumo de postura de segurança');
  }
}

/**
 * Buscar checks falhando (Top N)
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Lista de checks falhando
 */
async function getFailedChecks(limit = 10) {
  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { 'rule.groups': 'sca' } },
              { term: { 'sca.check.result': 'failed' } },
              { range: { '@timestamp': { gte: 'now-7d' } } }
            ]
          }
        },
        aggs: {
          by_check: {
            terms: { field: 'sca.check.id.keyword', size: limit },
            aggs: {
              agents: { cardinality: { field: 'agent.id' } },
              compliance: { terms: { field: 'sca.check.compliance.keyword', size: 10 } },
              latest: { 
                top_hits: { 
                  size: 1, 
                  sort: [{ '@timestamp': 'desc' }],
                  _source: ['sca.check', 'agent']
                } 
              }
            }
          }
        },
        size: 0
      }
    });

    const checks = response.body.aggregations.by_check.buckets.map(bucket => {
      const latest = bucket.latest.hits.hits[0]._source;
      return {
        id: latest.sca.check.id,
        title: latest.sca.check.title,
        description: latest.sca.check.description,
        rationale: latest.sca.check.rationale,
        remediation: latest.sca.check.remediation,
        compliance: bucket.compliance.buckets.map(c => c.key),
        affected_agents: bucket.agents.value,
        count: bucket.doc_count,
        policy: latest.sca.policy || 'Unknown'
      };
    });

    logger.info('[Wazuh Posture] Failed checks obtidos:', { count: checks.length });
    return checks;

  } catch (error) {
    logger.error('[Wazuh Posture] Erro ao buscar failed checks:', error.message);
    throw new Error('Falha ao buscar checks falhando');
  }
}

/**
 * Buscar postura de um agente específico
 * @param {string} agentId - ID do agente
 * @returns {Promise<Array>} Postura por policy
 */
async function getAgentPosture(agentId) {
  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { 'rule.groups': 'sca' } },
              { term: { 'agent.id': agentId } },
              { range: { '@timestamp': { gte: 'now-24h' } } }
            ]
          }
        },
        aggs: {
          by_policy: {
            terms: { field: 'sca.policy.keyword' },
            aggs: {
              passed: { filter: { term: { 'sca.check.result': 'passed' } } },
              failed: { filter: { term: { 'sca.check.result': 'failed' } } },
              not_applicable: { filter: { term: { 'sca.check.result': 'not applicable' } } },
              checks: {
                terms: { field: 'sca.check.title.keyword', size: 200 },
                aggs: {
                  latest: { 
                    top_hits: { 
                      size: 1, 
                      sort: [{ '@timestamp': 'desc' }],
                      _source: ['sca.check']
                    } 
                  }
                }
              }
            }
          }
        },
        size: 0
      }
    });

    const policies = response.body.aggregations.by_policy.buckets.map(policy => {
      const policyPassed = policy.passed.doc_count;
      const policyFailed = policy.failed.doc_count;
      const policyApplicable = policyPassed + policyFailed;
      const policyScore = policyApplicable > 0 
        ? ((policyPassed / policyApplicable) * 100).toFixed(2)
        : 0;

      return {
        policy: policy.key,
        total: policy.doc_count,
        passed: policyPassed,
        failed: policyFailed,
        not_applicable: policy.not_applicable.doc_count,
        score: parseFloat(policyScore),
        checks: policy.checks.buckets.map(check => {
          const latest = check.latest.hits.hits[0]._source.sca.check;
          return {
            id: latest.id,
            title: check.key,
            result: latest.result,
            compliance: latest.compliance || [],
            remediation: latest.remediation
          };
        })
      };
    });

    logger.info('[Wazuh Posture] Agent posture obtido:', { agentId, policies: policies.length });
    return policies;

  } catch (error) {
    logger.error('[Wazuh Posture] Erro ao buscar agent posture:', error.message);
    throw new Error('Falha ao buscar postura do agente');
  }
}

/**
 * Buscar compliance score por framework
 * @param {string} framework - Framework (pci_dss, gdpr, hipaa, nist_800_53, cis)
 * @returns {Promise<Object>} Score do framework
 */
async function getComplianceScore(framework) {
  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { 'rule.groups': 'sca' } },
              { range: { '@timestamp': { gte: 'now-7d' } } }
            ],
            filter: {
              wildcard: { 'sca.check.compliance': `*${framework}*` }
            }
          }
        },
        aggs: {
          total: { value_count: { field: 'sca.check.id' } },
          passed: { filter: { term: { 'sca.check.result': 'passed' } } },
          failed: { filter: { term: { 'sca.check.result': 'failed' } } }
        },
        size: 0
      }
    });

    const aggs = response.body.aggregations;
    const passed = aggs.passed.doc_count;
    const failed = aggs.failed.doc_count;
    const total = passed + failed;
    const score = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

    logger.info('[Wazuh Posture] Compliance score obtido:', { framework, score });
    
    return {
      framework,
      score: parseFloat(score),
      total,
      passed,
      failed
    };

  } catch (error) {
    logger.error('[Wazuh Posture] Erro ao buscar compliance:', error.message);
    throw new Error('Falha ao buscar compliance score');
  }
}

/**
 * Testar conexão com Wazuh Indexer
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const response = await opensearchClient.cluster.health();
    logger.info('[Wazuh Posture] Conexão OK:', response.body.status);
    return response.body.status !== 'red';
  } catch (error) {
    logger.error('[Wazuh Posture] Erro de conexão:', error.message);
    return false;
  }
}

module.exports = {
  opensearchClient,
  getPostureSummary,
  getFailedChecks,
  getAgentPosture,
  getComplianceScore,
  testConnection
};


