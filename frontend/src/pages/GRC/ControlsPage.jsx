import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Plus, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ControlsPage() {
  const navigate = useNavigate()
  const [controls, setControls] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    framework: 'all',
    status: 'all',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchControls()
  }, [page, filters])

  const fetchControls = async () => {
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v && v !== 'all')
        ),
      })

      const response = await fetch(`/api/controls?${params}`)
      const data = await response.json()
      setControls(data.data || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Error buscar controles:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusLabels = {
    not_implemented: 'Not Implemented',
    planned: 'Planejado',
    partial: 'Parcial',
    implemented: 'Implementado',
    verified: 'Verificado',
  }

  const statusColors = {
    not_implemented: 'destructive',
    planned: 'secondary',
    partial: 'default',
    implemented: 'outline',
    verified: 'outline',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Controls
          </h1>
          <p className="text-muted-foreground mt-1">
            Control management according to compliance frameworks
          </p>
        </div>
        <Button onClick={() => navigate('/grc/controls/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Control
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
              placeholder="Search controls..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          {/* Framework Filter */}
          <select
            className="px-4 py-2 rounded-lg border bg-background"
            value={filters.framework}
            onChange={(e) =>
              setFilters({ ...filters, framework: e.target.value })
            }
          >
            <option value="all">Todos os Frameworks</option>
            <option value="ISO 27001">ISO 27001</option>
            <option value="NIST CSF">NIST CSF</option>
            <option value="CIS">CIS Controls</option>
            <option value="PCI-DSS">PCI-DSS</option>
            <option value="LGPD">LGPD</option>
            <option value="SOC2">SOC 2</option>
          </select>

          {/* Status Filter */}
          <select
            className="px-4 py-2 rounded-lg border bg-background"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">Todos os Status</option>
            <option value="not_implemented">Not Implemented</option>
            <option value="planned">Planejado</option>
            <option value="partial">Parcial</option>
            <option value="implemented">Implementado</option>
            <option value="verified">Verificado</option>
          </select>
        </div>
      </Card>

      {/* Control Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Controles</div>
          <div className="text-2xl font-bold">{pagination.total || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Implemented</div>
          <div className="text-2xl font-bold text-green-500">
            {controls.filter((c) => c.status === 'implemented' || c.status === 'verified').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-500">
            {controls.filter((c) => c.status === 'not_implemented' || c.status === 'planned').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Average Compliance</div>
          <div className="text-2xl font-bold">
            {controls.length > 0
              ? Math.round(
                  (controls.filter((c) => c.status === 'implemented' || c.status === 'verified').length /
                    controls.length) *
                    100
                )
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* Controls Table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            Loading controles...
          </div>
        ) : controls.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No controls found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/grc/controls/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Register First Control
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {controls.map((control) => (
              <div
                key={control.id}
                className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/grc/controls/${control.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">
                        {control.control_id}
                      </span>
                      <Badge variant="outline">{control.framework}</Badge>
                      <Badge variant={statusColors[control.status]}>
                        {statusLabels[control.status]}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{control.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {control.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div>
                        Tipo: <span className="font-medium capitalize">{control.control_type}</span>
                      </div>
                      {control.effectiveness_score && (
                        <div>
                          Efetividade:{' '}
                          <span className="font-medium">
                            {Math.round(control.effectiveness_score * 100)}%
                          </span>
                        </div>
                      )}
                      {control.last_tested && (
                        <div>
                          Last Test:{' '}
                          {new Date(control.last_tested).toLocaleDateString('en-US')}
                        </div>
                      )}
                    </div>
                  </div>
                  {control.status === 'verified' && (
                    <div className="ml-4">
                      <div className="flex items-center gap-1 text-green-600">
                        <Shield className="h-5 w-5" />
                        <span className="text-xs font-medium">VERIFICADO</span>
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
              controles)
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


