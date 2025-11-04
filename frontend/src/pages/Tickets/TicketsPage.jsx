import { useState, useEffect } from 'react'
import { Ticket, Plus } from 'lucide-react'
import api from '../../lib/api'

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    try {
      const response = await api.get('/api/tickets')
      setTickets(response.data.tickets || [])
    } catch (error) {
      console.error('Erro ao carregar tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-yellow-500/20 text-yellow-400',
      resolved: 'bg-green-500/20 text-green-400',
      closed: 'bg-gray-500/20 text-gray-400'
    }
    return colors[status] || colors.open
  }

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400',
      high: 'bg-orange-500/20 text-orange-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      low: 'bg-blue-500/20 text-blue-400'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-ness-text">Sistema de Tickets</h1>
          <p className="text-ness-muted mt-1">Gerenciamento de incidentes e requisições</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-ness-blue text-white rounded-lg hover:bg-opacity-90 transition-colors">
          <Plus size={20} />
          Novo Ticket
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['open', 'in_progress', 'waiting', 'resolved'].map((status) => (
          <div key={status} className="bg-ness-surface border border-ness-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-ness-text uppercase mb-4">
              {status.replace('_', ' ')}
              <span className="ml-2 text-ness-muted">
                ({tickets.filter(t => t.status === status).length})
              </span>
            </h3>

            <div className="space-y-3">
              {tickets.filter(t => t.status === status).map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="bg-ness-elevated border border-ness-border rounded-lg p-4 hover:border-ness-blue cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-ness-muted">{ticket.ticket_number}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-medium text-ness-text mb-2">
                    {ticket.title}
                  </h4>

                  <div className="text-xs text-ness-muted">
                    {ticket.type} • {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12 text-ness-muted">
          Carregando tickets...
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="bg-ness-surface border border-ness-border rounded-xl p-12 text-center">
          <Ticket size={48} className="mx-auto mb-3 text-ness-muted opacity-50" />
          <p className="text-ness-muted">Nenhum ticket criado</p>
          <p className="text-sm text-ness-muted mt-2">Clique em "Novo Ticket" para começar</p>
        </div>
      )}
    </div>
  )
}

