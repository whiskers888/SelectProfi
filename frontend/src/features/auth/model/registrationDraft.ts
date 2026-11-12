export type AuthMethod = 'phone' | 'email'

export type RegistrationRole = 'Customer' | 'Executor' | 'Applicant'

export type JobSearchStatus = 'Active' | 'OpenToOffers' | 'NotLooking'

export type RegistrationDraft = {
  method: AuthMethod
  role: RegistrationRole
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
  offerAccepted: boolean
  rememberDevice: boolean
  customerLegalForm: '' | 'Ooo' | 'Ip'
  customerInn: string
  customerEgrn: string
  customerEgrnip: string
  customerCompanyName: string
  applicantJobTitle: string
  applicantJobSearchStatus: JobSearchStatus
  executorEmploymentType: '' | 'Fl' | 'Smz' | 'Ip'
  executorInn: string
  executorOgrnip: string
  executorLegalName: string
  verificationToken: string
  verifiedTarget: string
}

export const emptyRegistrationDraft: RegistrationDraft = {
  method: 'phone',
  role: 'Customer',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  offerAccepted: false,
  rememberDevice: true,
  customerLegalForm: 'Ooo',
  customerInn: '',
  customerEgrn: '',
  customerEgrnip: '',
  customerCompanyName: '',
  applicantJobTitle: '',
  applicantJobSearchStatus: 'Active',
  executorEmploymentType: 'Smz',
  executorInn: '',
  executorOgrnip: '',
  executorLegalName: '',
  verificationToken: '',
  verifiedTarget: '',
}

export type VerificationResult = {
  verificationToken: string
  target: string
  channel: 'Phone' | 'Email'
}
