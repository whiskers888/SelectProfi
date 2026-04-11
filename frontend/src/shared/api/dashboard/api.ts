import { api } from '../generated/openapi'

export type ExecutorDashboardStatsResponse = {
  activeProjectsCount: number
  pipelineCandidatesCount: number
  shortlistCandidatesCount: number
  onApprovalVacanciesCount: number
}

export type CustomerDashboardStatsResponse = {
  activeProjectsCount: number
  pipelineCandidatesCount: number
  shortlistCandidatesCount: number
  onApprovalVacanciesCount: number
}

const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCustomerDashboardStats: build.query<CustomerDashboardStatsResponse, void>({
      query: () => ({
        url: '/api/dashboard/customer-stats',
        method: 'GET',
      }),
    }),
    getExecutorDashboardStats: build.query<ExecutorDashboardStatsResponse, void>({
      query: () => ({
        url: '/api/dashboard/executor-stats',
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetCustomerDashboardStatsQuery, useGetExecutorDashboardStatsQuery } = dashboardApi
