import { api } from '../generated/openapi'

export type UserRole = 'Applicant' | 'Executor' | 'Customer' | 'Admin'
export type ExecutorEmploymentType = 'Fl' | 'Smz' | 'Ip'

export type ApplicantProfilePayload = {
  resumeTitle?: string
  previousCompanyName?: string
  workPeriod?: string
  experienceSummary?: string
  achievements?: string
  education?: string
  skills?: string[]
  certificates?: string[]
  portfolioUrl?: string
  about?: string
  desiredSalary?: number
}

export type CustomerProfilePayload = {
  inn?: string
  egrn?: string
  egrnip?: string
  companyName?: string
  companyLogoUrl?: string
}

export type ExecutorProfilePayload = {
  employmentType?: ExecutorEmploymentType
  projectTitle?: string
  projectCompanyName?: string
  experienceSummary?: string
  achievements?: string
  certificates?: string[]
  grade?: string
  extraInfo?: string
}

export type MyProfileResponse = {
  userId: string
  email: string
  phone?: string | null
  firstName: string
  lastName: string
  role: UserRole
  isEmailVerified: boolean
  isPhoneVerified: boolean
  applicantProfile?: ApplicantProfilePayload | null
  customerProfile?: CustomerProfilePayload | null
  executorProfile?: ExecutorProfilePayload | null
}

export type UpdateMyProfileRequest = {
  firstName: string
  lastName: string
  phone?: string
  applicantProfile?: ApplicantProfilePayload | null
  customerProfile?: CustomerProfilePayload | null
  executorProfile?: ExecutorProfilePayload | null
}

const profileApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMyProfile: build.query<MyProfileResponse, void>({
      query: () => ({
        url: '/api/profile/me',
        method: 'GET',
      }),
    }),
    updateMyProfile: build.mutation<MyProfileResponse, UpdateMyProfileRequest>({
      query: (body) => ({
        url: '/api/profile/me',
        method: 'PUT',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetMyProfileQuery, useUpdateMyProfileMutation } = profileApi
