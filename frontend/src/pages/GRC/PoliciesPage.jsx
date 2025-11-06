import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Search, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function PoliciesPage() {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchPolicies()
  }, [page, filters])

  const fetchPolicies = async () => {
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v && v !== 'all')
        ),
      })

      const response = await fetch(`/api/policies?${params}`)
      const data = await response.json()
      setPolicies(data.data || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Error buscar policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusLabels = {
    draft: 'Rascunho',
    review: 'Under Review',
    approved: 'Aprovada',
    active: 'Ativa',
    archived: 'Arquivada',
  }

  const statusColors = {
    draft: 'secondary',
    review: 'default',
    approved: 'outline',
    active: 'outline',
    archived: 'outline',
  }

  const categoryLabels = {
    security: 'Segurança',
    privacy: 'Privacidade',
    compliance: 'Conformidade',
    operational: 'Operacional',
    hr: 'RH',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Policies
          </h1>
          <p className="text-muted-foreground mt-1">
            Policy management and organizational procedures
          </p>
        </div>
        <Button onClick={() => navigate('/grc/policies/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Policy
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search policies..."
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
            <option value="draft">Rascunho</option>
            <option value="review">Under Review</option>
            <option value="approved">Aprovada</option>
            <option value="active">Ativa</option>
            <option value="archived">Arquivada</option>
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
            <option value="security">Security</option>
            <option value="privacy">Privacidade</option>
            <option value="compliance">Conformidade</option>
            <option value="operational">Operacional</option>
            <option value="hr">RH</option>
          </select>
        </div>
      </Card>

      {/* Policy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Políticas</div>
          <div className="text-2xl font-bold">{pagination.total || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-2xl font-bold text-green-500">
            {policies.filter((p) => p.status === 'active').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Under Review</div>
          <div className="text-2xl font-bold text-yellow-500">
            {policies.filter((p) => p.status === 'review').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Drafts</div>
          <div className="text-2xl font-bold">
            {policies.filter((p) => p.status === 'draft').length}
          </div>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            Loading policies...
          </div>
        ) : policies.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No policies found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/grc/policies/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Register First Policy
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/grc/policies/${policy.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusColors[policy.status]}>
                        {statusLabels[policy.status]}
                      </Badge>
                      <Badge variant="outline">
                        {categoryLabels[policy.category]}
                      </Badge>
                      {policy.framework && (
                        <Badge variant="outline">{policy.framework}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        v{policy.version}
                      </span>
                    </div>
                    <h3 className="font-semibold">{policy.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {policy.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {policy.effective_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Effective: {new Date(policy.effective_date).toLocaleDateString('en-US')}
                        </div>
                      )}
                      {policy.review_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Review: {new Date(policy.review_date).toLocaleDateString('en-US')}
                        </div>
                      )}
                      <div>
                        Criada: {new Date(policy.created_at).toLocaleDateString('en-US')}
                      </div>
                    </div>
                  </div>
                  {policy.status === 'active' && (
                    <div className="ml-4">
                      <div className="flex items-center gap-1 text-green-600">
                        <FileText className="h-5 w-5" />
                        <span className="text-xs font-medium">ATIVA</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total}{' '}
              policies)
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


