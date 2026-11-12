import type { RegistrationRole } from '@/features/auth/model/registrationDraft'

type RoleMeta = {
  label: string
  qualifier: string
  identitySubtitle: string
}

export const roleMeta: Record<RegistrationRole, RoleMeta> = {
  Customer: {
    label: 'Заказчик',
    qualifier: 'Юрлица и ИП',
    identitySubtitle:
      'Заполните контактные данные для входа в кабинет заказчика, доступа к пулу кандидатов и резервирования выплат по 152-ФЗ.',
  },
  Executor: {
    label: 'Исполнитель',
    qualifier: 'Самозанятые, ИП, Агентства',
    identitySubtitle:
      'Заполните контактные данные для доступа к бирже заказов, работы с кандидатами и получения выплат по закрытым вакансиям.',
  },
  Applicant: {
    label: 'Соискатель',
    qualifier: 'Физические лица',
    identitySubtitle:
      'Заполните контактные данные для доступа к проверенным вакансиям, откликов без спама и приглашений на интервью.',
  },
}

export const stepDefinitions = [
  { key: 'role', label: 'Роль', caption: 'ВЫБОР РОЛИ' },
  { key: 'identity', label: 'Данные', caption: 'ВВОД ДАННЫХ' },
  { key: 'code', label: 'Код', caption: 'ПОДТВЕРЖДЕНИЕ НОМЕРА' },
  { key: 'profile', label: 'Профиль', caption: 'ПРОФИЛЬ' },
] as const

export function roleTitle(role: RegistrationRole): string {
  const meta = roleMeta[role]
  return `${meta.label} (${meta.qualifier})`
}
