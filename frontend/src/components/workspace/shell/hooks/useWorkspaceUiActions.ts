import { useCallback } from 'react'
import type { WorkspaceChatThread, WorkspaceRole, WorkspaceView } from '../../model/data'

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
      | {
          title: string
          organization: string
          specialization: string
          specializationId: string
          price: string
          note: string
          requestedCandidatesCount: string
        }
      | ((previousValues: {
          title: string
          organization: string
          specialization: string
          specializationId: string
          price: string
          note: string
          requestedCandidatesCount: string
        }) => {
          title: string
          organization: string
          specialization: string
          specializationId: string
          price: string
          note: string
          requestedCandidatesCount: string
        }),
  ) => void
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
  onOpenWorkspace: () => void
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
  setDetailsInUrl,
  setIsCreateApplicantResponsePageOpen,
  setIsCreateCandidatePageOpen,
  setIsCreateOrderPageOpen,
  setThreadsByRole,
  todayTimeLabel,
  onOpenWorkspace,
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
    onOpenWorkspace()
    setDetailsInUrl({ orderId: null, candidateId: null }, true)
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
    customerCompanyName,
    onOpenWorkspace,
    setActiveView,
    setDetailsInUrl,
    setIsCreateApplicantResponsePageOpen,
    setIsCreateCandidatePageOpen,
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
