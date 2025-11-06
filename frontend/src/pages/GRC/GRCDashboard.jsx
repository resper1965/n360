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
      console.error('Error loading dashboard GRC:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (score) => {
    if (score >= 20) return { label: "Critical", color: 'destructive' }
    if (score >= 15) return { label: 'Alto', color: 'default' }
    if (score >= 6) return { label: 'Medium', color: 'secondary' }
    return { label: 'Baixo', color: 'outline' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-lg">Loading dashboard GRC...</div>
      </div>
    )
  }

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-medium tracking-tight">Dashboard GRC</h1>
        <p className="text-sm text-muted-foreground">
          Governance, Risk & Compliance - Visão executiva
        </p>
      </div>

      {/* KPI Cards - Elegant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid-lg">
        {/* Compliance Score Medium */}
        <Card className="group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                <Shield className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-medium tracking-tight">
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
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Compliance Score
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Average compliance
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Risk Score */}
        <Card className="group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                <AlertTriangle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-medium tracking-tight">
                {data.risks.length > 0
                  ? Math.round(
                      data.risks.reduce((acc, r) => acc + (r.risk_score || 0), 0) /
                        data.risks.length
                    )
                  : 0}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Risk Score
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                {data.risks.filter((r) => r.status === 'open').length} risks open
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Policies */}
        <Card className="group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-medium tracking-tight">
                {data.policies.length}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Active Policies
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Documentos em vigência
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles Pending */}
        <Card className="group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                <Activity className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-medium tracking-tight">
                {data.controls.length}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Controles Pending
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Não implementados
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Elegant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-grid-md">
        <Button
          variant="outline"
          className="h-20 group border-border/50 hover:border-primary/20 transition-all duration-base"
          onClick={() => navigate('/grc/risks/matrix')}
        >
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
            <span className="text-sm font-medium">Matriz Risk</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-20 group border-border/50 hover:border-primary/20 transition-all duration-base"
          onClick={() => navigate('/grc/risks')}
        >
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
            <span className="text-sm font-medium">Gestão Risk</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-20 group border-border/50 hover:border-primary/20 transition-all duration-base"
          onClick={() => navigate('/grc/controls')}
        >
          <div className="flex flex-col items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
            <span className="text-sm font-medium">Controles</span>
          </div>
        </Button>
      </div>

      {/* Main Content Grid - Elegant Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-lg">
        {/* Compliance Score por Framework */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              Compliance Score por Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.complianceScores.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                <p className="text-sm">No framework configurado</p>
                <Button
                  variant="outline"
                  className="mt-4 border-border/50"
                  onClick={() => navigate('/grc/controls')}
                >
                  Cadastrar Controles
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.complianceScores.map((score) => (
                  <div key={score.framework} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{score.framework}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {score.implemented_controls}/{score.total_controls} controles implementados
                        </div>
                      </div>
                      <div className="text-xl font-medium tracking-tight ml-4">
                        {Math.round(score.compliance_percentage || 0)}%
                      </div>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/50">
                      <div
                        className="h-full bg-primary transition-all duration-slow ease-elegant"
                        style={{
                          width: `${Math.min(100, score.compliance_percentage || 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Risks */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              Top 5 Critical Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.risks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                <p className="text-sm">No risk registered</p>
                <Button
                  variant="outline"
                  className="mt-4 border-border/50"
                  onClick={() => navigate('/grc/risks')}
                >
                  Cadastrar Riscos
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {data.risks.map((risk, index) => {
                  const level = getRiskLevel(risk.risk_score)
                  return (
                    <div
                      key={risk.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-base cursor-pointer group"
                      onClick={() => navigate(`/grc/risks/${risk.id}`)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border border-border/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="font-medium text-sm truncate">{risk.title}</div>
                            <Badge variant={level.color} className="text-xs">{level.label}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {risk.category} • {risk.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-medium tracking-tight">{risk.risk_score}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wiof mt-0.5">
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
    </div>
  )
}

