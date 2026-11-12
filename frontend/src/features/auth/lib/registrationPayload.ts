import type { RegisterUserRequest } from '@/shared/api/auth'
import type { RegistrationDraft } from '@/features/auth/model/registrationDraft'
import { normalizeRuPhoneForApi } from '@/components/auth/AuthFields'

export const currentOfferVersion = 'public-offer-v2'

export function buildRegisterPayload(draft: RegistrationDraft): RegisterUserRequest {
  const isPhoneMethod = draft.method === 'phone'

  return {
    email: isPhoneMethod ? undefined : draft.email.trim(),
    phone: isPhoneMethod ? normalizeRuPhoneForApi(draft.phone) : undefined,
    password: draft.password,
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    role: draft.role,
    verificationToken: draft.verificationToken,
    customerRegistration:
      draft.role === 'Customer'
        ? {
            inn: draft.customerInn.trim(),
            legalForm: draft.customerLegalForm === 'Ip' ? 'Ip' : 'Ooo',
            egrn: draft.customerEgrn.trim() ? draft.customerEgrn.trim() : undefined,
            egrnip: draft.customerEgrnip.trim() ? draft.customerEgrnip.trim() : undefined,
            companyName: draft.customerCompanyName.trim() ? draft.customerCompanyName.trim() : undefined,
          }
        : undefined,
    offerAcceptance:
      draft.role === 'Customer'
        ? { accepted: draft.offerAccepted, version: currentOfferVersion }
        : undefined,
  }
}
