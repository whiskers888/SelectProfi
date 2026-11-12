import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Mail } from 'lucide-react'
import {
  AuthAlert,
  AuthCard,
  AuthProviderButtons,
  CheckboxField,
  PasswordField,
  PhoneField,
  type AuthProviderKey,
} from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { routePaths } from '@/app/routePaths'
import { LoginIdentifierTabs } from './LoginIdentifierTabs'
import type { LoginAlert, LoginFieldErrors, LoginMethod } from './loginTypes'

type LoginFormProps = {
  method: LoginMethod
  email: string
  phone: string
  password: string
  remember: boolean
  errors: LoginFieldErrors
  alert: LoginAlert
  isLoading: boolean
  onMethodChange: (method: LoginMethod) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (digits: string) => void
  onPasswordChange: (value: string) => void
  onRememberChange: (checked: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onRecoveryClick: () => void
  onProviderClick: (provider: AuthProviderKey) => void
}

const identifierInputClassName =
  'h-10 rounded-md border-border bg-card pl-3 pr-10 text-body-default text-foreground placeholder:text-text-tertiary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-0'

export function LoginForm({
  method,
  email,
  phone,
  password,
  remember,
  errors,
  alert,
  isLoading,
  onMethodChange,
  onEmailChange,
  onPhoneChange,
  onPasswordChange,
  onRememberChange,
  onSubmit,
  onRecoveryClick,
  onProviderClick,
}: LoginFormProps) {
  return (
    <AuthCard className="mx-auto max-w-[420px]">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <BadgeCheck className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-headline-section font-semibold tracking-tight text-foreground">
              КадрыТут
            </span>
            <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-label-micro uppercase text-secondary-foreground">
              B2B
            </span>
          </div>
          <p className="m-0 mt-1 text-caption-meta text-muted-foreground">
            КадрыТут · Подбор персонала
          </p>
        </div>
      </div>

      <div className="mb-5">
        <h1 className="m-0 text-display-page-title font-semibold tracking-tight text-foreground">
          Вход в платформу
        </h1>
        <p className="m-0 mt-1 text-caption-meta text-muted-foreground">
          Управление подбором, кандидатами и безопасными сделками
        </p>
      </div>

      <LoginIdentifierTabs method={method} onChange={onMethodChange} />

      {alert ? (
        <AuthAlert tone={alert.tone} title={alert.title} className="mb-4" />
      ) : null}

      <form
        id="login-form-panel"
        role="tabpanel"
        aria-labelledby={`login-tab-${method}`}
        noValidate
        aria-busy={isLoading}
        onSubmit={onSubmit}
        className="grid gap-4"
      >
        {method === 'email' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="login-email" className="text-caption-meta font-medium text-foreground">
                Рабочий email
              </label>
              <span
                aria-hidden="true"
                className="text-label-micro uppercase tracking-wider text-text-tertiary"
              >
                Корпоративный
              </span>
            </div>
            <div className="relative">
              <Input
                id="login-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="name@company.ru"
                value={email}
                disabled={isLoading}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                onChange={(event) => onEmailChange(event.target.value)}
                className={cn(identifierInputClassName, errors.email && 'border-error')}
              />
              <Mail
                className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-tertiary"
                aria-hidden="true"
              />
            </div>
            {errors.email ? (
              <p id="login-email-error" className="m-0 text-caption-meta text-error">
                {errors.email}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 text-label-micro uppercase tracking-wider text-text-tertiary"
            >
              СМС-код
            </span>
            <PhoneField
              id="login-phone"
              label="Номер телефона"
              value={phone}
              error={errors.phone}
              disabled={isLoading}
              onChange={onPhoneChange}
            />
          </div>
        )}

        <PasswordField
          id="login-password"
          label="Пароль"
          value={password}
          error={errors.password}
          disabled={isLoading}
          onChange={onPasswordChange}
          trailing={
            <button
              type="button"
              onClick={onRecoveryClick}
              className="text-caption-meta font-medium text-primary transition-colors hover:text-primary/80"
            >
              Забыли пароль?
            </button>
          }
        />

        <CheckboxField
          id="login-remember"
          checked={remember}
          label="Запомнить устройство"
          description="Безопасное запоминание: мы не храним пароль, только защищённый токен"
          disabled={isLoading}
          onChange={onRememberChange}
        />

        <div className="grid gap-2 pt-1">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-primary text-body-default font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:bg-primary/60"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                  aria-hidden="true"
                />
                Входим...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Продолжить
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
            )}
          </Button>
          {isLoading ? (
            <p className="m-0 text-center text-caption-meta text-muted-foreground">
              Проверяем данные и открываем рабочее пространство...
            </p>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <AuthProviderButtons
          disabled={isLoading}
          caption="ИЛИ ВОЙДИТЕ ЧЕРЕЗ"
          onProviderClick={onProviderClick}
        />
      </div>

      <div className="mt-5 text-center">
        <p className="m-0 text-caption-meta text-muted-foreground">
          Ещё нет аккаунта?{' '}
          <Link
            to={routePaths.authJoin}
            className="text-caption-meta font-medium text-primary transition-colors hover:text-primary/80"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
