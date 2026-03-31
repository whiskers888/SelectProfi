import type { RegisterUserRole } from '@/shared/api/auth'

export const registrationRoleOptions: Array<{
  description: string
  label: string
  value: RegisterUserRole
}> = [
  {
    value: 'Customer',
    label: 'Заказчик',
    description: 'Создает вакансии и управляет процессом найма',
  },
  {
    value: 'Executor',
    label: 'Исполнитель',
    description: 'Подбирает кандидатов и ведет коммуникацию',
  },
  {
    value: 'Applicant',
    label: 'Соискатель',
    description: 'Откликается на вакансии и проходит этапы отбора',
  },
]

export const defaultRegistrationRole: RegisterUserRole = registrationRoleOptions[0].value

export const registrationRoleNameMap = registrationRoleOptions.reduce<
  Record<RegisterUserRole, string>
>(
  (result, option) => {
    result[option.value] = option.label
    return result
  },
  {
    Applicant: 'Соискатель',
    Customer: 'Заказчик',
    Executor: 'Исполнитель',
  },
)

export const registrationRoleValueSet = new Set<RegisterUserRole>(
  registrationRoleOptions.map((option) => option.value),
)
