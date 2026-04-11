import type { Dispatch, FormEventHandler, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFieldError, FormStatusMessage } from '@/components/ui/form-feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileDetails } from '@/features/profile/ui/ProfileDetails'

// @dvnull: Inline-блок роли Customer вынесен из ProfilePage для поэтапной декомпозиции без изменения submit-flow.
type DetailItem = {
  label: string
  value: string | number
}

type CustomerProfileFormValues = {
  inn: string
  legalForm: '' | 'Ooo' | 'Ip'
  egrn: string
  egrnip: string
  companyName: string
  companyLogoUrl: string
  offerAccepted: boolean
  offerVersion: string
}

type CustomerProfileFormErrors = Partial<Record<'offerVersion', string>>

type RoleSubmitMessageState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

type Props = {
  isEditingRoleSpecific: boolean
  isEditingCommon: boolean
  isUpdatingProfile: boolean
  customerFormValues: CustomerProfileFormValues
  customerFormErrors: CustomerProfileFormErrors
  customerDetailItems: DetailItem[]
  roleSubmitMessage: RoleSubmitMessageState
  onStartEdit: () => void
  onCancelEdit: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  setCustomerFormValues: Dispatch<SetStateAction<CustomerProfileFormValues>>
}

export function ProfileCustomerSection({
  isEditingRoleSpecific,
  isEditingCommon,
  isUpdatingProfile,
  customerFormValues,
  customerFormErrors,
  customerDetailItems,
  roleSubmitMessage,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  setCustomerFormValues,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <CardTitle className="text-xl">Профиль заказчика</CardTitle>
        {!isEditingRoleSpecific ? (
          <Button type="button" variant="outline" onClick={onStartEdit} disabled={isEditingCommon}>
            Редактировать
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {roleSubmitMessage.status !== 'idle' ? (
          <FormStatusMessage
            message={roleSubmitMessage.message}
            status={roleSubmitMessage.status === 'error' ? 'error' : 'success'}
          />
        ) : null}

        {isEditingRoleSpecific ? (
          <form noValidate onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer-inn">ИНН</Label>
                <Input
                  id="customer-inn"
                  value={customerFormValues.inn}
                  onChange={(event) =>
                    setCustomerFormValues((previous) => ({ ...previous, inn: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-legalForm">Юрформа</Label>
                <Select
                  value={customerFormValues.legalForm || undefined}
                  onValueChange={(value) =>
                    setCustomerFormValues((previous) => ({
                      ...previous,
                      legalForm: value as 'Ooo' | 'Ip',
                    }))
                  }
                >
                  <SelectTrigger id="customer-legalForm">
                    <SelectValue placeholder="Выберите юрформу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ooo">ООО</SelectItem>
                    <SelectItem value="Ip">ИП</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-egrn">ЕГРН</Label>
                <Input
                  id="customer-egrn"
                  value={customerFormValues.egrn}
                  onChange={(event) =>
                    setCustomerFormValues((previous) => ({ ...previous, egrn: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-egrnip">ЕГРНИП</Label>
                <Input
                  id="customer-egrnip"
                  value={customerFormValues.egrnip}
                  onChange={(event) =>
                    setCustomerFormValues((previous) => ({ ...previous, egrnip: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-companyName">Компания</Label>
                <Input
                  id="customer-companyName"
                  value={customerFormValues.companyName}
                  onChange={(event) =>
                    setCustomerFormValues((previous) => ({
                      ...previous,
                      companyName: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-companyLogoUrl">Логотип (URL)</Label>
                <Input
                  id="customer-companyLogoUrl"
                  value={customerFormValues.companyLogoUrl}
                  onChange={(event) =>
                    setCustomerFormValues((previous) => ({
                      ...previous,
                      companyLogoUrl: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    id="customer-offerAccepted"
                    type="checkbox"
                    checked={customerFormValues.offerAccepted}
                    onChange={(event) =>
                      setCustomerFormValues((previous) => ({
                        ...previous,
                        offerAccepted: event.target.checked,
                        offerVersion: event.target.checked ? previous.offerVersion : '',
                      }))
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="customer-offerAccepted">Согласен с офертой</Label>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-offerVersion">Версия оферты</Label>
                <Input
                  id="customer-offerVersion"
                  value={customerFormValues.offerVersion}
                  onChange={(event) =>
                    setCustomerFormValues((previous) => ({
                      ...previous,
                      offerVersion: event.target.value,
                    }))
                  }
                  disabled={!customerFormValues.offerAccepted}
                  aria-invalid={Boolean(customerFormErrors.offerVersion)}
                  aria-describedby={customerFormErrors.offerVersion ? 'customer-offerVersion-error' : undefined}
                />
                <FormFieldError id="customer-offerVersion-error">{customerFormErrors.offerVersion}</FormFieldError>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isUpdatingProfile}>
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <ProfileDetails items={customerDetailItems} />
        )}
      </CardContent>
    </Card>
  )
}
