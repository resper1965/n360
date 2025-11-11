/**
 * Risk Engine v2.0 - Advanced Risk Calculation
 * GRC ISMS Evolution - Module 3
 * 
 * Formula: Risk = Asset (CIA) × Threat (Likelihood) × Vulnerability (Severity)
 */

const express = require('express')
const router = express.Router()
const { prisma } = require('../lib/prisma')
const logger = require('../utils/logger')

// ============================================
// POST /api/risk-engine/calculate
// Calculate inherent risk using TVL method
// ============================================
router.post('/calculate', async (req, res) => {
  try {
    const { asset_id, threat_id, vulnerability_id } = req.body

    // Get entities
    const [asset, threat, vulnerability] = await Promise.all([
      prisma.asset.findUnique({ where: { id: asset_id } }),
      prisma.threat.findUnique({ where: { id: threat_id } }),
      prisma.vulnerability.findUnique({ where: { id: vulnerability_id } })
    ])

    if (!asset || !threat || !vulnerability) {
      return res.status(404).json({ error: 'Asset, Threat ou Vulnerability não encontrados' })
    }

    // Calculate inherent risk
    // Likelihood = Threat likelihood
    const inherent_likelihood = threat.likelihood_score

    // Impact = Asset business impact (driven by CIA)
    const inherent_impact = asset.business_impact

    // Inherent Score
    const inherent_score = inherent_likelihood * inherent_impact

    // Risk classification
    let risk_level = 'low'
    if (inherent_score >= 20) risk_level = 'critical'
    else if (inherent_score >= 15) risk_level = 'high'
    else if (inherent_score >= 6) risk_level = 'medium'

    res.json({
      inherent_likelihood,
      inherent_impact,
      inherent_score,
      risk_level,
      asset: {
        id: asset.id,
        name: asset.name,
        business_impact: asset.business_impact
      },
      threat: {
        id: threat.id,
        name: threat.name,
        likelihood_score: threat.likelihood_score
      },
      vulnerability: {
        id: vulnerability.id,
        name: vulnerability.name,
        severity_score: vulnerability.severity_score
      }
    })
  } catch (error) {
    logger.error('[RiskEngine] Error calculating risk:', error)
    res.status(500).json({ error: 'Erro ao calcular risco' })
  }
})

// ============================================
// POST /api/risk-engine/residual
// Calculate residual risk after controls
// ============================================
router.post('/residual', async (req, res) => {
  try {
    const { risk_id } = req.body

    // Get risk with controls
    const risk = await prisma.risk.findUnique({
      where: { id: risk_id },
      include: {
        controlMappings: {
          include: {
            control: {
              select: {
                effectiveness_score: true,
                status: true
              }
            }
          }
        }
      }
    })

    if (!risk) {
      return res.status(404).json({ error: 'Risco não encontrado' })
    }

    // Calculate total control effectiveness
    const effectiveControls = risk.controlMappings.filter(
      cm => cm.control.status === 'implemented' || cm.control.status === 'verified'
    )

    const totalEffectiveness = effectiveControls.reduce(
      (sum, cm) => sum + (cm.control.effectiveness_score || 0),
      0
    )

    // Residual Risk = Inherent Risk × (1 - Total Effectiveness)
    // Cap effectiveness at 0.95 (never 100% reduction)
    const cappedEffectiveness = Math.min(totalEffectiveness, 0.95)
    
    const residual_likelihood = Math.ceil(risk.likelihood * (1 - cappedEffectiveness))
    const residual_impact = risk.impact // Impact doesn't change
    const residual_score = residual_likelihood * residual_impact

    // Classification
    let residual_level = 'low'
    if (residual_score >= 20) residual_level = 'critical'
    else if (residual_score >= 15) residual_level = 'high'
    else if (residual_score >= 6) residual_level = 'medium'

    res.json({
      risk_id: risk.id,
      inherent: {
        likelihood: risk.likelihood,
        impact: risk.impact,
        score: risk.risk_score
      },
      residual: {
        likelihood: residual_likelihood,
        impact: residual_impact,
        score: residual_score,
        level: residual_level
      },
      controls: {
        total: risk.controlMappings.length,
        effective: effectiveControls.length,
        total_effectiveness: cappedEffectiveness,
        risk_reduction_percentage: (cappedEffectiveness * 100).toFixed(1)
      }
    })
  } catch (error) {
    logger.error('[RiskEngine] Error calculating residual:', error)
    res.status(500).json({ error: 'Erro ao calcular risco residual' })
  }
})

// ============================================
// POST /api/risk-engine/map
// Map Risk to Threat + Vulnerability
// ============================================
router.post('/map', async (req, res) => {
  try {
    const { risk_id, threat_id, vulnerability_id } = req.body

    // Calculate inherent values first
    const calculation = await calculateInherent(risk_id, threat_id, vulnerability_id)

    // Create mapping
    const mapping = await prisma.riskThreatVuln.create({
      data: {
        risk_id,
        threat_id,
        vulnerability_id,
        inherent_likelihood: calculation.inherent_likelihood,
        inherent_impact: calculation.inherent_impact,
        inherent_score: calculation.inherent_score
      }
    })

    logger.info(`[RiskEngine] Mapping created: ${mapping.id}`)
    res.status(201).json(mapping)
  } catch (error) {
    logger.error('[RiskEngine] Error creating mapping:', error)
    res.status(500).json({ error: 'Erro ao mapear risco' })
  }
})

// Helper function
async function calculateInherent(risk_id, threat_id, vulnerability_id) {
  const risk = await prisma.risk.findUnique({
    where: { id: risk_id },
    include: { asset: true }
  })
  
  const threat = await prisma.threat.findUnique({ where: { id: threat_id } })
  const vulnerability = await prisma.vulnerability.findUnique({ where: { id: vulnerability_id } })

  const inherent_likelihood = threat.likelihood_score
  const inherent_impact = risk.asset?.business_impact || risk.impact
  const inherent_score = inherent_likelihood * inherent_impact

  return { inherent_likelihood, inherent_impact, inherent_score }
}

module.exports = router



