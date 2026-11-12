import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AuthCardProps = {
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <section
      className={cn(
        'w-full rounded-lg border border-border bg-card p-5 text-foreground shadow-surface sm:p-8',
        className,
      )}
    >
      {children}
    </section>
  )
}

type AuthStep = {
  key: string
  label: string
}

type AuthStepperProps = {
  steps: AuthStep[]
  currentStep: number
  caption: string
}

export function AuthStepper({ steps, currentStep, caption }: AuthStepperProps) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-label-micro uppercase text-primary">{caption}</span>
        <span className="text-caption-meta text-muted-foreground">
          {currentStep + 1} из {steps.length}
        </span>
      </div>
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isActive = isCompleted || isCurrent

          return (
            <li key={step.key} className="flex flex-1 flex-col items-center">
              <div className="relative flex w-full items-center justify-center">
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute right-1/2 top-3.5 left-0 h-0.5',
                      isCompleted || isCurrent ? 'bg-primary' : 'bg-border',
                    )}
                  />
                ) : null}
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute left-1/2 top-3.5 right-0 h-0.5',
                      isCompleted ? 'bg-primary' : 'bg-border',
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    'relative z-10 grid h-7 w-7 place-items-center rounded-full text-[13px] font-semibold',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-text-tertiary',
                    isCurrent && 'ring-4 ring-primary/20',
                  )}
                >
                  {isCompleted ? (
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                      <path
                        d="M3.5 8.5l3 3 6-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
              </div>
              <span
                className={cn(
                  'mt-1.5 text-caption-meta',
                  isActive ? 'font-semibold text-primary' : 'text-text-tertiary',
                )}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
      <div className="mt-3 border-b border-border" />
    </div>
  )
}
