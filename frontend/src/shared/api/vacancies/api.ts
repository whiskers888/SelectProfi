import { api } from '../generated/openapi'

export type VacancyStatusContract = 'Draft' | 'OnApproval' | 'Published'

export type VacancyResponse = {
  id: string
  orderId: string
  customerId: string
  executorId: string
  title: string
  description: string
  status: VacancyStatusContract
  createdAtUtc: string
  updatedAtUtc: string
}

export type VacancyListResponse = {
  items: VacancyResponse[]
  limit: number
  offset: number
}

export type GetVacanciesRequest = {
  limit?: number
  offset?: number
}

export type CreateVacancyRequest = {
  orderId: string
  title: string
  description: string
}

export type UpdateVacancyRequest = {
  title?: string
  description?: string
}

export type UpdateVacancyStatusRequest = {
  status: VacancyStatusContract
}

const vacanciesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getVacancies: build.query<VacancyListResponse, GetVacanciesRequest | void>({
      query: (params) => ({
        url: '/api/vacancies',
        method: 'GET',
        params: params ?? undefined,
      }),
    }),
    getVacancyById: build.query<VacancyResponse, string>({
      query: (vacancyId) => ({
        url: `/api/vacancies/${vacancyId}`,
        method: 'GET',
      }),
    }),
    createVacancy: build.mutation<VacancyResponse, CreateVacancyRequest>({
      query: (body) => ({
        url: '/api/vacancies',
        method: 'POST',
        body,
      }),
    }),
    updateVacancy: build.mutation<VacancyResponse, { vacancyId: string; body: UpdateVacancyRequest }>({
      query: ({ vacancyId, body }) => ({
        url: `/api/vacancies/${vacancyId}`,
        method: 'PATCH',
        body,
      }),
    }),
    updateVacancyStatus: build.mutation<
      VacancyResponse,
      { vacancyId: string; body: UpdateVacancyStatusRequest }
    >({
      query: ({ vacancyId, body }) => ({
        url: `/api/vacancies/${vacancyId}/status`,
        method: 'PATCH',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVacanciesQuery,
  useGetVacancyByIdQuery,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useUpdateVacancyStatusMutation,
} = vacanciesApi
