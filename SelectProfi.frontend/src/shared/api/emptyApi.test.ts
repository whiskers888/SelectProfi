import { configureStore } from '@reduxjs/toolkit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authSessionReducer, type AuthSession, setAuthSession } from '../../app/authSessionSlice'
import { emptyApi } from './emptyApi'

type ProtectedPayload = {
  value: string
}

const reauthApi = emptyApi.injectEndpoints({
  endpoints: (build) => ({
    getProtectedForReauthTest: build.query<ProtectedPayload, void>({
      query: () => ({ url: '/api/protected-resource' }),
    }),
  }),
  overrideExisting: false,
})

function createStore() {
  return configureStore({
    reducer: {
      authSession: authSessionReducer,
      [emptyApi.reducerPath]: emptyApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(emptyApi.middleware),
  })
}

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function readAuthorizationHeader(init: unknown): string | null {
  if (!init || typeof init !== 'object') {
    return null
  }

  const requestInit = init as RequestInit
  return new Headers(requestInit.headers).get('Authorization')
}

function readRequestUrl(input: unknown): string {
  if (input instanceof Request) {
    return input.url
  }

  return typeof input === 'string' ? input : ''
}

function readAuthorizationHeaderFromCall(call: unknown[]): string | null {
  const [request, init] = call

  if (request instanceof Request) {
    return request.headers.get('Authorization')
  }

  return readAuthorizationHeader(init)
}

describe('emptyApi reauth', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    window.localStorage.clear()
  })

  it('refreshes session on 401 and retries original request once', async () => {
    const store = createStore()
    const staleSession: AuthSession = {
      accessToken: 'expired-access-token',
      refreshToken: 'refresh-token-1',
    }
    store.dispatch(setAuthSession(staleSession))

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ title: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(
        createJsonResponse({
          accessToken: 'fresh-access-token',
          refreshToken: 'refresh-token-2',
        }),
      )
      .mockResolvedValueOnce(createJsonResponse({ value: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)

    const query = store.dispatch(reauthApi.endpoints.getProtectedForReauthTest.initiate())
    await expect(query.unwrap()).resolves.toEqual({ value: 'ok' })
    query.unsubscribe()

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(readRequestUrl(fetchMock.mock.calls[1][0])).toContain('/api/auth/refresh')
    expect(readAuthorizationHeaderFromCall(fetchMock.mock.calls[0])).toBe('Bearer expired-access-token')
    expect(readAuthorizationHeaderFromCall(fetchMock.mock.calls[2])).toBe('Bearer fresh-access-token')

    const state = store.getState()
    expect(state.authSession.session).toEqual({
      accessToken: 'fresh-access-token',
      refreshToken: 'refresh-token-2',
    })
  })

  it('clears session when refresh request fails after 401', async () => {
    const store = createStore()
    store.dispatch(
      setAuthSession({
        accessToken: 'expired-access-token',
        refreshToken: 'invalid-refresh-token',
      }),
    )

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ title: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(createJsonResponse({ title: 'Unauthorized' }, 401))
    vi.stubGlobal('fetch', fetchMock)

    const query = store.dispatch(reauthApi.endpoints.getProtectedForReauthTest.initiate())
    await expect(query.unwrap()).rejects.toMatchObject({ status: 401 })
    query.unsubscribe()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(readRequestUrl(fetchMock.mock.calls[1][0])).toContain('/api/auth/refresh')

    const state = store.getState()
    expect(state.authSession.session).toBeNull()
  })
})
