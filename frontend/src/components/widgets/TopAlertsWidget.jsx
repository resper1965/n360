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
      console.error('Error buscar top alerts:', error)
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
    <Card>
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
            Top 5 Alertas
          </h3>
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground opacity-50" strokeWidth={1.5} />
        </div>
      </div>
      <div className="px-6 pb-6">
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading...</div>
        ) : alerts.length === 0 ? (
          <div className="text-xs text-muted-foreground opacity-70">No alert recente</div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-base cursor-pointer group"
                onClick={() => window.location.href = `/soc/alerts/${alert.id}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted border border-border/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{alert.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(alert.created_at).toLocaleDateString('en-US')}
                    </div>
                  </div>
                </div>
                <Badge variant={severityColors[alert.severity]} className="ml-2 text-xs border">
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

