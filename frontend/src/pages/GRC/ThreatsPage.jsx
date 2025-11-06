import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export default function ThreatsPage() {
  const navigate = useNavigate()
  const [threats, setThreats] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: 'all', search: '' })

  useEffect(() => {
    fetchThreats()
  }, [filters])

  const fetchThreats = async () => {
    try {
      const params = new URLSearchParams({ ...filters, page: 1, limit: 50 })
      const response = await fetch(`/api/threats?${params}`)
      const data = await response.json()
      setThreats(data.data || [])
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLikelihoodLabel = (score) => {
    if (score === 5) return { label: 'Quase Certo', color: 'destructive' }
    if (score === 4) return { label: 'Provável', color: 'default' }
    if (score === 3) return { label: 'Possível', color: 'secondary' }
    if (score === 2) return { label: 'Improvável', color: 'outline' }
    return { label: 'Raro', color: 'outline' }
  }

  return (
    <div className="space-y-grid-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Threats</h1>
          <p className="text-sm text-muted-foreground">Threat & Vulnerability Library</p>
        </div>
        <Button onClick={() => navigate('/grc/threats/new')}>
          <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
          New Threat
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filters.category} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="all">Todas as Categorias</option>
              <option value="malware">Malware</option>
              <option value="phishing">Phishing</option>
              <option value="physical">Física</option>
              <option value="natural">Natural</option>
            </Select>
            <Input placeholder="Search threats..." value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">Ameaças Catalogadas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : threats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p className="text-sm">No threats registered</p>
            </div>
          ) : (
            <div className="space-y-2">
              {threats.map((threat) => {
                const likelihood = getLikelihoodLabel(threat.likelihood_score)
                return (
                  <div
                    key={threat.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-base cursor-pointer"
                    onClick={() => navigate(`/grc/threats/edit/${threat.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm">{threat.name}</div>
                        <Badge variant={likelihood.color} className="text-xs">{likelihood.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {threat.threat_code} • {threat.threat_category} • {threat.threat_source}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-medium tracking-tight">{threat.likelihood_score}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Probabilidade</div>
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


