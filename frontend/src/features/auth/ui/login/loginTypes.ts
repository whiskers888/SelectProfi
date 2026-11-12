import type { FieldErrors } from '@/features/auth/lib/registrationValidation'

export type LoginMethod = 'email' | 'phone'

export type LoginFieldErrors = FieldErrors

export type LoginAlert = {
  tone: 'error' | 'info'
  title: string
} | null
