/**
 * API Routes - Reports (PDF Export)
 */

const express = require('express');
const router = express.Router();
const pdfGenerator = require('../services/pdf-generator');
const { generateExecutiveSummary } = require('../templates/pdf-executive');
const { generateRiskRegister } = require('../templates/pdf-risk-register');
const { generateSoA } = require('../templates/pdf-soa');
const { generateIncidentReport } = require('../templates/pdf-incident');
const logger = require('../utils/logger');
const supabase = require('../utils/supabase');

/**
 * GET /api/reports/executive-pdf
 * Gera PDF do Executive Summary
 */
router.get('/executive-pdf', async (req, res) => {
  try {
    logger.info('[Reports] Gerando Executive Summary PDF');

    // Buscar dados do Supabase
    const [risksRes, incidentsRes] = await Promise.all([
      supabase
        .from('risks')
        .select('*, assets(name), threats(name), vulnerabilities(name)')
        .order('inherent_risk', { ascending: false }),
      supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    const risks = risksRes.data || [];
    const incidents = incidentsRes.data || [];

    // Calcular KPIs
    const kpis = {
      riskScore: risks.length > 0 ? (risks.reduce((acc, r) => acc + (r.inherent_risk || 0), 0) / risks.length).toFixed(1) : 0,
      incidents: incidents.length,
      vulnerabilities: risks.length,
      complianceScore: 75 // Placeholder - calcular real depois
    };

    // Gerar HTML
    const html = generateExecutiveSummary({
      kpis,
      risks: risks.map(r => ({
        ...r,
        asset_name: r.assets?.name || 'N/A',
        threat_name: r.threats?.name || 'N/A',
        vulnerability_name: r.vulnerabilities?.name || 'N/A'
      })),
      incidents,
      compliance: {
        iso27001: 75,
        lgpd: 80,
        nist: 70,
        cis: 65
      }
    });

    // Gerar PDF
    const pdf = await pdfGenerator.generateFromHTML(html);

    // Enviar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="executive-summary-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdf);

    logger.info('[Reports] Executive Summary PDF gerado com sucesso');
  } catch (error) {
    logger.error('[Reports] Erro ao gerar Executive PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF', details: error.message });
  }
});

/**
 * GET /api/reports/risk-register-pdf
 * Gera PDF do Risk Register
 */
router.get('/risk-register-pdf', async (req, res) => {
  try {
    logger.info('[Reports] Gerando Risk Register PDF');

    // Buscar riscos
    const { data: risks } = await supabase
      .from('risks')
      .select('*, assets(name), threats(name), vulnerabilities(name)')
      .order('inherent_risk', { ascending: false });

    // Gerar HTML
    const html = generateRiskRegister((risks || []).map(r => ({
      ...r,
      asset_name: r.assets?.name || 'N/A',
      threat_name: r.threats?.name || 'N/A',
      vulnerability_name: r.vulnerabilities?.name || 'N/A'
    })));

    // Gerar PDF
    const pdf = await pdfGenerator.generateFromHTML(html);

    // Enviar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="risk-register-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdf);

    logger.info('[Reports] Risk Register PDF gerado com sucesso');
  } catch (error) {
    logger.error('[Reports] Erro ao gerar Risk Register PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF', details: error.message });
  }
});

/**
 * GET /api/reports/soa-pdf
 * Gera PDF do Statement of Applicability
 */
router.get('/soa-pdf', async (req, res) => {
  try {
    logger.info('[Reports] Gerando Statement of Applicability PDF');

    // Buscar controles
    const { data: controls } = await supabase
      .from('controls')
      .select('*')
      .order('name');

    // Gerar HTML
    const html = generateSoA({
      controls: controls || [],
      framework: 'ISO/IEC 27001:2022',
      organizationName: 'ness.',
      scope: 'Sistemas de informação, infraestrutura de TI e processos relacionados à segurança da informação'
    });

    // Gerar PDF
    const pdf = await pdfGenerator.generateFromHTML(html);

    // Enviar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="soa-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdf);

    logger.info('[Reports] SoA PDF gerado com sucesso');
  } catch (error) {
    logger.error('[Reports] Erro ao gerar SoA PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF', details: error.message });
  }
});

/**
 * GET /api/reports/incident-pdf/:id
 * Gera PDF de Incident Report
 */
router.get('/incident-pdf/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`[Reports] Gerando Incident Report PDF #${id}`);

    // Buscar incident
    const { data: incident } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single();

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Gerar HTML
    const html = generateIncidentReport(incident);

    // Gerar PDF
    const pdf = await pdfGenerator.generateFromHTML(html);

    // Enviar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="incident-${id}-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdf);

    logger.info(`[Reports] Incident #${id} PDF gerado com sucesso`);
  } catch (error) {
    logger.error(`[Reports] Erro ao gerar Incident PDF:`, error);
    res.status(500).json({ error: 'Erro ao gerar PDF', details: error.message });
  }
});

/**
 * GET /api/reports/health
 * Health check do serviço de PDF
 */
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'ok',
      service: 'PDF Reports',
      puppeteer: 'ready'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;

