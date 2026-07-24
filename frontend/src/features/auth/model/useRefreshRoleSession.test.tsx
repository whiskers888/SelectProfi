import type { PropsWithChildren } from 'react'
import { act, cleanup, renderHook } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authSessionReducer } from '@/app/authSessionSlice'
import { api } from '@/shared/api/generated/openapi'
import { useRefreshRoleSession } from './useRefreshRoleSession'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useRefreshRoleSession', () => {
  it('rotates tokens after an active role switch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'executor-access-token',
          refreshToken: 'executor-refresh-token',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const store = configureStore({
      reducer: {
        authSession: authSessionReducer,
        [api.reducerPath]: api.reducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
      preloadedState: {
        authSession: {
          session: {
            accessToken: 'applicant-access-token',
            refreshToken: 'applicant-refresh-token',
          },
          bootstrapStatus: 'done' as const,
        },
      },
    })
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    )
    const { result } = renderHook(() => useRefreshRoleSession(), { wrapper })

    await act(async () => {
      await result.current()
    })

    expect(store.getState().authSession.session).toEqual({
      accessToken: 'executor-access-token',
      refreshToken: 'executor-refresh-token',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const request = fetchMock.mock.calls[0][0]
    expect(request).toBeInstanceOf(Request)
    expect((request as Request).url).toContain('/api/auth/refresh')
  })
})
