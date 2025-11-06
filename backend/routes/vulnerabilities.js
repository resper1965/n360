/**
 * Vulnerabilities Routes - TVL (Vulnerability Library)
 * GRC ISMS Evolution - Module 2
 */

const express = require('express')
const router = express.Router()
const { prisma } = require('../lib/prisma')
const logger = require('../utils/logger')

// GET /api/vulnerabilities
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20, severity = 'all' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (severity !== 'all') where.severity_score = { gte: parseInt(severity) }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { vuln_code: { contains: search, mode: 'insensitive' } },
        { cve_id: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [vulnerabilities, total] = await Promise.all([
      prisma.vulnerability.findMany({ where, skip, take: parseInt(limit), orderBy: { severity_score: 'desc' } }),
      prisma.vulnerability.count({ where })
    ])

    res.json({
      data: vulnerabilities,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    })
  } catch (error) {
    logger.error('[Vulnerabilities] Error:', error)
    res.status(500).json({ error: 'Erro ao listar vulnerabilidades' })
  }
})

// POST /api/vulnerabilities
router.post('/', async (req, res) => {
  try {
    const vuln = await prisma.vulnerability.create({
      data: {
        org_id: 'demo-org',
        ...req.body,
        severity_score: parseInt(req.body.severity_score),
        cvss_score: req.body.cvss_score ? parseFloat(req.body.cvss_score) : null,
        tags: req.body.tags || []
      }
    })
    res.status(201).json(vuln)
  } catch (error) {
    logger.error('[Vulnerabilities] Error:', error)
    res.status(500).json({ error: 'Erro ao criar vulnerabilidade' })
  }
})

// PUT /api/vulnerabilities/:id
router.put('/:id', async (req, res) => {
  try {
    const vuln = await prisma.vulnerability.update({
      where: { id: req.params.id },
      data: { ...req.body, updated_at: new Date() }
    })
    res.json(vuln)
  } catch (error) {
    logger.error('[Vulnerabilities] Error:', error)
    res.status(500).json({ error: 'Erro ao atualizar vulnerabilidade' })
  }
})

// DELETE /api/vulnerabilities/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.vulnerability.delete({ where: { id: req.params.id } })
    res.json({ message: 'Vulnerabilidade excluída com sucesso' })
  } catch (error) {
    logger.error('[Vulnerabilities] Error:', error)
    res.status(500).json({ error: 'Erro ao excluir vulnerabilidade' })
  }
})

module.exports = router


