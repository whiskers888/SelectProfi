import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthFormShellProps = {
  actionHref: string
  actionLabel: string
  actionText: string
  children: ReactNode
  description: string
  status?: ReactNode
  title: string
}

export function AuthFormShell({
  actionHref,
  actionLabel,
  actionText,
  children,
  description,
  status,
  title,
}: AuthFormShellProps) {
  return (
    <>
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </header>

      {status ? <div className="mb-5">{status}</div> : null}

      <div className="space-y-5">{children}</div>

      <footer className="mt-6 text-center text-sm text-muted-foreground">
        {actionText}{' '}
        <Link
          className="font-semibold text-primary transition-colors hover:text-primary"
          to={actionHref}
        >
          {actionLabel}
        </Link>
      </footer>
    </>
  )
}
