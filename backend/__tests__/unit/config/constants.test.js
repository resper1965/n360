/**
 * Constants Tests
 * Valida que constantes estão definidas corretamente
 */

const constants = require('../../../config/constants');

describe('Constants', () => {
  describe('HTTP Configuration', () => {
    test('deve ter timeout configurado', () => {
      expect(constants.HTTP_TIMEOUT_MS).toBe(5000);
      expect(typeof constants.HTTP_TIMEOUT_MS).toBe('number');
    });

    test('deve ter retry attempts definido', () => {
      expect(constants.HTTP_RETRY_ATTEMPTS).toBe(3);
      expect(constants.HTTP_RETRY_ATTEMPTS).toBeGreaterThan(0);
    });
  });

  describe('Data Collection', () => {
    test('deve ter intervalos de coleta definidos', () => {
      expect(constants.WAZUH_COLLECTION_INTERVAL_SECONDS).toBe(30);
      expect(constants.ZABBIX_COLLECTION_INTERVAL_SECONDS).toBe(60);
      expect(constants.HEALTH_CHECK_INTERVAL_SECONDS).toBe(60);
    });

    test('deve ter limites de fetch definidos', () => {
      expect(constants.MAX_ALERTS_PER_FETCH).toBe(500);
      expect(constants.MAX_PROBLEMS_PER_FETCH).toBe(100);
    });

    test('deve ter batch size configurado', () => {
      expect(constants.BATCH_INSERT_SIZE).toBe(100);
      expect(constants.BATCH_INSERT_SIZE).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    test('deve ter page size defaults', () => {
      expect(constants.DEFAULT_PAGE_SIZE).toBe(50);
      expect(constants.MAX_PAGE_SIZE).toBe(500);
      expect(constants.MAX_PAGE_SIZE).toBeGreaterThan(constants.DEFAULT_PAGE_SIZE);
    });
  });

  describe('Rate Limiting', () => {
    test('deve ter configuração de rate limit', () => {
      expect(constants.RATE_LIMIT_WINDOW_MS).toBe(15 * 60 * 1000);
      expect(constants.RATE_LIMIT_MAX_REQUESTS).toBe(100);
    });
  });

  describe('Severity Thresholds', () => {
    test('deve ter thresholds do Wazuh', () => {
      const { WAZUH } = constants.SEVERITY_THRESHOLDS;
      
      expect(WAZUH.CRITICAL).toBe(12);
      expect(WAZUH.HIGH).toBe(7);
      expect(WAZUH.MEDIUM).toBe(4);
      expect(WAZUH.LOW).toBe(2);
    });

    test('deve ter thresholds do Zabbix', () => {
      const { ZABBIX } = constants.SEVERITY_THRESHOLDS;
      
      expect(ZABBIX.DISASTER).toBe('5');
      expect(ZABBIX.HIGH).toBe('4');
      expect(ZABBIX.AVERAGE).toBe('3');
      expect(ZABBIX.WARNING).toBe('2');
      expect(ZABBIX.INFO).toBe('1');
    });
  });

  describe('Enums', () => {
    test('deve ter tipos de ticket definidos', () => {
      expect(constants.TICKET_TYPES).toContain('incident');
      expect(constants.TICKET_TYPES).toContain('problem');
      expect(constants.TICKET_TYPES).toContain('change');
      expect(constants.TICKET_TYPES).toContain('request');
    });

    test('deve ter prioridades de ticket definidas', () => {
      expect(constants.TICKET_PRIORITIES).toContain('low');
      expect(constants.TICKET_PRIORITIES).toContain('medium');
      expect(constants.TICKET_PRIORITIES).toContain('high');
      expect(constants.TICKET_PRIORITIES).toContain('critical');
    });

    test('deve ter status de ticket definidos', () => {
      expect(constants.TICKET_STATUSES).toContain('open');
      expect(constants.TICKET_STATUSES).toContain('in_progress');
      expect(constants.TICKET_STATUSES).toContain('resolved');
      expect(constants.TICKET_STATUSES).toContain('closed');
    });

    test('deve ter severidades de alerta definidas', () => {
      expect(constants.ALERT_SEVERITIES).toHaveLength(5);
      expect(constants.ALERT_SEVERITIES).toContain('critical');
    });
  });

  describe('Demo Organization', () => {
    test('deve ter DEMO_ORG_ID definido', () => {
      expect(constants.DEMO_ORG_ID).toBeDefined();
      expect(constants.DEMO_ORG_ID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });
});



