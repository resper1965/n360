import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, FileText, Upload } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { uploadEvidence } from '@/lib/supabase'

export default function PolicyForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docFile, setDocFile] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'security',
    framework: '',
    version: '1.0',
    status: 'draft',
    effective_date: '',
    review_date: '',
    tags: [],
  })

  useEffect(() => {
    if (isEdit) {
      loadPolicy()
    }
  }, [id])

  const loadPolicy = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/policies/${id}`)
      const data = await response.json()
      setFormData({
        ...data,
        effective_date: data.effective_date?.split('T')[0] || '',
        review_date: data.review_date?.split('T')[0] || '',
        tags: data.tags || [],
      })
    } catch (error) {
      console.error('Erro ao carregar política:', error)
      alert('Erro ao carregar política')
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
    setDocFile(file)
  }

  const handleUploadDoc = async () => {
    if (!docFile) return

    try {
      setUploadingDoc(true)
      
      const orgId = 'demo-org' // TODO: Get from auth
      const entityId = id || 'temp-' + Date.now()
      
      const result = await uploadEvidence(
        docFile,
        orgId,
        'policies',
        entityId
      )

      // Store URL in content (or separate field)
      setFormData(prev => ({
        ...prev,
        content: prev.content + `\n\n[Documento anexado](${result.url})`
      }))

      alert('Documento enviado com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar documento:', error)
      alert('Erro ao enviar documento')
    } finally {
      setUploadingDoc(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit ? `/api/policies/${id}` : '/api/policies'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert(isEdit ? 'Política atualizada com sucesso!' : 'Política criada com sucesso!')
        navigate('/grc/policies')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error || 'Erro ao salvar política'}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar política')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta política?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Política excluída com sucesso!')
        navigate('/grc/policies')
      } else {
        alert('Erro ao excluir política')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir política')
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
              onClick={() => navigate('/grc/policies')}
              className="border-border/50"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <h1 className="text-3xl font-medium tracking-tight">
              {isEdit ? 'Editar Política' : 'Nova Política'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Atualize as informações da política' : 'Cadastre uma nova política de segurança'}
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
          <div className="lg:col-span-2 space-y-grid-lg">
            {/* Informações Básicas */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Política de Uso Aceitável"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Resumo executivo da política..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="security">Segurança</option>
                      <option value="privacy">Privacidade</option>
                      <option value="compliance">Compliance</option>
                      <option value="operational">Operacional</option>
                      <option value="hr">Recursos Humanos</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="framework">Framework</Label>
                    <Input
                      id="framework"
                      name="framework"
                      value={formData.framework || ''}
                      onChange={handleChange}
                      placeholder="Ex: ISO 27001"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo da Política</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content || ''}
                    onChange={handleChange}
                    placeholder="Conteúdo completo da política (suporta Markdown)..."
                    rows={12}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Suporta Markdown. Use ## para títulos, **negrito**, etc.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Anexos */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" strokeWidth={1.5} />
                  Documento Oficial (PDF)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  label="Documento da Política"
                  accept=".pdf,.doc,.docx"
                  maxSize={10}
                  value={docFile}
                  onChange={setDocFile}
                />

                {docFile && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadDoc}
                    disabled={uploadingDoc}
                    className="w-full border-border/50"
                  >
                    <Upload className="h-4 w-4 mr-2" strokeWidth={1.5} />
                    {uploadingDoc ? 'Enviando...' : 'Anexar Documento'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-grid-lg">
            {/* Status & Lifecycle */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Status</CardTitle>
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
                    <option value="draft">Rascunho</option>
                    <option value="review">Em Revisão</option>
                    <option value="approved">Aprovado</option>
                    <option value="active">Ativo</option>
                    <option value="archived">Arquivado</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">Versão *</Label>
                  <Input
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    placeholder="1.0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effective_date">Data de Vigência</Label>
                  <Input
                    type="date"
                    id="effective_date"
                    name="effective_date"
                    value={formData.effective_date || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review_date">Próxima Revisão</Label>
                  <Input
                    type="date"
                    id="review_date"
                    name="review_date"
                    value={formData.review_date || ''}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || uploadingDoc}
                >
                  <Save className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {loading ? 'Salvando...' : (isEdit ? 'Atualizar Política' : 'Criar Política')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/50"
                  onClick={() => navigate('/grc/policies')}
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


