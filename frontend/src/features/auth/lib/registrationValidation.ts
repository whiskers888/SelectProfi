import type { JobSearchStatus, RegistrationDraft, RegistrationRole } from '@/features/auth/model/registrationDraft'
import { isCompleteRuPhone } from '@/components/auth/AuthFields'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const passwordPolicyRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/
export const passwordPolicyHint =
  'Минимум 8 символов, включая латинские буквы, цифры и спецсимвол'

export type FieldErrors = Partial<Record<string, string>>

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Пароль обязателен'
  if (!passwordPolicyRegex.test(password)) return passwordPolicyHint
  return undefined
}

export function validateLoginForm(values: { method: 'phone' | 'email'; email: string; phone: string; password: string }): FieldErrors {
  const errors: FieldErrors = {}

  if (values.method === 'email') {
    if (!values.email) errors.email = 'Email обязателен'
    else if (!emailRegex.test(values.email)) errors.email = 'Введите корректный email'
  } else {
    if (!values.phone) errors.phone = 'Телефон обязателен'
    else if (!isCompleteRuPhone(values.phone)) errors.phone = 'Введите номер полностью'
  }

  if (!values.password) errors.password = 'Пароль обязателен'

  return errors
}

export function validateIdentityStep(draft: RegistrationDraft): FieldErrors {
  const errors: FieldErrors = {}

  if (draft.method === 'phone') {
    if (!draft.phone) errors.phone = 'Телефон обязателен'
    else if (!isCompleteRuPhone(draft.phone)) errors.phone = 'Введите номер полностью'
  } else if (!draft.email) {
    errors.email = 'Email обязателен'
  } else if (!emailRegex.test(draft.email)) {
    errors.email = 'Введите корректный email'
  }

  const passwordError = validatePassword(draft.password)
  if (passwordError) errors.password = passwordError

  if (!draft.offerAccepted) errors.offerAccepted = 'Примите условия оферты и обработку данных'

  return errors
}

export function validateRoleStep(role: RegistrationRole | ''): FieldErrors {
  return role ? {} : { role: 'Выберите роль' }
}

export function validateProfileStep(draft: RegistrationDraft): FieldErrors {
  const errors: FieldErrors = {}

  if (!draft.firstName.trim()) errors.firstName = 'Имя обязательно'
  if (!draft.lastName.trim()) errors.lastName = 'Фамилия обязательна'

  if (draft.role === 'Customer') {
    if (!draft.customerLegalForm) errors.customerLegalForm = 'Выберите организационно-правовую форму'
    if (!draft.customerInn) errors.customerInn = 'ИНН обязателен'
    else if (!/^\d{10}(\d{2})?$/.test(draft.customerInn)) errors.customerInn = 'ИНН должен содержать 10 или 12 цифр'
    if (draft.customerLegalForm === 'Ooo' && !draft.customerEgrn) {
      errors.customerEgrn = 'Загрузите скан ЕГРЮЛ'
    }
    if (draft.customerLegalForm === 'Ip' && !draft.customerEgrnip) {
      errors.customerEgrnip = 'Укажите ОГРНИП'
    }
  }

  if (draft.role === 'Applicant') {
    if (!draft.applicantJobTitle.trim()) errors.applicantJobTitle = 'Укажите желаемую должность'
    if (!draft.applicantJobSearchStatus) errors.applicantJobSearchStatus = 'Выберите статус поиска'
  }

  if (draft.role === 'Executor') {
    if (!draft.executorEmploymentType) errors.executorEmploymentType = 'Выберите юридический статус'
    if (draft.executorInn && !/^\d{10}(\d{2})?$/.test(draft.executorInn)) {
      errors.executorInn = 'ИНН должен содержать 10 или 12 цифр'
    }
    if (draft.executorOgrnip && !/^\d{15}$/.test(draft.executorOgrnip)) {
      errors.executorOgrnip = 'ОГРНИП должен содержать 15 цифр'
    }
  }

  return errors
}

export const jobSearchStatusOptions: Array<{ value: JobSearchStatus; label: string; description: string; badge: string }> = [
  {
    value: 'Active',
    label: 'В активном поиске',
    description: 'Готов рассматривать офферы и тестовые задания',
    badge: 'Активен',
  },
  {
    value: 'OpenToOffers',
    label: 'Рассматриваю предложения',
    description: 'Открыт только к исключительным позициям',
    badge: 'Не спешу',
  },
  {
    value: 'NotLooking',
    label: 'Не в поиске работы',
    description: 'Профиль скрыт из выдачи прямого сорсинга',
    badge: 'Закрыто',
  },
]
