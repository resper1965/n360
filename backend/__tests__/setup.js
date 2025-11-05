/**
 * Jest Setup
 * Configuração global para todos os testes
 */

// Timeout global
jest.setTimeout(5000);

// Environment variables para testes
process.env.NODE_ENV = 'test';
process.env.PORT = '3999';
process.env.LOG_LEVEL = 'error'; // Silenciar logs em testes

// Supabase mock (para não bater no DB real)
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key-mock';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key-mock';

// Wazuh mock
process.env.WAZUH_API_URL = 'https://wazuh-test:55000';
process.env.WAZUH_USERNAME = 'test-user';
process.env.WAZUH_PASSWORD = 'test-pass';

// Zabbix mock
process.env.ZABBIX_API_URL = 'http://zabbix-test:8080/api_jsonrpc.php';
process.env.ZABBIX_USERNAME = 'test-user';
process.env.ZABBIX_PASSWORD = 'test-pass';

// Shuffle mock
process.env.SHUFFLE_API_URL = 'http://shuffle-test:5001';

// Suprimir warnings do Node 18
process.env.NODE_NO_WARNINGS = '1';

// Global mocks
global.console = {
  ...console,
  // Suprimir logs em testes (exceto errors)
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Manter errors visíveis
};

