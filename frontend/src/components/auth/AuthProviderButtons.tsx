import { cn } from '@/lib/utils'

export type AuthProviderKey = 'vk' | 'yandex' | 'telegram' | 'sber'

type AuthProviderButtonsProps = {
  disabled?: boolean
  layout?: 'grid' | 'inline'
  caption?: string
  onProviderClick: (provider: AuthProviderKey) => void
}

const providers: Array<{ key: AuthProviderKey; label: string; glyph: React.ReactNode }> = [
  {
    key: 'vk',
    label: 'VK ID',
    glyph: (
      <span className="grid h-5 w-5 place-items-center rounded bg-[#0077FF] text-[11px] font-bold text-white">
        VK
      </span>
    ),
  },
  {
    key: 'yandex',
    label: 'Яндекс ID',
    glyph: (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#FC3F1D] text-[11px] font-bold text-white">
        Я
      </span>
    ),
  },
  {
    key: 'telegram',
    label: 'Telegram',
    glyph: (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#2AABEE] text-white">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path d="M21 4L2.5 11.2l5.1 1.7L9 19l3.2-3.4 4.6 3.2L21 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </span>
    ),
  },
  {
    key: 'sber',
    label: 'Sber ID',
    glyph: (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#21A038] text-white">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path d="M6 12.5l4 4L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    ),
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
            {provider.glyph}
            <span className="truncate">{provider.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
