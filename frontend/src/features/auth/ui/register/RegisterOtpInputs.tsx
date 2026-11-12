import { useRef } from 'react'
import { cn } from '@/lib/utils'

type RegisterOtpInputsProps = {
  length: number
  value: string[]
  isError: boolean
  onChange: (next: string[]) => void
  onComplete?: (code: string) => void
}

export function RegisterOtpInputs({
  length,
  value,
  isError,
  onChange,
  onComplete,
}: RegisterOtpInputsProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  function focusIndex(index: number) {
    const target = inputRefs.current[index]
    target?.focus()
    target?.select()
  }

  function emit(next: string[]) {
    onChange(next)
    if (
      onComplete &&
      next.length === length &&
      next.every((digit) => digit.length === 1)
    ) {
      onComplete(next.join(''))
    }
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (!digits) {
      const next = [...value]
      next[index] = ''
      emit(next)
      return
    }

    if (digits.length > 1) {
      const next = [...value]
      for (let offset = 0; offset < digits.length && index + offset < length; offset += 1) {
        next[index + offset] = digits[offset]
      }
      emit(next)
      const lastIndex = Math.min(index + digits.length, length) - 1
      focusIndex(lastIndex)
      return
    }

    const next = [...value]
    next[index] = digits
    emit(next)
    if (index < length - 1) {
      focusIndex(index + 1)
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      event.preventDefault()
      const next = [...value]
      next[index - 1] = ''
      emit(next)
      focusIndex(index - 1)
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusIndex(index - 1)
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault()
      focusIndex(index + 1)
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    event.preventDefault()
    const next = Array.from({ length }, (_, index) => pasted[index] ?? '')
    emit(next)
    const lastFilled = Math.min(pasted.length, length) - 1
    focusIndex(Math.max(0, lastFilled))
  }

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] ?? ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          aria-label={`Цифра ${index + 1}`}
          aria-invalid={isError}
          className={cn(
            'h-14 w-12 rounded-lg border text-center text-display-page-title font-semibold tabular-nums outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20',
            isError
              ? 'border-error bg-error-muted text-error-foreground'
              : 'border-border bg-card text-foreground',
          )}
        />
      ))}
    </div>
  )
}
