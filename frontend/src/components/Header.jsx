import { Menu, Bell, User } from 'lucide-react'

export default function Header({ onMenuClick }) {
  return (
    <header className="h-16 bg-ness-surface border-b border-ness-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-ness-elevated rounded-lg transition-colors"
        >
          <Menu size={20} className="text-ness-text" />
        </button>
        
        <h2 className="text-lg font-medium text-ness-text">
          Security Operations Center
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-ness-elevated rounded-lg transition-colors relative">
          <Bell size={20} className="text-ness-text" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="flex items-center gap-2 p-2 hover:bg-ness-elevated rounded-lg transition-colors">
          <User size={20} className="text-ness-text" />
          <span className="text-sm text-ness-text">Admin</span>
        </button>
      </div>
    </header>
  )
}

