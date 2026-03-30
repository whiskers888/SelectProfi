import { describe, expect, it, beforeEach } from 'vitest'
import {
  authSessionReducer,
  clearAuthSession,
  setAuthSession,
  setAuthSessionBootstrapStatus,
} from './authSessionSlice'

const authSessionStorageKey = 'selectprofi.auth.session'

describe('authSessionSlice', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('stores auth session in state and localStorage', () => {
    const nextState = authSessionReducer(
      undefined,
      setAuthSession({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    )

    expect(nextState.session).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
    expect(window.localStorage.getItem(authSessionStorageKey)).toBe(
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    )
  })

  it('clears auth session from state and localStorage', () => {
    window.localStorage.setItem(
      authSessionStorageKey,
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    )

    const stateWithSession = authSessionReducer(
      undefined,
      setAuthSession({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    )
    const nextState = authSessionReducer(stateWithSession, clearAuthSession())

    expect(nextState.session).toBeNull()
    expect(window.localStorage.getItem(authSessionStorageKey)).toBeNull()
  })

  it('stores bootstrap status changes', () => {
    const inProgressState = authSessionReducer(
      undefined,
      setAuthSessionBootstrapStatus('in_progress'),
    )
    const doneState = authSessionReducer(inProgressState, setAuthSessionBootstrapStatus('done'))

    expect(inProgressState.bootstrapStatus).toBe('in_progress')
    expect(doneState.bootstrapStatus).toBe('done')
  })
})
