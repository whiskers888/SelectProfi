import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/brand/BrandLogo'

type AuthBrandMarkProps = {
  inverted?: boolean
  compact?: boolean
  subtitle?: string
  className?: string
  linkTo?: string
}

export function AuthBrandMark({
  inverted = false,
  compact = false,
  subtitle,
  className,
  linkTo,
}: AuthBrandMarkProps) {
  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <BrandLogo className={compact ? 'h-8 w-8' : 'h-9 w-9'} alt="" />
      <div className="min-w-0">
        <span
          className={cn(
            'truncate font-semibold tracking-tight',
            compact ? 'text-sm' : 'text-base',
            inverted ? 'text-primary-foreground' : 'text-foreground',
          )}
        >
          КадрыТут
        </span>
        {subtitle ? (
          <p className={cn('mt-0.5 truncate text-caption-meta', inverted ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )

  if (!linkTo) {
    return content
  }

  return (
    <Link
      to={linkTo}
      aria-label="КадрыТут — на главную"
      className="rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  )
}
