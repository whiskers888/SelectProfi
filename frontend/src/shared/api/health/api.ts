import { api } from '../generated/openapi'

export type HealthDependencyCheck = {
  name: string
  status: string
  description?: string | null
  durationMs: number
  error?: string | null
}

export type HealthDependenciesResponse = {
  status: string
  totalDurationMs: number
  checks: HealthDependencyCheck[]
}

const healthApi = api.injectEndpoints({
  endpoints: (build) => ({
    getHealthDependencies: build.query<HealthDependenciesResponse, void>({
      query: () => ({
        url: '/health/dependencies',
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetHealthDependenciesQuery } = healthApi
