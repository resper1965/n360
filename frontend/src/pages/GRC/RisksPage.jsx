import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Plus, Search, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function RisksPage() {
  const navigate = useNavigate()
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    severity: 'all',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchRisks()
  }, [page, filters])

  const fetchRisks = async () => {
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v && v !== 'all')
        ),
      })

      const response = await fetch(`/api/risks?${params}`)
      const data = await response.json()
      setRisks(data.data || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Error buscar risks:', error)
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

  const categoryLabels = {
    operational: 'Operacional',
    financial: 'Financeiro',
    strategic: 'Estratégico',
    compliance: 'Conformidade',
    cyber: 'Cibernético',
    reputational: 'Reputação',
  }

  const statusLabels = {
    open: 'Open',
    mitigating: 'Mitigando',
    mitigated: 'Mitigado',
    accepted: 'Aceito',
    closed: 'Closed',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Risks
          </h1>
          <p className="text-muted-foreground mt-1">
            Organizational risk identification and mitigation
          </p>
        </div>
        <Button onClick={() => navigate('/grc/risks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Risk
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search risks..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 rounded-lg border bg-background"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">Todos os Status</option>
            <option value="open">Open</option>
            <option value="mitigating">Mitigando</option>
            <option value="mitigated">Mitigado</option>
            <option value="accepted">Aceito</option>
            <option value="closed">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            className="px-4 py-2 rounded-lg border bg-background"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="all">Todas as Categorias</option>
            <option value="operational">Operacional</option>
            <option value="financial">Financeiro</option>
            <option value="strategic">Strategic</option>
            <option value="compliance">Conformidade</option>
            <option value="cyber">Cyber</option>
            <option value="reputational">Reputation</option>
          </select>

          {/* Severity Filter */}
          <select
            className="px-4 py-2 rounded-lg border bg-background"
            value={filters.severity}
            onChange={(e) =>
              setFilters({ ...filters, severity: e.target.value })
            }
          >
            <option value="all">Todas as Severidades</option>
            <option value="critical">Crítico (20-25)</option>
            <option value="high">Alto (15-19)</option>
            <option value="medium">Medium (6-14)</option>
            <option value="low">Baixo (1-5)</option>
          </select>
        </div>
      </Card>

      {/* Risk Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Risks</div>
          <div className="text-2xl font-bold">{pagination.total || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Open Risks</div>
          <div className="text-2xl font-bold">
            {risks.filter((r) => r.status === 'open').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Critical Risks</div>
          <div className="text-2xl font-bold text-red-500">
            {risks.filter((r) => r.risk_score >= 20).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Average Risk Score</div>
          <div className="text-2xl font-bold">
            {risks.length > 0
              ? Math.round(
                  risks.reduce((acc, r) => acc + r.risk_score, 0) / risks.length
                )
              : 0}
          </div>
        </Card>
      </div>

      {/* Risks Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            Loading risks...
          </div>
        ) : risks.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No risks found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/grc/risks/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Register First Risk
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {risks.map((risk) => {
              const level = getRiskLevel(risk.risk_score)
              return (
                <div
                  key={risk.id}
                  className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/grc/risks/${risk.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{risk.title}</h3>
                        <Badge variant={level.color}>{level.label}</Badge>
                        <Badge variant="outline">
                          {categoryLabels[risk.category]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {risk.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div>
                          Status: <span className="font-medium">{statusLabels[risk.status]}</span>
                        </div>
                        <div>
                          Score: <span className="font-medium">{risk.risk_score}</span>
                        </div>
                        <div>
                          Likelihood: <span className="font-medium">{risk.likelihood}</span> | 
                          Impact: <span className="font-medium">{risk.impact}</span>
                        </div>
                        <div>
                          Created: {new Date(risk.created_at).toLocaleDateString('en-US')}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-3xl font-bold">{risk.risk_score}</div>
                      <div className="text-xs text-muted-foreground">
                        {risk.likelihood} × {risk.impact}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total}{' '}
              risks)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}


