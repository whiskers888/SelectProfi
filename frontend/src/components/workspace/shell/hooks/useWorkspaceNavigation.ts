import { useCallback } from 'react'
import type { Location, NavigateFunction } from 'react-router-dom'
import type { WorkspaceCandidate, WorkspaceOrder, WorkspaceRole, WorkspaceView } from '../../model/data'

type UseWorkspaceNavigationDependencies = {
  location: Location
  navigate: NavigateFunction
  role: WorkspaceRole
  setActiveView: (view: WorkspaceView) => void
  setIsCreateApplicantResponsePageOpen: (value: boolean) => void
  setIsCreateCandidatePageOpen: (value: boolean) => void
  setIsCreateOrderPageOpen: (value: boolean) => void
  setPreferredOrderId: (value: string | null) => void
  startViewTransition: () => void
}

export function useWorkspaceNavigation({
  location,
  navigate,
  role,
  setActiveView,
  setIsCreateApplicantResponsePageOpen,
  setIsCreateCandidatePageOpen,
  setIsCreateOrderPageOpen,
  setPreferredOrderId,
  startViewTransition,
}: UseWorkspaceNavigationDependencies) {
  const setDetailsInUrl = useCallback(
    (
      values: { orderId?: string | null; candidateId?: string | null },
      replace = false,
    ) => {
      const searchParams = new URLSearchParams(location.search)

      if (values.orderId !== undefined) {
        if (values.orderId) {
          searchParams.set('orderId', values.orderId)
        } else {
          searchParams.delete('orderId')
        }
      }

      if (values.candidateId !== undefined) {
        if (values.candidateId) {
          searchParams.set('candidateId', values.candidateId)
        } else {
          searchParams.delete('candidateId')
        }
      }

      const nextSearch = searchParams.toString()
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : '',
        },
        { replace },
      )
    },
    [location.pathname, location.search, navigate],
  )

  const handleViewChange = useCallback(
    (nextView: WorkspaceView) => {
      if (role === 'Customer' && (nextView === 'orders' || nextView === 'candidates')) {
        setActiveView('dashboard')
      } else {
        setActiveView(nextView)
      }
      setIsCreateOrderPageOpen(false)
      setIsCreateCandidatePageOpen(false)
      setIsCreateApplicantResponsePageOpen(false)
      setDetailsInUrl({ orderId: null, candidateId: null }, true)
      startViewTransition()
    },
    [
      role,
      setActiveView,
      setDetailsInUrl,
      setIsCreateApplicantResponsePageOpen,
      setIsCreateCandidatePageOpen,
      setIsCreateOrderPageOpen,
      startViewTransition,
    ],
  )

  const handleOpenOrderDetails = useCallback(
    (order: WorkspaceOrder) => {
      setDetailsInUrl({ orderId: order.id, candidateId: null })
      setPreferredOrderId(order.id)
    },
    [setDetailsInUrl, setPreferredOrderId],
  )

  const handleOpenCandidateDetails = useCallback(
    (candidate: WorkspaceCandidate) => {
      setDetailsInUrl({ orderId: null, candidateId: candidate.id })
    },
    [setDetailsInUrl],
  )

  return {
    handleOpenCandidateDetails,
    handleOpenOrderDetails,
    handleViewChange,
    setDetailsInUrl,
  }
}
