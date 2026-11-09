import { AuthBrand } from './AuthBrand'
import { cn } from '@/lib/utils'

type AuthHeroPanelVariant = 'login' | 'register'

type AuthHeroPanelProps = {
  bullets: string[]
  description: string
  title: string
  variant: AuthHeroPanelVariant
}

export function AuthHeroPanel({ bullets, description, title, variant }: AuthHeroPanelProps) {
  const isLogin = variant === 'login'

  return (
    <aside
      className={cn(
        'auth-hero-enter flex h-full min-h-[300px] flex-col justify-between gap-10 p-8 md:p-10',
        isLogin
          ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground dark:from-secondary dark:via-secondary dark:to-card dark:text-secondary-foreground'
          : 'border-l border-border bg-gradient-to-br from-primary/10 via-muted to-background text-foreground max-md:border-l-0 max-md:border-t',
      )}
    >
      <AuthBrand inverted={isLogin} />

      <div className="space-y-5">
        <h2
          className={cn(
            'max-w-xl text-pretty text-3xl font-semibold leading-tight md:text-[2.1rem]',
            isLogin ? 'text-primary-foreground dark:text-secondary-foreground' : 'text-foreground',
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            'max-w-lg text-sm leading-relaxed md:text-[0.95rem]',
            isLogin ? 'text-primary-foreground/90 dark:text-secondary-foreground/90' : 'text-muted-foreground',
          )}
        >
          {description}
        </p>

        <ul className={cn('grid gap-2.5 text-sm', isLogin ? 'text-primary-foreground/90 dark:text-secondary-foreground/90' : 'text-muted-foreground')}>
          {bullets.map((bullet, index) => (
            <li
              key={bullet}
              className={cn(
                'auth-list-item inline-flex items-center gap-2',
                index === 1 && 'auth-list-item-delay-1',
                index === 2 && 'auth-list-item-delay-2',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 inline-block h-1.5 w-1.5 rounded-full',
                  isLogin ? 'bg-primary/20' : 'bg-primary',
                )}
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
