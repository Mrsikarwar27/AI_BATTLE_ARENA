import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/context/AuthContext'
import { Sun, Moon, Swords, Info, Clock, LogOut, ChevronDown } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', icon: Swords },
  { to: '/about', label: 'About', icon: Info },
  { to: '/history', label: 'History', icon: Clock },
]

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?'
}

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    setMenuOpen(false)
    try {
      await logout()
      navigate('/', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="flex items-center justify-between px-5 md:px-16 max-w-[1280px] mx-auto h-16">
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0" aria-label="AI Battle Arena home">
          <img
            src="/owl.svg"
            alt="AI Battle Arena logo"
            className="h-8 w-8 rounded-lg"
          />
          <span className="font-heading text-xl font-bold tracking-tight text-primary">
            AI Battle Arena
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono tracking-wider transition-colors ${
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
          <div className="hidden sm:block w-px h-4 bg-border-default mx-1" />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated && user ? (
            <div className="relative ml-1">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Account menu for ${user.firstName} ${user.lastName}`}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border border-border-subtle bg-surface-container-lowest hover:border-border-default transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary"
                >
                  {initials(user.firstName, user.lastName)}
                </span>
                <span className="hidden md:block max-w-24 truncate text-sm font-medium text-on-surface">
                  {user.firstName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-on-surface-variant/60" />
              </button>
              {menuOpen && (
                <>
                  <button
                    aria-label="Close account menu"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-60 rounded-2xl bg-surface border border-border-subtle shadow-elevation p-2"
                  >
                    <div className="px-3 py-2.5 border-b border-border-subtle mb-1">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-on-surface-variant/60 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {loggingOut ? 'Logging out…' : 'Log out'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-primary text-on-primary hover:bg-on-primary-fixed-variant shadow-sm transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile secondary nav — compact row under the bar */}
      <div className="sm:hidden border-t border-border-subtle">
        <div className="flex items-center gap-1 px-4 py-1.5 max-w-[1280px] mx-auto overflow-x-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-colors whitespace-nowrap ${
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
        </div>
      </div>
    </nav>
  )
}

export function NavbarSpacer() {
  return <div className="h-[104px] sm:h-16" />
}
