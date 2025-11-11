/**
 * Threat Form
 * Form to create/edit threats (TVL - Threat & Vulnerability Library)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skull, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThreatForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    threat_code: '',
    name: '',
    description: '',
    category: 'Malware',
    likelihood_score: 3,
    attack_vector: '',
    mitre_attack_id: '',
    cwe_mapping: '',
    reference_url: '',
    tags: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      fetchThreat();
    }
  }, [id]);

  async function fetchThreat() {
    try {
      const res = await fetch(`${window.location.origin}/api/threats/${id}`);
      if (res.ok) {
        const data = await res.json();
        const threat = data.data;
        
        setFormData({
          threat_code: threat.threat_code || '',
          name: threat.name || '',
          description: threat.description || '',
          category: threat.category || 'Malware',
          likelihood_score: threat.likelihood_score || 3,
          attack_vector: threat.attack_vector || '',
          mitre_attack_id: threat.mitre_attack_id || '',
          cwe_mapping: threat.cwe_mapping || '',
          reference_url: threat.reference_url || '',
          tags: (threat.tags || []).join(', ')
        });
      }
    } catch (error) {
      console.error('Error fetching threat:', error);
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.threat_code) newErrors.threat_code = 'Code is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (formData.likelihood_score < 1 || formData.likelihood_score > 5) {
      newErrors.likelihood_score = 'Likelihood must be between 1 and 5';
    }

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
        likelihood_score: parseInt(formData.likelihood_score),
        tags: formData.tags 
          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : []
      };

      const url = isEdit 
        ? `${window.location.origin}/api/threats/${id}`
        : `${window.location.origin}/api/threats`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        navigate('/grc/threats');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to save threat'}`);
      }
    } catch (error) {
      console.error('Error saving threat:', error);
      alert('Error saving threat');
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    'Malware',
    'Social Engineering',
    'Physical Security',
    'Network Attack',
    'Insider Threat',
    'Supply Chain',
    'Natural Disaster',
    'Human Error',
    'System Failure',
    'Other'
  ];

  const likelihoodLabels = {
    1: { label: 'Very Low', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    2: { label: 'Low', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    3: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    4: { label: 'High', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    5: { label: 'Very High', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
  };

  return (
    <div className="space-y-grid-xl max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isEdit ? 'Edit' : 'New'} Threat
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Threat & Vulnerability Library (TVL)
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5" strokeWidth={1.5} />
              Threat Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Code and Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="threat_code">
                  Threat Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="threat_code"
                  value={formData.threat_code}
                  onChange={(e) => setFormData({ ...formData, threat_code: e.target.value })}
                  placeholder="THREAT-2025-001"
                  className={errors.threat_code && 'border-red-500'}
                />
                {errors.threat_code && (
                  <p className="text-xs text-red-500">{errors.threat_code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ransomware Attack"
                  className={errors.name && 'border-red-500'}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the threat, including how it can manifest..."
                rows={4}
              />
            </div>

            {/* Category and Likelihood */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="likelihood_score">
                  Likelihood Score (1-5) <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="likelihood_score"
                    min="1"
                    max="5"
                    step="1"
                    value={formData.likelihood_score}
                    onChange={(e) => setFormData({ ...formData, likelihood_score: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <Badge 
                    variant="outline" 
                    className={cn("w-32 justify-center", likelihoodLabels[formData.likelihood_score].color)}
                  >
                    {formData.likelihood_score} - {likelihoodLabels[formData.likelihood_score].label}
                  </Badge>
                </div>
                {errors.likelihood_score && (
                  <p className="text-xs text-red-500">{errors.likelihood_score}</p>
                )}
              </div>
            </div>

            {/* Attack Vector */}
            <div className="space-y-2">
              <Label htmlFor="attack_vector">Attack Vector</Label>
              <Input
                id="attack_vector"
                value={formData.attack_vector}
                onChange={(e) => setFormData({ ...formData, attack_vector: e.target.value })}
                placeholder="Email phishing, Remote code execution, Physical access, etc."
              />
              <p className="text-xs text-muted-foreground">
                How the threat can materialize (e.g., email, network, physical access)
              </p>
            </div>

            {/* MITRE ATT&CK and CWE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mitre_attack_id">MITRE ATT&CK ID</Label>
                <Input
                  id="mitre_attack_id"
                  value={formData.mitre_attack_id}
                  onChange={(e) => setFormData({ ...formData, mitre_attack_id: e.target.value })}
                  placeholder="T1566 (Phishing)"
                />
                <p className="text-xs text-muted-foreground">
                  <a 
                    href="https://attack.mitre.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    MITRE ATT&CK Framework →
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cwe_mapping">CWE Mapping</Label>
                <Input
                  id="cwe_mapping"
                  value={formData.cwe_mapping}
                  onChange={(e) => setFormData({ ...formData, cwe_mapping: e.target.value })}
                  placeholder="CWE-79, CWE-89"
                />
              </div>
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference_url">Reference URL</Label>
              <Input
                id="reference_url"
                type="url"
                value={formData.reference_url}
                onChange={(e) => setFormData({ ...formData, reference_url: e.target.value })}
                placeholder="https://example.com/threat-intel"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="ransomware, encryption, data-breach"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} />
                {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')} Threat
              </button>

              <button
                type="button"
                onClick={() => navigate('/grc/threats')}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}



