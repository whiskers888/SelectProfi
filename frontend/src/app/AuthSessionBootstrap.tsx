import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRefreshSessionMutation } from '../shared/api/auth'
import {
  clearAuthSession,
  setAuthSession,
  setAuthSessionBootstrapStatus,
} from './authSessionSlice'
import type { AppDispatch, RootState } from './store'

export function AuthSessionBootstrap() {
  const dispatch = useDispatch<AppDispatch>()
  const [refreshSession] = useRefreshSessionMutation()
  const bootstrapStatus = useSelector((state: RootState) => state.authSession.bootstrapStatus)
  const refreshToken = useSelector((state: RootState) => state.authSession.session?.refreshToken)

  useEffect(() => {
    if (bootstrapStatus !== 'idle') {
      return
    }

    dispatch(setAuthSessionBootstrapStatus('in_progress'))

    if (!refreshToken) {
      dispatch(setAuthSessionBootstrapStatus('done'))
      return
    }

    void refreshSession({ refreshToken })
      .unwrap()
      .then((session) => {
        dispatch(setAuthSession(session))
      })
      .catch(() => {
        dispatch(clearAuthSession())
      })
      .finally(() => {
        dispatch(setAuthSessionBootstrapStatus('done'))
      })
  }, [bootstrapStatus, dispatch, refreshSession, refreshToken])

  return null
}
