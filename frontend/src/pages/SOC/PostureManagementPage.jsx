/**
 * Posture Management Page
 * Page completa of gerenciamento of security posture security (SIEM SCA)
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PostureManagementPage() {
  const [summary, setSummary] = useState(null);
  const [failedChecks, setFailedChecks] = useState([]);
  const [search, setSearch] = useState('');
  const [expandedCheck, setExpandedCheck] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, checksRes] = await Promise.all([
          fetch(`${window.location.origin}/api/posture/summary`),
          fetch(`${window.location.origin}/api/posture/failed-checks?limit=20`)
        ]);

        if (summaryRes.ok && checksRes.ok) {
          const summaryData = await summaryRes.json();
          const checksData = await checksRes.json();

          setSummary(summaryData.data);
          setFailedChecks(checksData.data);
        }
      } catch (error) {
        console.error('Error fetching posture data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000); // 1min
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" strokeWidth={1.5} />
          <div className="text-sm text-muted-foreground">Loading security posture...</div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No posture data available
      </div>
    );
  }

  const filteredChecks = failedChecks.filter(check =>
    check.title?.toLowerCase().includes(search.toLowerCase()) ||
    check.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Posture</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Continuous security configuration assessment (SIEM SCA)
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-grid-md">
        {/* Score Geral */}
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Score Geral</div>
                <div className={cn("text-3xl font-bold", getScoreColor(summary.score))}>
                  {summary.score}%
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mt-2 w-24 border border-border/50">
                  <div
                    className={cn("h-full transition-all duration-slow", getScoreBg(summary.score))}
                    style={{ width: `${summary.score}%` }}
                  />
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checks Passou */}
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Passou</div>
                <div className="text-3xl font-bold text-green-500">{summary.passed}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  of {summary.total} checks
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checks Falhou */}
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Falhou</div>
                <div className="text-3xl font-bold text-red-500">{summary.failed}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Requires attention
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <XCircle className="h-6 w-6 text-red-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* N/A */}
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Not Applicable</div>
                <div className="text-3xl font-bold">{summary.not_applicable}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ignorados
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                <AlertCircle className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Policies Active ({summary.policies?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.policies && summary.policies.length > 0 ? (
            summary.policies.map((policy) => (
              <div 
                key={policy.name} 
                className="p-4 rounded-lg border border-border hover:border-primary/20 transition-all duration-base"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{policy.name}</div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      policy.score >= 90 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      policy.score >= 70 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    )}
                  >
                    {policy.score}%
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" strokeWidth={1.5} />
                    Passou: {policy.passed}
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500" strokeWidth={1.5} />
                    Falhou: {policy.failed}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                    N/A: {policy.not_applicable}
                  </span>
                  <span>Total: {policy.total}</span>
                </div>

                <div className="h-2 rounded-full bg-muted overflow-hidden border border-border/50">
                  <div
                    className={cn("h-full transition-all duration-slow", getScoreBg(policy.score))}
                    style={{ width: `${policy.score}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              Nenhuma policy ativa. Ative SCA no SIEM Manager.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search checks falhando..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Failed Checks */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>
            Checks Falhando ({filteredChecks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredChecks.length > 0 ? (
            filteredChecks.map((check) => (
              <div key={check.id} className="border border-border rounded-lg overflow-hidden">
                <div
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="h-4 w-4 text-red-500" strokeWidth={1.5} />
                        <div className="font-medium text-sm">{check.title}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        ID: {check.id} | {check.affected_agents} agente(s) afetado(s) | {check.policy}
                      </div>
                      {check.compliance && check.compliance.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {check.compliance.slice(0, 4).map((comp, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {comp}
                            </Badge>
                          ))}
                          {check.compliance.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{check.compliance.length - 4} mais
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    {expandedCheck === check.id ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" strokeWidth={1.5} />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" strokeWidth={1.5} />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedCheck === check.id && (
                  <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                    {check.description && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Description:</div>
                        <div className="text-sm">{check.description}</div>
                      </div>
                    )}

                    {check.rationale && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Justificativa:</div>
                        <div className="text-sm text-muted-foreground">{check.rationale}</div>
                      </div>
                    )}

                    {check.remediation && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Remediation:</div>
                        <div className="text-sm bg-muted p-3 rounded-lg border border-border font-mono text-xs overflow-x-auto">
                          {check.remediation}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button 
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        onClick={() => window.open('https://siem.nsecops.com.br', '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                        Ver no SIEM
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">
                        Ver Agentes Afetados ({check.affected_agents})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              {search ? 'No check encontrado com esse filtro.' : 'No check falhando! 🎉'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


