# 🔗 Integração Wazuh → n360 Dashboard

**Feature ID**: 007  
**Nome**: Wazuh Data Integration  
**Prioridade**: Alta  
**Status**: Planejamento  
**Data**: 06/11/2025

---

## 🎯 OBJETIVO:

Trazer dados, métricas e dashboards do Wazuh para dentro do n360 Platform, centralizando toda visualização de segurança em um único painel.

---

## 🔍 3 MÉTODOS DE INTEGRAÇÃO:

### Método 1: Via Wazuh Manager API ⭐

**Prós**:
- ✅ Oficial e documentado
- ✅ Dados estruturados (JSON)
- ✅ Estatísticas agregadas
- ✅ Status de agentes

**Contras**:
- ⚠️ Requer autenticação
- ⚠️ Limite de rate (requests/min)

**Endpoints Úteis**:
```
GET /security/events         → Alertas
GET /agents                  → Lista de agentes
GET /agents/summary/status   → Status dos agentes
GET /overview/mitre          → Mapeamento MITRE
GET /vulnerability           → Vulnerabilidades
GET /sca                     → CIS Benchmarks
GET /manager/stats           → Estatísticas do Manager
```

---

### Método 2: Via OpenSearch Indexer (Direto) ⭐⭐

**Prós**:
- ✅ Acesso direto aos dados
- ✅ Queries poderosas (OpenSearch DSL)
- ✅ Dados históricos completos
- ✅ Dashboards complexos

**Contras**:
- ⚠️ Requer conhecimento de OpenSearch
- ⚠️ Mais complexo

**Índices Disponíveis**:
```
wazuh-alerts-*              → Alertas de segurança
wazuh-monitoring-*          → Métricas de agentes
wazuh-statistics-*          → Estatísticas
wazuh-archives-*            → Eventos arquivados
```

**Query Example**:
```json
{
  "query": {
    "bool": {
      "must": [
        { "range": { "rule.level": { "gte": 7 } } },
        { "range": { "@timestamp": { "gte": "now-24h" } } }
      ]
    }
  },
  "size": 100,
  "sort": [{ "@timestamp": "desc" }]
}
```

---

### Método 3: Via Webhooks (Tempo Real) ⭐⭐⭐

**Prós**:
- ✅ Tempo real (push, não pull)
- ✅ Menor carga no servidor
- ✅ Fácil de implementar
- ✅ Já configurado no Wazuh

**Contras**:
- ⚠️ Apenas novos alertas (não histórico)

**Como Funciona**:
```
Wazuh detecta alerta
  ↓
POST https://api.n360.nsecops.com.br/webhooks/wazuh
  ↓
n360 salva no Supabase
  ↓
Dashboard atualiza em tempo real (Realtime)
```

---

## ✅ SOLUÇÃO RECOMENDADA: **HÍBRIDA**

Combinar os 3 métodos para máxima eficiência:

```
1. Webhooks → Alertas em tempo real
2. OpenSearch → Dashboards históricos
3. Manager API → Estatísticas e status
```

---

## 📊 DADOS A TRAZER PARA n360:

### 1. Widgets para CISO Dashboard

```javascript
// Já existentes no n360:
✅ Top Alertas (via Supabase)

// Novos (via Wazuh):
⏳ Agent Status (Online/Offline/Never Connected)
⏳ MITRE ATT&CK Heatmap
⏳ Vulnerability Summary (Critical/High/Medium/Low)
⏳ Compliance Score (PCI/GDPR/NIST)
⏳ Top Attack Patterns
```

### 2. Página SOC - Alertas Wazuh

```javascript
// Melhorias na página atual:
✅ Filtros: Severidade, Agente, Regra, MITRE
✅ Search: Busca por keyword
✅ Paginação
✅ Detalhes expandidos

// Novos campos do Wazuh:
⏳ rule.mitre.id (Tática MITRE)
⏳ rule.mitre.technique (Técnica MITRE)
⏳ agent.os (Sistema operacional)
⏳ vulnerability.cve (CVE ID)
⏳ sca.check.compliance (Compliance framework)
```

### 3. Novo: Página "Agentes Wazuh"

```
Lista de Agentes:
  • Nome
  • IP
  • OS
  • Versão do Agent
  • Status (Active/Disconnected)
  • Último Keepalive
  • Total de Alertas (24h)
  • Vulnerabilidades (count)
  • CIS Score

Ações:
  • Ver Detalhes
  • Ver Alertas do Agente
  • Reiniciar Agent
  • Upgrade Agent
```

### 4. Novo: Página "Vulnerabilidades"

```
Lista de CVEs:
  • CVE ID
  • Severidade (CVSS Score)
  • Agentes Afetados
  • Pacote Vulnerável
  • Versão Corrigida
  • Data de Detecção
  • Status (Open/Patched/Mitigated)

Filtros:
  • Severidade
  • Agente
  • Status
  • Data
```

### 5. Novo: Página "Compliance"

```
Frameworks:
  • PCI DSS
  • GDPR
  • HIPAA
  • NIST 800-53
  • CIS Benchmarks

Para cada:
  • Score (% de conformidade)
  • Requisitos Atendidos / Total
  • Controles Falhando
  • Agentes Não Conformes
  • Timeline de Evolução
```

---

## 🔧 IMPLEMENTAÇÃO:

### Backend (n360)

#### 1. Conector OpenSearch

```javascript
// backend/connectors/wazuh-opensearch.js
const { Client } = require('@opensearch-project/opensearch');

const opensearchClient = new Client({
  node: 'https://wazuh-indexer:9200',
  auth: {
    username: 'admin',
    password: process.env.WAZUH_INDEXER_PASSWORD
  },
  ssl: {
    rejectUnauthorized: false
  }
});

// Buscar alertas
async function getWazuhAlerts(filters = {}) {
  const query = {
    index: 'wazuh-alerts-*',
    body: {
      query: {
        bool: {
          must: [
            { range: { '@timestamp': { gte: 'now-24h' } } }
          ]
        }
      },
      size: 100,
      sort: [{ '@timestamp': 'desc' }]
    }
  };

  if (filters.minLevel) {
    query.body.query.bool.must.push({
      range: { 'rule.level': { gte: filters.minLevel } }
    });
  }

  const response = await opensearchClient.search(query);
  return response.body.hits.hits;
}

// Buscar vulnerabilidades
async function getVulnerabilities() {
  const response = await opensearchClient.search({
    index: 'wazuh-alerts-*',
    body: {
      query: {
        bool: {
          must: [
            { exists: { field: 'vulnerability.cve' } },
            { range: { '@timestamp': { gte: 'now-7d' } } }
          ]
        }
      },
      aggs: {
        by_cve: {
          terms: { field: 'vulnerability.cve.keyword', size: 50 },
          aggs: {
            severity: { max: { field: 'vulnerability.severity.keyword' } },
            agents: { cardinality: { field: 'agent.id' } }
          }
        }
      }
    }
  });

  return response.body.aggregations.by_cve.buckets;
}

// MITRE ATT&CK Heatmap
async function getMitreHeatmap() {
  const response = await opensearchClient.search({
    index: 'wazuh-alerts-*',
    body: {
      query: {
        bool: {
          must: [
            { exists: { field: 'rule.mitre.id' } },
            { range: { '@timestamp': { gte: 'now-30d' } } }
          ]
        }
      },
      aggs: {
        by_technique: {
          terms: { field: 'rule.mitre.id.keyword', size: 20 },
          aggs: {
            count: { value_count: { field: 'rule.id' } }
          }
        }
      }
    }
  });

  return response.body.aggregations.by_technique.buckets;
}

module.exports = {
  opensearchClient,
  getWazuhAlerts,
  getVulnerabilities,
  getMitreHeatmap
};
```

---

#### 2. API Routes

```javascript
// backend/routes/wazuh-integration.js
const express = require('express');
const router = express.Router();
const {
  getWazuhAlerts,
  getVulnerabilities,
  getMitreHeatmap
} = require('../connectors/wazuh-opensearch');

// GET /api/wazuh/alerts
router.get('/alerts', async (req, res) => {
  try {
    const { minLevel, agent, search } = req.query;
    const alerts = await getWazuhAlerts({ minLevel, agent, search });
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/wazuh/vulnerabilities
router.get('/vulnerabilities', async (req, res) => {
  try {
    const vulns = await getVulnerabilities();
    res.json({ success: true, data: vulns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/wazuh/mitre-heatmap
router.get('/mitre-heatmap', async (req, res) => {
  try {
    const heatmap = await getMitreHeatmap();
    res.json({ success: true, data: heatmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/wazuh/agents
router.get('/agents', async (req, res) => {
  try {
    // Via Manager API
    const axios = require('axios');
    const token = await getWazuhToken();
    
    const response = await axios.get(
      'https://wazuh-manager:55000/agents',
      {
        headers: { 'Authorization': `Bearer ${token}` },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      }
    );
    
    res.json({ success: true, data: response.data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/wazuh/compliance-score
router.get('/compliance-score', async (req, res) => {
  try {
    const { framework } = req.query; // pci_dss, gdpr, nist, hipaa
    
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          bool: {
            must: [
              { exists: { field: `rule.${framework}` } },
              { range: { '@timestamp': { gte: 'now-30d' } } }
            ]
          }
        },
        aggs: {
          passed: {
            filter: { term: { 'sca.check.result': 'passed' } }
          },
          failed: {
            filter: { term: { 'sca.check.result': 'failed' } }
          }
        }
      }
    });
    
    const total = response.body.hits.total.value;
    const passed = response.body.aggregations.passed.doc_count;
    const failed = response.body.aggregations.failed.doc_count;
    const score = total > 0 ? (passed / total * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: { framework, score, passed, failed, total }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

### Frontend (n360)

#### 1. Widget: Agentes Wazuh

```jsx
// frontend/src/components/widgets/WazuhAgentsWidget.jsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function WazuhAgentsWidget() {
  const [agents, setAgents] = useState({ active: 0, disconnected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/wazuh/agents');
        const data = await res.json();
        
        const summary = data.data.affected_items.reduce((acc, agent) => {
          if (agent.status === 'active') acc.active++;
          else if (agent.status === 'disconnected') acc.disconnected++;
          else acc.pending++;
          return acc;
        }, { active: 0, disconnected: 0, pending: 0 });
        
        setAgents(summary);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
    const interval = setInterval(fetchAgents, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Card className="shadow-elegant"><CardContent>Carregando...</CardContent></Card>;

  return (
    <Card className="shadow-elegant hover:shadow-elegant-hover transition-all duration-base">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Agentes Wazuh</CardTitle>
        <Server className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Active */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">Ativos</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              {agents.active}
            </Badge>
          </div>

          {/* Disconnected */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">Desconectados</span>
            </div>
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              {agents.disconnected}
            </Badge>
          </div>

          {/* Pending */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">Pendentes</span>
            </div>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              {agents.pending}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

#### 2. Widget: MITRE ATT&CK Heatmap

```jsx
// frontend/src/components/widgets/MitreHeatmapWidget.jsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function MitreHeatmapWidget() {
  const [techniques, setTechniques] = useState([]);

  useEffect(() => {
    async function fetchMitre() {
      const res = await fetch('/api/wazuh/mitre-heatmap');
      const data = await res.json();
      setTechniques(data.data.slice(0, 10)); // Top 10
    }

    fetchMitre();
    const interval = setInterval(fetchMitre, 60000); // 1min
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" strokeWidth={1.5} />
          Top 10 Técnicas MITRE ATT&CK
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {techniques.map((tech, idx) => (
            <div key={tech.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {idx + 1}
                </div>
                <div>
                  <div className="text-sm font-medium">{tech.key}</div>
                  <div className="text-xs text-muted-foreground">
                    {tech.doc_count} detecções
                  </div>
                </div>
              </div>
              <div 
                className="h-2 rounded-full bg-red-500/20"
                style={{ width: `${Math.min(tech.doc_count * 10, 100)}px` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

#### 3. Widget: Compliance Score

```jsx
// frontend/src/components/widgets/ComplianceScoreWidget.jsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award } from 'lucide-react';

export function ComplianceScoreWidget() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function fetchCompliance() {
      const frameworks = ['pci_dss', 'gdpr', 'nist_800_53', 'hipaa'];
      const results = await Promise.all(
        frameworks.map(async (fw) => {
          const res = await fetch(`/api/wazuh/compliance-score?framework=${fw}`);
          const data = await res.json();
          return data.data;
        })
      );
      setScores(results);
    }

    fetchCompliance();
    const interval = setInterval(fetchCompliance, 300000); // 5min
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" strokeWidth={1.5} />
          Compliance Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {scores.map((item) => (
            <div key={item.framework} className="space-y-2">
              <div className="text-xs text-muted-foreground uppercase">
                {item.framework.replace('_', ' ')}
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                {item.score}%
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-slow"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

#### 4. Widget: Vulnerabilidades Críticas

```jsx
// frontend/src/components/widgets/VulnerabilitiesWidget.jsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function VulnerabilitiesWidget() {
  const [vulns, setVulns] = useState([]);

  useEffect(() => {
    async function fetchVulns() {
      const res = await fetch('/api/wazuh/vulnerabilities?severity=Critical,High');
      const data = await res.json();
      setVulns(data.data.slice(0, 5)); // Top 5
    }

    fetchVulns();
    const interval = setInterval(fetchVulns, 60000); // 1min
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    if (severity === 'Critical') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (severity === 'High') return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={1.5} />
          Top 5 Vulnerabilidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {vulns.map((vuln, idx) => (
            <div key={vuln.key} className="flex items-start justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{vuln.key}</div>
                  <div className="text-xs text-muted-foreground">
                    {vuln.agents.value} agente(s) afetado(s)
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={getSeverityColor(vuln.severity.value)}>
                {vuln.severity.value}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

#### 5. Página Completa: Agentes Wazuh

```jsx
// frontend/src/pages/SOC/WazuhAgentsPage.jsx
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Server, Search } from 'lucide-react';

export function WazuhAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/wazuh/agents');
        const data = await res.json();
        setAgents(data.data.affected_items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(search.toLowerCase()) ||
    agent.ip.includes(search)
  );

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (status === 'disconnected') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  };

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Agentes Wazuh</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitore e gerencie agentes de endpoint
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-md">
        <Card className="shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Ativos</div>
                <div className="text-2xl font-bold text-green-500">
                  {agents.filter(a => a.status === 'active').length}
                </div>
              </div>
              <Server className="h-8 w-8 text-green-500" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Desconectados</div>
                <div className="text-2xl font-bold text-red-500">
                  {agents.filter(a => a.status === 'disconnected').length}
                </div>
              </div>
              <Server className="h-8 w-8 text-red-500" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{agents.length}</div>
              </div>
              <Server className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Buscar por nome ou IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Agents Table */}
      <Card className="shadow-elegant">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Agente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">OS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Versão</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Último Keepalive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-sm font-medium">{agent.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{agent.ip}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {agent.os?.name} {agent.os?.version}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{agent.version}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(agent.lastKeepAlive).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🎨 INTEGRAÇÃO NO DASHBOARD PRINCIPAL:

### Atualizar CISODashboard.jsx

```jsx
// Importar novos widgets
import { WazuhAgentsWidget } from '@/components/widgets/WazuhAgentsWidget';
import { MitreHeatmapWidget } from '@/components/widgets/MitreHeatmapWidget';
import { ComplianceScoreWidget } from '@/components/widgets/ComplianceScoreWidget';
import { VulnerabilitiesWidget } from '@/components/widgets/VulnerabilitiesWidget';

// Adicionar no dashboard
<div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-lg">
  {/* Coluna 1: SOC */}
  <div className="space-y-grid-md">
    <TopAlertsWidget />
    <WazuhAgentsWidget />  {/* NOVO */}
  </div>

  {/* Coluna 2: NOC */}
  <div className="space-y-grid-md">
    <TopProblemsWidget />
    <VulnerabilitiesWidget />  {/* NOVO */}
  </div>

  {/* Coluna 3: GRC */}
  <div className="space-y-grid-md">
    <ComplianceScoreWidget />  {/* NOVO */}
    <MitreHeatmapWidget />  {/* NOVO */}
  </div>
</div>
```

---

## 📊 RESULTADO VISUAL:

```
┌─────────────────────────────────────────────────────────┐
│ n360 CISO Dashboard                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Alertas  │  │ Problemas│  │Compliance│              │
│  │  24      │  │    12    │  │   87%    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  ┌────────────────────┐  ┌────────────────────┐        │
│  │ Top Alertas Wazuh  │  │ Agentes Wazuh      │        │
│  ├────────────────────┤  ├────────────────────┤        │
│  │ 1. Brute Force     │  │ ✅ Ativos: 15      │        │
│  │ 2. Malware Detect  │  │ ❌ Offline: 2      │        │
│  │ 3. File Changed    │  │ ⏳ Pendente: 1     │        │
│  └────────────────────┘  └────────────────────┘        │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ MITRE ATT&CK Top 10                         │        │
│  ├────────────────────────────────────────────┤        │
│  │ 1. T1110 - Brute Force    ████████ 45      │        │
│  │ 2. T1059 - Command Exec   ██████   32      │        │
│  │ 3. T1190 - Exploit Public ████     18      │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ Top 5 Vulnerabilidades (CVE)                │        │
│  ├────────────────────────────────────────────┤        │
│  │ 1. CVE-2024-1234  🔴 Critical  5 agentes  │        │
│  │ 2. CVE-2024-5678  🟠 High      3 agentes  │        │
│  └────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO:

### Sprint: "Wazuh Integration" (8-12 horas)

**Fase 1: Backend (4h)**
- [ ] Conector OpenSearch
- [ ] Rotas de API (/api/wazuh/*)
- [ ] Testes de conexão

**Fase 2: Widgets (2h)**
- [ ] WazuhAgentsWidget
- [ ] MitreHeatmapWidget
- [ ] ComplianceScoreWidget
- [ ] VulnerabilitiesWidget

**Fase 3: Páginas (2h)**
- [ ] WazuhAgentsPage
- [ ] VulnerabilitiesPage
- [ ] CompliancePage

**Fase 4: Integração (1h)**
- [ ] Adicionar widgets no CISODashboard
- [ ] Menu sidebar (Wazuh Agents, Vulnerabilities)
- [ ] Validação e testes

**Fase 5: Documentação (1h)**
- [ ] API docs
- [ ] User guide
- [ ] Deploy

---

## 💡 VANTAGENS:

✅ **Centralização**: Tudo em um único dashboard (n360)  
✅ **Tempo Real**: Webhooks + Realtime Supabase  
✅ **Histórico**: OpenSearch com anos de dados  
✅ **Performance**: Cache inteligente  
✅ **UX**: Design System ness. consistente  
✅ **Compliance**: Scores automáticos  
✅ **MITRE**: Mapeamento visual  

---

**Quer que eu implemente AGORA?** 🚀

Posso criar todos os componentes e integrar em ~2 horas.



