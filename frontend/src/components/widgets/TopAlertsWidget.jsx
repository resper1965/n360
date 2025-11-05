import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TopAlertsWidget() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopAlerts()
  }, [])

  const fetchTopAlerts = async () => {
    try {
      const response = await fetch('/api/alerts?limit=5&sort=severity&order=desc')
      const data = await response.json()
      setAlerts(data.data || [])
    } catch (error) {
      console.error('Erro ao buscar top alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const severityColors = {
    critical: 'destructive',
    high: 'default',
    medium: 'secondary',
    low: 'outline',
    info: 'outline',
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          Top 5 Alertas
        </h3>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : alerts.length === 0 ? (
        <div className="text-sm text-muted-foreground">Nenhum alerta recente</div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = `/soc/alerts/${alert.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{alert.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <Badge variant={severityColors[alert.severity]} className="ml-2">
                {alert.severity}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

