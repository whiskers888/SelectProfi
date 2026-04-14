import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  NotificationsContext,
  type NotificationPayload,
  type NotificationVariant,
  type NotificationsContextValue,
} from '@/components/ui/notificationsContext'

type NotificationItem = {
  id: string
  message: string
  variant: NotificationVariant
}

function createNotificationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([])

  const removeNotification = useCallback((id: string) => {
    setItems((previousItems) => previousItems.filter((item) => item.id !== id))
  }, [])

  const notify = useCallback(
    ({ message, variant = 'default' }: NotificationPayload) => {
      const normalizedMessage = message.trim()
      if (!normalizedMessage) {
        return
      }

      const id = createNotificationId()
      setItems((previousItems) => [{ id, message: normalizedMessage, variant }, ...previousItems])
      window.setTimeout(() => {
        removeNotification(id)
      }, 3000)
    },
    [removeNotification],
  )

  const contextValue = useMemo<NotificationsContextValue>(
    () => ({
      notify,
    }),
    [notify],
  )

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
      <section
        aria-atomic="false"
        aria-live="polite"
        className="notifications-viewport"
      >
        {items.map((item) => (
          <article
            key={item.id}
            className={`notification-toast notification-toast-${item.variant}`}
            role={item.variant === 'destructive' ? 'alert' : 'status'}
          >
            {item.message}
          </article>
        ))}
      </section>
    </NotificationsContext.Provider>
  )
}
