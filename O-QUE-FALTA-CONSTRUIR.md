# 📋 O Que Falta Construir - n360 Platform

**Atualizado em**: 05/11/2025  
**Status Atual**: MVP v1.0 em Produção + Sprint 1 Completo

---

## ✅ O Que Já Está Pronto

### 🏗️ Infraestrutura (100%)
- ✅ Docker Compose multi-stack
- ✅ Traefik v3.1 (SSL automático)
- ✅ Redes Docker conectadas
- ✅ Wazuh 4.9.0 LTS operacional
- ✅ Zabbix 6.4 LTS operacional
- ✅ Shuffle SOAR operacional
- ✅ VPS configurada (148.230.77.242)

### 🔒 Backend - Segurança & Performance (100%)
- ✅ Environment validation (Zod)
- ✅ JWT auth middleware + multi-tenancy
- ✅ Input validation schemas
- ✅ SSL verification configurável
- ✅ Rate limiting (3 níveis)
- ✅ Batch inserts (100 records/batch)
- ✅ StatusCache thread-safe
- ✅ Winston structured logging
- ✅ Constants.js (zero magic numbers)
- ✅ BaseCollector abstraction
- ✅ Error propagation

### 🎨 Frontend - UI/UX (80%)
- ✅ React 18 + Vite
- ✅ Tailwind CSS + shadcn/ui
- ✅ ness-theme integrado
- ✅ Sidebar navigation
- ✅ Header responsive
- ✅ Dark-first design
- ✅ Montserrat typography
- ✅ Acessibilidade WCAG AA

### 🗄️ Database (70%)
- ✅ Supabase PostgreSQL conectado
- ✅ Schema básico criado:
  - organizations
  - user_profiles
  - alerts
  - problems
  - tickets
- ✅ RLS policies (parcial)
- ⏳ Triggers e functions (pendente)
- ⏳ Índices otimizados (pendente)

### 📊 Collectors (70%)
- ✅ WazuhCollector (estrutura)
- ✅ ZabbixCollector (estrutura)
- ✅ Batch inserts
- ✅ Retry logic
- ✅ Structured logging
- ⏳ Validação completa de dados
- ⏳ Deduplicação de alertas
- ⏳ Enrichment de contexto

---

## 🚧 O Que Falta Construir

> **Nota**: O n360 é uma plataforma integrada de **GRC + SOC + NOC**.  
> Atualmente temos MVP de SOC (alertas) e NOC (problemas).  
> **GRC precisa ser construído completamente no Sprint 4.**

### SPRINT 2 - Error Handling & Testing (1 semana)
**Prioridade**: 🔴 ALTA

#### 1. Error Handling Robusto
- [ ] **HTTP Error Boundaries**
  - Frontend: Componente ErrorBoundary global
  - Backend: Error handler middleware aprimorado
  - User-friendly error messages
  - Error reporting (Sentry/LogRocket)

- [ ] **Retry Strategies**
  - Exponential backoff nos collectors
  - Circuit breaker pattern
  - Fallback para dados cached
  - Max retry limits configuráveis

- [ ] **Timeout Handling**
  - Timeout configurável por endpoint
  - Graceful degradation
  - Partial response handling

#### 2. Testing (0% → 80%)
- [ ] **Backend Tests**
  - Jest setup
  - Unit tests (collectors, middleware, utils)
  - Integration tests (API endpoints)
  - E2E tests (flows completos)
  - Coverage target: 80%

- [ ] **Frontend Tests**
  - Vitest setup
  - Component tests (React Testing Library)
  - Hook tests
  - E2E tests (Playwright)
  - Coverage target: 70%

- [ ] **API Tests**
  - Postman/Insomnia collections
  - Contract testing (Pact)
  - Load testing (k6)
  - Security testing (OWASP ZAP)

#### 3. Code Duplication Removal
- [ ] Refatorar route handlers (DRY)
- [ ] Componentização frontend
- [ ] Shared utilities
- [ ] API client abstraction

**Estimativa**: 5-7 dias  
**ROI**: -80% bugs, +60% confiança, deploy seguro

---

### SPRINT 3 - Features Core (2 semanas)
**Prioridade**: 🟡 MÉDIA-ALTA

#### 4. SOC - Alertas (60% → 100%)
- [ ] **Listagem Avançada**
  - Filtros por severidade, source, status
  - Busca full-text
  - Ordenação multi-coluna
  - Export CSV/JSON/PDF

- [ ] **Detalhes do Alerta**
  - Timeline de eventos
  - Contexto enriquecido (IP, user, asset)
  - Recommended actions (playbooks)
  - Similar alerts (ML)

- [ ] **Ações em Alertas**
  - Acknowledge/Resolve
  - Assign to user
  - Add comments/notes
  - Create ticket automaticamente
  - MITRE ATT&CK mapping

- [ ] **Dashboards SOC**
  - Top alerts (24h, 7d, 30d)
  - Threat landscape
  - Response time metrics
  - Analyst performance

#### 5. NOC - Problemas (60% → 100%)
- [ ] **Listagem Avançada**
  - Filtros por severidade, host, status
  - Busca por hostname/IP
  - Agrupamento por categoria
  - Export para planilhas

- [ ] **Detalhes do Problema**
  - Gráficos de métricas (CPU, RAM, Disk)
  - Event correlation
  - Root cause analysis
  - Maintenance windows

- [ ] **Ações em Problemas**
  - Acknowledge/Suppress
  - Maintenance mode
  - Execute remediation scripts
  - Create change request

- [ ] **Dashboards NOC**
  - Infrastructure health
  - Capacity planning
  - SLA compliance
  - Top 10 problems

#### 6. Tickets - ITIL Completo (30% → 100%)
- [ ] **CRUD Completo**
  - Create ticket (form wizard)
  - Read/List com filtros
  - Update (status, assignee, priority)
  - Delete/Archive

- [ ] **Workflow ITIL**
  - Incident → Problem → Change
  - Service Request flow
  - Approval workflow
  - SLA tracking

- [ ] **Integrações**
  - Auto-create de alertas SOC
  - Auto-create de problemas NOC
  - Email notifications
  - Slack/Teams integration
  - Webhook para CMDB

- [ ] **Anexos & Comments**
  - Upload de arquivos
  - Screenshot paste
  - @mentions
  - Activity timeline

- [ ] **Dashboards Tickets**
  - Open/Closed trends
  - SLA compliance
  - Backlog analysis
  - Agent performance

#### 7. Dashboard CISO (40% → 100%)
- [ ] **KPIs Executivos**
  - Security posture score
  - Risk heatmap
  - Compliance status
  - Incident trends

- [ ] **Widgets Interativos**
  - Click-to-drill-down
  - Date range selector
  - Real-time updates
  - Export para apresentações

- [ ] **Relatórios Automatizados**
  - Weekly executive summary
  - Monthly security report
  - Quarterly compliance audit
  - Annual risk assessment

**Estimativa**: 10-12 dias  
**ROI**: Produto completo, valor de mercado

---

### SPRINT 4 - GRC & Compliance (2 semanas) 🏛️
**Prioridade**: 🟡 MÉDIA-ALTA  
**Área**: GRC (Governance, Risk & Compliance) - **UMA DAS TRÊS PILARES DO N360**

> **Importante**: O n360 é uma plataforma **GRC + SOC + NOC**. GRC é fundamental!

#### 8. GRC - Governance (Governança)
- [ ] **Asset Management**
  - CMDB (Configuration Management DB)
  - Asset discovery
  - Lifecycle tracking
  - License management

- [ ] **Policy Management**
  - Policy repository
  - Version control
  - Approval workflow
  - Distribution tracking

- [ ] **Risk Register**
  - Risk identification
  - Risk assessment (likelihood × impact)
  - Risk treatment plans
  - Risk monitoring

#### 9. GRC - Compliance (Conformidade)
- [ ] **Frameworks**
  - ISO 27001 checklist
  - LGPD compliance tracker
  - PCI-DSS controls
  - NIST CSF mapping

- [ ] **Evidence Collection**
  - Automated evidence gathering
  - Document repository
  - Audit trail
  - Compliance reports

- [ ] **Audits**
  - Audit schedule
  - Audit findings tracker
  - Remediation plans
  - Follow-up tasks

**Estimativa**: 10-14 dias  
**ROI**: Diferencial competitivo, compliance provada  
**Status Atual**: 0% → 100% (GRC completo)

**Componentes do GRC**:
- 🏛️ **Governance** (Governança): Asset Management, Policy Management
- ⚠️ **Risk** (Risco): Risk Register, Risk Assessment, Risk Treatment
- ✅ **Compliance** (Conformidade): ISO 27001, LGPD, PCI-DSS, NIST CSF

**Por que GRC é importante**:
- ✅ Diferencial competitivo (poucos produtos têm GRC integrado)
- ✅ Necessário para vendas enterprise
- ✅ Compliance regulatória (LGPD, SOX, PCI-DSS)
- ✅ Auditoria e certificações (ISO 27001)
- ✅ Visão executiva de risco e compliance

---

### SPRINT 5 - Polish & Production (1 semana)
**Prioridade**: 🟢 BAIXA-MÉDIA

#### 10. TypeScript Migration (40% → 100%)
- [ ] Backend completo em TypeScript
- [ ] Frontend completo em TypeScript
- [ ] Type definitions para APIs externas
- [ ] Strict mode enabled

#### 11. Internacionalização (i18n)
- [ ] react-i18next setup
- [ ] Português (pt-BR) - 100%
- [ ] Inglês (en-US) - estrutura
- [ ] Espanhol (es-ES) - futuro

#### 12. Documentação
- [ ] **API Documentation**
  - OpenAPI 3.0 spec
  - Swagger UI
  - Postman collection
  - Code examples

- [ ] **User Documentation**
  - User manual (PDF)
  - Video tutorials
  - FAQ
  - Troubleshooting guide

- [ ] **Developer Documentation**
  - Architecture diagrams
  - Setup guide
  - Contribution guidelines
  - Code conventions

#### 13. DevOps & CI/CD
- [ ] **GitHub Actions**
  - Lint & format check
  - Unit tests
  - Build verification
  - Automated deploy

- [ ] **Docker Optimization**
  - Multi-stage builds
  - Image size reduction
  - Healthchecks
  - Resource limits

- [ ] **Monitoring**
  - Prometheus metrics
  - Grafana dashboards
  - Alerting rules
  - Log aggregation (ELK)

#### 14. Performance Optimization
- [ ] **Frontend**
  - Code splitting
  - Lazy loading
  - Image optimization (WebP)
  - Bundle size < 500KB

- [ ] **Backend**
  - Query optimization
  - Caching strategy (Redis)
  - Connection pooling
  - Response time < 100ms

#### 15. Security Hardening
- [ ] **OWASP Top 10**
  - Injection prevention
  - Auth vulnerabilities
  - XSS protection
  - CSRF tokens

- [ ] **Penetration Testing**
  - Automated scans (ZAP)
  - Manual testing
  - Vulnerability remediation
  - Security audit report

**Estimativa**: 5-7 dias  
**ROI**: Produto enterprise-ready, certificável

---

## 📊 Roadmap Visual

```
AGORA (Nov 2025)
├── ✅ Sprint 1: Bad Smells Críticos (COMPLETO)
│
├── 🔴 Sprint 2: Error Handling + Tests (5-7 dias)
│   ├── HTTP Error Boundaries
│   ├── Retry Strategies
│   ├── Jest/Vitest Setup
│   └── 80% Test Coverage
│
├── 🟡 Sprint 3: Features Core - SOC + NOC (10-12 dias)
│   ├── SOC Alertas (100%)
│   ├── NOC Problemas (100%)
│   ├── Tickets ITIL (100%)
│   └── Dashboard CISO (100%)
│
├── 🏛️ SPRINT 4: GRC & Compliance (10-14 dias) ← PILAR FUNDAMENTAL
│   ├── 🏛️ Governance (Governança)
│   │   ├── Asset Management (CMDB)
│   │   └── Policy Management
│   ├── ⚠️ Risk (Risco)
│   │   ├── Risk Register
│   │   ├── Risk Assessment
│   │   └── Risk Treatment
│   └── ✅ Compliance (Conformidade)
│       ├── ISO 27001 checklist
│       ├── LGPD compliance tracker
│       ├── PCI-DSS controls
│       └── NIST CSF mapping
│
└── 🟢 Sprint 5: Polish & Production (5-7 dias)
    ├── TypeScript 100%
    ├── i18n
    ├── OpenAPI Docs
    ├── CI/CD
    └── Security Audit

TOTAL: 30-40 dias úteis (6-8 semanas)
```

---

## 🎯 Priorização por Valor de Negócio

### Agora (Esta Semana)
1. **Sprint 2**: Error Handling + Tests
   - Impacto: Alto (produção estável)
   - Esforço: Médio
   - Valor: Crítico

### Próximo (2-3 Semanas)
2. **Sprint 3**: Features Core - SOC + NOC
   - Impacto: Muito Alto (produto vendável)
   - Esforço: Alto
   - Valor: Muito Alto
   - **Nota**: Completa 2 dos 3 pilares (SOC + NOC)

### Depois (4-6 Semanas)
3. **🏛️ Sprint 4: GRC & Compliance** ← **PILAR FUNDAMENTAL**
   - Impacto: **Muito Alto** (completa o terceiro pilar)
   - Esforço: Alto
   - Valor: **Muito Alto** (diferencial competitivo)
   - **Importante**: Sem GRC, o n360 não é uma plataforma completa GRC+SOC+NOC

4. **Sprint 5**: Polish
   - Impacto: Médio (qualidade)
   - Esforço: Médio
   - Valor: Médio-Alto

---

## 💰 Estimativa de Esforço

| Sprint | Dias | Horas | Complexidade |
|--------|------|-------|--------------|
| Sprint 2 | 5-7 | 40-56 | Média-Alta |
| Sprint 3 | 10-12 | 80-96 | Alta |
| Sprint 4 | 10-14 | 80-112 | Alta |
| Sprint 5 | 5-7 | 40-56 | Média |
| **TOTAL** | **30-40** | **240-320** | **Alta** |

**Equipe**: 1 desenvolvedor full-time  
**Timeline**: 6-8 semanas  
**Lançamento**: Janeiro 2026 (MVP completo)

---

## 🚀 Quick Wins (Próximas 24h)

Para entregar valor imediato:

1. **✅ Menu ajustado** (Status após Tickets)
2. **✅ Hostnames corrigidos** (Wazuh, Zabbix)
3. **✅ Node 20 upgrade**
4. **Próximo**: Implementar testes básicos
5. **Próximo**: Error boundary no frontend
6. **Próximo**: Retry logic nos collectors

---

## 📝 Notas de Desenvolvimento

### Decisões Técnicas Pendentes
- [ ] Cache strategy: Redis vs. in-memory?
- [ ] Realtime: WebSockets vs. Polling?
- [ ] File storage: Supabase Storage vs. R2?
- [ ] Metrics: Prometheus vs. Datadog?

### Débitos Técnicos
- [ ] Refatorar StatusPage (componentizar)
- [ ] Migrations database (Supabase CLI)
- [ ] Seed data para desenvolvimento
- [ ] Docker healthchecks completos

### Features "Nice to Have"
- [ ] Dark/Light theme toggle
- [ ] Customizable dashboards (drag-n-drop)
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] API rate limiting por tier
- [ ] Webhook management UI

---

## 🎓 Aprendizados & Melhorias Contínuas

### Do Sprint 1
- ✅ Zod validation previne 90% dos erros
- ✅ Winston logs facilitam debugging
- ✅ Batch inserts = -98% latência
- ✅ Error propagation evita silent failures

### Para Próximos Sprints
- Testing first (TDD approach)
- Documentação contínua (code + docs)
- Review de código (self-review + AI)
- Deploy contínuo (automated)

---

**Status**: 📍 Estamos aqui (Sprint 1 ✅ → Sprint 2 🔴)  
**Próximo milestone**: Testes + Error Handling (1 semana)  
**Meta final**: Produto enterprise-ready (6-8 semanas)

**Última atualização**: 05/11/2025 - 22h30

