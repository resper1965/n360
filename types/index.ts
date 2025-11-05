/**
 * n360 Platform - Shared TypeScript Types
 * 
 * Tipos compartilhados entre Backend e Frontend
 * para garantir type safety end-to-end
 */

// ============================================
// BASE TYPES
// ============================================

export type UUID = string;
export type Timestamp = string; // ISO 8601

export interface BaseEntity {
  id: UUID;
  org_id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================
// USER & AUTH
// ============================================

export interface User {
  id: UUID;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  org_id: UUID;
}

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  created_at: Timestamp;
}

// ============================================
// SOC - ALERTS
// ============================================

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export interface Alert extends BaseEntity {
  title: string;
  description: string | null;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string; // 'wazuh'
  rule_id: string | null;
  assigned_to: UUID | null;
  acknowledged_by: UUID | null;
  acknowledged_at: Timestamp | null;
  resolved_by: UUID | null;
  resolved_at: Timestamp | null;
  raw_data: Record<string, any> | null;
}

// ============================================
// NOC - PROBLEMS
// ============================================

export type ProblemSeverity = 'disaster' | 'high' | 'average' | 'warning' | 'info';
export type ProblemStatus = 'active' | 'resolved';

export interface Problem extends BaseEntity {
  name: string;
  description: string | null;
  severity: ProblemSeverity;
  status: ProblemStatus;
  source: string; // 'zabbix'
  source_id: string;
  acknowledged_by: UUID | null;
  acknowledged_at: Timestamp | null;
  raw_data: Record<string, any> | null;
}

// ============================================
// TICKETS
// ============================================

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'incident' | 'request' | 'problem' | 'change';

export interface Ticket extends BaseEntity {
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  created_by: UUID;
  assigned_to: UUID | null;
}

// ============================================
// GRC - RISKS
// ============================================

export type RiskCategory = 
  | 'operational' 
  | 'financial' 
  | 'strategic' 
  | 'compliance' 
  | 'cyber' 
  | 'reputational';

export type RiskStatus = 'open' | 'mitigating' | 'mitigated' | 'accepted' | 'closed';
export type RiskTreatment = 'mitigate' | 'accept' | 'transfer' | 'avoid';

export interface Risk extends BaseEntity {
  title: string;
  description: string | null;
  category: RiskCategory;
  asset_type: string | null;
  
  // Inherent Risk
  likelihood: number; // 1-5
  impact: number; // 1-5
  risk_score: number; // auto-calculated
  
  // Residual Risk
  residual_likelihood: number | null;
  residual_impact: number | null;
  residual_score: number | null; // auto-calculated
  
  // Treatment
  treatment: RiskTreatment;
  mitigation_plan: string | null;
  mitigation_status: 'not_started' | 'in_progress' | 'completed';
  
  // Ownership
  owner_id: UUID | null;
  
  // Status
  status: RiskStatus;
  identified_date: Timestamp;
  target_date: Timestamp | null;
  closed_date: Timestamp | null;
  
  // Relationships
  related_controls: UUID[] | null;
  
  // Metadata
  tags: string[] | null;
}

// ============================================
// GRC - CONTROLS
// ============================================

export type ControlFramework = 
  | 'ISO 27001' 
  | 'NIST CSF' 
  | 'CIS' 
  | 'PCI-DSS' 
  | 'LGPD' 
  | 'SOC2';

export type ControlType = 'preventive' | 'detective' | 'corrective' | 'compensating';

export type ControlStatus = 
  | 'not_implemented' 
  | 'planned' 
  | 'partial' 
  | 'implemented' 
  | 'verified';

export type TestResult = 'passed' | 'failed' | 'partial';

export interface Control extends BaseEntity {
  control_id: string; // ISO-27001-A.5.1
  title: string;
  description: string | null;
  
  // Classification
  framework: ControlFramework;
  control_type: ControlType;
  category: string | null;
  
  // Implementation
  status: ControlStatus;
  implementation_notes: string | null;
  
  // Effectiveness
  effectiveness_score: number | null; // 0.00 - 1.00
  
  // Testing
  last_tested: Timestamp | null;
  test_frequency: number | null; // days
  next_test_date: Timestamp | null;
  test_result: TestResult | null;
  
  // Evidence
  evidence_url: string | null;
  evidence_description: string | null;
  
  // Ownership
  owner_id: UUID | null;
  responsible_team: string | null;
  
  // Relationships
  related_policies: UUID[] | null;
  related_risks: UUID[] | null;
  
  // Metadata
  tags: string[] | null;
}

// ============================================
// GRC - POLICIES
// ============================================

export type PolicyCategory = 'security' | 'privacy' | 'compliance' | 'operational' | 'hr';

export type PolicyStatus = 'draft' | 'review' | 'approved' | 'active' | 'archived';

export interface Policy extends BaseEntity {
  title: string;
  description: string | null;
  content: string | null; // Markdown
  
  // Classification
  category: PolicyCategory;
  framework: string | null;
  
  // Versioning
  version: string;
  parent_id: UUID | null;
  
  // Status & Lifecycle
  status: PolicyStatus;
  effective_date: Timestamp | null;
  review_date: Timestamp | null;
  last_reviewed: Timestamp | null;
  
  // Ownership & Approval
  owner_id: UUID | null;
  approved_by: UUID | null;
  approved_at: Timestamp | null;
  
  // Metadata
  tags: string[] | null;
  created_by: UUID;
}

// ============================================
// API RESPONSES
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: Timestamp;
  uptime: number; // seconds
  services: {
    supabase: 'online' | 'offline';
    wazuh: 'online' | 'offline';
    zabbix: 'online' | 'offline';
  };
}

// ============================================
// DASHBOARD
// ============================================

export interface CISODashboardSummary {
  avg_risk_score: number;
  open_risks: number;
  avg_compliance: number;
  critical_alerts: number;
  critical_problems: number;
  open_tickets: number;
}

export interface CISODashboardResponse {
  summary: CISODashboardSummary;
  topRisks: Risk[];
  criticalAlerts: Alert[];
}

// ============================================
// GRC - RISK MATRIX
// ============================================

export interface RiskMatrixCell {
  count: number;
  risks: UUID[];
  titles: string[];
  score: number;
}

export type RiskMatrix = RiskMatrixCell[][]; // 5x5 matrix

export interface RiskMatrixResponse {
  matrix: RiskMatrix;
}

// ============================================
// GRC - COMPLIANCE
// ============================================

export interface ComplianceScoreByFramework {
  org_id: UUID;
  framework: ControlFramework;
  total_controls: number;
  implemented_controls: number;
  verified_controls: number;
  compliance_percentage: number;
  avg_effectiveness: number | null;
}

// ============================================
// FILTERS
// ============================================

export interface AlertFilters extends PaginationParams {
  severity?: AlertSeverity | 'all';
  status?: AlertStatus | 'all';
  source?: string;
  search?: string;
}

export interface ProblemFilters extends PaginationParams {
  severity?: ProblemSeverity | 'all';
  status?: ProblemStatus | 'all';
  source?: string;
  search?: string;
}

export interface RiskFilters extends PaginationParams {
  status?: RiskStatus | 'all';
  category?: RiskCategory | 'all';
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'all';
  search?: string;
}

export interface ControlFilters extends PaginationParams {
  framework?: ControlFramework | 'all';
  status?: ControlStatus | 'all';
  search?: string;
}

export interface PolicyFilters extends PaginationParams {
  status?: PolicyStatus | 'all';
  category?: PolicyCategory | 'all';
  search?: string;
}

// ============================================
// ACTIONS
// ============================================

export interface AcknowledgeRequest {
  // No body needed, uses req.user.id
}

export interface ResolveRequest {
  // No body needed
}

export interface AssignRequest {
  assigned_to: UUID | null;
}

export interface ControlTestRequest {
  test_result: TestResult;
  effectiveness_score?: number;
  evidence_url?: string;
  evidence_description?: string;
}

// ============================================
// FUTURE: GRC ISMS (Spec 005)
// ============================================

export interface Asset extends BaseEntity {
  asset_code: string;
  name: string;
  description: string | null;
  asset_type: 'hardware' | 'software' | 'information' | 'people' | 'service';
  
  // CIA Triad
  confidentiality_impact: number; // 1-5
  integrity_impact: number; // 1-5
  availability_impact: number; // 1-5
  business_impact: number; // auto-calculated
  
  // Ownership
  asset_owner_id: UUID | null;
  risk_owner_id: UUID | null;
  
  // Integration
  wazuh_agent_id: string | null;
  zabbix_host_id: string | null;
  
  tags: string[] | null;
}

export interface Threat extends BaseEntity {
  threat_code: string;
  name: string;
  description: string | null;
  threat_category: string;
  threat_source: string;
  likelihood_score: number; // 1-5
}

export interface Vulnerability extends BaseEntity {
  vuln_code: string;
  name: string;
  description: string | null;
  severity_score: number; // 1-5
  cve_id: string | null;
  cvss_score: number | null;
  wazuh_vuln_id: string | null;
}

export interface Incident extends BaseEntity {
  incident_code: string;
  title: string;
  description: string | null;
  
  // Materialization
  risk_id: UUID | null;
  materialization_date: Timestamp;
  
  // Asset & Control
  asset_id: UUID | null;
  failed_control_id: UUID | null;
  
  // Classification
  incident_category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  // Status
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  
  // Source
  source: 'wazuh' | 'zabbix' | 'shuffle' | 'manual';
  source_alert_json: Record<string, any> | null;
}

export interface CorrectiveAction extends BaseEntity {
  incident_id: UUID | null;
  control_id: UUID | null;
  
  action_type: 'corrective' | 'preventive';
  action_title: string;
  action_description: string;
  
  assigned_to_id: UUID | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Automation
  is_automated: boolean;
  shuffle_workflow_id: string | null;
  
  // Timeline
  due_date: Timestamp | null;
  completed_at: Timestamp | null;
  
  status: 'open' | 'in_progress' | 'completed' | 'verified' | 'cancelled';
}

// ============================================
// FUTURE: AI AGENTS (Spec 006)
// ============================================

export interface AssetClassificationSuggestion {
  confidentiality_impact: number;
  integrity_impact: number;
  availability_impact: number;
  business_impact: number;
  confidence_score: number;
}

export interface RiskSuggestion {
  threat_id: string;
  threat_name: string;
  vulnerability_id: string;
  likelihood: number;
  impact: number;
  inherent_risk_score: number;
  confidence: number;
  reasoning: string;
}

export interface PlaybookBlueprint {
  name: string;
  description: string;
  trigger: string;
  schedule?: string;
  nodes: PlaybookNode[];
}

export interface PlaybookNode {
  id: string;
  type: 'HTTP' | 'Condition' | 'ForEach' | 'AppendArray';
  name: string;
  config: Record<string, any>;
  next?: string;
  next_true?: string;
  next_false?: string;
}

export interface EvidenceInterpretation {
  test_result: 'effective' | 'partially_effective' | 'ineffective';
  effectiveness_score: number;
  confidence_score: number;
  interpretation: {
    summary: string;
    compliance_status: 'compliant' | 'non_compliant';
    gap_analysis: Record<string, any>;
    severity: string;
    risk_impact: string;
  };
  recommended_actions: Array<{
    priority: string;
    action: string;
    assignee: string;
    automation_available?: boolean;
  }>;
}

export interface RootCauseAnalysis {
  primary_cause: string;
  attack_chain: Array<{
    step: number;
    timestamp: Timestamp;
    event: string;
    ttps: string; // MITRE ATT&CK
  }>;
  failed_control_reason: string;
  confidence: number;
}

// ============================================
// UTILITY TYPES
// ============================================

export type Awaited<T> = T extends Promise<infer U> ? U : T;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

