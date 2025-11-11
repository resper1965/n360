const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { validate, paginationSchema, uuidParamSchema } = require('../middleware/validation');
const { userLimiter, strictLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');
const { z } = require('zod');

const router = express.Router();

// Schema de validação para Risk
const riskSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  category: z.enum(['operational', 'financial', 'strategic', 'compliance', 'cyber', 'reputational']),
  asset_type: z.string().max(50).optional(),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  treatment: z.enum(['mitigate', 'accept', 'transfer', 'avoid']).default('mitigate'),
  mitigation_plan: z.string().optional(),
  mitigation_status: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
  residual_likelihood: z.number().int().min(1).max(5).optional(),
  residual_impact: z.number().int().min(1).max(5).optional(),
  target_date: z.string().datetime().optional(),
  owner_id: z.string().uuid().optional(),
  related_controls: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/risks - Listar todos os riscos
router.get(
  '/',
  requireAuth,
  userLimiter,
  validate(paginationSchema, 'query'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status, category, severity, search } = req.query;
      const offset = (page - 1) * limit;
      const { supabase } = req;

      let query = supabase
        .from('risks')
        .select('*', { count: 'exact' })
        .order('risk_score', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtros opcionais
      if (status && status !== 'all') query = query.eq('status', status);
      if (category && category !== 'all') query = query.eq('category', category);
      if (search) query = query.ilike('title', `%${search}%`);
      
      // Filtro por severity (baseado em risk_score)
      if (severity === 'critical') query = query.gte('risk_score', 20);
      else if (severity === 'high') query = query.gte('risk_score', 15).lt('risk_score', 20);
      else if (severity === 'medium') query = query.gte('risk_score', 6).lt('risk_score', 15);
      else if (severity === 'low') query = query.lt('risk_score', 6);

      const { data, error, count } = await query;

      if (error) throw error;

      logger.info('Risks fetched', {
        orgId: req.user.orgId,
        count: data.length,
        total: count,
      });

      res.json({
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        }
      });
    } catch (error) {
      logger.errorWithContext('Risks fetch error', error, {
        userId: req.user?.id,
        orgId: req.user?.orgId,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar riscos'
      });
    }
  }
);

// GET /api/risks/:id - Buscar risco por ID
router.get(
  '/:id',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Risco não encontrado'
        });
      }

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Risk fetch error', error, {
        riskId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar risco'
      });
    }
  }
);

// POST /api/risks - Criar novo risco
router.post(
  '/',
  requireAuth,
  strictLimiter,
  validate(riskSchema, 'body'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const riskData = {
        ...req.body,
        created_by: req.user.id,
        status: 'open',
      };

      const { data, error } = await supabase
        .from('risks')
        .insert(riskData)
        .select()
        .single();

      if (error) throw error;

      logger.info('Risk created', {
        riskId: data.id,
        userId: req.user.id,
        riskScore: data.risk_score,
      });

      res.status(201).json(data);
    } catch (error) {
      logger.errorWithContext('Risk create error', error, {
        userId: req.user?.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao criar risco'
      });
    }
  }
);

// PATCH /api/risks/:id - Atualizar risco
router.patch(
  '/:id',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  validate(riskSchema.partial(), 'body'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('risks')
        .update({
          ...req.body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Risco não encontrado'
        });
      }

      logger.info('Risk updated', {
        riskId: data.id,
        userId: req.user.id,
      });

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Risk update error', error, {
        riskId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao atualizar risco'
      });
    }
  }
);

// DELETE /api/risks/:id - Deletar risco
router.delete(
  '/:id',
  requireAuth,
  strictLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { error } = await supabase
        .from('risks')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      logger.info('Risk deleted', {
        riskId: req.params.id,
        userId: req.user.id,
      });

      res.status(204).send();
    } catch (error) {
      logger.errorWithContext('Risk delete error', error, {
        riskId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao deletar risco'
      });
    }
  }
);

// GET /api/risks/matrix/data - Dados para Risk Matrix (Heat Map)
router.get(
  '/matrix/data',
  requireAuth,
  userLimiter,
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('risk_matrix')
        .select('*');

      if (error) throw error;

      // Transformar em matriz 5x5
      const matrix = Array(5).fill().map(() => Array(5).fill({ count: 0, risks: [] }));
      
      data.forEach(cell => {
        const row = cell.likelihood - 1; // 0-4
        const col = cell.impact - 1; // 0-4
        matrix[row][col] = {
          count: cell.count,
          risks: cell.risk_ids,
          titles: cell.risk_titles,
          score: cell.risk_score,
        };
      });

      res.json({ matrix });
    } catch (error) {
      logger.errorWithContext('Risk matrix error', error);
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar matriz de riscos'
      });
    }
  }
);

// PATCH /api/risks/:id/close - Fechar risco
router.patch(
  '/:id/close',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('risks')
        .update({
          status: 'closed',
          closed_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Risco não encontrado'
        });
      }

      logger.info('Risk closed', {
        riskId: data.id,
        userId: req.user.id,
      });

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Risk close error', error, {
        riskId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao fechar risco'
      });
    }
  }
);

module.exports = router;



