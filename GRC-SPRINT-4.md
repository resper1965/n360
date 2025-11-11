# 🏛️ Sprint 4 - GRC & Compliance

**Status**: ⏳ Planejado  
**Prioridade**: 🟡 MÉDIA-ALTA  
**Duração**: 10-14 dias úteis  
**Objetivo**: Completar o terceiro pilar do n360 Platform

---

## 🎯 Contexto

O **n360 Platform** é uma plataforma integrada de **GRC + SOC + NOC**:

- **SOC** (Security Operations Center) ✅ - MVP em produção
- **NOC** (Network Operations Center) ✅ - MVP em produção  
- **GRC** (Governance, Risk & Compliance) ⏳ - **PENDENTE (Sprint 4)**

**Sem GRC, o n360 não é uma plataforma completa!**

---

## 📋 O Que Será Construído

### 🏛️ 1. Governance (Governança)

#### Asset Management (CMDB)
- [ ] **Configuration Management Database**
  - Asset inventory (servers, switches, firewalls, etc.)
  - Asset discovery (auto-discovery via Zabbix/Wazuh)
  - Lifecycle tracking (provision → active → retired)
  - License management (software licenses tracking)
  - Asset relationships (parent-child, dependencies)
  - Asset tags e categorias
  - Custom fields (serial number, warranty, etc.)

- [ ] **Asset Discovery**
  - Integração com Zabbix (hosts, items)
  - Integração com Wazuh (agents, endpoints)
  - Network scanning (opcional)
  - Manual entry (bulk import CSV)

- [ ] **Asset Lifecycle**
  - Provision workflow
  - Maintenance windows
  - Retirement process
  - Asset history (audit trail)

#### Policy Management
- [ ] **Policy Repository**
  - Policy creation (templates)
  - Version control (draft → review → approved → published)
  - Approval workflow (multi-level)
  - Distribution tracking (who read what, when)
  - Policy categories (Security, IT, HR, etc.)
  - Policy attachments (PDF, DOCX)
  - Policy search (full-text)

- [ ] **Policy Workflow**
  - Draft → Review → Approval → Published
  - Reviewers assignment
  - Comments e feedback
  - Rejection with reasons
  - Version history

- [ ] **Policy Compliance**
  - User acknowledgment tracking
  - Compliance reports (who read, who didn't)
  - Reminders (email notifications)
  - Expiration dates
  - Renewal workflow

---

### ⚠️ 2. Risk (Risco)

#### Risk Register
- [ ] **Risk Identification**
  - Risk creation (manual ou template)
  - Risk categories (Security, Operational, Financial, Legal)
  - Risk sources (Internal, External, Third-party)
  - Risk description (detailed)
  - Risk owner assignment
  - Risk tags (keywords)

- [ ] **Risk Assessment**
  - Likelihood (1-5 scale: Very Low → Very High)
  - Impact (1-5 scale: Very Low → Very High)
  - Risk Score = Likelihood × Impact
  - Risk Matrix (5x5 grid visualization)
  - Risk level (Low, Medium, High, Critical)
  - Inherent vs Residual risk

- [ ] **Risk Treatment**
  - Treatment options (Accept, Mitigate, Transfer, Avoid)
  - Treatment plans (detailed actions)
  - Treatment owner (responsible person)
  - Treatment timeline (milestones)
  - Treatment status (Planned, In Progress, Completed)
  - Cost-benefit analysis

- [ ] **Risk Monitoring**
  - Risk review schedule (monthly, quarterly, annually)
  - Risk reassessment (likelihood/impact changes)
  - Risk trends (visualization over time)
  - Risk dashboard (top risks, critical risks)
  - Risk alerts (escalation rules)

#### Risk Dashboard
- [ ] **Risk Heatmap**
  - 5x5 matrix (Likelihood × Impact)
  - Color-coded (green → yellow → red)
  - Interactive (click to filter)
  - Export (PNG, PDF)

- [ ] **Risk Trends**
  - Line chart (risk score over time)
  - Risk categories breakdown
  - Treatment effectiveness
  - New vs Closed risks

- [ ] **Top Risks**
  - Top 10 highest score
  - Critical risks (score > 16)
  - Risks without treatment
  - Overdue reviews

---

### ✅ 3. Compliance (Conformidade)

#### Compliance Frameworks
- [ ] **ISO 27001**
  - Control checklist (114 controls)
  - Control mapping (A.5.1.1, A.5.1.2, etc.)
  - Control status (Implemented, Partial, Not Implemented)
  - Evidence linking (documents, policies, logs)
  - Gap analysis (compliance score)
  - Statement of Applicability (SOA)

- [ ] **LGPD (Lei Geral de Proteção de Dados)**
  - Article checklist (40+ articles)
  - Data mapping (personal data inventory)
  - Consent management (tracking)
  - Data subject rights (access, deletion, portability)
  - Breach notification (72h rule)
  - DPO (Data Protection Officer) workflow

- [ ] **PCI-DSS**
  - 12 requirement checklist
  - Self-Assessment Questionnaire (SAQ)
  - Compliance validation (QSA reports)
  - Cardholder data inventory
  - Network segmentation mapping

- [ ] **NIST CSF**
  - Framework mapping (Identify, Protect, Detect, Respond, Recover)
  - Function categories (5 functions, 23 categories)
  - Subcategory mapping (108 subcategories)
  - Implementation tiers (1-4)
  - Profile comparison (current vs target)

#### Evidence Collection
- [ ] **Automated Evidence Gathering**
  - Integration com Wazuh (security logs)
  - Integration com Zabbix (infrastructure metrics)
  - Policy compliance checks (auto-verify)
  - Access control reviews (RBAC evidence)
  - Backup verification (automated checks)

- [ ] **Document Repository**
  - Evidence upload (PDF, DOCX, XLSX, images)
  - Evidence categorization (by control/framework)
  - Evidence versioning (version control)
  - Evidence metadata (author, date, source)
  - Evidence search (full-text)

- [ ] **Audit Trail**
  - All actions logged (who, what, when)
  - Immutable logs (blockchain-style)
  - Compliance reports generation
  - Export for auditors

#### Compliance Reports
- [ ] **Report Generation**
  - Compliance dashboard (overall score)
  - Framework-specific reports
  - Gap analysis reports
  - Evidence summary reports
  - Executive summaries (C-level)

- [ ] **Report Templates**
  - ISO 27001 Statement of Applicability
  - LGPD Compliance Report
  - PCI-DSS SAQ
  - NIST CSF Profile
  - Custom templates (PPTX, DOCX, PDF)

---

### 🎨 4. UI/UX - GRC Pages

#### Governance Pages
- [ ] **Assets Page** (`/grc/assets`)
  - Asset list (table with filters)
  - Asset detail (full information)
  - Asset creation (form wizard)
  - Asset edit (inline editing)
  - Asset search (full-text)

- [ ] **Policies Page** (`/grc/policies`)
  - Policy list (with status)
  - Policy detail (read-only viewer)
  - Policy creation (form wizard)
  - Policy approval workflow
  - Policy distribution tracking

#### Risk Pages
- [ ] **Risk Register Page** (`/grc/risks`)
  - Risk list (table with filters)
  - Risk detail (full information)
  - Risk creation (form wizard)
  - Risk assessment (likelihood/impact)
  - Risk treatment planning

- [ ] **Risk Dashboard Page** (`/grc/risks/dashboard`)
  - Risk heatmap (5x5 matrix)
  - Risk trends (line chart)
  - Top risks (list)
  - Risk categories breakdown
  - Treatment status

#### Compliance Pages
- [ ] **Compliance Dashboard** (`/grc/compliance`)
  - Overall compliance score (gauge)
  - Framework status (cards)
  - Gap analysis (visual)
  - Evidence summary
  - Upcoming audits

- [ ] **Framework Pages** (`/grc/compliance/iso27001`, `/grc/compliance/lgpd`, etc.)
  - Control checklist (table)
  - Control detail (with evidence)
  - Evidence upload
  - Compliance score calculation
  - Gap analysis

- [ ] **Audits Page** (`/grc/compliance/audits`)
  - Audit schedule (calendar view)
  - Audit list (table)
  - Audit detail (findings, evidence)
  - Audit creation (form)
  - Remediation tracking

---

## 🗄️ 5. Database Schema

### Tables to Create

```sql
-- Assets
assets
  - id (uuid)
  - org_id (uuid)
  - name (text)
  - type (asset_type enum)
  - category (text)
  - status (asset_status enum)
  - ip_address (inet)
  - hostname (text)
  - serial_number (text)
  - manufacturer (text)
  - model (text)
  - location (text)
  - owner_id (uuid -> user_profiles)
  - lifecycle_stage (provision | active | maintenance | retired)
  - provisioned_at (timestamp)
  - retired_at (timestamp)
  - metadata (jsonb)
  - created_at, updated_at

-- Policies
policies
  - id (uuid)
  - org_id (uuid)
  - title (text)
  - category (policy_category enum)
  - version (integer)
  - status (draft | review | approved | published | archived)
  - content (text)
  - attachments (jsonb)
  - created_by (uuid -> user_profiles)
  - approved_by (uuid -> user_profiles)
  - published_at (timestamp)
  - expires_at (timestamp)
  - created_at, updated_at

-- Policy Acknowledgments
policy_acknowledgments
  - id (uuid)
  - policy_id (uuid -> policies)
  - user_id (uuid -> user_profiles)
  - acknowledged_at (timestamp)
  - ip_address (inet)
  - user_agent (text)

-- Risks
risks
  - id (uuid)
  - org_id (uuid)
  - title (text)
  - description (text)
  - category (risk_category enum)
  - source (internal | external | third_party)
  - likelihood (1-5)
  - impact (1-5)
  - score (likelihood * impact)
  - level (low | medium | high | critical)
  - owner_id (uuid -> user_profiles)
  - status (identified | assessed | treated | monitored | closed)
  - treatment_option (accept | mitigate | transfer | avoid)
  - treatment_plan (text)
  - treatment_owner_id (uuid -> user_profiles)
  - treatment_status (planned | in_progress | completed)
  - next_review_date (date)
  - created_at, updated_at

-- Risk Reviews
risk_reviews
  - id (uuid)
  - risk_id (uuid -> risks)
  - reviewed_by (uuid -> user_profiles)
  - likelihood (1-5)
  - impact (1-5)
  - score (calculated)
  - notes (text)
  - reviewed_at (timestamp)

-- Compliance Frameworks
compliance_frameworks
  - id (uuid)
  - org_id (uuid)
  - name (text: 'ISO 27001', 'LGPD', 'PCI-DSS', 'NIST CSF')
  - status (active | inactive)
  - created_at, updated_at

-- Compliance Controls
compliance_controls
  - id (uuid)
  - framework_id (uuid -> compliance_frameworks)
  - code (text: 'A.5.1.1', 'Art. 5', 'Req. 1', etc.)
  - title (text)
  - description (text)
  - category (text)
  - status (not_implemented | partial | implemented)
  - evidence_ids (uuid[] -> evidence)
  - created_at, updated_at

-- Evidence
evidence
  - id (uuid)
  - org_id (uuid)
  - title (text)
  - description (text)
  - file_url (text -> Supabase Storage)
  - file_type (text)
  - file_size (bigint)
  - category (text)
  - control_ids (uuid[] -> compliance_controls)
  - uploaded_by (uuid -> user_profiles)
  - uploaded_at (timestamp)
  - metadata (jsonb)

-- Audits
audits
  - id (uuid)
  - org_id (uuid)
  - title (text)
  - framework_id (uuid -> compliance_frameworks)
  - scheduled_date (date)
  - completed_date (date)
  - auditor_name (text)
  - status (scheduled | in_progress | completed | cancelled)
  - findings (jsonb)
  - remediation_plan (text)
  - created_at, updated_at
```

---

## 🔌 6. Integrações

### Com Wazuh (SIEM)
- Asset discovery (endpoints detected)
- Security evidence (logs, alerts)
- Compliance checks (security controls)

### Com Zabbix (NOC)
- Asset inventory (hosts, items)
- Infrastructure evidence (metrics, availability)
- Compliance checks (availability SLA)

### Com Shuffle (SOAR)
- Risk treatment automation (playbooks)
- Compliance evidence gathering (automated)
- Audit workflow automation

---

## 📊 7. Métricas & KPIs

### Governance KPIs
- Total assets (count)
- Assets by lifecycle stage
- Policies published (count)
- Policy compliance rate (%)
- Policy acknowledgment rate (%)

### Risk KPIs
- Total risks (count)
- Risks by level (Low/Medium/High/Critical)
- Risk score average
- Risks without treatment (count)
- Treatment completion rate (%)

### Compliance KPIs
- Overall compliance score (%)
- Framework compliance (by framework)
- Controls implemented (%)
- Evidence collected (count)
- Upcoming audits (count)

---

## 🎯 8. Deliverables

### Backend
- [ ] API endpoints (`/api/grc/*`)
- [ ] Database schema (Supabase migrations)
- [ ] Collectors (asset discovery)
- [ ] Report generators (PDF, DOCX)

### Frontend
- [ ] GRC pages (Assets, Policies, Risks, Compliance)
- [ ] Risk heatmap component
- [ ] Compliance dashboard
- [ ] Evidence uploader
- [ ] Report viewer

### Documentation
- [ ] User manual (GRC section)
- [ ] API documentation (OpenAPI)
- [ ] Compliance frameworks guide

---

## 📈 9. ROI Esperado

### Diferencial Competitivo
- ✅ **Poucos produtos** têm GRC + SOC + NOC integrado
- ✅ **Vendas enterprise** (necessário para grandes clientes)
- ✅ **Compliance provada** (auditoria facilitada)

### Valor de Negócio
- 🎯 **Preço premium** (produto completo justifica)
- 🎯 **Retenção** (compliance = sticky feature)
- 🎯 **Certificações** (ISO 27001, SOC 2)

### Eficiência
- ⚡ **Automação** (evidence gathering)
- ⚡ **Visibilidade** (dashboard executivo)
- ⚡ **Auditoria** (tudo em um lugar)

---

## 🚀 10. Plano de Execução

### Semana 1 (5 dias)
- [ ] Dia 1-2: Database schema + migrations
- [ ] Dia 3-4: Backend API (Assets, Policies)
- [ ] Dia 5: Frontend pages (Assets, Policies)

### Semana 2 (5 dias)
- [ ] Dia 1-2: Backend API (Risks, Compliance)
- [ ] Dia 3-4: Frontend pages (Risks, Compliance)
- [ ] Dia 5: Risk dashboard + heatmap

### Semana 3 (2-4 dias)
- [ ] Integrações (Wazuh, Zabbix)
- [ ] Report generation
- [ ] Testing e refinamento
- [ ] Documentation

---

## ✅ Definition of Done

- [ ] Todas as features implementadas
- [ ] Database schema criado e migrado
- [ ] API endpoints documentados (OpenAPI)
- [ ] Frontend pages funcionais
- [ ] Integrações testadas
- [ ] Reports gerando corretamente
- [ ] Testes automatizados (80% coverage)
- [ ] Documentation completa
- [ ] Deploy em produção
- [ ] User acceptance testing (UAT)

---

**Status**: ⏳ Planejado para Sprint 4  
**Início**: Após Sprint 3 (Features Core)  
**Duração**: 10-14 dias úteis  
**Resultado**: n360 Platform completo (GRC + SOC + NOC) ✅



