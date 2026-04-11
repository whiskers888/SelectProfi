import type { RegisterUserRequest } from '@/shared/api/auth'
import type { RegistrationFormValues } from '@/features/auth/types'
import { splitFullName } from '@/features/auth/validation'

type BuildRegistrationValuesArgs = {
  formData: FormData
  registrationRole: RegistrationFormValues['role']
  customerLegalForm: RegistrationFormValues['customerLegalForm']
}

export function buildRegistrationValuesFromFormData({
  formData,
  registrationRole,
  customerLegalForm,
}: BuildRegistrationValuesArgs): RegistrationFormValues {
  return {
    fullName: String(formData.get('fullName') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    companyName: String(formData.get('companyName') ?? '').trim(),
    customerInn: String(formData.get('customerInn') ?? '').trim(),
    customerLegalForm: registrationRole === 'Customer' ? customerLegalForm : '',
    customerEgrn:
      registrationRole === 'Customer' && customerLegalForm === 'Ooo'
        ? String(formData.get('customerEgrn') ?? '').trim()
        : '',
    customerEgrnip:
      registrationRole === 'Customer' && customerLegalForm === 'Ip'
        ? String(formData.get('customerEgrnip') ?? '').trim()
        : '',
    offerAccepted: registrationRole === 'Customer' ? formData.get('offerAccepted') === 'on' : false,
    password: String(formData.get('password') ?? '').trim(),
    role: registrationRole,
  }
}

export function buildRegisterPayload(
  values: RegistrationFormValues,
  currentOfferVersion: string,
): RegisterUserRequest {
  const { firstName, lastName } = splitFullName(values.fullName)

  return {
    firstName,
    lastName,
    email: values.email,
    phone: values.phone,
    password: values.password,
    role: values.role,
    customerRegistration:
      values.role === 'Customer' && values.customerLegalForm
        ? {
            inn: values.customerInn,
            legalForm: values.customerLegalForm,
            egrn: values.customerEgrn ? values.customerEgrn : undefined,
            egrnip: values.customerEgrnip ? values.customerEgrnip : undefined,
            companyName: values.companyName ? values.companyName : undefined,
          }
        : undefined,
    offerAcceptance:
      values.role === 'Customer'
        ? {
            accepted: values.offerAccepted,
            version: currentOfferVersion,
          }
        : undefined,
  }
}
