import { createApi } from '@reduxjs/toolkit/query/react'
import { apiDispatcher } from './core/apiDispatcher'

export const emptyApi = createApi({
  reducerPath: 'api',
  baseQuery: apiDispatcher,
  endpoints: () => ({}),
})
