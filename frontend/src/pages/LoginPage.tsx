import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout, normalizeRuPhoneForApi, type AuthProviderKey } from '@/components/auth'
import { useLoginUseCase } from '@/features/auth/model'
import { validateLoginForm, type FieldErrors } from '@/features/auth/lib/registrationValidation'
import { routePaths } from '@/app/routePaths'
import { LoginForm, LoginLegalNote, providerLabels, resolveLoginError } from '@/features/auth/ui/login'
import type { LoginAlert, LoginMethod } from '@/features/auth/ui/login'

const successAlertDelayMs = 300

const emptyErrors: FieldErrors = {}

export function LoginPage() {
  const navigate = useNavigate()
  const { executeLogin, isLoading, isApiError } = useLoginUseCase()
  const [method, setMethod] = useState<LoginMethod>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<FieldErrors>(emptyErrors)
  const [alert, setAlert] = useState<LoginAlert>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  function handleMethodChange(nextMethod: LoginMethod) {
    if (nextMethod === method) {
      return
    }

    setMethod(nextMethod)
    setAlert(null)
    setErrors((previous) => ({ ...previous, [method]: undefined }))
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    setErrors((previous) => ({ ...previous, email: undefined }))
  }

  function handlePhoneChange(value: string) {
    setPhone(value)
    setErrors((previous) => ({ ...previous, phone: undefined }))
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    setErrors((previous) => ({ ...previous, password: undefined }))
  }

  function handleRecoveryClick() {
    setAlert({ tone: 'info', title: 'Восстановление пароля пока недоступно' })
  }

  function handleProviderClick(provider: AuthProviderKey) {
    setAlert({
      tone: 'info',
      title: `Вход через ${providerLabels[provider]} пока недоступен. Используйте email и пароль.`,
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateLoginForm({ method, email, phone, password })

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setAlert({ tone: 'error', title: 'Проверьте поля формы и повторите отправку.' })
      return
    }

    setErrors(emptyErrors)
    setAlert(null)

    try {
      await executeLogin({
        email: method === 'email' ? email.trim() : undefined,
        phone: method === 'phone' ? normalizeRuPhoneForApi(phone) : undefined,
        password,
      })

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        navigate(routePaths.app)
      }, successAlertDelayMs)
    } catch (error) {
      if (isApiError(error)) {
        const status = typeof error.status === 'number' ? error.status : undefined
        const resolved = resolveLoginError(status, error.data)
        setErrors(resolved.fieldErrors)
        setAlert({ tone: 'error', title: resolved.title })
        return
      }

      setAlert({ tone: 'error', title: 'Не удалось выполнить вход. Повторите попытку.' })
    }
  }

  return (
    <AuthLayout footerNote="© 2026 КадрыТут — платформа автоматизации подбора персонала.">
      <LoginForm
        method={method}
        email={email}
        phone={phone}
        password={password}
        remember={remember}
        errors={errors}
        alert={alert}
        isLoading={isLoading}
        onMethodChange={handleMethodChange}
        onEmailChange={handleEmailChange}
        onPhoneChange={handlePhoneChange}
        onPasswordChange={handlePasswordChange}
        onRememberChange={setRemember}
        onSubmit={handleSubmit}
        onRecoveryClick={handleRecoveryClick}
        onProviderClick={handleProviderClick}
      />
      <LoginLegalNote />
    </AuthLayout>
  )
}
