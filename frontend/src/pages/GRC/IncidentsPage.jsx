/**
 * Incidents & CAPA Page
 * Gestão Incident Security e Corrective Actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertOctagon, 
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpCircle,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    investigating: 0,
    resolved: 0,
    closed: 0,
    avgTimeToResolve: 0
  });
  const [filter, setFilter] = useState('all'); // all, open, investigating, resolved, closed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    try {
      const res = await fetch(`${window.location.origin}/api/incidents`);
      if (res.ok) {
        const data = await res.json();
        const allIncidents = data.data || [];
        
        // Calculate stats
        const stats = allIncidents.reduce((acc, inc) => {
          acc.total++;
          if (inc.status === 'open') acc.open++;
          else if (inc.status === 'investigating') acc.investigating++;
          else if (inc.status === 'resolved') acc.resolved++;
          else if (inc.status === 'closed') acc.closed++;
          return acc;
        }, { total: 0, open: 0, investigating: 0, resolved: 0, closed: 0, avgTimeToResolve: 0 });
        
        setStats(stats);
        setIncidents(allIncidents);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'all') return true;
    return inc.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      open: { label: 'Aberto', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
      investigating: { label: 'Investigando', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      resolved: { label: 'Resolvido', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      closed: { label: 'Closed', color: 'bg-muted/50 text-muted-foreground border-border/50' }
    };
    return badges[status] || badges.open;
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: { label: "Critical", color: 'bg-red-500/10 text-red-500 border-red-500/20' },
      high: { label: 'Alto', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
      medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      low: { label: 'Baixo', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
    };
    return badges[severity] || badges.low;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <AlertOctagon className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" strokeWidth={1.5} />
          <div className="text-sm text-muted-foreground">Loading incidents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-grid-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Incidents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Security incidents and Corrective Actions (CAPA)
          </p>
        </div>
        <Link to="/grc/incidents/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
            New Incident
          </button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-grid-md">
        <Card 
          className={cn(
            "shadow-elegant cursor-pointer transition-all",
            filter === 'all' && "ring-2 ring-primary"
          )}
          onClick={() => setFilter('all')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <AlertOctagon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "shadow-elegant cursor-pointer transition-all",
            filter === 'open' && "ring-2 ring-red-500"
          )}
          onClick={() => setFilter('open')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Abertos</div>
                <div className="text-2xl font-bold text-red-500">{stats.open}</div>
              </div>
              <XCircle className="h-5 w-5 text-red-500" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "shadow-elegant cursor-pointer transition-all",
            filter === 'investigating' && "ring-2 ring-yellow-500"
          )}
          onClick={() => setFilter('investigating')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Investigando</div>
                <div className="text-2xl font-bold text-yellow-500">{stats.investigating}</div>
              </div>
              <Clock className="h-5 w-5 text-yellow-500" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "shadow-elegant cursor-pointer transition-all",
            filter === 'resolved' && "ring-2 ring-green-500"
          )}
          onClick={() => setFilter('resolved')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Resolvidos</div>
                <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "shadow-elegant cursor-pointer transition-all",
            filter === 'closed' && "ring-2 ring-border"
          )}
          onClick={() => setFilter('closed')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Closeds</div>
                <div className="text-2xl font-bold">{stats.closed}</div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>
            {filter === 'all' ? 'Todos os Incidentes' : `Incidentes: ${getStatusBadge(filter).label}`}
            <span className="text-sm text-muted-foreground ml-2">({filteredIncidents.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIncidents.length > 0 ? (
            <div className="space-y-3">
              {filteredIncidents.map((inc, idx) => {
                const statusBadge = getStatusBadge(inc.status);
                const severityBadge = getSeverityBadge(inc.severity);
                
                return (
                  <Link 
                    key={inc.id}
                    to={`/grc/incidents/${inc.id}`}
                    className="block"
                  >
                    <div className="p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/30 transition-all duration-base">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-medium">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{inc.title}</span>
                              <Badge variant="outline" className={severityBadge.color}>
                                {severityBadge.label}
                              </Badge>
                              <Badge variant="outline" className={statusBadge.color}>
                                {statusBadge.label}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {inc.description}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                                {new Date(inc.detected_at).toLocaleDateString('en-US')}
                              </span>
                              {inc.asset_name && (
                                <span className="flex items-center gap-1">
                                  <ArrowUpCircle className="h-3 w-3" strokeWidth={1.5} />
                                  {inc.asset_name}
                                </span>
                              )}
                              {inc.capa_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
                                  {inc.capa_count} CAPA(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertOctagon className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'No incidents registered.' 
                  : `No incident com status "${getStatusBadge(filter).label}".`}
              </p>
              <Link to="/grc/incidents/new">
                <button className="mt-4 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                  Register First Incident
                </button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="shadow-elegant bg-muted/30">
        <CardHeader>
          <CardTitle>About Incidents & CAPA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <div className="font-medium mb-1">🔍 Registro Incident</div>
            <p className="text-muted-foreground">
              Document all security incidents of security, including detection, impacto, assets affected and evidence.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1">🛠️ CAPA (Corrective Action & Preventive Action)</div>
            <p className="text-muted-foreground">
              Para cada incident, defina ações corretivas (resolve) e preventivas (prevent recurrence).
            </p>
          </div>
          <div>
            <div className="font-medium mb-1">📊 Standard Workflow</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Aberto</Badge>
              <span>→</span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Investigando</Badge>
              <span>→</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Resolvido</Badge>
              <span>→</span>
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border/50">Closed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


