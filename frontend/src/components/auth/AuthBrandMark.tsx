import { cn } from '@/lib/utils'

type AuthBrandMarkProps = {
  inverted?: boolean
  compact?: boolean
  subtitle?: string
  className?: string
}

export function AuthBrandMark({
  inverted = false,
  compact = false,
  subtitle,
  className,
}: AuthBrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span
        className={cn(
          'grid place-items-center rounded-lg',
          compact ? 'h-8 w-8' : 'h-9 w-9',
          inverted ? 'bg-card/10 text-primary' : 'bg-primary text-primary-foreground',
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className={compact ? 'h-5 w-5' : 'h-5 w-5'} fill="none">
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          <path
            d="M7.4 7.4a6.5 6.5 0 0 0 0 9.2M16.6 16.6a6.5 6.5 0 0 0 0-9.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 19.4a10.5 10.5 0 0 0 0-14.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'truncate font-semibold tracking-tight',
              compact ? 'text-sm' : 'text-base',
              inverted ? 'text-primary-foreground' : 'text-foreground',
            )}
          >
            КадрыТут
          </span>
          <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-label-micro uppercase text-secondary-foreground">
            Платформа
          </span>
        </div>
        {subtitle ? (
          <p className={cn('mt-0.5 truncate text-caption-meta', inverted ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}
