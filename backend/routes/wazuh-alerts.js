/**
 * Wazuh Alerts Routes
 * API endpoints para alertas do Wazuh
 */

const express = require('express');
const router = express.Router();
const wazuhAlerts = require('../connectors/wazuh-alerts');
const logger = require('../utils/logger');

// GET /api/wazuh-alerts - Lista todos alertas
router.get('/', async (req, res) => {
  try {
    const { timeRange, minLevel, limit, offset } = req.query;
    
    const alerts = await wazuhAlerts.getAlerts({
      timeRange: timeRange || 'now-24h',
      minLevel: minLevel ? parseInt(minLevel) : 0,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0
    });

    res.json({ success: true, data: alerts });
  } catch (error) {
    logger.error(`[WazuhAlertsRoutes] Error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/wazuh-alerts/critical - Alertas críticos
router.get('/critical', async (req, res) => {
  try {
    const alerts = await wazuhAlerts.getCriticalAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    logger.error(`[WazuhAlertsRoutes] Error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/wazuh-alerts/stats - Estatísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await wazuhAlerts.getAlertStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error(`[WazuhAlertsRoutes] Error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/wazuh-alerts/health - Health check
router.get('/health', async (req, res) => {
  try {
    const health = await wazuhAlerts.getHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    logger.error(`[WazuhAlertsRoutes] Health check failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

