import type { RegisterUserRole } from '@/shared/api/auth'
import { registrationRoleValueSet } from './constants'
import type {
  LoginFormErrors,
  LoginFormValues,
  RegistrationFormErrors,
  RegistrationFormValues,
} from './types'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  } else if (values.password.length < 8) {
    errors.password = 'Минимум 8 символов'
  }

  if (!isPublicRegistrationRole(values.role)) {
    errors.role = 'Роль обязательна'
  }

  return errors
}
