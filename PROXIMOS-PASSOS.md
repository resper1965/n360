# 🚀 Próximos Passos - n360 Platform

## ✅ SPRINTS COMPLETOS

### Sprint 1: Refatoração & Bad Smells ✅
- 11/11 tarefas (100%)
- Refatoração crítica completa
- Code smells eliminados
- Estrutura modular

### Sprint 2: Error Handling & Testing ✅
- 10/10 tarefas (100%)
- 52 testes automatizados
- Retry + Circuit breaker
- ErrorBoundary global

### Sprint 3: Features Core (SOC + NOC) ✅
- 10/10 tarefas (100%)
- SOC: Alertas completos
- NOC: Problemas completos
- Tickets CRUD
- Dashboard widgets

---

## 🎯 SPRINT 4: GRC (GOVERNANCE, RISK & COMPLIANCE)

**Objetivo**: Implementar o pilar fundamental GRC da plataforma n360.

### 📊 Governance (Governança)

#### 1. Schema de Dados
```sql
-- Políticas
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- security, privacy, compliance, operational
  version VARCHAR(20),
  status VARCHAR(20) DEFAULT 'draft', -- draft, review, approved, active, archived
  effective_date TIMESTAMP,
  review_date TIMESTAMP,
  owner_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Controles
CREATE TABLE controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  control_id VARCHAR(50) UNIQUE NOT NULL, -- ex: ISO-27001-A.5.1
  title VARCHAR(255) NOT NULL,
  description TEXT,
  framework VARCHAR(50), -- ISO 27001, NIST, CIS, PCI-DSS
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'not_implemented', -- not_implemented, partial, implemented, verified
  effectiveness_score DECIMAL(3,2), -- 0.00 a 1.00
  last_tested TIMESTAMP,
  evidence_url TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Riscos
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- operational, financial, strategic, compliance
  likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5), -- 1=raro, 5=quase certo
  impact INTEGER CHECK (impact BETWEEN 1 AND 5), -- 1=insignificante, 5=catastrófico
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  status VARCHAR(20) DEFAULT 'open', -- open, mitigating, mitigated, accepted, closed
  owner_id UUID REFERENCES users(id),
  mitigation_plan TEXT,
  mitigation_status VARCHAR(20),
  residual_likelihood INTEGER,
  residual_impact INTEGER,
  residual_score INTEGER GENERATED ALWAYS AS (residual_likelihood * residual_impact) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auditorias
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  audit_type VARCHAR(50), -- internal, external, compliance, security
  framework VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, completed, reported
  auditor_name VARCHAR(255),
  score DECIMAL(5,2), -- 0.00 a 100.00
  findings_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. API Endpoints
- `GET /api/policies` - Listar políticas
- `POST /api/policies` - Criar política
- `PATCH /api/policies/:id` - Atualizar política
- `DELETE /api/policies/:id` - Deletar política
- `POST /api/policies/:id/approve` - Aprovar política

#### 3. Frontend Pages
- `PoliciesPage.jsx` - Listagem e gestão de políticas
- `PolicyDetailPage.jsx` - Detalhes e workflow de aprovação

---

### 🎲 Risk Management (Gestão de Riscos)

#### 1. API Endpoints
- `GET /api/risks` - Listar riscos
- `POST /api/risks` - Criar risco
- `PATCH /api/risks/:id` - Atualizar risco
- `GET /api/risks/matrix` - Matriz de riscos (heat map)

#### 2. Frontend Pages
- `RisksPage.jsx` - Listagem e gestão de riscos
- `RiskDetailPage.jsx` - Detalhes do risco
- `RiskMatrixPage.jsx` - Heat map interativo

#### 3. Features
- Cálculo automático de risk score (likelihood × impact)
- Residual risk (após mitigação)
- Risk appetite threshold
- Exportação para PDF/Excel

---

### ✅ Compliance Management (Gestão de Conformidade)

#### 1. API Endpoints
- `GET /api/controls` - Listar controles
- `POST /api/controls` - Criar controle
- `PATCH /api/controls/:id` - Atualizar controle
- `POST /api/controls/:id/test` - Registrar teste
- `GET /api/compliance/score` - Score de conformidade

#### 2. Frontend Pages
- `ControlsPage.jsx` - Listagem de controles
- `ControlDetailPage.jsx` - Detalhes e evidências
- `ComplianceScorePage.jsx` - Score por framework

#### 3. Features
- Frameworks suportados:
  - ISO 27001
  - NIST CSF
  - CIS Controls
  - PCI-DSS
  - LGPD (Brasil)
- Score automático por framework
- Evidências (upload de arquivos)
- Timeline de testes

---

### 📊 Dashboard GRC

#### 1. Widgets
- `RiskScoreWidget.jsx` - Score médio de riscos
- `ComplianceWidget.jsx` - Score de conformidade
- `TopRisksWidget.jsx` - Top 5 riscos críticos
- `ControlsStatusWidget.jsx` - Status dos controles
- `AuditsWidget.jsx` - Auditorias recentes

#### 2. KPIs
- Risk Score médio (1-25)
- Compliance Score por framework (%)
- Total de riscos abertos
- Total de controles implementados
- Próximas auditorias

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1: Database + API (5 dias)
- Dia 1-2: Schema SQL completo + migrations
- Dia 3-4: APIs CRUD (Risks, Controls, Policies)
- Dia 5: APIs especiais (approve, test, matrix)

### Semana 2: Frontend (5 dias)
- Dia 6-7: Páginas de Risks + Risk Matrix
- Dia 8-9: Páginas de Controls + Compliance
- Dia 10: Páginas de Policies + Workflow

### Semana 3: Dashboard + Polish (4 dias)
- Dia 11-12: Dashboard GRC + Widgets
- Dia 13: Testes automatizados
- Dia 14: Deploy + Documentação

---

## 🎯 MÉTRICAS DE SUCESSO

### Sprint 4 será considerado completo quando:
- ✅ 30 tarefas GRC concluídas (100%)
- ✅ 4 schemas SQL deployados
- ✅ 15+ API endpoints funcionais
- ✅ 8 páginas frontend criadas
- ✅ Dashboard GRC operacional
- ✅ Score de conformidade calculado automaticamente
- ✅ Heat map de riscos interativo
- ✅ Testes automatizados (70%+ coverage)
- ✅ Deploy em produção

---

## 💡 DICAS DE IMPLEMENTAÇÃO

### Risk Matrix (Heat Map)
```javascript
// Exemplo de estrutura para heat map
const riskMatrix = {
  likelihood: [1, 2, 3, 4, 5], // Raro → Quase certo
  impact: [1, 2, 3, 4, 5], // Insignificante → Catastrófico
  zones: {
    low: { score: [1, 2, 3, 4], color: 'green' },
    medium: { score: [5, 6, 8, 9, 10], color: 'yellow' },
    high: { score: [12, 15, 16, 20], color: 'orange' },
    critical: { score: [25], color: 'red' }
  }
}
```

### Compliance Score
```javascript
// Cálculo de score por framework
const complianceScore = (controls) => {
  const implemented = controls.filter(c => c.status === 'implemented').length
  const total = controls.length
  return (implemented / total) * 100
}
```

---

## 🚀 APÓS SPRINT 4

### Sprint 5: Polish & Production (15 tarefas)
1. **TypeScript Migration** (4 tarefas)
   - Backend: Node.js → TypeScript
   - Frontend: React + Vite (já usa TS)
   - Tipos compartilhados (API schemas)

2. **Internacionalização** (2 tarefas)
   - i18n setup (react-i18next)
   - Traduções: pt-BR, en-US

3. **Documentação** (4 tarefas)
   - API Docs (OpenAPI/Swagger)
   - User Guide (português)
   - Admin Guide
   - SBOM atualizado

4. **DevOps & CI/CD** (5 tarefas)
   - GitHub Actions (CI/CD)
   - Docker multi-stage builds
   - Automated backups
   - Monitoring (Prometheus/Grafana)
   - SSL auto-renewal

---

## 📊 PROGRESSO ATUAL

```
Sprints Completos: 3/5 (60%)
Tarefas Completas: 31/76 (41%)
Tempo Investido: ~5 horas
Commits: 30+
Linhas de Código: +9000
```

**Próximo objetivo**: Sprint 4 (GRC) - 30 tarefas

---

**Projeto**: n360 Platform (ness.)  
**Data**: 06/11/2025  
**Status**: Em desenvolvimento ativo 🚀


