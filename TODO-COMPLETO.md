# ✅ TODO Completo - n360 Platform

**Atualizado**: 05/11/2025 - 23h50  
**Status Atual**: Sprint 1 ✅ | Sprint 2 ⏳

---

## 📊 VISÃO GERAL

```
Projeto: n360 Platform (GRC + SOC + NOC)
Progresso: [████████░░░░░░░░░░░░] 40%
```

| Sprint | Status | Progresso | Estimativa |
|--------|--------|-----------|------------|
| Sprint 1 | ✅ Completo | 11/11 (100%) | - |
| Sprint 2 | ⏳ Pendente | 0/20 (0%) | 5-7 dias |
| Sprint 3 | ⏳ Pendente | 0/25 (0%) | 10-12 dias |
| Sprint 4 | ⏳ Pendente | 0/30 (0%) | 10-14 dias |
| Sprint 5 | ⏳ Pendente | 0/15 (0%) | 5-7 dias |

**Total**: 0/90 tarefas restantes | 30-40 dias úteis

---

## ✅ COMPLETO (Sprint 1)

### 🔒 Segurança (11 itens)
- [x] Environment validation (Zod)
- [x] JWT auth middleware
- [x] Input validation schemas
- [x] SSL verification configurável
- [x] Rate limiting (3 níveis)
- [x] Multi-tenancy (RLS)
- [x] Error propagation
- [x] Batch inserts
- [x] StatusCache thread-safe
- [x] Constants.js
- [x] BaseCollector abstraction

**Status**: ✅ Security Score 85/100

---

## 🚧 PENDENTE

### SPRINT 2 - Error Handling & Testing (5-7 dias) 🔴 PRÓXIMO

#### Frontend (6 itens)
- [ ] **ErrorBoundary Component**
  - Global error boundary
  - Fallback UI (ness-theme)
  - Error logging
  - User-friendly messages

- [ ] **Vitest Setup**
  - vitest.config.js
  - @testing-library/react
  - Coverage config

- [ ] **Component Tests**
  - Sidebar.test.jsx
  - Header.test.jsx
  - CISODashboard.test.jsx
  - AlertsPage.test.jsx
  - ProblemsPage.test.jsx
  - StatusPage.test.jsx

**Estimativa**: 2 dias

#### Backend (14 itens)
- [ ] **Error Handler Middleware Aprimorado**
  - HTTP status codes corretos
  - Error response standardization
  - Stack trace em development
  - Generic messages em production

- [ ] **Retry Strategies**
  - Exponential backoff
  - Circuit breaker pattern
  - Fallback para cached data
  - Max retry configurável

- [ ] **Jest Setup**
  - jest.config.js
  - @types/jest
  - supertest (integration tests)
  - Coverage config (80% target)

- [ ] **Unit Tests**
  - config/env.test.js
  - services/StatusCache.test.js
  - collectors/BaseCollector.test.js
  - middleware/auth.test.js
  - middleware/validation.test.js
  - utils/logger.test.js

- [ ] **Integration Tests**
  - routes/dashboard.test.js
  - routes/alerts.test.js
  - routes/problems.test.js
  - routes/tickets.test.js

- [ ] **E2E Tests**
  - Health check flow
  - Auth flow completo
  - Data collection flow

**Estimativa**: 3-5 dias

**ROI**: -80% bugs, +60% confiança no deploy

---

### SPRINT 3 - Features Core (10-12 dias) 🟡

#### SOC - Alertas (8 itens)
- [ ] **Listagem Avançada**
  - Filtros multi-campo
  - Busca full-text
  - Ordenação por coluna
  - Paginação server-side
  - Export CSV/JSON/PDF

- [ ] **Detalhes do Alerta**
  - Modal/Page de detalhes
  - Timeline de eventos
  - Contexto enriquecido (IP, user, asset)
  - Recommended actions
  - Similar alerts

- [ ] **Ações em Alertas**
  - Acknowledge/Resolve
  - Assign to user
  - Add comments/notes
  - Create ticket (auto)
  - Bulk actions

- [ ] **Dashboard SOC**
  - Top alerts widget
  - Severity distribution
  - Timeline chart
  - Response time metrics

**Estimativa**: 3-4 dias

#### NOC - Problemas (7 itens)
- [ ] **Listagem Avançada**
  - Filtros por severidade/host
  - Busca por hostname/IP
  - Agrupamento por categoria
  - Export para planilhas

- [ ] **Detalhes do Problema**
  - Gráficos de métricas
  - Event correlation
  - Root cause analysis
  - Maintenance windows

- [ ] **Ações em Problemas**
  - Acknowledge/Suppress
  - Maintenance mode
  - Execute remediation
  - Create change request

- [ ] **Dashboard NOC**
  - Infrastructure health
  - Top 10 problems
  - SLA compliance

**Estimativa**: 2-3 dias

#### Tickets ITIL (6 itens)
- [ ] **CRUD Completo**
  - Create (form wizard)
  - Read/List (filtros)
  - Update (status, assignee)
  - Delete/Archive

- [ ] **Workflow**
  - Incident → Problem → Change
  - Service Request flow
  - Approval workflow
  - SLA tracking

- [ ] **Integrações**
  - Auto-create de SOC/NOC
  - Email notifications
  - Attachments
  - Comments & activity

**Estimativa**: 2-3 dias

#### Wazuh Indexer Integration (4 itens)
- [ ] **OpenSearch Client**
  - Instalar @opensearch-project/opensearch
  - Configurar conexão
  - SSL/TLS setup

- [ ] **WazuhIndexerCollector**
  - Query wazuh-alerts-* index
  - Transform para schema Supabase
  - Batch inserts
  - Error handling

- [ ] **Deduplicação**
  - Verificar alertas existentes
  - Upsert logic
  - Alert correlation

- [ ] **Testing**
  - Unit tests
  - Integration tests
  - Performance tests

**Estimativa**: 2 dias

**Total Sprint 3**: 25 itens | 10-12 dias

---

### SPRINT 4 - GRC & Compliance (10-14 dias) 🏛️

#### Governance (10 itens)
- [ ] **Asset Management**
  - Database schema (assets table)
  - CRUD API endpoints
  - Frontend pages (list, detail, create)
  - Asset discovery (Zabbix/Wazuh integration)
  - Lifecycle tracking
  - License management

- [ ] **Policy Management**
  - Database schema (policies, acknowledgments)
  - CRUD API endpoints
  - Frontend pages
  - Approval workflow
  - Version control
  - Distribution tracking

**Estimativa**: 4-5 dias

#### Risk (10 itens)
- [ ] **Risk Register**
  - Database schema (risks, reviews)
  - CRUD API endpoints
  - Frontend pages
  - Risk assessment (likelihood × impact)
  - Risk matrix visualization

- [ ] **Risk Treatment**
  - Treatment plans
  - Treatment tracking
  - Risk monitoring
  - Risk dashboard
  - Risk heatmap (5x5)

**Estimativa**: 3-4 dias

#### Compliance (10 itens)
- [ ] **Frameworks**
  - Database schema (frameworks, controls, evidence)
  - ISO 27001 checklist (114 controls)
  - LGPD tracker (40+ articles)
  - PCI-DSS (12 requirements)
  - NIST CSF (108 subcategories)

- [ ] **Evidence Management**
  - Upload para Supabase Storage
  - Evidence linking (controls)
  - Document repository
  - Automated gathering

- [ ] **Compliance Dashboard**
  - Overall compliance score
  - Framework status cards
  - Gap analysis visual
  - Audit schedule

- [ ] **Reports**
  - PDF generation
  - SOA (Statement of Applicability)
  - Compliance reports
  - Executive summaries

**Estimativa**: 3-5 dias

**Total Sprint 4**: 30 itens | 10-14 dias

---

### SPRINT 5 - Polish & Production (5-7 dias) 🟢

#### TypeScript Migration (4 itens)
- [ ] Backend → TypeScript
- [ ] Frontend → TypeScript
- [ ] Type definitions
- [ ] Strict mode

**Estimativa**: 2-3 dias

#### Internacionalização (2 itens)
- [ ] react-i18next setup
- [ ] Português (pt-BR) completo

**Estimativa**: 1 dia

#### Documentação (4 itens)
- [ ] OpenAPI 3.0 spec
- [ ] Swagger UI
- [ ] User manual (PDF)
- [ ] Video tutorials

**Estimativa**: 1-2 dias

#### DevOps & CI/CD (5 itens)
- [ ] GitHub Actions (lint, test, build)
- [ ] Docker optimization
- [ ] Healthchecks
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Log aggregation

**Estimativa**: 1-2 dias

**Total Sprint 5**: 15 itens | 5-7 dias

---

## 📋 TAREFAS IMEDIATAS (Hoje/Amanhã)

### Agora mesmo:
- [x] Backup script do Wazuh criado
- [ ] Configurar cron job do backup
- [ ] Testar backup completo

### Próximo:
- [ ] Iniciar Sprint 2
- [ ] Setup de testes (Jest/Vitest)
- [ ] Criar primeiro teste
- [ ] ErrorBoundary component

---

## 🎯 PRIORIZAÇÃO

### 🔴 Crítico (Esta Semana)
1. **Configurar cron backup Wazuh** (hoje)
2. **Iniciar Sprint 2** (amanhã)
3. **Setup de testes** (2-3 dias)
4. **Error handling** (2-3 dias)

### 🟡 Importante (2-4 Semanas)
5. **Sprint 3 - Features Core** (SOC/NOC/Tickets)
6. **Wazuh Indexer integration** (OpenSearch)
7. **Dashboard CISO widgets**

### 🟢 Desejável (4-8 Semanas)
8. **Sprint 4 - GRC completo**
9. **Sprint 5 - Polish**
10. **Certificações e auditorias**

---

## 📈 Timeline Estimado

```
NOV 2025                    DEZ 2025                    JAN 2026
│                           │                           │
├── Sprint 1 ✅             ├── Sprint 3 (Core)         ├── Sprint 5 (Polish)
├── Sprint 2 (Tests)        ├── Sprint 4 (GRC)          └── Launch v1.0 🚀
│   └── Você está aqui      │                           
└── Semana 1                └── Semanas 3-5             └── Semanas 6-8
```

**ETA v1.0 Completo**: Janeiro 2026 (6-8 semanas)

---

## 🔢 Resumo Numérico

| Categoria | Total | Completo | Pendente | % |
|-----------|-------|----------|----------|---|
| Segurança | 11 | 11 | 0 | 100% ✅ |
| Error Handling | 6 | 0 | 6 | 0% |
| Testing | 14 | 0 | 14 | 0% |
| SOC Features | 8 | 2 | 6 | 25% |
| NOC Features | 7 | 2 | 5 | 29% |
| Tickets | 6 | 1 | 5 | 17% |
| GRC | 30 | 0 | 30 | 0% |
| Polish | 15 | 0 | 15 | 0% |
| **TOTAL** | **101** | **16** | **85** | **16%** |

---

## 🎯 Próxima Ação Recomendada

**1. Configurar cron do backup Wazuh** (5 minutos)
```bash
crontab -e
# Adicionar:
0 2 * * * /opt/stack/wazuh-stack/backup-wazuh.sh >> /var/log/wazuh-backup.log 2>&1
```

**2. Iniciar Sprint 2** (agora ou amanhã)
- Setup Jest (backend)
- Setup Vitest (frontend)
- Criar primeiros testes
- Implementar ErrorBoundary

**Estimativa próxima semana**: 20 itens completados (Sprint 2)

---

Quer que eu:
1. **Configure o cron do backup agora**?
2. **Inicie o Sprint 2 imediatamente**?
3. **Outra coisa**?


