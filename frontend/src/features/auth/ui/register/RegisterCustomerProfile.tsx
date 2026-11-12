import { useRef, useState } from 'react'
import { BadgeCheck, Check, FileText, ImageUp, Upload, UserRound, X } from 'lucide-react'
import type { FieldErrors } from '@/features/auth/lib/registrationValidation'
import type { RegistrationDraft } from '@/features/auth/model/registrationDraft'
import { cn } from '@/lib/utils'
import { joinName, splitName } from './registerApplicantMeta'
import type { DraftPatch } from './types'

const demoInn = '7704123456'
const demoCompanyName = 'ООО «Альфа Логистик»'
const demoEgrn = '1157746129840'
const demoKpp = '770401001'

type CustomerBodyProps = {
  draft: RegistrationDraft
  errors: FieldErrors
  patch: DraftPatch
}

export function CustomerProfileBody({ draft, errors, patch }: CustomerBodyProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const [documentName, setDocumentName] = useState('')
  const [documentSize, setDocumentSize] = useState('')
  const [kpp, setKpp] = useState('')
  const [logoName, setLogoName] = useState('')
  const isIp = draft.customerLegalForm === 'Ip'

  function handleAutofill() {
    patch({
      customerInn: demoInn,
      customerCompanyName: demoCompanyName,
      customerEgrn: demoEgrn,
      customerLegalForm: 'Ooo',
    })
    setKpp(demoKpp)
  }

  function handleFileChange(file: File | null) {
    if (!file) return
    setDocumentName(file.name)
    setDocumentSize(formatFileSize(file.size))
    patch({ customerEgrn: demoEgrn })
  }

  function handleRemoveFile() {
    setDocumentName('')
    setDocumentSize('')
    patch({ customerEgrn: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleRemoveLogo() {
    setLogoName('')
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="customer-name" className="block text-caption-meta font-medium text-foreground">
            Имя и Фамилия <span className="text-error">*</span>
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
            id="customer-name"
            type="text"
            autoComplete="name"
            placeholder="Введите имя и фамилию"
            value={joinName(draft.firstName, draft.lastName)}
            onChange={(event) => patch(splitName(event.target.value))}
            aria-invalid={Boolean(errors.firstName || errors.lastName)}
            aria-describedby={
              errors.firstName || errors.lastName ? 'customer-name-error' : undefined
            }
            className="h-full w-full bg-transparent text-body-default text-foreground outline-none placeholder:text-text-tertiary"
          />
          <UserRound className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        </div>
        {errors.firstName || errors.lastName ? (
          <p id="customer-name-error" className="m-0 text-caption-meta text-error">
            {errors.firstName ?? errors.lastName}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <span className="block text-caption-meta font-medium text-muted-foreground">
          Организационно-правовая форма
        </span>
        <div className="grid grid-cols-1 gap-1 rounded-lg bg-muted p-1 sm:grid-cols-2">
          <LegalFormButton
            active={!isIp}
            label="ООО / Юрлицо"
            onClick={() => patch({ customerLegalForm: 'Ooo' })}
          />
          <LegalFormButton
            active={isIp}
            label="Индивидуальный предприниматель (ИП)"
            onClick={() => patch({ customerLegalForm: 'Ip' })}
          />
        </div>
        {errors.customerLegalForm ? (
          <p className="m-0 text-caption-meta text-error">{errors.customerLegalForm}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="customer-inn" className="block text-caption-meta font-medium text-foreground">
            ИНН компании <span className="text-error">*</span>
          </label>
          <span className="text-caption-meta text-muted-foreground">
            {isIp ? '12 цифр' : '10 или 12 цифр'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-10 flex-1 items-center gap-2 rounded-md border bg-muted px-3 transition-colors focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/15',
              errors.customerInn ? 'border-error' : 'border-border',
            )}
          >
            <input
              id="customer-inn"
              type="text"
              inputMode="numeric"
              placeholder="7704123456"
              value={draft.customerInn}
              onChange={(event) =>
                patch({ customerInn: event.target.value.replace(/\D/g, '').slice(0, 12) })
              }
              aria-invalid={Boolean(errors.customerInn)}
              aria-describedby={errors.customerInn ? 'customer-inn-error' : undefined}
              className="h-full w-full bg-transparent text-body-default font-medium tabular-nums text-foreground outline-none placeholder:text-text-tertiary"
            />
            {draft.customerInn ? (
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-md bg-primary px-3 text-caption-meta font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Автозаполнение
          </button>
        </div>
        {errors.customerInn ? (
          <p id="customer-inn-error" className="m-0 text-caption-meta text-error">
            {errors.customerInn}
          </p>
        ) : null}
      </div>

      {draft.customerCompanyName ? (
        <div className="rounded-lg bg-muted p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-caption-meta font-medium text-muted-foreground">
              Название компании (из ЕГРЮЛ)
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-success-muted px-2 py-0.5 text-label-micro uppercase text-success-foreground">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              Проверено в ФНС
            </span>
          </div>
          <p className="m-0 mt-1 text-headline-section text-foreground">{draft.customerCompanyName}</p>
          <p className="m-0 mt-0.5 flex flex-wrap gap-x-2 text-caption-meta text-muted-foreground">
            <span className="tabular-nums">ОГРН: {demoEgrn}</span>
            {kpp ? <span aria-hidden="true">•</span> : null}
            {kpp ? <span className="tabular-nums">КПП: {kpp}</span> : null}
          </p>
        </div>
      ) : null}

      {isIp ? (
        <div className="space-y-1.5">
          <label htmlFor="customer-egrnip" className="block text-caption-meta font-medium text-foreground">
            ОГРНИП <span className="text-error">*</span>
          </label>
          <div
            className={cn(
              'flex h-10 items-center rounded-md border bg-muted px-3 transition-colors focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/15',
              errors.customerEgrnip ? 'border-error' : 'border-border',
            )}
          >
            <input
              id="customer-egrnip"
              type="text"
              inputMode="numeric"
              placeholder="317774600123456"
              value={draft.customerEgrnip}
              onChange={(event) =>
                patch({ customerEgrnip: event.target.value.replace(/\D/g, '').slice(0, 15) })
              }
              aria-invalid={Boolean(errors.customerEgrnip)}
              aria-describedby={errors.customerEgrnip ? 'customer-egrnip-error' : undefined}
              className="h-full w-full bg-transparent text-body-default tabular-nums text-foreground outline-none placeholder:text-text-tertiary"
            />
          </div>
          {errors.customerEgrnip ? (
            <p id="customer-egrnip-error" className="m-0 text-caption-meta text-error">
              {errors.customerEgrnip}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-caption-meta font-medium text-foreground">
              Уставной документ <span className="text-error">*</span>
            </span>
            <span className="text-caption-meta text-muted-foreground">
              {isIp ? 'Скан ЕГРНИП · PDF, JPG до 15 МБ' : 'Скан ЕГРЮЛ · PDF, JPG до 15 МБ'}
            </span>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-label-micro uppercase',
              documentName
                ? 'bg-success-muted text-success-foreground'
                : 'bg-error-muted text-error-foreground',
            )}
          >
            {documentName ? 'Загружено' : 'Требуется загрузка'}
          </span>
        </div>
        <div className="rounded-lg border border-dashed border-border bg-muted p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-caption-meta font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              Выбрать файл
            </button>
            {documentName ? (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-card px-2 py-1 text-caption-meta text-foreground">
                <FileText className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate">{documentName}</span>
                {documentSize ? (
                  <span className="shrink-0 text-caption-meta text-muted-foreground">{documentSize}</span>
                ) : null}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  aria-label="Удалить файл"
                  className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-error"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            ) : (
              <span className="truncate text-caption-meta text-muted-foreground">Файл не выбран</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg"
            aria-label="Уставной документ"
            className="sr-only"
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          />
        </div>
        {errors.customerEgrn ? (
          <p className="m-0 text-caption-meta text-error">{errors.customerEgrn}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-secondary text-primary">
            <ImageUp className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-caption-meta font-medium text-foreground">Логотип компании</span>
            <span className="truncate text-caption-meta text-muted-foreground">
              {logoName || 'Отобразится в карточках ваших вакансий и в кабинете соискателя'}
            </span>
          </div>
        </div>
        {logoName ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-success-muted px-2 py-0.5 text-label-micro uppercase text-success-foreground">
            Загружено
          </span>
        ) : null}
        {logoName ? (
          <button
            type="button"
            onClick={handleRemoveLogo}
            aria-label="Удалить логотип"
            className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-error"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => logoInputRef.current?.click()}
          className="shrink-0 text-caption-meta font-medium text-primary hover:underline"
        >
          {logoName ? 'Заменить файл' : 'Выбрать файл'}
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          aria-label="Логотип компании"
          className="sr-only"
          onChange={(event) => setLogoName(event.target.files?.[0]?.name ?? '')}
        />
      </div>
    </div>
  )
}

export function CustomerProfileFootnote() {
  return (
    <p className="m-0 mt-4 flex items-center justify-center gap-2 text-center text-caption-meta text-muted-foreground">
      <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      Эскроу-счёт и закрывающие акты формируются автоматически
    </p>
  )
}

function LegalFormButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-body-default transition-colors',
        active
          ? 'bg-card font-medium text-primary shadow-surface'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {active ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
      {label}
    </button>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return ''
  const megabytes = bytes / (1024 * 1024)
  if (megabytes >= 1) return `${megabytes.toFixed(1)} МБ`
  return `${Math.max(1, Math.round(bytes / 1024))} КБ`
}
