import type { LoginFormErrors, RegistrationFormErrors } from './types'

type ServerProblemError = {
  detail?: string
  errors?: unknown
  title?: string
}

const registrationFieldNameMap: Record<string, keyof RegistrationFormErrors> = {
  company: 'company',
  email: 'email',
  firstname: 'fullName',
  fullname: 'fullName',
  lastname: 'fullName',
  password: 'password',
  phone: 'phone',
  role: 'role',
}

const loginFieldNameMap: Record<string, keyof LoginFormErrors> = {
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
    if (!field || !Array.isArray(messages)) {
      return
    }

    const firstMessage = messages.find((message) => typeof message === 'string')

    if (typeof firstMessage === 'string' && !fieldErrors[field]) {
      fieldErrors[field] = firstMessage
    }
  })

  return fieldErrors
}

export function parseRegistrationServerError(
  status: number,
  data: unknown,
): { fieldErrors: RegistrationFormErrors; formMessage: string } {
  const fallbackMessage = 'Не удалось зарегистрироваться. Повторите попытку.'

  if (!isRecord(data)) {
    return { fieldErrors: {}, formMessage: fallbackMessage }
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

      if (field && message && !fieldErrors[field]) {
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

export function parseLoginServerError(
  status: number,
  data: unknown,
): { fieldErrors: LoginFormErrors; formMessage: string } {
  const fallbackMessage = 'Не удалось выполнить вход. Повторите попытку.'

  if (!isRecord(data)) {
    return { fieldErrors: {}, formMessage: fallbackMessage }
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
