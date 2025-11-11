# 🛡️ Integração Wazuh Posture Management → n360

**Feature ID**: 008  
**Nome**: Wazuh Posture Management Integration  
**Prioridade**: ⭐ ALTA  
**Status**: Em Implementação  
**Data**: 06/11/2025

---

## 🎯 OBJETIVO:

Integrar o módulo **Posture Management do Wazuh** (Security Configuration Assessment - SCA) no n360 Platform, permitindo visualizar e gerenciar a postura de segurança de todos os endpoints em um dashboard centralizado.

---

## 📋 O QUE É POSTURE MANAGEMENT?

**Definição**: Avaliação contínua da configuração de segurança dos sistemas para garantir conformidade com benchmarks e boas práticas.

**No Wazuh, inclui**:
- ✅ **CIS Benchmarks**: Conformidade com padrões CIS
- ✅ **Security Hardening**: Verificação de configurações seguras
- ✅ **Compliance Checks**: PCI DSS, HIPAA, GDPR, NIST
- ✅ **Configuration Drift**: Detecção de mudanças não autorizadas
- ✅ **Remediation Guidance**: Orientações para correção

---

## 📊 DADOS DISPONÍVEIS NO WAZUH:

### Índice OpenSearch: `wazuh-alerts-*`

**Filtro**: `rule.groups: sca` (Security Configuration Assessment)

**Campos Principais**:

```json
{
  "agent": {
    "id": "001",
    "name": "servidor-web-01",
    "ip": "192.168.1.10"
  },
  "sca": {
    "check": {
      "id": "28520",
      "title": "Ensure SSH protocol is set to 2",
      "description": "SSH supports two different protocols...",
      "rationale": "SSH protocol version 1 has inherent weaknesses...",
      "remediation": "Edit /etc/ssh/sshd_config and set: Protocol 2",
      "compliance": ["cis_csc_v8: 4.1", "pci_dss_v4.0: 2.2.4"],
      "result": "passed",  // passed | failed | not applicable
      "reason": "File /etc/ssh/sshd_config has 'Protocol 2'"
    },
    "policy": "CIS Debian Linux 10 Benchmark",
    "policy_id": "cis_debian10",
    "scan_id": "1234567890"
  },
  "rule": {
    "level": 3,
    "description": "SCA summary: CIS Debian Linux 10",
    "groups": ["sca"],
    "pci_dss": ["2.2"],
    "gdpr": ["IV_35.7.d"],
    "nist_800_53": ["CM-6"]
  },
  "@timestamp": "2025-11-06T10:30:00.000Z"
}
```

---

## 🎨 DESIGN DA INTEGRAÇÃO NO n360:

### 1. Widget no CISO Dashboard

```
┌─────────────────────────────────────┐
│ 🛡️ Postura de Segurança            │
├─────────────────────────────────────┤
│                                     │
│  Score Geral:  89%  🟢             │
│  ███████████████░░░░                │
│                                     │
│  Checks:                            │
│  ✅ Passou:        245              │
│  ❌ Falhou:         28              │
│  ⚠️  Não Aplicável:  12              │
│                                     │
│  Top Falhas:                        │
│  • SSH Config      (8 agentes)      │
│  • Password Policy (5 agentes)      │
│  • Firewall Rules  (3 agentes)      │
│                                     │
│  [Ver Detalhes →]                   │
└─────────────────────────────────────┘
```

---

### 2. Página Completa: Posture Management

```
┌──────────────────────────────────────────────────────────────┐
│ 🛡️ Posture Management                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                  │
│  │Score │  │Passou│  │Falhou│  │Agentes│                  │
│  │ 89% │  │ 245  │  │  28  │  │  15   │                  │
│  └──────┘  └──────┘  └──────┘  └──────┘                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Filtros:                                            │    │
│  │ [Policy ▼] [Status ▼] [Severidade ▼] [🔍 Buscar] │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Policies Ativas:                                    │    │
│  │                                                      │    │
│  │ 📋 CIS Debian 10          89%  ███████████░░░      │    │
│  │    Passed: 120  Failed: 15  N/A: 5                  │    │
│  │    [Expandir ▼]                                      │    │
│  │                                                      │    │
│  │ 📋 CIS Ubuntu 20.04       92%  ████████████░       │    │
│  │    Passed: 98   Failed: 8   N/A: 4                  │    │
│  │                                                      │    │
│  │ 📋 CIS Docker             85%  ██████████░░░       │    │
│  │    Passed: 27   Failed: 5   N/A: 3                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Top Checks Falhando:                                │    │
│  │                                                      │    │
│  │ 1. ❌ SSH Protocol Version                          │    │
│  │    8 agentes  |  CIS 5.2.1  |  PCI DSS 2.2.4       │    │
│  │    Remediação: Edit /etc/ssh/sshd_config...         │    │
│  │    [Ver Agentes] [Aplicar Fix]                      │    │
│  │                                                      │    │
│  │ 2. ❌ Password Minimum Length                       │    │
│  │    5 agentes  |  CIS 5.4.1  |  NIST IA-5          │    │
│  │                                                      │    │
│  │ 3. ❌ Firewall Status                               │    │
│  │    3 agentes  |  CIS 3.5.1  |  GDPR IV.35         │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA:

### Backend: Conector SCA

```javascript
// backend/connectors/wazuh-posture.js
const { Client } = require('@opensearch-project/opensearch');
const logger = require('../utils/logger');

const opensearchClient = new Client({
  node: 'https://wazuh-indexer:9200',
  auth: {
    username: 'admin',
    password: process.env.WAZUH_INDEXER_PASSWORD
  },
  ssl: { rejectUnauthorized: false }
});

/**
 * Buscar resumo de postura de segurança
 */
async function getPostureSummary() {
  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { 'rule.groups': 'sca' } },
              { range: { '@timestamp': { gte: 'now-24h' } } }
            ]
          }
        },
        aggs: {
          total_checks: { value_count: { field: 'sca.check.id' } },
          passed: {
            filter: { term: { 'sca.check.result': 'passed' } }
          },
          failed: {
            filter: { term: { 'sca.check.result': 'failed' } }
          },
          not_applicable: {
            filter: { term: { 'sca.check.result': 'not applicable' } }
          },
          by_policy: {
            terms: { field: 'sca.policy.keyword', size: 20 },
            aggs: {
              passed: { filter: { term: { 'sca.check.result': 'passed' } } },
              failed: { filter: { term: { 'sca.check.result': 'failed' } } }
            }
          }
        },
        size: 0
      }
    });

    const aggs = response.body.aggregations;
    const total = aggs.total_checks.value;
    const passed = aggs.passed.doc_count;
    const failed = aggs.failed.doc_count;
    const notApplicable = aggs.not_applicable.doc_count;
    const score = total > 0 ? ((passed / (passed + failed)) * 100).toFixed(2) : 0;

    return {
      score: parseFloat(score),
      total,
      passed,
      failed,
      not_applicable: notApplicable,
      policies: aggs.by_policy.buckets.map(bucket => ({
        name: bucket.key,
        total: bucket.doc_count,
        passed: bucket.passed.doc_count,
        failed: bucket.failed.doc_count,
        score: bucket.doc_count > 0 
          ? ((bucket.passed.doc_count / bucket.doc_count) * 100).toFixed(2)
          : 0
      }))
    };
  } catch (error) {
    logger.error('[Wazuh Posture] Erro ao buscar summary:', error);
    throw error;
  }
}

/**
 * Buscar checks falhando
 */
async function getFailedChecks(limit = 10) {
  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { 'rule.groups': 'sca' } },
              { term: { 'sca.check.result': 'failed' } },
              { range: { '@timestamp': { gte: 'now-7d' } } }
            ]
          }
        },
        aggs: {
          by_check: {
            terms: { field: 'sca.check.title.keyword', size: limit },
            aggs: {
              agents: { cardinality: { field: 'agent.id' } },
              compliance: { terms: { field: 'sca.check.compliance.keyword', size: 10 } },
              latest: { top_hits: { size: 1, sort: [{ '@timestamp': 'desc' }] } }
            }
          }
        },
        size: 0
      }
    });

    return response.body.aggregations.by_check.buckets.map(bucket => {
      const latest = bucket.latest.hits.hits[0]._source;
      return {
        id: latest.sca.check.id,
        title: bucket.key,
        description: latest.sca.check.description,
        rationale: latest.sca.check.rationale,
        remediation: latest.sca.check.remediation,
        compliance: bucket.compliance.buckets.map(c => c.key),
        affected_agents: bucket.agents.value,
        count: bucket.doc_count
      };
    });
  } catch (error) {
    logger.error('[Wazuh Posture] Erro ao buscar failed checks:', error);
    throw error;
  }
}

/**
 * Buscar checks por agente
 */
async function getAgentPosture(agentId) {
  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { 'rule.groups': 'sca' } },
              { term: { 'agent.id': agentId } },
              { range: { '@timestamp': { gte: 'now-24h' } } }
            ]
          }
        },
        aggs: {
          by_policy: {
            terms: { field: 'sca.policy.keyword' },
            aggs: {
              passed: { filter: { term: { 'sca.check.result': 'passed' } } },
              failed: { filter: { term: { 'sca.check.result': 'failed' } } },
              checks: {
                terms: { field: 'sca.check.title.keyword', size: 100 },
                aggs: {
                  latest: { top_hits: { size: 1, sort: [{ '@timestamp': 'desc' }] } }
                }
              }
            }
          }
        },
        size: 0
      }
    });

    return response.body.aggregations.by_policy.buckets.map(policy => ({
      policy: policy.key,
      total: policy.doc_count,
      passed: policy.passed.doc_count,
      failed: policy.failed.doc_count,
      score: ((policy.passed.doc_count / policy.doc_count) * 100).toFixed(2),
      checks: policy.checks.buckets.map(check => {
        const latest = check.latest.hits.hits[0]._source;
        return {
          id: latest.sca.check.id,
          title: check.key,
          result: latest.sca.check.result,
          compliance: latest.sca.check.compliance || [],
          remediation: latest.sca.check.remediation
        };
      })
    }));
  } catch (error) {
    logger.error('[Wazuh Posture] Erro ao buscar agent posture:', error);
    throw error;
  }
}

/**
 * Buscar compliance score por framework
 */
async function getComplianceScore(framework) {
  // framework: pci_dss, gdpr, hipaa, nist_800_53, cis
  try {
    const response = await opensearchClient.search({
      index: 'wazuh-alerts-*',
      body: {
        query: {
          bool: {
            must: [
              { match: { 'rule.groups': 'sca' } },
              { exists: { field: `sca.check.compliance` } },
              { range: { '@timestamp': { gte: 'now-7d' } } }
            ]
          }
        },
        aggs: {
          compliance_checks: {
            filter: {
              wildcard: { 'sca.check.compliance': `*${framework}*` }
            },
            aggs: {
              passed: { filter: { term: { 'sca.check.result': 'passed' } } },
              failed: { filter: { term: { 'sca.check.result': 'failed' } } }
            }
          }
        },
        size: 0
      }
    });

    const checks = response.body.aggregations.compliance_checks;
    const total = checks.doc_count;
    const passed = checks.passed.doc_count;
    const failed = checks.failed.doc_count;
    const score = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

    return {
      framework,
      score: parseFloat(score),
      total,
      passed,
      failed
    };
  } catch (error) {
    logger.error('[Wazuh Posture] Erro ao buscar compliance:', error);
    throw error;
  }
}

module.exports = {
  opensearchClient,
  getPostureSummary,
  getFailedChecks,
  getAgentPosture,
  getComplianceScore
};
```

---

### Backend: API Routes

```javascript
// backend/routes/posture.js
const express = require('express');
const router = express.Router();
const {
  getPostureSummary,
  getFailedChecks,
  getAgentPosture,
  getComplianceScore
} = require('../connectors/wazuh-posture');
const logger = require('../utils/logger');

/**
 * GET /api/posture/summary
 * Resumo geral da postura de segurança
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = await getPostureSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /summary:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar resumo de postura'
    });
  }
});

/**
 * GET /api/posture/failed-checks
 * Top checks falhando
 */
router.get('/failed-checks', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const checks = await getFailedChecks(limit);
    
    res.json({
      success: true,
      data: checks,
      count: checks.length
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /failed-checks:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar checks falhando'
    });
  }
});

/**
 * GET /api/posture/agent/:id
 * Postura de um agente específico
 */
router.get('/agent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const posture = await getAgentPosture(id);
    
    res.json({
      success: true,
      data: posture
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /agent:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar postura do agente'
    });
  }
});

/**
 * GET /api/posture/compliance/:framework
 * Score de compliance por framework
 */
router.get('/compliance/:framework', async (req, res) => {
  try {
    const { framework } = req.params;
    const score = await getComplianceScore(framework);
    
    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    logger.error('[API Posture] Erro em /compliance:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar compliance score'
    });
  }
});

module.exports = router;
```

---

### Frontend: Widget Posture Score

```jsx
// frontend/src/components/widgets/PostureScoreWidget.jsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PostureScoreWidget() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/posture/summary');
        const data = await res.json();
        setSummary(data.data);
      } catch (error) {
        console.error('Error fetching posture summary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
    const interval = setInterval(fetchSummary, 60000); // 1min
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card 
      className="shadow-elegant hover:shadow-elegant-hover transition-all duration-base cursor-pointer group"
      onClick={() => navigate('/soc/posture')}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Postura de Segurança</CardTitle>
        <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors">
          <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Geral */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-xs text-muted-foreground">Score Geral</span>
            <span className={`text-2xl font-bold ${getScoreColor(summary.score)}`}>
              {summary.score}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full ${getScoreBg(summary.score)} transition-all duration-slow`}
              style={{ width: `${summary.score}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-green-500/5 border border-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500 mb-1" strokeWidth={1.5} />
            <div className="text-lg font-bold text-green-500">{summary.passed}</div>
            <div className="text-xs text-muted-foreground">Passou</div>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-red-500/5 border border-red-500/10">
            <XCircle className="h-4 w-4 text-red-500 mb-1" strokeWidth={1.5} />
            <div className="text-lg font-bold text-red-500">{summary.failed}</div>
            <div className="text-xs text-muted-foreground">Falhou</div>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50 border border-border/50">
            <AlertCircle className="h-4 w-4 text-muted-foreground mb-1" strokeWidth={1.5} />
            <div className="text-lg font-bold">{summary.not_applicable}</div>
            <div className="text-xs text-muted-foreground">N/A</div>
          </div>
        </div>

        {/* Top Policies */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">Top Policies:</div>
          {summary.policies.slice(0, 3).map((policy) => (
            <div key={policy.name} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate flex-1">
                {policy.name.replace('CIS ', '').substring(0, 20)}
              </span>
              <Badge variant="outline" className={`ml-2 ${
                policy.score >= 90 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                policy.score >= 70 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {policy.score}%
              </Badge>
            </div>
          ))}
        </div>

        {/* Ver Detalhes */}
        <div className="pt-2 border-t border-border/50">
          <button className="text-xs text-primary hover:underline w-full text-left">
            Ver Detalhes →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### Frontend: Página Completa

```jsx
// frontend/src/pages/SOC/PostureManagementPage.jsx
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, Search, CheckCircle2, XCircle, AlertCircle, ChevronDown, ExternalLink } from 'lucide-react';

export function PostureManagementPage() {
  const [summary, setSummary] = useState(null);
  const [failedChecks, setFailedChecks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState('all');
  const [expandedCheck, setExpandedCheck] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, checksRes] = await Promise.all([
          fetch('/api/posture/summary'),
          fetch('/api/posture/failed-checks?limit=20')
        ]);

        const summaryData = await summaryRes.json();
        const checksData = await checksRes.json();

        setSummary(summaryData.data);
        setFailedChecks(checksData.data);
      } catch (error) {
        console.error('Error fetching posture data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000); // 1min
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  const filteredChecks = failedChecks.filter(check =>
    check.title.toLowerCase().includes(search.toLowerCase())
  );

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Posture Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Avaliação contínua de configurações de segurança (Wazuh SCA)
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-grid-md">
        {/* Score Geral */}
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Score Geral</div>
                <div className={`text-3xl font-bold ${getScoreColor(summary.score)}`}>
                  {summary.score}%
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mt-2 w-24">
                  <div
                    className={`h-full transition-all duration-slow ${
                      summary.score >= 90 ? 'bg-green-500' :
                      summary.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${summary.score}%` }}
                  />
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checks Passou */}
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Passou</div>
                <div className="text-3xl font-bold text-green-500">{summary.passed}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary.total} checks total
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checks Falhou */}
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Falhou</div>
                <div className="text-3xl font-bold text-red-500">{summary.failed}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Requer atenção
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <XCircle className="h-6 w-6 text-red-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* N/A */}
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Não Aplicável</div>
                <div className="text-3xl font-bold">{summary.not_applicable}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ignorados
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                <AlertCircle className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Policies Ativas ({summary.policies.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.policies.map((policy) => (
            <div key={policy.name} className="p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{policy.name}</div>
                <Badge variant="outline" className={
                  policy.score >= 90 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  policy.score >= 70 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }>
                  {policy.score}%
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" strokeWidth={1.5} />
                  Passou: {policy.passed}
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" strokeWidth={1.5} />
                  Falhou: {policy.failed}
                </span>
                <span>Total: {policy.total}</span>
              </div>

              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-slow ${
                    policy.score >= 90 ? 'bg-green-500' :
                    policy.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${policy.score}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Buscar checks falhando..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Failed Checks */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Checks Falhando ({filteredChecks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredChecks.map((check) => (
            <div key={check.id} className="border border-border rounded-lg overflow-hidden">
              <div
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-500" strokeWidth={1.5} />
                      <div className="font-medium text-sm">{check.title}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      ID: {check.id} | {check.affected_agents} agente(s) afetado(s)
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {check.compliance.slice(0, 3).map((comp, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      expandedCheck === check.id ? 'rotate-180' : ''
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCheck === check.id && (
                <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Descrição:</div>
                    <div className="text-sm">{check.description}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Justificativa:</div>
                    <div className="text-sm text-muted-foreground">{check.rationale}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Remediação:</div>
                    <div className="text-sm bg-muted p-2 rounded border border-border font-mono">
                      {check.remediation}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                      Ver no Wazuh
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">
                      Ver Agentes Afetados
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔗 INTEGRAÇÃO COMPLETA:

### 1. Adicionar Rotas no Backend

```javascript
// backend/index.js
const postureRoutes = require('./routes/posture');

// ...
app.use('/api/posture', postureRoutes);
```

### 2. Adicionar Rota no Frontend

```javascript
// frontend/src/App.jsx
import { PostureManagementPage } from './pages/SOC/PostureManagementPage';

// ...
<Route path="/soc/posture" element={<PostureManagementPage />} />
```

### 3. Adicionar Widget no Dashboard

```javascript
// frontend/src/pages/Dashboard/CISODashboard.jsx
import { PostureScoreWidget } from '@/components/widgets/PostureScoreWidget';

// No grid principal:
<div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-lg">
  <div className="space-y-grid-md">
    <TopAlertsWidget />
    <PostureScoreWidget />  {/* NOVO */}
  </div>
  // ...
</div>
```

### 4. Adicionar no Menu

```jsx
// frontend/src/components/Sidebar.jsx
{
  name: 'Posture',
  icon: Shield,
  path: '/soc/posture',
  active: location.pathname.startsWith('/soc/posture')
}
```

---

## 📊 RESULTADO VISUAL ESPERADO:

```
n360 CISO Dashboard:
┌─────────────────────────────────────────────────────────┐
│ KPIs Gerais                                              │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│ │ 24  │ │ 12  │ │ 87% │ │ 89% │                       │
│ └─────┘ └─────┘ └─────┘ └─────┘                       │
│ Alertas Problemas Compli. Posture ← NOVO!                  │
│                                                             │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐   │
│ │ Top Alertas   │ │ Top Problemas │ │ Posture Score │   │
│ │ Wazuh         │ │ Zabbix        │ │ Wazuh SCA     │   │
│ │               │ │               │ │               │   │
│ │ 1. Brute...   │ │ 1. CPU High   │ │ Score: 89%    │   │
│ │ 2. Malware    │ │ 2. Disk...    │ │ ███████████░░ │   │
│ │ 3. FIM...     │ │ 3. Memory...  │ │               │   │
│ │               │ │               │ │ ✅ Passou: 245│   │
│ │               │ │               │ │ ❌ Falhou: 28 │   │
│ │               │ │               │ │ ⚠️  N/A: 12    │   │
│ │               │ │               │ │               │   │
│ │               │ │               │ │ Top Policies: │   │
│ │               │ │               │ │ CIS Debian 89%│   │
│ │               │ │               │ │ CIS Ubuntu 92%│   │
│ │               │ │               │ │ [Detalhes →]  │   │
│ └───────────────┘ └───────────────┘ └───────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO:

### Tempo Estimado: 2-3 horas

**Fase 1: Backend (1h)**
- [ ] Criar `connectors/wazuh-posture.js`
- [ ] Criar `routes/posture.js`
- [ ] Integrar no `index.js`
- [ ] Testar endpoints

**Fase 2: Widgets (30min)**
- [ ] Criar `PostureScoreWidget.jsx`
- [ ] Integrar no `CISODashboard.jsx`
- [ ] Testar visualização

**Fase 3: Página Completa (1h)**
- [ ] Criar `PostureManagementPage.jsx`
- [ ] Adicionar rota em `App.jsx`
- [ ] Adicionar no menu `Sidebar.jsx`

**Fase 4: Deploy (30min)**
- [ ] Build frontend
- [ ] Deploy na VPS
- [ ] Validação completa
- [ ] Commit e documentação

---

## 💡 FEATURES EXTRAS:

### 1. Remediation Automation (via Shuffle)

```javascript
// Botão "Aplicar Fix" chama:
POST /api/posture/remediate
{
  "check_id": "28520",
  "agent_ids": ["001", "002", "003"],
  "remediation_script": "sed -i 's/Protocol 1/Protocol 2/' /etc/ssh/sshd_config"
}

// Backend aciona Shuffle:
POST https://shuffle.nsecops.com.br/api/v1/workflows/remediation
```

### 2. Compliance Tracking

```javascript
// Timeline de evolução do score
GET /api/posture/compliance-history?framework=pci_dss&days=30

// Retorna array com score diário
[
  { date: '2025-11-01', score: 85 },
  { date: '2025-11-02', score: 86 },
  // ...
  { date: '2025-11-06', score: 89 }
]

// Gráfico de linha mostrando evolução
```

### 3. Agent Comparison

```javascript
// Comparar postura entre agentes
GET /api/posture/compare?agents=001,002,003

// Matriz mostrando quais checks cada agente passou/falhou
```

---

## ✅ CRITÉRIOS DE SUCESSO:

- ✅ Widget de Posture Score no CISO Dashboard
- ✅ Página completa de Posture Management
- ✅ Integração com OpenSearch do Wazuh
- ✅ Filtros por policy, status, agente
- ✅ Visualização de remediação
- ✅ Design System ness. aplicado
- ✅ Tempo de resposta < 500ms
- ✅ Auto-refresh a cada 1 minuto

---

**Quer que eu implemente AGORA?** 🚀

Posso ter tudo funcionando em 2-3 horas!



