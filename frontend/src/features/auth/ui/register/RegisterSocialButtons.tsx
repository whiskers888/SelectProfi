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
      {/* @dvnull: Блок social-регистрации ранее находился в RegisterPage; вынесен в отдельный компонент без изменения списка провайдеров и UX. */}
      <div className="relative text-center text-xs text-slate-500">
        <span className="relative z-10 bg-white px-2">или зарегистрироваться через</span>
        <span className="absolute inset-x-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onSocialRegistration('Google')}
          className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-px"
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onSocialRegistration('VK ID')}
          className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-px"
        >
          VK ID
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onSocialRegistration('Яндекс')}
          className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-px"
        >
          Яндекс
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onSocialRegistration('Mail.ru')}
          className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-px"
        >
          Mail.ru
        </Button>
      </div>
    </div>
  )
}
