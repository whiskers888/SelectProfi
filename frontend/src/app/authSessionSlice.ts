import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  getAuthSession as loadSession,
  setAuthSession as saveSession,
  removeAuthSession as clearSession,
  type AuthSession,
} from "@/lib/sessionStorageService"

interface AuthSessionState {
  session: AuthSession | null
}

const initialState: AuthSessionState = {
  session: loadSession(),
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
  },
})

export const { setAuthSession, clearAuthSession } = authSessionSlice.actions
export const authSessionReducer = authSessionSlice.reducer