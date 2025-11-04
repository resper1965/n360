import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Activity, 
  Ticket,
  Settings,
  Radio
} from 'lucide-react'

export default function Sidebar({ isOpen }) {
  const location = useLocation()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Status', icon: Radio, path: '/status' },
    { name: 'SOC - Alertas', icon: AlertTriangle, path: '/soc/alerts' },
    { name: 'NOC - Problemas', icon: Activity, path: '/noc/problems' },
    { name: 'Tickets', icon: Ticket, path: '/tickets' },
  ]

  if (!isOpen) return null

  return (
    <aside className="w-64 bg-ness-surface border-r border-ness-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-ness-border">
        <h1 className="text-2xl font-medium">
          n<span className="text-ness-blue">360</span>
        </h1>
        <p className="text-xs text-ness-muted mt-1">Security Orchestrator</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-ness-blue text-white' 
                  : 'text-ness-muted hover:bg-ness-elevated hover:text-ness-text'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-ness-border">
        <div className="text-xs text-ness-muted">
          <p>ness. © 2025</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}

