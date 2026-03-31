import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type ModalProps = {
  children: ReactNode
  description?: string
  footer?: ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
  className?: string
}

export function Modal({
  children,
  className,
  description,
  footer,
  onOpenChange,
  open,
  title,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onOpenChange, open])

  if (!open || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6',
        'preview-fade-in',
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false)
        }
      }}
      role="presentation"
    >
      <section
        aria-describedby={description ? 'modal-description' : undefined}
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl preview-slide-up',
          className,
        )}
        role="dialog"
      >
        <header className="border-b border-slate-200 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          {description ? (
            <p id="modal-description" className="mt-1 text-sm text-slate-600">
              {description}
            </p>
          ) : null}
        </header>
        <div className="px-6 py-5">{children}</div>
        {footer ? <footer className="border-t border-slate-200 px-6 py-4">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  )
}
