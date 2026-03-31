import { type ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type DropdownItem = {
  id: string
  label: string
  tone?: 'default' | 'destructive'
  disabled?: boolean
}

type DropdownProps = {
  items: DropdownItem[]
  onSelect: (id: string) => void
  trigger: ReactNode
  className?: string
  contentClassName?: string
  align?: 'left' | 'right'
}

export function Dropdown({
  align = 'right',
  className,
  contentClassName,
  items,
  onSelect,
  trigger,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current || rootRef.current.contains(event.target as Node)) {
        return
      }

      setOpen(false)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-full"
        onClick={() => setOpen((isOpen) => !isOpen)}
        type="button"
      >
        {trigger}
      </button>

      <div
        className={cn(
          'absolute top-[calc(100%+0.5rem)] z-30 min-w-[12rem] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all',
          'origin-top scale-95 opacity-0 pointer-events-none',
          align === 'right' ? 'right-0' : 'left-0',
          open && 'scale-100 opacity-100 pointer-events-auto',
          contentClassName,
        )}
        role="menu"
      >
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              'block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
              item.tone === 'destructive'
                ? 'text-red-600 hover:bg-red-50 disabled:text-red-300'
                : 'text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
            )}
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) {
                return
              }
              onSelect(item.id)
              setOpen(false)
            }}
            role="menuitem"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
