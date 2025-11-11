/**
 * Retry Utilities
 * Exponential backoff e circuit breaker para requisições HTTP
 */

const logger = require('./logger');
const { HTTP_RETRY_ATTEMPTS, HTTP_RETRY_DELAY_MS } = require('../config/constants');

/**
 * Retry com exponential backoff
 * @param {Function} fn - Função async para tentar
 * @param {Object} options - Opções de retry
 * @returns {Promise} - Resultado da função
 */
async function retryWithBackoff(fn, options = {}) {
  const {
    maxAttempts = HTTP_RETRY_ATTEMPTS,
    initialDelay = HTTP_RETRY_DELAY_MS,
    maxDelay = 30000, // 30 segundos
    factor = 2, // Exponential: 1s, 2s, 4s, 8s...
    onRetry = null,
    shouldRetry = (error) => true,
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Verificar se deve tentar novamente
      if (!shouldRetry(error)) {
        logger.debug('Retry abortado: erro não retryable', {
          error: error.message,
          attempt,
        });
        throw error;
      }

      // Última tentativa: não fazer retry
      if (attempt === maxAttempts) {
        logger.warn('Retry esgotado após tentativas máximas', {
          attempts: maxAttempts,
          error: error.message,
        });
        break;
      }

      // Callback de retry (opcional)
      if (onRetry) {
        onRetry(error, attempt);
      }

      // Log do retry
      logger.debug('Retrying após erro', {
        attempt,
        maxAttempts,
        delay,
        error: error.message,
      });

      // Aguardar antes de retry
      await sleep(delay);

      // Exponential backoff
      delay = Math.min(delay * factor, maxDelay);
    }
  }

  // Se chegou aqui, esgotou tentativas
  throw lastError;
}

/**
 * Sleep helper
 * @param {number} ms - Milissegundos
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica se erro é retryable
 * @param {Error} error - Erro a verificar
 * @returns {boolean}
 */
function isRetryableError(error) {
  // Network errors são retryable
  if (error.code === 'ECONNREFUSED' || 
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'EAI_AGAIN') {
    return true;
  }

  // HTTP status codes retryable
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  if (error.response && retryableStatuses.includes(error.response.status)) {
    return true;
  }

  // Timeout errors
  if (error.message && error.message.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * Circuit Breaker
 * Previne chamadas repetidas a serviços que estão falhando
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60s
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.nextAttempt = Date.now();
    this.name = options.name || 'Circuit';
  }

  /**
   * Executa função com circuit breaker
   * @param {Function} fn - Função async
   * @returns {Promise}
   */
  async execute(fn) {
    if (this.state === 'OPEN') {
      // Circuito aberto: verificar se pode tentar novamente
      if (Date.now() < this.nextAttempt) {
        const error = new Error(`Circuit breaker OPEN for ${this.name}`);
        error.circuitBreakerOpen = true;
        throw error;
      }

      // Tentar half-open
      this.state = 'HALF_OPEN';
      logger.info(`[CircuitBreaker:${this.name}] Attempting HALF_OPEN`, {
        failureCount: this.failureCount,
      });
    }

    try {
      const result = await fn();

      // Sucesso: resetar contador
      if (this.state === 'HALF_OPEN') {
        this.close();
      }
      this.failureCount = 0;

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Registra falha
   */
  recordFailure() {
    this.failureCount++;

    logger.debug(`[CircuitBreaker:${this.name}] Failure recorded`, {
      failureCount: this.failureCount,
      threshold: this.failureThreshold,
    });

    if (this.failureCount >= this.failureThreshold) {
      this.open();
    }
  }

  /**
   * Abre circuito (bloqueia chamadas)
   */
  open() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.resetTimeout;

    logger.warn(`[CircuitBreaker:${this.name}] Circuit OPENED`, {
      failureCount: this.failureCount,
      resetIn: `${this.resetTimeout / 1000}s`,
    });
  }

  /**
   * Fecha circuito (permite chamadas)
   */
  close() {
    this.state = 'CLOSED';
    this.failureCount = 0;

    logger.info(`[CircuitBreaker:${this.name}] Circuit CLOSED`, {
      status: 'Recovered',
    });
  }

  /**
   * Getter de estado
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      nextAttempt: this.nextAttempt,
    };
  }
}

module.exports = {
  retryWithBackoff,
  sleep,
  isRetryableError,
  CircuitBreaker,
};



