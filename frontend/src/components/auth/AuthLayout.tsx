import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { LifeBuoy } from 'lucide-react'
import type { RootState } from '@/app/store'
import { routePaths } from '@/app/routePaths'
import { AuthBrandMark } from './AuthBrandMark'

type AuthLayoutProps = {
  children: ReactNode
  footerNote: string
}

export function AuthLayout({ children, footerNote }: AuthLayoutProps) {
  const hasAccessToken = useSelector((state: RootState) =>
    Boolean(state.authSession.session?.accessToken),
  )
  const homePath = hasAccessToken ? routePaths.app : routePaths.auth

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-8">
          <AuthBrandMark compact linkTo={homePath} />
          <nav className="flex items-center gap-1">
            <Link
              to={routePaths.faq}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-caption-meta text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              Помощь
            </Link>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-caption-meta text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span aria-hidden="true">🌐</span>
              RU
            </button>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-[580px]">{children}</div>
      </main>

      <footer className="border-t border-border bg-card/60 px-4 py-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-2 text-center text-caption-meta text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p className="m-0">{footerNote}</p>
          <p className="m-0">© 2026 КадрыТут · 152-ФЗ / ISO 27001</p>
        </div>
      </footer>
    </div>
  )
}
