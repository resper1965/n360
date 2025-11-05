/**
 * Threats Routes - TVL (Threat Library)
 * GRC ISMS Evolution - Module 2
 */

const express = require('express')
const router = express.Router()
const { prisma } = require('../lib/prisma')
const logger = require('../utils/logger')

// GET /api/threats
router.get('/', async (req, res) => {
  try {
    const { category = 'all', search = '', page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (category !== 'all') where.threat_category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { threat_code: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [threats, total] = await Promise.all([
      prisma.threat.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: 'desc' } }),
      prisma.threat.count({ where })
    ])

    res.json({
      data: threats,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    })
  } catch (error) {
    logger.error('[Threats] Error:', error)
    res.status(500).json({ error: 'Erro ao listar ameaças' })
  }
})

// POST /api/threats
router.post('/', async (req, res) => {
  try {
    const threat = await prisma.threat.create({
      data: {
        org_id: 'demo-org',
        ...req.body,
        likelihood_score: parseInt(req.body.likelihood_score),
        tags: req.body.tags || []
      }
    })
    res.status(201).json(threat)
  } catch (error) {
    logger.error('[Threats] Error:', error)
    res.status(500).json({ error: 'Erro ao criar ameaça' })
  }
})

// PUT /api/threats/:id
router.put('/:id', async (req, res) => {
  try {
    const threat = await prisma.threat.update({
      where: { id: req.params.id },
      data: { ...req.body, updated_at: new Date() }
    })
    res.json(threat)
  } catch (error) {
    logger.error('[Threats] Error:', error)
    res.status(500).json({ error: 'Erro ao atualizar ameaça' })
  }
})

// DELETE /api/threats/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.threat.delete({ where: { id: req.params.id } })
    res.json({ message: 'Ameaça excluída com sucesso' })
  } catch (error) {
    logger.error('[Threats] Error:', error)
    res.status(500).json({ error: 'Erro ao excluir ameaça' })
  }
})

module.exports = router

