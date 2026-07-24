import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthSession } from '@/app/authSessionSlice'
import type { AppDispatch, RootState } from '@/app/store'
import { useRefreshSessionMutation } from '@/shared/api/auth'
import { api } from '@/shared/api/generated/openapi'

export function useRefreshRoleSession() {
  const dispatch = useDispatch<AppDispatch>()
  const refreshToken = useSelector((state: RootState) => state.authSession.session?.refreshToken)
  const [refreshSession] = useRefreshSessionMutation()

  return useCallback(async () => {
    if (!refreshToken) {
      throw new Error('Refresh token is unavailable after active role switch.')
    }

    const nextSession = await refreshSession({ refreshToken }).unwrap()
    dispatch(setAuthSession(nextSession))
    dispatch(api.util.resetApiState())
  }, [dispatch, refreshSession, refreshToken])
}
