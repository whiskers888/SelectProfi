import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
import { AuthCard, AuthLayout, AuthStepper, normalizeRuPhoneForApi } from '@/components/auth'
import type { AuthProviderKey } from '@/components/auth'
import { useRegisterUseCase, useVerificationUseCases } from '@/features/auth/model'
import {
  emptyRegistrationDraft,
  type RegistrationDraft,
  type RegistrationRole,
} from '@/features/auth/model/registrationDraft'
import { extractProblemCode, extractProblemMessage } from '@/features/auth/lib/errors'
import { buildRegisterPayload } from '@/features/auth/lib/registrationPayload'
import type { FieldErrors } from '@/features/auth/lib/registrationValidation'
import {
  validateIdentityStep,
  validateProfileStep,
  validateRoleStep,
} from '@/features/auth/lib/registrationValidation'
import { useUpdateMyProfileMutation } from '@/shared/api/profile'
import type { ApplicantProfilePayload, ExecutorProfilePayload } from '@/shared/api/profile'
import type { JobSearchStatus } from '@/features/auth/model/registrationDraft'
import { stepDefinitions } from '@/features/auth/ui/register/registerMeta'
import { RegisterRoleStep } from '@/features/auth/ui/register/RegisterRoleStep'
import { RegisterIdentityStep } from '@/features/auth/ui/register/RegisterIdentityStep'
import { RegisterCodeStep } from '@/features/auth/ui/register/RegisterCodeStep'
import { RegisterProfileStep } from '@/features/auth/ui/register/RegisterProfileStep'
import { providerLabel } from '@/features/auth/ui/register/providerLabel'
import type { RegisterFormError, VerificationChallenge } from '@/features/auth/ui/register/types'

const codeInitial = (length: number): string[] => Array.from({ length }, () => '')

const footerNote = 'Регистрация занимает меньше минуты и защищена по 152-ФЗ'

export function RegisterPage() {
  const navigate = useNavigate()
  const { executeRegister, isApiError, isLoading } = useRegisterUseCase()
  const { sendVerification, confirmVerification, isSending, isConfirming } = useVerificationUseCases()
  const [updateMyProfile] = useUpdateMyProfileMutation()

  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState<RegistrationDraft>(emptyRegistrationDraft)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<RegisterFormError | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<VerificationChallenge | null>(null)
  const [code, setCode] = useState<string[]>(codeInitial(6))
  const [codeError, setCodeError] = useState<string | null>(null)
  const [isCodeLocked, setIsCodeLocked] = useState(false)

  const patch = useCallback((next: Partial<RegistrationDraft>) => {
    setDraft((previous) => ({ ...previous, ...next }))
    setErrors((previous) => {
      const cleared: FieldErrors = { ...previous }
      for (const key of Object.keys(next)) {
        delete cleared[key]
      }
      return cleared
    })
  }, [])

  function goTo(nextIndex: number) {
    setFormError(null)
    setInfoMessage(null)
    setStepIndex(nextIndex)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function hasVerifiedIdentity(): boolean {
    return draft.verificationToken.trim().length > 0
  }

  function handleRoleChange(role: RegistrationRole) {
    patch({ role })
    setErrors({})
  }

  async function requestCode(): Promise<{ ok: true } | { ok: false; error: RegisterFormError }> {
    const channel = draft.method === 'phone' ? 'Phone' : 'Email'
    const target = draft.method === 'phone' ? normalizePhone(draft.phone) : draft.email.trim()

    try {
      const response = await sendVerification({ channel, target })
      setChallenge({
        challengeId: response.challengeId,
        channel: response.channel,
        maskedTarget: response.maskedTarget,
        codeLength: response.codeLength || 6,
        resendAvailableAtUtc: response.resendAvailableAtUtc,
        debugCode: response.debugCode ?? null,
        developmentMode: response.developmentMode ?? false,
      })
      setCode(codeInitial(response.codeLength || 6))
      setCodeError(null)
      setIsCodeLocked(false)
      return { ok: true }
    } catch (error) {
      if (isApiError(error)) {
        return {
          ok: false,
          error: mapVerificationError(extractProblemCode(error.data), error.data),
        }
      }
      return { ok: false, error: { title: 'Не удалось отправить код. Повторите попытку.' } }
    }
  }

  async function handleIdentitySubmit() {
    const nextErrors = validateIdentityStep(draft)
    setErrors(nextErrors)
    setFormError(null)
    setInfoMessage(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const result = await requestCode()
    if (result.ok) {
      goTo(2)
      return
    }
    setFormError(result.error)
  }

  async function handleResend() {
    setCodeError(null)
    setInfoMessage(null)
    const result = await requestCode()
    if (!result.ok) {
      setCodeError(result.error.title)
    }
  }

  async function handleConfirmCode(overrideCode?: string) {
    if (!challenge) return
    if (isCodeLocked || isConfirming) return
    const joined = overrideCode ?? code.join('')
    if (joined.length !== challenge.codeLength) return

    try {
      const response = await confirmVerification({
        challengeId: challenge.challengeId,
        code: joined,
      })
      patch({ verificationToken: response.verificationToken, verifiedTarget: response.target })
      setCodeError(null)
      goTo(3)
    } catch (error) {
      if (!isApiError(error)) {
        setCodeError('Не удалось подтвердить код. Повторите попытку.')
        return
      }

      const problemCode = extractProblemCode(error.data)
      if (problemCode === 'verification_attempts_exceeded') {
        setCodeError(extractProblemMessage(error.data, 'Превышено число попыток ввода кода.'))
        setIsCodeLocked(true)
        setCode(codeInitial(challenge.codeLength))
        return
      }

      if (problemCode === 'verification_challenge_expired') {
        setCodeError('Срок действия кода истёк. Запросите новый код.')
        setIsCodeLocked(true)
        setCode(codeInitial(challenge.codeLength))
        return
      }

      setCodeError(extractProblemMessage(error.data, 'Неверный код подтверждения.'))
      setCode(codeInitial(challenge.codeLength))
    }
  }

  async function handleProfileSubmit() {
    const nextErrors = validateProfileStep(draft)
    setErrors(nextErrors)
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      await executeRegister(buildRegisterPayload(draft))
    } catch (error) {
      const problemCode = isApiError(error) ? extractProblemCode(error.data) : null

      if (problemCode === 'email_already_exists') {
        setErrors((previous) => ({ ...previous, email: 'Email уже зарегистрирован' }))
        setFormError({
          title: 'Этот email уже зарегистрирован',
          description: 'Войдите в существующий аккаунт или используйте другой email.',
          action: 'go-to-login',
        })
        return
      }

      if (problemCode === 'phone_already_exists') {
        setErrors((previous) => ({ ...previous, phone: 'Телефон уже зарегистрирован' }))
        setFormError({
          title: 'Этот номер уже зарегистрирован',
          description: 'Войдите в существующий аккаунт или используйте другой номер.',
          action: 'go-to-login',
        })
        return
      }

      if (problemCode === 'verification_token_mismatch') {
        setFormError({
          title: 'Данные подтверждения не совпадают. Пройдите подтверждение заново.',
          action: 'back-to-code',
        })
        return
      }

      if (problemCode === 'verification_token_expired' || problemCode === 'verification_challenge_expired') {
        setFormError({
          title: 'Срок действия подтверждения истёк. Пройдите подтверждение заново.',
          action: 'back-to-code',
        })
        return
      }

      if (problemCode === 'validation_error') {
        setFormError({ title: 'Проверьте корректность заполнения полей формы.' })
        return
      }

      setFormError({
        title: isApiError(error)
          ? extractProblemMessage(error.data, 'Не удалось завершить регистрацию. Повторите попытку.')
          : 'Не удалось завершить регистрацию. Повторите попытку.',
      })
      return
    }

    if (draft.role === 'Applicant' || draft.role === 'Executor') {
      await persistProfile(draft)
    }

    navigate(routePaths.app)
  }

  async function persistProfile(currentDraft: RegistrationDraft) {
    const applicantProfile: ApplicantProfilePayload & { jobSearchStatus?: JobSearchStatus } | undefined =
      currentDraft.role === 'Applicant'
        ? {
            resumeTitle: currentDraft.applicantJobTitle.trim(),
            jobSearchStatus: currentDraft.applicantJobSearchStatus,
          }
        : undefined

    const executorProfile: ExecutorProfilePayload & { inn?: string; ogrnip?: string } | undefined =
      currentDraft.role === 'Executor'
        ? {
            employmentType:
              currentDraft.executorEmploymentType === ''
                ? undefined
                : currentDraft.executorEmploymentType,
            inn: currentDraft.executorInn.trim() || undefined,
            ogrnip: currentDraft.executorOgrnip.trim() || undefined,
          }
        : undefined
    try {
      await updateMyProfile({
        firstName: currentDraft.firstName.trim(),
        lastName: currentDraft.lastName.trim(),
        phone: currentDraft.method === 'phone' ? normalizePhone(currentDraft.phone) : undefined,
        applicantProfile,
        executorProfile,
      }).unwrap()
    } catch {
      return
    }
  }

  function handleProviderClick(provider: AuthProviderKey) {
    setInfoMessage(`Регистрация через ${providerLabel(provider)} пока недоступна.`)
  }

  function handleBackToCode() {
    setFormError(null)
    setCodeError(null)
    setIsCodeLocked(false)
    goTo(2)
  }

  function handleCodeChange(next: string[]) {
    setCode(next)
    setCodeError(null)
  }

  const currentStep = stepDefinitions[stepIndex]
  const caption = `ШАГ ${stepIndex + 1} ИЗ 4 · ${currentStep.caption}`

  return (
    <AuthLayout footerNote={footerNote}>
      <AuthCard>
        <AuthStepper
          steps={stepDefinitions.map((step) => ({ key: step.key, label: step.label }))}
          currentStep={stepIndex}
          caption={caption}
        />

        {stepIndex === 0 ? (
          <RegisterRoleStep
            role={draft.role}
            error={errors.role}
            onRoleChange={handleRoleChange}
            onContinue={() => {
              const nextErrors = validateRoleStep(draft.role)
              setErrors(nextErrors)
              if (Object.keys(nextErrors).length === 0) {
                goTo(hasVerifiedIdentity() ? 3 : 1)
              }
            }}
            onLoginClick={() => navigate(routePaths.auth)}
          />
        ) : null}

        {stepIndex === 1 ? (
          <RegisterIdentityStep
            draft={draft}
            errors={errors}
            formError={formError}
            infoMessage={infoMessage}
            isSending={isSending}
            patch={patch}
            onBack={() => goTo(0)}
            onChangeRole={() => goTo(0)}
            onSubmit={handleIdentitySubmit}
            onProviderClick={handleProviderClick}
            onGoToLogin={() => navigate(routePaths.auth)}
          />
        ) : null}

        {stepIndex === 2 ? (
          <RegisterCodeStep
            challenge={challenge}
            code={code}
            error={codeError}
            isConfirming={isConfirming}
            isResending={isSending}
            isLocked={isCodeLocked}
            onCodeChange={handleCodeChange}
            onConfirm={() => handleConfirmCode()}
            onConfirmCode={handleConfirmCode}
            onResend={handleResend}
            onEditTarget={() => goTo(1)}
          />
        ) : null}

        {stepIndex === 3 ? (
          <RegisterProfileStep
            draft={draft}
            errors={errors}
            formError={formError}
            isSubmitting={isLoading}
            patch={patch}
            onBack={() => goTo(2)}
            onChangeRole={() => goTo(0)}
            onBackToCode={handleBackToCode}
            onSubmit={handleProfileSubmit}
            onGoToLogin={() => navigate(routePaths.auth)}
          />
        ) : null}
      </AuthCard>

      {stepIndex === 2 ? (
        <p className="m-0 mt-4 text-center text-caption-meta text-muted-foreground">
          256-битное шифрование · Защита данных 152-ФЗ · КадрыТут
        </p>
      ) : null}
    </AuthLayout>
  )
}

function mapVerificationError(code: string | null, data: unknown): RegisterFormError {
  if (code === 'phone_already_exists') {
    return {
      title: 'Этот номер уже зарегистрирован',
      description: 'Войдите в существующий аккаунт или используйте другой номер.',
      action: 'go-to-login',
    }
  }

  if (code === 'email_already_exists') {
    return {
      title: 'Этот email уже зарегистрирован',
      description: 'Войдите в существующий аккаунт или используйте другой email.',
      action: 'go-to-login',
    }
  }

  if (code === 'verification_resend_too_soon') {
    return { title: 'Код уже отправлен. Дождитесь возможности запросить новый.' }
  }

  return {
    title: extractProblemMessage(data, 'Не удалось отправить код. Повторите попытку.'),
  }
}

function normalizePhone(raw: string): string {
  return normalizeRuPhoneForApi(raw)
}
