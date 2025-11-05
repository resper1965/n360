/**
 * n360 Platform - Backend API
 * MVP com dashboard de status das aplicações
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// Estado Global (cache simples)
// ============================================================

let appsStatus = {
  wazuh: { online: false, lastCheck: null, error: null },
  shuffle: { online: false, lastCheck: null, error: null },
  zabbix: { online: false, lastCheck: null, error: null }
};

// ============================================================
// Health Check Functions
// ============================================================

async function checkWazuh() {
  try {
    // Tentar ping simples (sem auth)
    const response = await axios.get(
      `${process.env.WAZUH_API_URL}/?pretty=true`,
      {
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: (status) => status === 200 || status === 401 // 401 = API online mas sem auth
      }
    );
    
    // Se retornou 200 ou 401, o Wazuh está online
    appsStatus.wazuh = {
      online: response.status === 200 || response.status === 401,
      lastCheck: new Date().toISOString(),
      error: null,
      version: '4.9.0 LTS',
      url: 'https://wazuh.nsecops.com.br'
    };
  } catch (error) {
    appsStatus.wazuh = {
      online: false,
      lastCheck: new Date().toISOString(),
      error: error.message,
      url: 'https://wazuh.nsecops.com.br'
    };
  }
}

async function checkShuffle() {
  try {
    // Verificar health endpoint
    const response = await axios.get(
      `${process.env.SHUFFLE_API_URL}/api/v1/health`,
      {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500
      }
    );
    
    appsStatus.shuffle = {
      online: response.status >= 200 && response.status < 300,
      lastCheck: new Date().toISOString(),
      error: null,
      version: 'Latest',
      url: 'https://shuffle.nsecops.com.br'
    };
  } catch (error) {
    appsStatus.shuffle = {
      online: false,
      lastCheck: new Date().toISOString(),
      error: error.message,
      url: 'https://shuffle.nsecops.com.br'
    };
  }
}

async function checkZabbix() {
  try {
    // Tentar conectar via HTTP simples (sem API)
    const response = await axios.get(
      'http://zabbix-web:8080',
      {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500
      }
    );
    
    appsStatus.zabbix = {
      online: response.status === 200,
      lastCheck: new Date().toISOString(),
      error: null,
      version: '6.4 LTS',
      url: 'https://zabbix.nsecops.com.br'
    };
  } catch (error) {
    appsStatus.zabbix = {
      online: false,
      lastCheck: new Date().toISOString(),
      error: error.code === 'ECONNREFUSED' ? 'Container offline ou DB não inicializado' : error.message,
      url: 'https://zabbix.nsecops.com.br'
    };
  }
}

async function checkAllApps() {
  console.log('[Health Check] Verificando status das aplicações...');
  await Promise.all([
    checkWazuh(),
    checkShuffle(),
    checkZabbix()
  ]);
  console.log('[Health Check] Concluído:', {
    wazuh: appsStatus.wazuh.online ? '✅' : '❌',
    shuffle: appsStatus.shuffle.online ? '✅' : '❌',
    zabbix: appsStatus.zabbix.online ? '✅' : '❌'
  });
}

// ============================================================
// Routes
// ============================================================

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apps Status
app.get('/api/status', (req, res) => {
  const summary = {
    overall: Object.values(appsStatus).every(app => app.online) ? 'online' : 'degraded',
    apps: appsStatus,
    lastUpdate: new Date().toISOString()
  };
  res.json(summary);
});

// Force refresh
app.post('/api/status/refresh', async (req, res) => {
  await checkAllApps();
  res.json({ message: 'Status atualizado', apps: appsStatus });
});

// Dashboard Data (MVP)
app.get('/api/dashboard', (req, res) => {
  const onlineCount = Object.values(appsStatus).filter(app => app.online).length;
  const totalCount = Object.keys(appsStatus).length;
  
  res.json({
    summary: {
      totalApps: totalCount,
      onlineApps: onlineCount,
      offlineApps: totalCount - onlineCount,
      healthPercentage: Math.round((onlineCount / totalCount) * 100)
    },
    apps: appsStatus
  });
});

// ============================================================
// Cron Jobs
// ============================================================

// Check status a cada 60 segundos
cron.schedule('*/60 * * * * *', () => {
  checkAllApps();
});

// ============================================================
// Startup
// ============================================================

// Check inicial
checkAllApps();

app.listen(PORT, () => {
  console.log(`[n360 API] Server running on port ${PORT}`);
  console.log(`[n360 API] Environment: ${process.env.NODE_ENV}`);
});

