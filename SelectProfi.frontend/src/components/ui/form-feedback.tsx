import { cn } from '@/lib/utils'
import { Alert } from '@/components/ui/alert'

type FormStatus = 'success' | 'error' | 'info'

type FormFieldErrorProps = {
  children?: string
  className?: string
  id?: string
}

type FormStatusMessageProps = {
  className?: string
  message: string
  status: FormStatus
}

export function FormFieldError({ children, className, id }: FormFieldErrorProps) {
  if (!children) {
    return null
  }

  return (
    <p id={id} role="alert" className={cn('text-xs text-error', className)}>
      {children}
    </p>
  )
}

export function FormStatusMessage({ className, message, status }: FormStatusMessageProps) {
  if (!message) {
    return null
  }

  if (status === 'error') {
    return (
      <Alert role="alert" variant="destructive" className={className}>
        {message}
      </Alert>
    )
  }

  if (status === 'success') {
    return (
      <Alert role="status" variant="success" className={className}>
        {message}
      </Alert>
    )
  }

  return (
    <Alert role="status" className={className}>
      {message}
    </Alert>
  )
}

