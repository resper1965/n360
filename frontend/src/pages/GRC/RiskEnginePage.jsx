/**
 * Risk Engine v2 Page
 * Dashboard advanced calculation of risks (Inherent + Residual)
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ExportPDFButton from '@/components/ExportPDFButton';

export function RiskEnginePage() {
  const [risks, setRisks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    avgInherent: 0,
    avgResidual: 0,
    avgReduction: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRisks();
  }, []);

  async function fetchRisks() {
    try {
      const res = await fetch(`${window.location.origin}/api/risks`);
      if (res.ok) {
        const data = await res.json();
        const allRisks = data.data || [];
        
        // Calcular stats
        const stats = allRisks.reduce((acc, risk) => {
          acc.total++;
          
          // Por severidade
          if (risk.risk_score >= 16) acc.critical++;
          else if (risk.risk_score >= 12) acc.high++;
          else if (risk.risk_score >= 8) acc.medium++;
          else acc.low++;
          
          // Averages
          acc.totalInherent += risk.risk_score || 0;
          acc.totalResidual += risk.residual_risk_score || risk.risk_score || 0;
          
          return acc;
        }, { 
          total: 0, critical: 0, high: 0, medium: 0, low: 0,
          totalInherent: 0, totalResidual: 0
        });
        
        stats.avgInherent = stats.total > 0 ? (stats.totalInherent / stats.total).toFixed(1) : 0;
        stats.avgResidual = stats.total > 0 ? (stats.totalResidual / stats.total).toFixed(1) : 0;
        stats.avgReduction = stats.avgInherent > 0 
          ? (((stats.avgInherent - stats.avgResidual) / stats.avgInherent) * 100).toFixed(1)
          : 0;
        
        setStats(stats);
        setRisks(allRisks);
      }
    } catch (error) {
      console.error('Error fetching risks:', error);
    } finally {
      setLoading(false);
    }
  }

  const getRiskColor = (score) => {
    if (score >= 16) return 'text-red-500';
    if (score >= 12) return 'text-orange-500';
    if (score >= 8) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getRiskBadge = (score) => {
    if (score >= 16) return { label: "Critical", color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    if (score >= 12) return { label: 'Alto', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
    if (score >= 8) return { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    return { label: 'Baixo', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" strokeWidth={1.5} />
          <div className="text-sm text-muted-foreground">Calculando risks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Risks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced calculation of Inherent Risk e Residual
          </p>
        </div>
        <ExportPDFButton
          endpoint="/api/reports/risk-register-pdf"
          filename={`risk-register-${new Date().toISOString().split('T')[0]}.pdf`}
          label="Export Risk Register"
          variant="outline"
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-grid-md">
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Inherent Risk Medium</div>
                <div className={cn("text-3xl font-bold", getRiskColor(stats.avgInherent))}>
                  {stats.avgInherent}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Before controls
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Residual Risk Medium</div>
                <div className={cn("text-3xl font-bold", getRiskColor(stats.avgResidual))}>
                  {stats.avgResidual}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  After controls
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <Shield className="h-6 w-6 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Average Reduction</div>
                <div className="text-3xl font-bold text-green-500">
                  {stats.avgReduction}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Control effectiveness
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Risks</div>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.critical} critical
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                <TrendingUp className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-lg">
        {/* Top Riscos por Inherent */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Top 10 Riscos Inherentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {risks
                .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
                .slice(0, 10)
                .map((risk, idx) => {
                  const badge = getRiskBadge(risk.risk_score);
                  return (
                    <div
                      key={risk.id}
                      className="p-3 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/30 transition-all duration-base"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{risk.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {risk.category}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={badge.color}>
                            {risk.risk_score}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Top Riscos por Residual */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Top 10 Riscos Residuais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {risks
                .sort((a, b) => (b.residual_risk_score || b.risk_score || 0) - (a.residual_risk_score || a.risk_score || 0))
                .slice(0, 10)
                .map((risk, idx) => {
                  const residual = risk.residual_risk_score || risk.risk_score;
                  const reduction = risk.risk_score > 0
                    ? (((risk.risk_score - residual) / risk.risk_score) * 100).toFixed(0)
                    : 0;
                  const badge = getRiskBadge(residual);
                  
                  return (
                    <div
                      key={risk.id}
                      className="p-3 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/30 transition-all duration-base"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{risk.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{risk.risk_score}</span>
                              <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                              <span className="text-green-500">{residual}</span>
                              {reduction > 0 && (
                                <span className="text-green-500">(-{reduction}%)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={badge.color}>
                            {residual}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis of Effectiveness */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Analysis of Effectiveness of Controles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Comparison Chart */}
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">Inherent Risk Medium</div>
                <div className="h-4 rounded-full bg-red-500/20 overflow-hidden border border-red-500/30">
                  <div
                    className="h-full bg-red-500 transition-all duration-slow"
                    style={{ width: `${(stats.avgInherent / 25) * 100}%` }}
                  />
                </div>
                <div className={cn("text-lg font-bold", getRiskColor(stats.avgInherent))}>
                  {stats.avgInherent}
                </div>
              </div>

              <ArrowRight className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />

              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">Residual Risk Medium</div>
                <div className="h-4 rounded-full bg-green-500/20 overflow-hidden border border-green-500/30">
                  <div
                    className="h-full bg-green-500 transition-all duration-slow"
                    style={{ width: `${(stats.avgResidual / 25) * 100}%` }}
                  />
                </div>
                <div className={cn("text-lg font-bold", getRiskColor(stats.avgResidual))}>
                  {stats.avgResidual}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground">Reduction</div>
                <div className="text-2xl font-bold text-green-500 mt-2">
                  -{stats.avgReduction}%
                </div>
              </div>
            </div>

            {/* Distribution */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
                <div className="text-xs text-muted-foreground">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{stats.medium}</div>
                <div className="text-xs text-muted-foreground">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.low}</div>
                <div className="text-xs text-muted-foreground">Low</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explanation of Model */}
      <Card className="shadow-elegant bg-muted/30">
        <CardHeader>
          <CardTitle>How the Risk Engine v2 Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="font-medium mb-2">1. Inherent Risk (Gross)</div>
            <code className="block p-3 bg-background rounded-lg border border-border font-mono text-xs">
              Inherent Risk = Likelihood × Impact
            </code>
            <p className="text-muted-foreground mt-2">
              The risk before any control is applied. Represents the pure organizational exposure.
            </p>
          </div>

          <div>
            <div className="font-medium mb-2">2. Residual Risk (Net)</div>
            <code className="block p-3 bg-background rounded-lg border border-border font-mono text-xs">
              Residual Risk = Inherent Risk × (1 - Control Effectiveness)
            </code>
            <p className="text-muted-foreground mt-2">
              The risk that remains after control application. This is the actual organizational risk.
            </p>
          </div>

          <div>
            <div className="font-medium mb-2">3. Control Effectiveness</div>
            <code className="block p-3 bg-background rounded-lg border border-border font-mono text-xs">
              Reduction = ((Inherent - Residual) / Inherent) × 100%
            </code>
            <p className="text-muted-foreground mt-2">
              Risk reduction percentage. The higher, the more effective the controls.
            </p>
          </div>

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs">
              <strong>💡 Tip:</strong> A high residual risk indicates that the current controls are insufficient.
              Consider implementing additional controls or formally accepting the risk.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


