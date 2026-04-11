import type { Dispatch, FormEventHandler, SetStateAction } from 'react'
import type { ExecutorEmploymentType } from '@/features/profile/model'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFieldError, FormStatusMessage } from '@/components/ui/form-feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ProfileDetails } from '@/features/profile/ui/ProfileDetails'

// @dvnull: Inline-блок роли Executor вынесен из ProfilePage для поэтапной декомпозиции без изменения submit-flow.
type DetailItem = {
  label: string
  value: string | number
}

type ExecutorProfileFormValues = {
  employmentType: '' | ExecutorEmploymentType
  projectTitle: string
  projectCompanyName: string
  experienceSummary: string
  achievements: string
  certificates: string
  grade: string
  extraInfo: string
}

type ExecutorProfileFormErrors = Partial<Record<keyof ExecutorProfileFormValues, string>>

type RoleSubmitMessageState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

type Props = {
  isEditingRoleSpecific: boolean
  isEditingCommon: boolean
  isUpdatingProfile: boolean
  executorFormValues: ExecutorProfileFormValues
  executorFormErrors: ExecutorProfileFormErrors
  executorDetailItems: DetailItem[]
  roleSubmitMessage: RoleSubmitMessageState
  onStartEdit: () => void
  onCancelEdit: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  setExecutorFormValues: Dispatch<SetStateAction<ExecutorProfileFormValues>>
}

export function ProfileExecutorSection({
  isEditingRoleSpecific,
  isEditingCommon,
  isUpdatingProfile,
  executorFormValues,
  executorFormErrors,
  executorDetailItems,
  roleSubmitMessage,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  setExecutorFormValues,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <CardTitle className="text-xl">Профиль исполнителя</CardTitle>
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
                <Label htmlFor="executor-employmentType">Формат занятости</Label>
                <Select
                  value={executorFormValues.employmentType || undefined}
                  onValueChange={(value) =>
                    setExecutorFormValues((previous) => ({
                      ...previous,
                      employmentType: value as ExecutorEmploymentType,
                    }))
                  }
                >
                  <SelectTrigger
                    id="executor-employmentType"
                    aria-invalid={Boolean(executorFormErrors.employmentType)}
                    aria-describedby={executorFormErrors.employmentType ? 'executor-employmentType-error' : undefined}
                  >
                    <SelectValue placeholder="Выберите формат" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fl">Физлицо</SelectItem>
                    <SelectItem value="Smz">Самозанятый</SelectItem>
                    <SelectItem value="Ip">ИП</SelectItem>
                  </SelectContent>
                </Select>
                <FormFieldError id="executor-employmentType-error">{executorFormErrors.employmentType}</FormFieldError>
              </div>

              <div className="space-y-2">
                <Label htmlFor="executor-projectTitle">Проект</Label>
                <Input
                  id="executor-projectTitle"
                  value={executorFormValues.projectTitle}
                  onChange={(event) =>
                    setExecutorFormValues((previous) => ({
                      ...previous,
                      projectTitle: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="executor-projectCompanyName">Компания проекта</Label>
                <Input
                  id="executor-projectCompanyName"
                  value={executorFormValues.projectCompanyName}
                  onChange={(event) =>
                    setExecutorFormValues((previous) => ({
                      ...previous,
                      projectCompanyName: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="executor-experienceSummary">Опыт</Label>
                <Textarea
                  id="executor-experienceSummary"
                  value={executorFormValues.experienceSummary}
                  onChange={(event) =>
                    setExecutorFormValues((previous) => ({
                      ...previous,
                      experienceSummary: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="executor-achievements">Достижения</Label>
                <Textarea
                  id="executor-achievements"
                  value={executorFormValues.achievements}
                  onChange={(event) =>
                    setExecutorFormValues((previous) => ({
                      ...previous,
                      achievements: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="executor-certificates">Сертификаты (через запятую)</Label>
                <Input
                  id="executor-certificates"
                  value={executorFormValues.certificates}
                  onChange={(event) =>
                    setExecutorFormValues((previous) => ({
                      ...previous,
                      certificates: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="executor-grade">Грейд</Label>
                <Input
                  id="executor-grade"
                  value={executorFormValues.grade}
                  onChange={(event) =>
                    setExecutorFormValues((previous) => ({
                      ...previous,
                      grade: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="executor-extraInfo">Дополнительно</Label>
                <Textarea
                  id="executor-extraInfo"
                  value={executorFormValues.extraInfo}
                  onChange={(event) =>
                    setExecutorFormValues((previous) => ({
                      ...previous,
                      extraInfo: event.target.value,
                    }))
                  }
                />
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
          <ProfileDetails items={executorDetailItems} />
        )}
      </CardContent>
    </Card>
  )
}
