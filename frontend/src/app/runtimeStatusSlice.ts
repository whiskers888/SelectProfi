import { createSlice } from '@reduxjs/toolkit'

type RuntimeStatusState = {
  isBackendUnavailable: boolean
}

const initialState: RuntimeStatusState = {
  isBackendUnavailable: false,
}

const runtimeStatusSlice = createSlice({
  name: 'runtimeStatus',
  initialState,
  reducers: {
    setBackendUnavailable: (state) => {
      state.isBackendUnavailable = true
    },
    setBackendAvailable: (state) => {
      state.isBackendUnavailable = false
    },
  },
})

export const { setBackendUnavailable, setBackendAvailable } = runtimeStatusSlice.actions
export const runtimeStatusReducer = runtimeStatusSlice.reducer
