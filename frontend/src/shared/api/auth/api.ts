import { type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { api } from '../generated/openapi'

export type RegisterUserRole = 'Applicant' | 'Executor' | 'Customer'
export type CustomerLegalForm = 'Ooo' | 'Ip' | 1 | 2

export type RegisterCustomerRequest = {
  inn: string
  legalForm: CustomerLegalForm
  egrn?: string
  egrnip?: string
  companyName?: string
}

export type RegisterOfferAcceptanceRequest = {
  accepted: boolean
  version: string
}

export type RegisterUserRequest = {
  email: string
  phone?: string
  password: string
  firstName: string
  lastName: string
  role: RegisterUserRole
  customerRegistration?: RegisterCustomerRequest
  offerAcceptance?: RegisterOfferAcceptanceRequest
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

export type MyAuthInfoResponse = {
  userId: string
  email: string
  role: RegisterUserRole | 'Admin'
}

export type CustomerAreaResponse = {
  status: string
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
    getMyAuthInfo: build.query<MyAuthInfoResponse, void>({
      query: () => ({
        url: '/api/auth/me',
        method: 'GET',
      }),
    }),
    getCustomerAreaStatus: build.query<CustomerAreaResponse, void>({
      query: () => ({
        url: '/api/auth/customer-area',
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useRefreshSessionMutation,
  useGetMyAuthInfoQuery,
  useGetCustomerAreaStatusQuery,
} = authApi

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}
