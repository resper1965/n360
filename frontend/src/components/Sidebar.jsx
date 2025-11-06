import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Activity, 
  Ticket,
  Radio,
  Shield,
  Database,
  Skull,
  ShieldCheck,
  Bug,
  AlertOctagon,
  FileCheck,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Target,
  ShieldAlert,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar({ isOpen }) {
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState({
    dashboard: true,
    soc: true,
    noc: true,
    grc: true,
  })

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  const menuGroups = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        { name: 'CISO Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Executive', icon: TrendingUp, path: '/executive' },
      ]
    },
    {
      id: 'soc',
      name: 'SOC',
      icon: ShieldAlert,
      items: [
        { name: 'Alertas', icon: AlertTriangle, path: '/soc/alerts' },
        { name: 'Posture', icon: ShieldCheck, path: '/soc/posture' },
      ]
    },
    {
      id: 'noc',
      name: 'NOC',
      icon: Activity,
      items: [
        { name: 'Problemas', icon: Activity, path: '/noc/problems' },
      ]
    },
    {
      id: 'grc',
      name: 'GRC',
      icon: Shield,
      items: [
        { name: 'Assets', icon: Database, path: '/grc/assets' },
        { name: 'Threats', icon: Skull, path: '/grc/threats' },
        { name: 'Vulnerabilities', icon: Bug, path: '/grc/vulnerabilities' },
        { name: 'Risks', icon: Target, path: '/grc/risks' },
        { name: 'Controls', icon: Shield, path: '/grc/controls' },
        { name: 'Policies', icon: FileText, path: '/grc/policies' },
        { name: 'Compliance', icon: FileCheck, path: '/grc/compliance' },
        { name: 'Incidents', icon: AlertOctagon, path: '/grc/incidents' },
      ]
    },
  ]

  const singleItems = [
    { name: 'Tickets', icon: Ticket, path: '/tickets' },
    { name: 'Status', icon: Radio, path: '/status' },
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const isGroupActive = (items) => {
    return items.some(item => isActive(item.path))
  }

  if (!isOpen) return null

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-6">
          <h2 className="text-lg font-semibold">
            n<span className="text-primary">360</span>
          </h2>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {/* Menu Groups with Submenus */}
            {menuGroups.map((group) => {
              const GroupIcon = group.icon
              const isExpanded = expandedGroups[group.id]
              const groupActive = isGroupActive(group.items)
              
              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      groupActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon className="h-4 w-4" />
                      {group.name}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>

                  {/* Submenu Items */}
                  {isExpanded && (
                    <div className="ml-4 space-y-1 border-l-2 border-border pl-2">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.path)
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-primary text-primary-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Separator */}
            <div className="my-2 border-t" />

            {/* Single Items (no submenu) */}
            {singleItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">
              ness<span className="text-primary">.</span>
            </p>
            <p className="mt-1">v2.0.0 © 2025</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

