/**
 * Compliance & SoA Page
 * Statement of Applicability e Relatórios Compliance
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileCheck, 
  Download,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ExportPDFButton from '@/components/ExportPDFButton';

export function CompliancePage() {
  const [complianceData, setComplianceData] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompliance();
  }, []);

  async function fetchCompliance() {
    try {
      // Fetch compliance data from API
      const res = await fetch(`${window.location.origin}/api/compliance/overall`);
      if (res.ok) {
        const data = await res.json();
        setComplianceData(data.data?.frameworks || []);
        setOverallScore(data.data?.overall_score || 0);
      }
    } catch (error) {
      console.error('Error fetching compliance:', error);
      // Mock data para demonstração
      setComplianceData([
        {
          framework: 'ISO 27001:2022',
          total_requirements: 114,
          compliant: 85,
          partially_compliant: 18,
          not_compliant: 11,
          score: 74.6,
          controls_mapped: 92
        },
        {
          framework: 'LGPD',
          total_requirements: 42,
          compliant: 35,
          partially_compliant: 5,
          not_compliant: 2,
          score: 83.3,
          controls_mapped: 38
        },
        {
          framework: 'NIST CSF 2.0',
          total_requirements: 108,
          compliant: 65,
          partially_compliant: 28,
          not_compliant: 15,
          score: 60.2,
          controls_mapped: 78
        },
        {
          framework: 'CIS Controls v8',
          total_requirements: 153,
          compliant: 98,
          partially_compliant: 35,
          not_compliant: 20,
          score: 64.1,
          controls_mapped: 115
        }
      ]);
      setOverallScore(70.5);
    } finally {
      setLoading(false);
    }
  }

  const filteredData = selectedFramework === 'all' 
    ? complianceData 
    : complianceData.filter(f => f.framework === selectedFramework);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return { label: 'Excelente', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    if (score >= 70) return { label: 'Bom', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    return { label: 'Requires Attention', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
  };

  const exportSoA = (framework) => {
    alert(`Exportando SoA para ${framework || 'todos frameworks'}...`);
    // TODO: Implementar export para PDF/Excel
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <FileCheck className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" strokeWidth={1.5} />
          <div className="text-sm text-muted-foreground">Calculando conformidade...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Statement of Applicability e Postura Compliance
          </p>
        </div>
        <ExportPDFButton
          endpoint="/api/reports/soa-pdf"
          filename={`soa-${new Date().toISOString().split('T')[0]}.pdf`}
          label="Export SoA (PDF)"
          variant="outline"
        />
      </div>

      {/* Overall Score */}
      <Card className="shadow-elegant bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Score Geral Compliance</div>
              <div className={cn("text-5xl font-bold", getScoreColor(overallScore))}>
                {overallScore}%
              </div>
              <Badge variant="outline" className={cn("mt-3", getScoreBadge(overallScore).color)}>
                {getScoreBadge(overallScore).label}
              </Badge>
            </div>
            <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20">
              <Shield className="h-16 w-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Framework Selector */}
      <div className="flex gap-2 flex-wrap">
        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer transition-all px-4 py-2",
            selectedFramework === 'all' && "bg-primary text-primary-foreground border-primary"
          )}
          onClick={() => setSelectedFramework('all')}
        >
          All Frameworks
        </Badge>
        {complianceData.map((f) => (
          <Badge
            key={f.framework}
            variant="outline"
            className={cn(
              "cursor-pointer transition-all px-4 py-2",
              selectedFramework === f.framework && "bg-primary text-primary-foreground border-primary"
            )}
            onClick={() => setSelectedFramework(f.framework)}
          >
            {f.framework}
          </Badge>
        ))}
      </div>

      {/* Compliance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-lg">
        {filteredData.map((framework) => {
          const scoreBadge = getScoreBadge(framework.score);
          const complianceRate = ((framework.compliant / framework.total_requirements) * 100).toFixed(1);
          
          return (
            <Card key={framework.framework} className="shadow-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{framework.framework}</CardTitle>
                  <button
                    onClick={() => exportSoA(framework.framework)}
                    className="flex items-center gap-1 px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Download className="h-3 w-3" strokeWidth={1.5} />
                    SoA
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score Principal */}
                <div className="text-center p-4 rounded-lg bg-muted/30 border border-border">
                  <div className={cn("text-4xl font-bold", getScoreColor(framework.score))}>
                    {framework.score}%
                  </div>
                  <Badge variant="outline" className={cn("mt-2", scoreBadge.color)}>
                    {scoreBadge.label}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" strokeWidth={1.5} />
                      <span className="text-xs text-muted-foreground">Conforme</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500">{framework.compliant}</div>
                  </div>

                  <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" strokeWidth={1.5} />
                      <span className="text-xs text-muted-foreground">Parcial</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-500">{framework.partially_compliant}</div>
                  </div>

                  <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <XCircle className="h-4 w-4 text-red-500" strokeWidth={1.5} />
                      <span className="text-xs text-muted-foreground">Não Conforme</span>
                    </div>
                    <div className="text-2xl font-bold text-red-500">{framework.not_compliant}</div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Taxa Compliance</span>
                    <span className="font-semibold">{complianceRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden border border-border">
                    <div 
                      className="h-full bg-green-500 transition-all duration-slow"
                      style={{ width: `${complianceRate}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Controles Mapeados</span>
                    <span className="font-semibold">
                      {framework.controls_mapped} / {framework.total_requirements}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden border border-border">
                    <div 
                      className="h-full bg-primary transition-all duration-slow"
                      style={{ 
                        width: `${(framework.controls_mapped / framework.total_requirements) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="pt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Total Requisitos</span>
                    <span className="font-semibold">{framework.total_requirements}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommended Actions */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" strokeWidth={1.5} />
            Next Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceData
              .filter(f => f.not_compliant > 0)
              .sort((a, b) => b.not_compliant - a.not_compliant)
              .map((framework, idx) => (
                <div 
                  key={framework.framework}
                  className="p-3 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{framework.framework}</div>
                        <div className="text-xs text-muted-foreground">
                          {framework.not_compliant} requisitos não conformes require attention
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                      {framework.not_compliant} gaps
                    </Badge>
                  </div>
                </div>
              ))}
            
            {complianceData.every(f => f.not_compliant === 0) && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" strokeWidth={1.5} />
                <div className="font-medium">Excellent!</div>
                <div className="text-sm text-muted-foreground">
                  No non-compliant requirements pending.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="shadow-elegant bg-muted/30">
        <CardHeader>
          <CardTitle>About Statement of Applicability (SoA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <div className="font-medium mb-1">📋 What is SoA?</div>
            <p className="text-muted-foreground">
              Document required by ISO 27001 that lists all security controls of security, 
              indicating which are applicable and their justification.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1">🎯 How is it calculated?</div>
            <code className="block p-3 bg-background rounded-lg border border-border font-mono text-xs mt-2">
              Score = (Conformes × 1.0 + Parciais × 0.5) / Total Requisitos
            </code>
          </div>
          <div>
            <div className="font-medium mb-1">📊 Status Compliance</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Conforme: Control implemented and effective
              </Badge>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                Parcial: Controle implementado mas not 100% effective
              </Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                Não Conforme: Controle not implemented or failed
              </Badge>
            </div>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs">
              <strong>💡 Tip:</strong> Exporte o SoA em PDF para auditorias formais. 
              O documento incluirá todos os controles mapeados e suas evidências.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


