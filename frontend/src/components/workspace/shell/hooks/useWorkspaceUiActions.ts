import { useCallback } from 'react'
import type { WorkspaceRole, WorkspaceView } from '../../model/data'
import type { OrderCreateFormValues } from '../../model/orderCreateForm'

type BannerVariant = 'default' | 'success' | 'destructive'

type HeaderMenuAction = 'profile' | 'settings' | 'logout'

type UseWorkspaceUiActionsDependencies = {
  customerCompanyName: string
  role: WorkspaceRole
  setActiveView: (view: WorkspaceView) => void
  setBanner: (banner: { message: string; variant: BannerVariant }) => void
  setCreateOrderFormValues: (
    value:
      | OrderCreateFormValues
      | ((previousValues: OrderCreateFormValues) => OrderCreateFormValues),
  ) => void
  setIsCreateApplicantResponsePageOpen: (value: boolean) => void
  setIsCreateCandidatePageOpen: (value: boolean) => void
  setCreateCandidateVacancyId: (value: string | null) => void
  setIsCreateOrderPageOpen: (value: boolean) => void
  onOpenProfile: () => void
  onLogout: () => void
}

export function useWorkspaceUiActions({
  customerCompanyName,
  role,
  setActiveView,
  setBanner,
  setCreateOrderFormValues,
  setIsCreateApplicantResponsePageOpen,
  setIsCreateCandidatePageOpen,
  setCreateCandidateVacancyId,
  setIsCreateOrderPageOpen,
  onOpenProfile,
  onLogout,
}: UseWorkspaceUiActionsDependencies) {
  const handleSendMessage = useCallback(() => {
    setBanner({
      variant: 'destructive',
      message: 'Отправка сообщений недоступна: чат не подключён.',
    })
  }, [setBanner])

  const handleHeaderCreateAction = useCallback(() => {
    if (role === 'Applicant') {
      setIsCreateApplicantResponsePageOpen(false)
      setActiveView('orders')
      return
    }

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
