import { type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { api } from '../generated/openapi'

export type RegisterUserRole = 'Applicant' | 'Executor' | 'Customer'

export type RegisterUserRequest = {
  email: string
  phone?: string
  password: string
  firstName: string
  lastName: string
  role: RegisterUserRole
}

export type RegisterUserResponse = {
  accessToken: string
  refreshToken: string
}

export type LoginUserRequest = {
  email: string
  password: string
}

export type LoginUserResponse = {
  accessToken: string
  refreshToken: string
}

export type RefreshSessionRequest = {
  refreshToken: string
}

export type RefreshSessionResponse = {
  accessToken: string
  refreshToken: string
}

const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    registerUser: build.mutation<RegisterUserResponse, RegisterUserRequest>({
      query: (body) => ({
        url: '/api/auth/register',
        method: 'POST',
        body,
      }),
    }),
    loginUser: build.mutation<LoginUserResponse, LoginUserRequest>({
      query: (body) => ({
        url: '/api/auth/login',
        method: 'POST',
        body,
      }),
    }),
    refreshSession: build.mutation<RefreshSessionResponse, RefreshSessionRequest>({
      query: (body) => ({
        url: '/api/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useRegisterUserMutation, useLoginUserMutation, useRefreshSessionMutation } = authApi

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}
