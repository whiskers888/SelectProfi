import type { CustomerLegalForm, ExecutorEmploymentType } from '@/features/profile/model'

export function toEmploymentTypeLabel(value: ExecutorEmploymentType | null | undefined): string {
  switch (value) {
    case 'Fl':
      return 'Физлицо'
    case 'Smz':
      return 'Самозанятый'
    case 'Ip':
      return 'ИП'
    default:
      return '—'
  }
}

export function toCustomerLegalFormValue(value: CustomerLegalForm | null | undefined): '' | 'Ooo' | 'Ip' {
  if (value === 'Ooo' || value === 1) {
    return 'Ooo'
  }

  if (value === 'Ip' || value === 2) {
    return 'Ip'
  }

  return ''
}

export function toCustomerLegalFormLabel(value: CustomerLegalForm | null | undefined): string {
  switch (toCustomerLegalFormValue(value)) {
    case 'Ooo':
      return 'ООО'
    case 'Ip':
      return 'ИП'
    default:
      return '—'
  }
}

export function toCustomerLegalFormPayload(value: '' | 'Ooo' | 'Ip'): 1 | 2 | undefined {
  if (value === 'Ooo') {
    return 1
  }

  if (value === 'Ip') {
    return 2
  }

  return undefined
}
