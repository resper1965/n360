import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, CheckCircle, Ticket, TrendingUp } from 'lucide-react'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import TopAlertsWidget from '../../components/widgets/TopAlertsWidget'
import TopProblemsWidget from '../../components/widgets/TopProblemsWidget'
import { PostureScoreWidget } from '../../components/widgets/PostureScoreWidget'

export default function CISODashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
    const interval = setInterval(loadDashboard, 60000) // Refresh a cada 60s
    return () => clearInterval(interval)
  }, [])

  async function loadDashboard() {
    try {
      const response = await api.get('/api/dashboard/ciso')
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      // Dados mockados para demonstração
      setData({
        summary: {
          avg_risk_score: 0,
          open_risks: 0,
          avg_compliance: 0,
          critical_alerts: 0,
          critical_problems: 0,
          open_tickets: 0
        },
        topRisks: [],
        criticalAlerts: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-grid-xl">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid-lg">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                  <div className="pt-4 border-t">
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-lg">
          <div className="lg:col-span-2 space-y-grid-lg">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-grid-lg">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const { summary } = data

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-medium tracking-tight">Dashboard CISO</h1>
        <p className="text-sm text-muted-foreground">Visão executiva da postura de segurança</p>
      </div>

      {/* KPI Cards - Elegant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid-lg">
        {/* Risk Score */}
        <Card className="group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                <AlertTriangle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-medium tracking-tight">
                {Math.round(summary.avg_risk_score || 0)}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk Score</div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                {summary.open_risks || 0} riscos abertos
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card className="group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                <Shield className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-medium tracking-tight">
                {Math.round(summary.avg_compliance || 0)}%
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Compliance</div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Média de conformidade
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas Críticos */}
        <Card className="group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                <AlertTriangle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-medium tracking-tight">
                {summary.critical_alerts || 0}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alertas Críticos</div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Últimas 24 horas
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Abertos */}
        <Card className="group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                <Ticket className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-medium tracking-tight">
                {summary.open_tickets || 0}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tickets Abertos</div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Em progresso e pendentes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Elegant Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-lg">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-grid-lg">
          {/* Top Riscos */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                Top 5 Riscos Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topRisks?.length > 0 ? (
                <div className="space-y-2">
                  {data.topRisks.map((risk, index) => (
                    <div 
                      key={risk.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-base group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border border-border/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{risk.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{risk.category}</div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-medium tracking-tight">{risk.risk_score}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">{risk.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                  <p className="text-sm">Nenhum risco cadastrado</p>
                  <p className="text-xs mt-1 opacity-70">Configure riscos no módulo GRC</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alertas Críticos Recentes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                Alertas Críticos (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.criticalAlerts?.length > 0 ? (
                <div className="space-y-2">
                  {data.criticalAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-base"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{alert.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {alert.source} • {new Date(alert.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          alert.severity === 'critical' 
                            ? 'bg-muted/50 border-red-500/20 text-red-400' 
                            : 'bg-muted/50 border-orange-500/20 text-orange-400'
                        }`}>
                          {alert.severity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                  <p className="text-sm">Nenhum alerta crítico nas últimas 24 horas</p>
                  <p className="text-xs mt-1 opacity-70">Sistema operando normalmente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-grid-lg">
          <TopAlertsWidget />
          <TopProblemsWidget />
          <PostureScoreWidget />
        </div>
      </div>
    </div>
  )
}

