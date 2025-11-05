import { useEffect, useState } from 'react'
import { Activity, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TopProblemsWidget() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopProblems()
  }, [])

  const fetchTopProblems = async () => {
    try {
      const response = await fetch('/api/problems?limit=5&status=active')
      const data = await response.json()
      setProblems(data.data || [])
    } catch (error) {
      console.error('Erro ao buscar top problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const severityColors = {
    disaster: 'destructive',
    high: 'default',
    average: 'secondary',
    warning: 'outline',
    info: 'outline',
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Top 5 Problemas
        </h3>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : problems.length === 0 ? (
        <div className="text-sm text-green-600">✅ Nenhum problema ativo</div>
      ) : (
        <div className="space-y-3">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = `/noc/problems/${problem.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{problem.name}</div>
                <div className="text-xs text-muted-foreground">
                  {problem.source} • {new Date(problem.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <Badge variant={severityColors[problem.severity]} className="ml-2">
                {problem.severity}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

