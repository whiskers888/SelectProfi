import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setAuthSessionBootstrapStatus,
} from './authSessionSlice'
import type { AppDispatch, RootState } from './store'

export function AuthSessionBootstrap() {
  const dispatch = useDispatch<AppDispatch>()
  const bootstrapStatus = useSelector((state: RootState) => state.authSession.bootstrapStatus)

  useEffect(() => {
    if (bootstrapStatus !== 'idle') {
      return
    }

    // @dvnull: Ранее bootstrap всегда вызывал refresh и при любой ошибке очищал сессию; переведено в lazy-режим, чтобы не разлогинивать пользователя при reload до первого 401.
    dispatch(setAuthSessionBootstrapStatus('in_progress'))
    dispatch(setAuthSessionBootstrapStatus('done'))
  }, [bootstrapStatus, dispatch])

  return null
}
