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
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5">
          <input
            name="offerAccepted"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border bg-card accent-primary focus-visible:ring-2 focus-visible:ring-ring/40"
            style={{ colorScheme: 'light' }}
          />
          <span>
            Согласен с{' '}
            <a
              href={offerLink}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline decoration-blue-300 underline-offset-2"
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
      <div className="space-y-2">
        <Label className="text-muted-foreground">Форма заказчика</Label>
        <Tabs
          value={customerLegalForm}
          onValueChange={(nextValue) => {
            if (!isCustomerLegalForm(nextValue)) {
              return
            }

            onCustomerLegalFormChange(nextValue)
          }}
        >
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-muted p-1">
            {customerLegalFormOptions.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="h-9 rounded-lg px-2 text-xs text-muted-foreground transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <FormFieldError id="register-customerLegalForm-error">{errors.customerLegalForm}</FormFieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-companyName" className="text-muted-foreground">
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
        <Label htmlFor="register-customerInn" className="text-muted-foreground">
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
          <Label htmlFor="register-customerEgrn" className="text-muted-foreground">
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
          <Label htmlFor="register-customerEgrnip" className="text-muted-foreground">
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
