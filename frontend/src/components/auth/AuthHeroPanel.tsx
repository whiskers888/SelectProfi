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
          ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white'
          : 'border-l border-slate-200 bg-gradient-to-br from-blue-50 via-slate-100 to-slate-50 text-slate-900 max-md:border-l-0 max-md:border-t',
      )}
    >
      <AuthBrand inverted={isLogin} />

      <div className="space-y-5">
        <h2
          className={cn(
            'max-w-xl text-pretty text-3xl font-semibold leading-tight md:text-[2.1rem]',
            isLogin ? 'text-white' : 'text-slate-900',
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            'max-w-lg text-sm leading-relaxed md:text-[0.95rem]',
            isLogin ? 'text-blue-100' : 'text-slate-600',
          )}
        >
          {description}
        </p>

        <ul className={cn('grid gap-2.5 text-sm', isLogin ? 'text-blue-50' : 'text-slate-700')}>
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
                  isLogin ? 'bg-blue-200' : 'bg-blue-600',
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
