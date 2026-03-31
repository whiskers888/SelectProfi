import { api } from '../generated/openapi'

export type UserRole = 'Applicant' | 'Executor' | 'Customer' | 'Admin'
export type ExecutorEmploymentType = 'Fl' | 'Smz' | 'Ip'
export type CustomerLegalForm = 'Ooo' | 'Ip' | 1 | 2

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

type CustomerProfileBasePayload = {
  inn?: string
  legalForm?: CustomerLegalForm | null
  egrn?: string
  egrnip?: string
  companyName?: string
  companyLogoUrl?: string
}

export type CustomerProfilePayload = CustomerProfileBasePayload & {
  offerAccepted?: boolean
  offerVersion?: string | null
  offerAcceptedAtUtc?: string | null
}

export type CustomerProfileUpdatePayload = CustomerProfileBasePayload & {
  offerAccepted?: boolean | null
  offerVersion?: string | null
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
  activeRole?: UserRole
  roles?: UserRole[]
  isEmailVerified: boolean
  isPhoneVerified: boolean
  applicantProfile?: ApplicantProfilePayload | null
  customerProfile?: CustomerProfilePayload | null
  executorProfile?: ExecutorProfilePayload | null
}

export type SwitchMyActiveRoleRequest = {
  activeRole: UserRole
}

export type UpdateMyProfileRequest = {
  firstName: string
  lastName: string
  phone?: string
  applicantProfile?: ApplicantProfilePayload | null
  customerProfile?: CustomerProfileUpdatePayload | null
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
    switchMyActiveRole: build.mutation<MyProfileResponse, SwitchMyActiveRoleRequest>({
      query: (body) => ({
        url: '/api/profile/me/active-role',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetMyProfileQuery, useUpdateMyProfileMutation, useSwitchMyActiveRoleMutation } =
  profileApi
