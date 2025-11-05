/**
 * Status Cache Service
 * Substitui global state mutation por classe thread-safe
 */

class StatusCache {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
  }

  /**
   * Atualiza status de uma aplicação
   * @param {string} key - Nome da aplicação (wazuh, shuffle, zabbix)
   * @param {object} value - Status da aplicação
   */
  set(key, value) {
    this.cache.set(key, {
      ...value,
      lastCheck: new Date().toISOString(),
    });
    this.lastUpdate = new Date().toISOString();
  }

  /**
   * Busca status de uma aplicação
   * @param {string} key - Nome da aplicação
   * @returns {object|undefined}
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Retorna todos os status
   * @returns {object}
   */
  getAll() {
    return Object.fromEntries(this.cache);
  }

  /**
   * Verifica se uma aplicação está online
   * @param {string} key - Nome da aplicação
   * @returns {boolean}
   */
  isOnline(key) {
    const status = this.get(key);
    return status?.online === true;
  }

  /**
   * Conta quantas aplicações estão online
   * @returns {number}
   */
  countOnline() {
    return Array.from(this.cache.values()).filter(app => app.online).length;
  }

  /**
   * Total de aplicações monitoradas
   * @returns {number}
   */
  countTotal() {
    return this.cache.size;
  }

  /**
   * Health percentage
   * @returns {number}
   */
  getHealthPercentage() {
    const total = this.countTotal();
    if (total === 0) return 0;
    return Math.round((this.countOnline() / total) * 100);
  }

  /**
   * Limpa todos os status
   */
  clear() {
    this.cache.clear();
    this.lastUpdate = null;
  }

  /**
   * Summary object
   * @returns {object}
   */
  getSummary() {
    const total = this.countTotal();
    const online = this.countOnline();
    
    return {
      overall: online === total ? 'online' : 'degraded',
      totalApps: total,
      onlineApps: online,
      offlineApps: total - online,
      healthPercentage: this.getHealthPercentage(),
      lastUpdate: this.lastUpdate,
    };
  }
}

// Singleton instance
module.exports = new StatusCache();


