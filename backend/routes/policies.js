const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { validate, paginationSchema, uuidParamSchema } = require('../middleware/validation');
const { userLimiter, strictLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');
const { z } = require('zod');

const router = express.Router();

// Schema de validação para Policy
const policySchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  content: z.string().optional(), // Markdown content
  category: z.enum(['security', 'privacy', 'compliance', 'operational', 'hr']),
  framework: z.string().max(50).optional(),
  version: z.string().max(20).default('1.0'),
  effective_date: z.string().datetime().optional(),
  review_date: z.string().datetime().optional(),
  owner_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/policies - Listar todas as políticas
router.get(
  '/',
  requireAuth,
  userLimiter,
  validate(paginationSchema, 'query'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status, category, search } = req.query;
      const offset = (page - 1) * limit;
      const { supabase } = req;

      let query = supabase
        .from('policies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtros opcionais
      if (status && status !== 'all') query = query.eq('status', status);
      if (category && category !== 'all') query = query.eq('category', category);
      if (search) query = query.ilike('title', `%${search}%`);

      const { data, error, count } = await query;

      if (error) throw error;

      logger.info('Policies fetched', {
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
      logger.errorWithContext('Policies fetch error', error, {
        userId: req.user?.id,
        orgId: req.user?.orgId,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar políticas'
      });
    }
  }
);

// GET /api/policies/:id - Buscar política por ID
router.get(
  '/:id',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Política não encontrada'
        });
      }

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Policy fetch error', error, {
        policyId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar política'
      });
    }
  }
);

// POST /api/policies - Criar nova política
router.post(
  '/',
  requireAuth,
  strictLimiter,
  validate(policySchema, 'body'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const policyData = {
        ...req.body,
        created_by: req.user.id,
        status: 'draft',
      };

      const { data, error } = await supabase
        .from('policies')
        .insert(policyData)
        .select()
        .single();

      if (error) throw error;

      logger.info('Policy created', {
        policyId: data.id,
        userId: req.user.id,
        category: data.category,
      });

      res.status(201).json(data);
    } catch (error) {
      logger.errorWithContext('Policy create error', error, {
        userId: req.user?.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao criar política'
      });
    }
  }
);

// PATCH /api/policies/:id - Atualizar política
router.patch(
  '/:id',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  validate(policySchema.partial(), 'body'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('policies')
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
          message: 'Política não encontrada'
        });
      }

      logger.info('Policy updated', {
        policyId: data.id,
        userId: req.user.id,
      });

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Policy update error', error, {
        policyId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao atualizar política'
      });
    }
  }
);

// DELETE /api/policies/:id - Deletar política
router.delete(
  '/:id',
  requireAuth,
  strictLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      logger.info('Policy deleted', {
        policyId: req.params.id,
        userId: req.user.id,
      });

      res.status(204).send();
    } catch (error) {
      logger.errorWithContext('Policy delete error', error, {
        policyId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao deletar política'
      });
    }
  }
);

// POST /api/policies/:id/submit - Submeter para aprovação
router.post(
  '/:id/submit',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('policies')
        .update({
          status: 'review',
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .eq('status', 'draft') // Só pode submeter se estiver em draft
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Política não encontrada ou não está em rascunho'
        });
      }

      logger.info('Policy submitted for review', {
        policyId: data.id,
        userId: req.user.id,
      });

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Policy submit error', error, {
        policyId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao submeter política'
      });
    }
  }
);

// POST /api/policies/:id/approve - Aprovar política
router.post(
  '/:id/approve',
  requireAuth,
  strictLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('policies')
        .update({
          status: 'approved',
          approved_by: req.user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .eq('status', 'review') // Só pode aprovar se estiver em review
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Política não encontrada ou não está em revisão'
        });
      }

      logger.info('Policy approved', {
        policyId: data.id,
        approvedBy: req.user.id,
      });

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Policy approve error', error, {
        policyId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao aprovar política'
      });
    }
  }
);

// POST /api/policies/:id/activate - Ativar política aprovada
router.post(
  '/:id/activate',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('policies')
        .update({
          status: 'active',
          effective_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .eq('status', 'approved')
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Política não encontrada ou não está aprovada'
        });
      }

      logger.info('Policy activated', {
        policyId: data.id,
        userId: req.user.id,
      });

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Policy activate error', error, {
        policyId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao ativar política'
      });
    }
  }
);

// POST /api/policies/:id/archive - Arquivar política
router.post(
  '/:id/archive',
  requireAuth,
  userLimiter,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { supabase } = req;
      
      const { data, error } = await supabase
        .from('policies')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Política não encontrada'
        });
      }

      logger.info('Policy archived', {
        policyId: data.id,
        userId: req.user.id,
      });

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Policy archive error', error, {
        policyId: req.params.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao arquivar política'
      });
    }
  }
);

module.exports = router;


