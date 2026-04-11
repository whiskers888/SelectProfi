import { FormFieldError } from '@/components/ui/form-feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authInputClassName } from '@/features/auth/lib/registration/constants'
import type { RegistrationFormErrors } from '@/features/auth/types'

type Props = {
  errors: RegistrationFormErrors
}

export function RegisterCommonFields({ errors }: Props) {
  return (
    <>
      {/* @dvnull: Общие поля регистрации ранее рендерились в RegisterPage; вынесены в feature-компонент без изменения имен form-полей и aria-связок. */}
      <div className="space-y-2">
        <Label htmlFor="register-fullName" className="text-slate-600">
          Имя и фамилия
        </Label>
        <Input
          id="register-fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          placeholder="Иван Петров"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? 'register-fullName-error' : undefined}
          className={authInputClassName}
        />
        <FormFieldError id="register-fullName-error">{errors.fullName}</FormFieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-phone" className="text-slate-600">
          Телефон
        </Label>
        <Input
          id="register-phone"
          type="tel"
          name="phone"
          required
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'register-phone-error' : undefined}
          className={authInputClassName}
        />
        <FormFieldError id="register-phone-error">{errors.phone}</FormFieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-slate-600">
          Email
        </Label>
        <Input
          id="register-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.ru"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          className={authInputClassName}
        />
        <FormFieldError id="register-email-error">{errors.email}</FormFieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-slate-600">
          Пароль
        </Label>
        <Input
          id="register-password"
          type="password"
          name="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'register-password-error' : undefined}
          className={authInputClassName}
        />
        <FormFieldError id="register-password-error">{errors.password}</FormFieldError>
      </div>
    </>
  )
}
