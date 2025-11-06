/**
 * Assets Routes - CMDB (Configuration Management Database)
 * GRC ISMS Evolution - Module 1
 */

const express = require('express')
const router = express.Router()
const { prisma } = require('../lib/prisma')
const logger = require('../utils/logger')

// ============================================
// GET /api/assets - List assets
// ============================================
router.get('/', async (req, res) => {
  try {
    const {
      asset_type = 'all',
      search = '',
      page = 1,
      limit = 20,
    } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Build where clause
    const where = {
      // RLS: org_id from JWT context (implement later)
      // org_id: req.user.org_id,
    }

    if (asset_type !== 'all') {
      where.asset_type = asset_type
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { asset_code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get assets with pagination
    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: { risks: true }
          }
        }
      }),
      prisma.asset.count({ where })
    ])

    res.json({
      data: assets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      }
    })
  } catch (error) {
    logger.error('[Assets] Error listing assets:', error)
    res.status(500).json({ error: 'Erro ao listar ativos' })
  }
})

// ============================================
// GET /api/assets/stats - Asset statistics
// ============================================
router.get('/stats', async (req, res) => {
  try {
    const stats = await prisma.asset.groupBy({
      by: ['asset_type'],
      _count: true,
      // where: { org_id: req.user.org_id }
    })

    const totalAssets = await prisma.asset.count()
    
    const avgBusinessImpact = await prisma.asset.aggregate({
      _avg: { business_impact: true }
    })

    res.json({
      totalAssets,
      avgBusinessImpact: avgBusinessImpact._avg.business_impact || 0,
      byType: stats.map(s => ({
        asset_type: s.asset_type,
        count: s._count
      }))
    })
  } catch (error) {
    logger.error('[Assets] Error getting stats:', error)
    res.status(500).json({ error: 'Erro ao obter estatísticas' })
  }
})

// ============================================
// GET /api/assets/:id - Get single asset
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: {
        risks: {
          select: {
            id: true,
            title: true,
            risk_score: true,
            status: true
          }
        }
      }
    })

    if (!asset) {
      return res.status(404).json({ error: 'Ativo não encontrado' })
    }

    res.json(asset)
  } catch (error) {
    logger.error('[Assets] Error getting asset:', error)
    res.status(500).json({ error: 'Erro ao buscar ativo' })
  }
})

// ============================================
// POST /api/assets - Create asset
// ============================================
router.post('/', async (req, res) => {
  try {
    const {
      asset_code,
      name,
      description,
      asset_type,
      confidentiality_impact,
      integrity_impact,
      availability_impact,
      asset_owner_id,
      risk_owner_id,
      wazuh_agent_id,
      zabbix_host_id,
      tags,
    } = req.body

    // Calculate business_impact (max of CIA + weighted sum)
    const business_impact = Math.max(
      confidentiality_impact,
      integrity_impact,
      availability_impact
    ) + Math.ceil((confidentiality_impact + integrity_impact + availability_impact) / 3)

    const asset = await prisma.asset.create({
      data: {
        org_id: 'demo-org', // TODO: req.user.org_id
        asset_code,
        name,
        description,
        asset_type,
        confidentiality_impact: parseInt(confidentiality_impact),
        integrity_impact: parseInt(integrity_impact),
        availability_impact: parseInt(availability_impact),
        business_impact,
        asset_owner_id,
        risk_owner_id,
        wazuh_agent_id,
        zabbix_host_id,
        tags: tags || [],
      }
    })

    logger.info(`[Assets] Asset created: ${asset.id}`)
    res.status(201).json(asset)
  } catch (error) {
    logger.error('[Assets] Error creating asset:', error)
    res.status(500).json({ error: 'Erro ao criar ativo' })
  }
})

// ============================================
// PUT /api/assets/:id - Update asset
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const {
      asset_code,
      name,
      description,
      asset_type,
      confidentiality_impact,
      integrity_impact,
      availability_impact,
      asset_owner_id,
      risk_owner_id,
      wazuh_agent_id,
      zabbix_host_id,
      tags,
    } = req.body

    // Calculate business_impact
    const business_impact = Math.max(
      confidentiality_impact,
      integrity_impact,
      availability_impact
    ) + Math.ceil((confidentiality_impact + integrity_impact + availability_impact) / 3)

    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: {
        asset_code,
        name,
        description,
        asset_type,
        confidentiality_impact: parseInt(confidentiality_impact),
        integrity_impact: parseInt(integrity_impact),
        availability_impact: parseInt(availability_impact),
        business_impact,
        asset_owner_id,
        risk_owner_id,
        wazuh_agent_id,
        zabbix_host_id,
        tags: tags || [],
        updated_at: new Date(),
      }
    })

    logger.info(`[Assets] Asset updated: ${asset.id}`)
    res.json(asset)
  } catch (error) {
    logger.error('[Assets] Error updating asset:', error)
    res.status(500).json({ error: 'Erro ao atualizar ativo' })
  }
})

// ============================================
// DELETE /api/assets/:id - Delete asset
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    await prisma.asset.delete({
      where: { id: req.params.id }
    })

    logger.info(`[Assets] Asset deleted: ${req.params.id}`)
    res.json({ message: 'Ativo excluído com sucesso' })
  } catch (error) {
    logger.error('[Assets] Error deleting asset:', error)
    res.status(500).json({ error: 'Erro ao excluir ativo' })
  }
})

// ============================================
// GET /api/assets/:id/context - Asset context
// For Shuffle integration
// ============================================
router.get('/:id/context', async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: {
        risks: {
          include: {
            controlMappings: {
              include: {
                control: {
                  select: {
                    control_id: true,
                    title: true,
                    status: true,
                    effectiveness_score: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!asset) {
      return res.status(404).json({ error: 'Ativo não encontrado' })
    }

    // Build context
    const context = {
      asset: {
        id: asset.id,
        code: asset.asset_code,
        name: asset.name,
        type: asset.asset_type,
        business_impact: asset.business_impact,
        cia: {
          confidentiality: asset.confidentiality_impact,
          integrity: asset.integrity_impact,
          availability: asset.availability_impact
        }
      },
      risks: asset.risks.map(r => ({
        id: r.id,
        title: r.title,
        score: r.risk_score,
        status: r.status,
        controls: r.controlMappings.map(cm => cm.control)
      })),
      integration: {
        wazuh_agent_id: asset.wazuh_agent_id,
        zabbix_host_id: asset.zabbix_host_id
      }
    }

    res.json(context)
  } catch (error) {
    logger.error('[Assets] Error getting context:', error)
    res.status(500).json({ error: 'Erro ao buscar contexto' })
  }
})

module.exports = router


