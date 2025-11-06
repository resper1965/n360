import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Database } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function AssetForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    description: '',
    asset_type: 'hardware',
    confidentiality_impact: 3,
    integrity_impact: 3,
    availability_impact: 3,
    siem_agent_id: '',
    monitoring_host_id: '',
    tags: []
  })

  useEffect(() => {
    if (isEdit) loadAsset()
  }, [id])

  const loadAsset = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/assets/${id}`)
      const data = await response.json()
      setFormData({ ...data, tags: data.tags || [] })
    } catch (error) {
      console.error('Erro:', error)
      alert('Error loading active')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit ? `/api/assets/${id}` : '/api/assets'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          confidentiality_impact: parseInt(formData.confidentiality_impact),
          integrity_impact: parseInt(formData.integrity_impact),
          availability_impact: parseInt(formData.availability_impact)
        })
      })

      if (response.ok) {
        alert(isEdit ? 'Ativo atualizado!' : 'Ativo criado!')
        navigate('/grc/assets')
      } else {
        alert('Error saving active')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Error saving active')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this active?')) return

    try {
      setLoading(true)
      await fetch(`/api/assets/${id}`, { method: 'DELETE' })
      alert('Ativo excluído!')
      navigate('/grc/assets')
    } catch (error) {
      console.error('Erro:', error)
      alert('Error ao excluir')
    } finally {
      setLoading(false)
    }
  }

  const businessImpact = Math.max(
    formData.confidentiality_impact,
    formData.integrity_impact,
    formData.availability_impact
  ) + Math.ceil((parseInt(formData.confidentiality_impact) + parseInt(formData.integrity_impact) + parseInt(formData.availability_impact)) / 3)

  return (
    <div className="space-y-grid-lg">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/grc/assets')} className="border-border/50">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <h1 className="text-3xl font-medium tracking-tight">{isEdit ? 'Edit Ativo' : 'New Ativo'}</h1>
          </div>
          <p className="text-sm text-muted-foreground">CMDB - Configuration Management Database</p>
        </div>
        {isEdit && (
          <Button variant="outline" onClick={handleDelete} disabled={loading} className="border-red-500/20 text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Delete
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-lg">
          <div className="lg:col-span-2 space-y-grid-lg">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset_code">Código do Ativo *</Label>
                    <Input id="asset_code" name="asset_code" value={formData.asset_code} onChange={handleChange} placeholder="AST-001" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset_type">Tipo *</Label>
                    <Select id="asset_type" name="asset_type" value={formData.asset_type} onChange={handleChange} required>
                      <option value="hardware">Hardware</option>
                      <option value="software">Software</option>
                      <option value="information">Informação</option>
                      <option value="people">Pessoas</option>
                      <option value="service">Serviço</option>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Servidor de Banco de Dados" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Classificação CIA (Confidentiality, Integrity, Availability)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['confidentiality', 'integrity', 'availability'].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={`${field}_impact`}>
                      {field === 'confidentiality' ? 'Confidencialidade' : field === 'integrity' ? 'Integridade' : 'Disponibilidade'} (1-5) *
                      <span className="ml-2 text-xs text-muted-foreground">Atual: {formData[`${field}_impact`]}</span>
                    </Label>
                    <input
                      type="range"
                      id={`${field}_impact`}
                      name={`${field}_impact`}
                      min="1"
                      max="5"
                      value={formData[`${field}_impact`]}
                      onChange={handleChange}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Muito Baixo</span>
                      <span>Muito Alto</span>
                    </div>
                  </div>
                ))}
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Business Impact (Calculado)</div>
                      <div className="text-xs text-muted-foreground mt-0.5">max(C,I,A) + avg(C,I,A)</div>
                    </div>
                    <div className="text-3xl font-medium tracking-tight text-primary">{businessImpact}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-grid-lg">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Integração</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siem_agent_id">SIEM Agent ID</Label>
                  <Input id="siem_agent_id" name="siem_agent_id" value={formData.siem_agent_id || ''} onChange={handleChange} placeholder="001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monitoring_host_id">Monitoring Host ID</Label>
                  <Input id="monitoring_host_id" name="monitoring_host_id" value={formData.monitoring_host_id || ''} onChange={handleChange} placeholder="10084" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar Ativo')}
                </Button>
                <Button type="button" variant="outline" className="w-full border-border/50" onClick={() => navigate('/grc/assets')} disabled={loading}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}


