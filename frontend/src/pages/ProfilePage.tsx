import { useState, type FormEvent } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import {
  useProfileServer,
  type ExecutorEmploymentType,
  type MyProfileResponse,
  type UserRole,
} from '@/features/profile/model'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFieldError, FormStatusMessage } from '@/components/ui/form-feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type ProblemDetailsPayload = {
  detail?: string
  title?: string
}

type DetailItem = {
  label: string
  value: string | number
}

type SubmitMessageState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

type CommonProfileFormValues = {
  firstName: string
  lastName: string
  phone: string
}

type CommonProfileFormErrors = Partial<Record<keyof CommonProfileFormValues, string>>

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

type CustomerProfileFormValues = {
  inn: string
  egrn: string
  egrnip: string
  companyName: string
  companyLogoUrl: string
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

const phonePattern = /^\+[1-9]\d{9,14}$/
const desiredSalaryPattern = /^\d+([.]\d{1,2})?$/

function Details({ items }: { items: DetailItem[] }) {
  return (
    <dl className="profile-details">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function toTextOrDash(value: string | null | undefined): string {
  const normalized = value?.trim()
  return normalized ? normalized : '—'
}

function toListOrDash(values: string[] | null | undefined): string {
  if (!values || values.length === 0) {
    return '—'
  }

  return values.join(', ')
}

function toCommaSeparated(values: string[] | null | undefined): string {
  if (!values || values.length === 0) {
    return ''
  }

  return values.join(', ')
}

function fromCommaSeparated(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  return items.length > 0 ? items : undefined
}

function normalizeOptional(value: string): string | undefined {
  const normalized = value.trim()
  return normalized ? normalized : undefined
}

function toRoleLabel(role: UserRole): string {
  switch (role) {
    case 'Applicant':
      return 'Соискатель'
    case 'Executor':
      return 'Исполнитель'
    case 'Customer':
      return 'Заказчик'
    case 'Admin':
      return 'Администратор'
    default:
      return role
  }
}

function toEmploymentTypeLabel(value: ExecutorEmploymentType | null | undefined): string {
  switch (value) {
    case 'Fl':
      return 'Физлицо'
    case 'Smz':
      return 'Самозанятый'
    case 'Ip':
      return 'ИП'
    default:
      return '—'
  }
}

function isProblemDetailsPayload(payload: unknown): payload is ProblemDetailsPayload {
  return typeof payload === 'object' && payload !== null
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

function getRequestErrorMessage(error: unknown): string {
  if (!isFetchBaseQueryError(error)) {
    return 'Не удалось выполнить запрос.'
  }

  if (error.status === 'FETCH_ERROR') {
    return 'Не удалось установить соединение с сервером.'
  }

  if (error.status === 401) {
    return 'Требуется авторизация для выполнения действия.'
  }

  if (typeof error.status === 'number' && isProblemDetailsPayload(error.data)) {
    return error.data.detail ?? error.data.title ?? 'Не удалось выполнить запрос.'
  }

  return 'Не удалось выполнить запрос.'
}

function createCommonProfileFormValues(profile: MyProfileResponse): CommonProfileFormValues {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone ?? '',
  }
}

function createApplicantProfileFormValues(profile: MyProfileResponse): ApplicantProfileFormValues {
  return {
    resumeTitle: profile.applicantProfile?.resumeTitle ?? '',
    previousCompanyName: profile.applicantProfile?.previousCompanyName ?? '',
    workPeriod: profile.applicantProfile?.workPeriod ?? '',
    experienceSummary: profile.applicantProfile?.experienceSummary ?? '',
    achievements: profile.applicantProfile?.achievements ?? '',
    education: profile.applicantProfile?.education ?? '',
    skills: toCommaSeparated(profile.applicantProfile?.skills),
    certificates: toCommaSeparated(profile.applicantProfile?.certificates),
    portfolioUrl: profile.applicantProfile?.portfolioUrl ?? '',
    about: profile.applicantProfile?.about ?? '',
    desiredSalary:
      profile.applicantProfile?.desiredSalary === undefined || profile.applicantProfile?.desiredSalary === null
        ? ''
        : String(profile.applicantProfile.desiredSalary),
  }
}

function createCustomerProfileFormValues(profile: MyProfileResponse): CustomerProfileFormValues {
  return {
    inn: profile.customerProfile?.inn ?? '',
    egrn: profile.customerProfile?.egrn ?? '',
    egrnip: profile.customerProfile?.egrnip ?? '',
    companyName: profile.customerProfile?.companyName ?? '',
    companyLogoUrl: profile.customerProfile?.companyLogoUrl ?? '',
  }
}

function createExecutorProfileFormValues(profile: MyProfileResponse): ExecutorProfileFormValues {
  return {
    employmentType: profile.executorProfile?.employmentType ?? '',
    projectTitle: profile.executorProfile?.projectTitle ?? '',
    projectCompanyName: profile.executorProfile?.projectCompanyName ?? '',
    experienceSummary: profile.executorProfile?.experienceSummary ?? '',
    achievements: profile.executorProfile?.achievements ?? '',
    certificates: toCommaSeparated(profile.executorProfile?.certificates),
    grade: profile.executorProfile?.grade ?? '',
    extraInfo: profile.executorProfile?.extraInfo ?? '',
  }
}

function validateCommonProfileForm(values: CommonProfileFormValues): CommonProfileFormErrors {
  const errors: CommonProfileFormErrors = {}
  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()
  const phone = values.phone.trim()

  if (!firstName) {
    errors.firstName = 'Имя обязательно'
  }

  if (!lastName) {
    errors.lastName = 'Фамилия обязательна'
  }

  if (phone && !phonePattern.test(phone)) {
    errors.phone = 'Телефон должен быть в формате +79991234567'
  }

  return errors
}

function validateApplicantProfileForm(values: ApplicantProfileFormValues): ApplicantProfileFormErrors {
  const errors: ApplicantProfileFormErrors = {}
  const desiredSalaryRaw = values.desiredSalary.trim()

  if (!desiredSalaryRaw) {
    return errors
  }

  if (!desiredSalaryPattern.test(desiredSalaryRaw)) {
    errors.desiredSalary = 'Зарплата должна быть числом, до 2 знаков после точки'
    return errors
  }

  const desiredSalary = Number(desiredSalaryRaw)
  if (!Number.isFinite(desiredSalary) || desiredSalary < 0) {
    errors.desiredSalary = 'Некорректное значение зарплаты'
  }

  return errors
}

function validateExecutorProfileForm(values: ExecutorProfileFormValues): ExecutorProfileFormErrors {
  const errors: ExecutorProfileFormErrors = {}

  if (!values.employmentType) {
    errors.employmentType = 'Формат занятости обязателен'
  }

  return errors
}

export function ProfilePage() {
  const { data, isLoading, isError, error, isUpdatingProfile, refetch, updateMyProfile } =
    useProfileServer()

  const [isEditingCommon, setIsEditingCommon] = useState(false)
  const [commonFormValues, setCommonFormValues] = useState<CommonProfileFormValues>({
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [commonFormErrors, setCommonFormErrors] = useState<CommonProfileFormErrors>({})
  const [commonSubmitMessage, setCommonSubmitMessage] = useState<SubmitMessageState>({
    status: 'idle',
    message: '',
  })

  const [isEditingRoleSpecific, setIsEditingRoleSpecific] = useState(false)
  const [applicantFormValues, setApplicantFormValues] = useState<ApplicantProfileFormValues>({
    resumeTitle: '',
    previousCompanyName: '',
    workPeriod: '',
    experienceSummary: '',
    achievements: '',
    education: '',
    skills: '',
    certificates: '',
    portfolioUrl: '',
    about: '',
    desiredSalary: '',
  })
  const [customerFormValues, setCustomerFormValues] = useState<CustomerProfileFormValues>({
    inn: '',
    egrn: '',
    egrnip: '',
    companyName: '',
    companyLogoUrl: '',
  })
  const [executorFormValues, setExecutorFormValues] = useState<ExecutorProfileFormValues>({
    employmentType: '',
    projectTitle: '',
    projectCompanyName: '',
    experienceSummary: '',
    achievements: '',
    certificates: '',
    grade: '',
    extraInfo: '',
  })
  const [applicantFormErrors, setApplicantFormErrors] = useState<ApplicantProfileFormErrors>({})
  const [executorFormErrors, setExecutorFormErrors] = useState<ExecutorProfileFormErrors>({})
  const [roleSubmitMessage, setRoleSubmitMessage] = useState<SubmitMessageState>({
    status: 'idle',
    message: '',
  })

  // @dvnull: Ветки loading/error/empty переведены на единый UX-шаблон состояний с явным retry.
  if (isLoading) {
    return (
      <section className="page profile-page">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">Профиль</CardTitle>
          </CardHeader>
          <CardContent>
            <p role="status" className="text-sm text-muted-foreground">
              Загрузка профиля...
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="page profile-page">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">Профиль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" role="alert">
              {getRequestErrorMessage(error)}
            </Alert>
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Повторить
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="page profile-page">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">Профиль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert role="status">Данные профиля отсутствуют.</Alert>
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Повторить
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  const profile = data

  function resetRoleFormErrors() {
    setApplicantFormErrors({})
    setExecutorFormErrors({})
  }

  function handleStartEditCommon() {
    if (isEditingRoleSpecific) {
      return
    }

    setIsEditingCommon(true)
    setCommonFormErrors({})
    setCommonSubmitMessage({ status: 'idle', message: '' })
    setCommonFormValues(createCommonProfileFormValues(profile))
  }

  function handleCancelEditCommon() {
    setIsEditingCommon(false)
    setCommonFormErrors({})
    setCommonSubmitMessage({ status: 'idle', message: '' })
    setCommonFormValues(createCommonProfileFormValues(profile))
  }

  async function handleCommonFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateCommonProfileForm(commonFormValues)
    if (Object.keys(nextErrors).length > 0) {
      setCommonFormErrors(nextErrors)
      return
    }

    try {
      const updatedProfile = await updateMyProfile({
        firstName: commonFormValues.firstName.trim(),
        lastName: commonFormValues.lastName.trim(),
        phone: normalizeOptional(commonFormValues.phone),
      }).unwrap()

      setCommonFormValues(createCommonProfileFormValues(updatedProfile))
      setCommonFormErrors({})
      setIsEditingCommon(false)
      setCommonSubmitMessage({ status: 'success', message: 'Профиль обновлён.' })
      void refetch()
    } catch (submitError) {
      const message = isFetchBaseQueryError(submitError)
        ? getRequestErrorMessage(submitError)
        : 'Не удалось сохранить профиль.'

      setCommonSubmitMessage({ status: 'error', message })
    }
  }

  function handleStartEditRoleSpecific() {
    if (isEditingCommon || profile.role === 'Admin') {
      return
    }

    setIsEditingRoleSpecific(true)
    setRoleSubmitMessage({ status: 'idle', message: '' })
    resetRoleFormErrors()

    if (profile.role === 'Applicant') {
      setApplicantFormValues(createApplicantProfileFormValues(profile))
      return
    }

    if (profile.role === 'Customer') {
      setCustomerFormValues(createCustomerProfileFormValues(profile))
      return
    }

    if (profile.role === 'Executor') {
      setExecutorFormValues(createExecutorProfileFormValues(profile))
    }
  }

  function handleCancelEditRoleSpecific() {
    setIsEditingRoleSpecific(false)
    setRoleSubmitMessage({ status: 'idle', message: '' })
    resetRoleFormErrors()
  }

  async function handleRoleSpecificFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRoleSubmitMessage({ status: 'idle', message: '' })

    const basePayload = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone ?? undefined,
    }

    try {
      if (profile.role === 'Applicant') {
        const nextErrors = validateApplicantProfileForm(applicantFormValues)
        if (Object.keys(nextErrors).length > 0) {
          setApplicantFormErrors(nextErrors)
          return
        }

        const desiredSalary = applicantFormValues.desiredSalary.trim()
          ? Number(applicantFormValues.desiredSalary.trim())
          : undefined

        const updatedProfile = await updateMyProfile({
          ...basePayload,
          applicantProfile: {
            resumeTitle: normalizeOptional(applicantFormValues.resumeTitle),
            previousCompanyName: normalizeOptional(applicantFormValues.previousCompanyName),
            workPeriod: normalizeOptional(applicantFormValues.workPeriod),
            experienceSummary: normalizeOptional(applicantFormValues.experienceSummary),
            achievements: normalizeOptional(applicantFormValues.achievements),
            education: normalizeOptional(applicantFormValues.education),
            skills: fromCommaSeparated(applicantFormValues.skills),
            certificates: fromCommaSeparated(applicantFormValues.certificates),
            portfolioUrl: normalizeOptional(applicantFormValues.portfolioUrl),
            about: normalizeOptional(applicantFormValues.about),
            desiredSalary,
          },
        }).unwrap()

        setApplicantFormValues(createApplicantProfileFormValues(updatedProfile))
      } else if (profile.role === 'Customer') {
        const updatedProfile = await updateMyProfile({
          ...basePayload,
          customerProfile: {
            inn: normalizeOptional(customerFormValues.inn),
            egrn: normalizeOptional(customerFormValues.egrn),
            egrnip: normalizeOptional(customerFormValues.egrnip),
            companyName: normalizeOptional(customerFormValues.companyName),
            companyLogoUrl: normalizeOptional(customerFormValues.companyLogoUrl),
          },
        }).unwrap()

        setCustomerFormValues(createCustomerProfileFormValues(updatedProfile))
      } else if (profile.role === 'Executor') {
        const nextErrors = validateExecutorProfileForm(executorFormValues)
        if (Object.keys(nextErrors).length > 0) {
          setExecutorFormErrors(nextErrors)
          return
        }

        const employmentType = executorFormValues.employmentType
        if (!employmentType) {
          setExecutorFormErrors({ employmentType: 'Формат занятости обязателен' })
          return
        }

        const updatedProfile = await updateMyProfile({
          ...basePayload,
          executorProfile: {
            employmentType,
            projectTitle: normalizeOptional(executorFormValues.projectTitle),
            projectCompanyName: normalizeOptional(executorFormValues.projectCompanyName),
            experienceSummary: normalizeOptional(executorFormValues.experienceSummary),
            achievements: normalizeOptional(executorFormValues.achievements),
            certificates: fromCommaSeparated(executorFormValues.certificates),
            grade: normalizeOptional(executorFormValues.grade),
            extraInfo: normalizeOptional(executorFormValues.extraInfo),
          },
        }).unwrap()

        setExecutorFormValues(createExecutorProfileFormValues(updatedProfile))
      }

      setIsEditingRoleSpecific(false)
      resetRoleFormErrors()
      setRoleSubmitMessage({ status: 'success', message: 'Профиль обновлён.' })
      void refetch()
    } catch (submitError) {
      const message = isFetchBaseQueryError(submitError)
        ? getRequestErrorMessage(submitError)
        : 'Не удалось сохранить профиль.'

      setRoleSubmitMessage({ status: 'error', message })
    }
  }

  const commonDetailItems: DetailItem[] = [
    { label: 'Имя', value: toTextOrDash(profile.firstName) },
    { label: 'Фамилия', value: toTextOrDash(profile.lastName) },
    { label: 'Email', value: toTextOrDash(profile.email) },
    { label: 'Телефон', value: toTextOrDash(profile.phone) },
    { label: 'Роль', value: toRoleLabel(profile.role) },
    { label: 'Email подтвержден', value: profile.isEmailVerified ? 'Да' : 'Нет' },
    { label: 'Телефон подтвержден', value: profile.isPhoneVerified ? 'Да' : 'Нет' },
  ]

  const applicantDetailItems: DetailItem[] = [
    { label: 'Желаемая должность', value: toTextOrDash(profile.applicantProfile?.resumeTitle) },
    { label: 'Предыдущая компания', value: toTextOrDash(profile.applicantProfile?.previousCompanyName) },
    { label: 'Период работы', value: toTextOrDash(profile.applicantProfile?.workPeriod) },
    { label: 'Опыт', value: toTextOrDash(profile.applicantProfile?.experienceSummary) },
    { label: 'Достижения', value: toTextOrDash(profile.applicantProfile?.achievements) },
    { label: 'Образование', value: toTextOrDash(profile.applicantProfile?.education) },
    { label: 'Навыки', value: toListOrDash(profile.applicantProfile?.skills) },
    { label: 'Сертификаты', value: toListOrDash(profile.applicantProfile?.certificates) },
    { label: 'Портфолио', value: toTextOrDash(profile.applicantProfile?.portfolioUrl) },
    { label: 'О себе', value: toTextOrDash(profile.applicantProfile?.about) },
    { label: 'Желаемая зарплата', value: profile.applicantProfile?.desiredSalary ?? '—' },
  ]

  const customerDetailItems: DetailItem[] = [
    { label: 'ИНН', value: toTextOrDash(profile.customerProfile?.inn) },
    { label: 'ЕГРН', value: toTextOrDash(profile.customerProfile?.egrn) },
    { label: 'ЕГРНИП', value: toTextOrDash(profile.customerProfile?.egrnip) },
    { label: 'Компания', value: toTextOrDash(profile.customerProfile?.companyName) },
    { label: 'Логотип', value: toTextOrDash(profile.customerProfile?.companyLogoUrl) },
  ]

  const executorDetailItems: DetailItem[] = [
    { label: 'Формат занятости', value: toEmploymentTypeLabel(profile.executorProfile?.employmentType) },
    { label: 'Проект', value: toTextOrDash(profile.executorProfile?.projectTitle) },
    { label: 'Компания проекта', value: toTextOrDash(profile.executorProfile?.projectCompanyName) },
    { label: 'Опыт', value: toTextOrDash(profile.executorProfile?.experienceSummary) },
    { label: 'Достижения', value: toTextOrDash(profile.executorProfile?.achievements) },
    { label: 'Сертификаты', value: toListOrDash(profile.executorProfile?.certificates) },
    { label: 'Грейд', value: toTextOrDash(profile.executorProfile?.grade) },
    { label: 'Дополнительно', value: toTextOrDash(profile.executorProfile?.extraInfo) },
  ]

  return (
    <section className="page profile-page">
      <h2>Профиль</h2>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
          <CardTitle className="text-xl">Общие данные</CardTitle>
          {!isEditingCommon ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleStartEditCommon}
              disabled={isEditingRoleSpecific}
            >
              Редактировать
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* @dvnull: Статусы submit-форм приведены к единому form-feedback паттерну. */}
          {commonSubmitMessage.status !== 'idle' ? (
            <FormStatusMessage
              message={commonSubmitMessage.message}
              status={commonSubmitMessage.status === 'error' ? 'error' : 'success'}
            />
          ) : null}

          {/* @dvnull: Для валидируемых полей добавлены aria-связки input/select <-> error message. */}
          {isEditingCommon ? (
            <form noValidate onSubmit={handleCommonFormSubmit} className="grid gap-4">
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
                    aria-describedby={
                      commonFormErrors.firstName ? 'profile-common-firstName-error' : undefined
                    }
                  />
                  <FormFieldError id="profile-common-firstName-error">
                    {commonFormErrors.firstName}
                  </FormFieldError>
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
                  <FormFieldError id="profile-common-lastName-error">
                    {commonFormErrors.lastName}
                  </FormFieldError>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEditCommon}
                  disabled={isUpdatingProfile}
                >
                  Отмена
                </Button>
              </div>
            </form>
          ) : (
            <Details items={commonDetailItems} />
          )}
        </CardContent>
      </Card>

      {profile.role === 'Applicant' ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
            <CardTitle className="text-xl">Профиль соискателя</CardTitle>
            {!isEditingRoleSpecific ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleStartEditRoleSpecific}
                disabled={isEditingCommon}
              >
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
              <form noValidate onSubmit={handleRoleSpecificFormSubmit} className="grid gap-4">
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
                      aria-describedby={
                        applicantFormErrors.desiredSalary ? 'applicant-desiredSalary-error' : undefined
                      }
                    />
                    <FormFieldError id="applicant-desiredSalary-error">
                      {applicantFormErrors.desiredSalary}
                    </FormFieldError>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEditRoleSpecific}
                    disabled={isUpdatingProfile}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <Details items={applicantDetailItems} />
            )}
          </CardContent>
        </Card>
      ) : null}

      {profile.role === 'Customer' ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
            <CardTitle className="text-xl">Профиль заказчика</CardTitle>
            {!isEditingRoleSpecific ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleStartEditRoleSpecific}
                disabled={isEditingCommon}
              >
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
              <form noValidate onSubmit={handleRoleSpecificFormSubmit} className="grid gap-4">
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
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEditRoleSpecific}
                    disabled={isUpdatingProfile}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <Details items={customerDetailItems} />
            )}
          </CardContent>
        </Card>
      ) : null}

      {profile.role === 'Executor' ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
            <CardTitle className="text-xl">Профиль исполнителя</CardTitle>
            {!isEditingRoleSpecific ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleStartEditRoleSpecific}
                disabled={isEditingCommon}
              >
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
              <form noValidate onSubmit={handleRoleSpecificFormSubmit} className="grid gap-4">
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
                        aria-describedby={
                          executorFormErrors.employmentType ? 'executor-employmentType-error' : undefined
                        }
                      >
                        <SelectValue placeholder="Выберите формат" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fl">Физлицо</SelectItem>
                        <SelectItem value="Smz">Самозанятый</SelectItem>
                        <SelectItem value="Ip">ИП</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormFieldError id="executor-employmentType-error">
                      {executorFormErrors.employmentType}
                    </FormFieldError>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEditRoleSpecific}
                    disabled={isUpdatingProfile}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <Details items={executorDetailItems} />
            )}
          </CardContent>
        </Card>
      ) : null}

      {profile.role === 'Admin' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Профиль администратора</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Для этой роли нет дополнительных полей профиля.</p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}
