import type { RegistrationDraft } from '@/features/auth/model/registrationDraft'

export type DraftPatch = (patch: Partial<RegistrationDraft>) => void

export type RegisterFormError = {
  title: string
  description?: string
  action?: 'back-to-code'
}

export type VerificationChallenge = {
  challengeId: string
  channel: 'Phone' | 'Email'
  maskedTarget: string
  codeLength: number
  resendAvailableAtUtc: string
  debugCode?: string | null
}
