import { Button } from '@/components/ui/button'

const providers = ['Google', 'VK ID', 'Яндекс', 'Mail.ru'] as const

type Props = {
  isLoading: boolean
  caption: string
  onProviderClick: (providerName: string) => void
}

export function AuthSocialButtons({ isLoading, caption, onProviderClick }: Props) {
  return (
    <div className="grid gap-3 pt-1">
      <div className="relative text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-card px-2">{caption}</span>
        <span className="absolute inset-x-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {providers.map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onProviderClick(provider)}
            className="h-10 rounded-xl border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:translate-y-px"
          >
            {provider}
          </Button>
        ))}
      </div>
    </div>
  )
}
