import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthFormShell, AuthHeroPanel, AuthSplitLayout, AuthStatusBanner } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { FormFieldError } from '@/components/ui/form-feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  defaultRegistrationRole,
  registrationRoleNameMap,
  registrationRoleOptions,
} from '@/features/auth/constants'
import { parseRegistrationServerError } from '@/features/auth/error-parsing'
import { useRegisterUseCase } from '@/features/auth/model'
import type {
  RegistrationFormErrors,
  RegistrationFormValues,
  SubmitState,
} from '@/features/auth/types'
import {
  isPublicRegistrationRole,
  splitFullName,
  validateRegistrationValues,
} from '@/features/auth/validation'

const defaultRegistrationState: SubmitState = {
  status: 'idle',
  message: 'Заполните форму для создания аккаунта.',
}

const defaultRegistrationErrors: RegistrationFormErrors = {}

export function RegisterPage() {
  const navigate = useNavigate()
  const { executeDemoRegistration, executeRegister, isApiError, isLoading } = useRegisterUseCase()
  const [errors, setErrors] = useState<RegistrationFormErrors>(defaultRegistrationErrors)
  const [submitState, setSubmitState] = useState<SubmitState>(defaultRegistrationState)
  const [registrationRole, setRegistrationRole] = useState(defaultRegistrationRole)
  const timeoutRef = useRef<number | null>(null)

  function clearPendingNavigation() {
    if (!timeoutRef.current) {
      return
    }

    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  function navigateToPreviewAfterDelay(role: string) {
    clearPendingNavigation()
    timeoutRef.current = window.setTimeout(() => {
      navigate(`/preview?role=${encodeURIComponent(role)}`)
    }, 450)
  }

  useEffect(
    () => () => {
      if (!timeoutRef.current) {
        return
      }

      window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  function handleRoleChange(nextRole: string) {
    if (!isPublicRegistrationRole(nextRole)) {
      return
    }

    setRegistrationRole(nextRole)

    if (errors.role) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        role: undefined,
      }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget

    const formData = new FormData(formElement)
    const values: RegistrationFormValues = {
      fullName: String(formData.get('fullName') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      company: String(formData.get('company') ?? '').trim(),
      password: String(formData.get('password') ?? '').trim(),
      role: registrationRole,
    }

    const nextErrors = validateRegistrationValues(values)

    setSubmitState(defaultRegistrationState)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setSubmitState({
        status: 'error',
        message: 'Проверьте обязательные поля формы и повторите отправку.',
      })
      return
    }

    const { firstName, lastName } = splitFullName(values.fullName)

    setErrors(defaultRegistrationErrors)
    setSubmitState({
      status: 'loading',
      message: 'Создаем аккаунт и готовим рабочее пространство...',
    })

    try {
      await executeRegister({
        firstName,
        lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role,
      })
      formElement.reset()
      setRegistrationRole(defaultRegistrationRole)
      setSubmitState({
        status: 'success',
        message: 'Регистрация завершена. Перенаправляем в preview.',
      })
      navigateToPreviewAfterDelay(values.role)
    } catch (error) {
      if (isApiError(error) && typeof error.status === 'number') {
        const parsedError = parseRegistrationServerError(error.status, error.data)
        setErrors(parsedError.fieldErrors)
        setSubmitState({ status: 'error', message: parsedError.formMessage })
        return
      }

      setSubmitState({
        status: 'error',
        message: 'Не удалось зарегистрироваться. Повторите попытку.',
      })
    }
  }

  function handleQuickRegistration() {
    clearPendingNavigation()
    executeDemoRegistration()
    setSubmitState({
      status: 'success',
      message: `Demo-регистрация (${registrationRoleNameMap[registrationRole]}). Открываем preview.`,
    })
    navigateToPreviewAfterDelay(registrationRole)
  }

  return (
    <AuthSplitLayout
      reverseOnDesktop
      hero={
        <AuthHeroPanel
          variant="register"
          title="Регистрация за минуту, работа в системе сразу"
          description="После нажатия кнопки вы попадете в основной интерфейс: заказы, отклики, встречи, статистика и коммуникация."
          bullets={[
            'Единый рабочий кабинет заказчика',
            'Воронка закрытия вакансий',
            'Встречи и уведомления в реальном времени',
          ]}
        />
      }
    >
      <AuthFormShell
        title="Зарегистрироваться"
        description="Создайте аккаунт и сразу перейдите в рабочий интерфейс SelectProfi."
        status={<AuthStatusBanner state={submitState} />}
        actionText="Уже есть аккаунт?"
        actionLabel="Войти"
        actionHref="/login"
      >
        <form noValidate onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <Label className="text-slate-600">Роль</Label>

            <div className="md:hidden">
              <Select name="role" value={registrationRole} onValueChange={handleRoleChange}>
                <SelectTrigger
                  aria-label="Роль"
                  aria-invalid={Boolean(errors.role)}
                  aria-describedby={errors.role ? 'register-role-error' : undefined}
                  className="h-11 rounded-xl border-slate-200 text-slate-900 focus:ring-blue-600/30"
                >
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {registrationRoleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden md:block">
              <Tabs value={registrationRole} onValueChange={handleRoleChange}>
                <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
                  {registrationRoleOptions.map((role) => (
                    <TabsTrigger
                      key={role.value}
                      value={role.value}
                      className="h-9 rounded-lg px-2 text-xs text-slate-600 transition-colors data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      {role.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <p className="text-xs text-slate-500">
              {registrationRoleOptions.find((role) => role.value === registrationRole)?.description}
            </p>
            <FormFieldError id="register-role-error">{errors.role}</FormFieldError>
          </div>

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
              className="h-11 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/30"
            />
            <FormFieldError id="register-fullName-error">{errors.fullName}</FormFieldError>
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
              className="h-11 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/30"
            />
            <FormFieldError id="register-email-error">{errors.email}</FormFieldError>
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
              className="h-11 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/30"
            />
            <FormFieldError id="register-phone-error">{errors.phone}</FormFieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-company" className="text-slate-600">
              Компания
            </Label>
            <Input
              id="register-company"
              type="text"
              name="company"
              autoComplete="organization"
              placeholder="Название компании"
              aria-invalid={Boolean(errors.company)}
              aria-describedby={errors.company ? 'register-company-error' : undefined}
              className="h-11 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/30"
            />
            <FormFieldError id="register-company-error">{errors.company}</FormFieldError>
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
              className="h-11 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/30"
            />
            <FormFieldError id="register-password-error">{errors.password}</FormFieldError>
          </div>

          <div className="grid gap-2 pt-1">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 active:translate-y-px disabled:bg-blue-300"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
                    aria-hidden="true"
                  />
                  Регистрируем...
                </span>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleQuickRegistration}
              className="h-11 rounded-xl border-slate-200 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:translate-y-px"
            >
              Быстрая регистрация
            </Button>
          </div>
        </form>
      </AuthFormShell>
    </AuthSplitLayout>
  )
}
