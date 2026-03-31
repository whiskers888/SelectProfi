import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
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
  message: '',
}

const defaultRegistrationErrors: RegistrationFormErrors = {}
type CustomerLegalFormValue = RegistrationFormValues['customerLegalForm']
type RoleAnimationDirection = 'left' | 'right' | 'none'
const customerLegalFormOptions = [
  { value: 'Ooo', label: 'ООО' },
  { value: 'Ip', label: 'ИП' },
] as const
const defaultCustomerLegalForm: CustomerLegalFormValue = 'Ooo'
const offerLink = '/offer'
const currentOfferVersion = 'public-offer-v1'
const authInputClassName =
  'h-11 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/30 autofill:[-webkit-text-fill-color:#0f172a] autofill:shadow-[inset_0_0_0px_1000px_#ffffff]'

function isCustomerLegalForm(value: string): value is Exclude<CustomerLegalFormValue, ''> {
  return value === 'Ooo' || value === 'Ip'
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { executeRegister, isApiError, isLoading } = useRegisterUseCase()
  const [errors, setErrors] = useState<RegistrationFormErrors>(defaultRegistrationErrors)
  const [submitState, setSubmitState] = useState<SubmitState>(defaultRegistrationState)
  const [registrationRole, setRegistrationRole] = useState(defaultRegistrationRole)
  const [roleAnimationDirection, setRoleAnimationDirection] = useState<RoleAnimationDirection>('none')
  const [roleAnimationKey, setRoleAnimationKey] = useState(0)
  const [customerLegalForm, setCustomerLegalForm] =
    useState<CustomerLegalFormValue>(defaultCustomerLegalForm)
  const timeoutRef = useRef<number | null>(null)

  function clearPendingNavigation() {
    if (!timeoutRef.current) {
      return
    }

    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  function navigateToPreviewAfterDelay() {
    clearPendingNavigation()
    timeoutRef.current = window.setTimeout(() => {
      // @dvnull: Ранее после регистрации активная роль пробрасывалась query-параметром, теперь берём из профиля backend.
      navigate(routePaths.app)
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

    if (nextRole === registrationRole) {
      return
    }

    const currentRoleIndex = registrationRoleOptions.findIndex(
      (roleOption) => roleOption.value === registrationRole,
    )
    const nextRoleIndex = registrationRoleOptions.findIndex((roleOption) => roleOption.value === nextRole)
    if (currentRoleIndex >= 0 && nextRoleIndex >= 0) {
      setRoleAnimationDirection(nextRoleIndex > currentRoleIndex ? 'right' : 'left')
    } else {
      setRoleAnimationDirection('right')
    }
    setRoleAnimationKey((previousKey) => previousKey + 1)

    setRegistrationRole(nextRole)
    if (nextRole !== 'Customer') {
      setCustomerLegalForm(defaultCustomerLegalForm)
    }

    setErrors((previousErrors) => ({
      ...previousErrors,
      role: undefined,
      companyName: undefined,
      customerEgrn: undefined,
      customerEgrnip: undefined,
      customerInn: undefined,
      customerLegalForm: undefined,
      offerAccepted: undefined,
    }))
  }

  function handleCustomerLegalFormChange(nextValue: string) {
    if (!isCustomerLegalForm(nextValue)) {
      return
    }

    setCustomerLegalForm(nextValue)
    setErrors((previousErrors) => ({
      ...previousErrors,
      customerLegalForm: undefined,
      customerEgrn: undefined,
      customerEgrnip: undefined,
    }))
  }

  function handleSocialRegistration(providerName: string) {
    setSubmitState({
      status: 'error',
      message: `Регистрация через ${providerName} пока недоступна. Используйте форму ниже.`,
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget

    const formData = new FormData(formElement)
    const values: RegistrationFormValues = {
      fullName: String(formData.get('fullName') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      companyName: String(formData.get('companyName') ?? '').trim(),
      customerInn: String(formData.get('customerInn') ?? '').trim(),
      customerLegalForm: registrationRole === 'Customer' ? customerLegalForm : '',
      customerEgrn:
        registrationRole === 'Customer' && customerLegalForm === 'Ooo'
          ? String(formData.get('customerEgrn') ?? '').trim()
          : '',
      customerEgrnip:
        registrationRole === 'Customer' && customerLegalForm === 'Ip'
          ? String(formData.get('customerEgrnip') ?? '').trim()
          : '',
      offerAccepted: registrationRole === 'Customer' ? formData.get('offerAccepted') === 'on' : false,
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
        customerRegistration:
          values.role === 'Customer' && values.customerLegalForm
            ? {
                inn: values.customerInn,
                legalForm: values.customerLegalForm,
                egrn: values.customerEgrn ? values.customerEgrn : undefined,
                egrnip: values.customerEgrnip ? values.customerEgrnip : undefined,
                companyName: values.companyName ? values.companyName : undefined,
              }
            : undefined,
        offerAcceptance:
          values.role === 'Customer'
            ? {
                accepted: values.offerAccepted,
                version: currentOfferVersion,
              }
            : undefined,
      })
      formElement.reset()
      setRegistrationRole(defaultRegistrationRole)
      setCustomerLegalForm(defaultCustomerLegalForm)
      setSubmitState({
        status: 'success',
        message: 'Регистрация завершена. Перенаправляем в preview.',
      })
      navigateToPreviewAfterDelay()
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

  const roleAnimationClassName =
    roleAnimationDirection === 'left'
      ? 'auth-role-switch-left'
      : roleAnimationDirection === 'right'
        ? 'auth-role-switch-right'
        : ''

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
        status={submitState.status !== 'idle' ? <AuthStatusBanner state={submitState} /> : null}
        actionText="Уже есть аккаунт?"
        actionLabel="Войти"
        actionHref={routePaths.auth}
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
                  className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 focus:ring-blue-600/30"
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

          <div key={roleAnimationKey} className={`grid gap-4 ${roleAnimationClassName}`}>
            {registrationRole === 'Customer' ? (
              <div className="space-y-2">
                <Label className="text-slate-600">Форма заказчика</Label>
                <Tabs value={customerLegalForm} onValueChange={handleCustomerLegalFormChange}>
                  <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
                    {customerLegalFormOptions.map((option) => (
                      <TabsTrigger
                        key={option.value}
                        value={option.value}
                        className="h-9 rounded-lg px-2 text-xs text-slate-600 transition-colors data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                      >
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <FormFieldError id="register-customerLegalForm-error">
                  {errors.customerLegalForm}
                </FormFieldError>
              </div>
            ) : null}

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

          {registrationRole === 'Customer' && customerLegalForm ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="register-companyName" className="text-slate-600">
                  Название компании
                </Label>
                <Input
                  id="register-companyName"
                  type="text"
                  name="companyName"
                  autoComplete="organization"
                  placeholder="Название компании"
                  aria-invalid={Boolean(errors.companyName)}
                  aria-describedby={errors.companyName ? 'register-companyName-error' : undefined}
                  className={authInputClassName}
                />
                <FormFieldError id="register-companyName-error">{errors.companyName}</FormFieldError>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-customerInn" className="text-slate-600">
                  ИНН
                </Label>
                <Input
                  id="register-customerInn"
                  type="text"
                  name="customerInn"
                  required
                  placeholder="10 или 12 цифр"
                  aria-invalid={Boolean(errors.customerInn)}
                  aria-describedby={errors.customerInn ? 'register-customerInn-error' : undefined}
                  className={authInputClassName}
                />
                <FormFieldError id="register-customerInn-error">{errors.customerInn}</FormFieldError>
              </div>

              {customerLegalForm === 'Ooo' ? (
                <div className="space-y-2">
                  <Label htmlFor="register-customerEgrn" className="text-slate-600">
                    ЕГРН
                  </Label>
                  <Input
                    id="register-customerEgrn"
                    type="text"
                    name="customerEgrn"
                    placeholder="13 цифр"
                    aria-invalid={Boolean(errors.customerEgrn)}
                    aria-describedby={errors.customerEgrn ? 'register-customerEgrn-error' : undefined}
                    className={authInputClassName}
                  />
                  <FormFieldError id="register-customerEgrn-error">{errors.customerEgrn}</FormFieldError>
                </div>
              ) : null}

              {customerLegalForm === 'Ip' ? (
                <div className="space-y-2">
                  <Label htmlFor="register-customerEgrnip" className="text-slate-600">
                    ЕГРНИП
                  </Label>
                  <Input
                    id="register-customerEgrnip"
                    type="text"
                    name="customerEgrnip"
                    placeholder="15 цифр"
                    aria-invalid={Boolean(errors.customerEgrnip)}
                    aria-describedby={errors.customerEgrnip ? 'register-customerEgrnip-error' : undefined}
                    className={authInputClassName}
                  />
                  <FormFieldError id="register-customerEgrnip-error">{errors.customerEgrnip}</FormFieldError>
                </div>
              ) : null}

            </>
          ) : null}

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

          {registrationRole === 'Customer' && customerLegalForm ? (
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                <input
                  name="offerAccepted"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white accent-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/30"
                  style={{ colorScheme: 'light' }}
                />
                <span>
                  Согласен с{' '}
                  <a
                    href={offerLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2"
                  >
                    офертой
                  </a>
                </span>
              </label>
              <FormFieldError id="register-offerAccepted-error">{errors.offerAccepted}</FormFieldError>
            </div>
          ) : null}

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

              {registrationRole !== 'Customer' ? (
                <div className="grid gap-3 pt-1">
                <div className="relative text-center text-xs text-slate-500">
                  <span className="relative z-10 bg-white px-2">или зарегистрироваться через</span>
                  <span className="absolute inset-x-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleSocialRegistration('Google')}
                    className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-px"
                  >
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleSocialRegistration('VK ID')}
                    className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-px"
                  >
                    VK ID
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleSocialRegistration('Яндекс')}
                    className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-px"
                  >
                    Яндекс
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleSocialRegistration('Mail.ru')}
                    className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:translate-y-px"
                  >
                    Mail.ru
                  </Button>
                </div>
                </div>
              ) : null}
            </div>
          </div>
        </form>
      </AuthFormShell>
    </AuthSplitLayout>
  )
}
