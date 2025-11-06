/**
 * Posture Management API Routes
 * Endpoints para integração com Wazuh SCA
 * 
 * @module routes/posture
 */

const express = require('express');
const router = express.Router();
const {
  getPostureSummary,
  getFailedChecks,
  getAgentPosture,
  getComplianceScore,
  testConnection
} = require('../connectors/wazuh-posture');
const logger = require('../utils/logger');

/**
 * GET /api/posture/health
 * Health check da conexão com Wazuh Indexer
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await testConnection();
    
    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        service: 'Wazuh Indexer',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /health:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar saúde da conexão'
    });
  }
});

/**
 * GET /api/posture/summary
 * Resumo geral da postura de segurança
 * 
 * Response:
 * {
 *   score: 89.5,
 *   total: 285,
 *   passed: 245,
 *   failed: 28,
 *   not_applicable: 12,
 *   policies: [...]
 * }
 */
router.get('/summary', async (req, res) => {
  try {
    logger.info('[API Posture] GET /summary');
    const summary = await getPostureSummary();
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /summary:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar resumo de postura'
    });
  }
});

/**
 * GET /api/posture/failed-checks
 * Top checks falhando
 * 
 * Query params:
 * - limit: número de resultados (default: 10)
 * 
 * Response:
 * {
 *   data: [{
 *     id: '28520',
 *     title: 'Ensure SSH protocol is set to 2',
 *     description: '...',
 *     remediation: '...',
 *     compliance: ['cis_csc_v8: 4.1', 'pci_dss_v4.0: 2.2.4'],
 *     affected_agents: 8,
 *     count: 45
 *   }]
 * }
 */
router.get('/failed-checks', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    logger.info('[API Posture] GET /failed-checks', { limit });
    
    const checks = await getFailedChecks(limit);
    
    res.json({
      success: true,
      data: checks,
      count: checks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /failed-checks:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar checks falhando'
    });
  }
});

/**
 * GET /api/posture/agent/:id
 * Postura de um agente específico
 * 
 * Params:
 * - id: Agent ID (ex: '001')
 * 
 * Response:
 * {
 *   data: [{
 *     policy: 'CIS Debian Linux 10',
 *     total: 150,
 *     passed: 135,
 *     failed: 15,
 *     score: 90.0,
 *     checks: [...]
 *   }]
 * }
 */
router.get('/agent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('[API Posture] GET /agent/:id', { agentId: id });
    
    const posture = await getAgentPosture(id);
    
    res.json({
      success: true,
      data: posture,
      agent_id: id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /agent/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar postura do agente'
    });
  }
});

/**
 * GET /api/posture/compliance/:framework
 * Score de compliance por framework
 * 
 * Params:
 * - framework: pci_dss | gdpr | hipaa | nist_800_53 | cis
 * 
 * Response:
 * {
 *   data: {
 *     framework: 'pci_dss',
 *     score: 87.5,
 *     total: 80,
 *     passed: 70,
 *     failed: 10
 *   }
 * }
 */
router.get('/compliance/:framework', async (req, res) => {
  try {
    const { framework } = req.params;
    logger.info('[API Posture] GET /compliance/:framework', { framework });
    
    const score = await getComplianceScore(framework);
    
    res.json({
      success: true,
      data: score,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /compliance/:framework:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar compliance score'
    });
  }
});

/**
 * GET /api/posture/compliance/all
 * Scores de todos os frameworks
 */
router.get('/compliance-all', async (req, res) => {
  try {
    logger.info('[API Posture] GET /compliance-all');
    
    const frameworks = ['pci_dss', 'gdpr', 'hipaa', 'nist_800_53'];
    const scores = await Promise.all(
      frameworks.map(fw => getComplianceScore(fw))
    );
    
    res.json({
      success: true,
      data: scores,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /compliance-all:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar compliance scores'
    });
  }
});

module.exports = router;

