import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
import { AuthFormShell, AuthHeroPanel, AuthSplitLayout, AuthStatusBanner } from '@/components/auth'
import { Button } from '@/components/ui/button'
import {
  defaultRegistrationRole,
  registrationRoleOptions,
} from '@/features/auth/constants'
import { parseRegistrationServerError } from '@/features/auth/error-parsing'
import {
  currentOfferVersion,
  defaultCustomerLegalForm,
} from '@/features/auth/lib/registration/constants'
import {
  getRoleAnimationClassName,
  getRoleAnimationDirection,
  type RoleAnimationDirection,
} from '@/features/auth/lib/registration/role-animation'
import {
  buildRegisterPayload,
  buildRegistrationValuesFromFormData,
} from '@/features/auth/lib/registration/submission'
import { useRegisterUseCase } from '@/features/auth/model'
import { RegisterCommonFields } from '@/features/auth/ui/register/RegisterCommonFields'
import { RegisterCustomerFields } from '@/features/auth/ui/register/RegisterCustomerFields'
import { RegisterRoleSelector } from '@/features/auth/ui/register/RegisterRoleSelector'
import { RegisterSocialButtons } from '@/features/auth/ui/register/RegisterSocialButtons'
import type {
  RegistrationRole,
  RegistrationFormErrors,
  RegistrationFormValues,
  SubmitState,
} from '@/features/auth/types'
import {
  isPublicRegistrationRole,
  validateRegistrationValues,
} from '@/features/auth/validation'

const defaultRegistrationState: SubmitState = {
  status: 'idle',
  message: '',
}

const defaultRegistrationErrors: RegistrationFormErrors = {}
type CustomerLegalFormValue = RegistrationFormValues['customerLegalForm']

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

  function navigateToWorkspaceAfterDelay() {
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

    setRoleAnimationDirection(
      getRoleAnimationDirection(
        registrationRole,
        nextRole,
        registrationRoleOptions.map((roleOption) => roleOption.value as RegistrationRole),
      ),
    )
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

  function handleCustomerLegalFormChange(nextValue: Exclude<CustomerLegalFormValue, ''>) {
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
    const values: RegistrationFormValues = buildRegistrationValuesFromFormData({
      formData,
      registrationRole,
      customerLegalForm,
    })

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

    setErrors(defaultRegistrationErrors)
    setSubmitState({
      status: 'loading',
      message: 'Создаем аккаунт и готовим рабочее пространство...',
    })

    try {
      await executeRegister(buildRegisterPayload(values, currentOfferVersion))
      formElement.reset()
      setRegistrationRole(defaultRegistrationRole)
      setCustomerLegalForm(defaultCustomerLegalForm)
      setSubmitState({
        status: 'success',
        message: 'Регистрация завершена. Перенаправляем в рабочее пространство.',
      })
      navigateToWorkspaceAfterDelay()
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

  const roleAnimationClassName = getRoleAnimationClassName(roleAnimationDirection)

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
          <RegisterRoleSelector
            registrationRole={registrationRole}
            errors={errors}
            onRoleChange={handleRoleChange}
          />

          <div key={roleAnimationKey} className={`grid gap-4 ${roleAnimationClassName}`}>
            <RegisterCustomerFields
              section="fields"
              registrationRole={registrationRole}
              customerLegalForm={customerLegalForm}
              errors={errors}
              onCustomerLegalFormChange={handleCustomerLegalFormChange}
            />

            <RegisterCommonFields errors={errors} />

            <RegisterCustomerFields
              section="offer"
              registrationRole={registrationRole}
              customerLegalForm={customerLegalForm}
              errors={errors}
              onCustomerLegalFormChange={handleCustomerLegalFormChange}
            />

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

              <RegisterSocialButtons
                isLoading={isLoading}
                registrationRole={registrationRole}
                onSocialRegistration={handleSocialRegistration}
              />
            </div>
          </div>
        </form>
      </AuthFormShell>
    </AuthSplitLayout>
  )
}
