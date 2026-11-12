import { ArrowRight, Briefcase, EyeOff, Loader2, UserRound } from 'lucide-react'
import type { FieldErrors } from '@/features/auth/lib/registrationValidation'
import { jobSearchStatusOptions } from '@/features/auth/lib/registrationValidation'
import type { RegistrationDraft } from '@/features/auth/model/registrationDraft'
import { cn } from '@/lib/utils'
import { joinName, splitName } from './registerApplicantMeta'
import type { DraftPatch } from './types'

const jobTitleChips = ['React Developer', 'Frontend Lead', 'Fullstack Engineer']

type ApplicantBodyProps = {
  draft: RegistrationDraft
  errors: FieldErrors
  patch: DraftPatch
}

export function ApplicantProfileBody({ draft, errors, patch }: ApplicantBodyProps) {
  const nameError = errors.firstName ?? errors.lastName

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="applicant-name" className="block text-caption-meta font-medium text-foreground">
            Имя и Фамилия <span className="text-error">*</span>
          </label>
          <span className="text-caption-meta text-muted-foreground">Как в паспорте</span>
        </div>
        <div
          className={cn(
            'flex h-10 items-center gap-2 rounded-md border bg-card px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
            nameError ? 'border-error' : 'border-border',
          )}
        >
          <UserRound className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
          <input
            id="applicant-name"
            type="text"
            autoComplete="name"
            placeholder="Введите имя и фамилию"
            value={joinName(draft.firstName, draft.lastName)}
            onChange={(event) => patch(splitName(event.target.value))}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'applicant-name-error' : undefined}
            className="h-full w-full bg-transparent text-body-default text-foreground outline-none placeholder:text-text-tertiary"
          />
        </div>
        {nameError ? (
          <p id="applicant-name-error" className="m-0 text-caption-meta text-error">
            {nameError}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="applicant-job-title" className="block text-caption-meta font-medium text-foreground">
          Желаемая должность <span className="text-error">*</span>
        </label>
        <div
          className={cn(
            'flex h-10 items-center gap-2 rounded-md border bg-card px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
            errors.applicantJobTitle ? 'border-error' : 'border-border',
          )}
        >
          <Briefcase className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
          <input
            id="applicant-job-title"
            type="text"
            placeholder="Например: Product Manager"
            value={draft.applicantJobTitle}
            onChange={(event) => patch({ applicantJobTitle: event.target.value })}
            aria-invalid={Boolean(errors.applicantJobTitle)}
            aria-describedby={errors.applicantJobTitle ? 'applicant-job-title-error' : undefined}
            className="h-full w-full bg-transparent text-body-default text-foreground outline-none placeholder:text-text-tertiary"
          />
        </div>
        {errors.applicantJobTitle ? (
          <p id="applicant-job-title-error" className="m-0 text-caption-meta text-error">
            {errors.applicantJobTitle}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="mr-1 text-caption-meta text-muted-foreground">Быстрый выбор:</span>
          {jobTitleChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => patch({ applicantJobTitle: chip })}
              className="rounded-lg bg-muted px-2.5 py-1 text-caption-meta text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-caption-meta font-medium text-foreground">
            Статус поиска работы <span className="text-error">*</span>
          </span>
          <span className="text-caption-meta text-muted-foreground">Виден рекрутерам</span>
        </div>
        <div role="radiogroup" aria-label="Статус поиска работы" className="flex flex-col gap-2">
          {jobSearchStatusOptions.map((option) => {
            const isSelected = draft.applicantJobSearchStatus === option.value
            return (
              <div
                key={option.value}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => patch({ applicantJobSearchStatus: option.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    patch({ applicantJobSearchStatus: option.value })
                  }
                }}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected ? 'border-primary/30 bg-secondary' : 'border-border bg-card hover:bg-muted',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-3 w-3 shrink-0 rounded-full',
                      option.value === 'Active'
                        ? 'bg-success'
                        : option.value === 'OpenToOffers'
                          ? 'bg-warning'
                          : 'bg-border',
                    )}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-body-default font-medium text-foreground">{option.label}</span>
                    <span className="text-caption-meta text-muted-foreground">{option.description}</span>
                  </div>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded bg-card px-2 py-0.5 text-label-micro uppercase text-muted-foreground">
                  {option.badge}
                </span>
              </div>
            )
          })}
        </div>
        {errors.applicantJobSearchStatus ? (
          <p className="m-0 text-caption-meta text-error">{errors.applicantJobSearchStatus}</p>
        ) : null}
      </div>
    </div>
  )
}

export function ApplicantProfileFootnote() {
  return (
    <p className="m-0 mt-4 text-center text-caption-meta text-muted-foreground">
      Вы сможете добавить опыт работы, навыки и портфолио на следующем шаге
    </p>
  )
}

export function ApplicantPrivacyNote() {
  return (
    <p className="m-0 mt-4 flex items-center justify-center gap-2 text-center text-caption-meta text-muted-foreground">
      <EyeOff className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      Контакты скрыты до момента подтверждения взаимного интереса (152-ФЗ)
    </p>
  )
}

export function ProfileSubmitButton({
  label,
  isSubmitting,
  onClick,
}: {
  label: string
  isSubmitting: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSubmitting}
      className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-body-default font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {label}
      {!isSubmitting ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
    </button>
  )
}
