import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const PHONE_DIGITS = 10

export function formatRuPhoneDigits(rawDigits: string): string {
  const digits = rawDigits.replace(/\D/g, '').slice(0, PHONE_DIGITS)
  if (!digits) return ''

  const parts: string[] = []
  if (digits.length > 0) parts.push(`(${digits.slice(0, 3)}`)
  if (digits.length >= 3) parts[0] = `(${digits.slice(0, 3)})`
  if (digits.length > 3) parts.push(` ${digits.slice(3, 6)}`)
  if (digits.length > 6) parts.push(`-${digits.slice(6, 8)}`)
  if (digits.length > 8) parts.push(`-${digits.slice(8, 10)}`)

  return parts.join('').trim()
}

export function normalizeRuPhoneForApi(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`
  if (digits.length === 11 && digits.startsWith('7')) return `+${digits}`
  if (digits.length === 10) return `+7${digits}`
  return `+${digits}`
}

export function isCompleteRuPhone(rawValue: string): boolean {
  return rawValue.replace(/\D/g, '').length === PHONE_DIGITS
}

export function maskPhoneForDisplay(masked: string): string {
  return masked
}

type PhoneFieldProps = {
  id: string
  label: string
  value: string
  error?: string
  hint?: string
  disabled?: boolean
  onChange: (digits: string) => void
  className?: string
}

export function PhoneField({
  id,
  label,
  value,
  error,
  hint,
  disabled = false,
  onChange,
  className,
}: PhoneFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-caption-meta font-medium text-foreground">
        {label} <span className="text-error">*</span>
      </label>
      <div
        className={cn(
          'flex h-10 items-stretch overflow-hidden rounded-md border bg-card transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
          error ? 'border-error' : 'border-border',
        )}
      >
        <span className="flex items-center gap-1 border-r border-border bg-muted px-2.5 text-body-default">
          <span aria-hidden="true">🇷🇺</span>
          <span className="font-medium">+7</span>
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          value={formatRuPhoneDigits(value)}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, PHONE_DIGITS))}
          placeholder="(926) 492-38-10"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="h-full w-full bg-transparent px-3 text-body-default text-foreground outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="m-0 text-caption-meta text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="m-0 text-caption-meta text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

type PasswordFieldProps = {
  id: string
  label: string
  value: string
  error?: string
  hint?: string
  disabled?: boolean
  autoComplete?: string
  onChange: (value: string) => void
  trailing?: React.ReactNode
  className?: string
}

export function PasswordField({
  id,
  label,
  value,
  error,
  hint,
  disabled = false,
  autoComplete = 'current-password',
  onChange,
  trailing,
  className,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="block text-caption-meta font-medium text-foreground">
          {label} <span className="text-error">*</span>
        </label>
        {trailing}
      </div>
      <div
        className={cn(
          'relative flex h-10 items-center rounded-md border bg-card transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
          error ? 'border-error' : 'border-border',
        )}
      >
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="h-full w-full rounded-md bg-transparent pl-3 pr-10 text-body-default text-foreground outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setIsVisible((previous) => !previous)}
          disabled={disabled}
          aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
          className="absolute right-2 grid h-7 w-7 place-items-center rounded text-text-tertiary transition-colors hover:text-foreground disabled:opacity-50"
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="m-0 text-caption-meta text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="m-0 text-caption-meta text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

type CheckboxFieldProps = {
  id: string
  checked: boolean
  label: React.ReactNode
  description?: string
  error?: string
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function CheckboxField({
  id,
  checked,
  label,
  description,
  error,
  disabled = false,
  onChange,
}: CheckboxFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 select-none">
        <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={cn(
              'grid h-4 w-4 place-items-center rounded-sm border transition-colors',
              checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card',
              error && !checked && 'border-error',
            )}
          >
            {checked ? (
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </span>
        </span>
        <span className="min-w-0">
          <span className="block text-caption-meta text-foreground">{label}</span>
          {description ? (
            <span className="mt-0.5 block text-label-micro font-normal normal-case tracking-normal text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error ? <p className="m-0 pl-6 text-caption-meta text-error">{error}</p> : null}
    </div>
  )
}
