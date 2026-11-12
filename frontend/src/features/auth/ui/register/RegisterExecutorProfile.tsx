import { useRef, useState } from 'react'
import { FileUp, TrendingUp, UserRound, Upload } from 'lucide-react'
import type { FieldErrors } from '@/features/auth/lib/registrationValidation'
import type { RegistrationDraft } from '@/features/auth/model/registrationDraft'
import { cn } from '@/lib/utils'
import { joinName, splitName } from './registerApplicantMeta'
import type { DraftPatch } from './types'

const employmentTypeOptions: Array<{
  value: 'Fl' | 'Smz' | 'Ip'
  code: string
  label: string
}> = [
  { value: 'Fl', code: 'ФЛ', label: 'Физическое лицо' },
  { value: 'Smz', code: 'СМЗ', label: 'Самозанятый (НПД)' },
  { value: 'Ip', code: 'ИП', label: 'Индивидуальный предприниматель' },
]

type ExecutorBodyProps = {
  draft: RegistrationDraft
  errors: FieldErrors
  patch: DraftPatch
}

export function ExecutorProfileBody({ draft, errors, patch }: ExecutorBodyProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [egripName, setEgripName] = useState('')

  function handleFileChange(file: File | null) {
    if (!file) return
    setEgripName(file.name)
  }

  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label="Юридический статус" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {employmentTypeOptions.map((option) => {
          const isSelected = draft.executorEmploymentType === option.value
          return (
            <div
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => patch({ executorEmploymentType: option.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  patch({ executorEmploymentType: option.value })
                }
              }}
              className={cn(
                'cursor-pointer rounded-lg border p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                isSelected ? 'border-primary bg-secondary' : 'border-border bg-card hover:bg-muted',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-default font-semibold text-foreground">{option.code}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid h-4 w-4 place-items-center rounded-full border',
                    isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card',
                  )}
                >
                  {isSelected ? (
                    <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none">
                      <path
                        d="M3.5 8.5l3 3 6-7"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </div>
              <span className="mt-1 block text-caption-meta text-muted-foreground">{option.label}</span>
            </div>
          )
        })}
      </div>
      {errors.executorEmploymentType ? (
        <p className="m-0 text-caption-meta text-error">{errors.executorEmploymentType}</p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="executor-legal-name" className="block text-caption-meta font-medium text-foreground">
          Название ИП (для договоров и закрывающих актов)
        </label>
        <div className="flex h-10 items-center rounded-md border border-border bg-muted px-3 transition-colors focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/15">
          <input
            id="executor-legal-name"
            type="text"
            placeholder="ИП Ершова А. В."
            value={draft.executorLegalName}
            onChange={(event) => patch({ executorLegalName: event.target.value })}
            className="h-full w-full bg-transparent text-body-default text-foreground outline-none placeholder:text-text-tertiary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="executor-inn" className="block text-caption-meta font-medium text-foreground">
            ИНН предпринимателя (12 цифр)
          </label>
          <div
            className={cn(
              'flex h-10 items-center rounded-md border bg-muted px-3 transition-colors focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/15',
              errors.executorInn ? 'border-error' : 'border-border',
            )}
          >
            <input
              id="executor-inn"
              type="text"
              inputMode="numeric"
              placeholder="772849102934"
              value={draft.executorInn}
              onChange={(event) =>
                patch({ executorInn: event.target.value.replace(/\D/g, '').slice(0, 12) })
              }
              aria-invalid={Boolean(errors.executorInn)}
              aria-describedby={errors.executorInn ? 'executor-inn-error' : undefined}
              className="h-full w-full bg-transparent text-body-default tabular-nums text-foreground outline-none placeholder:text-text-tertiary"
            />
          </div>
          {errors.executorInn ? (
            <p id="executor-inn-error" className="m-0 text-caption-meta text-error">
              {errors.executorInn}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="executor-ogrnip" className="block text-caption-meta font-medium text-foreground">
            ОГРНИП (15 знаков)
          </label>
          <div
            className={cn(
              'flex h-10 items-center rounded-md border bg-muted px-3 transition-colors focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/15',
              errors.executorOgrnip ? 'border-error' : 'border-border',
            )}
          >
            <input
              id="executor-ogrnip"
              type="text"
              inputMode="numeric"
              placeholder="321774600123456"
              value={draft.executorOgrnip}
              onChange={(event) =>
                patch({ executorOgrnip: event.target.value.replace(/\D/g, '').slice(0, 15) })
              }
              aria-invalid={Boolean(errors.executorOgrnip)}
              aria-describedby={errors.executorOgrnip ? 'executor-ogrnip-error' : undefined}
              className="h-full w-full bg-transparent text-body-default tabular-nums text-foreground outline-none placeholder:text-text-tertiary"
            />
          </div>
          {errors.executorOgrnip ? (
            <p id="executor-ogrnip-error" className="m-0 text-caption-meta text-error">
              {errors.executorOgrnip}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-caption-meta font-medium text-foreground">Скан ЕГРИП (Лист записи)</span>
            <span className="text-caption-meta text-muted-foreground">Форматы: PDF, JPG до 15 МБ</span>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded px-2 py-0.5 text-label-micro uppercase',
              egripName
                ? 'bg-success-muted text-success-foreground'
                : 'bg-error-muted text-error-foreground',
            )}
          >
            {egripName ? 'Загружено' : 'Требуется загрузка'}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-caption-meta font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Выбрать файл
          </button>
          <span className="truncate text-caption-meta text-muted-foreground">
            {egripName || 'Файл не выбран'}
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg"
          aria-label="Скан ЕГРИП"
          className="sr-only"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="executor-name" className="block text-caption-meta font-medium text-foreground">
            Имя и Фамилия
          </label>
          <span className="text-caption-meta text-muted-foreground">Как в паспорте</span>
        </div>
        <div
          className={cn(
            'flex h-10 items-center gap-2 rounded-md border bg-muted px-3 transition-colors focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/15',
            errors.firstName || errors.lastName ? 'border-error' : 'border-border',
          )}
        >
          <input
            id="executor-name"
            type="text"
            autoComplete="name"
            placeholder="Введите имя и фамилию"
            value={joinName(draft.firstName, draft.lastName)}
            onChange={(event) => patch(splitName(event.target.value))}
            aria-invalid={Boolean(errors.firstName || errors.lastName)}
            aria-describedby={errors.firstName || errors.lastName ? 'executor-name-error' : undefined}
            className="h-full w-full bg-transparent text-body-default text-foreground outline-none placeholder:text-text-tertiary"
          />
          <UserRound className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        </div>
        {errors.firstName || errors.lastName ? (
          <p id="executor-name-error" className="m-0 text-caption-meta text-error">
            {errors.firstName ?? errors.lastName}
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-muted p-3">
        <div className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-card text-primary">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-body-default font-semibold text-foreground">
              Как формируется ваш рейтинг?
            </p>
            <p className="m-0 mt-1 text-caption-meta text-muted-foreground">
              После регистрации вы заполните проектное резюме. Система автоматически присвоит вам
              стартовый грейд (Junior, Middle или Senior) на основе указанного опыта и портфолио. Вы
              сможете повысить его, закрывая заказы на платформе.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExecutorProfileFootnote() {
  return (
    <p className="m-0 mt-4 flex items-center justify-center gap-2 text-center text-caption-meta text-muted-foreground">
      <FileUp className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      Платформа автоматически формирует чеки через «Мой Налог» и ФНС
    </p>
  )
}
