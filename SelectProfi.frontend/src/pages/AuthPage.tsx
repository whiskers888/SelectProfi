import { type FormEvent, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  type LoginUserRequest,
  type RegisterUserRequest,
  type RegisterUserRole,
  isFetchBaseQueryError,
  useLoginUserMutation,
  useRegisterUserMutation,
} from '../shared/api/authApi'
import { setAuthSession } from '../app/authSessionSlice'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const publicRegistrationRoles = [
  { value: 'Applicant', label: 'Соискатель' },
  { value: 'Executor', label: 'Исполнитель' },
  { value: 'Customer', label: 'Заказчик' },
] as const

type RegistrationFormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: RegisterUserRole
}

type RegistrationFormErrors = Partial<Record<keyof RegistrationFormValues, string>>
type LoginFormValues = {
  email: string
  password: string
}

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>

type AuthMode = 'register' | 'login'
type SubmitState = {
  status: 'success' | 'error'
  message: string
}

const emptyRegistrationFormErrors: RegistrationFormErrors = {}
const emptyLoginFormErrors: LoginFormErrors = {}

type ServerProblemError = {
  title?: string
  detail?: string
  errors?: unknown
}

const roleLookup = new Set<string>(publicRegistrationRoles.map(({ value }) => value))
const registrationFieldNameMap: Record<string, keyof RegistrationFormValues> = {
  firstname: 'firstName',
  lastname: 'lastName',
  email: 'email',
  phone: 'phone',
  password: 'password',
  role: 'role',
}
const loginFieldNameMap: Record<string, keyof LoginFormValues> = {
  email: 'email',
  password: 'password',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeFieldName<TFieldName extends string>(
  value: string,
  fieldNameMap: Record<string, TFieldName>,
): TFieldName | null {
  return fieldNameMap[value.toLowerCase()] ?? null
}

function parseValidationErrors<TFieldName extends string>(
  errors: unknown,
  fieldNameMap: Record<string, TFieldName>,
): Partial<Record<TFieldName, string>> {
  if (!isRecord(errors)) {
    return {}
  }

  const fieldErrors: Partial<Record<TFieldName, string>> = {}

  Object.entries(errors).forEach(([rawField, messages]) => {
    const field = normalizeFieldName(rawField, fieldNameMap)
    if (!field) {
      return
    }

    if (!Array.isArray(messages)) {
      return
    }

    const firstMessage = messages.find((message) => typeof message === 'string')
    if (typeof firstMessage === 'string') {
      fieldErrors[field] = firstMessage
    }
  })

  return fieldErrors
}

function isPublicRegistrationRole(value: string): value is RegisterUserRole {
  return roleLookup.has(value)
}

function parseRegistrationServerError(
  status: number,
  data: unknown,
): { fieldErrors: RegistrationFormErrors; formMessage: string } {
  const fallbackMessage = 'Не удалось зарегистрироваться. Повторите попытку.'

  if (!isRecord(data)) {
    return { fieldErrors: emptyRegistrationFormErrors, formMessage: fallbackMessage }
  }

  const problem = data as ServerProblemError
  let fieldErrors: RegistrationFormErrors = {}

  if (status === 400) {
    fieldErrors = parseValidationErrors(problem.errors, registrationFieldNameMap)
  }

  if (status === 409 && Array.isArray(problem.errors)) {
    problem.errors.forEach((errorItem) => {
      if (!isRecord(errorItem)) {
        return
      }

      const rawField = typeof errorItem.field === 'string' ? errorItem.field : ''
      const field = normalizeFieldName(rawField, registrationFieldNameMap)
      const message = typeof errorItem.message === 'string' ? errorItem.message : ''

      if (field && message) {
        fieldErrors[field] = message
      }
    })
  }

  const formMessage =
    typeof problem.detail === 'string' && problem.detail
      ? problem.detail
      : typeof problem.title === 'string' && problem.title
        ? problem.title
        : fallbackMessage

  return { fieldErrors, formMessage }
}

function parseLoginServerError(
  status: number,
  data: unknown,
): { fieldErrors: LoginFormErrors; formMessage: string } {
  const fallbackMessage = 'Не удалось выполнить вход. Повторите попытку.'

  if (!isRecord(data)) {
    return { fieldErrors: emptyLoginFormErrors, formMessage: fallbackMessage }
  }

  const problem = data as ServerProblemError
  const fieldErrors = status === 400 ? parseValidationErrors(problem.errors, loginFieldNameMap) : {}

  const formMessage =
    typeof problem.detail === 'string' && problem.detail
      ? problem.detail
      : typeof problem.title === 'string' && problem.title
        ? problem.title
        : fallbackMessage

  return { fieldErrors, formMessage }
}

export function AuthPage() {
  const dispatch = useDispatch()
  const [authMode, setAuthMode] = useState<AuthMode>('register')
  const [registerUser, { isLoading: isRegistrationLoading }] = useRegisterUserMutation()
  const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation()
  const [registrationErrors, setRegistrationErrors] = useState<RegistrationFormErrors>(
    emptyRegistrationFormErrors,
  )
  const [loginErrors, setLoginErrors] = useState<LoginFormErrors>(emptyLoginFormErrors)
  const [submitState, setSubmitState] = useState<SubmitState | null>(null)
  const isLoading = authMode === 'register' ? isRegistrationLoading : isLoginLoading

  function handleModeChange(nextMode: AuthMode) {
    setAuthMode(nextMode)
    setSubmitState(null)
    setRegistrationErrors(emptyRegistrationFormErrors)
    setLoginErrors(emptyLoginFormErrors)
  }

  function handleTabChange(nextMode: string) {
    if (nextMode === 'register' || nextMode === 'login') {
      handleModeChange(nextMode)
    }
  }

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget

    const formData = new FormData(formElement)
    const roleRawValue = String(formData.get('role') ?? '').trim()
    const role = isPublicRegistrationRole(roleRawValue)
      ? roleRawValue
      : publicRegistrationRoles[0].value

    const values: RegistrationFormValues = {
      firstName: String(formData.get('firstName') ?? '').trim(),
      lastName: String(formData.get('lastName') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      password: String(formData.get('password') ?? '').trim(),
      role,
    }

    const nextErrors: RegistrationFormErrors = {}

    if (!values.firstName) {
      nextErrors.firstName = 'Имя обязательно'
    }

    if (!values.lastName) {
      nextErrors.lastName = 'Фамилия обязательна'
    }

    if (!values.email) {
      nextErrors.email = 'Email обязателен'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Введите корректный email'
    }

    if (!values.password) {
      nextErrors.password = 'Пароль обязателен'
    }

    if (!isPublicRegistrationRole(roleRawValue)) {
      nextErrors.role = 'Роль обязательна'
    }

    setSubmitState(null)

    if (Object.keys(nextErrors).length > 0) {
      setRegistrationErrors(nextErrors)
      return
    }

    const payload: RegisterUserRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone ? values.phone : undefined,
      password: values.password,
      role: values.role,
    }

    setRegistrationErrors(nextErrors)

    try {
      const session = await registerUser(payload).unwrap()
      dispatch(setAuthSession(session))
      setSubmitState({ status: 'success', message: 'Регистрация выполнена успешно.' })
      formElement.reset()
    } catch (error) {
      if (isFetchBaseQueryError(error) && typeof error.status === 'number') {
        const parsedError = parseRegistrationServerError(error.status, error.data)
        setRegistrationErrors(parsedError.fieldErrors)
        setSubmitState({ status: 'error', message: parsedError.formMessage })
        return
      }

      setSubmitState({
        status: 'error',
        message: 'Не удалось зарегистрироваться. Повторите попытку.',
      })
    }
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget

    const formData = new FormData(formElement)
    const values: LoginFormValues = {
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? '').trim(),
    }

    const nextErrors: LoginFormErrors = {}

    if (!values.email) {
      nextErrors.email = 'Email обязателен'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Введите корректный email'
    }

    if (!values.password) {
      nextErrors.password = 'Пароль обязателен'
    }

    setSubmitState(null)

    if (Object.keys(nextErrors).length > 0) {
      setLoginErrors(nextErrors)
      return
    }

    const payload: LoginUserRequest = {
      email: values.email,
      password: values.password,
    }

    setLoginErrors(emptyLoginFormErrors)

    try {
      const session = await loginUser(payload).unwrap()
      dispatch(setAuthSession(session))
      setSubmitState({ status: 'success', message: 'Вход выполнен успешно.' })
      formElement.reset()
    } catch (error) {
      if (isFetchBaseQueryError(error) && typeof error.status === 'number') {
        const parsedError = parseLoginServerError(error.status, error.data)
        setLoginErrors(parsedError.fieldErrors)
        setSubmitState({ status: 'error', message: parsedError.formMessage })
        return
      }

      setSubmitState({
        status: 'error',
        message: 'Не удалось выполнить вход. Повторите попытку.',
      })
    }
  }

  return (
    <section className="page auth-page grid place-items-start">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>{authMode === 'register' ? 'Регистрация' : 'Вход'}</CardTitle>
          <CardDescription>
            {authMode === 'register'
              ? 'Создание аккаунта для работы в системе.'
              : 'Вход в существующий аккаунт.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={authMode} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register" onClick={() => handleModeChange('register')}>
                Регистрация
              </TabsTrigger>
              <TabsTrigger value="login" onClick={() => handleModeChange('login')}>
                Вход
              </TabsTrigger>
            </TabsList>

            {submitState ? (
              <Alert
                role={submitState.status === 'error' ? 'alert' : 'status'}
                variant={submitState.status === 'error' ? 'destructive' : 'success'}
              >
                {submitState.message}
              </Alert>
            ) : null}

            <TabsContent value="register">
              <form noValidate onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstName">Имя</Label>
                    <Input id="register-firstName" type="text" name="firstName" autoComplete="given-name" required />
                    {registrationErrors.firstName ? (
                      <p role="alert" className="text-xs text-destructive">
                        {registrationErrors.firstName}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-lastName">Фамилия</Label>
                    <Input id="register-lastName" type="text" name="lastName" autoComplete="family-name" required />
                    {registrationErrors.lastName ? (
                      <p role="alert" className="text-xs text-destructive">
                        {registrationErrors.lastName}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" type="email" name="email" autoComplete="email" required />
                    {registrationErrors.email ? (
                      <p role="alert" className="text-xs text-destructive">
                        {registrationErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Телефон</Label>
                    <Input id="register-phone" type="tel" name="phone" autoComplete="tel" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <Input
                      id="register-password"
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      required
                    />
                    {registrationErrors.password ? (
                      <p role="alert" className="text-xs text-destructive">
                        {registrationErrors.password}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-role">Роль</Label>
                    <select
                      id="register-role"
                      name="role"
                      defaultValue={publicRegistrationRoles[0].value}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {publicRegistrationRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {registrationErrors.role ? (
                      <p role="alert" className="text-xs text-destructive">
                        {registrationErrors.role}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form noValidate onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" name="email" autoComplete="email" required />
                    {loginErrors.email ? (
                      <p role="alert" className="text-xs text-destructive">
                        {loginErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input
                      id="login-password"
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      required
                    />
                    {loginErrors.password ? (
                      <p role="alert" className="text-xs text-destructive">
                        {loginErrors.password}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Вход...' : 'Войти'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  )
}
