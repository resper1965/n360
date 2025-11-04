-- ============================================================
-- n360 Platform - Database Schema
-- PostgreSQL 15+ (Supabase)
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Organizations (Multi-tenancy)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users gerenciado pelo Supabase Auth
-- Apenas metadata adicional
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'ciso', 'auditor', 'soc_analyst', 'noc_analyst', 'readonly')),
  avatar_url TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assets (Consolidated from multiple sources)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('server', 'workstation', 'network_device', 'application', 'cloud_resource')),
  ip_address TEXT,
  hostname TEXT,
  os TEXT,
  os_version TEXT,
  criticality TEXT NOT NULL DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'decomissioned')),
  sources JSONB DEFAULT '{}', -- {wazuh_agent_id, zabbix_hostid, rmm_id}
  metadata JSONB DEFAULT '{}',
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOC Alerts (from Wazuh, etc)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('wazuh', 'antivirus', 'firewall', 'ids', 'custom')),
  source_id TEXT, -- ID original na fonte
  severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  rule_id TEXT,
  rule_description TEXT,
  agent_id UUID REFERENCES assets(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  assigned_to UUID REFERENCES user_profiles(id),
  raw_data JSONB, -- Payload completo da fonte
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- NOC Problems (from Zabbix, etc)
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('zabbix', 'prometheus', 'custom')),
  source_id TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'average', 'high', 'disaster')),
  name TEXT NOT NULL,
  description TEXT,
  host_id UUID REFERENCES assets(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  assigned_to UUID REFERENCES user_profiles(id),
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE NOT NULL, -- Auto-generated: TKT-2024-00001
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('incident', 'request', 'problem', 'change')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  assigned_to UUID REFERENCES user_profiles(id),
  related_alert_id UUID REFERENCES alerts(id),
  related_problem_id UUID REFERENCES problems(id),
  sla_due_date TIMESTAMPTZ,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Ticket Comments
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- GRC TABLES
-- ============================================================

-- Risks
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('operational', 'financial', 'strategic', 'compliance', 'reputational', 'technical')),
  probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  risk_score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'in_treatment', 'mitigated', 'accepted', 'transferred')),
  owner_id UUID REFERENCES user_profiles(id),
  treatment_plan TEXT,
  related_assets UUID[],
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance Standards
CREATE TABLE compliance_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  standard_name TEXT NOT NULL CHECK (standard_name IN ('iso27001', 'iso27002', 'iso27701', 'cis8', 'nist_csf', 'lgpd', 'gdpr', 'hipaa', 'pci_dss', 'soc2')),
  compliance_percentage FLOAT DEFAULT 0,
  total_controls INTEGER DEFAULT 0,
  implemented_controls INTEGER DEFAULT 0,
  last_assessment TIMESTAMPTZ,
  next_audit DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, standard_name)
);

-- Compliance Controls
CREATE TABLE compliance_controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  standard_id UUID NOT NULL REFERENCES compliance_standards(id) ON DELETE CASCADE,
  control_id TEXT NOT NULL, -- Ex: "A.5.1.1" (ISO 27001)
  control_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_implemented' CHECK (status IN ('not_implemented', 'partially_implemented', 'fully_implemented', 'not_applicable')),
  implementation_date DATE,
  responsible_id UUID REFERENCES user_profiles(id),
  evidence_ids UUID[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evidence Files
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_type TEXT,
  file_size BIGINT,
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES evidence(id), -- Para versionamento
  indexed_content TEXT, -- Conteúdo extraído para busca
  related_control_ids UUID[],
  related_risk_ids UUID[],
  uploaded_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUDIT & METADATA
-- ============================================================

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- User Profiles
CREATE INDEX idx_user_profiles_org_id ON user_profiles(org_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Assets
CREATE INDEX idx_assets_org_id ON assets(org_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_criticality ON assets(criticality);
CREATE INDEX idx_assets_ip_address ON assets(ip_address);
CREATE INDEX idx_assets_sources ON assets USING GIN (sources);

-- Alerts
CREATE INDEX idx_alerts_org_id ON alerts(org_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_assigned_to ON alerts(assigned_to);

-- Problems
CREATE INDEX idx_problems_org_id ON problems(org_id);
CREATE INDEX idx_problems_severity ON problems(severity);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problems_created_at ON problems(created_at DESC);

-- Tickets
CREATE INDEX idx_tickets_org_id ON tickets(org_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);

-- Risks
CREATE INDEX idx_risks_org_id ON risks(org_id);
CREATE INDEX idx_risks_risk_score ON risks(risk_score DESC);
CREATE INDEX idx_risks_status ON risks(status);

-- Compliance
CREATE INDEX idx_compliance_standards_org_id ON compliance_standards(org_id);
CREATE INDEX idx_compliance_controls_standard_id ON compliance_controls(standard_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own org
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- User Profiles: Users can see profiles from their org
CREATE POLICY "Users can view org members"
  ON user_profiles FOR SELECT
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Assets: Users can only access their org's assets
CREATE POLICY "Users can view org assets"
  ON assets FOR SELECT
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Alerts: Users can only access their org's alerts
CREATE POLICY "Users can view org alerts"
  ON alerts FOR SELECT
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Problems: Users can only access their org's problems
CREATE POLICY "Users can view org problems"
  ON problems FOR SELECT
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Tickets: Users can only access their org's tickets
CREATE POLICY "Users can view org tickets"
  ON tickets FOR SELECT
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Risks: Users can only access their org's risks
CREATE POLICY "Users can view org risks"
  ON risks FOR SELECT
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Compliance: Users can only access their org's compliance
CREATE POLICY "Users can view org compliance"
  ON compliance_standards FOR SELECT
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Audit Logs: Users can only see their org's logs
CREATE POLICY "Users can view org audit logs"
  ON audit_logs FOR SELECT
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  year_str TEXT;
BEGIN
  year_str := TO_CHAR(now(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_number
  FROM tickets
  WHERE ticket_number LIKE 'TKT-' || year_str || '%';
  
  NEW.ticket_number := 'TKT-' || year_str || '-' || LPAD(next_number::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

-- ============================================================
-- VIEWS
-- ============================================================

-- Dashboard CISO View
CREATE OR REPLACE VIEW dashboard_ciso AS
SELECT
  o.id as org_id,
  o.name as org_name,
  -- Risk Score
  COALESCE(AVG(r.risk_score), 0) as avg_risk_score,
  COUNT(DISTINCT CASE WHEN r.status = 'identified' THEN r.id END) as open_risks,
  -- Compliance
  COALESCE(AVG(cs.compliance_percentage), 0) as avg_compliance,
  -- Alerts
  COUNT(DISTINCT CASE WHEN a.status = 'open' AND a.severity IN ('high', 'critical') THEN a.id END) as critical_alerts,
  -- Problems
  COUNT(DISTINCT CASE WHEN p.status = 'active' AND p.severity IN ('high', 'disaster') THEN p.id END) as critical_problems,
  -- Tickets
  COUNT(DISTINCT CASE WHEN t.status IN ('open', 'in_progress') THEN t.id END) as open_tickets
FROM organizations o
LEFT JOIN risks r ON r.org_id = o.id
LEFT JOIN compliance_standards cs ON cs.org_id = o.id
LEFT JOIN alerts a ON a.org_id = o.id AND a.created_at > now() - interval '30 days'
LEFT JOIN problems p ON p.org_id = o.id AND p.created_at > now() - interval '30 days'
LEFT JOIN tickets t ON t.org_id = o.id
GROUP BY o.id, o.name;

-- ============================================================
-- SEED DATA (Demo)
-- ============================================================

-- Create demo organization
INSERT INTO organizations (id, name, slug, domain)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Demo Corp', 'demo-corp', 'demo.com')
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE organizations IS 'Multi-tenant organizations';
COMMENT ON TABLE assets IS 'IT assets consolidated from Wazuh, Zabbix, RMMs';
COMMENT ON TABLE alerts IS 'Security alerts from SOC tools (Wazuh, etc)';
COMMENT ON TABLE problems IS 'Infrastructure problems from NOC tools (Zabbix, etc)';
COMMENT ON TABLE tickets IS 'Internal ticketing system';
COMMENT ON TABLE risks IS 'Risk management (GRC)';
COMMENT ON TABLE compliance_standards IS 'Compliance tracking (ISO, NIST, LGPD, etc)';

