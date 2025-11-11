# 🤖 Especificação Técnica: N360 GRC - AI Agents Layer

**Versão**: 3.0  
**Data**: 06/11/2025  
**Projeto**: n360 Platform - GRC AI Intelligence Layer  
**Tipo**: AI/ML Microservices Architecture  
**Dependência**: GRC ISMS Evolution (Spec 005)

---

## 🎯 1. Visão Geral

### 1.1 Contexto

O **N360 GRC ISMS** (Spec 005) fornece a estrutura de dados e processos para Governança, Risco e Conformidade. No entanto, a manutenção de um ISMS completo requer esforço significativo:

- Classificação manual de ativos (CID)
- Mapeamento manual de riscos
- Interpretação de logs de controles
- Análise de causa raiz de incidentes
- Geração de relatórios executivos

### 1.2 Objetivo

Criar uma **camada de AI Agents** que automatiza tarefas cognitivas do GRC, transformando-o de um sistema **passivo** (espera input humano) para **ativo** (sugere, prediz, automatiza).

### 1.3 Arquitetura de Agentes

```
┌─────────────────────────────────────────────────────────┐
│  N360 Ecosystem                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Wazuh   │  │  Zabbix  │  │ Shuffle  │             │
│  │  (SOC)   │  │  (NOC)   │  │  (SOAR)  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │              │                    │
│       └─────────────┴──────────────┘                    │
│                     │                                    │
│         ┌───────────▼────────────┐                      │
│         │   N360 GRC (ISMS)      │                      │
│         │   REST API             │                      │
│         └───────────┬────────────┘                      │
│                     │                                    │
│         ┌───────────▼────────────┐                      │
│         │   AI Agents Layer      │  ← NOVA CAMADA      │
│         ├────────────────────────┤                      │
│         │                        │                      │
│         │  ┌──────────────────┐ │                      │
│         │  │  CARA (Agent 1)  │ │ Context & Risk       │
│         │  │  - Asset Class   │ │                      │
│         │  │  - Risk Suggest  │ │                      │
│         │  │  - RRP Predict   │ │                      │
│         │  └──────────────────┘ │                      │
│         │                        │                      │
│         │  ┌──────────────────┐ │                      │
│         │  │  CAVA (Agent 2)  │ │ Control Automation   │
│         │  │  - Playbook Gen  │ │                      │
│         │  │  - Evidence Int  │ │                      │
│         │  │  - Test Optimize │ │                      │
│         │  └──────────────────┘ │                      │
│         │                        │                      │
│         │  ┌──────────────────┐ │                      │
│         │  │ CARA-C (Agent 3) │ │ Response & Compliance│
│         │  │  - RCA Analysis  │ │                      │
│         │  │  - CAPA Suggest  │ │                      │
│         │  │  - Report Gen    │ │                      │
│         │  └──────────────────┘ │                      │
│         │                        │                      │
│         └────────────────────────┘                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 2. AI Agent 1: CARA (Context and Asset Risk Agent)

**ID**: GRC-AI-001  
**Função**: Classificação de ativos e predição de riscos

### 2.1 Função A1: Automated Asset Classification

**Objetivo**: Classificar automaticamente novos ativos (CID).

#### Input
```json
{
  "agent": "CARA",
  "function": "classify_asset",
  "data": {
    "asset_id": "uuid",
    "metadata": {
      "hostname": "web-server-01",
      "os": "Ubuntu 22.04",
      "open_ports": [22, 80, 443, 3306],
      "services": ["nginx", "mysql", "sshd"],
      "network_zone": "DMZ",
      "zabbix_metrics": {
        "cpu_avg": 45,
        "memory_usage": 70,
        "network_traffic_gb": 120
      },
      "wazuh_data": {
        "agent_status": "active",
        "vulnerabilities_count": 3,
        "critical_files_monitored": 150
      }
    }
  }
}
```

#### Output
```json
{
  "asset_id": "uuid",
  "suggested_classification": {
    "confidentiality_impact": 4,
    "integrity_impact": 5,
    "availability_impact": 5,
    "business_impact": 14,
    "confidence_score": 0.87
  },
  "reasoning": "Alto tráfego de rede (120GB), MySQL ativo (indica dados críticos), e 150 arquivos críticos monitorados sugerem alta integridade e disponibilidade. Porta 3306 exposta requer alta confidencialidade.",
  "suggested_asset_function": "Database Server - Web Application",
  "suggested_owner": "DBA Team",
  "risk_indicators": [
    "MySQL port 3306 exposed to DMZ",
    "3 vulnerabilities detected",
    "High availability dependency"
  ]
}
```

#### Tecnologia

**Modelo**: Random Forest Classifier ou Neural Network
**Features**:
- Open ports (categorical)
- Services running (one-hot encoding)
- Network metrics (normalized)
- Vulnerability count (numerical)
- File monitoring count (numerical)

**Training Data**:
- Histórico de ativos já classificados manualmente
- Labels: CID scores (1-5 cada)
- ~200-500 ativos para treino inicial

**Metrics**:
- Accuracy: > 85%
- F1-Score: > 0.80

---

### 2.2 Função A2: Intelligent Risk/Vulnerability Suggestion

**Objetivo**: Sugerir riscos e controles para novos ativos.

#### Input
```json
{
  "agent": "CARA",
  "function": "suggest_risks",
  "data": {
    "asset_id": "uuid",
    "asset_classification": {
      "confidentiality": 4,
      "integrity": 5,
      "availability": 5
    },
    "wazuh_vulns": [
      {
        "cve_id": "CVE-2023-12345",
        "severity": "HIGH",
        "description": "SQL Injection vulnerability"
      }
    ],
    "threat_intel": {
      "sector": "healthcare",
      "recent_attacks": ["ransomware", "data_breach"]
    }
  }
}
```

#### Output
```json
{
  "suggested_risks": [
    {
      "threat_id": "THREAT-001",
      "threat_name": "SQL Injection Attack",
      "vulnerability_id": "CVE-2023-12345",
      "likelihood": 4,
      "impact": 5,
      "inherent_risk_score": 20,
      "confidence": 0.92,
      "reasoning": "CVE crítico detectado, porta MySQL exposta, setor healthcare é alvo frequente"
    },
    {
      "threat_id": "THREAT-002",
      "threat_name": "Ransomware Attack",
      "vulnerability_id": "VULN-002",
      "likelihood": 3,
      "impact": 5,
      "inherent_risk_score": 15,
      "confidence": 0.78,
      "reasoning": "Setor healthcare, dados críticos, histórico de ataques recentes"
    }
  ],
  "suggested_controls": [
    "ISO-27001-A.14.1.2 - Security in Development",
    "NIST-AC-3 - Access Enforcement",
    "CIS-4.1 - Database Hardening"
  ]
}
```

#### Tecnologia

**Modelo**: Graph Neural Network (GNN) + NLP
**Features**:
- CVE embeddings (BERT)
- Threat intelligence (external feeds)
- Asset metadata (graph structure)
- Historical risk patterns

**Training Data**:
- CVE database (NVD)
- MITRE ATT&CK framework
- Histórico de riscos mapeados no GRC
- Threat intelligence feeds

---

### 2.3 Função A3: Predictive Residual Risk Score (RRP)

**Objetivo**: Prever risco residual futuro baseado em tendências.

#### Input
```json
{
  "agent": "CARA",
  "function": "predict_residual_risk",
  "data": {
    "risk_id": "uuid",
    "historical_incidents": [
      {"date": "2025-01-15", "severity": "high"},
      {"date": "2025-02-20", "severity": "medium"},
      {"date": "2025-03-10", "severity": "high"}
    ],
    "control_effectiveness_trend": [
      {"date": "2025-01-01", "score": 0.95},
      {"date": "2025-02-01", "score": 0.90},
      {"date": "2025-03-01", "score": 0.85}
    ],
    "wazuh_alert_frequency": {
      "last_7_days": 15,
      "last_30_days": 45,
      "trend": "increasing"
    }
  }
}
```

#### Output
```json
{
  "risk_id": "uuid",
  "rrp_score": 85,
  "rrp_category": "HIGH",
  "prediction_confidence": 0.81,
  "trend": "deteriorating",
  "forecast_30_days": {
    "expected_incidents": 2,
    "expected_residual_score": 18
  },
  "reasoning": "Eficácia de controles caindo (-10% em 3 meses), frequência de alertas aumentando (+200% em 30 dias), histórico mostra materialização crescente.",
  "recommendations": [
    "Executar audit imediato do controle ISO-27001-A.12.2.1",
    "Aumentar frequência de teste de semanal para diário",
    "Considerar controle compensatório adicional"
  ]
}
```

#### Tecnologia

**Modelo**: LSTM (Long Short-Term Memory) ou Prophet
**Features**:
- Time-series de incidents (count, severity)
- Time-series de control effectiveness
- Alert frequency (Wazuh/Zabbix)
- Seasonal patterns

**Training Data**:
- Mínimo 6 meses de histórico
- Incidents, control tests, alerts

**Metrics**:
- RMSE (Root Mean Square Error) < 5
- Prediction accuracy > 75%

---

## 🛡️ 3. AI Agent 2: CAVA (Control Automation and Validation Agent)

**ID**: GRC-AI-002  
**Função**: Automação de controles e auditoria

### 3.1 Função B1: Shuffle Playbook Blueprint Generation

**Objetivo**: Gerar esqueleto de Shuffle workflow a partir de descrição em linguagem natural.

#### Input
```json
{
  "agent": "CAVA",
  "function": "generate_playbook",
  "data": {
    "control_id": "ISO-27001-A.12.2.1",
    "test_objective": "Verificar se 100% dos servidores possuem antivírus ativo e atualizado",
    "test_procedure": "Consultar via Wazuh API o status do módulo antivírus em todos os agentes ativos. Verificar versão de assinatura < 24 horas. Retornar lista de não-conformidades.",
    "expected_result": "0 agentes sem antivírus ou com assinatura desatualizada",
    "target_systems": ["wazuh"],
    "test_frequency": 7
  }
}
```

#### Output
```json
{
  "control_id": "ISO-27001-A.12.2.1",
  "playbook_blueprint": {
    "name": "Test_Antivirus_Status_ISO27001_A1221",
    "description": "Automated test for antivirus coverage",
    "trigger": "scheduled",
    "schedule": "0 8 * * 1",
    "nodes": [
      {
        "id": "1",
        "type": "HTTP",
        "name": "Get Wazuh Agents",
        "config": {
          "method": "GET",
          "url": "https://wazuh.nsecops.com.br:55000/agents",
          "headers": {
            "Authorization": "$wazuh_token"
          }
        },
        "next": "2"
      },
      {
        "id": "2",
        "type": "ForEach",
        "name": "Check Each Agent",
        "config": {
          "array": "$node_1.data.agents"
        },
        "next": "3"
      },
      {
        "id": "3",
        "type": "HTTP",
        "name": "Get Antivirus Status",
        "config": {
          "method": "GET",
          "url": "https://wazuh.nsecops.com.br:55000/syscollector/$item.id/packages?search=clamav",
          "headers": {
            "Authorization": "$wazuh_token"
          }
        },
        "next": "4"
      },
      {
        "id": "4",
        "type": "Condition",
        "name": "Check Compliance",
        "config": {
          "condition": "$node_3.data.total_affected_items > 0 && $node_3.data.affected_items[0].version != null"
        },
        "next_true": "5",
        "next_false": "6"
      },
      {
        "id": "5",
        "type": "AppendArray",
        "name": "Add to Compliant List",
        "config": {
          "array": "$compliant_agents",
          "item": "$item"
        }
      },
      {
        "id": "6",
        "type": "AppendArray",
        "name": "Add to Non-Compliant List",
        "config": {
          "array": "$non_compliant_agents",
          "item": "$item"
        }
      },
      {
        "id": "7",
        "type": "HTTP",
        "name": "Submit Test Results to GRC",
        "config": {
          "method": "POST",
          "url": "https://api.n360.nsecops.com.br/api/controls/ISO-27001-A.12.2.1/test-results",
          "body": {
            "test_result": "$if($count(non_compliant_agents) == 0, 'passed', 'failed')",
            "effectiveness_score": "$count(compliant_agents) / $count(all_agents)",
            "evidence_json": {
              "compliant": "$compliant_agents",
              "non_compliant": "$non_compliant_agents"
            }
          }
        }
      }
    ]
  },
  "estimated_execution_time": "2-5 minutes",
  "complexity": "medium",
  "confidence": 0.89
}
```

#### Tecnologia

**Modelo**: GPT-4 / Claude (LLM) fine-tuned
**Fine-tuning Data**:
- 50-100 pares (descrição → Shuffle JSON)
- Documentação Shuffle API
- Documentação Wazuh/Zabbix API

**Prompt Engineering**:
```
Você é um especialista em Shuffle workflows e APIs Wazuh/Zabbix.
Dada a seguinte descrição de teste de controle:
{test_procedure}

Gere um workflow Shuffle em JSON que:
1. Conecta à API correta (Wazuh/Zabbix)
2. Coleta a evidência necessária
3. Aplica lógica de validação
4. Envia resultado para GRC API

Output: JSON válido no formato Shuffle.
```

**Validação**:
- Schema Shuffle (JSON Schema)
- Syntax check automático

---

### 3.2 Função B2: Intelligent Evidence Interpretation

**Objetivo**: Interpretar logs/JSONs e determinar eficácia de controle.

#### Input
```json
{
  "agent": "CAVA",
  "function": "interpret_evidence",
  "data": {
    "control_id": "ISO-27001-A.12.2.1",
    "test_objective": "100% de servidores com antivírus ativo",
    "raw_evidence": {
      "source": "wazuh",
      "timestamp": "2025-11-06T02:00:00Z",
      "data": {
        "total_agents": 100,
        "agents_with_antivirus": 97,
        "agents_without_antivirus": 3,
        "outdated_signatures": 5,
        "details": [
          {"agent": "001", "status": "ok", "version": "0.103.9", "signature_age_hours": 2},
          {"agent": "002", "status": "ok", "version": "0.103.9", "signature_age_hours": 4},
          {"agent": "003", "status": "not_installed", "version": null}
        ]
      }
    }
  }
}
```

#### Output
```json
{
  "control_id": "ISO-27001-A.12.2.1",
  "test_result": "partially_effective",
  "effectiveness_score": 0.92,
  "confidence_score": 0.95,
  "interpretation": {
    "summary": "97% dos servidores possuem antivírus instalado e ativo. 3 servidores sem proteção (agentes 003, 045, 078). 5 servidores com assinaturas desatualizadas (> 24h).",
    "compliance_status": "non_compliant",
    "gap_analysis": {
      "missing_agents": 3,
      "outdated_signatures": 5,
      "total_issues": 8
    },
    "severity": "medium",
    "risk_impact": "Risco Residual aumenta de 6 para 9 (médio → médio-alto)"
  },
  "recommended_actions": [
    {
      "priority": "high",
      "action": "Instalar antivírus nos agentes 003, 045, 078",
      "assignee": "SecOps Team",
      "due_date": "2025-11-08T00:00:00Z"
    },
    {
      "priority": "medium",
      "action": "Forçar atualização de assinaturas nos 5 agentes",
      "automation_available": true,
      "shuffle_workflow": "force_update_av_signatures"
    }
  ]
}
```

#### Tecnologia

**Modelo**: Text Classification + Anomaly Detection
**Abordagem**:
1. **NLP** (BERT/RoBERTa) para interpretar logs textuais
2. **Rule Engine** para métricas numéricas
3. **Anomaly Detection** (Isolation Forest) para identificar outliers

**Training Data**:
- Histórico de test executions já interpretadas manualmente
- Labels: effective/ineffective + reasoning
- ~500-1000 execuções

**Features**:
- Texto de logs (embeddings)
- Métricas numéricas (compliance %)
- Severity de findings
- Control type (preventive, detective, etc)

---

### 3.3 Função B3: Optimization of Test Frequency

**Objetivo**: Otimizar frequência de testes baseado em risco e eficácia.

#### Input
```json
{
  "agent": "CAVA",
  "function": "optimize_test_frequency",
  "data": {
    "control_id": "ISO-27001-A.12.2.1",
    "current_frequency_days": 7,
    "test_history": [
      {"date": "2025-10-01", "result": "passed", "effectiveness": 1.0},
      {"date": "2025-10-08", "result": "passed", "effectiveness": 1.0},
      {"date": "2025-10-15", "result": "passed", "effectiveness": 0.99},
      {"date": "2025-10-22", "result": "passed", "effectiveness": 1.0},
      {"date": "2025-10-29", "result": "passed", "effectiveness": 1.0}
    ],
    "rrp_score": 12,
    "related_risks": [
      {"risk_id": "uuid", "residual_score": 6}
    ]
  }
}
```

#### Output
```json
{
  "control_id": "ISO-27001-A.12.2.1",
  "current_frequency_days": 7,
  "recommended_frequency_days": 14,
  "reasoning": "Controle consistentemente efetivo (100% pass rate nos últimos 5 testes). RRP Score médio (12). Riscos associados são de baixa criticidade. Otimização: Reduzir de semanal para quinzenal.",
  "estimated_resource_savings": "50% de execuções (-26 testes/ano)",
  "risk_impact": "negligible",
  "confidence": 0.84,
  "conditions_to_revert": [
    "Se effectiveness_score < 0.90 em qualquer teste",
    "Se RRP Score > 15",
    "Se incident materializado relacionado a este controle"
  ]
}
```

#### Tecnologia

**Modelo**: Reinforcement Learning ou Optimization Algorithm
**Objetivo**: Minimizar `cost` (testes) mantendo `risk` baixo

**Função de Custo**:
```
Cost = (test_frequency × resource_cost) + (risk_exposure × business_impact)
```

**Training Data**:
- Histórico de test frequency changes
- Outcomes (incidents após mudança?)
- Resource utilization metrics

---

## 📊 4. AI Agent 3: CARA-C (Response and Compliance Agent)

**ID**: GRC-AI-003  
**Função**: Análise de incidentes e geração de relatórios

### 4.1 Função C1: Post-Incident Root Cause Analysis (RCA)

**Objetivo**: Identificar causa raiz de incidentes automaticamente.

#### Input
```json
{
  "agent": "CARA-C",
  "function": "root_cause_analysis",
  "data": {
    "incident_id": "uuid",
    "incident_details": {
      "title": "Rootkit detected on web-server-01",
      "severity": "critical",
      "detected_at": "2025-11-06T01:30:00Z"
    },
    "failed_control_id": "ISO-27001-A.12.2.1",
    "wazuh_logs_before_incident": [
      {"timestamp": "2025-11-06T01:00:00Z", "rule": "5710", "description": "Failed SSH login"},
      {"timestamp": "2025-11-06T01:15:00Z", "rule": "5712", "description": "Multiple authentication failures"},
      {"timestamp": "2025-11-06T01:25:00Z", "rule": "510", "description": "New file in /tmp"},
      {"timestamp": "2025-11-06T01:28:00Z", "rule": "550", "description": "Integrity checksum changed /bin/ps"}
    ],
    "zabbix_metrics_before_incident": {
      "cpu_spike": {"time": "2025-11-06T01:20:00Z", "value": 95},
      "network_anomaly": {"time": "2025-11-06T01:22:00Z", "outbound_traffic_gb": 50}
    },
    "control_last_test": {
      "date": "2025-10-30T08:00:00Z",
      "result": "passed",
      "effectiveness": 1.0
    }
  }
}
```

#### Output
```json
{
  "incident_id": "uuid",
  "root_cause_analysis": {
    "primary_cause": "Brute-force SSH attack seguido de privilege escalation",
    "attack_chain": [
      {
        "step": 1,
        "timestamp": "2025-11-06T01:00:00Z",
        "event": "Multiple failed SSH login attempts (rule 5710)",
        "ttps": "MITRE T1110 - Brute Force"
      },
      {
        "step": 2,
        "timestamp": "2025-11-06T01:15:00Z",
        "event": "Successful SSH compromise",
        "ttps": "MITRE T1078 - Valid Accounts"
      },
      {
        "step": 3,
        "timestamp": "2025-11-06T01:25:00Z",
        "event": "Malicious file dropped in /tmp",
        "ttps": "MITRE T1105 - Ingress Tool Transfer"
      },
      {
        "step": 4,
        "timestamp": "2025-11-06T01:28:00Z",
        "event": "Rootkit installed (/bin/ps modified)",
        "ttps": "MITRE T1014 - Rootkit"
      }
    ],
    "failed_control_reason": "Controle ISO-27001-A.12.2.1 (Antivírus) não detectou/bloqueou malware durante privilege escalation. Possível bypass ou assinatura não atualizada no momento do ataque.",
    "confidence": 0.91
  },
  "suggested_narrative": "O incidente teve origem em um ataque de força bruta SSH (01:00-01:15h), seguido de comprometimento e instalação de rootkit (01:25-01:28h). O controle de antivírus (A.12.2.1) não foi efetivo, possivelmente devido a técnica de bypass ou delay na atualização de assinaturas. A janela de ataque foi de 28 minutos.",
  "lessons_learned": [
    "SSH deve ter rate limiting adicional",
    "Antivírus precisa de detecção heurística (não apenas assinaturas)",
    "Monitoramento de /tmp deve gerar alerta em tempo real"
  ]
}
```

#### Tecnologia

**Modelo**: Correlation Engine + NLP
**Abordagem**:
1. **Temporal Analysis**: Ordenar eventos por timestamp
2. **Pattern Matching**: MITRE ATT&CK mapping
3. **Causality Inference**: Identificar sequência lógica
4. **NLP**: Gerar narrativa em português

**Training Data**:
- Incident reports históricos
- MITRE ATT&CK database
- Wazuh rule descriptions
- Post-mortems de incidentes reais

---

### 4.2 Função C2: Suggested Corrective Action Plan (CAPA)

**Objetivo**: Sugerir plano de ação baseado em histórico de sucesso.

#### Input
```json
{
  "agent": "CARA-C",
  "function": "suggest_capa",
  "data": {
    "incident_id": "uuid",
    "root_cause": "SSH brute-force followed by rootkit installation",
    "failed_control_id": "ISO-27001-A.12.2.1",
    "asset_id": "uuid",
    "historical_capas": [
      {
        "similar_incident": "Malware on server-05",
        "actions_taken": [
          "Isolate server from network",
          "Run full antivirus scan",
          "Patch SSH configuration",
          "Reset all passwords"
        ],
        "time_to_close": "4 hours",
        "success": true
      }
    ]
  }
}
```

#### Output
```json
{
  "incident_id": "uuid",
  "suggested_capa": [
    {
      "action_id": "CAPA-001",
      "action_type": "corrective",
      "priority": "critical",
      "action_title": "Isolar servidor comprometido da rede",
      "action_description": "Remover conectividade de rede do web-server-01 para conter propagação",
      "assigned_to_team": "SecOps",
      "estimated_duration": "15 minutes",
      "automation_available": true,
      "shuffle_workflow": "isolate_host_network",
      "success_rate_historical": 0.98,
      "order": 1
    },
    {
      "action_id": "CAPA-002",
      "action_type": "corrective",
      "priority": "critical",
      "action_title": "Executar forensics e backup",
      "action_description": "Criar snapshot do disco para análise forense",
      "assigned_to_team": "Forensics",
      "estimated_duration": "30 minutes",
      "automation_available": false,
      "order": 2
    },
    {
      "action_id": "CAPA-003",
      "action_type": "corrective",
      "priority": "high",
      "action_title": "Reinstalar servidor a partir de imagem limpa",
      "action_description": "Deploy fresh OS image via automation",
      "assigned_to_team": "Infrastructure",
      "estimated_duration": "2 hours",
      "automation_available": true,
      "shuffle_workflow": "rebuild_server_from_golden_image",
      "success_rate_historical": 0.95,
      "order": 3
    },
    {
      "action_id": "CAPA-004",
      "action_type": "preventive",
      "priority": "high",
      "action_title": "Implementar SSH rate limiting",
      "action_description": "Configurar fail2ban em todos os servidores SSH",
      "assigned_to_team": "SecOps",
      "estimated_duration": "4 hours",
      "automation_available": true,
      "shuffle_workflow": "deploy_fail2ban_config",
      "order": 4
    },
    {
      "action_id": "CAPA-005",
      "action_type": "preventive",
      "priority": "medium",
      "action_title": "Atualizar controle de antivírus",
      "action_description": "Habilitar detecção heurística no ClamAV",
      "assigned_to_team": "SecOps",
      "estimated_duration": "2 hours",
      "order": 5
    }
  ],
  "estimated_total_remediation_time": "8 hours",
  "automation_coverage": "60%",
  "confidence": 0.88
}
```

#### Tecnologia

**Modelo**: Recommendation System (Collaborative Filtering)
**Abordagem**:
- Similaridade de incidentes (embeddings)
- Historical success rate de CAPAs
- Ranking por priority + success_rate

**Training Data**:
- Histórico de incidents + CAPAs
- Time-to-close
- Success/failure flags
- Similar incident clustering

---

### 4.3 Função C3: Executive Compliance Narrative Generation

**Objetivo**: Gerar relatórios executivos em linguagem de negócio.

#### Input
```json
{
  "agent": "CARA-C",
  "function": "generate_executive_report",
  "data": {
    "report_type": "monthly_compliance",
    "period": {
      "start": "2025-10-01",
      "end": "2025-10-31"
    },
    "grc_data": {
      "avg_residual_risk_score": 8.5,
      "compliance_scores": [
        {"framework": "ISO 27001", "score": 87.3},
        {"framework": "LGPD", "score": 92.1}
      ],
      "top_risks": [
        {"title": "Data Breach via SQL Injection", "score": 20},
        {"title": "Ransomware Attack", "score": 15}
      ],
      "incidents_count": 3,
      "critical_incidents_count": 1,
      "controls_tested": 45,
      "controls_effective": 42,
      "controls_ineffective": 3
    }
  }
}
```

#### Output
```json
{
  "report_type": "monthly_compliance",
  "period": "Outubro 2025",
  "executive_summary": "Em outubro, a postura de segurança da organização manteve-se estável, com uma pontuação média de risco residual de 8.5 (classificada como **Risco Médio**). A conformidade com a ISO 27001 alcançou 87.3% (+2.1% em relação ao mês anterior), enquanto a LGPD permaneceu em 92.1%.\n\nForam registrados 3 incidentes de segurança, sendo 1 classificado como crítico (Rootkit em web-server-01). A análise dos 45 controles testados revelou que 93% estão operando de forma efetiva, porém 3 controles críticos (A.12.2.1, A.9.1.2, A.18.1.3) apresentaram falhas que requerem atenção imediata.\n\n**Riscos Principais**: O risco de **Data Breach via SQL Injection** permanece em nível crítico (score 20), apesar da implementação de controles compensatórios. Recomenda-se priorização de patch management e revisão de segurança no código da aplicação web.\n\n**Ações Recomendadas para Novembro**:\n1. Remediar os 3 controles ineficazes (prazo: 15 dias)\n2. Executar pentest focado em SQL Injection\n3. Revisar e atualizar a política de Incident Response\n4. Agendar auditoria interna ISO 27001 (preparação para certificação)",
  "key_metrics": {
    "risk_trend": "stable",
    "compliance_trend": "improving",
    "incident_trend": "increasing",
    "control_effectiveness": "93%"
  },
  "charts_data": {
    "risk_matrix_changes": {...},
    "compliance_timeline": {...},
    "incidents_by_severity": {...}
  },
  "generated_at": "2025-11-06T03:00:00Z"
}
```

#### Tecnologia

**Modelo**: GPT-4 / Claude (LLM) fine-tuned
**Prompt Engineering**:
```
Você é um CISO experiente gerando relatórios executivos de GRC.

Dados do período:
{grc_data}

Gere um relatório executivo em português que:
1. Resume a postura de segurança em linguagem de negócio
2. Destaca riscos críticos e tendências
3. Traduz métricas técnicas em impacto ao negócio
4. Fornece recomendações acionáveis e priorizadas
5. Tom: Profissional, objetivo, orientado a decisão

Output: Markdown formatado, 300-500 palavras.
```

**Fine-tuning**:
- Corpus de relatórios executivos reais
- Estilo corporativo da ness.
- Terminologia GRC/ISMS

---

## 🏗️ 5. Arquitetura de Microservices

### 5.1 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│  N360 AI Agents Layer (Docker)                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Agent Service 1: CARA                   │  │
│  │  - Port: 5001                            │  │
│  │  - Endpoints: /classify, /suggest, /rrp │  │
│  │  - Models: RandomForest, GNN, LSTM      │  │
│  │  - GPU: Optional (para NLP)             │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Agent Service 2: CAVA                   │  │
│  │  - Port: 5002                            │  │
│  │  - Endpoints: /generate-playbook,        │  │
│  │               /interpret, /optimize      │  │
│  │  - Models: GPT-4 API, BERT, RL          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Agent Service 3: CARA-C                 │  │
│  │  - Port: 5003                            │  │
│  │  - Endpoints: /rca, /suggest-capa,       │  │
│  │               /generate-report           │  │
│  │  - Models: GPT-4 API, Correlation       │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  ML Ops Service                          │  │
│  │  - Model versioning (MLflow)             │  │
│  │  - Training pipeline                     │  │
│  │  - A/B testing                           │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
         │
         │ REST API
         │
┌────────▼──────────────────────────────────────┐
│  N360 GRC API (Backend)                       │
│  - Consume AI suggestions                     │
│  - Trigger AI analysis                        │
│  - Store AI outputs                           │
└───────────────────────────────────────────────┘
```

### 5.2 Technology Stack

#### Agent Runtime

| Component | Technology | Justificativa |
|-----------|------------|---------------|
| **Language** | Python 3.11+ | Ecosystem ML/AI maduro |
| **Framework** | FastAPI | Async, alta performance, OpenAPI auto |
| **ML Framework** | scikit-learn, TensorFlow, PyTorch | Versatilidade |
| **LLM Integration** | OpenAI API (GPT-4) ou Anthropic (Claude) | NLP avançado |
| **Vector DB** | Pinecone ou Weaviate | Embeddings search |
| **Model Serving** | TensorFlow Serving ou TorchServe | Production-grade |

#### MLOps

| Component | Technology |
|-----------|------------|
| **Experiment Tracking** | MLflow ou Weights & Biases |
| **Model Versioning** | MLflow Model Registry |
| **Pipeline** | Airflow ou Prefect |
| **Monitoring** | Prometheus + Grafana |

---

## 📡 6. API Specifications (OpenAPI)

### 6.1 CARA API

**Base URL**: `http://ai-cara:5001`

#### POST `/v1/classify-asset`

**Request**:
```json
{
  "asset_id": "uuid",
  "metadata": {
    "os": "string",
    "open_ports": [int],
    "services": ["string"],
    "wazuh_data": {},
    "zabbix_metrics": {}
  }
}
```

**Response 200**:
```json
{
  "suggested_classification": {
    "confidentiality_impact": int (1-5),
    "integrity_impact": int (1-5),
    "availability_impact": int (1-5),
    "confidence_score": float (0-1)
  },
  "reasoning": "string"
}
```

#### POST `/v1/suggest-risks`

**Request**: Asset + Vulnerabilities + Threat Intel  
**Response**: Array de riscos sugeridos

#### POST `/v1/predict-rrp`

**Request**: Risk + Historical Data  
**Response**: RRP Score + Forecast

---

### 6.2 CAVA API

**Base URL**: `http://ai-cava:5002`

#### POST `/v1/generate-playbook`

**Request**:
```json
{
  "control_id": "string",
  "test_objective": "string",
  "test_procedure": "string (natural language)",
  "target_systems": ["wazuh", "zabbix"]
}
```

**Response 200**:
```json
{
  "playbook_blueprint": {
    "name": "string",
    "nodes": [
      {
        "id": "string",
        "type": "HTTP|Condition|ForEach",
        "config": {}
      }
    ]
  },
  "confidence": float
}
```

#### POST `/v1/interpret-evidence`

**Request**: Control + Raw Evidence (JSON/Logs)  
**Response**: Test Result + Effectiveness Score

#### POST `/v1/optimize-frequency`

**Request**: Control + Test History + RRP  
**Response**: Recommended Frequency + Savings

---

### 6.3 CARA-C API

**Base URL**: `http://ai-cara-c:5003`

#### POST `/v1/root-cause-analysis`

**Request**: Incident + Logs + Control Data  
**Response**: RCA + Attack Chain + Narrative

#### POST `/v1/suggest-capa`

**Request**: Incident + Root Cause + Historical CAPAs  
**Response**: Array de ações sugeridas

#### POST `/v1/generate-report`

**Request**: GRC Data + Period  
**Response**: Executive Summary (Markdown)

---

## 📊 7. Training Data Strategy

### 7.1 Data Collection

| Agent | Função | Dados Necessários | Volume Mínimo | Fonte |
|-------|--------|-------------------|---------------|-------|
| **CARA** | Asset Classification | Ativos classificados (CID) | 200-500 | GRC histórico + manual |
| **CARA** | Risk Suggestion | Risks mapeados (Asset+Threat+Vuln) | 100-200 | GRC + CVE DB |
| **CARA** | RRP Prediction | Time-series incidents + controls | 6 meses | GRC + Wazuh/Zabbix |
| **CAVA** | Playbook Generation | Test plans → Shuffle JSONs | 50-100 | Shuffle + docs |
| **CAVA** | Evidence Interpretation | Test executions + labels | 500-1000 | GRC histórico |
| **CAVA** | Frequency Optimization | Test history + outcomes | 3 meses | GRC + metrics |
| **CARA-C** | RCA | Incidents + post-mortems | 50-100 | GRC + MITRE |
| **CARA-C** | CAPA Suggestion | CAPAs + success rates | 100-200 | GRC histórico |
| **CARA-C** | Report Generation | Executive reports | 20-50 | Corporativo |

### 7.2 Data Labeling

**Estratégia**:
1. **Fase 1 (Cold Start)**: Labeling manual por especialistas
   - 2-3 analistas GRC
   - 2-4 semanas
   - Ferramentas: Label Studio, Prodigy

2. **Fase 2 (Active Learning)**: 
   - AI sugere, humano valida
   - Feedback loop
   - Melhoria contínua

3. **Fase 3 (Production)**:
   - AI opera autonomamente
   - Human-in-the-loop para casos de baixa confiança (< 0.7)

### 7.3 Model Versioning

**MLflow Model Registry**:
```
models/
├── cara_asset_classifier_v1.0.pkl
├── cara_risk_suggester_v1.2.pkl
├── cara_rrp_predictor_v2.0.h5
├── cava_evidence_interpreter_v1.1.pkl
└── ...
```

**Deployment**:
- A/B testing (90% prod, 10% challenger)
- Rollback automático se accuracy < baseline
- Monitoring contínuo (drift detection)

---

## 🔄 8. Integration Flows

### 8.1 Flow 1: Asset Discovery → AI Classification → GRC

```
1. Zabbix: Descobre novo host (auto-discovery)
2. Zabbix → Shuffle: Webhook (new host detected)
3. Shuffle: Coleta metadata (Zabbix + Wazuh)
4. Shuffle → CARA: POST /v1/classify-asset
5. CARA: Processa e retorna classificação CID
6. Shuffle → GRC: POST /api/assets
   Body: {
     "name": "new-server-01",
     "confidentiality_impact": 4, (sugerido por AI)
     "integrity_impact": 5,
     "availability_impact": 5,
     "ai_suggested": true,
     "ai_confidence": 0.87
   }
7. GRC: Cria asset com flag "pending_review"
8. GRC: Notifica Asset Owner para validação
9. Owner: Aprova ou ajusta classificação
10. GRC: Atualiza asset.status = "active"
```

### 8.2 Flow 2: Control Test → AI Evidence Interpretation → GRC

```
1. GRC: Agenda teste (cron)
2. GRC → Shuffle: POST /execute-workflow
3. Shuffle → Wazuh: Coleta evidência
4. Wazuh → Shuffle: JSON response
5. Shuffle → CAVA: POST /v1/interpret-evidence
   Body: {raw_evidence: {...}}
6. CAVA: Analisa e retorna interpretation
7. Shuffle → GRC: POST /api/controls/{id}/test-results
   Body: {
     "test_result": "partially_effective",
     "effectiveness_score": 0.92,
     "evidence_json": {...},
     "ai_interpretation": {...}
   }
8. GRC: Atualiza control effectiveness
9. GRC: Recalcula residual risk
10. GRC: Se effectiveness < 0.8 → Cria alerta para owner
```

### 8.3 Flow 3: Incident → AI RCA → AI CAPA → GRC

```
1. Wazuh: Detecta rootkit (critical alert)
2. Wazuh → Shuffle: Webhook
3. Shuffle: Enrichment (busca contexto no GRC)
4. Shuffle → GRC: POST /api/incidents
5. GRC: Cria incident
6. GRC → CARA-C: POST /v1/root-cause-analysis
7. CARA-C: Analisa logs e retorna RCA
8. GRC: Atualiza incident.root_cause (AI-generated)
9. GRC → CARA-C: POST /v1/suggest-capa
10. CARA-C: Retorna lista de ações sugeridas
11. GRC: Cria CAPAs automaticamente
12. GRC: Notifica Incident Manager
13. Manager: Aprova/ajusta CAPAs
14. GRC → Shuffle: Dispara automação (se is_automated=true)
```

---

## 🧪 9. Proof of Concept (PoC) - Priority MVP

### 9.1 Escopo PoC

**Objetivo**: Validar viabilidade técnica em 4 semanas.

**Features Prioritárias**:
1. ✅ **B1. Shuffle Playbook Blueprint Generation** (CAVA)
   - Maior ROI imediato
   - Reduz tempo de criação de playbooks em 80%
   
2. ✅ **B2. Intelligent Evidence Interpretation** (CAVA)
   - Automatiza auditoria de controles
   - Libera analistas para tarefas estratégicas

**Out of Scope (PoC)**:
- A3. RRP Prediction (requer 6+ meses de dados)
- C1. RCA (requer corpus de incidents)
- C3. Report Generation (baixa prioridade MVP)

### 9.2 PoC Timeline

| Semana | Atividade |
|--------|-----------|
| **Semana 1** | Setup infra (FastAPI, MLflow, Docker) |
| **Semana 2** | B1: Playbook Generation (GPT-4 integration) |
| **Semana 3** | B2: Evidence Interpretation (modelo simples) |
| **Semana 4** | Integração GRC + Shuffle + Demo |

### 9.3 Success Criteria (PoC)

- [ ] B1 gera playbook válido (syntax-check passa)
- [ ] B1 confidence > 0.7 em 80% dos casos
- [ ] B2 interpreta evidência com accuracy > 75%
- [ ] Integração Shuffle → CAVA → GRC funciona end-to-end
- [ ] Tempo de criação de playbook: De 2h manual → 5min AI+review

---

## 💰 10. Estimativa de Esforço

### 10.1 PoC (4 semanas)

| Atividade | Horas | Recursos |
|-----------|-------|----------|
| Setup (FastAPI, Docker, MLflow) | 40h | 1 ML Engineer |
| B1: Playbook Generation | 80h | 1 ML Engineer + 1 Shuffle Expert |
| B2: Evidence Interpretation | 80h | 1 ML Engineer |
| Integração GRC+Shuffle | 40h | 1 Backend Dev |
| Testes e documentação | 40h | Team |
| **TOTAL PoC** | **280h** | **3-4 semanas** |

### 10.2 MVP (3 meses)

| Fase | Escopo | Horas | Duração |
|------|--------|-------|---------|
| **Fase 1: CAVA** | B1 + B2 + B3 | 320h | 8 semanas |
| **Fase 2: CARA** | A1 + A2 | 280h | 7 semanas |
| **Fase 3: CARA-C** | C1 + C2 + C3 | 240h | 6 semanas |
| **Fase 4: MLOps** | Training pipeline, monitoring | 160h | 4 semanas |
| **TOTAL MVP** | **9 funções AI** | **1000h** | **~6 meses** |

### 10.3 Custos Operacionais (Mensal)

| Item | Custo Estimado (USD) |
|------|----------------------|
| **Infra GPU** (1x NVIDIA T4) | $300-500/mês |
| **OpenAI API** (GPT-4, ~500k tokens/mês) | $100-200/mês |
| **Vector DB** (Pinecone) | $70-150/mês |
| **MLflow Hosting** | $50/mês |
| **Total** | **$520-900/mês** |

**ROI**: Economiza ~80h/mês de trabalho manual (analistas) = $4.000-8.000/mês

---

## 📊 11. Training Data Requirements

### 11.1 Dataset Initial (Cold Start)

| Dataset | Tamanho | Labeling Effort | Fonte |
|---------|---------|-----------------|-------|
| **Assets classificados** | 200-500 | 20-40h | GRC + manual |
| **Risks mapeados** | 100-200 | 40-60h | GRC + specialist |
| **Control test executions** | 500-1000 | 80-120h | GRC histórico + labeling |
| **Shuffle playbooks** | 50-100 | 40h | Shuffle + docs |
| **Incident post-mortems** | 50-100 | 60-80h | Security team |
| **Executive reports** | 20-50 | 20h | CISO + redação |
| **TOTAL** | | **260-420h** | **~2 meses** |

### 11.2 Active Learning Strategy

```
Iteração 1: Train com 100 exemplos → Deploy
Iteração 2: AI sugere 1000 predições → Humano valida top 50 incertos
Iteração 3: Retrain com 150 exemplos → Deploy
Iteração 4: AI sugere 5000 → Humano valida top 100
...
Convergência: Após 6-12 meses, AI > 90% accuracy
```

---

## 🎯 12. Success Metrics

### 12.1 Model Performance

| Agent | Função | Métrica | Target |
|-------|--------|---------|--------|
| CARA | Asset Classification | Accuracy | > 85% |
| CARA | Risk Suggestion | Precision@5 | > 0.70 |
| CARA | RRP Prediction | RMSE | < 5 |
| CAVA | Playbook Generation | Syntax Valid % | > 90% |
| CAVA | Evidence Interpretation | F1-Score | > 0.80 |
| CAVA | Frequency Optimization | Cost Reduction | > 30% |
| CARA-C | RCA | Human Agreement | > 75% |
| CARA-C | CAPA Suggestion | Adoption Rate | > 60% |
| CARA-C | Report Generation | BLEU Score | > 0.40 |

### 12.2 Business Impact

| KPI | Baseline (Sem AI) | Target (Com AI) | Improvement |
|-----|-------------------|-----------------|-------------|
| **Tempo de classificação de ativo** | 30 min | 5 min | -83% |
| **Tempo de criação de playbook** | 2 horas | 15 min | -87% |
| **Tempo de RCA** | 4 horas | 30 min | -87% |
| **Controles testados/mês** | 50 | 200 | +300% |
| **False positives em testes** | 20% | 5% | -75% |
| **MTTR (Mean Time to Remediate)** | 8 horas | 2 horas | -75% |

---

## 🔒 13. Security & Ethics

### 13.1 Data Privacy

- **Dados sensíveis**: Logs podem conter PII/secrets
- **Anonimização**: Antes de enviar para LLM externo
- **Local processing**: Modelos próprios para dados críticos

### 13.2 AI Safety

- **Human-in-the-loop**: Para decisões críticas (confidence < 0.8)
- **Explainability**: Todos outputs têm `reasoning` field
- **Audit trail**: Toda sugestão AI é logada
- **Rollback**: Humano pode reverter decisão AI

### 13.3 Model Bias

- **Monitoring**: Drift detection (input distribution)
- **Fairness**: Asset classification não deve favorecer tipos
- **Validation**: Teste em dados de diferentes orgs/setores

---

## 📚 14. Deliverables (RFP Response)

### 14.1 Documentação

- [ ] **SPEC.md** (este arquivo) - Especificação completa
- [ ] **API-SPEC.yaml** - OpenAPI 3.0 (3 agents, 9 endpoints)
- [ ] **ARCHITECTURE.md** - Diagrama de microservices
- [ ] **TRAINING-PLAN.md** - Estratégia de dados e labeling
- [ ] **POC-PLAN.md** - PoC de 4 semanas (B1 + B2)

### 14.2 Código (PoC)

- [ ] FastAPI skeleton (3 services)
- [ ] B1: Playbook Generation (GPT-4 integration)
- [ ] B2: Evidence Interpretation (modelo baseline)
- [ ] Docker Compose (agents + MLflow)
- [ ] Integration tests (GRC ↔ Agents ↔ Shuffle)

### 14.3 Apresentação

- [ ] Slides executivos (10-15 slides)
- [ ] Demo ao vivo (PoC)
- [ ] ROI calculator (Excel)

---

## 🚀 15. Roadmap de Implementação

### Fase 0: PoC (4 semanas)

**Objetivo**: Validar viabilidade técnica

**Entregas**:
- CAVA B1: Playbook Generation
- CAVA B2: Evidence Interpretation
- Integração básica GRC ↔ Agents

**Budget**: $15k-20k (280h × $50-70/h)

### Fase 1: CAVA Complete (8 semanas)

**Entregas**:
- B1, B2, B3 production-ready
- MLOps pipeline
- Monitoring dashboards

**Budget**: $25k-35k (320h)

### Fase 2: CARA + CARA-C (14 semanas)

**Entregas**:
- CARA: A1, A2, A3
- CARA-C: C1, C2, C3
- All 9 functions operational

**Budget**: $40k-55k (520h)

### Fase 3: MLOps & Scale (8 semanas)

**Entregas**:
- Auto-retraining pipeline
- A/B testing framework
- Multi-tenant support
- GPU optimization

**Budget**: $15k-20k (160h)

---

## 💡 16. Alternative Approaches

### 16.1 Build vs Buy

| Opção | Prós | Contras | Custo |
|-------|------|---------|-------|
| **Build In-House** | Controle total, IP próprio | Tempo longo, expertise | $80k-110k |
| **SaaS AI Platform** (Azure ML, AWS SageMaker) | Infra pronta, escalável | Vendor lock-in | $2k-5k/mês |
| **Pre-trained Models** (Hugging Face) | Rápido, baixo custo | Menos personalizado | $500/mês |
| **Hybrid** (LLM API + modelos próprios) | Balance custo/controle | Complexidade | $50k + $1k/mês |

**Recomendação**: **Hybrid**
- LLM API (GPT-4/Claude) para NLP (B1, C3)
- Modelos próprios para classification/prediction (A1, A2, B2)

### 16.2 Open Source LLMs

Se budget ou data privacy forem críticos:

| Modelo | Tamanho | Uso Recomendado | GPU Necessária |
|--------|---------|-----------------|----------------|
| **Llama 3 70B** | 70B params | Report Gen, RCA | 2x A100 (80GB) |
| **Mistral 7B** | 7B params | Playbook Gen | 1x RTX 4090 |
| **CodeLlama 13B** | 13B params | Code generation | 1x A100 (40GB) |

**Hosting**: Self-hosted via Ollama ou vLLM

---

## 🎯 17. Risk Assessment (do próprio projeto AI)

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Modelo com baixa accuracy** | Média | Alto | PoC valida antes de MVP, Human-in-the-loop |
| **Training data insuficiente** | Alta | Alto | Active learning, synthetic data generation |
| **Custo de infra GPU alto** | Média | Médio | Start com CPU, migrate se necessário |
| **LLM hallucination** | Alta | Médio | Validation layer, confidence thresholds |
| **Data drift** | Média | Médio | Monitoring, auto-retrain pipeline |
| **Integration complexity** | Média | Alto | PoC foca em 2 funções apenas |

---

## ✅ 18. Conclusão e Recomendações

### 18.1 Viabilidade

**Tecnicamente viável**: ✅ SIM

**Recomendação**: Começar com **PoC de 4 semanas** focado em:
- CAVA B1 (Playbook Generation)
- CAVA B2 (Evidence Interpretation)

Se PoC bem-sucedido → Aprovar MVP completo (6 meses)

### 18.2 Priorização

**Alta Prioridade** (PoC + Fase 1):
1. CAVA B1: Playbook Generation (economia de tempo massiva)
2. CAVA B2: Evidence Interpretation (automatiza auditoria)
3. CARA A1: Asset Classification (reduz trabalho manual)

**Média Prioridade** (Fase 2):
4. CARA-C C2: CAPA Suggestion
5. CARA-C C1: RCA
6. CAVA B3: Test Frequency Optimization

**Baixa Prioridade** (Fase 3):
7. CARA A2: Risk Suggestion (nice-to-have)
8. CARA A3: RRP Prediction (requer muitos dados)
9. CARA-C C3: Report Generation (executivos preferem humano)

### 18.3 Decision Point

**Próxima ação**:
1. **Aprovar PoC** (4 semanas, $15k-20k)?
2. **Contratar ML Engineer** (1 pessoa, 6 meses)?
3. **Parceria com vendor** (Azure ML, AWS, Databricks)?

---

**Especificação criada por**: ness. AI/ML Team  
**Baseado em**: N360 GRC ISMS Framework (Spec 005)  
**Data**: 06/11/2025  
**Versão**: 3.0  
**Status**: 📋 Aguardando Aprovação para PoC



