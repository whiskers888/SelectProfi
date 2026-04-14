import { createContext } from 'react'

export type NotificationVariant = 'default' | 'success' | 'destructive'

export type NotificationPayload = {
  message: string
  variant?: NotificationVariant
}

export type NotificationsContextValue = {
  notify: (payload: NotificationPayload) => void
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null)
