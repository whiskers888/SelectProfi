import type { KeyboardEvent } from 'react'
import { Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LoginMethod } from './loginTypes'

type LoginIdentifierTabsProps = {
  method: LoginMethod
  onChange: (method: LoginMethod) => void
}

const tabs: Array<{ method: LoginMethod; label: string; icon: typeof Mail }> = [
  { method: 'email', label: 'По email', icon: Mail },
  { method: 'phone', label: 'По телефону', icon: Phone },
]

function resolveNextMethod(current: LoginMethod, key: string): LoginMethod {
  if (key === 'Home') return 'email'
  if (key === 'End') return 'phone'
  return current === 'email' ? 'phone' : 'email'
}

export function LoginIdentifierTabs({ method, onChange }: LoginIdentifierTabsProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      return
    }

    event.preventDefault()
    const nextMethod = resolveNextMethod(method, event.key)
    onChange(nextMethod)
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-method="${nextMethod}"]`)?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Способ входа"
      onKeyDown={handleKeyDown}
      className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = method === tab.method

        return (
          <button
            key={tab.method}
            type="button"
            role="tab"
            id={`login-tab-${tab.method}`}
            data-method={tab.method}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            aria-controls="login-form-panel"
            onClick={() => onChange(tab.method)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-caption-meta transition-colors',
              isActive
                ? 'bg-card font-medium text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
