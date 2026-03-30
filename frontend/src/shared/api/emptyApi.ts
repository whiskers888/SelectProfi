import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { clearAuthSession, setAuthSession, type AuthSession } from '../../app/authSessionSlice'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5268'

type AuthSessionStateSnapshot = {
  authSession?: {
    session?: AuthSession | null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.accessToken === 'string' && typeof value.refreshToken === 'string'
}

function readAuthSessionFromState(state: unknown): AuthSession | null {
  if (!isRecord(state)) {
    return null
  }

  const maybeState = state as AuthSessionStateSnapshot
  return maybeState.authSession?.session ?? null
}

function resolveRequestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

function isUnauthorized(error: FetchBaseQueryError | undefined): boolean {
  return error?.status === 401
}

function isRefreshRequest(args: string | FetchArgs): boolean {
  return resolveRequestUrl(args).includes('/api/auth/refresh')
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const session = readAuthSessionFromState(getState())
    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`)
    }

    return headers
  },
})

let refreshPromise: Promise<AuthSession | null> | null = null

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (!isUnauthorized(result.error) || isRefreshRequest(args)) {
    if (isUnauthorized(result.error) && isRefreshRequest(args)) {
      api.dispatch(clearAuthSession())
    }

    return result
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const session = readAuthSessionFromState(api.getState())
      if (!session?.refreshToken) {
        api.dispatch(clearAuthSession())
        return null
      }

      const refreshResult = await rawBaseQuery(
        {
          url: '/api/auth/refresh',
          method: 'POST',
          body: { refreshToken: session.refreshToken },
        },
        api,
        extraOptions,
      )

      if (isAuthSession(refreshResult.data)) {
        api.dispatch(setAuthSession(refreshResult.data))
        return refreshResult.data
      }

      api.dispatch(clearAuthSession())
      return null
    })().finally(() => {
      refreshPromise = null
    })
  }

  const refreshedSession = await refreshPromise
  if (!refreshedSession) {
    return result
  }

  result = await rawBaseQuery(args, api, extraOptions)
  return result
}

export const emptyApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
})
