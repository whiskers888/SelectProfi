import type { CustomerLegalForm, RegisterUserRole } from '@/shared/api/auth'

export type LoginFormValues = {
  email: string
  password: string
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>

export type RegistrationFormValues = {
  fullName: string
  email: string
  phone: string
  companyName: string
  customerInn: string
  customerLegalForm: '' | Extract<CustomerLegalForm, 'Ooo' | 'Ip'>
  customerEgrn: string
  customerEgrnip: string
  offerAccepted: boolean
  password: string
  role: RegisterUserRole
}

export type RegistrationFormErrors = Partial<Record<keyof RegistrationFormValues, string>>

export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export type SubmitState = {
  message: string
  status: SubmitStatus
}
