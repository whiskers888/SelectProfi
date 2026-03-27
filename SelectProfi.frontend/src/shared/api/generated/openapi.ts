import { emptyApi as api } from '../emptyApi'
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
      query: () => ({ url: `/health` }),
    }),
  }),
  overrideExisting: false,
})
export { injectedRtkApi as api }
export type GetHealthApiResponse = unknown
export type GetHealthApiArg = void
export const { useGetHealthQuery } = injectedRtkApi
