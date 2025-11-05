import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Activity, 
  Ticket,
  Radio
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar({ isOpen }) {
  const location = useLocation()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'SOC - Alertas', icon: AlertTriangle, path: '/soc/alerts' },
    { name: 'NOC - Problemas', icon: Activity, path: '/noc/problems' },
    { name: 'Tickets', icon: Ticket, path: '/tickets' },
    { name: 'Status', icon: Radio, path: '/status' },
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
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
            {menuItems.map((item) => {
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

