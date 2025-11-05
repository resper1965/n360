/**
 * Request Validation Middleware
 * Valida inputs usando zod schemas
 */

const { z } = require('zod');
const logger = require('../utils/logger');
const {
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  ALERT_SEVERITIES,
} = require('../config/constants');

/**
 * Middleware genérico de validação
 * @param {z.ZodSchema} schema - Schema zod para validação
 * @param {string} source - Onde validar: 'body', 'query', 'params'
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req[source]);
      req[source] = validated; // Substitui pelos dados validados/transformados
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error', {
          source,
          errors: error.errors,
          path: req.path,
          userId: req.user?.id,
        });

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Dados inválidos fornecidos',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      // Erro inesperado
      logger.errorWithContext('Unexpected validation error', error, {
        source,
        path: req.path,
      });

      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao validar dados',
      });
    }
  };
}

// ============================================================
// Schemas Reutilizáveis
// ============================================================

const ticketCreateSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(255),
  description: z.string().max(5000).optional(),
  type: z.enum(TICKET_TYPES, {
    errorMap: () => ({ message: `Tipo deve ser um de: ${TICKET_TYPES.join(', ')}` }),
  }),
  priority: z.enum(TICKET_PRIORITIES, {
    errorMap: () => ({ message: `Prioridade deve ser uma de: ${TICKET_PRIORITIES.join(', ')}` }),
  }),
  assigned_to: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

const ticketUpdateSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(500)).default('50'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const alertFilterSchema = z.object({
  severity: z.enum([...ALERT_SEVERITIES, 'all']).default('all'),
  status: z.enum(['open', 'closed', 'all']).default('all'),
  source: z.string().optional(),
  search: z.string().optional(),
}).merge(paginationSchema);

const uuidParamSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

// ============================================================
// Exports
// ============================================================

module.exports = {
  validate,
  
  // Schemas
  ticketCreateSchema,
  ticketUpdateSchema,
  paginationSchema,
  alertFilterSchema,
  uuidParamSchema,
};


