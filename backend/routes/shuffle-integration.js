/**
 * Shuffle Integration - SOAR Automation
 * GRC ISMS Evolution - Integration Layer
 */

const express = require('express')
const router = express.Router()
const { prisma } = require('../lib/prisma')
const logger = require('../utils/logger')

// ============================================
// POST /api/shuffle/control-test
// Trigger control test workflow in Shuffle
// ============================================
router.post('/control-test', async (req, res) => {
  try {
    const { control_id } = req.body

    const control = await prisma.control.findUnique({
      where: { id: control_id }
    })

    if (!control) {
      return res.status(404).json({ error: 'Controle não encontrado' })
    }

    // Build Shuffle workflow trigger payload
    const payload = {
      workflow_id: control.shuffle_workflow_id || 'default-control-test',
      execution_argument: JSON.stringify({
        control_id: control.id,
        control_code: control.control_id,
        test_objective: control.test_objective,
        test_method: control.test_method,
        expected_result: control.expected_result,
        framework: control.framework
      })
    }

    // TODO: Call Shuffle API
    // const shuffleResponse = await axios.post('https://shuffle.nsecops.com.br/api/v1/workflows/execute', payload)

    // For now, return mock
    logger.info(`[Shuffle] Control test triggered: ${control_id}`)
    res.json({
      message: 'Teste agendado com sucesso',
      control_id,
      shuffle_execution_id: `exec-${Date.now()}`,
      status: 'scheduled'
    })
  } catch (error) {
    logger.error('[Shuffle] Error:', error)
    res.status(500).json({ error: 'Erro ao agendar teste' })
  }
})

// ============================================
// POST /api/shuffle/test-result
// Receive test result from Shuffle (webhook)
// ============================================
router.post('/test-result', async (req, res) => {
  try {
    const {
      control_id,
      test_result, // 'passed', 'failed', 'partial'
      effectiveness_score,
      evidence_url,
      evidence_description,
      raw_evidence_json,
      shuffle_execution_id
    } = req.body

    // Create test execution record
    const execution = await prisma.controlTestExecution.create({
      data: {
        control_id,
        tested_at: new Date(),
        test_result,
        effectiveness_score: effectiveness_score ? parseFloat(effectiveness_score) : null,
        evidence_url,
        evidence_description,
        raw_evidence_json: raw_evidence_json || {},
        shuffle_execution_id
      }
    })

    // Update control
    await prisma.control.update({
      where: { id: control_id },
      data: {
        last_tested: new Date(),
        test_result,
        effectiveness_score: effectiveness_score ? parseFloat(effectiveness_score) : null,
        evidence_url,
        evidence_description,
        // Calculate next test date
        next_test_date: control.test_frequency 
          ? new Date(Date.now() + control.test_frequency * 24 * 60 * 60 * 1000)
          : null,
        updated_at: new Date()
      }
    })

    logger.info(`[Shuffle] Test result recorded: ${execution.id}`)
    res.status(201).json(execution)
  } catch (error) {
    logger.error('[Shuffle] Error:', error)
    res.status(500).json({ error: 'Erro ao registrar resultado' })
  }
})

// ============================================
// POST /api/shuffle/incident-webhook
// Receive incident from Shuffle (Wazuh/Zabbix alert)
// ============================================
router.post('/incident-webhook', async (req, res) => {
  try {
    const {
      title,
      description,
      severity,
      source, // 'wazuh' or 'zabbix'
      source_alert_json,
      asset_id,
      control_id
    } = req.body

    // Find matching risk
    const risk = asset_id
      ? await prisma.risk.findFirst({
          where: { asset_id, status: { in: ['open', 'mitigating'] } },
          orderBy: { risk_score: 'desc' }
        })
      : null

    // Create incident
    const count = await prisma.incident.count()
    const incident = await prisma.incident.create({
      data: {
        org_id: 'demo-org',
        incident_code: `INC-${String(count + 1).padStart(5, '0')}`,
        title,
        description,
        risk_id: risk?.id,
        asset_id,
        failed_control_id: control_id,
        incident_category: 'security',
        severity,
        source,
        source_alert_json,
        materialization_date: new Date(),
        status: 'open',
        tags: []
      }
    })

    // Auto-create CAPA
    if (control_id) {
      await prisma.correctiveAction.create({
        data: {
          org_id: 'demo-org',
          incident_id: incident.id,
          control_id,
          action_type: 'corrective',
          action_title: `Remediar ${title}`,
          action_description: description || 'Investigar e remediar',
          priority: severity,
          status: 'open'
        }
      })
    }

    logger.info(`[Shuffle] Incident created from webhook: ${incident.id}`)
    res.status(201).json(incident)
  } catch (error) {
    logger.error('[Shuffle] Error:', error)
    res.status(500).json({ error: 'Erro ao criar incidente' })
  }
})

module.exports = router

