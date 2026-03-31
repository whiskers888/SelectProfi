import type { LoginFormErrors, RegistrationFormErrors } from './types'

type ServerProblemError = {
  detail?: string
  errors?: unknown
  title?: string
}

const registrationFieldNameMap: Record<string, keyof RegistrationFormErrors> = {
  company: 'companyName',
  companyname: 'companyName',
  customerregistration: 'customerInn',
  'customerregistration.companyname': 'companyName',
  'customerregistration.egrn': 'customerEgrn',
  'customerregistration.egrnip': 'customerEgrnip',
  'customerregistration.inn': 'customerInn',
  'customerregistration.legalform': 'customerLegalForm',
  email: 'email',
  firstname: 'fullName',
  fullname: 'fullName',
  lastname: 'fullName',
  offeracceptance: 'offerAccepted',
  'offeracceptance.version': 'offerAccepted',
  password: 'password',
  phone: 'phone',
  role: 'role',
}

const loginFieldNameMap: Record<string, keyof LoginFormErrors> = {
  email: 'email',
  password: 'password',
}

const requiredFieldMessageMap: Record<string, string> = {
  customerEgrn: 'Для ООО требуется ЕГРН',
  customerEgrnip: 'Для ИП требуется ЕГРНИП',
  customerInn: 'ИНН обязателен',
  customerLegalForm: 'Выберите юрформу',
  email: 'Email обязателен',
  fullName: 'Имя и фамилия обязательны',
  offerAccepted: 'Необходимо принять условия оферты',
  password: 'Пароль обязателен',
  phone: 'Телефон обязателен',
  role: 'Роль обязательна',
}

const passwordPolicyMessage =
  'Пароль должен содержать 12+ символов, заглавную и строчную буквы, цифру и спецсимвол'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeFieldName<TFieldName extends string>(
  value: string,
  fieldNameMap: Record<string, TFieldName>,
): TFieldName | null {
  return fieldNameMap[value.toLowerCase()] ?? null
}

function toLocalizedServerMessage(field: string | null, message: string): string {
  const normalizedMessage = message.trim()
  const loweredMessage = normalizedMessage.toLowerCase()

  if (!normalizedMessage) {
    return normalizedMessage
  }

  if (
    loweredMessage.includes('must match the regular expression') &&
    (field === 'password' || loweredMessage.includes('password'))
  ) {
    return passwordPolicyMessage
  }

  if (field && loweredMessage.includes('is required')) {
    return requiredFieldMessageMap[field] ?? normalizedMessage
  }

  if (
    (field === 'email' || loweredMessage.includes('email')) &&
    loweredMessage.includes('valid') &&
    loweredMessage.includes('address')
  ) {
    return 'Введите корректный email'
  }

  return normalizedMessage
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
      fieldErrors[field] = toLocalizedServerMessage(String(field), firstMessage)
    }
  })

  return fieldErrors
}

function parseArrayErrors<TFieldName extends string>(
  errors: unknown,
  fieldNameMap: Record<string, TFieldName>,
): Partial<Record<TFieldName, string>> {
  if (!Array.isArray(errors)) {
    return {}
  }

  const fieldErrors: Partial<Record<TFieldName, string>> = {}

  errors.forEach((errorItem) => {
    if (!isRecord(errorItem)) {
      return
    }

    const rawField = typeof errorItem.field === 'string' ? errorItem.field : ''
    const field = normalizeFieldName(rawField, fieldNameMap)
    const message = typeof errorItem.message === 'string' ? errorItem.message : ''

    if (field && message && !fieldErrors[field]) {
      fieldErrors[field] = toLocalizedServerMessage(String(field), message)
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
    fieldErrors = {
      ...parseArrayErrors(problem.errors, registrationFieldNameMap),
      ...parseValidationErrors(problem.errors, registrationFieldNameMap),
    }
  }

  if (status === 409) {
    fieldErrors = {
      ...fieldErrors,
      ...parseArrayErrors(problem.errors, registrationFieldNameMap),
    }
  }

  const translatedDetail =
    typeof problem.detail === 'string' ? toLocalizedServerMessage(null, problem.detail) : ''
  const translatedTitle =
    typeof problem.title === 'string' ? toLocalizedServerMessage(null, problem.title) : ''

  const formMessage =
    translatedDetail ||
    translatedTitle ||
    (Object.keys(fieldErrors).length > 0
      ? 'Проверьте корректность заполнения полей формы.'
      : fallbackMessage)

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
  const fieldErrors =
    status === 400
      ? {
          ...parseArrayErrors(problem.errors, loginFieldNameMap),
          ...parseValidationErrors(problem.errors, loginFieldNameMap),
        }
      : {}

  const translatedDetail =
    typeof problem.detail === 'string' ? toLocalizedServerMessage(null, problem.detail) : ''
  const translatedTitle =
    typeof problem.title === 'string' ? toLocalizedServerMessage(null, problem.title) : ''

  const formMessage =
    translatedDetail ||
    translatedTitle ||
    (Object.keys(fieldErrors).length > 0
      ? 'Проверьте корректность заполнения полей формы.'
      : fallbackMessage)

  return { fieldErrors, formMessage }
}
