# 📊 Sumário Executivo: N360 GRC ISMS Evolution

**Versão**: 2.0  
**Data**: 06/11/2025  
**Tipo**: Blueprint Arquitetônico  
**Escopo**: Evolução GRC de básico para ISMS Framework completo

---

## 🎯 Visão Geral

Transformar o **N360 GRC** de um módulo básico de gestão de riscos em um **ISMS (Information Security Management System)** completo, inspirado na metodologia rigorosa do **eramba.org**.

### Objetivo Central

**Tornar o GRC o "cérebro" do N360**, onde:
- ✅ Alertas técnicos (Wazuh/Zabbix) ganham **contexto de risco**
- ✅ Controles são **auditados automaticamente** via Shuffle
- ✅ Risco Residual é **calculado dinamicamente** (baseado em eficácia real)
- ✅ Conformidade é **medida em tempo real** (ISO 27001, LGPD, etc)

---

## 🔄 Filosofia: Ciclo PDCA

```
PLAN (GRC)       → Definir Ativos, Riscos, Controles, Conformidade
DO (Wazuh/Zabbix)→ Executar controles operacionais
CHECK (Shuffle)  → Testar eficácia automaticamente
ACT (GRC)        → Planos de ação, remediação
```

---

## 🏗️ Arquitetura: 6 Módulos

| # | Módulo | Entidades | Função |
|---|--------|-----------|--------|
| 1 | **CMDB** | Assets | Fonte única de verdade (SSOT) |
| 2 | **TVL** | Threats, Vulnerabilities | Bibliotecas reutilizáveis |
| 3 | **Risk Engine** | Risks, Risk-Controls | Cálculo Inherente + Residual |
| 4 | **Controls** | Controls, Test Plans, Executions | Auditoria automatizada |
| 5 | **Compliance** | Frameworks, Requirements, SoA | ISO 27001, LGPD, NIST |
| 6 | **Incidents** | Incidents, CAPA | Materialização + Remediação |

**Total**: 15+ tabelas SQL altamente interligadas

---

## 🔗 Integração: API Bidirecional

### GRC ← Shuffle (Consulta Contexto)
```
GET /api/assets/{id}/context
→ Retorna: Asset + Risks + Controls + Compliance
```

### GRC → Shuffle (Agenda Teste)
```
POST /api/controls/{id}/schedule-test
→ Shuffle executa workflow
→ Wazuh/Zabbix coletam evidência
```

### Shuffle → GRC (Envia Resultado)
```
POST /api/controls/{id}/test-results
→ GRC atualiza effectiveness_score
→ GRC recalcula residual_risk_score
```

### Shuffle → GRC (Cria Incidente)
```
POST /api/incidents
→ Materialização de risco
→ Controle marcado como "failed"
→ CAPA gerado automaticamente
```

---

## 🎨 Diferencial vs GRC Atual

| Feature | GRC v1.0 (atual) | GRC v2.0 (ISMS) |
|---------|------------------|-----------------|
| Asset Management | Básico | **CMDB completo (CIA)** |
| Risk Formula | Likelihood × Impact | **Asset + Threat + Vulnerability** |
| Risk Types | Inherente | **Inherente + Residual** |
| Controls | Status manual | **Test Plans + Automação** |
| Testing | Manual | **Shuffle automatiza** |
| Compliance | Frameworks estáticos | **SoA Dinâmico (tempo real)** |
| Incidents | Desconectado | **Materialização de Risco** |

---

## 📊 Fórmulas-Chave

### Risco Inherente
```
Risco Inherente = Likelihood (Threat × Vulnerability) × Impact (Asset CIA)
```

### Risco Residual
```
Risco Residual = Risco Inherente × (1 - Σ Control Effectiveness)
```

### Compliance Score
```
Score = (Controles Efetivos / Total Controles Aplicáveis) × 100
```

---

## 🛠️ Stack Tecnológico

### Decisão: Abordagem Híbrida

| Tecnologia | Uso | % |
|------------|-----|---|
| **Supabase Client** | Auth, RLS, Storage, Realtime, SOC/NOC | 60% |
| **Prisma ORM** | Queries GRC, Type Safety, Migrations | 40% |
| **PostgreSQL** | Database único (Supabase) | 100% |

**Por quê híbrido?**
- Supabase: RLS automático (multi-tenancy seguro)
- Prisma: Type-safe (crítico para cálculos de risco)
- Ambos conectam no **mesmo PostgreSQL**

---

## 📅 Estimativa de Esforço

### MVP (Minimum Viable Product)

| Fase | Horas | Dias (2 devs) |
|------|-------|---------------|
| Backend | 328h | 21d |
| Frontend | 224h | 14d |
| DevOps/DB | 72h | 5d |
| Documentação | 56h | 4d |
| **TOTAL** | **680h** | **~44 dias (2 meses)** |

### Fases Posteriores

- **Fase 2**: Compliance & Relatórios (+160h)
- **Fase 3**: Dashboards Executivos (+80h)

---

## 🎯 Critérios de Sucesso (MVP)

- [ ] 100+ ativos no CMDB
- [ ] 20+ controles com test plans
- [ ] 10+ riscos mapeados (Asset + Threat + Vulnerability)
- [ ] 1 teste automatizado via Shuffle funcionando
- [ ] 1 incidente criado automaticamente (Wazuh → GRC)
- [ ] Risco Residual atualizado após teste
- [ ] API 100% documentada (OpenAPI)

---

## 🔄 Fluxos Principais

### 1. Validação de Controles (Always-On Audit)

```
1. GRC: Agenda teste (cron)
2. GRC → Shuffle: Execute workflow
3. Shuffle → Wazuh: Query status
4. Wazuh → Shuffle: JSON evidência
5. Shuffle → GRC: POST /test-results
6. GRC: Atualiza effectiveness_score
7. GRC: Recalcula residual_risk
```

### 2. Materialização de Risco

```
1. Wazuh: Detecta ataque (rootkit)
2. Wazuh → Shuffle: Webhook
3. Shuffle → GRC: GET /assets/context
4. GRC: Retorna criticidade + riscos
5. Shuffle → GRC: POST /incidents
6. GRC: Materializa risco
7. GRC: Marca controle como "failed"
8. GRC: Cria CAPA
9. GRC: Notifica risk_owner
```

### 3. Remediação Automatizada

```
1. GRC: Cria CAPA (manual/auto)
2. GRC → Shuffle: POST /automate
3. Shuffle → Wazuh: Executa patch
4. Wazuh → Shuffle: Confirmação
5. Shuffle → GRC: PATCH /status
6. GRC: Agenda re-teste
```

---

## 📚 Inspiração: Eramba

### Conceitos Implementados

✅ **CMDB como SSOT**  
✅ **TVL** (Threat/Vulnerability Libraries)  
✅ **Fórmula ISMS**: Risk = Asset × Threat × Vulnerability  
✅ **Risco Residual** (função de eficácia de controles)  
✅ **Control Test Plans** obrigatórios  
✅ **Auditoria Always-On** (testes automáticos)  
✅ **SoA Automático** (ISO 27001)  
✅ **CAPA** (Corrective and Preventive Actions)  
✅ **Audit Trail** inviolável

---

## 🚀 Plano de Implementação

### Sprints Sugeridos

| Sprint | Escopo | Duração |
|--------|--------|---------|
| Sprint 1 | Setup Prisma + CMDB | 2 semanas |
| Sprint 2 | TVL + Risk Engine | 2 semanas |
| Sprint 3 | Controls + Test Plans | 2 semanas |
| Sprint 4 | Integração Shuffle (testes) | 2 semanas |
| Sprint 5 | Incidents + CAPA | 1 semana |
| Sprint 6 | Compliance + SoA | 2 semanas |
| Sprint 7 | Dashboards + Relatórios | 1 semana |

**Total**: ~12 semanas (3 meses)

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade Prisma | Média | Alto | POC inicial, treinamento |
| RLS com Prisma | Alta | Crítico | Middleware obrigatório |
| Queries lentas | Baixa | Médio | Indexes, query optimization |
| Integração Shuffle | Média | Alto | Testes extensivos |

---

## 💰 ROI Esperado

### Ganhos Operacionais

- **Auditoria**: De manual/trimestral → Automatizada/contínua
- **Compliance**: De snapshot → Tempo real
- **Resposta a Incidentes**: De horas → Minutos
- **Visibilidade de Risco**: De estática → Dinâmica

### Ganhos Estratégicos

- **Certificações**: ISO 27001, SOC 2 (SoA automatizado)
- **Conformidade**: LGPD, PCI-DSS (evidências automáticas)
- **Redução de Risco**: Controles validados continuamente
- **Dashboards Executivos**: C-Level vê risco em tempo real

---

## 📞 Próximos Passos

1. ✅ **Aprovação** desta especificação
2. **Setup** ambiente de desenvolvimento
3. **Sprint 1**: CMDB (Assets + Prisma)
4. **Integração** Shuffle (primeiro fluxo)
5. **Validação** com stakeholders
6. **Deploy** MVP em staging
7. **Certificação** ISO 27001 (opcional)

---

## 📁 Documentação Completa

- **SPEC.md**: Especificação técnica detalhada (1139 linhas)
- **STACK-DECISION.md**: Decisão Supabase + Prisma
- **SUMMARY.md**: Este sumário executivo

---

**Especificação criada por**: ness. (n360 Team)  
**Inspiração**: eramba.org ISMS Framework  
**Data**: 06/11/2025  
**Status**: ✅ Aprovada para Implementação

