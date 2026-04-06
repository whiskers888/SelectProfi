import { api } from '../generated/openapi'

export type VacancyCandidateStageContract = 'Pool' | 'Shortlist'

export type CreateCandidateResumeRequest = {
  fullName: string
  birthDate?: string
  email?: string
  phone?: string
  specialization: string
  resumeTitle: string
  resumeContentJson: string
  resumeAttachmentsJson?: string
}

export type CandidateResumeResponse = {
  candidateId: string
  candidateResumeId: string
  vacancyCandidateId: string
  publicAlias: string
  contactsAccessExpiresAtUtc: string
}

export type VacancyCandidateResponse = {
  vacancyCandidateId: string
  vacancyId: string
  candidateId: string
  stage: VacancyCandidateStageContract
  addedAtUtc: string
  updatedAtUtc: string
}

export type UpdateVacancyCandidateStageRequest = {
  stage: VacancyCandidateStageContract
}

export type SelectVacancyCandidateRequest = {
  candidateId: string
}

export type SelectedVacancyCandidateResponse = {
  vacancyId: string
  selectedCandidateId: string
  updatedAtUtc: string
}

export type SelectedCandidateContactsResponse = {
  vacancyId: string
  candidateId: string
  fullName: string
  email?: string | null
  phone?: string | null
}

export type ExecutorCandidateContactsResponse = {
  vacancyId: string
  candidateId: string
  fullName: string
  email?: string | null
  phone?: string | null
  contactsAccessExpiresAtUtc: string
}

const candidatesApi = api.injectEndpoints({
  endpoints: (build) => ({
    createCandidateResume: build.mutation<
      CandidateResumeResponse,
      { vacancyId: string; body: CreateCandidateResumeRequest }
    >({
      query: ({ vacancyId, body }) => ({
        url: `/api/vacancies/${vacancyId}/candidates/resumes`,
        method: 'POST',
        body,
      }),
    }),
    addCandidateFromBase: build.mutation<
      VacancyCandidateResponse,
      { vacancyId: string; candidateId: string }
    >({
      query: ({ vacancyId, candidateId }) => ({
        url: `/api/vacancies/${vacancyId}/candidates/${candidateId}`,
        method: 'POST',
      }),
    }),
    updateVacancyCandidateStage: build.mutation<
      VacancyCandidateResponse,
      { vacancyId: string; candidateId: string; body: UpdateVacancyCandidateStageRequest }
    >({
      query: ({ vacancyId, candidateId, body }) => ({
        url: `/api/vacancies/${vacancyId}/candidates/${candidateId}/stage`,
        method: 'PATCH',
        body,
      }),
    }),
    selectVacancyCandidate: build.mutation<
      SelectedVacancyCandidateResponse,
      { vacancyId: string; body: SelectVacancyCandidateRequest }
    >({
      query: ({ vacancyId, body }) => ({
        url: `/api/vacancies/${vacancyId}/selected-candidate`,
        method: 'PATCH',
        body,
      }),
    }),
    getSelectedCandidateContacts: build.query<SelectedCandidateContactsResponse, { vacancyId: string }>({
      query: ({ vacancyId }) => ({
        url: `/api/vacancies/${vacancyId}/selected-candidate/contacts`,
        method: 'GET',
      }),
    }),
    getExecutorCandidateContacts: build.query<
      ExecutorCandidateContactsResponse,
      { vacancyId: string; candidateId: string }
    >({
      query: ({ vacancyId, candidateId }) => ({
        url: `/api/vacancies/${vacancyId}/candidates/${candidateId}/contacts`,
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateCandidateResumeMutation,
  useAddCandidateFromBaseMutation,
  useUpdateVacancyCandidateStageMutation,
  useSelectVacancyCandidateMutation,
  useGetSelectedCandidateContactsQuery,
  useLazyGetSelectedCandidateContactsQuery,
  useGetExecutorCandidateContactsQuery,
  useLazyGetExecutorCandidateContactsQuery,
} = candidatesApi
