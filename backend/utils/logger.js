/**
 * Structured Logging with Winston
 * Substitui console.log/error por logging profissional
 */

const winston = require('winston');
const env = require('../config/env');

// Formatos personalizados
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}] ${message}`;
    
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    
    return msg;
  })
);

// Transports
const transports = [];

// Console (desenvolvimento)
if (env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  // Produção: JSON estruturado
  transports.push(
    new winston.transports.Console({
      format: customFormat,
    })
  );
}

// File transport (sempre ativo)
transports.push(
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: customFormat,
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: customFormat,
  })
);

// Logger instance
const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: customFormat,
  transports,
  exitOnError: false,
});

// Helper methods
logger.request = (req, meta = {}) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...meta,
  });
};

logger.response = (req, res, duration, meta = {}) => {
  logger.info('HTTP Response', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ...meta,
  });
};

// Error com context
logger.errorWithContext = (message, error, context = {}) => {
  logger.error(message, {
    error: error.message,
    stack: error.stack,
    ...context,
  });
};

module.exports = logger;




