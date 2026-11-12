import { ArrowRight, Clock, Loader2, RefreshCw, ShieldCheck } from 'lucide-react'
import { AuthAlert } from '@/components/auth'
import { cn } from '@/lib/utils'
import { RegisterOtpInputs } from './RegisterOtpInputs'
import { formatCountdown, useResendCountdown } from './useResendCountdown'
import type { VerificationChallenge } from './types'

type RegisterCodeStepProps = {
  challenge: VerificationChallenge | null
  code: string[]
  error: string | null
  isConfirming: boolean
  isResending: boolean
  isLocked: boolean
  onCodeChange: (next: string[]) => void
  onConfirm: () => void
  onConfirmCode: (code: string) => void
  onResend: () => void
  onEditTarget: () => void
}

export function RegisterCodeStep({
  challenge,
  code,
  error,
  isConfirming,
  isResending,
  isLocked,
  onCodeChange,
  onConfirm,
  onConfirmCode,
  onResend,
  onEditTarget,
}: RegisterCodeStepProps) {
  const isPhone = challenge?.channel !== 'Email'
  const codeLength = challenge?.codeLength ?? 6
  const resendSeconds = useResendCountdown(challenge?.resendAvailableAtUtc ?? null)
  const canResend = (resendSeconds <= 0 || isLocked) && !isResending
  const isComplete = code.length === codeLength && code.every((digit) => digit.length === 1)

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={onEditTarget}
        className="mb-4 inline-flex items-center gap-1 self-start text-caption-meta text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Назад
      </button>

      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-secondary text-primary">
        <ShieldCheck className="h-6 w-6" aria-hidden="true" />
      </div>

      <h1 className="m-0 mt-3 text-display-page-title text-foreground">
        Подтверждение {isPhone ? 'номера' : 'почты'}
      </h1>
      <p className="m-0 mt-2 text-body-default text-muted-foreground">
        Код подтверждения отправлен {isPhone ? 'в SMS на номер' : 'на email'}
      </p>
      <p className="m-0 mt-1 flex flex-wrap items-center justify-center gap-2">
        <span className="text-headline-section tabular-nums text-foreground">
          {challenge?.maskedTarget ?? ''}
        </span>
        <button
          type="button"
          onClick={onEditTarget}
          className="text-caption-meta font-medium text-primary hover:underline"
        >
          Изменить
        </button>
      </p>

      <div className="mt-5">
        <RegisterOtpInputs
          length={codeLength}
          value={code}
          isError={Boolean(error)}
          onChange={onCodeChange}
          onComplete={onConfirmCode}
        />
        <p className="m-0 mt-2 text-caption-meta text-muted-foreground">
          {challenge?.developmentMode
            ? 'Демо-режим: введите код 123456'
            : `Введите ${codeLength} цифр из полученного сообщения`}
        </p>
        {challenge?.developmentMode ? (
          <div className="mt-3 text-left">
            <AuthAlert
              tone="warning"
              title="Демо-режим (development)"
              description="Отправка SMS и писем отключена. Используйте единый код 123456 — он принимается всегда."
            />
          </div>
        ) : challenge?.debugCode ? (
          <p className="m-0 mt-1 text-caption-meta text-text-tertiary">
            Тестовый код: <span className="tabular-nums font-medium">{challenge.debugCode}</span>
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="mt-3">
          <AuthAlert tone="error" title={error} />
        </div>
      ) : null}

      <div className="mt-4">
        {canResend ? (
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-secondary py-2 text-caption-meta font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-60"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Отправить код повторно
          </button>
        ) : (
          <div className="flex items-center justify-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-caption-meta text-secondary-foreground">
            <Clock className="h-3.5 w-3.5 text-text-tertiary" aria-hidden="true" />
            <span>
              Отправить код повторно через{' '}
              <span className="tabular-nums font-semibold">
                {formatCountdown(resendSeconds)}
              </span>
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={isConfirming || !isComplete || isLocked}
        className={cn(
          'mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-body-default font-semibold text-primary-foreground transition-colors hover:bg-primary/90',
          (isConfirming || !isComplete || isLocked) && 'cursor-not-allowed opacity-60',
        )}
      >
        {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        Подтвердить
        {!isConfirming ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
      </button>

      <button
        type="button"
        onClick={onEditTarget}
        className="mt-5 inline-flex items-center gap-1 text-caption-meta text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Изменить {isPhone ? 'номер телефона' : 'email'}
      </button>
    </div>
  )
}
