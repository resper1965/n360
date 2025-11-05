const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { validate, paginationSchema, uuidParamSchema } = require('../middleware/validation');
const { userLimiter, strictLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');
const { z } = require('zod');

const router = express.Router();

// Schema de validação para Control
const controlSchema = z.object({
  control_id: z.string().min(3).max(50),
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  framework: z.string().min(2).max(50),
  control_type: z.enum(['preventive', 'detective', 'corrective', 'compensating']),
  category: z.string().max(50).optional(),
  status: z.enum(['not_implemented', 'planned', 'partial', 'implemented', 'verified']).default('not_implemented'),
  implementation_notes: z.string().optional(),
  effectiveness_score: z.number().min(0).max(1).optional(),
  test_frequency: z.number().int().positive().optional(),
  evidence_url: z.string().url().optional(),
  evidence_description: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  responsible_team: z.string().max(100).optional(),
  related_policies: z.array(z.string().uuid()).optional(),
  related_risks: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/controls - Listar todos os controles
router.get(
  '/',
  requireAuth,
  userLimiter,
  validate(paginationSchema, 'query'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, framework, status, search } = req.query;
      const offset = (page - 1) * limit;
      const { supabase } = req;

      let query = supabase
        .from('controls')
        .select('*', { count: 'exact' })
        .order('framework', { ascending: true })
        .order('control_id', { ascending: true })
        .range(offset, offset + limit - 1);

      // Filtros opcionais
      if (framework && framework !== 'all') query = query.eq('framework', framework);
      if (status && status !== 'all') query = query.eq('status', status);
      if (search) query = query.or(`title.ilike.%${search}%,control_id.ilike.%${search}%`);

      const { data, error, count } = await query;

      if (error) throw error;

      logger.info('Controls fetched', {
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
      logger.errorWithContext('Controls fetch error', error, {
        userId: req.user?.id,
        orgId: req.user?.orgId,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar controles'
      });
    }
  }
);

// GET /api/controls/:id - Buscar controle por ID
router.get(
  '/:id',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      const { data, error } = await supabase
        .from('controls')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Controle não encontrado'
        });
      }

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Control fetch error', error, {
        controlId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar controle'
      });
    }
  }
);

// POST /api/controls - Criar novo controle
router.post(
  '/',
  requireAuth,
  strictLimiter,
  validate(controlSchema, 'body'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const controlData = {
        ...req.body,
        created_by: req.user.id,
      };

      // Calcular next_test_date se test_frequency fornecido
      if (controlData.test_frequency && !controlData.next_test_date) {
        const nextTest = new Date();
        nextTest.setDate(nextTest.getDate() + controlData.test_frequency);
        controlData.next_test_date = nextTest.toISOString();
      }

      const { data, error } = await supabase
        .from('controls')
        .insert(controlData)
        .select()
        .single();

      if (error) throw error;

      logger.info('Control created', {
        controlId: data.id,
        userId: req.user.id,
        framework: data.framework,
      });

      res.status(201).json(data);
    } catch (error) {
      logger.errorWithContext('Control create error', error, {
        userId: req.user?.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao criar controle'
      });
    }
  }
);

// PATCH /api/controls/:id - Atualizar controle
router.patch(
  '/:id',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  validate(controlSchema.partial(), 'body'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('controls')
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
          message: 'Controle não encontrado'
        });
      }

      logger.info('Control updated', {
        controlId: data.id,
        userId: req.user.id,
      });

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Control update error', error, {
        controlId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao atualizar controle'
      });
    }
  }
);

// DELETE /api/controls/:id - Deletar controle
router.delete(
  '/:id',
  requireAuth,
  strictLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { error } = await supabase
        .from('controls')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      logger.info('Control deleted', {
        controlId: req.params.id,
        userId: req.user.id,
      });

      res.status(204).send();
    } catch (error) {
      logger.errorWithContext('Control delete error', error, {
        controlId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao deletar controle'
      });
    }
  }
);

// POST /api/controls/:id/test - Registrar teste de controle
router.post(
  '/:id/test',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      const { test_result, effectiveness_score, evidence_url, evidence_description } = req.body;

      // Buscar controle para pegar test_frequency
      const { data: control } = await supabase
        .from('controls')
        .select('test_frequency')
        .eq('id', req.params.id)
        .single();

      // Calcular próxima data de teste
      let next_test_date = null;
      if (control?.test_frequency) {
        const nextTest = new Date();
        nextTest.setDate(nextTest.getDate() + control.test_frequency);
        next_test_date = nextTest.toISOString();
      }

      const { data, error } = await supabase
        .from('controls')
        .update({
          last_tested: new Date().toISOString(),
          test_result: test_result || 'passed',
          effectiveness_score: effectiveness_score || null,
          evidence_url: evidence_url || null,
          evidence_description: evidence_description || null,
          next_test_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Controle não encontrado'
        });
      }

      logger.info('Control tested', {
        controlId: data.id,
        userId: req.user.id,
        result: test_result,
      });

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Control test error', error, {
        controlId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao registrar teste'
      });
    }
  }
);

// GET /api/controls/compliance/score - Score de conformidade por framework
router.get(
  '/compliance/score',
  requireAuth,
  userLimiter,
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('compliance_score_by_framework')
        .select('*');

      if (error) throw error;

      res.json({ data });
    } catch (error) {
      logger.errorWithContext('Compliance score error', error);
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar score de conformidade'
      });
    }
  }
);

// GET /api/controls/overdue - Controles com testes vencidos
router.get(
  '/overdue/list',
  requireAuth,
  userLimiter,
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('overdue_controls')
        .select('*');

      if (error) throw error;

      res.json({ data });
    } catch (error) {
      logger.errorWithContext('Overdue controls error', error);
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar controles vencidos'
      });
    }
  }
);

module.exports = router;

