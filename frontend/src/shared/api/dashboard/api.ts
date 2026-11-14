import { api } from '../generated/openapi'

export type ExecutorDashboardStatsResponse = {
  activeProjectsCount: number
  pipelineCandidatesCount: number
  shortlistCandidatesCount: number
  onApprovalVacanciesCount: number
  availableBalance: number
  reservedBalance: number
  currencyCode: string
  unreadNotificationsCount: number
}

export type CustomerDashboardStatsResponse = {
  activeProjectsCount: number
  pipelineCandidatesCount: number
  shortlistCandidatesCount: number
  onApprovalVacanciesCount: number
  availableBalance: number
  reservedBalance: number
  currencyCode: string
  unreadNotificationsCount: number
}

export type ApplicantDashboardStatsResponse = {
  applicationsCount: number
  unclassifiedCandidateLinksCount: number
  shortlistCandidatesCount: number
  unreadNotificationsCount: number
  resumeTitle: string | null
  applications: ApplicantDashboardApplicationResponse[]
}

export type ApplicantDashboardApplicationResponse = {
  vacancyId: string
  vacancyTitle: string
  companyName: string | null
  stage: 'Pool' | 'Shortlist'
  submittedAtUtc: string
  firstViewedAtUtc: string | null
}

const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCustomerDashboardStats: build.query<CustomerDashboardStatsResponse, void>({
      query: () => ({
        url: '/api/dashboard/customer',
        method: 'GET',
      }),
    }),
    getExecutorDashboardStats: build.query<ExecutorDashboardStatsResponse, void>({
      query: () => ({
        url: '/api/dashboard/executor',
        method: 'GET',
      }),
    }),
    getApplicantDashboardStats: build.query<ApplicantDashboardStatsResponse, void>({
      query: () => ({
        url: '/api/dashboard/applicant',
        method: 'GET',
      }),
      providesTags: ['VacancyCandidate'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetApplicantDashboardStatsQuery,
  useGetCustomerDashboardStatsQuery,
  useGetExecutorDashboardStatsQuery,
} = dashboardApi
