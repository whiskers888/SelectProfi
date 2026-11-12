import { cn } from '@/lib/utils'

export type AuthProviderKey = 'vk' | 'yandex' | 'gosuslugi' | 'sber'

type AuthProviderButtonsProps = {
  disabled?: boolean
  layout?: 'grid' | 'inline'
  caption?: string
  onProviderClick: (provider: AuthProviderKey) => void
}

const providers: Array<{ key: AuthProviderKey; label: string; icon: string }> = [
  {
    key: 'vk',
    label: 'VK ID',
    icon: '/providers/vk.svg',
  },
  {
    key: 'yandex',
    label: 'Яндекс ID',
    icon: '/providers/yandex.svg',
  },
  {
    key: 'gosuslugi',
    label: 'Госуслуги / ЕСИА',
    icon: '/providers/gosuslugi.svg',
  },
  {
    key: 'sber',
    label: 'Sber ID',
    icon: '/providers/sber.svg',
  },
]

export function AuthProviderButtons({
  disabled = false,
  layout = 'grid',
  caption = 'или войдите через',
  onProviderClick,
}: AuthProviderButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center">
        <span aria-hidden="true" className="h-px w-full bg-border" />
        <span className="absolute bg-card px-3 text-caption-meta uppercase tracking-wide text-text-tertiary">
          {caption}
        </span>
      </div>
      <div
        className={cn(
          'grid gap-2',
          layout === 'grid' ? 'grid-cols-2' : 'grid-cols-4',
        )}
      >
        {providers.map((provider) => (
          <button
            key={provider.key}
            type="button"
            disabled={disabled}
            onClick={() => onProviderClick(provider.key)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-2 text-caption-meta font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <img src={provider.icon} alt="" width={20} height={20} className="h-5 w-5 shrink-0" />
            <span className="truncate">{provider.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
