import { ChevronRight } from 'lucide-react'
import { AuthAlert } from '@/components/auth'
import type { FieldErrors } from '@/features/auth/lib/registrationValidation'
import type { RegistrationDraft } from '@/features/auth/model/registrationDraft'
import { roleMeta, roleTitle } from './registerMeta'
import type { DraftPatch, RegisterFormError } from './types'
import {
  ApplicantPrivacyNote,
  ApplicantProfileBody,
  ApplicantProfileFootnote,
  ProfileSubmitButton,
} from './RegisterApplicantProfile'
import { CustomerProfileBody, CustomerProfileFootnote } from './RegisterCustomerProfile'
import { ExecutorProfileBody, ExecutorProfileFootnote } from './RegisterExecutorProfile'

const profileCopy: Record<
  RegistrationDraft['role'],
  { title: string; subtitle: string; submit: string }
> = {
  Customer: {
    title: 'Расскажите о вашей компании',
    subtitle:
      'Данные необходимы для составления договоров, автоматического резервирования выплат и выставления закрывающих актов.',
    submit: 'Завершить регистрацию',
  },
  Executor: {
    title: 'Ваш юридический статус',
    subtitle:
      'Выберите форму сотрудничества для безопасного получения гонораров за закрытые вакансии.',
    submit: 'Завершить регистрацию',
  },
  Applicant: {
    title: 'Создайте свой профиль',
    subtitle:
      'Укажите базовые ориентиры, чтобы рекрутеры и работодатели могли подбирать релевантные вакансии.',
    submit: 'Перейти к созданию резюме',
  },
}

type RegisterProfileStepProps = {
  draft: RegistrationDraft
  errors: FieldErrors
  formError: RegisterFormError | null
  isSubmitting: boolean
  patch: DraftPatch
  onBack: () => void
  onChangeRole: () => void
  onBackToCode: () => void
  onSubmit: () => void
  onGoToLogin: () => void
}

export function RegisterProfileStep({
  draft,
  errors,
  formError,
  isSubmitting,
  patch,
  onBack,
  onChangeRole,
  onBackToCode,
  onSubmit,
  onGoToLogin,
}: RegisterProfileStepProps) {
  const copy = profileCopy[draft.role]
  const meta = roleMeta[draft.role]

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-caption-meta text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Назад
      </button>

      <div className="mb-5 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
        <span className="min-w-0 truncate text-caption-meta text-foreground">
          Роль: <span className="font-semibold">{roleTitle(draft.role)}</span>
        </span>
        <button
          type="button"
          onClick={onChangeRole}
          className="inline-flex shrink-0 items-center gap-0.5 text-caption-meta font-medium text-primary hover:underline"
        >
          Сменить
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <h1 className="m-0 text-display-page-title text-foreground">{copy.title}</h1>
      <p className="m-0 mt-2 text-body-default text-muted-foreground">{copy.subtitle}</p>

      {formError ? (
        <div className="mt-4">
          <AuthAlert tone="error" title={formError.title} description={formError.description} />
          {formError.action === 'back-to-code' ? (
            <button
              type="button"
              onClick={onBackToCode}
              className="mt-2 text-caption-meta font-medium text-primary hover:underline"
            >
              Пройти подтверждение заново
            </button>
          ) : null}
          {formError.action === 'go-to-login' ? (
            <button
              type="button"
              onClick={onGoToLogin}
              className="mt-2 text-caption-meta font-medium text-primary hover:underline"
            >
              Перейти ко входу
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5">
        {draft.role === 'Applicant' ? (
          <ApplicantProfileBody draft={draft} errors={errors} patch={patch} />
        ) : draft.role === 'Customer' ? (
          <CustomerProfileBody draft={draft} errors={errors} patch={patch} />
        ) : (
          <ExecutorProfileBody draft={draft} errors={errors} patch={patch} />
        )}
      </div>

      <ProfileSubmitButton label={copy.submit} isSubmitting={isSubmitting} onClick={onSubmit} />

      {draft.role === 'Applicant' ? <ApplicantProfileFootnote /> : null}
      {draft.role === 'Customer' ? <CustomerProfileFootnote /> : null}
      {draft.role === 'Executor' ? <ExecutorProfileFootnote /> : null}

      {draft.role === 'Applicant' ? <ApplicantPrivacyNote /> : null}
      {draft.role === 'Customer' ? (
        <p className="m-0 mt-4 text-center text-caption-meta text-text-tertiary">{meta.qualifier}</p>
      ) : null}
    </div>
  )
}
