/**
 * n360 Platform - Backend API (Refatorado)
 * Backend completo com TODAS as boas práticas aplicadas
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const cron = require('node-cron');
const path = require('path');

// ============================================================
// Inicialização e Configuração
// ============================================================

// 1. Carregar e validar variáveis de ambiente (PRIMEIRO!)
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const env = require('./config/env');

// 2. Logger estruturado
const logger = require('./utils/logger');

// 3. Constants
const {
  DEMO_ORG_ID,
  WAZUH_COLLECTION_INTERVAL_SECONDS,
  ZABBIX_COLLECTION_INTERVAL_SECONDS,
  HEALTH_CHECK_INTERVAL_SECONDS,
} = require('./config/constants');

// 4. Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

// 5. Collectors
const WazuhCollector = require('./collectors/wazuh-collector');
const ZabbixCollector = require('./collectors/zabbix-collector');

// 6. Services
const statusCache = require('./services/StatusCache');

// 7. Middleware
const { defaultLimiter, strictLimiter, userLimiter } = require('./middleware/rateLimiter');
const { optionalAuth, requireAuth, requireRole } = require('./middleware/auth');
const { validate, paginationSchema, alertFilterSchema, uuidParamSchema } = require('./middleware/validation');

// ============================================================
// Express App
// ============================================================

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.request(req, { duration, statusCode: res.statusCode });
  });
  
  next();
});

// Rate limiting global
app.use('/api', defaultLimiter);

// ============================================================
// Health Checks
// ============================================================

async function checkWazuh() {
  try {
    const response = await axios.get(
      `${env.WAZUH_API_URL}/?pretty=true`,
      {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: (status) => status === 200 || status === 401
      }
    );
    
    statusCache.set('wazuh', {
      online: response.status === 200 || response.status === 401,
      version: '4.9.0 LTS',
      url: 'https://wazuh.nsecops.com.br'
    });
  } catch (error) {
    logger.warn('[Health] Wazuh offline', { error: error.message });
    statusCache.set('wazuh', {
      online: false,
      error: error.message,
      url: 'https://wazuh.nsecops.com.br'
    });
  }
}

async function checkShuffle() {
  try {
    const response = await axios.get(
      `${env.SHUFFLE_API_URL}/api/v1/health`,
      {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500
      }
    );
    
    statusCache.set('shuffle', {
      online: response.status >= 200 && response.status < 300,
      version: 'Latest',
      url: 'https://shuffle.nsecops.com.br'
    });
  } catch (error) {
    logger.warn('[Health] Shuffle offline', { error: error.message });
    statusCache.set('shuffle', {
      online: false,
      error: error.message,
      url: 'https://shuffle.nsecops.com.br'
    });
  }
}

async function checkZabbix() {
  try {
    const response = await axios.get(
      'http://zabbix-web:8080',
      {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500
      }
    );
    
    statusCache.set('zabbix', {
      online: response.status >= 200 && response.status < 400,
      version: '6.4 LTS',
      url: 'https://zabbix.nsecops.com.br'
    });
  } catch (error) {
    logger.warn('[Health] Zabbix offline', { error: error.message });
    statusCache.set('zabbix', {
      online: false,
      error: error.message,
      url: 'https://zabbix.nsecops.com.br'
    });
  }
}

async function runHealthChecks() {
  logger.debug('[Health] Running health checks...');
  await Promise.allSettled([
    checkWazuh(),
    checkShuffle(),
    checkZabbix()
  ]);
}

// ============================================================
// Data Collection
// ============================================================

// Wazuh Collector - DESABILITADO TEMPORARIAMENTE
// Motivo: Wazuh 4.9.0 mudou arquitetura - alertas vêm do Indexer (OpenSearch)
// TODO Sprint 3/4: Implementar WazuhIndexerCollector com @opensearch-project/opensearch
// const wazuhCollector = new WazuhCollector(supabase, {
//   apiUrl: env.WAZUH_API_URL,
//   username: env.WAZUH_USERNAME,
//   password: env.WAZUH_PASSWORD,
// });

const zabbixCollector = new ZabbixCollector(supabase, {
  apiUrl: env.ZABBIX_API_URL,
  username: env.ZABBIX_USERNAME,
  password: env.ZABBIX_PASSWORD,
});

async function runCollectors() {
  const orgId = DEMO_ORG_ID; // Em produção, buscar de user_profiles
  
  // Wazuh: Desabilitado - implementar com OpenSearch no Sprint 3/4
  // try {
  //   await wazuhCollector.run(orgId);
  // } catch (error) {
  //   logger.errorWithContext('[Collectors] Wazuh collection failed', error);
  // }
  
  // Zabbix: Funcionando ✅
  try {
    await zabbixCollector.run(orgId);
  } catch (error) {
    logger.errorWithContext('[Collectors] Zabbix collection failed', error);
    // Não para execução
  }
}

// ============================================================
// API Routes
// ============================================================

// Health endpoint (sem rate limit em dev)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// Dashboard - status das aplicações
app.get('/api/dashboard', optionalAuth, (req, res) => {
  try {
    const summary = statusCache.getSummary();
    const apps = statusCache.getAll();
    
    res.json({
      summary,
      apps,
      organization: {
        id: req.user?.orgId,
        name: 'Demo Organization',
      }
    });
  } catch (error) {
    logger.errorWithContext('Dashboard error', error, {
      userId: req.user?.id,
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao buscar status do dashboard'
    });
  }
});

// Alerts - listagem com paginação e filtros
app.get(
  '/api/alerts',
  requireAuth,
  userLimiter,
  validate(alertFilterSchema, 'query'),
  async (req, res) => {
    try {
      const { page, limit, severity, status, source, search } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('alerts')
        .select('*', { count: 'exact' })
        .eq('org_id', req.user.orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtros opcionais
      if (severity !== 'all') query = query.eq('severity', severity);
      if (status !== 'all') query = query.eq('status', status);
      if (source) query = query.eq('source', source);
      if (search) query = query.ilike('title', `%${search}%`);

      const { data, error, count } = await query;

      if (error) throw error;

      res.json({
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        }
      });
    } catch (error) {
      logger.errorWithContext('Alerts fetch error', error, {
        userId: req.user?.id,
        orgId: req.user?.orgId,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar alertas'
      });
    }
  }
);

// Alert específico
app.get(
  '/api/alerts/:id',
  requireAuth,
  validate(uuidParamSchema, 'params'),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', req.params.id)
        .eq('org_id', req.user.orgId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Alerta não encontrado'
        });
      }

      res.json(data);
    } catch (error) {
      logger.errorWithContext('Alert fetch error', error, {
        alertId: req.params.id,
        userId: req.user?.id,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar alerta'
      });
    }
  }
);

// Problems - listagem
app.get(
  '/api/problems',
  requireAuth,
  userLimiter,
  validate(paginationSchema, 'query'),
  async (req, res) => {
    try {
      const { page, limit } = req.query;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('problems')
        .select('*', { count: 'exact' })
        .eq('org_id', req.user.orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        }
      });
    } catch (error) {
      logger.errorWithContext('Problems fetch error', error, {
        userId: req.user?.id,
        orgId: req.user?.orgId,
      });
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao buscar problemas'
      });
    }
  }
);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} não encontrado`
  });
});

// Error Handler Global
app.use((err, req, res, next) => {
  logger.errorWithContext('Unhandled error', err, {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message
  });
});

// ============================================================
// Server Startup
// ============================================================

async function start() {
  try {
    // 1. Testar conexão Supabase
    const { data, error } = await supabase.from('organizations').select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    logger.info('[Supabase] ✅ Conectado com sucesso', {
      url: env.SUPABASE_URL,
    });

    // 2. Health checks inicial
    await runHealthChecks();
    
    // 3. Coletar dados inicial
    await runCollectors();

    // 4. Cron jobs
    cron.schedule(`*/${HEALTH_CHECK_INTERVAL_SECONDS} * * * * *`, runHealthChecks);
    
    // Wazuh cron: Desabilitado (implementar com OpenSearch no Sprint 3/4)
    // cron.schedule(`*/${WAZUH_COLLECTION_INTERVAL_SECONDS} * * * * *`, async () => {
    //   try {
    //     await wazuhCollector.run(DEMO_ORG_ID);
    //   } catch (error) {
    //     logger.errorWithContext('[Cron] Wazuh collection failed', error);
    //   }
    // });
    
    // Zabbix cron: Funcionando ✅
    cron.schedule(`*/${ZABBIX_COLLECTION_INTERVAL_SECONDS} * * * * *`, async () => {
      try {
        await zabbixCollector.run(DEMO_ORG_ID);
      } catch (error) {
        logger.errorWithContext('[Cron] Zabbix collection failed', error);
      }
    });

    logger.info('[Cron] ✅ Jobs agendados', {
      healthCheck: `${HEALTH_CHECK_INTERVAL_SECONDS}s`,
      zabbix: `${ZABBIX_COLLECTION_INTERVAL_SECONDS}s`,
      wazuh: 'Desabilitado (Sprint 3/4)',
    });

    // 5. Iniciar servidor
    app.listen(env.PORT, () => {
      logger.info('[n360 API] 🚀 Server started', {
        port: env.PORT,
        env: env.NODE_ENV,
        supabase: '✅',
        collectors: 'Zabbix (Wazuh: Sprint 3/4)',
        endpoints: ['/health', '/api/dashboard', '/api/alerts', '/api/problems'],
      });
    });

  } catch (error) {
    logger.errorWithContext('[Startup] Fatal error', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('[Server] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('[Server] SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.errorWithContext('[Process] Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Process] Unhandled Rejection', {
    reason,
    promise,
  });
});

// Start!
start();

