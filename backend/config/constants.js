/**
 * Application Constants
 * Centraliza todos os magic numbers e strings do projeto
 */

module.exports = {
  // HTTP
  HTTP_TIMEOUT_MS: 5000,
  HTTP_RETRY_ATTEMPTS: 3,
  HTTP_RETRY_DELAY_MS: 1000,
  
  // Data Collection
  MAX_ALERTS_PER_FETCH: 500,
  MAX_PROBLEMS_PER_FETCH: 100,
  WAZUH_COLLECTION_INTERVAL_SECONDS: 30,
  ZABBIX_COLLECTION_INTERVAL_SECONDS: 60,
  HEALTH_CHECK_INTERVAL_SECONDS: 60,
  
  // Batch Processing
  BATCH_INSERT_SIZE: 100,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 500,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Severity Mapping
  SEVERITY_THRESHOLDS: {
    WAZUH: {
      CRITICAL: 12,
      HIGH: 7,
      MEDIUM: 4,
      LOW: 2,
    },
    ZABBIX: {
      DISASTER: '5',
      HIGH: '4',
      AVERAGE: '3',
      WARNING: '2',
      INFO: '1',
    }
  },
  
  // Ticket Types
  TICKET_TYPES: ['incident', 'problem', 'change', 'request'],
  
  // Ticket Priorities
  TICKET_PRIORITIES: ['low', 'medium', 'high', 'critical'],
  
  // Ticket Statuses
  TICKET_STATUSES: ['open', 'in_progress', 'resolved', 'closed'],
  
  // Alert Severities
  ALERT_SEVERITIES: ['info', 'low', 'medium', 'high', 'critical'],
  
  // Problem Severities
  PROBLEM_SEVERITIES: ['info', 'warning', 'average', 'high', 'disaster'],
  
  // Demo Organization (para desenvolvimento)
  DEMO_ORG_ID: '550e8400-e29b-41d4-a716-446655440000',
};




