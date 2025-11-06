import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Activity, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ProblemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchProblem()
  }, [id])

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${id}`)
      const data = await response.json()
      setProblem(data)
    } catch (error) {
      console.error('Erro ao buscar problema:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/problems/${id}/acknowledge`, {
        method: 'PATCH',
      })
      const updated = await response.json()
      setProblem(updated)
    } catch (error) {
      console.error('Erro ao confirmar:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <XCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-muted-foreground">Problema não encontrado</div>
        <Button onClick={() => navigate('/noc/problems')}>Voltar</Button>
      </div>
    )
  }

  const severityColors = {
    disaster: 'bg-red-600/10 text-red-600 border-red-600/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    average: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    warning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    info: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/noc/problems')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Detalhes do Problema</h1>
            <p className="text-sm text-muted-foreground">
              ID: {problem.id?.substring(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {problem.status === 'active' && !problem.acknowledged_at && (
            <Button
              variant="outline"
              onClick={handleAcknowledge}
              disabled={actionLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          )}
        </div>
      </div>

      {/* Problem Info */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Title & Severity */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{problem.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {problem.description}
              </p>
            </div>
            <Badge className={severityColors[problem.severity]}>
              {problem.severity?.toUpperCase()}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <div className="text-xs text-muted-foreground">Fonte</div>
              <div className="font-medium">{problem.source}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge variant="outline">{problem.status}</Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Source ID</div>
              <div className="font-mono text-sm">{problem.source_id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Criado em</div>
              <div className="text-sm">
                {new Date(problem.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {problem.acknowledged_at && (
            <div className="pt-4 border-t space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-2 ml-6">
                <div className="text-sm">
                  <span className="text-muted-foreground">Confirmado:</span>{' '}
                  {new Date(problem.acknowledged_at).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          )}

          {/* Raw Data */}
          {problem.raw_data && (
            <details className="pt-4 border-t">
              <summary className="cursor-pointer font-medium">
                Dados Brutos (JSON)
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(problem.raw_data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </Card>
    </div>
  )
}


