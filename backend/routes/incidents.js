/**
 * Incidents Routes - Incident Management + CAPA
 * GRC ISMS Evolution - Module 6
 */

const express = require('express')
const router = express.Router()
const { prisma } = require('../lib/prisma')
const logger = require('../utils/logger')

// GET /api/incidents
router.get('/', async (req, res) => {
  try {
    const { status = 'all', severity = 'all', page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (status !== 'all') where.status = status
    if (severity !== 'all') where.severity = severity

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { materialization_date: 'desc' },
        include: {
          risk: { select: { title: true, risk_score: true } },
          asset: { select: { name: true, asset_code: true } },
          failedControl: { select: { control_id: true, title: true } },
          correctiveActions: { select: { id: true, action_title: true, status: true } }
        }
      }),
      prisma.incident.count({ where })
    ])

    res.json({
      data: incidents,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    })
  } catch (error) {
    logger.error('[Incidents] Error:', error)
    res.status(500).json({ error: 'Erro ao listar incidentes' })
  }
})

// POST /api/incidents (from Shuffle webhook)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      risk_id,
      asset_id,
      failed_control_id,
      incident_category,
      severity,
      source,
      source_alert_json
    } = req.body

    // Generate incident code
    const count = await prisma.incident.count()
    const incident_code = `INC-${String(count + 1).padStart(5, '0')}`

    const incident = await prisma.incident.create({
      data: {
        org_id: 'demo-org',
        incident_code,
        title,
        description,
        risk_id,
        asset_id,
        failed_control_id,
        incident_category,
        severity,
        source,
        source_alert_json,
        materialization_date: new Date(),
        status: 'open',
        tags: []
      }
    })

    // Auto-create CAPA if control failed
    if (failed_control_id) {
      await prisma.correctiveAction.create({
        data: {
          org_id: 'demo-org',
          incident_id: incident.id,
          control_id: failed_control_id,
          action_type: 'corrective',
          action_title: `Remediar falha no controle (Incident ${incident_code})`,
          action_description: `Investigar e corrigir a falha do controle que permitiu este incidente.`,
          priority: severity,
          status: 'open'
        }
      })
    }

    logger.info(`[Incidents] Incident created: ${incident.id}`)
    res.status(201).json(incident)
  } catch (error) {
    logger.error('[Incidents] Error:', error)
    res.status(500).json({ error: 'Erro ao criar incidente' })
  }
})

// PUT /api/incidents/:id
router.put('/:id', async (req, res) => {
  try {
    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: { ...req.body, updated_at: new Date() }
    })
    res.json(incident)
  } catch (error) {
    logger.error('[Incidents] Error:', error)
    res.status(500).json({ error: 'Erro ao atualizar incidente' })
  }
})

// GET /api/incidents/:id/capa
router.get('/:id/capa', async (req, res) => {
  try {
    const actions = await prisma.correctiveAction.findMany({
      where: { incident_id: req.params.id },
      orderBy: { created_at: 'desc' }
    })
    res.json({ data: actions })
  } catch (error) {
    logger.error('[Incidents] Error:', error)
    res.status(500).json({ error: 'Erro ao buscar CAPAs' })
  }
})

// POST /api/incidents/:id/capa
router.post('/:id/capa', async (req, res) => {
  try {
    const action = await prisma.correctiveAction.create({
      data: {
        org_id: 'demo-org',
        incident_id: req.params.id,
        ...req.body
      }
    })
    res.status(201).json(action)
  } catch (error) {
    logger.error('[Incidents] Error:', error)
    res.status(500).json({ error: 'Erro ao criar CAPA' })
  }
})

module.exports = router



