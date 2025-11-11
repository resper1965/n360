/**
 * Compliance Routes - Dynamic SoA (Statement of Applicability)
 * GRC ISMS Evolution - Module 5
 */

const express = require('express')
const router = express.Router()
const { prisma } = require('../lib/prisma')
const logger = require('../utils/logger')

// ============================================
// GET /api/compliance/frameworks
// List supported frameworks
// ============================================
router.get('/frameworks', (req, res) => {
  const frameworks = [
    {
      code: 'ISO 27001',
      name: 'ISO/IEC 27001:2022',
      description: 'Information Security Management',
      total_controls: 93,
      category: 'security'
    },
    {
      code: 'NIST CSF',
      name: 'NIST Cybersecurity Framework',
      description: 'Identify, Protect, Detect, Respond, Recover',
      total_controls: 108,
      category: 'security'
    },
    {
      code: 'CIS',
      name: 'CIS Controls v8',
      description: 'Center for Internet Security Controls',
      total_controls: 153,
      category: 'security'
    },
    {
      code: 'PCI-DSS',
      name: 'PCI-DSS v4.0',
      description: 'Payment Card Industry Data Security Standard',
      total_controls: 64,
      category: 'compliance'
    },
    {
      code: 'LGPD',
      name: 'Lei Geral de Proteção de Dados',
      description: 'Brazilian Data Protection Law',
      total_controls: 45,
      category: 'privacy'
    },
    {
      code: 'SOC2',
      name: 'SOC 2 Type II',
      description: 'Service Organization Control',
      total_controls: 64,
      category: 'compliance'
    }
  ]

  res.json({ data: frameworks })
})

// ============================================
// GET /api/compliance/score
// Calculate compliance score by framework
// ============================================
router.get('/score', async (req, res) => {
  try {
    const { framework = 'all' } = req.query

    // Get all controls grouped by framework
    const where = {}
    if (framework !== 'all') {
      where.framework = framework
    }

    const controls = await prisma.control.findMany({
      where,
      select: {
        framework: true,
        status: true,
        effectiveness_score: true
      }
    })

    // Group by framework
    const byFramework = {}
    controls.forEach(control => {
      if (!byFramework[control.framework]) {
        byFramework[control.framework] = {
          total: 0,
          implemented: 0,
          verified: 0,
          effectiveness_sum: 0,
          effectiveness_count: 0
        }
      }

      const fw = byFramework[control.framework]
      fw.total++

      if (control.status === 'implemented' || control.status === 'verified') {
        fw.implemented++
      }

      if (control.status === 'verified') {
        fw.verified++
      }

      if (control.effectiveness_score !== null) {
        fw.effectiveness_sum += control.effectiveness_score
        fw.effectiveness_count++
      }
    })

    // Calculate scores
    const scores = Object.keys(byFramework).map(framework => {
      const fw = byFramework[framework]
      const compliance_percentage = fw.total > 0 ? (fw.implemented / fw.total) * 100 : 0
      const avg_effectiveness = fw.effectiveness_count > 0 ? fw.effectiveness_sum / fw.effectiveness_count : null

      return {
        framework,
        total_controls: fw.total,
        implemented_controls: fw.implemented,
        verified_controls: fw.verified,
        compliance_percentage: parseFloat(compliance_percentage.toFixed(2)),
        avg_effectiveness: avg_effectiveness ? parseFloat(avg_effectiveness.toFixed(2)) : null
      }
    })

    res.json({ data: scores })
  } catch (error) {
    logger.error('[Compliance] Error:', error)
    res.status(500).json({ error: 'Erro ao calcular score de conformidade' })
  }
})

// ============================================
// GET /api/compliance/soa
// Generate Statement of Applicability (ISO 27001)
// ============================================
router.get('/soa', async (req, res) => {
  try {
    const { framework = 'ISO 27001' } = req.query

    const controls = await prisma.control.findMany({
      where: { framework },
      orderBy: { control_id: 'asc' },
      include: {
        riskMappings: {
          include: {
            risk: { select: { title: true, risk_score: true } }
          }
        },
        testExecutions: {
          take: 1,
          orderBy: { tested_at: 'desc' }
        }
      }
    })

    const soa = controls.map(control => ({
      control_id: control.control_id,
      control_title: control.title,
      applicable: control.status !== 'not_implemented',
      implementation_status: control.status,
      effectiveness_score: control.effectiveness_score,
      last_tested: control.last_tested,
      test_result: control.test_result,
      justification: control.implementation_notes || 'N/A',
      mapped_risks: control.riskMappings.map(rm => rm.risk.title).join(', '),
      evidence_url: control.evidence_url,
      responsible_team: control.responsible_team
    }))

    res.json({
      framework,
      generated_at: new Date(),
      total_controls: soa.length,
      applicable_controls: soa.filter(c => c.applicable).length,
      implemented_controls: soa.filter(c => c.implementation_status === 'implemented' || c.implementation_status === 'verified').length,
      data: soa
    })
  } catch (error) {
    logger.error('[Compliance] Error:', error)
    res.status(500).json({ error: 'Erro ao gerar SoA' })
  }
})

// ============================================
// GET /api/compliance/gaps
// Find compliance gaps
// ============================================
router.get('/gaps', async (req, res) => {
  try {
    const { framework = 'all' } = req.query

    const where = { 
      status: { in: ['not_implemented', 'planned', 'partial'] }
    }
    if (framework !== 'all') {
      where.framework = framework
    }

    const gaps = await prisma.control.findMany({
      where,
      orderBy: { framework: 'asc' },
      include: {
        riskMappings: {
          include: {
            risk: { select: { title: true, risk_score: true } }
          }
        }
      }
    })

    // Group by framework
    const byFramework = {}
    gaps.forEach(control => {
      if (!byFramework[control.framework]) {
        byFramework[control.framework] = []
      }
      byFramework[control.framework].push({
        control_id: control.control_id,
        title: control.title,
        status: control.status,
        high_risk: control.riskMappings.some(rm => rm.risk.risk_score >= 15)
      })
    })

    res.json({
      total_gaps: gaps.length,
      by_framework: byFramework
    })
  } catch (error) {
    logger.error('[Compliance] Error:', error)
    res.status(500).json({ error: 'Erro ao buscar gaps' })
  }
})

module.exports = router



