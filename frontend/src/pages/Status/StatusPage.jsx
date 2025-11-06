import { useState, useEffect } from 'react'
import { Radio, ExternalLink } from 'lucide-react'
import api from '../../lib/api'

export default function StatusPage() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadStatus() {
    try {
      const response = await api.get('/api/dashboard')
      setStatus(response.data)
    } catch (error) {
      console.error('Error loading status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-ness-muted">Carregando status...</div>
  }

  const apps = status?.apps || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-ness-text">Status das Aplicações</h1>
        <p className="text-ness-muted mt-1">Monitoramento em tempo real</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-ness-surface border border-ness-border rounded-xl p-6">
          <div className="text-ness-muted text-sm mb-2">Aplicações Online</div>
          <div className="text-4xl font-bold text-green-500">{status?.summary?.onlineApps || 0}</div>
        </div>
        <div className="bg-ness-surface border border-ness-border rounded-xl p-6">
          <div className="text-ness-muted text-sm mb-2">Aplicações Offline</div>
          <div className="text-4xl font-bold text-red-500">{status?.summary?.offlineApps || 0}</div>
        </div>
        <div className="bg-ness-surface border border-ness-border rounded-xl p-6">
          <div className="text-ness-muted text-sm mb-2">Health Score</div>
          <div className="text-4xl font-bold text-ness-blue">{status?.summary?.healthPercentage || 0}%</div>
        </div>
      </div>

      {/* Apps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(apps).map(([key, app]) => (
          <div 
            key={key} 
            className={`bg-ness-surface border rounded-xl p-6 ${
              app.online ? 'border-green-500/30' : 'border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-ness-text uppercase">{key}</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                app.online 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {app.online ? '✓ Online' : '✗ Offline'}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ness-muted">Versão:</span>
                <span className="text-ness-text">{app.version || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ness-muted">Última Check:</span>
                <span className="text-ness-text text-xs">
                  {app.lastCheck ? new Date(app.lastCheck).toLocaleTimeString('pt-BR') : 'Nunca'}
                </span>
              </div>
            </div>

            {app.url && (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-ness-elevated hover:bg-ness-border text-ness-blue rounded-lg transition-colors text-sm"
              >
                Acessar Painel
                <ExternalLink size={16} />
              </a>
            )}

            {app.error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                {app.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

