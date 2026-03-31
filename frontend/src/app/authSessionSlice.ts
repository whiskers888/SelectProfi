import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const authSessionStorageKey = 'selectprofi.auth.session'

export type AuthSession = {
  accessToken: string
  refreshToken: string
}

type AuthSessionState = {
  session: AuthSession | null
  bootstrapStatus: 'idle' | 'in_progress' | 'done'
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

function readStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storageCandidate = window.localStorage as Partial<Storage> | undefined
  if (
    !storageCandidate ||
    typeof storageCandidate.getItem !== 'function' ||
    typeof storageCandidate.setItem !== 'function' ||
    typeof storageCandidate.removeItem !== 'function'
  ) {
    return null
  }

  return storageCandidate as Storage
}

function readAuthSession(): AuthSession | null {
  const storage = readStorage()
  if (!storage) {
    return null
  }

  const storedSession = storage.getItem(authSessionStorageKey)
  if (!storedSession) {
    return null
  }

  try {
    const parsedValue: unknown = JSON.parse(storedSession)
    return isAuthSession(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

function writeAuthSession(session: AuthSession | null): void {
  const storage = readStorage()
  if (!storage) {
    return
  }

  if (!session) {
    storage.removeItem(authSessionStorageKey)
    return
  }

  storage.setItem(authSessionStorageKey, JSON.stringify(session))
}

const initialState: AuthSessionState = {
  session: readAuthSession(),
  bootstrapStatus: 'idle',
}

const authSessionSlice = createSlice({
  name: 'authSession',
  initialState,
  reducers: {
    setAuthSession: (state, action: PayloadAction<AuthSession>) => {
      state.session = action.payload
      writeAuthSession(action.payload)
    },
    clearAuthSession: (state) => {
      state.session = null
      writeAuthSession(null)
    },
    setAuthSessionBootstrapStatus: (
      state,
      action: PayloadAction<AuthSessionState['bootstrapStatus']>,
    ) => {
      state.bootstrapStatus = action.payload
    },
  },
})

export const { setAuthSession, clearAuthSession, setAuthSessionBootstrapStatus } =
  authSessionSlice.actions
export const authSessionReducer = authSessionSlice.reducer
