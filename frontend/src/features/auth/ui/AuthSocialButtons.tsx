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
      {/* @dvnull: Ранее social-блок логина был локально в LoginPage; вынесен в общий auth-компонент без изменения списка провайдеров и UX. */}
      <div className="relative text-center text-xs text-slate-500">
        <span className="relative z-10 bg-white px-2">{caption}</span>
        <span className="absolute inset-x-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {providers.map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onProviderClick(provider)}
            className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-px"
          >
            {provider}
          </Button>
        ))}
      </div>
    </div>
  )
}
