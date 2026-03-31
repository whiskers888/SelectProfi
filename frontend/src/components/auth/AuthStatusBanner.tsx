import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SubmitState } from '@/features/auth/types'

const statusMeta: Record<
  SubmitState['status'],
  { badgeLabel: string; badgeVariant: 'neutral' | 'default' | 'success' | 'destructive' }
> = {
  idle: {
    badgeLabel: 'Пусто',
    badgeVariant: 'neutral',
  },
  loading: {
    badgeLabel: 'Отправка',
    badgeVariant: 'default',
  },
  success: {
    badgeLabel: 'Успех',
    badgeVariant: 'success',
  },
  error: {
    badgeLabel: 'Ошибка',
    badgeVariant: 'destructive',
  },
}

type AuthStatusBannerProps = {
  state: SubmitState
}

export function AuthStatusBanner({ state }: AuthStatusBannerProps) {
  const meta = statusMeta[state.status]

  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5 text-sm transition-colors',
        state.status === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : state.status === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : state.status === 'loading'
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-slate-100 text-slate-600',
      )}
      role={state.status === 'error' ? 'alert' : 'status'}
    >
      <div className="flex items-center gap-2.5">
        <Badge variant={meta.badgeVariant}>{meta.badgeLabel}</Badge>
        <p className="m-0">{state.message}</p>
      </div>
    </div>
  )
}
