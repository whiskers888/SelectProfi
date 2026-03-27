import { configureStore } from '@reduxjs/toolkit'
import { api } from '../shared/api/generated/openapi'
import { authSessionReducer } from './authSessionSlice'

export const store = configureStore({
  reducer: {
    authSession: authSessionReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
