import type { RegistrationFormValues } from '@/features/auth/types'

type CustomerLegalFormValue = RegistrationFormValues['customerLegalForm']

export const customerLegalFormOptions = [
  { value: 'Ooo', label: 'ООО' },
  { value: 'Ip', label: 'ИП' },
] as const

export const defaultCustomerLegalForm: CustomerLegalFormValue = 'Ooo'

export const offerLink = '/offer'
export const currentOfferVersion = 'public-offer-v1'

export const authInputClassName =
  'h-11 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/30 autofill:[-webkit-text-fill-color:#0f172a] autofill:shadow-[inset_0_0_0px_1000px_#ffffff]'
