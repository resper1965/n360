/**
 * Incident Form
 * Formulário para criar/editar incidentes de segurança
 * Inclui gestão de CAPA (Corrective & Preventive Actions)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertOctagon, Save, X, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IncidentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    status: 'open',
    asset_id: '',
    detected_at: new Date().toISOString().slice(0, 16),
    impact_description: '',
    root_cause: '',
    resolution_notes: ''
  });

  const [capas, setCapas] = useState([]);
  const [newCapa, setNewCapa] = useState({ description: '', type: 'corrective', owner: '', due_date: '' });
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAssets();
    if (isEdit) {
      fetchIncident();
    }
  }, [id]);

  async function fetchAssets() {
    try {
      const res = await fetch(`${window.location.origin}/api/assets`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }

  async function fetchIncident() {
    try {
      const res = await fetch(`${window.location.origin}/api/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        const incident = data.data;
        
        setFormData({
          title: incident.title || '',
          description: incident.description || '',
          severity: incident.severity || 'medium',
          status: incident.status || 'open',
          asset_id: incident.asset_id || '',
          detected_at: incident.detected_at 
            ? new Date(incident.detected_at).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          impact_description: incident.impact_description || '',
          root_cause: incident.root_cause || '',
          resolution_notes: incident.resolution_notes || ''
        });

        // Fetch CAPAs if exists
        if (incident.capas) {
          setCapas(incident.capas);
        }
      }
    } catch (error) {
      console.error('Error fetching incident:', error);
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.title) newErrors.title = 'Título é obrigatório';
    if (!formData.description) newErrors.description = 'Descrição é obrigatória';
    if (!formData.detected_at) newErrors.detected_at = 'Data de detecção é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        asset_id: formData.asset_id || null,
        capas: capas.map(c => ({
          description: c.description,
          type: c.type,
          owner: c.owner,
          due_date: c.due_date || null,
          status: c.status || 'pending'
        }))
      };

      const url = isEdit 
        ? `${window.location.origin}/api/incidents/${id}`
        : `${window.location.origin}/api/incidents`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        navigate('/grc/incidents');
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error || 'Falha ao salvar'}`);
      }
    } catch (error) {
      console.error('Error saving incident:', error);
      alert('Error saving incidente');
    } finally {
      setLoading(false);
    }
  }

  function addCapa() {
    if (!newCapa.description.trim()) {
      alert('Descrição da CAPA é obrigatória');
      return;
    }

    setCapas([...capas, { ...newCapa, status: 'pending' }]);
    setNewCapa({ description: '', type: 'corrective', owner: '', due_date: '' });
  }

  function removeCapa(index) {
    setCapas(capas.filter((_, i) => i !== index));
  }

  const severities = [
    { value: 'critical', label: 'Crítico', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    { value: 'high', label: 'Alto', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    { value: 'medium', label: 'Médio', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    { value: 'low', label: 'Baixo', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
  ];

  const statuses = [
    { value: 'open', label: 'Aberto', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    { value: 'investigating', label: 'Investigando', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    { value: 'resolved', label: 'Resolvido', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    { value: 'closed', label: 'Closed', color: 'bg-muted/50 text-muted-foreground border-border/50' }
  ];

  const capaTypes = [
    { value: 'corrective', label: 'Corretiva' },
    { value: 'preventive', label: 'Preventiva' }
  ];

  return (
    <div className="space-y-grid-xl max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isEdit ? 'Edit' : 'Novo'} Incidente
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registro de Incidentes de Segurança e CAPA
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-grid-lg">
        {/* Informações Básicas */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5" strokeWidth={1.5} />
              Informações do Incidente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título resumido do incidente"
                className={errors.title && 'border-red-500'}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada do que aconteceu..."
                rows={4}
                className={errors.description && 'border-red-500'}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Severidade e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severidade</Label>
                <div className="flex gap-2 flex-wrap">
                  {severities.map((sev) => (
                    <Badge
                      key={sev.value}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all",
                        sev.color,
                        formData.severity === sev.value && "ring-2 ring-offset-2"
                      )}
                      onClick={() => setFormData({ ...formData, severity: sev.value })}
                    >
                      {sev.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-2 flex-wrap">
                  {statuses.map((status) => (
                    <Badge
                      key={status.value}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all",
                        status.color,
                        formData.status === status.value && "ring-2 ring-offset-2"
                      )}
                      onClick={() => setFormData({ ...formData, status: status.value })}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Asset Afetado e Data de Detecção */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset_id">Asset Afetado</Label>
                <select
                  id="asset_id"
                  value={formData.asset_id}
                  onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No asset selecionado</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detected_at">
                  Data de Detecção <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="detected_at"
                  type="datetime-local"
                  value={formData.detected_at}
                  onChange={(e) => setFormData({ ...formData, detected_at: e.target.value })}
                  className={errors.detected_at && 'border-red-500'}
                />
                {errors.detected_at && (
                  <p className="text-xs text-red-500">{errors.detected_at}</p>
                )}
              </div>
            </div>

            {/* Impacto */}
            <div className="space-y-2">
              <Label htmlFor="impact_description">Descrição do Impacto</Label>
              <Textarea
                id="impact_description"
                value={formData.impact_description}
                onChange={(e) => setFormData({ ...formData, impact_description: e.target.value })}
                placeholder="Qual foi o impacto no negócio? Dados comprometidos? Sistemas indisponíveis?"
                rows={3}
              />
            </div>

            {/* Root Cause (se status ≥ investigating) */}
            {['investigating', 'resolved', 'closed'].includes(formData.status) && (
              <div className="space-y-2">
                <Label htmlFor="root_cause">Causa Raiz</Label>
                <Textarea
                  id="root_cause"
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  placeholder="Qual foi a causa raiz do incidente?"
                  rows={3}
                />
              </div>
            )}

            {/* Resolution Notes (se status ≥ resolved) */}
            {['resolved', 'closed'].includes(formData.status) && (
              <div className="space-y-2">
                <Label htmlFor="resolution_notes">Notas de Resolução</Label>
                <Textarea
                  id="resolution_notes"
                  value={formData.resolution_notes}
                  onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                  placeholder="Como o incidente foi resolvido? Quais ações foram tomadas?"
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* CAPA - Corrective & Preventive Actions */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>CAPA - Ações Corretivas e Preventivas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de CAPAs */}
            {capas.length > 0 && (
              <div className="space-y-2">
                {capas.map((capa, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg border border-border flex items-start justify-between hover:border-primary/20 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {capaTypes.find(t => t.value === capa.type)?.label}
                        </Badge>
                        {capa.owner && (
                          <span className="text-xs text-muted-foreground">
                            Responsável: {capa.owner}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{capa.description}</p>
                      {capa.due_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Prazo: {new Date(capa.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCapa(index)}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Nova CAPA */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
              <h4 className="text-sm font-medium">Add CAPA</h4>
              
              <div className="space-y-2">
                <Label htmlFor="new_capa_description">Descrição da Ação</Label>
                <Textarea
                  id="new_capa_description"
                  value={newCapa.description}
                  onChange={(e) => setNewCapa({ ...newCapa, description: e.target.value })}
                  placeholder="Descreva a ação corretiva ou preventiva..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new_capa_type">Tipo</Label>
                  <select
                    id="new_capa_type"
                    value={newCapa.type}
                    onChange={(e) => setNewCapa({ ...newCapa, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {capaTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_capa_owner">Responsável</Label>
                  <Input
                    id="new_capa_owner"
                    value={newCapa.owner}
                    onChange={(e) => setNewCapa({ ...newCapa, owner: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_capa_due_date">Prazo</Label>
                  <Input
                    id="new_capa_due_date"
                    type="date"
                    value={newCapa.due_date}
                    onChange={(e) => setNewCapa({ ...newCapa, due_date: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addCapa}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/70 border border-border rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Add CAPA
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Incidente
          </button>

          <button
            type="button"
            onClick={() => navigate('/grc/incidents')}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


