/**
 * n360 Platform - Full Backend API
 * Version 2.0 - Includes Supabase, collectors, and the CISO dashboard
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const supabase = require('./utils/supabase');

const WazuhCollector = require('./collectors/wazuh-collector');
const ZabbixCollector = require('./collectors/zabbix-collector');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// Supabase Client
// ============================================================

console.log('[Supabase] Connected to:', process.env.SUPABASE_URL);

// ============================================================
// Collectors
// ============================================================

const wazuhCollector = new WazuhCollector(supabase, {
  apiUrl: process.env.WAZUH_API_URL,
  username: process.env.WAZUH_USERNAME,
  password: process.env.WAZUH_PASSWORD
});

const zabbixCollector = new ZabbixCollector(supabase, {
  apiUrl: process.env.ZABBIX_API_URL,
  username: process.env.ZABBIX_USERNAME,
  password: process.env.ZABBIX_PASSWORD
});

const DEMO_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

// ============================================================
// Health Check (mantido para compatibilidade)
// ============================================================

const https = require('https');

let appsStatus = {
  wazuh: { online: false, lastCheck: null, error: null },
  shuffle: { online: false, lastCheck: null, error: null },
  zabbix: { online: false, lastCheck: null, error: null }
};

async function checkWazuh() {
  try {
    const response = await axios.get(
      `${process.env.WAZUH_API_URL}/?pretty=true`,
      {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: (status) => status === 200 || status === 401
      }
    );
    
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
      error: error.code === 'ECONNREFUSED' ? 'Container offline or database not initialized' : error.message,
      url: 'https://zabbix.nsecops.com.br'
    };
  }
}

async function checkAllApps() {
  await Promise.all([checkWazuh(), checkShuffle(), checkZabbix()]);
}

// ============================================================
// Routes
// ============================================================

// Health (legacy)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apps Status (legacy)
app.get('/api/status', (req, res) => {
  const summary = {
    overall: Object.values(appsStatus).every(app => app.online) ? 'online' : 'degraded',
    apps: appsStatus,
    lastUpdate: new Date().toISOString()
  };
  res.json(summary);
});

// Force refresh (legacy)
app.post('/api/status/refresh', async (req, res) => {
  await checkAllApps();
  res.json({ message: 'Status atualizado', apps: appsStatus });
});

// Dashboard (legacy)
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

// New Routes (v2)
app.use('/api/dashboard', require('./routes/dashboard')(supabase));
app.use('/api/tickets', require('./routes/tickets')(supabase));

// ============================================================
// Cron Jobs
// ============================================================

// Health checks a cada 60s (legacy)
cron.schedule('*/60 * * * * *', checkAllApps);

// Wazuh collector a cada 30s
cron.schedule('*/30 * * * * *', async () => {
  try {
    await wazuhCollector.collectAlerts(DEMO_ORG_ID);
  } catch (error) {
    console.error('[Cron] Wazuh collector error:', error.message);
  }
});

// Zabbix collector a cada 60s
cron.schedule('0 * * * * *', async () => {
  try {
    await zabbixCollector.collectProblems(DEMO_ORG_ID);
  } catch (error) {
    console.error('[Cron] Zabbix collector error:', error.message);
  }
});

// ============================================================
// Startup
// ============================================================

checkAllApps();

app.listen(PORT, () => {
  console.log(`[n360 API] Server running on port ${PORT}`);
  console.log(`[n360 API] Environment: ${process.env.NODE_ENV}`);
  console.log(`[n360 API] Supabase: Connected`);
  console.log(`[n360 API] Collectors: Wazuh (30s), Zabbix (60s)`);
});

