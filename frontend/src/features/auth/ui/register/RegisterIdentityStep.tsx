import { ArrowRight, ChevronRight, Loader2, Mail, Phone } from 'lucide-react'
import { AuthAlert, AuthProviderButtons, CheckboxField, PasswordField, PhoneField, type AuthProviderKey } from '@/components/auth'
import type { FieldErrors } from '@/features/auth/lib/registrationValidation'
import { passwordPolicyHint } from '@/features/auth/lib/registrationValidation'
import type { RegistrationDraft } from '@/features/auth/model/registrationDraft'
import { cn } from '@/lib/utils'
import { roleMeta, roleTitle } from './registerMeta'
import type { DraftPatch, RegisterFormError } from './types'

type RegisterIdentityStepProps = {
  draft: RegistrationDraft
  errors: FieldErrors
  formError: RegisterFormError | null
  infoMessage: string | null
  isSending: boolean
  patch: DraftPatch
  onBack: () => void
  onChangeRole: () => void
  onSubmit: () => void
  onProviderClick: (provider: AuthProviderKey) => void
}

export function RegisterIdentityStep({
  draft,
  errors,
  formError,
  infoMessage,
  isSending,
  patch,
  onBack,
  onChangeRole,
  onSubmit,
  onProviderClick,
}: RegisterIdentityStepProps) {
  const meta = roleMeta[draft.role]
  const isPhone = draft.method === 'phone'

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-caption-meta text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Назад
      </button>

      <div className="mb-5 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
        <span className="flex min-w-0 items-center gap-1.5 text-caption-meta text-foreground">
          <span className="truncate">
            Роль: <span className="font-semibold">{roleTitle(draft.role)}</span>
          </span>
        </span>
        <button
          type="button"
          onClick={onChangeRole}
          className="inline-flex shrink-0 items-center gap-0.5 text-caption-meta font-medium text-primary hover:underline"
        >
          Сменить
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <h1 className="m-0 text-display-page-title text-foreground">Создайте аккаунт</h1>
      <p className="m-0 mt-2 text-body-default text-muted-foreground">{meta.identitySubtitle}</p>

      <div className="mt-5 flex rounded-lg bg-muted p-1" role="tablist" aria-label="Способ регистрации">
        <MethodTab
          active={isPhone}
          label="По телефону"
          icon={<Phone className="h-4 w-4" aria-hidden="true" />}
          onClick={() => patch({ method: 'phone' })}
        />
        <MethodTab
          active={!isPhone}
          label="По email"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          onClick={() => patch({ method: 'email' })}
        />
      </div>

      <div className="mt-4 space-y-4">
        {formError ? <AuthAlert tone="error" title={formError.title} description={formError.description} /> : null}
        {infoMessage ? <AuthAlert tone="info" title={infoMessage} /> : null}

        {isPhone ? (
          <PhoneField
            id="register-phone"
            label="Номер телефона"
            value={draft.phone}
            error={errors.phone}
            onChange={(digits) => patch({ phone: digits })}
          />
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="register-email" className="block text-caption-meta font-medium text-foreground">
              Корпоративный или личный email <span className="text-error">*</span>
            </label>
            <div
              className={cn(
                'flex h-10 items-center gap-2 rounded-md border bg-card px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
                errors.email ? 'border-error' : 'border-border',
              )}
            >
              <Mail className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={draft.email}
                onChange={(event) => patch({ email: event.target.value })}
                placeholder="corp@company.ru"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
                className="h-full w-full bg-transparent text-body-default text-foreground outline-none placeholder:text-text-tertiary"
              />
            </div>
            {errors.email ? (
              <p id="register-email-error" className="m-0 text-caption-meta text-error">
                {errors.email}
              </p>
            ) : null}
          </div>
        )}

        <PasswordField
          id="register-password"
          label="Пароль для входа"
          value={draft.password}
          error={errors.password}
          hint={passwordPolicyHint}
          autoComplete="new-password"
          onChange={(value) => patch({ password: value })}
          trailing={<span className="text-label-micro uppercase text-text-tertiary">Безопасный хэш SHA-256</span>}
        />

        <div className="space-y-3">
          <CheckboxField
            id="register-offer"
            checked={draft.offerAccepted}
            error={errors.offerAccepted}
            label="Я принимаю условия договора оферты и согласен на обработку персональных данных (152-ФЗ)"
            onChange={(checked) => patch({ offerAccepted: checked })}
          />
          <CheckboxField
            id="register-remember"
            checked={draft.rememberDevice}
            label="Запомнить это доверенное устройство"
            description="Безопасная сессия на 30 дней без повторного SMS-кода"
            onChange={(checked) => patch({ rememberDevice: checked })}
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-body-default font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isPhone ? 'Получить SMS-код подтверждения' : 'Получить код на почту'}
          {!isSending ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </button>

        <AuthProviderButtons
          caption="ИЛИ ЗАРЕГИСТРИРУЙТЕСЬ ЧЕРЕЗ"
          layout="grid"
          disabled={isSending}
          onProviderClick={onProviderClick}
        />
      </div>
    </div>
  )
}

function MethodTab({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-body-default transition-colors',
        active
          ? 'bg-card text-primary shadow-surface'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
