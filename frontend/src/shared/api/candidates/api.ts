import { api } from '../generated/openapi'
import type { SelectedResumeFile } from '@/components/workspace/ResumeFilesInput'

export type VacancyCandidateStageContract = 'Pool' | 'Shortlist'

export type CreateCandidateResumeRequest = {
  fullName: string
  birthDate?: string
  email?: string
  phone?: string
  specializationId: string
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

export type MyCandidateResponse = {
  candidateId: string
  fullName: string
  specializationName: string
  resumeTitle: string
  updatedAtUtc: string
}

export type VacancyCandidateResponse = {
  vacancyCandidateId: string
  vacancyId: string
  candidateId: string
  stage: VacancyCandidateStageContract
  addedAtUtc: string
  updatedAtUtc: string
}

export type VacancyCandidatesItemResponse = {
  vacancyCandidateId: string
  candidateId: string
  publicAlias: string
  displayName: string
  source: 'AddedByExecutor' | 'RegisteredUser'
  isOwnedByRequester: boolean
  isAnonymized: boolean
  stage: VacancyCandidateStageContract
  addedAtUtc: string
  updatedAtUtc: string
  viewedByCustomerAtUtc?: string | null
  isSelected: boolean
}

export type VacancyCandidatesResponse = {
  vacancyId: string
  selectedCandidateId?: string | null
  items: VacancyCandidatesItemResponse[]
}

export type VacancyBaseCandidatesItemResponse = {
  candidateId: string
  publicAlias: string
  displayName: string
  source: 'AddedByExecutor' | 'RegisteredUser'
  isOwnedByRequester: boolean
  isAnonymized: boolean
  updatedAtUtc: string
}

export type VacancyBaseCandidatesResponse = {
  vacancyId: string
  items: VacancyBaseCandidatesItemResponse[]
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
    getMyCandidates: build.query<MyCandidateResponse[], void>({
      query: () => ({ url: '/api/candidates/mine', method: 'GET' }),
      providesTags: ['VacancyCandidate'],
    }),
    createMyCandidateResume: build.mutation<CandidateResumeResponse, CreateCandidateResumeRequest>({
      query: (body) => ({
        url: '/api/candidates/resumes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VacancyCandidate'],
    }),
    createCandidateResume: build.mutation<
      CandidateResumeResponse,
      { vacancyId: string; body: CreateCandidateResumeRequest }
    >({
      query: ({ vacancyId, body }) => ({
        url: `/api/vacancies/${vacancyId}/candidates/resumes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { vacancyId }) => [{ type: 'VacancyCandidate', id: vacancyId }],
    }),
    uploadCandidateResumeAttachment: build.mutation<
      { attachmentId: string },
      { vacancyId: string; resumeId: string; file: SelectedResumeFile }
    >({
      query: ({ vacancyId, resumeId, file }) => {
        const body = new FormData()
        body.append('file', file.file)
        body.append('attachmentType', file.type)
        if (file.customType.trim()) body.append('customType', file.customType.trim())
        return { url: `/api/vacancies/${vacancyId}/candidates/resumes/${resumeId}/attachments`, method: 'POST', body }
      },
    }),
    uploadMyCandidateResumeAttachment: build.mutation<
      { attachmentId: string },
      { resumeId: string; file: SelectedResumeFile }
    >({
      query: ({ resumeId, file }) => {
        const body = new FormData()
        body.append('file', file.file)
        body.append('attachmentType', file.type)
        if (file.customType.trim()) body.append('customType', file.customType.trim())
        return { url: `/api/candidates/resumes/${resumeId}/attachments`, method: 'POST', body }
      },
    }),
    addCandidateFromBase: build.mutation<
      VacancyCandidateResponse,
      { vacancyId: string; candidateId: string }
    >({
      query: ({ vacancyId, candidateId }) => ({
        url: `/api/vacancies/${vacancyId}/candidates/${candidateId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { vacancyId }) => [{ type: 'VacancyCandidate', id: vacancyId }],
    }),
    removeVacancyCandidate: build.mutation<void, { vacancyId: string; candidateId: string }>({
      query: ({ vacancyId, candidateId }) => ({ url: `/api/vacancies/${vacancyId}/candidates/${candidateId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { vacancyId }) => [{ type: 'VacancyCandidate', id: vacancyId }],
    }),
    respondToVacancy: build.mutation<VacancyCandidateResponse, { vacancyId: string }>({
      query: ({ vacancyId }) => ({
        url: `/api/vacancies/${vacancyId}/respond`,
        method: 'POST',
      }),
    }),
    getVacancyCandidates: build.query<VacancyCandidatesResponse, { vacancyId: string }>({
      query: ({ vacancyId }) => ({
        url: `/api/vacancies/${vacancyId}/candidates`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { vacancyId }) => [{ type: 'VacancyCandidate', id: vacancyId }],
    }),
    getVacancyBaseCandidates: build.query<VacancyBaseCandidatesResponse, { vacancyId: string }>({
      query: ({ vacancyId }) => ({
        url: `/api/vacancies/${vacancyId}/base-candidates`,
        method: 'GET',
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
    markVacancyCandidateViewedByCustomer: build.mutation<void, { vacancyId: string; candidateId: string }>({
      query: ({ vacancyId, candidateId }) => ({
        url: `/api/vacancies/${vacancyId}/candidates/${candidateId}/viewed`,
        method: 'PATCH',
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
  useGetMyCandidatesQuery,
  useCreateMyCandidateResumeMutation,
  useCreateCandidateResumeMutation,
  useUploadCandidateResumeAttachmentMutation,
  useUploadMyCandidateResumeAttachmentMutation,
  useAddCandidateFromBaseMutation,
  useRemoveVacancyCandidateMutation,
  useRespondToVacancyMutation,
  useGetVacancyCandidatesQuery,
  useLazyGetVacancyCandidatesQuery,
  useGetVacancyBaseCandidatesQuery,
  useLazyGetVacancyBaseCandidatesQuery,
  useUpdateVacancyCandidateStageMutation,
  useSelectVacancyCandidateMutation,
  useMarkVacancyCandidateViewedByCustomerMutation,
  useGetSelectedCandidateContactsQuery,
  useLazyGetSelectedCandidateContactsQuery,
  useGetExecutorCandidateContactsQuery,
  useLazyGetExecutorCandidateContactsQuery,
} = candidatesApi
