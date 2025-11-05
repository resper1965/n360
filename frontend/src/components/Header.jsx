import { Menu, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        <button
          onClick={onMenuClick}
          className="mr-4 p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <h2 className="text-sm font-medium">Security Operations Center</h2>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
          </button>

          <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm hidden md:block">Admin</span>
          </button>
        </div>
      </div>
    </header>
  )
}

