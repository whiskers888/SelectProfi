import type { Dispatch, FormEventHandler, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFieldError, FormStatusMessage } from '@/components/ui/form-feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProfileDetails } from '@/features/profile/ui/ProfileDetails'

type DetailItem = {
  label: string
  value: string | number
}

type ApplicantProfileFormValues = {
  resumeTitle: string
  previousCompanyName: string
  workPeriod: string
  experienceSummary: string
  achievements: string
  education: string
  skills: string
  certificates: string
  portfolioUrl: string
  about: string
  desiredSalary: string
}

type ApplicantProfileFormErrors = Partial<Record<keyof ApplicantProfileFormValues, string>>

type RoleSubmitMessageState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

type Props = {
  isEditingRoleSpecific: boolean
  isEditingCommon: boolean
  isUpdatingProfile: boolean
  applicantFormValues: ApplicantProfileFormValues
  applicantFormErrors: ApplicantProfileFormErrors
  applicantDetailItems: DetailItem[]
  roleSubmitMessage: RoleSubmitMessageState
  onStartEdit: () => void
  onCancelEdit: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  setApplicantFormValues: Dispatch<SetStateAction<ApplicantProfileFormValues>>
}

export function ProfileApplicantSection({
  isEditingRoleSpecific,
  isEditingCommon,
  isUpdatingProfile,
  applicantFormValues,
  applicantFormErrors,
  applicantDetailItems,
  roleSubmitMessage,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  setApplicantFormValues,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <CardTitle className="text-xl">Профиль соискателя</CardTitle>
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
                <Label htmlFor="applicant-resumeTitle">Желаемая должность</Label>
                <Input
                  id="applicant-resumeTitle"
                  value={applicantFormValues.resumeTitle}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      resumeTitle: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant-previousCompanyName">Предыдущая компания</Label>
                <Input
                  id="applicant-previousCompanyName"
                  value={applicantFormValues.previousCompanyName}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      previousCompanyName: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant-workPeriod">Период работы</Label>
                <Input
                  id="applicant-workPeriod"
                  value={applicantFormValues.workPeriod}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      workPeriod: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="applicant-experienceSummary">Опыт</Label>
                <Textarea
                  id="applicant-experienceSummary"
                  value={applicantFormValues.experienceSummary}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      experienceSummary: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="applicant-achievements">Достижения</Label>
                <Textarea
                  id="applicant-achievements"
                  value={applicantFormValues.achievements}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      achievements: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="applicant-education">Образование</Label>
                <Textarea
                  id="applicant-education"
                  value={applicantFormValues.education}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      education: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant-skills">Навыки (через запятую)</Label>
                <Input
                  id="applicant-skills"
                  value={applicantFormValues.skills}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      skills: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant-certificates">Сертификаты (через запятую)</Label>
                <Input
                  id="applicant-certificates"
                  value={applicantFormValues.certificates}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      certificates: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant-portfolioUrl">Портфолио (URL)</Label>
                <Input
                  id="applicant-portfolioUrl"
                  value={applicantFormValues.portfolioUrl}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      portfolioUrl: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="applicant-about">О себе</Label>
                <Textarea
                  id="applicant-about"
                  value={applicantFormValues.about}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      about: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant-desiredSalary">Желаемая зарплата</Label>
                <Input
                  id="applicant-desiredSalary"
                  value={applicantFormValues.desiredSalary}
                  onChange={(event) =>
                    setApplicantFormValues((previous) => ({
                      ...previous,
                      desiredSalary: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(applicantFormErrors.desiredSalary)}
                  aria-describedby={applicantFormErrors.desiredSalary ? 'applicant-desiredSalary-error' : undefined}
                />
                <FormFieldError id="applicant-desiredSalary-error">{applicantFormErrors.desiredSalary}</FormFieldError>
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
          <ProfileDetails items={applicantDetailItems} />
        )}
      </CardContent>
    </Card>
  )
}
