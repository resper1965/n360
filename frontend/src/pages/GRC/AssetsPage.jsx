import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Plus, Shield, Server, File, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export default function AssetsPage() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ asset_type: 'all', search: '' })

  useEffect(() => {
    fetchAssets()
    fetchStats()
  }, [filters])

  const fetchAssets = async () => {
    try {
      const params = new URLSearchParams({ ...filters, page: 1, limit: 50 })
      const response = await fetch(`/api/assets?${params}`)
      const data = await response.json()
      setAssets(data.data || [])
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/assets/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const getAssetIcon = (type) => {
    const icons = {
      hardware: Server,
      software: File,
      information: Database,
      people: Users,
      service: Shield
    }
    return icons[type] || Database
  }

  const getImpactColor = (impact) => {
    if (impact >= 7) return 'text-red-400'
    if (impact >= 5) return 'text-orange-400'
    if (impact >= 3) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="space-y-grid-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">CMDB - Asset Management</h1>
          <p className="text-sm text-muted-foreground">Configuration Management Database</p>
        </div>
        <Button onClick={() => navigate('/grc/assets/new')}>
          <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
          New Ativo
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-grid-lg">
          <Card className="group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                  <Database className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-medium tracking-tight">{stats.totalAssets}</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Assets</div>
              </div>
            </CardContent>
          </Card>

          <Card className="group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                  <Shield className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-medium tracking-tight">{stats.avgBusinessImpact?.toFixed(1) || 0}</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Impacto Médio</div>
              </div>
            </CardContent>
          </Card>

          <Card className="group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors duration-base">
                  <Server className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-base" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-medium tracking-tight">{stats.byType?.length || 0}</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Asset Types</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filters.asset_type} onChange={(e) => setFilters(f => ({ ...f, asset_type: e.target.value }))}>
              <option value="all">Todos os Tipos</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="information">Informação</option>
              <option value="people">Pessoas</option>
              <option value="service">Serviço</option>
            </Select>
            <Input
              placeholder="Search actives..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">Registered Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-10 w-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p className="text-sm">No active registered</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => {
                const Icon = getAssetIcon(asset.asset_type)
                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-base cursor-pointer"
                    onClick={() => navigate(`/grc/assets/edit/${asset.id}`)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-muted border border-border/50">
                        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{asset.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {asset.asset_code} • {asset.asset_type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground uppercase tracking-wiof mb-1">CIA</div>
                        <div className="flex gap-1 text-xs">
                          <span className={getImpactColor(asset.confidentiality_impact)}>C:{asset.confidentiality_impact}</span>
                          <span className={getImpactColor(asset.integrity_impact)}>I:{asset.integrity_impact}</span>
                          <span className={getImpactColor(asset.availability_impact)}>A:{asset.availability_impact}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-medium tracking-tight ${getImpactColor(asset.business_impact)}`}>
                          {asset.business_impact}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Impact</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


