-- ============================================
-- n360 Platform - GRC ISMS Schema
-- Based on Prisma schema.prisma
-- Execute after 01-04 schemas
-- ============================================

-- ============================================
-- CMDB: Assets
-- ============================================

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  asset_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('hardware', 'software', 'information', 'people', 'service')),
  
  -- CIA Triad
  confidentiality_impact INTEGER NOT NULL CHECK (confidentiality_impact BETWEEN 1 AND 5),
  integrity_impact INTEGER NOT NULL CHECK (integrity_impact BETWEEN 1 AND 5),
  availability_impact INTEGER NOT NULL CHECK (availability_impact BETWEEN 1 AND 5),
  business_impact INTEGER NOT NULL, -- Calculated: max(C,I,A) + avg
  
  -- Ownership
  asset_owner_id UUID,
  risk_owner_id UUID,
  
  -- Integration
  wazuh_agent_id VARCHAR(50),
  zabbix_host_id VARCHAR(50),
  
  -- Metadata
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_org_id ON assets(org_id);
CREATE INDEX idx_assets_type ON assets(asset_type);

-- RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY assets_isolation ON assets USING (org_id = current_setting('app.current_org_id')::UUID);

-- ============================================
-- TVL: Threats
-- ============================================

CREATE TABLE IF NOT EXISTS threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  threat_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  threat_category VARCHAR(50) NOT NULL,
  threat_source VARCHAR(50) NOT NULL,
  likelihood_score INTEGER NOT NULL CHECK (likelihood_score BETWEEN 1 AND 5),
  
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_threats_org_id ON threats(org_id);

ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
CREATE POLICY threats_isolation ON threats USING (org_id = current_setting('app.current_org_id')::UUID);

-- ============================================
-- TVL: Vulnerabilities
-- ============================================

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  vuln_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  severity_score INTEGER NOT NULL CHECK (severity_score BETWEEN 1 AND 5),
  cve_id VARCHAR(50),
  cvss_score REAL,
  wazuh_vuln_id VARCHAR(100),
  
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vulnerabilities_org_id ON vulnerabilities(org_id);
CREATE INDEX idx_vulnerabilities_cve ON vulnerabilities(cve_id);

ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY vulnerabilities_isolation ON vulnerabilities USING (org_id = current_setting('app.current_org_id')::UUID);

-- ============================================
-- Risk Threat Vuln Mapping
-- ============================================

CREATE TABLE IF NOT EXISTS risk_threat_vuln (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  threat_id UUID NOT NULL REFERENCES threats(id),
  vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id),
  
  inherent_likelihood INTEGER NOT NULL,
  inherent_impact INTEGER NOT NULL,
  inherent_score INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(risk_id, threat_id, vulnerability_id)
);

CREATE INDEX idx_risk_threat_vuln_risk ON risk_threat_vuln(risk_id);

-- ============================================
-- Risk Control Mapping (Enhanced)
-- ============================================

CREATE TABLE IF NOT EXISTS risk_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  control_id UUID NOT NULL REFERENCES controls(id),
  
  reduction_percentage REAL, -- How much this control reduces risk
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(risk_id, control_id)
);

CREATE INDEX idx_risk_controls_risk ON risk_controls(risk_id);
CREATE INDEX idx_risk_controls_control ON risk_controls(control_id);

-- ============================================
-- Control Test Executions (History)
-- ============================================

CREATE TABLE IF NOT EXISTS control_test_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  
  tested_at TIMESTAMPTZ NOT NULL,
  tested_by_id UUID,
  
  test_result VARCHAR(20) NOT NULL CHECK (test_result IN ('passed', 'failed', 'partial')),
  effectiveness_score REAL CHECK (effectiveness_score BETWEEN 0 AND 1),
  
  evidence_url TEXT,
  evidence_description TEXT,
  raw_evidence_json JSONB,
  
  shuffle_execution_id VARCHAR(100),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_control_test_executions_control ON control_test_executions(control_id);
CREATE INDEX idx_control_test_executions_date ON control_test_executions(tested_at);

-- ============================================
-- Incidents
-- ============================================

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  incident_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  risk_id UUID REFERENCES risks(id),
  materialization_date TIMESTAMPTZ NOT NULL,
  
  asset_id UUID REFERENCES assets(id),
  failed_control_id UUID REFERENCES controls(id),
  
  incident_category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')),
  
  source VARCHAR(50) NOT NULL,
  source_alert_json JSONB,
  
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_org_id ON incidents(org_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_risk ON incidents(risk_id);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY incidents_isolation ON incidents USING (org_id = current_setting('app.current_org_id')::UUID);

-- ============================================
-- Corrective Actions (CAPA)
-- ============================================

CREATE TABLE IF NOT EXISTS corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  incident_id UUID REFERENCES incidents(id),
  control_id UUID REFERENCES controls(id),
  
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('corrective', 'preventive')),
  action_title VARCHAR(255) NOT NULL,
  action_description TEXT NOT NULL,
  
  assigned_to_id UUID,
  priority VARCHAR(20) NOT NULL,
  
  is_automated BOOLEAN DEFAULT FALSE,
  shuffle_workflow_id VARCHAR(100),
  
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'verified', 'cancelled')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corrective_actions_incident ON corrective_actions(incident_id);
CREATE INDEX idx_corrective_actions_status ON corrective_actions(status);

ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY corrective_actions_isolation ON corrective_actions USING (org_id = current_setting('app.current_org_id')::UUID);

-- ============================================
-- Audits
-- ============================================

CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  audit_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  audit_type VARCHAR(50) NOT NULL,
  framework VARCHAR(50),
  
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'reported')),
  
  auditor_name VARCHAR(255),
  score REAL,
  findings_count INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audits_org_id ON audits(org_id);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY audits_isolation ON audits USING (org_id = current_setting('app.current_org_id')::UUID);

-- ============================================
-- Audit Findings
-- ============================================

CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  
  finding_title VARCHAR(255) NOT NULL,
  finding_description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  
  control_id UUID REFERENCES controls(id),
  
  remediation_plan TEXT,
  remediation_status VARCHAR(20) DEFAULT 'open',
  due_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_findings_audit ON audit_findings(audit_id);

-- ============================================
-- Enhanced Controls (Add missing fields)
-- ============================================

ALTER TABLE controls ADD COLUMN IF NOT EXISTS test_plan TEXT;
ALTER TABLE controls ADD COLUMN IF NOT EXISTS test_objective TEXT;
ALTER TABLE controls ADD COLUMN IF NOT EXISTS test_method TEXT;
ALTER TABLE controls ADD COLUMN IF NOT EXISTS expected_result TEXT;
ALTER TABLE controls ADD COLUMN IF NOT EXISTS next_test_date TIMESTAMPTZ;
ALTER TABLE controls ADD COLUMN IF NOT EXISTS shuffle_workflow_id VARCHAR(100);
ALTER TABLE controls ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT FALSE;

-- ============================================
-- Enhanced Risks (Add asset reference)
-- ============================================

ALTER TABLE risks ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(id);
CREATE INDEX IF NOT EXISTS idx_risks_asset ON risks(asset_id);

-- ============================================
-- DONE! ISMS Schema Complete
-- ============================================



