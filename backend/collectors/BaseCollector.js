/**
 * Base Collector Class
 * Abstração para eliminar código duplicado entre collectors
 */

const logger = require('../utils/logger');
const { HTTP_TIMEOUT_MS, BATCH_INSERT_SIZE } = require('../config/constants');

class BaseCollector {
  constructor(supabase, config, name) {
    this.supabase = supabase;
    this.config = config;
    this.name = name;
    this.token = null;
    this.isAuthenticating = false;
  }

  /**
   * Autenticação - deve ser implementado por subclasses
   * @returns {Promise<void>}
   */
  async authenticate() {
    throw new Error(`${this.name}: authenticate() must be implemented`);
  }

  /**
   * Coleta de dados - deve ser implementado por subclasses
   * @param {string} orgId - Organization ID
   * @returns {Promise<void>}
   */
  async collect(orgId) {
    throw new Error(`${this.name}: collect() must be implemented`);
  }

  /**
   * Garante que o collector está autenticado
   * Thread-safe: previne múltiplas autenticações simultâneas
   */
  async ensureAuthenticated() {
    if (this.token) return;

    // Prevenir autenticações simultâneas
    if (this.isAuthenticating) {
      await this.waitForAuthentication();
      return;
    }

    this.isAuthenticating = true;
    
    try {
      await this.authenticate();
    } finally {
      this.isAuthenticating = false;
    }
  }

  /**
   * Aguarda autenticação em andamento
   */
  async waitForAuthentication() {
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos (50 * 100ms)
    
    while (this.isAuthenticating && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!this.token) {
      throw new Error(`${this.name}: Authentication timeout`);
    }
  }

  /**
   * Batch insert com chunks para evitar N+1
   * @param {string} table - Nome da tabela
   * @param {array} data - Array de objetos para inserir
   * @returns {Promise<number>} - Quantidade inserida
   */
  async batchInsert(table, data) {
    if (!data || data.length === 0) {
      logger.debug(`[${this.name}] No data to insert`);
      return 0;
    }

    let totalInserted = 0;

    // Dividir em chunks
    for (let i = 0; i < data.length; i += BATCH_INSERT_SIZE) {
      const chunk = data.slice(i, i + BATCH_INSERT_SIZE);
      
      try {
        const { error, count } = await this.supabase
          .from(table)
          .insert(chunk)
          .select('id', { count: 'exact', head: true });

        if (error) {
          // Log mas não para execução (pode ser duplicata)
          logger.warn(`[${this.name}] Batch insert partial error`, {
            table,
            chunkSize: chunk.length,
            error: error.message,
          });
        } else {
          totalInserted += chunk.length;
        }
      } catch (error) {
        logger.errorWithContext(`[${this.name}] Batch insert failed`, error, {
          table,
          chunkSize: chunk.length,
          chunkIndex: i / BATCH_INSERT_SIZE,
        });
      }
    }

    if (totalInserted > 0) {
      logger.info(`[${this.name}] Batch insert successful`, {
        table,
        totalInserted,
        chunks: Math.ceil(data.length / BATCH_INSERT_SIZE),
      });
    }

    return totalInserted;
  }

  /**
   * Upsert batch (insert ou update)
   * @param {string} table - Nome da tabela
   * @param {array} data - Array de objetos
   * @param {object} options - Opções do upsert
   * @returns {Promise<number>}
   */
  async batchUpsert(table, data, options = {}) {
    if (!data || data.length === 0) return 0;

    let totalUpserted = 0;

    for (let i = 0; i < data.length; i += BATCH_INSERT_SIZE) {
      const chunk = data.slice(i, i + BATCH_INSERT_SIZE);
      
      try {
        const { error } = await this.supabase
          .from(table)
          .upsert(chunk, options);

        if (error) {
          logger.warn(`[${this.name}] Batch upsert partial error`, {
            table,
            error: error.message,
          });
        } else {
          totalUpserted += chunk.length;
        }
      } catch (error) {
        logger.errorWithContext(`[${this.name}] Batch upsert failed`, error, {
          table,
          chunkSize: chunk.length,
        });
      }
    }

    if (totalUpserted > 0) {
      logger.info(`[${this.name}] Batch upsert successful`, {
        table,
        totalUpserted,
      });
    }

    return totalUpserted;
  }

  /**
   * Executa coleta com error handling
   * @param {string} orgId - Organization ID
   */
  async run(orgId) {
    try {
      await this.ensureAuthenticated();
      await this.collect(orgId);
    } catch (error) {
      // Re-autenticar se token expirou
      if (this.isTokenExpiredError(error)) {
        logger.info(`[${this.name}] Token expired, re-authenticating`);
        this.token = null;
        
        // Retry uma vez
        try {
          await this.ensureAuthenticated();
          await this.collect(orgId);
        } catch (retryError) {
          logger.errorWithContext(
            `[${this.name}] Collection failed after retry`,
            retryError,
            { orgId }
          );
          throw retryError; // Propaga erro
        }
      } else {
        logger.errorWithContext(
          `[${this.name}] Collection failed`,
          error,
          { orgId }
        );
        throw error; // Propaga erro
      }
    }
  }

  /**
   * Verifica se erro é de token expirado
   * Pode ser sobrescrito por subclasses
   */
  isTokenExpiredError(error) {
    return (
      error.response?.status === 401 ||
      error.message?.includes('expired') ||
      error.message?.includes('unauthorized')
    );
  }

  /**
   * Getter para timeout HTTP padrão
   */
  getTimeout() {
    return this.config.timeout || HTTP_TIMEOUT_MS;
  }
}

module.exports = BaseCollector;




