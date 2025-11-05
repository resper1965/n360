import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, CheckCircle, Ticket, TrendingUp } from 'lucide-react'
import api from '../../lib/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'

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
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-lg">Carregando dashboard...</div>
      </div>
    )
  }

  const { summary } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard CISO</h1>
        <p className="text-muted-foreground mt-1">Visão executiva da postura de segurança</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Risk Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="text-red-500 h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {Math.round(summary.avg_risk_score || 0)}
                </div>
                <div className="text-xs text-muted-foreground uppercase mt-1">Risk Score</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              {summary.open_risks || 0} riscos abertos
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Shield className="text-green-500 h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {Math.round(summary.avg_compliance || 0)}%
                </div>
                <div className="text-xs text-muted-foreground uppercase mt-1">Compliance</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              Média de conformidade
            </div>
          </CardContent>
        </Card>

        {/* Alertas Críticos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="text-orange-500 h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {summary.critical_alerts || 0}
                </div>
                <div className="text-xs text-muted-foreground uppercase mt-1">Alertas Críticos</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              Últimas 24 horas
            </div>
          </CardContent>
        </Card>

        {/* Tickets Abertos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Ticket className="text-primary h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {summary.open_tickets || 0}
                </div>
                <div className="text-xs text-muted-foreground uppercase mt-1">Tickets Abertos</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              Em progresso e pendentes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Riscos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top 5 Riscos Críticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topRisks?.length > 0 ? (
            <div className="space-y-3">
              {data.topRisks.map((risk) => (
                <div key={risk.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{risk.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{risk.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-500">{risk.risk_score}</div>
                    <div className="text-xs text-muted-foreground">{risk.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum risco cadastrado</p>
              <p className="text-sm mt-2">Configure riscos no módulo GRC</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas Críticos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas Críticos (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.criticalAlerts?.length > 0 ? (
            <div className="space-y-3">
              {data.criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {alert.source} • {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'critical' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {alert.severity}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
              <p>Nenhum alerta crítico nas últimas 24 horas</p>
              <p className="text-sm mt-2">Sistema operando normalmente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

