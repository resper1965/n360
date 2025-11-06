import { useState, useEffect } from 'react'
import { Activity, Server } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ProblemsPage() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProblems()
    
    const subscription = supabase
      .channel('problems')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'problems' }, loadProblems)
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  async function loadProblems() {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setProblems(data || [])
    } catch (error) {
      console.error('Error loading problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      disaster: 'bg-red-500/20 text-red-400',
      high: 'bg-orange-500/20 text-orange-400',
      average: 'bg-yellow-500/20 text-yellow-400',
      warning: 'bg-blue-500/20 text-blue-400',
      info: 'bg-muted/300/20 text-muted-foreground'
    }
    return colors[severity] || colors.info
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Problems</h1>
        <p className="text-ness-muted mt-1">Monitoring system problems</p>
      </div>

      <div className="bg-ness-surface border border-ness-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-ness-muted">Loading problems...</div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center text-ness-muted">
            <Server size={48} className="mx-auto mb-3 opacity-50 text-green-500" />
            <p>No problem active</p>
            <p className="text-sm mt-2">System operating normally</p>
          </div>
        ) : (
          <div className="divide-y divide-ness-border">
            {problems.map((problem) => (
              <div key={problem.id} className="p-6 hover:bg-ness-elevated transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(problem.severity)}`}>
                        {problem.severity}
                      </span>
                      <span className="text-xs text-ness-muted">{problem.source}</span>
                      <span className="text-xs text-ness-muted">
                        {new Date(problem.created_at).toLocaleString('en-US')}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-ness-text mb-1">{problem.name}</h3>
                    <p className="text-sm text-ness-muted">{problem.description}</p>
                  </div>

                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    problem.status === 'active' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {problem.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

