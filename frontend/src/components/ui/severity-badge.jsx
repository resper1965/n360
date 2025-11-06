/** 🎨 ness. Design System - "Invisível Elegância" */
import { AlertCircle, AlertTriangle, Info, Shield } from 'lucide-react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

/**
 * SeverityBadge - Presente quando importa
 * Cores saturadas para severidades altas (critical/high)
 * Cores sutis para severidades baixas (low/info)
 */
export function SeverityBadge({ severity, className }) {
  const config = {
    critical: {
      label: 'Critical',
      icon: AlertCircle,
      className: 'bg-red-500/15 text-red-400 border-red-500/30 font-semibold hover:bg-red-500/20', // Presente!
    },
    high: {
      label: 'High',
      icon: AlertTriangle,
      className: 'bg-orange-500/12 text-orange-400 border-orange-500/25 font-medium hover:bg-orange-500/18',
    },
    medium: {
      label: 'Medium',
      icon: Info,
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15',
    },
    low: {
      label: 'Low',
      icon: Shield,
      className: 'bg-blue-500/8 text-blue-400 border-blue-500/15 hover:bg-blue-500/12', // Invisível
    },
    info: {
      label: 'Info',
      icon: Info,
      className: 'bg-slate-700/30 text-slate-400 border-slate-600/30 hover:bg-slate-700/40', // Invisível
    },
  }

  const severityLower = severity?.toLowerCase() || 'info'
  const item = config[severityLower] || config.info
  const Icon = item.icon

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 text-xs transition-all duration-base',
        item.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {item.label}
    </Badge>
  )
}

/**
 * StatusBadge - Estado visual claro
 * Cores indicam progresso e resultado
 */
export function StatusBadge({ status, className }) {
  const config = {
    open: {
      label: 'Open',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15',
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15',
    },
    'in_progress': {
      label: 'In Progress',
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15',
    },
    resolved: {
      label: 'Resolved',
      className: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15',
    },
    closed: {
      label: 'Closed',
      className: 'bg-slate-700/30 text-slate-400 border-slate-600/30 hover:bg-slate-700/40', // Invisível quando fechado
    },
    pending: {
      label: 'Pending',
      className: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/15',
    },
    active: {
      label: 'Active',
      className: 'bg-green-500/12 text-green-400 border-green-500/25 font-medium hover:bg-green-500/18', // Presente!
    },
    inactive: {
      label: 'Inactive',
      className: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15',
    },
  }

  const statusLower = status?.toLowerCase().replace(/\s+/g, '-') || 'pending'
  const item = config[statusLower] || config.pending

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-2.5 py-1 text-xs font-medium transition-all duration-base',
        item.className,
        className
      )}
    >
      {item.label}
    </Badge>
  )
}
