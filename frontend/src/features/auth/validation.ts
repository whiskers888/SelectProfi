import type { RegisterUserRole } from '@/shared/api/auth'
import { registrationRoleValueSet } from './constants'
import type {
  LoginFormErrors,
  LoginFormValues,
  RegistrationFormErrors,
  RegistrationFormValues,
} from './types'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const registrationPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,128}$/
const registrationPasswordPolicyMessage =
  'Пароль должен содержать 12+ символов, заглавную и строчную буквы, цифру и спецсимвол'

type NameParts = {
  firstName: string
  lastName: string
}

export function splitFullName(value: string): NameParts {
  const normalizedValue = value.trim().split(/\s+/).filter(Boolean)

  if (normalizedValue.length < 2) {
    return { firstName: '', lastName: '' }
  }

  const [firstName, ...lastNameParts] = normalizedValue

  return {
    firstName,
    lastName: lastNameParts.join(' '),
  }
}

export function isPublicRegistrationRole(value: string): value is RegisterUserRole {
  return registrationRoleValueSet.has(value as RegisterUserRole)
}

export function validateLoginValues(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}

  if (!values.email) {
    errors.email = 'Email обязателен'
  } else if (!emailRegex.test(values.email)) {
    errors.email = 'Введите корректный email'
  }

  if (!values.password) {
    errors.password = 'Пароль обязателен'
  }

  return errors
}

export function validateRegistrationValues(values: RegistrationFormValues): RegistrationFormErrors {
  const errors: RegistrationFormErrors = {}

  if (!values.fullName) {
    errors.fullName = 'Имя и фамилия обязательны'
  } else {
    const nameParts = splitFullName(values.fullName)
    if (!nameParts.firstName || !nameParts.lastName) {
      errors.fullName = 'Введите имя и фамилию'
    }
  }

  if (!values.email) {
    errors.email = 'Email обязателен'
  } else if (!emailRegex.test(values.email)) {
    errors.email = 'Введите корректный email'
  }

  if (!values.phone) {
    errors.phone = 'Телефон обязателен'
  }

  if (!values.password) {
    errors.password = 'Пароль обязателен'
  } else if (!registrationPasswordRegex.test(values.password)) {
    errors.password = registrationPasswordPolicyMessage
  }

  if (!isPublicRegistrationRole(values.role)) {
    errors.role = 'Роль обязательна'
  }

  if (values.role === 'Customer') {
    if (!values.customerLegalForm) {
      errors.customerLegalForm = 'Выберите юрформу'
    } else {
      if (!values.customerInn) {
        errors.customerInn = 'ИНН обязателен'
      }

      if (values.customerLegalForm === 'Ooo' && !values.customerEgrn) {
        errors.customerEgrn = 'Для ООО требуется ЕГРН'
      }

      if (values.customerLegalForm === 'Ip' && !values.customerEgrnip) {
        errors.customerEgrnip = 'Для ИП требуется ЕГРНИП'
      }

      if (!values.offerAccepted) {
        errors.offerAccepted = 'Необходимо принять условия оферты'
      }
    }
  }

  return errors
}
