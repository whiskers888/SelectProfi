import type { ReactElement } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { routePaths } from './routePaths'
import type { RootState } from './store'

function useHasAccessToken(): boolean {
  return useSelector((state: RootState) => Boolean(state.authSession.session?.accessToken))
}

type ProtectedRouteProps = {
  element: ReactElement
}

export function SessionEntryRedirect() {
  const hasAccessToken = useHasAccessToken()

  return <Navigate to={hasAccessToken ? routePaths.app : routePaths.auth} replace />
}

export function ProtectedRoute({ element }: ProtectedRouteProps) {
  const hasAccessToken = useHasAccessToken()

  return hasAccessToken ? element : <Navigate to={routePaths.auth} replace />
}
