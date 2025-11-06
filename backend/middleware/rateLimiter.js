/**
 * Rate Limiting Middleware
 * Protege contra abuso de API
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } = require('../config/constants');

/**
 * Rate limiter padrão
 * 100 requests por 15 minutos por IP
 */
const defaultLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // Retorna headers RateLimit-*
  legacyHeaders: false, // Desabilita X-RateLimit-*
  
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Você excedeu o limite de requisições. Tente novamente mais tarde.',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000 / 60), // minutos
    });
  },

  skip: (req) => {
    // Skip rate limit em desenvolvimento para endpoints de health
    if (process.env.NODE_ENV === 'development' && req.path === '/health') {
      return true;
    }
    return false;
  },
});

/**
 * Rate limiter restrito para endpoints sensíveis
 * 20 requests por 15 minutos
 */
const strictLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userId: req.user?.id,
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Muitas tentativas. Por favor, aguarde antes de tentar novamente.',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000 / 60),
    });
  },
});

/**
 * Rate limiter por usuário autenticado
 * 500 requests por 15 minutos por user_id
 */
const userLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  
  // Key por user_id ao invés de IP
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  
  handler: (req, res) => {
    logger.warn('User rate limit exceeded', {
      userId: req.user?.id,
      orgId: req.user?.orgId,
      path: req.path,
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Você excedeu o limite de requisições. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000 / 60),
    });
  },
});

module.exports = {
  defaultLimiter,
  strictLimiter,
  userLimiter,
};


