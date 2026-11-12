import { cn } from '@/lib/utils'

type AuthAlertProps = {
  tone: 'error' | 'info' | 'success' | 'warning'
  title: string
  description?: string
  className?: string
}

const toneStyles: Record<AuthAlertProps['tone'], string> = {
  error: 'border-error/30 bg-error-muted text-error-foreground',
  info: 'border-info/30 bg-info-muted text-info-foreground',
  success: 'border-success/30 bg-success-muted text-success-foreground',
  warning: 'border-warning/40 bg-warning-muted text-warning-foreground',
}

export function AuthAlert({ tone, title, description, className }: AuthAlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2.5 rounded-md border px-3 py-2.5', toneStyles[tone], className)}
    >
      <AlertGlyph tone={tone} />
      <div className="min-w-0">
        <p className="m-0 text-caption-meta font-semibold">{title}</p>
        {description ? <p className="m-0 mt-0.5 text-caption-meta opacity-80">{description}</p> : null}
      </div>
    </div>
  )
}

function AlertGlyph({ tone }: { tone: AuthAlertProps['tone'] }) {
  if (tone === 'success') {
    return (
      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (tone === 'info') {
    return (
      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 7.2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.9" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.6v4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11.2" r="0.9" fill="currentColor" />
    </svg>
  )
}
