import { useCallback } from 'react'
import type { WorkspaceChatThread, WorkspaceRole, WorkspaceView } from '../../model/data'

type BannerVariant = 'default' | 'success' | 'destructive'

type HeaderMenuAction = 'profile' | 'settings' | 'logout'

type UseWorkspaceUiActionsDependencies = {
  activeThread: WorkspaceChatThread | null
  chatDraft: string
  role: WorkspaceRole
  setActiveView: (view: WorkspaceView) => void
  setBanner: (banner: { message: string; variant: BannerVariant }) => void
  setChatDraft: (value: string) => void
  setDetailsInUrl: (
    values: { orderId?: string | null; candidateId?: string | null },
    replace?: boolean,
  ) => void
  setIsCreateApplicantResponsePageOpen: (value: boolean) => void
  setIsCreateCandidatePageOpen: (value: boolean) => void
  setIsCreateOrderPageOpen: (value: boolean) => void
  setThreadsByRole: (
    value:
      | Record<WorkspaceRole, WorkspaceChatThread[]>
      | ((
          previousThreadsByRole: Record<WorkspaceRole, WorkspaceChatThread[]>,
        ) => Record<WorkspaceRole, WorkspaceChatThread[]>),
  ) => void
  todayTimeLabel: () => string
  onLogout: () => void
}

export function useWorkspaceUiActions({
  activeThread,
  chatDraft,
  role,
  setActiveView,
  setBanner,
  setChatDraft,
  setDetailsInUrl,
  setIsCreateApplicantResponsePageOpen,
  setIsCreateCandidatePageOpen,
  setIsCreateOrderPageOpen,
  setThreadsByRole,
  todayTimeLabel,
  onLogout,
}: UseWorkspaceUiActionsDependencies) {
  const handleSendMessage = useCallback(() => {
    if (!activeThread) {
      setBanner({
        variant: 'destructive',
        message: 'Откройте чат, чтобы отправить сообщение.',
      })
      return
    }

    const messageText = chatDraft.trim()
    if (!messageText) {
      setBanner({
        variant: 'destructive',
        message: 'Введите текст сообщения.',
      })
      return
    }

    setThreadsByRole((previousThreadsByRole) => ({
      ...previousThreadsByRole,
      [role]: previousThreadsByRole[role].map((thread) =>
        thread.id !== activeThread.id
          ? thread
          : {
              ...thread,
              preview: messageText,
              unread: 0,
              messages: [
                ...thread.messages,
                {
                  id: `msg-${Date.now()}`,
                  author: 'me',
                  text: messageText,
                  time: todayTimeLabel(),
                },
              ],
            },
      ),
    }))

    setChatDraft('')
    setBanner({
      variant: 'success',
      message: 'Сообщение отправлено.',
    })
  }, [activeThread, chatDraft, role, setBanner, setChatDraft, setThreadsByRole, todayTimeLabel])

  const handleHeaderCreateAction = useCallback(() => {
    setDetailsInUrl({ orderId: null, candidateId: null }, true)

    if (role === 'Customer') {
      setIsCreateOrderPageOpen(true)
      setIsCreateCandidatePageOpen(false)
      setIsCreateApplicantResponsePageOpen(false)
      return
    }

    if (role === 'Executor') {
      setIsCreateCandidatePageOpen(true)
      setIsCreateOrderPageOpen(false)
      setIsCreateApplicantResponsePageOpen(false)
      setActiveView('candidates')
      return
    }

    setIsCreateApplicantResponsePageOpen(true)
    setIsCreateOrderPageOpen(false)
    setIsCreateCandidatePageOpen(false)
    setActiveView('dashboard')
  }, [
    role,
    setActiveView,
    setDetailsInUrl,
    setIsCreateApplicantResponsePageOpen,
    setIsCreateCandidatePageOpen,
    setIsCreateOrderPageOpen,
  ])

  const handleHeaderMenuAction = useCallback(
    (action: HeaderMenuAction) => {
      if (action === 'logout') {
        onLogout()
        return
      }

      setBanner({
        variant: 'default',
        message:
          action === 'profile'
            ? 'Профиль откроется в следующей итерации.'
            : action === 'settings'
              ? 'Настройки аккаунта скоро будут доступны.'
              : 'Действие недоступно.',
      })
    },
    [onLogout, setBanner],
  )

  return {
    handleHeaderCreateAction,
    handleHeaderMenuAction,
    handleSendMessage,
  }
}
