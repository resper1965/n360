import { useState, useEffect } from 'react'
import { AlertTriangle, Filter, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState('all')

  useEffect(() => {
    loadAlerts()
    
    // Real-time subscription
    const subscription = supabase
      .channel('alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, loadAlerts)
      .subscribe()

    return () => subscription.unsubscribe()
  }, [severityFilter])

  async function loadAlerts() {
    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter)
      }

      const { data, error } = await query
      if (error) throw error
      
      setAlerts(data || [])
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      info: 'bg-muted/300/20 text-muted-foreground border-gray-500/30'
    }
    return colors[severity] || colors.info
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-ness-muted mt-1">SIEM alerts and security events</p>
        </div>

        <button className="px-4 py-2 bg-ness-blue text-white rounded-lg hover:bg-opacity-90 transition-colors">
          Create Manual Alert
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-ness-surface border border-ness-border rounded-xl p-4 flex items-center gap-4">
        <Filter size={20} className="text-ness-muted" />
        
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-ness-elevated border border-ness-border text-ness-text rounded-lg px-4 py-2"
        >
          <option value="all">Todas as Severidades</option>
          <option value="critical">Critical</option>
          <option value="high">Alto</option>
          <option value="medium">Medium</option>
          <option value="low">Baixo</option>
          <option value="info">Info</option>
        </select>

        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-ness-muted" />
          <input
            type="text"
            placeholder="Search alerts..."
            className="w-full bg-ness-elevated border border-ness-border text-ness-text rounded-lg pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {/* Lista of Alertas */}
      <div className="bg-ness-surface border border-ness-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-ness-muted">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-ness-muted">
            <AlertTriangle size={48} className="mx-auto mb-3 opacity-50" />
            <p>No alert encontrado</p>
            <p className="text-sm mt-2">Collectors will start gathering data automatically</p>
          </div>
        ) : (
          <div className="divide-y divide-ness-border">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-ness-elevated transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-ness-muted">{alert.source}</span>
                      <span className="text-xs text-ness-muted">
                        {new Date(alert.created_at).toLocaleString('en-US')}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-ness-text mb-1">{alert.title}</h3>
                    <p className="text-sm text-ness-muted">{alert.description}</p>
                    
                    {alert.rule_id && (
                      <div className="mt-3 text-xs text-ness-muted">
                        Rule ID: {alert.rule_id}
                      </div>
                    )}
                  </div>

                  <button className="ml-4 px-4 py-2 bg-ness-elevated border border-ness-border text-ness-text rounded-lg hover:bg-ness-border transition-colors text-sm">
                    Criar Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

