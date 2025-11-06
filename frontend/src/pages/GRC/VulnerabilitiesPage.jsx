/**
 * Vulnerabilities Page (TVL)
 * Lista e gerencia vulnerabilitys of Threat & Vulnerability Library
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { 
  Bug, 
  Search, 
  Plus,
  AlertTriangle,
  Shield,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  async function fetchVulnerabilities() {
    try {
      const res = await fetch(`${window.location.origin}/api/vulnerabilities`);
      if (res.ok) {
        const data = await res.json();
        setVulnerabilities(data.data || []);
        
        // Calcular stats
        const stats = (data.data || []).reduce((acc, vuln) => {
          acc.total++;
          acc[vuln.severity.toLowerCase()]++;
          return acc;
        }, { total: 0, critical: 0, high: 0, medium: 0, low: 0 });
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSearch = 
      vuln.cve_id?.toLowerCase().includes(search.toLowerCase()) ||
      vuln.name?.toLowerCase().includes(search.toLowerCase()) ||
      vuln.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || vuln.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted/50 text-muted-foreground border-border/50';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
      case 'High':
        return <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />;
      case 'Medium':
        return <Shield className="h-4 w-4" strokeWidth={1.5} />;
      default:
        return <Bug className="h-4 w-4" strokeWidth={1.5} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <Bug className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" strokeWidth={1.5} />
          <div className="text-sm text-muted-foreground">Loading vulnerabilitys...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Vulnerabilities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Biblioteca of vulnerabilitys conhecidas
          </p>
        </div>
        <button
          onClick={() => navigate('/grc/vulnerabilities/new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Nova Vulnerabilidade
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-grid-md">
        <Card className={cn("shadow-elegant", severityFilter === 'all' && "ring-2 ring-primary")}>
          <CardContent 
            className="pt-6 cursor-pointer"
            onClick={() => setSeverityFilter('all')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <Bug className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-elegant", severityFilter === 'Critical' && "ring-2 ring-red-500")}>
          <CardContent 
            className="pt-6 cursor-pointer"
            onClick={() => setSeverityFilter('Critical')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Critical</div>
                <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-elegant", severityFilter === 'High' && "ring-2 ring-orange-500")}>
          <CardContent 
            className="pt-6 cursor-pointer"
            onClick={() => setSeverityFilter('High')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">High</div>
                <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
              </div>
              <AlertTriangle className="h-6 w-6 text-orange-500" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-elegant", severityFilter === 'Medium' && "ring-2 ring-yellow-500")}>
          <CardContent 
            className="pt-6 cursor-pointer"
            onClick={() => setSeverityFilter('Medium')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Averages</div>
                <div className="text-2xl font-bold text-yellow-500">{stats.medium}</div>
              </div>
              <Shield className="h-6 w-6 text-yellow-500" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-elegant", severityFilter === 'Low' && "ring-2 ring-blue-500")}>
          <CardContent 
            className="pt-6 cursor-pointer"
            onClick={() => setSeverityFilter('Low')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Low</div>
                <div className="text-2xl font-bold text-blue-500">{stats.low}</div>
              </div>
              <Bug className="h-6 w-6 text-blue-500" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search by CVE, name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vulnerabilities List */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>
            Vulnerabilidades ({filteredVulnerabilities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVulnerabilities.length > 0 ? (
            <div className="space-y-2">
              {filteredVulnerabilities.map((vuln) => (
                <div
                  key={vuln.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/30 transition-all duration-base cursor-pointer group"
                  onClick={() => navigate(`/grc/vulnerabilities/edit/${vuln.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {vuln.cve_id && (
                          <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                            {vuln.cve_id}
                          </code>
                        )}
                        <div className="font-medium">{vuln.name}</div>
                      </div>

                      {vuln.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {vuln.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {vuln.cvss_score && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" strokeWidth={1.5} />
                            CVSS: {vuln.cvss_score}
                          </span>
                        )}
                        {vuln.cwe_id && (
                          <span>CWE: {vuln.cwe_id}</span>
                        )}
                        {vuln.exploitable && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                            Exploitável
                          </Badge>
                        )}
                        {vuln.patch_available && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            Patch Disponível
                          </Badge>
                        )}
                      </div>

                      {vuln.affected_systems && vuln.affected_systems.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Sistemas afetados: {vuln.affected_systems.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={getSeverityColor(vuln.severity)}>
                        <span className="flex items-center gap-1">
                          {getSeverityIcon(vuln.severity)}
                          {vuln.severity}
                        </span>
                      </Badge>

                      {vuln.reference_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(vuln.reference_url, '_blank');
                          }}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                          Reference
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {search || severityFilter !== 'all' 
                ? 'Nenhuma vulnerabilidaof encontrada com esses filtros.'
                : 'Nenhuma vulnerabilidaof cadastrada. Click on "Nova Vulnerabilidade" to start.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


