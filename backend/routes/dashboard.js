/**
 * Dashboard Routes
 * GET /api/dashboard/*
 */

const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
  
  // GET /api/dashboard/ciso
  router.get('/ciso', async (req, res) => {
    try {
      const orgId = req.query.org_id || '550e8400-e29b-41d4-a716-446655440000'; // Demo org
      
      // Buscar dados consolidados
      const { data, error } = await supabase
        .from('dashboard_ciso')
        .select('*')
        .eq('org_id', orgId)
        .single();
      
      if (error) throw error;
      
      // Buscar top 5 riscos críticos
      const { data: topRisks } = await supabase
        .from('risks')
        .select('*')
        .eq('org_id', orgId)
        .order('risk_score', { ascending: false })
        .limit(5);
      
      // Buscar alertas críticos recentes (24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: criticalAlerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('org_id', orgId)
        .in('severity', ['high', 'critical'])
        .eq('status', 'open')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);
      
      res.json({
        summary: data || {
          avg_risk_score: 0,
          open_risks: 0,
          avg_compliance: 0,
          critical_alerts: 0,
          critical_problems: 0,
          open_tickets: 0
        },
        topRisks: topRisks || [],
        criticalAlerts: criticalAlerts || []
      });
      
    } catch (error) {
      console.error('[Dashboard CISO] Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/dashboard/soc
  router.get('/soc', async (req, res) => {
    try {
      const orgId = req.query.org_id || '550e8400-e29b-41d4-a716-446655440000';
      
      // Alertas por severidade
      const { data: alertsBySeverity } = await supabase
        .from('alerts')
        .select('severity, count', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('status', 'open');
      
      // Alertas recentes (7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentAlerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('org_id', orgId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);
      
      res.json({
        alertsBySeverity: alertsBySeverity || [],
        recentAlerts: recentAlerts || []
      });
      
    } catch (error) {
      console.error('[Dashboard SOC] Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/dashboard/noc
  router.get('/noc', async (req, res) => {
    try {
      const orgId = req.query.org_id || '550e8400-e29b-41d4-a716-446655440000';
      
      // Problemas ativos
      const { data: activeProblems } = await supabase
        .from('problems')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('severity', { ascending: false })
        .limit(50);
      
      // Assets monitorados
      const { data: assets, count: totalAssets } = await supabase
        .from('assets')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId);
      
      res.json({
        activeProblems: activeProblems || [],
        totalAssets: totalAssets || 0,
        assets: assets || []
      });
      
    } catch (error) {
      console.error('[Dashboard NOC] Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};

