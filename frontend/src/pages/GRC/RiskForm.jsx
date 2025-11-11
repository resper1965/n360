import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function RiskForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cyber',
    asset_type: '',
    likelihood: 3,
    impact: 3,
    treatment: 'mitigate',
    mitigation_plan: '',
    status: 'open',
    owner_id: null,
    identified_date: new Date().toISOString().split('T')[0],
    target_date: '',
    tags: [],
  })

  useEffect(() => {
    if (isEdit) {
      loadRisk()
    }
  }, [id])

  const loadRisk = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/risks/${id}`)
      const data = await response.json()
      setFormData({
        ...data,
        identified_date: data.identified_date?.split('T')[0] || '',
        target_date: data.target_date?.split('T')[0] || '',
        tags: data.tags || [],
      })
    } catch (error) {
      console.error('Error loading risk:', error)
      alert('Error loading risk')
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
      // Calculate risk_score
      const risk_score = formData.likelihood * formData.impact

      const payload = {
        ...formData,
        likelihood: parseInt(formData.likelihood),
        impact: parseInt(formData.impact),
        risk_score,
      }

      const url = isEdit ? `/api/risks/${id}` : '/api/risks'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert(isEdit ? 'Risk updated successfully!' : 'Risk created successfully!')
        navigate('/grc/risks')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Error saving risk'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving risk')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this risk?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/risks/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Risk deleted successfully!')
        navigate('/grc/risks')
      } else {
        alert('Error deleting risk')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting risk')
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
              onClick={() => navigate('/grc/risks')}
              className="border-border/50"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <h1 className="text-3xl font-medium tracking-tight">
              {isEdit ? 'Edit Risk' : 'New Risk'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Update the risk information' : 'Register a new risk in the platform'}
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
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Example: Data breach risk"
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
                    placeholder="Describe the risk in detail..."
                    rows={4}
                  />
                </div>

                {/* Category and Asset Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="operational">Operational</option>
                      <option value="financial">Financial</option>
                      <option value="strategic">Strategic</option>
                      <option value="compliance">Compliance</option>
                      <option value="cyber">Cyber</option>
                      <option value="reputational">Reputational</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset_type">Asset Type</Label>
                    <Input
                      id="asset_type"
                      name="asset_type"
                      value={formData.asset_type || ''}
                      onChange={handleChange}
                      placeholder="Example: Database"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Analysis */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Analysis of Risco</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Likelihood and Impact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="likelihood">
                      Probability (1-5) *
                      <span className="ml-2 text-xs text-muted-foreground">
                        Current: {formData.likelihood}
                      </span>
                    </Label>
                    <input
                      type="range"
                      id="likelihood"
                      name="likelihood"
                      min="1"
                      max="5"
                      value={formData.likelihood}
                      onChange={handleChange}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impact">
                      Impact (1-5) *
                      <span className="ml-2 text-xs text-muted-foreground">
                        Current: {formData.impact}
                      </span>
                    </Label>
                    <input
                      type="range"
                      id="impact"
                      name="impact"
                      min="1"
                      max="5"
                      value={formData.impact}
                      onChange={handleChange}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>
                </div>

                {/* Risk Score (calculado) */}
                <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Risk Score (Inherent)</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Likelihood × Impact
                      </div>
                    </div>
                    <div className="text-3xl font-medium tracking-tight">
                      {formData.likelihood * formData.impact}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Risk Treatment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment Strategy *</Label>
                  <Select
                    id="treatment"
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleChange}
                    required
                  >
                    <option value="mitigate">Mitigate</option>
                    <option value="accept">Accept</option>
                    <option value="transfer">Transfer</option>
                    <option value="avoid">Avoid</option>
                  </Select>
                </div>

                {formData.treatment === 'mitigate' && (
                  <div className="space-y-2">
                  <Label htmlFor="mitigation_plan">Mitigation Plan</Label>
                    <Textarea
                      id="mitigation_plan"
                      name="mitigation_plan"
                      value={formData.mitigation_plan || ''}
                      onChange={handleChange}
                      placeholder="Describe the mitigation actions..."
                      rows={4}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-grid-lg">
            {/* Status and Dates */}
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
                    <option value="open">Open</option>
                    <option value="mitigating">Mitigating</option>
                    <option value="mitigated">Mitigated</option>
                    <option value="accepted">Accepted</option>
                    <option value="closed">Closed</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identified_date">Identification Date *</Label>
                  <Input
                    type="date"
                    id="identified_date"
                    name="identified_date"
                    value={formData.identified_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    type="date"
                    id="target_date"
                    name="target_date"
                    value={formData.target_date || ''}
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
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {loading ? 'Saving...' : (isEdit ? 'Update Risk' : 'Create Risk')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/50"
                  onClick={() => navigate('/grc/risks')}
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



