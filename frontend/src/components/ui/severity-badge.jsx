import { AlertCircle, AlertTriangle, Info, Shield } from 'lucide-react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

/**
 * Standardized Severity Badge
 * Consistent colors, icons, and styling across the platform
 */
export function SeverityBadge({ severity, className }) {
  const config = {
    critical: {
      label: 'Critical',
      icon: AlertCircle,
      className: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
    },
    high: {
      label: 'High',
      icon: AlertTriangle,
      className: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20',
    },
    medium: {
      label: 'Medium',
      icon: Info,
      className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
    },
    low: {
      label: 'Low',
      icon: Shield,
      className: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
    },
    info: {
      label: 'Info',
      icon: Info,
      className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
    },
  }

  const severityLower = severity?.toLowerCase() || 'info'
  const item = config[severityLower] || config.info
  const Icon = item.icon

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors',
        item.className,
        className
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {item.label}
    </Badge>
  )
}

/**
 * Standardized Status Badge
 * Consistent colors for status across the platform
 */
export function StatusBadge({ status, className }) {
  const config = {
    open: {
      label: 'Open',
      className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    'in_progress': {
      label: 'In Progress',
      className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    resolved: {
      label: 'Resolved',
      className: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    closed: {
      label: 'Closed',
      className: 'bg-muted/50 text-muted-foreground border-border',
    },
    pending: {
      label: 'Pending',
      className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    },
    active: {
      label: 'Active',
      className: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    inactive: {
      label: 'Inactive',
      className: 'bg-muted/50 text-muted-foreground border-border',
    },
  }

  const statusLower = status?.toLowerCase().replace(/\s+/g, '-') || 'pending'
  const item = config[statusLower] || config.pending

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-2.5 py-0.5 text-xs font-medium',
        item.className,
        className
      )}
    >
      {item.label}
    </Badge>
  )
}

