import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SubmitState } from '@/features/auth/types'

type ActiveSubmitStatus = Exclude<SubmitState['status'], 'idle'>

const statusMeta: Record<
  ActiveSubmitStatus,
  { badgeLabel: string; badgeVariant: 'neutral' | 'default' | 'success' | 'destructive' }
> = {
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
  if (state.status === 'idle') {
    return null
  }

  const meta = statusMeta[state.status]

  return (
    <div
      className={cn(
        'animate-[auth-panel-enter_220ms_ease-out] rounded-xl border px-3 py-2.5 text-sm transition-colors',
        state.status === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : state.status === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-blue-200 bg-blue-50 text-blue-700',
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
