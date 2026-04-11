const phonePattern = /^\+[1-9]\d{9,14}$/
const desiredSalaryPattern = /^\d+([.]\d{1,2})?$/

type CommonProfileValues = {
  firstName: string
  lastName: string
  phone: string
}

type CommonProfileErrors = Partial<Record<keyof CommonProfileValues, string>>

type ApplicantProfileValues = {
  desiredSalary: string
}

type ApplicantProfileErrors = Partial<Record<keyof ApplicantProfileValues, string>>

type ExecutorProfileValues = {
  employmentType: string
}

type ExecutorProfileErrors = Partial<Record<keyof ExecutorProfileValues, string>>

type CustomerProfileValues = {
  offerAccepted: boolean
  offerVersion: string
}

type CustomerProfileErrors = Partial<Record<'offerVersion', string>>

export function validateCommonProfileForm(values: CommonProfileValues): CommonProfileErrors {
  const errors: CommonProfileErrors = {}
  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()
  const phone = values.phone.trim()

  if (!firstName) {
    errors.firstName = 'Имя обязательно'
  }

  if (!lastName) {
    errors.lastName = 'Фамилия обязательна'
  }

  if (phone && !phonePattern.test(phone)) {
    errors.phone = 'Телефон должен быть в формате +79991234567'
  }

  return errors
}

export function validateApplicantProfileForm(values: ApplicantProfileValues): ApplicantProfileErrors {
  const errors: ApplicantProfileErrors = {}
  const desiredSalaryRaw = values.desiredSalary.trim()

  if (!desiredSalaryRaw) {
    return errors
  }

  if (!desiredSalaryPattern.test(desiredSalaryRaw)) {
    errors.desiredSalary = 'Зарплата должна быть числом, до 2 знаков после точки'
    return errors
  }

  const desiredSalary = Number(desiredSalaryRaw)
  if (!Number.isFinite(desiredSalary) || desiredSalary < 0) {
    errors.desiredSalary = 'Некорректное значение зарплаты'
  }

  return errors
}

export function validateExecutorProfileForm(values: ExecutorProfileValues): ExecutorProfileErrors {
  const errors: ExecutorProfileErrors = {}

  if (!values.employmentType) {
    errors.employmentType = 'Формат занятости обязателен'
  }

  return errors
}

export function validateCustomerProfileForm(values: CustomerProfileValues): CustomerProfileErrors {
  const errors: CustomerProfileErrors = {}
  const offerVersion = values.offerVersion.trim()

  if (values.offerAccepted && !offerVersion) {
    errors.offerVersion = 'Укажите версию оферты'
    return errors
  }

  if (!values.offerAccepted && offerVersion) {
    errors.offerVersion = 'Версия оферты указывается только при согласии'
  }

  return errors
}
