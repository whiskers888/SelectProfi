import { useCallback } from 'react'
import type { Location, NavigateFunction } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
import type { WorkspaceCandidate, WorkspaceOrder, WorkspaceRole, WorkspaceView } from '../../model/data'

type UseWorkspaceNavigationDependencies = {
  location: Location
  navigate: NavigateFunction
  role: WorkspaceRole
  openFeed: () => void
  setActiveView: (view: WorkspaceView) => void
  setPreferredOrderId: (value: string | null) => void
  startViewTransition: () => void
}

export function useWorkspaceNavigation({
  location,
  navigate,
  role,
  openFeed,
  setActiveView,
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
      const isProfileRoute = location.pathname === routePaths.profile

      if (role === 'Customer' && nextView === 'orders') {
        setActiveView('dashboard')
      } else {
        setActiveView(nextView)
      }
      openFeed()
      if (isProfileRoute) {
        navigate(routePaths.app, { replace: true })
      } else {
        setDetailsInUrl({ orderId: null, candidateId: null }, true)
      }
      startViewTransition()
    },
    [
      location.pathname,
      navigate,
      openFeed,
      role,
      setActiveView,
      setDetailsInUrl,
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
