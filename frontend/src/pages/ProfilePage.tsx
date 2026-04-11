import { useState, type FormEvent } from 'react'
import {
  useProfileServer,
  type ExecutorEmploymentType,
  type UserRole,
} from '@/features/profile/model'
import { ProfileApplicantSection } from '@/features/profile/ui/ProfileApplicantSection'
import { ProfileCommonSection } from '@/features/profile/ui/ProfileCommonSection'
import { ProfileCustomerSection } from '@/features/profile/ui/ProfileCustomerSection'
import { ProfileExecutorSection } from '@/features/profile/ui/ProfileExecutorSection'
import { ProfileRoleSwitcher } from '@/features/profile/ui/ProfileRoleSwitcher'
import { getRequestErrorMessage, isFetchBaseQueryError } from '@/features/profile/lib/errors'
import {
  normalizeOptional,
  toDateTimeOrDash,
  toListOrDash,
  toTextOrDash,
} from '@/features/profile/lib/formatters'
import {
  toCustomerLegalFormLabel,
  toEmploymentTypeLabel,
} from '@/features/profile/lib/enums'
import {
  createApplicantProfileFormValues,
  createCommonProfileFormValues,
  createCustomerProfileFormValues,
  createExecutorProfileFormValues,
} from '@/features/profile/lib/form-state'
import {
  buildApplicantUpdatePayload,
  buildCustomerUpdatePayload,
  buildExecutorUpdatePayload,
} from '@/features/profile/lib/payloads'
import { resolveActiveRole, resolveAvailableRoles, toRoleLabel } from '@/features/profile/lib/roles'
import {
  validateApplicantProfileForm,
  validateCommonProfileForm,
  validateCustomerProfileForm,
  validateExecutorProfileForm,
} from '@/features/profile/lib/validation'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  legalForm: '' | 'Ooo' | 'Ip'
  egrn: string
  egrnip: string
  companyName: string
  companyLogoUrl: string
  offerAccepted: boolean
  offerVersion: string
}

type CustomerProfileFormErrors = Partial<Record<'offerVersion', string>>

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

export function ProfilePage() {
  const {
    data,
    isLoading,
    isError,
    error,
    isSwitchingRole,
    isUpdatingProfile,
    refetch,
    switchMyActiveRole,
    updateMyProfile,
  } = useProfileServer()

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
    legalForm: '',
    egrn: '',
    egrnip: '',
    companyName: '',
    companyLogoUrl: '',
    offerAccepted: false,
    offerVersion: '',
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
  const [customerFormErrors, setCustomerFormErrors] = useState<CustomerProfileFormErrors>({})
  const [executorFormErrors, setExecutorFormErrors] = useState<ExecutorProfileFormErrors>({})
  const [roleSubmitMessage, setRoleSubmitMessage] = useState<SubmitMessageState>({
    status: 'idle',
    message: '',
  })
  const [roleSwitchMessage, setRoleSwitchMessage] = useState<SubmitMessageState>({
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
  // @dvnull: Ранее страница профиля ориентировалась только на поле role, переключение переведено на activeRole/roles от backend.
  const activeRole = resolveActiveRole(profile)
  const availableRoles = resolveAvailableRoles(profile, activeRole)
  const canSwitchApplicantExecutor =
    availableRoles.includes('Applicant') && availableRoles.includes('Executor')

  function resetRoleFormErrors() {
    setApplicantFormErrors({})
    setCustomerFormErrors({})
    setExecutorFormErrors({})
  }

  async function handleSwitchActiveRole(nextRole: Extract<UserRole, 'Applicant' | 'Executor'>) {
    if (!canSwitchApplicantExecutor || activeRole === nextRole) {
      return
    }

    try {
      await switchMyActiveRole({ activeRole: nextRole }).unwrap()
      setRoleSwitchMessage({
        status: 'success',
        message: `Активная роль изменена на «${nextRole === 'Applicant' ? 'Соискатель' : 'Исполнитель'}».`,
      })
      void refetch()
    } catch (switchError) {
      const message = isFetchBaseQueryError(switchError)
        ? getRequestErrorMessage(switchError)
        : 'Не удалось переключить роль.'

      setRoleSwitchMessage({ status: 'error', message })
    }
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
    if (isEditingCommon || activeRole === 'Admin') {
      return
    }

    setIsEditingRoleSpecific(true)
    setRoleSubmitMessage({ status: 'idle', message: '' })
    resetRoleFormErrors()

    if (activeRole === 'Applicant') {
      setApplicantFormValues(createApplicantProfileFormValues(profile))
      return
    }

    if (activeRole === 'Customer') {
      setCustomerFormValues(createCustomerProfileFormValues(profile))
      return
    }

    if (activeRole === 'Executor') {
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
      if (activeRole === 'Applicant') {
        const nextErrors = validateApplicantProfileForm(applicantFormValues)
        if (Object.keys(nextErrors).length > 0) {
          setApplicantFormErrors(nextErrors)
          return
        }

        const updatedProfile = await updateMyProfile(
          buildApplicantUpdatePayload(basePayload, applicantFormValues),
        ).unwrap()

        setApplicantFormValues(createApplicantProfileFormValues(updatedProfile))
      } else if (activeRole === 'Customer') {
        const nextErrors = validateCustomerProfileForm(customerFormValues)
        if (Object.keys(nextErrors).length > 0) {
          setCustomerFormErrors(nextErrors)
          return
        }

        const updatedProfile = await updateMyProfile(
          buildCustomerUpdatePayload({
            basePayload,
            formValues: customerFormValues,
            currentOfferAccepted: profile.customerProfile?.offerAccepted ?? false,
            currentOfferVersion: profile.customerProfile?.offerVersion ?? '',
          }),
        ).unwrap()

        setCustomerFormValues(createCustomerProfileFormValues(updatedProfile))
      } else if (activeRole === 'Executor') {
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

        const updatedProfile = await updateMyProfile(
          buildExecutorUpdatePayload(basePayload, executorFormValues, employmentType),
        ).unwrap()

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
    { label: 'Роль', value: toRoleLabel(activeRole) },
    { label: 'Доступные роли', value: availableRoles.map((role) => toRoleLabel(role)).join(', ') },
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
    { label: 'Юрформа', value: toCustomerLegalFormLabel(profile.customerProfile?.legalForm) },
    { label: 'ЕГРН', value: toTextOrDash(profile.customerProfile?.egrn) },
    { label: 'ЕГРНИП', value: toTextOrDash(profile.customerProfile?.egrnip) },
    { label: 'Компания', value: toTextOrDash(profile.customerProfile?.companyName) },
    { label: 'Логотип', value: toTextOrDash(profile.customerProfile?.companyLogoUrl) },
    { label: 'Согласие с офертой', value: profile.customerProfile?.offerAccepted ? 'Да' : 'Нет' },
    { label: 'Версия оферты', value: toTextOrDash(profile.customerProfile?.offerVersion) },
    { label: 'Дата акцепта', value: toDateTimeOrDash(profile.customerProfile?.offerAcceptedAtUtc) },
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
  const isRoleSwitchDisabled =
    isEditingCommon || isEditingRoleSpecific || isSwitchingRole || isUpdatingProfile

  return (
    <section className="page profile-page">
      <h2>Профиль</h2>

      <ProfileCommonSection
        isEditingCommon={isEditingCommon}
        isEditingRoleSpecific={isEditingRoleSpecific}
        isUpdatingProfile={isUpdatingProfile}
        commonFormValues={commonFormValues}
        commonFormErrors={commonFormErrors}
        commonSubmitMessage={commonSubmitMessage}
        commonDetailItems={commonDetailItems}
        onStartEdit={handleStartEditCommon}
        onCancelEdit={handleCancelEditCommon}
        onSubmit={handleCommonFormSubmit}
        setCommonFormValues={setCommonFormValues}
      />

      {canSwitchApplicantExecutor ? (
        <ProfileRoleSwitcher
          activeRole={activeRole}
          isRoleSwitchDisabled={isRoleSwitchDisabled}
          roleSwitchMessage={roleSwitchMessage}
          onSwitchRole={(nextRole) => void handleSwitchActiveRole(nextRole)}
        />
      ) : null}

      {activeRole === 'Applicant' ? (
        <ProfileApplicantSection
          isEditingRoleSpecific={isEditingRoleSpecific}
          isEditingCommon={isEditingCommon}
          isUpdatingProfile={isUpdatingProfile}
          applicantFormValues={applicantFormValues}
          applicantFormErrors={applicantFormErrors}
          applicantDetailItems={applicantDetailItems}
          roleSubmitMessage={roleSubmitMessage}
          onStartEdit={handleStartEditRoleSpecific}
          onCancelEdit={handleCancelEditRoleSpecific}
          onSubmit={handleRoleSpecificFormSubmit}
          setApplicantFormValues={setApplicantFormValues}
        />
      ) : null}

      {activeRole === 'Customer' ? (
        <ProfileCustomerSection
          isEditingRoleSpecific={isEditingRoleSpecific}
          isEditingCommon={isEditingCommon}
          isUpdatingProfile={isUpdatingProfile}
          customerFormValues={customerFormValues}
          customerFormErrors={customerFormErrors}
          customerDetailItems={customerDetailItems}
          roleSubmitMessage={roleSubmitMessage}
          onStartEdit={handleStartEditRoleSpecific}
          onCancelEdit={handleCancelEditRoleSpecific}
          onSubmit={handleRoleSpecificFormSubmit}
          setCustomerFormValues={setCustomerFormValues}
        />
      ) : null}

      {activeRole === 'Executor' ? (
        <ProfileExecutorSection
          isEditingRoleSpecific={isEditingRoleSpecific}
          isEditingCommon={isEditingCommon}
          isUpdatingProfile={isUpdatingProfile}
          executorFormValues={executorFormValues}
          executorFormErrors={executorFormErrors}
          executorDetailItems={executorDetailItems}
          roleSubmitMessage={roleSubmitMessage}
          onStartEdit={handleStartEditRoleSpecific}
          onCancelEdit={handleCancelEditRoleSpecific}
          onSubmit={handleRoleSpecificFormSubmit}
          setExecutorFormValues={setExecutorFormValues}
        />
      ) : null}

      {activeRole === 'Admin' ? (
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
