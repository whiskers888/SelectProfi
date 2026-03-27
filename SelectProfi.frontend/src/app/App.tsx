import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/auth', label: 'Auth' },
  { to: '/profile', label: 'Profile' },
] as const

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-semibold tracking-tight">SelectProfi</h1>
          <nav className="flex flex-wrap gap-2" aria-label="Основная навигация">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
