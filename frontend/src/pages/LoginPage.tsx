import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthFormShell, AuthHeroPanel, AuthSplitLayout, AuthStatusBanner } from '@/components/auth'
import { FormFieldError } from '@/components/ui/form-feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { parseLoginServerError } from '@/features/auth/error-parsing'
import { useLoginUseCase } from '@/features/auth/model'
import type { LoginFormErrors, SubmitState } from '@/features/auth/types'
import { validateLoginValues } from '@/features/auth/validation'

const defaultLoginState: SubmitState = {
  status: 'idle',
  message: 'Введите рабочие данные аккаунта SelectProfi.',
}

const defaultLoginErrors: LoginFormErrors = {}

export function LoginPage() {
  const navigate = useNavigate()
  const { executeDemoLogin, executeLogin, isApiError, isLoading } = useLoginUseCase()
  const [errors, setErrors] = useState<LoginFormErrors>(defaultLoginErrors)
  const [submitState, setSubmitState] = useState<SubmitState>(defaultLoginState)
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
      navigate('/preview?role=Customer')
    }, 400)
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget

    const formData = new FormData(formElement)

    const values = {
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? '').trim(),
    }

    const nextErrors = validateLoginValues(values)

    setSubmitState(defaultLoginState)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setSubmitState({
        status: 'error',
        message: 'Проверьте поля формы и повторите отправку.',
      })
      return
    }

    setErrors(defaultLoginErrors)
    setSubmitState({
      status: 'loading',
      message: 'Проверяем данные и открываем рабочее пространство...',
    })

    try {
      await executeLogin({
        email: values.email,
        password: values.password,
      })
      formElement.reset()
      setSubmitState({
        status: 'success',
        message: 'Вход выполнен успешно. Перенаправляем в preview.',
      })
      navigateToPreviewAfterDelay()
    } catch (error) {
      if (isApiError(error) && typeof error.status === 'number') {
        const parsedError = parseLoginServerError(error.status, error.data)
        setErrors(parsedError.fieldErrors)
        setSubmitState({ status: 'error', message: parsedError.formMessage })
        return
      }

      setSubmitState({
        status: 'error',
        message: 'Не удалось выполнить вход. Повторите попытку.',
      })
    }
  }

  function handleQuickLogin() {
    clearPendingNavigation()
    executeDemoLogin()
    setSubmitState({
      status: 'success',
      message: 'Demo-вход выполнен. Открываем preview.',
    })
    navigateToPreviewAfterDelay()
  }

  return (
    <AuthSplitLayout
      hero={
        <AuthHeroPanel
          variant="login"
          title="Вход в рабочее пространство подбора персонала"
          description="Управляйте заказами на вакансии, откликами и встречами в едином интерфейсе заказчика."
          bullets={[
            'Поиск и фильтрация кандидатов',
            'Командная работа с исполнителями',
            'Контроль воронки закрытия вакансий',
          ]}
        />
      }
    >
      <AuthFormShell
        title="Войти"
        description="Введите рабочие данные аккаунта SelectProfi."
        status={<AuthStatusBanner state={submitState} />}
        actionText="Нет аккаунта?"
        actionLabel="Зарегистрироваться"
        actionHref="/register"
      >
        <form noValidate onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-slate-600">
              Email
            </Label>
            <Input
              id="login-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@company.ru"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              className="h-11 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/30"
            />
            <FormFieldError id="login-email-error">{errors.email}</FormFieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-slate-600">
              Пароль
            </Label>
            <Input
              id="login-password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className="h-11 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/30"
            />
            <FormFieldError id="login-password-error">{errors.password}</FormFieldError>
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
                  Входим...
                </span>
              ) : (
                'Войти'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleQuickLogin}
              className="h-11 rounded-xl border-slate-200 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:translate-y-px"
            >
              Быстрый демо-вход
            </Button>
          </div>
        </form>
      </AuthFormShell>
    </AuthSplitLayout>
  )
}
