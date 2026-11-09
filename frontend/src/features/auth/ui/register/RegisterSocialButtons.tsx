import { Button } from '@/components/ui/button'
import type { RegistrationFormValues } from '@/features/auth/types'

type Props = {
  isLoading: boolean
  registrationRole: RegistrationFormValues['role']
  onSocialRegistration: (providerName: string) => void
}

export function RegisterSocialButtons({
  isLoading,
  registrationRole,
  onSocialRegistration,
}: Props) {
  if (registrationRole === 'Customer') {
    return null
  }

  return (
    <div className="grid gap-3 pt-1">
      <div className="relative text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-card px-2">или зарегистрироваться через</span>
        <span className="absolute inset-x-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onSocialRegistration('Google')}
          className="h-10 rounded-xl border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:translate-y-px"
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onSocialRegistration('VK ID')}
          className="h-10 rounded-xl border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:translate-y-px"
        >
          VK ID
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onSocialRegistration('Яндекс')}
          className="h-10 rounded-xl border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:translate-y-px"
        >
          Яндекс
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onSocialRegistration('Mail.ru')}
          className="h-10 rounded-xl border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:translate-y-px"
        >
          Mail.ru
        </Button>
      </div>
    </div>
  )
}
