/**
 * Environment Validation Tests
 * Testa validação de variáveis de ambiente com Zod
 */

const { z } = require('zod');

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Required Variables', () => {
    test('deve validar todas as variáveis obrigatórias', () => {
      // Arrange: env já configurado no setup.js
      
      // Act
      const env = require('../../../config/env');
      
      // Assert
      expect(env.NODE_ENV).toBe('test');
      expect(env.SUPABASE_URL).toBe('https://test.supabase.co');
      expect(env.WAZUH_API_URL).toBe('https://wazuh-test:55000');
      expect(env.ZABBIX_API_URL).toBe('http://zabbix-test:8080/api_jsonrpc.php');
    });

    test('deve validar formato de URL', () => {
      // Arrange
      const env = require('../../../config/env');
      
      // Assert
      expect(env.SUPABASE_URL).toMatch(/^https?:\/\/.+/);
      expect(env.WAZUH_API_URL).toMatch(/^https?:\/\/.+/);
      expect(env.ZABBIX_API_URL).toMatch(/^https?:\/\/.+/);
    });

    test('deve ter todas as credenciais definidas', () => {
      // Arrange
      const env = require('../../../config/env');
      
      // Assert
      expect(env.WAZUH_USERNAME).toBeDefined();
      expect(env.WAZUH_PASSWORD).toBeDefined();
      expect(env.ZABBIX_USERNAME).toBeDefined();
      expect(env.ZABBIX_PASSWORD).toBeDefined();
    });
  });

  describe('Default Values', () => {
    test('deve usar defaults quando não especificado', () => {
      // Arrange
      delete require.cache[require.resolve('../../../config/env')];
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      delete process.env.LOG_LEVEL;
      
      // Act
      const env = require('../../../config/env');
      
      // Assert
      expect(env.NODE_ENV).toBe('development');
      expect(env.PORT).toBe(3001);
      expect(env.LOG_LEVEL).toBe('info');
    });
  });

  describe('Type Transformations', () => {
    test('deve transformar PORT string para number', () => {
      // Arrange
      delete require.cache[require.resolve('../../../config/env')];
      process.env.PORT = '5000';
      
      // Act
      const env = require('../../../config/env');
      
      // Assert
      expect(env.PORT).toBe(5000);
      expect(typeof env.PORT).toBe('number');
    });
  });
});

