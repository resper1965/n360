import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, AlertTriangle, FileText, TrendingUp, Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function GRCDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    risks: [],
    controls: [],
    policies: [],
    complianceScores: [],
  })

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // Fetch parallel
      const [risksRes, controlsRes, policiesRes, complianceRes] = await Promise.all([
        fetch('/api/risks?limit=5&sort=risk_score&order=desc'),
        fetch('/api/controls?limit=5&status=not_implemented'),
        fetch('/api/policies?limit=5&status=active'),
        fetch('/api/controls/compliance/score'),
      ])

      const [risksData, controlsData, policiesData, complianceData] = await Promise.all([
        risksRes.json(),
        controlsRes.json(),
        policiesRes.json(),
        complianceRes.json(),
      ])

      setData({
        risks: risksData.data || [],
        controls: controlsData.data || [],
        policies: policiesData.data || [],
        complianceScores: complianceData.data || [],
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard GRC:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (score) => {
    if (score >= 20) return { label: 'Crítico', color: 'destructive' }
    if (score >= 15) return { label: 'Alto', color: 'default' }
    if (score >= 6) return { label: 'Médio', color: 'secondary' }
    return { label: 'Baixo', color: 'outline' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-lg">Carregando dashboard GRC...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard GRC</h1>
        <p className="text-muted-foreground mt-1">
          Governance, Risk & Compliance - Visão executiva
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Compliance Score Médio */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Shield className="text-green-500 h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {data.complianceScores.length > 0
                    ? Math.round(
                        data.complianceScores.reduce(
                          (acc, s) => acc + (s.compliance_percentage || 0),
                          0
                        ) / data.complianceScores.length
                      )
                    : 0}
                  %
                </div>
                <div className="text-xs text-muted-foreground uppercase mt-1">
                  Compliance Score
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              Média de conformidade
            </div>
          </CardContent>
        </Card>

        {/* Risk Score Médio */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="text-red-500 h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {data.risks.length > 0
                    ? Math.round(
                        data.risks.reduce((acc, r) => acc + (r.risk_score || 0), 0) /
                          data.risks.length
                      )
                    : 0}
                </div>
                <div className="text-xs text-muted-foreground uppercase mt-1">
                  Risk Score
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              {data.risks.filter((r) => r.status === 'open').length} riscos abertos
            </div>
          </CardContent>
        </Card>

        {/* Políticas Ativas */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="text-primary h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {data.policies.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase mt-1">
                  Políticas Ativas
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              Documentos em vigência
            </div>
          </CardContent>
        </Card>

        {/* Controles Pendentes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Activity className="text-orange-500 h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {data.controls.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase mt-1">
                  Controles Pendentes
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              Não implementados
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-20"
          onClick={() => navigate('/grc/risks/matrix')}
        >
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>Matriz de Riscos</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-20"
          onClick={() => navigate('/grc/risks')}
        >
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span>Gestão de Riscos</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-20"
          onClick={() => navigate('/grc/controls')}
        >
          <div className="flex flex-col items-center gap-2">
            <Shield className="h-6 w-6" />
            <span>Controles</span>
          </div>
        </Button>
      </div>

      {/* Compliance Score por Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance Score por Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.complianceScores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum framework configurado</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/grc/controls')}
              >
                Cadastrar Controles
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.complianceScores.map((score) => (
                <div key={score.framework} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{score.framework}</div>
                    <div className="text-sm text-muted-foreground">
                      {score.implemented_controls}/{score.total_controls} controles implementados
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-64 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(100, score.compliance_percentage || 0)}%`,
                        }}
                      />
                    </div>
                    <div className="text-2xl font-bold w-16 text-right">
                      {Math.round(score.compliance_percentage || 0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Top 5 Riscos Críticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.risks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum risco cadastrado</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/grc/risks')}
              >
                Cadastrar Riscos
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.risks.map((risk) => {
                const level = getRiskLevel(risk.risk_score)
                return (
                  <div
                    key={risk.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => navigate(`/grc/risks/${risk.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">{risk.title}</div>
                        <Badge variant={level.color}>{level.label}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {risk.category} • Status: {risk.status}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-3xl font-bold">{risk.risk_score}</div>
                      <div className="text-xs text-muted-foreground">
                        {risk.likelihood} × {risk.impact}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

