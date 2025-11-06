import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, UserPlus, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AlertDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAlert()
  }, [id])

  const fetchAlert = async () => {
    try {
      const response = await fetch(`/api/alerts/${id}`)
      const data = await response.json()
      setAlert(data)
    } catch (error) {
      console.error('Error ao buscar alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/alerts/${id}/acknowledge`, {
        method: 'PATCH',
      })
      const updated = await response.json()
      setAlert(updated)
    } catch (error) {
      console.error('Error ao confirmar:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolve = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/alerts/${id}/resolve`, {
        method: 'PATCH',
      })
      const updated = await response.json()
      setAlert(updated)
    } catch (error) {
      console.error('Error ao resolver:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <XCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-muted-foreground">Alerta não encontrado</div>
        <Button onClick={() => navigate('/soc/alerts')}>Back</Button>
      </div>
    )
  }

  const severityColors = {
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    info: 'bg-muted/300/10 text-muted-foreground border-gray-500/20',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/soc/alerts')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Alert Details</h1>
            <p className="text-sm text-muted-foreground">
              ID: {alert.id?.substring(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {alert.status === 'open' && (
            <>
              <Button
                variant="outline"
                onClick={handleAcknowledge}
                disabled={actionLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
              <Button
                variant="default"
                onClick={handleResolve}
                disabled={actionLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolver
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alert Info */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Title & Severity */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{alert.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {alert.description}
              </p>
            </div>
            <Badge className={severityColors[alert.severity]}>
              {alert.severity?.toUpperCase()}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <div className="text-xs text-muted-foreground">Fonte</div>
              <div className="font-medium">{alert.source}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge variant="outline">{alert.status}</Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Rule ID</div>
              <div className="font-mono text-sm">{alert.rule_id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Created at</div>
              <div className="text-sm">
                {new Date(alert.created_at).toLocaleString('en-US')}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {(alert.acknowledged_at || alert.resolved_at) && (
            <div className="pt-4 border-t space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-2 ml-6">
                {alert.acknowledged_at && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Confirmado:</span>{' '}
                    {new Date(alert.acknowledged_at).toLocaleString('en-US')}
                  </div>
                )}
                {alert.resolved_at && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Resolvido:</span>{' '}
                    {new Date(alert.resolved_at).toLocaleString('en-US')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Data */}
          {alert.raw_data && (
            <details className="pt-4 border-t">
              <summary className="cursor-pointer font-medium">
                Dados Brutos (JSON)
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(alert.raw_data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </Card>
    </div>
  )
}


