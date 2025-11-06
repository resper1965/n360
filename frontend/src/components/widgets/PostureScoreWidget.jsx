/**
 * Posture Score Widget
 * Exibe resumo of postura of segurança (SIEM SCA) no CISO Dashboard
 */

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function PostureScoreWidget() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`${window.location.origin}/api/posture/summary`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch dados of postura');
        }
        
        const data = await res.json();
        setSummary(data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching posture summary:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
    const interval = setInterval(fetchSummary, 60000); // 1min
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            Carregando postura...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-elegant">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Postura of Segurança</CardTitle>
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
            <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">
            Erro: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card 
      className="shadow-elegant hover:shadow-elegant-hover transition-all duration-base cursor-pointer group"
      onClick={() => navigate('/soc/posture')}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Postura of Segurança</CardTitle>
        <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-colors">
          <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Geral */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-xs text-muted-foreground">Score Geral</span>
            <span className={cn("text-2xl font-bold", getScoreColor(summary.score))}>
              {summary.score}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden border border-border/50">
            <div
              className={cn("h-full transition-all duration-slow", getScoreBg(summary.score))}
              style={{ width: `${summary.score}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-green-500/5 border border-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500 mb-1" strokeWidth={1.5} />
            <div className="text-lg font-bold text-green-500">{summary.passed}</div>
            <div className="text-xs text-muted-foreground">Passou</div>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-red-500/5 border border-red-500/10">
            <XCircle className="h-4 w-4 text-red-500 mb-1" strokeWidth={1.5} />
            <div className="text-lg font-bold text-red-500">{summary.failed}</div>
            <div className="text-xs text-muted-foreground">Falhou</div>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50 border border-border/50">
            <AlertCircle className="h-4 w-4 text-muted-foreground mb-1" strokeWidth={1.5} />
            <div className="text-lg font-bold">{summary.not_applicable}</div>
            <div className="text-xs text-muted-foreground">N/A</div>
          </div>
        </div>

        {/* Top Policies */}
        {summary.policies && summary.policies.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium">Top Policies:</div>
            {summary.policies.slice(0, 3).map((policy) => (
              <div key={policy.name} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate flex-1" title={policy.name}>
                  {policy.name.replace('CIS Benchmark for ', '').substring(0, 22)}...
                </span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-2",
                    policy.score >= 90 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    policy.score >= 70 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  )}
                >
                  {policy.score}%
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Ver Details */}
        <div className="pt-2 border-t border-border/50">
          <button className="text-xs text-primary hover:underline w-full text-left transition-colors">
            Ver Details →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}


