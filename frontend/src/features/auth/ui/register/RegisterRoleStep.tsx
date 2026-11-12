import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Building2, IdCard, Info, Lock, ShieldCheck, UserRoundSearch, Landmark } from 'lucide-react'
import { useState } from 'react'
import type { RegistrationRole } from '@/features/auth/model/registrationDraft'
import { cn } from '@/lib/utils'

type RoleOption = {
  value: RegistrationRole
  title: string
  badge: string
  description: string
  hint: string
  icon: LucideIcon
}

const roleOptions: RoleOption[] = [
  {
    value: 'Customer',
    title: 'Заказчик',
    badge: 'Юрлица и ИП',
    description:
      'Ищу сотрудников — открываю вакансии, резервирую оплату в эскроу и отбираю финалистов',
    hint: 'Потребуется указать ИНН на следующем шаге.',
    icon: Building2,
  },
  {
    value: 'Executor',
    title: 'Исполнитель',
    badge: 'Самозанятые, ИП, Агентства',
    description:
      'Подбираю персонал — беру заказы в работу, веду кандидатов и получаю выплаты',
    hint: 'Потребуется подтвердить статус самозанятого или ИП на следующем шаге.',
    icon: UserRoundSearch,
  },
  {
    value: 'Applicant',
    title: 'Соискатель',
    badge: 'Физические лица',
    description:
      'Ищу работу — откликаюсь на проверенные вакансии и прохожу интервью без спама',
    hint: 'Потребуется прикрепить резюме или заполнить опыт на следующем шаге.',
    icon: IdCard,
  },
]

type RegisterRoleStepProps = {
  role: RegistrationRole
  error?: string
  onRoleChange: (role: RegistrationRole) => void
  onContinue: () => void
  onLoginClick: () => void
}

export function RegisterRoleStep({
  role,
  error,
  onRoleChange,
  onContinue,
  onLoginClick,
}: RegisterRoleStepProps) {
  const [focusedValue, setFocusedValue] = useState<RegistrationRole | null>(null)

  return (
    <div>
      <h1 className="m-0 text-display-page-title text-foreground">Как вы планируете работать?</h1>
      <p className="m-0 mt-2 text-body-default text-muted-foreground">
        Выберите вашу основную роль на платформе. Настройки прав и юридические реквизиты можно
        настроить позже.
      </p>

      <div
        role="radiogroup"
        aria-label="Роли в КадрыТут"
        aria-invalid={Boolean(error)}
        className="mt-5 flex flex-col gap-3"
      >
        {roleOptions.map((option) => {
          const isSelected = option.value === role
          const Icon = option.icon
          return (
            <div
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onRoleChange(option.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onRoleChange(option.value)
                }
              }}
              onFocus={() => setFocusedValue(option.value)}
              onBlur={() => setFocusedValue(null)}
              className={cn(
                'group relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                  ? 'border-primary/30 bg-secondary'
                  : 'border-border bg-card hover:bg-muted',
                focusedValue === option.value && 'ring-2 ring-ring',
              )}
            >
              <span
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-md',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-headline-section text-foreground">{option.title}</span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-label-micro uppercase',
                      isSelected
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {option.badge}
                  </span>
                </div>
                <p className="m-0 mt-1 text-body-default text-muted-foreground">
                  {option.description}
                </p>
                <span className="mt-1.5 flex items-center gap-1 text-caption-meta text-primary">
                  <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {option.hint}
                </span>
              </div>

              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-transparent',
                )}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="M3.5 8.5l3 3 6-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          )
        })}
      </div>

      {error ? (
        <p role="alert" className="m-0 mt-2 text-caption-meta text-error">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onContinue}
          disabled={!role}
          className={cn(
            'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-8 text-body-default font-semibold transition-colors sm:order-first',
            role
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'cursor-not-allowed bg-muted text-text-tertiary',
          )}
        >
          Продолжить
          {role ? (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Lock className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <p className="m-0 text-center text-caption-meta text-muted-foreground sm:text-right">
          Уже есть аккаунт?{' '}
          <button
            type="button"
            onClick={onLoginClick}
            className="font-medium text-primary hover:underline"
          >
            Войти
          </button>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-label-micro uppercase text-text-tertiary">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          152-ФЗ защита данных
        </span>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />
        <span className="flex items-center gap-1.5">
          <Landmark className="h-4 w-4 text-primary" aria-hidden="true" />
          Безопасный эскроу счет
        </span>
      </div>
    </div>
  )
}
