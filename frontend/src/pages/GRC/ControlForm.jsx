import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Upload } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { uploadEvidence } from '@/lib/supabase'

export default function ControlForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [uploadingEvidence, setUploadingEvidence] = useState(false)
  const [evidenceFile, setEvidenceFile] = useState(null)
  
  const [formData, setFormData] = useState({
    control_id: '',
    title: '',
    description: '',
    framework: 'ISO 27001',
    control_type: 'preventive',
    category: '',
    status: 'not_implemented',
    implementation_notes: '',
    effectiveness_score: null,
    last_tested: '',
    test_frequency: 30,
    test_result: null,
    evidence_url: '',
    evidence_description: '',
    owner_id: null,
    responsible_team: '',
    tags: [],
  })

  useEffect(() => {
    if (isEdit) {
      loadControl()
    }
  }, [id])

  const loadControl = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/controls/${id}`)
      const data = await response.json()
      setFormData({
        ...data,
        last_tested: data.last_tested?.split('T')[0] || '',
        tags: data.tags || [],
      })
    } catch (error) {
      console.error('Error loading controle:', error)
      alert('Error loading controle')
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

  const handleFileSelect = (file) => {
    setEvidenceFile(file)
  }

  const handleUploadEvidence = async () => {
    if (!evidenceFile) return

    try {
      setUploadingEvidence(true)
      
      // Upload to Supabase Storage
      // TODO: Get org_id from auth context
      const orgId = 'demo-org' // Placeholder
      const entityId = id || 'temp-' + Date.now()
      
      const result = await uploadEvidence(
        evidenceFile,
        orgId,
        'controls',
        entityId
      )

      // Update form with evidence URL
      setFormData(prev => ({
        ...prev,
        evidence_url: result.url
      }))

      alert('Evidência enviada successfully!')
    } catch (error) {
      console.error('Error enviar evidência:', error)
      alert('Error enviar evidência')
    } finally {
      setUploadingEvidence(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload evidence if selected
      if (evidenceFile && !formData.evidence_url) {
        await handleUploadEvidence()
      }

      const payload = {
        ...formData,
        test_frequency: formData.test_frequency ? parseInt(formData.test_frequency) : null,
        effectiveness_score: formData.effectiveness_score ? parseFloat(formData.effectiveness_score) : null,
      }

      const url = isEdit ? `/api/controls/${id}` : '/api/controls'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert(isEdit ? 'Controle atualizado successfully!' : 'Controle criado successfully!')
        navigate('/grc/controls')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Error saving controle'}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Error saving controle')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete este controle?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/controls/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Controle excluído successfully!')
        navigate('/grc/controls')
      } else {
        alert('Error excluir controle')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Error excluir controle')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
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
              onClick={() => navigate('/grc/controls')}
              className="border-border/50"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <h1 className="text-3xl font-medium tracking-tight">
              {isEdit ? 'Edit Controle' : 'New Control'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Update the information of controle' : 'Register a new controle of security'}
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
            Delete
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-lg">
          {/* Main Form - 2/3 */}
          <div className="lg:col-span-2 space-y-grid-lg">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Control ID */}
                <div className="space-y-2">
                  <Label htmlFor="control_id">ID of Controle *</Label>
                  <Input
                    id="control_id"
                    name="control_id"
                    value={formData.control_id}
                    onChange={handleChange}
                    placeholder="Example: ISO-27001-A.5.1"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Identificador único (ex: ISO-27001-A.5.1, NIST-PR.AC-1)
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Example: Controle of Acesso Lógico"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Descreva o controle em detalhes..."
                    rows={4}
                  />
                </div>

                {/* Framework e Tipo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="framework">Framework *</Label>
                    <Select
                      id="framework"
                      name="framework"
                      value={formData.framework}
                      onChange={handleChange}
                      required
                    >
                      <option value="ISO 27001">ISO 27001</option>
                      <option value="NIST CSF">NIST CSF</option>
                      <option value="CIS">CIS Controls</option>
                      <option value="PCI-DSS">PCI-DSS</option>
                      <option value="LGPD">LGPD</option>
                      <option value="SOC2">SOC2</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="control_type">Tipo of Controle *</Label>
                    <Select
                      id="control_type"
                      name="control_type"
                      value={formData.control_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="preventive">Preventivo</option>
                      <option value="detective">Detectivo</option>
                      <option value="corrective">Corretivo</option>
                      <option value="compensating">Compensatório</option>
                    </Select>
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    placeholder="Example: Access Control, Network Security"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Implementação */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Implementação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="not_implemented">Not Implemented</option>
                    <option value="planned">Planejado</option>
                    <option value="partial">Parcial</option>
                    <option value="implemented">Implementado</option>
                    <option value="verified">Verificado</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="implementation_notes">Notas of Implementação</Label>
                  <Textarea
                    id="implementation_notes"
                    name="implementation_notes"
                    value={formData.implementation_notes || ''}
                    onChange={handleChange}
                    placeholder="Descreva como o controle foi implementado..."
                    rows={4}
                  />
                </div>

                {/* Team Responsável */}
                <div className="space-y-2">
                  <Label htmlFor="responsible_team">Time Owner</Label>
                  <Input
                    id="responsible_team"
                    name="responsible_team"
                    value={formData.responsible_team || ''}
                    onChange={handleChange}
                    placeholder="Example: Equipe Security"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Evidências */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" strokeWidth={1.5} />
                  Evidências of Teste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <FileUpload
                  label="Arquivo of Evidência"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.csv,.xlsx"
                  maxSize={10}
                  value={evidenceFile}
                  onChange={setEvidenceFile}
                />

                {evidenceFile && !formData.evidence_url && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadEvidence}
                    disabled={uploadingEvidence}
                    className="w-full border-border/50"
                  >
                    <Upload className="h-4 w-4 mr-2" strokeWidth={1.5} />
                    {uploadingEvidence ? 'Enviando...' : 'Enviar Evidência'}
                  </Button>
                )}

                {formData.evidence_url && (
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Evidência anexada</div>
                        <a
                          href={formData.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Ver arquivo
                        </a>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, evidence_url: '' }))}
                        className="border-border/50"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="evidence_description">Descrição of Evidência</Label>
                  <Textarea
                    id="evidence_description"
                    name="evidence_description"
                    value={formData.evidence_description || ''}
                    onChange={handleChange}
                    placeholder="Descreva a evidência anexada..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-grid-lg">
            {/* Testes */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Testes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test_frequency">Frequência of Teste (dias)</Label>
                  <Input
                    type="number"
                    id="test_frequency"
                    name="test_frequency"
                    value={formData.test_frequency || ''}
                    onChange={handleChange}
                    placeholder="30"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Intervalo entre testes (ex: 30 = mensal)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_tested">Último Teste</Label>
                  <Input
                    type="date"
                    id="last_tested"
                    name="last_tested"
                    value={formData.last_tested || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test_result">Resultado of Teste</Label>
                  <Select
                    id="test_result"
                    name="test_result"
                    value={formData.test_result || ''}
                    onChange={handleChange}
                  >
                    <option value="">Não testado</option>
                    <option value="passed">Passou</option>
                    <option value="failed">Falhou</option>
                    <option value="partial">Parcial</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effectiveness_score">
                    Effectiveness (0.00 - 1.00)
                  </Label>
                  <Input
                    type="number"
                    id="effectiveness_score"
                    name="effectiveness_score"
                    value={formData.effectiveness_score || ''}
                    onChange={handleChange}
                    placeholder="0.85"
                    min="0"
                    max="1"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Score of 0 (inefetivo) a 1 (100% efetivo)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || uploadingEvidence}
                >
                  <Save className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {loading ? 'Saving...' : (isEdit ? 'Atualizar Controle' : 'Criar Controle')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/50"
                  onClick={() => navigate('/grc/controls')}
                  disabled={loading}
                >
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


