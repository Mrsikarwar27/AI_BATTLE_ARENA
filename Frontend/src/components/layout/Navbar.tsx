import { NavLink } from 'react-router-dom'
import { useTheme } from '@/providers/ThemeProvider'
import { Sun, Moon, Swords, Info, Clock } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', icon: Swords },
  { to: '/about', label: 'About', icon: Info },
  { to: '/history', label: 'History', icon: Clock },
]

export function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="flex items-center justify-between px-5 md:px-16 max-w-[1280px] mx-auto h-16">
        <NavLink to="/" className="font-heading text-xl font-bold tracking-tight text-primary shrink-0">
          AI Battle Arena
        </NavLink>

        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono tracking-wider transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
          <div className="w-px h-4 bg-border-default mx-1" />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </nav>
  )
}

export function NavbarSpacer() {
  return <div className="h-16" />
}
