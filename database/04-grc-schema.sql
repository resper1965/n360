-- ============================================
-- n360 Platform - GRC Schema
-- Governance, Risk & Compliance Module
-- ============================================

-- ============================================
-- GOVERNANCE: Policies (Políticas)
-- ============================================

CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT, -- Conteúdo completo da política (Markdown)
  
  -- Categorization
  category VARCHAR(50) NOT NULL, -- security, privacy, compliance, operational, hr
  framework VARCHAR(50), -- ISO 27001, NIST, CIS, LGPD, SOC2
  
  -- Versioning
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  parent_id UUID REFERENCES policies(id), -- Referência à versão anterior
  
  -- Status & Lifecycle
  status VARCHAR(20) NOT NULL DEFAULT 'draft', 
  -- draft, review, approved, active, archived
  effective_date TIMESTAMPTZ,
  review_date TIMESTAMPTZ, -- Próxima revisão
  last_reviewed TIMESTAMPTZ,
  
  -- Ownership & Approval
  owner_id UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[], -- Array de tags para busca
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'approved', 'active', 'archived')),
  CONSTRAINT valid_category CHECK (category IN ('security', 'privacy', 'compliance', 'operational', 'hr'))
);

-- Index para performance
CREATE INDEX idx_policies_org_id ON policies(org_id);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_category ON policies(category);
CREATE INDEX idx_policies_tags ON policies USING GIN(tags);

-- RLS para multi-tenancy
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY policies_isolation ON policies
  USING (org_id = current_setting('app.current_org_id')::UUID);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_policies_timestamp
  BEFORE UPDATE ON policies
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- RISK MANAGEMENT: Risks (Riscos)
-- ============================================

CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Categorization
  category VARCHAR(50) NOT NULL, -- operational, financial, strategic, compliance, cyber, reputational
  asset_type VARCHAR(50), -- system, data, process, people
  
  -- Risk Assessment (Inherent Risk)
  likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  -- 1=Raro (< 10%), 2=Improvável (10-25%), 3=Possível (25-50%), 
  -- 4=Provável (50-75%), 5=Quase Certo (> 75%)
  
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  -- 1=Insignificante, 2=Menor, 3=Moderado, 4=Maior, 5=Catastrófico
  
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  -- 1-5: Baixo, 6-12: Médio, 15-16: Alto, 20-25: Crítico
  
  -- Risk Treatment
  treatment VARCHAR(30) NOT NULL DEFAULT 'mitigate',
  -- mitigate, accept, transfer, avoid
  
  mitigation_plan TEXT,
  mitigation_status VARCHAR(20) DEFAULT 'not_started',
  -- not_started, in_progress, completed
  
  -- Residual Risk (após mitigação)
  residual_likelihood INTEGER CHECK (residual_likelihood BETWEEN 1 AND 5),
  residual_impact INTEGER CHECK (residual_impact BETWEEN 1 AND 5),
  residual_score INTEGER GENERATED ALWAYS AS (residual_likelihood * residual_impact) STORED,
  
  -- Status & Timeline
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  -- open, mitigating, mitigated, accepted, closed
  identified_date TIMESTAMPTZ DEFAULT NOW(),
  target_date TIMESTAMPTZ, -- Data alvo para mitigação
  closed_date TIMESTAMPTZ,
  
  -- Ownership
  owner_id UUID REFERENCES users(id),
  
  -- Related Controls
  related_controls UUID[], -- Array de IDs de controles
  
  -- Metadata
  tags TEXT[],
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_risk_status CHECK (status IN ('open', 'mitigating', 'mitigated', 'accepted', 'closed')),
  CONSTRAINT valid_treatment CHECK (treatment IN ('mitigate', 'accept', 'transfer', 'avoid')),
  CONSTRAINT valid_category CHECK (category IN ('operational', 'financial', 'strategic', 'compliance', 'cyber', 'reputational'))
);

-- Indexes
CREATE INDEX idx_risks_org_id ON risks(org_id);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_category ON risks(category);
CREATE INDEX idx_risks_risk_score ON risks(risk_score DESC);

-- RLS
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY risks_isolation ON risks
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE TRIGGER update_risks_timestamp
  BEFORE UPDATE ON risks
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- COMPLIANCE: Controls (Controles)
-- ============================================

CREATE TABLE IF NOT EXISTS controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Control Identification
  control_id VARCHAR(50) NOT NULL, -- ex: ISO-27001-A.5.1, NIST-AC-1
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Framework & Category
  framework VARCHAR(50) NOT NULL, -- ISO 27001, NIST CSF, CIS, PCI-DSS, LGPD, SOC2
  control_type VARCHAR(30) NOT NULL, -- preventive, detective, corrective, compensating
  category VARCHAR(50), -- access_control, crypto, physical, hr, incident_response
  
  -- Implementation Status
  status VARCHAR(30) NOT NULL DEFAULT 'not_implemented',
  -- not_implemented, planned, partial, implemented, verified
  
  implementation_notes TEXT,
  
  -- Effectiveness
  effectiveness_score DECIMAL(3,2) CHECK (effectiveness_score BETWEEN 0 AND 1),
  -- 0.00 = Não efetivo, 1.00 = Totalmente efetivo
  
  -- Testing & Evidence
  last_tested TIMESTAMPTZ,
  test_frequency INTEGER, -- Dias entre testes (ex: 90, 180, 365)
  next_test_date TIMESTAMPTZ,
  test_result VARCHAR(20), -- passed, failed, partial
  
  evidence_url TEXT, -- URL do arquivo de evidência (Supabase Storage)
  evidence_description TEXT,
  
  -- Ownership
  owner_id UUID REFERENCES users(id),
  responsible_team VARCHAR(100),
  
  -- Related Policies & Risks
  related_policies UUID[], -- Array de IDs de políticas
  related_risks UUID[], -- Array de IDs de riscos
  
  -- Metadata
  tags TEXT[],
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_control_status CHECK (status IN ('not_implemented', 'planned', 'partial', 'implemented', 'verified')),
  CONSTRAINT valid_control_type CHECK (control_type IN ('preventive', 'detective', 'corrective', 'compensating')),
  CONSTRAINT unique_control_id_per_org UNIQUE (org_id, control_id)
);

-- Indexes
CREATE INDEX idx_controls_org_id ON controls(org_id);
CREATE INDEX idx_controls_framework ON controls(framework);
CREATE INDEX idx_controls_status ON controls(status);
CREATE INDEX idx_controls_next_test_date ON controls(next_test_date);

-- RLS
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY controls_isolation ON controls
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE TRIGGER update_controls_timestamp
  BEFORE UPDATE ON controls
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- AUDITS: Auditorias
-- ============================================

CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Audit Type & Scope
  audit_type VARCHAR(50) NOT NULL, -- internal, external, compliance, security, iso27001
  framework VARCHAR(50), -- ISO 27001, SOC2, PCI-DSS
  scope TEXT, -- Descrição do escopo
  
  -- Timeline
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  report_date TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'planned',
  -- planned, in_progress, fieldwork, reporting, completed, cancelled
  
  -- Auditor
  auditor_type VARCHAR(20), -- internal, external
  auditor_name VARCHAR(255),
  auditor_company VARCHAR(255),
  lead_auditor_id UUID REFERENCES users(id), -- Se interno
  
  -- Results
  overall_score DECIMAL(5,2) CHECK (overall_score BETWEEN 0 AND 100), -- 0.00 a 100.00
  findings_count INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  high_findings INTEGER DEFAULT 0,
  medium_findings INTEGER DEFAULT 0,
  low_findings INTEGER DEFAULT 0,
  
  -- Documentation
  report_url TEXT, -- URL do relatório final (Supabase Storage)
  executive_summary TEXT,
  
  -- Follow-up
  next_audit_date TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[],
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_audit_status CHECK (status IN ('planned', 'in_progress', 'fieldwork', 'reporting', 'completed', 'cancelled')),
  CONSTRAINT valid_audit_type CHECK (audit_type IN ('internal', 'external', 'compliance', 'security', 'iso27001', 'soc2', 'pci-dss'))
);

-- Indexes
CREATE INDEX idx_audits_org_id ON audits(org_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_start_date ON audits(start_date DESC);

-- RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY audits_isolation ON audits
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE TRIGGER update_audits_timestamp
  BEFORE UPDATE ON audits
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- AUDIT FINDINGS: Achados de Auditoria
-- ============================================

CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  
  -- Finding Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Severity
  severity VARCHAR(20) NOT NULL, -- critical, high, medium, low, info
  
  -- Categorization
  category VARCHAR(50), -- access_control, data_protection, incident_response
  affected_control_id UUID REFERENCES controls(id),
  
  -- Recommendation
  recommendation TEXT,
  
  -- Remediation
  remediation_plan TEXT,
  remediation_owner_id UUID REFERENCES users(id),
  remediation_status VARCHAR(20) DEFAULT 'open',
  -- open, in_progress, resolved, accepted_risk
  target_date TIMESTAMPTZ,
  resolved_date TIMESTAMPTZ,
  
  -- Evidence
  evidence_url TEXT,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_finding_severity CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  CONSTRAINT valid_remediation_status CHECK (remediation_status IN ('open', 'in_progress', 'resolved', 'accepted_risk'))
);

-- Indexes
CREATE INDEX idx_audit_findings_audit_id ON audit_findings(audit_id);
CREATE INDEX idx_audit_findings_severity ON audit_findings(severity);
CREATE INDEX idx_audit_findings_status ON audit_findings(remediation_status);

-- RLS
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_findings_isolation ON audit_findings
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE TRIGGER update_audit_findings_timestamp
  BEFORE UPDATE ON audit_findings
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- VIEWS: Visões Agregadas para Dashboards
-- ============================================

-- Risk Matrix View
CREATE OR REPLACE VIEW risk_matrix AS
SELECT 
  org_id,
  likelihood,
  impact,
  risk_score,
  COUNT(*) as count,
  ARRAY_AGG(id) as risk_ids,
  ARRAY_AGG(title) as risk_titles
FROM risks
WHERE status NOT IN ('closed', 'mitigated')
GROUP BY org_id, likelihood, impact, risk_score;

-- Compliance Score por Framework
CREATE OR REPLACE VIEW compliance_score_by_framework AS
SELECT 
  org_id,
  framework,
  COUNT(*) as total_controls,
  COUNT(*) FILTER (WHERE status = 'implemented') as implemented_controls,
  COUNT(*) FILTER (WHERE status = 'verified') as verified_controls,
  ROUND(
    (COUNT(*) FILTER (WHERE status IN ('implemented', 'verified'))::DECIMAL / 
    NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as compliance_percentage,
  AVG(effectiveness_score) as avg_effectiveness
FROM controls
GROUP BY org_id, framework;

-- Top Risks
CREATE OR REPLACE VIEW top_risks AS
SELECT 
  org_id,
  id,
  title,
  category,
  risk_score,
  status,
  owner_id,
  created_at
FROM risks
WHERE status NOT IN ('closed')
ORDER BY risk_score DESC, created_at DESC;

-- Overdue Controls (testes vencidos)
CREATE OR REPLACE VIEW overdue_controls AS
SELECT 
  org_id,
  id,
  control_id,
  title,
  framework,
  status,
  last_tested,
  next_test_date,
  EXTRACT(DAY FROM NOW() - next_test_date)::INTEGER as days_overdue
FROM controls
WHERE next_test_date < NOW()
  AND status IN ('implemented', 'verified')
ORDER BY next_test_date ASC;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

COMMENT ON TABLE policies IS 'Políticas de segurança e governança da organização';
COMMENT ON TABLE risks IS 'Registro de riscos identificados e plano de mitigação';
COMMENT ON TABLE controls IS 'Controles de segurança implementados conforme frameworks';
COMMENT ON TABLE audits IS 'Auditorias internas e externas realizadas';
COMMENT ON TABLE audit_findings IS 'Achados (findings) identificados em auditorias';

-- ============================================
-- END OF GRC SCHEMA
-- ============================================



