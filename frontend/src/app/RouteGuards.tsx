import type { ReactElement } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { routePaths } from './routePaths'
import type { RootState } from './store'

function useHasAccessToken(): boolean {
  return useSelector((state: RootState) => Boolean(state.authSession.session?.accessToken))
}

function useIsBackendUnavailable(): boolean {
  return useSelector((state: RootState) => state.runtimeStatus.isBackendUnavailable)
}

type ProtectedRouteProps = {
  element: ReactElement
}

type AvailabilityRouteProps = {
  element: ReactElement
}

export function AvailabilityRoute({ element }: AvailabilityRouteProps) {
  const isBackendUnavailable = useIsBackendUnavailable()
  const location = useLocation()

  if (isBackendUnavailable && location.pathname !== routePaths.serviceUnavailable) {
    return <Navigate to={routePaths.serviceUnavailable} replace />
  }

  return element
}

export function SessionEntryRedirect() {
  const hasAccessToken = useHasAccessToken()
  const isBackendUnavailable = useIsBackendUnavailable()

  if (isBackendUnavailable) {
    // @dvnull: Добавлен явный редирект на страницу недоступности, чтобы не оставлять пользователя на пустом экране при сетевой аварии.
    return <Navigate to={routePaths.serviceUnavailable} replace />
  }

  return <Navigate to={hasAccessToken ? routePaths.app : routePaths.auth} replace />
}

export function ProtectedRoute({ element }: ProtectedRouteProps) {
  const hasAccessToken = useHasAccessToken()

  return hasAccessToken ? element : <Navigate to={routePaths.auth} replace />
}
