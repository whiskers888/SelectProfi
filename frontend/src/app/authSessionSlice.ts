import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  getAuthSession as loadSession,
  setAuthSession as saveSession,
  removeAuthSession as clearSession,
  type AuthSession,
} from "@/lib/sessionStorageService"

export type { AuthSession } from '@/lib/sessionStorageService'

export interface AuthSessionState {
  session: AuthSession | null
  bootstrapStatus: 'idle' | 'in_progress' | 'done'
}

const initialState: AuthSessionState = {
  session: loadSession(),
  bootstrapStatus: 'idle',
}

const authSessionSlice = createSlice({
  name: 'authSession',
  initialState,
  reducers: {
    setAuthSession: (state, action: PayloadAction<AuthSession>) => {
      state.session = action.payload
      saveSession(action.payload)
    },
    clearAuthSession: (state) => {
      state.session = null
      clearSession()
    },
    setAuthSessionBootstrapStatus: (
      state,
      action: PayloadAction<AuthSessionState['bootstrapStatus']>,
    ) => {
      state.bootstrapStatus = action.payload
    },
  },
})

export const { setAuthSession, clearAuthSession, setAuthSessionBootstrapStatus } = authSessionSlice.actions
export const authSessionReducer = authSessionSlice.reducer
