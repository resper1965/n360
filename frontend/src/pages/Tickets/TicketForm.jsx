import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Ticket } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function TicketForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: 'incident',
  })

  useEffect(() => {
    if (isEdit) {
      loadTicket()
    }
  }, [id])

  const loadTicket = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tickets/${id}`)
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      console.error('Erro ao carregar ticket:', error)
      alert('Erro ao carregar ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit ? `/api/tickets/${id}` : '/api/tickets'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert(isEdit ? 'Ticket atualizado com sucesso!' : 'Ticket criado com sucesso!')
        navigate('/tickets')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Erro ao salvar ticket'}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este ticket?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Ticket excluído com sucesso!')
        navigate('/tickets')
      } else {
        alert('Erro ao excluir ticket')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir ticket')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-grid-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tickets')}
              className="border-border/50"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <h1 className="text-3xl font-medium tracking-tight">
              {isEdit ? 'Editar Ticket' : 'Novo Ticket'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Atualize as informações do ticket' : 'Cadastre um novo ticket'}
          </p>
        </div>

        {isEdit && (
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Excluir
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-lg">
          {/* Main Form - 2/3 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Informações do Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Problema no servidor de backup"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Descreva o ticket em detalhes..."
                    rows={8}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade *</Label>
                    <Select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="incident">Incidente</option>
                      <option value="request">Requisição</option>
                      <option value="problem">Problema</option>
                      <option value="change">Mudança</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em Progresso</option>
                      <option value="resolved">Resolvido</option>
                      <option value="closed">Fechado</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-grid-lg">
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {loading ? 'Salvando...' : (isEdit ? 'Atualizar Ticket' : 'Criar Ticket')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/50"
                  onClick={() => navigate('/tickets')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

