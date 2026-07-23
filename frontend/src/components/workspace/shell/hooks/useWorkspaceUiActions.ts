import { useCallback } from 'react'
import type { WorkspaceChatThread, WorkspaceRole, WorkspaceView } from '../../model/data'
import type { OrderCreateFormValues } from '../../model/orderCreateForm'

type BannerVariant = 'default' | 'success' | 'destructive'

type HeaderMenuAction = 'profile' | 'settings' | 'logout'

type UseWorkspaceUiActionsDependencies = {
  activeThread: WorkspaceChatThread | null
  chatDraft: string
  customerCompanyName: string
  role: WorkspaceRole
  setActiveView: (view: WorkspaceView) => void
  setBanner: (banner: { message: string; variant: BannerVariant }) => void
  setChatDraft: (value: string) => void
  setCreateOrderFormValues: (
    value:
      | OrderCreateFormValues
      | ((previousValues: OrderCreateFormValues) => OrderCreateFormValues),
  ) => void
  setIsCreateApplicantResponsePageOpen: (value: boolean) => void
  setIsCreateCandidatePageOpen: (value: boolean) => void
  setCreateCandidateVacancyId: (value: string | null) => void
  setIsCreateOrderPageOpen: (value: boolean) => void
  setThreadsByRole: (
    value:
      | Record<WorkspaceRole, WorkspaceChatThread[]>
      | ((
          previousThreadsByRole: Record<WorkspaceRole, WorkspaceChatThread[]>,
        ) => Record<WorkspaceRole, WorkspaceChatThread[]>),
  ) => void
  todayTimeLabel: () => string
  onOpenProfile: () => void
  onLogout: () => void
}

export function useWorkspaceUiActions({
  activeThread,
  chatDraft,
  customerCompanyName,
  role,
  setActiveView,
  setBanner,
  setChatDraft,
  setCreateOrderFormValues,
  setIsCreateApplicantResponsePageOpen,
  setIsCreateCandidatePageOpen,
  setCreateCandidateVacancyId,
  setIsCreateOrderPageOpen,
  setThreadsByRole,
  todayTimeLabel,
  onOpenProfile,
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
    setActiveView('dashboard')

    if (role === 'Customer') {
      setCreateOrderFormValues((previousValues) => {
        if (previousValues.organization.trim() || !customerCompanyName.trim()) {
          return previousValues
        }

        return {
          ...previousValues,
          organization: customerCompanyName,
        }
      })
      setIsCreateOrderPageOpen(true)
      return
    }

    if (role === 'Executor') {
      setCreateCandidateVacancyId(null)
      setIsCreateCandidatePageOpen(true)
      setActiveView('candidates')
      return
    }

    setIsCreateApplicantResponsePageOpen(true)
    setActiveView('dashboard')
  }, [
    role,
    customerCompanyName,
    setActiveView,
    setIsCreateApplicantResponsePageOpen,
    setIsCreateCandidatePageOpen,
    setCreateCandidateVacancyId,
    setIsCreateOrderPageOpen,
    setCreateOrderFormValues,
  ])

  const handleHeaderMenuAction = useCallback(
    (action: HeaderMenuAction) => {
      if (action === 'profile') {
        onOpenProfile()
        return
      }

      if (action === 'logout') {
        onLogout()
        return
      }

      setBanner({
        variant: 'default',
        message:
          action === 'settings'
            ? 'Настройки аккаунта скоро будут доступны.'
            : 'Действие недоступно.',
      })
    },
    [onLogout, onOpenProfile, setBanner],
  )

  return {
    handleHeaderCreateAction,
    handleHeaderMenuAction,
    handleSendMessage,
  }
}
