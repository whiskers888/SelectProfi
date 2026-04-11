import type { Dispatch, FormEventHandler, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFieldError, FormStatusMessage } from '@/components/ui/form-feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProfileDetails } from '@/features/profile/ui/ProfileDetails'

type DetailItem = {
  label: string
  value: string | number
}

type CommonProfileFormValues = {
  firstName: string
  lastName: string
  phone: string
}

type CommonProfileFormErrors = Partial<Record<keyof CommonProfileFormValues, string>>

type SubmitMessageState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

type Props = {
  isEditingCommon: boolean
  isEditingRoleSpecific: boolean
  isUpdatingProfile: boolean
  commonFormValues: CommonProfileFormValues
  commonFormErrors: CommonProfileFormErrors
  commonSubmitMessage: SubmitMessageState
  commonDetailItems: DetailItem[]
  onStartEdit: () => void
  onCancelEdit: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  setCommonFormValues: Dispatch<SetStateAction<CommonProfileFormValues>>
}

export function ProfileCommonSection({
  isEditingCommon,
  isEditingRoleSpecific,
  isUpdatingProfile,
  commonFormValues,
  commonFormErrors,
  commonSubmitMessage,
  commonDetailItems,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  setCommonFormValues,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <CardTitle className="text-xl">Общие данные</CardTitle>
        {!isEditingCommon ? (
          <Button type="button" variant="outline" onClick={onStartEdit} disabled={isEditingRoleSpecific}>
            Редактировать
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* @dvnull: Inline-блок общих данных вынесен из ProfilePage для дальнейшей декомпозиции страницы без изменения submit-flow. */}
        {commonSubmitMessage.status !== 'idle' ? (
          <FormStatusMessage
            message={commonSubmitMessage.message}
            status={commonSubmitMessage.status === 'error' ? 'error' : 'success'}
          />
        ) : null}

        {isEditingCommon ? (
          <form noValidate onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-common-firstName">Имя</Label>
                <Input
                  id="profile-common-firstName"
                  value={commonFormValues.firstName}
                  onChange={(event) =>
                    setCommonFormValues((previous) => ({ ...previous, firstName: event.target.value }))
                  }
                  aria-invalid={Boolean(commonFormErrors.firstName)}
                  aria-describedby={commonFormErrors.firstName ? 'profile-common-firstName-error' : undefined}
                />
                <FormFieldError id="profile-common-firstName-error">{commonFormErrors.firstName}</FormFieldError>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-common-lastName">Фамилия</Label>
                <Input
                  id="profile-common-lastName"
                  value={commonFormValues.lastName}
                  onChange={(event) =>
                    setCommonFormValues((previous) => ({ ...previous, lastName: event.target.value }))
                  }
                  aria-invalid={Boolean(commonFormErrors.lastName)}
                  aria-describedby={commonFormErrors.lastName ? 'profile-common-lastName-error' : undefined}
                />
                <FormFieldError id="profile-common-lastName-error">{commonFormErrors.lastName}</FormFieldError>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profile-common-phone">Телефон</Label>
                <Input
                  id="profile-common-phone"
                  placeholder="+79991234567"
                  value={commonFormValues.phone}
                  onChange={(event) =>
                    setCommonFormValues((previous) => ({ ...previous, phone: event.target.value }))
                  }
                  aria-invalid={Boolean(commonFormErrors.phone)}
                  aria-describedby={commonFormErrors.phone ? 'profile-common-phone-error' : undefined}
                />
                <FormFieldError id="profile-common-phone-error">{commonFormErrors.phone}</FormFieldError>
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
          <ProfileDetails items={commonDetailItems} />
        )}
      </CardContent>
    </Card>
  )
}
