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
    <Card>
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
            <Activity className="h-3.5 w-3.5" strokeWidth={1.5} />
            Top 5 Problemas
          </h3>
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground opacity-50" strokeWidth={1.5} />
        </div>
      </div>
      <div className="px-6 pb-6">
        {loading ? (
          <div className="text-xs text-muted-foreground">Carregando...</div>
        ) : problems.length === 0 ? (
          <div className="text-xs text-muted-foreground opacity-70">Nenhum problema ativo</div>
        ) : (
          <div className="space-y-2">
            {problems.map((problem, index) => (
              <div
                key={problem.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-base cursor-pointer group"
                onClick={() => window.location.href = `/noc/problems/${problem.id}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted border border-border/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{problem.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {problem.source} • {new Date(problem.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <Badge variant={severityColors[problem.severity]} className="ml-2 text-xs border">
                  {problem.severity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

