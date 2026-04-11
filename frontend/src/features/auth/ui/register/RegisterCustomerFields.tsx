import { FormFieldError } from '@/components/ui/form-feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  authInputClassName,
  customerLegalFormOptions,
  offerLink,
} from '@/features/auth/lib/registration/constants'
import type { RegistrationFormErrors, RegistrationFormValues } from '@/features/auth/types'

type CustomerLegalFormValue = RegistrationFormValues['customerLegalForm']

type Props = {
  section: 'fields' | 'offer'
  registrationRole: RegistrationFormValues['role']
  customerLegalForm: CustomerLegalFormValue
  errors: RegistrationFormErrors
  onCustomerLegalFormChange: (nextValue: Exclude<CustomerLegalFormValue, ''>) => void
}

function isCustomerLegalForm(value: string): value is Exclude<CustomerLegalFormValue, ''> {
  return value === 'Ooo' || value === 'Ip'
}

export function RegisterCustomerFields({
  section,
  registrationRole,
  customerLegalForm,
  errors,
  onCustomerLegalFormChange,
}: Props) {
  if (registrationRole !== 'Customer' || !customerLegalForm) {
    return null
  }

  if (section === 'offer') {
    return (
      <div className="space-y-2">
        {/* @dvnull: Ранее offer чекбокс и ссылка рендерились внутри RegisterPage; вынесено в feature-компонент без изменения структуры formData. */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
          <input
            name="offerAccepted"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white accent-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/30"
            style={{ colorScheme: 'light' }}
          />
          <span>
            Согласен с{' '}
            <a
              href={offerLink}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2"
            >
              офертой
            </a>
          </span>
        </label>
        <FormFieldError id="register-offerAccepted-error">{errors.offerAccepted}</FormFieldError>
      </div>
    )
  }

  return (
    <>
      {/* @dvnull: Ранее customer tabs + реквизиты находились в RegisterPage; вынесено в отдельный UI-блок для уменьшения контекста страницы. */}
      <div className="space-y-2">
        <Label className="text-slate-600">Форма заказчика</Label>
        <Tabs
          value={customerLegalForm}
          onValueChange={(nextValue) => {
            if (!isCustomerLegalForm(nextValue)) {
              return
            }

            onCustomerLegalFormChange(nextValue)
          }}
        >
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
            {customerLegalFormOptions.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="h-9 rounded-lg px-2 text-xs text-slate-600 transition-colors data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <FormFieldError id="register-customerLegalForm-error">{errors.customerLegalForm}</FormFieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-companyName" className="text-slate-600">
          Название компании
        </Label>
        <Input
          id="register-companyName"
          type="text"
          name="companyName"
          autoComplete="organization"
          placeholder="Название компании"
          aria-invalid={Boolean(errors.companyName)}
          aria-describedby={errors.companyName ? 'register-companyName-error' : undefined}
          className={authInputClassName}
        />
        <FormFieldError id="register-companyName-error">{errors.companyName}</FormFieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-customerInn" className="text-slate-600">
          ИНН
        </Label>
        <Input
          id="register-customerInn"
          type="text"
          name="customerInn"
          required
          placeholder="10 или 12 цифр"
          aria-invalid={Boolean(errors.customerInn)}
          aria-describedby={errors.customerInn ? 'register-customerInn-error' : undefined}
          className={authInputClassName}
        />
        <FormFieldError id="register-customerInn-error">{errors.customerInn}</FormFieldError>
      </div>

      {customerLegalForm === 'Ooo' ? (
        <div className="space-y-2">
          <Label htmlFor="register-customerEgrn" className="text-slate-600">
            ЕГРН
          </Label>
          <Input
            id="register-customerEgrn"
            type="text"
            name="customerEgrn"
            placeholder="13 цифр"
            aria-invalid={Boolean(errors.customerEgrn)}
            aria-describedby={errors.customerEgrn ? 'register-customerEgrn-error' : undefined}
            className={authInputClassName}
          />
          <FormFieldError id="register-customerEgrn-error">{errors.customerEgrn}</FormFieldError>
        </div>
      ) : null}

      {customerLegalForm === 'Ip' ? (
        <div className="space-y-2">
          <Label htmlFor="register-customerEgrnip" className="text-slate-600">
            ЕГРНИП
          </Label>
          <Input
            id="register-customerEgrnip"
            type="text"
            name="customerEgrnip"
            placeholder="15 цифр"
            aria-invalid={Boolean(errors.customerEgrnip)}
            aria-describedby={errors.customerEgrnip ? 'register-customerEgrnip-error' : undefined}
            className={authInputClassName}
          />
          <FormFieldError id="register-customerEgrnip-error">{errors.customerEgrnip}</FormFieldError>
        </div>
      ) : null}
    </>
  )
}
