/**
 * Executive Dashboard
 * Dashboard executivo para C-level com KPIs, heatmap e narrativa
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ExportPDFButton from '@/components/ExportPDFButton';

export function ExecutiveDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  async function fetchExecutiveData() {
    try {
      // Fetch de múltiplas APIs
      const [risksRes, complianceRes, incidentsRes, controlsRes] = await Promise.all([
        fetch(`${window.location.origin}/api/risks`),
        fetch(`${window.location.origin}/api/compliance/overall`),
        fetch(`${window.location.origin}/api/incidents`),
        fetch(`${window.location.origin}/api/controls`)
      ]);

      const risks = risksRes.ok ? (await risksRes.json()).data || [] : [];
      const compliance = complianceRes.ok ? (await complianceRes.json()).data : null;
      const incidents = incidentsRes.ok ? (await incidentsRes.json()).data || [] : [];
      const controls = controlsRes.ok ? (await controlsRes.json()).data || [] : [];

      setData({
        risks,
        compliance,
        incidents,
        controls
      });
    } catch (error) {
      console.error('Error fetching executive data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" strokeWidth={1.5} />
          <div className="text-sm text-muted-foreground">Carregando dashboard executivo...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-muted-foreground p-8">Error loading dados</div>;
  }

  // Calcular KPIs
  const totalRisks = data.risks.length;
  const criticalRisks = data.risks.filter(r => r.risk_score >= 16).length;
  const openIncidents = data.incidents.filter(i => i.status === 'open').length;
  const controlEffectiveness = data.controls.length > 0
    ? ((data.controls.filter(c => c.status === 'effective').length / data.controls.length) * 100).toFixed(1)
    : 0;

  // Top 5 Risks para narrativa
  const topRisks = [...data.risks]
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, 5);

  // Risk Heatmap Data (5x5)
  const heatmapData = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];

  data.risks.forEach(risk => {
    const likelihood = Math.min(risk.likelihood || 1, 5);
    const impact = Math.min(risk.impact || 1, 5);
    heatmapData[5 - impact][likelihood - 1]++;
  });

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão executiva de risks, compliance e incidentes
          </p>
        </div>
        <ExportPDFButton
          endpoint="/api/reports/executive-pdf"
          filename={`executive-summary-${new Date().toISOString().split('T')[0]}.pdf`}
          label="Export PDF"
          variant="primary"
        />
      </div>

      {/* KPIs Executivos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-grid-md">
        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Riscos Críticos</div>
                <div className="text-3xl font-bold text-red-500 mt-2">{criticalRisks}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  de {totalRisks} totais
                </div>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Compliance Score</div>
                <div className="text-3xl font-bold text-green-500 mt-2">
                  {data.compliance?.overall_score || 75}%
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
                  +5% este mês
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Shield className="h-6 w-6 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Incidentes Abertos</div>
                <div className="text-3xl font-bold text-yellow-500 mt-2">{openIncidents}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  requerem atenção
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <AlertTriangle className="h-6 w-6 text-yellow-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Controles Efetivos</div>
                <div className="text-3xl font-bold text-green-500 mt-2">{controlEffectiveness}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data.controls.length} controles
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Heatmap + Narrativa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-lg">
        {/* Risk Heatmap Interactive */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Mapa de Calor de Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2 text-xs">
                <div></div>
                <div className="text-center font-medium">1</div>
                <div className="text-center font-medium">2</div>
                <div className="text-center font-medium">3</div>
                <div className="text-center font-medium">4</div>
                <div className="text-center font-medium">5</div>
              </div>
              
              {heatmapData.map((row, i) => (
                <div key={i} className="grid grid-cols-6 gap-2">
                  <div className="text-xs font-medium flex items-center justify-center">
                    {5 - i}
                  </div>
                  {row.map((count, j) => {
                    const score = (5 - i) * (j + 1);
                    let bgColor = 'bg-muted';
                    if (score >= 20) bgColor = 'bg-red-500';
                    else if (score >= 15) bgColor = 'bg-orange-500';
                    else if (score >= 6) bgColor = 'bg-yellow-500';
                    else if (score >= 3) bgColor = 'bg-blue-500';

                    return (
                      <div
                        key={j}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-white font-semibold text-sm cursor-pointer transition-all hover:scale-110",
                          bgColor,
                          count === 0 && "opacity-30"
                        )}
                        title={`${count} risk(s) - ${score} pontos`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="flex items-center gap-2 text-xs mt-4 pt-4 border-t border-border">
                <span>Probabilidade →</span>
                <div className="flex-1"></div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span>Baixo</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span>Médio</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span>Alto</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span>Crítico</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Risks - Narrativa Executiva */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Top 5 Riscos - Narrativa Executiva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topRisks.length > 0 ? (
              topRisks.map((risk, idx) => {
                const badge = risk.risk_score >= 16 ? { label: 'Crítico', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
                  : risk.risk_score >= 12 ? { label: 'Alto', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' }
                  : { label: 'Médio', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };

                return (
                  <div key={risk.id} className="p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{risk.name}</h4>
                          <Badge variant="outline" className={badge.color}>
                            {badge.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {risk.description || 'Descrição não disponível'}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span>Probabilidade: {risk.likelihood || 'N/A'}/5</span>
                          <span>Impacto: {risk.impact || 'N/A'}/5</span>
                          <span className="font-semibold">Score: {risk.risk_score || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No risk registered
              </p>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>💡 Recomendação Executiva:</strong> Priorizar mitigação dos {criticalRisks} risks 
                critical através da implementação de controles adicionais e revisão de políticas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary Card */}
      <Card className="shadow-elegant bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="font-medium mb-2">🎯 Status Geral de Segurança</div>
            <p className="text-muted-foreground">
              A organização mantém uma postura de conformidade de <strong>{data.compliance?.overall_score || 75}%</strong>, 
              com {totalRisks} risks identificados, dos quais {criticalRisks} são considerados critical 
              e requerem atenção imediata da liderança.
            </p>
          </div>

          <div>
            <div className="font-medium mb-2">⚠️ Principais Preocupações</div>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>{criticalRisks} risks critical identificados que podem impactar operações</li>
              <li>{openIncidents} incidentes de segurança em investigação</li>
              <li>Efetividade de controles em {controlEffectiveness}% (meta: 90%)</li>
            </ul>
          </div>

          <div>
            <div className="font-medium mb-2">✅ Ações Recomendadas</div>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>Revisar e mitigar os {criticalRisks} risks critical identificados</li>
              <li>Implementar controles adicionais para risks residuais altos</li>
              <li>Acelerar resolução dos {openIncidents} incidentes open</li>
              <li>Investir em treinamento de segurança para reduzir risks de erro humano</li>
            </ol>
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs">
              <strong>📊 Próxima Revisão:</strong> Este relatório deve ser revisado mensalmente 
              pelo Comitê de Segurança. Export em PDF disponível para distribuição.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


