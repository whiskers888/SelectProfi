import type { VacancyBaseCandidatesResponse, VacancyCandidatesResponse } from '@/shared/api/candidates'
import type { VacancyListResponse } from '@/shared/api/vacancies'
import { toWorkspaceBaseCandidate, toWorkspaceCandidate } from '../../workspaceShell.helpers'

type UseWorkspaceCandidateDataProps = {
  candidateScopeOrderId: string | null
  vacanciesResponse?: VacancyListResponse
  vacancyCandidatesResponse?: VacancyCandidatesResponse
  vacancyBaseCandidatesResponse?: VacancyBaseCandidatesResponse
  canLoadServerCandidates: boolean
  canLoadExecutorBaseCandidates: boolean
}

export function useWorkspaceCandidateData({
  candidateScopeOrderId,
  vacanciesResponse,
  vacancyCandidatesResponse,
  vacancyBaseCandidatesResponse,
}: UseWorkspaceCandidateDataProps) {
  const candidateSourceVacancy =
    vacanciesResponse?.items.find((vacancy) => vacancy.orderId === candidateScopeOrderId) ?? null
  const serverCandidates = candidateSourceVacancy && vacancyCandidatesResponse
    ? vacancyCandidatesResponse.items.map((candidate) => toWorkspaceCandidate(candidate, candidateSourceVacancy))
    : []
  const serverBaseCandidates = candidateSourceVacancy && vacancyBaseCandidatesResponse
    ? vacancyBaseCandidatesResponse.items.map((candidate) => toWorkspaceBaseCandidate(candidate, candidateSourceVacancy))
    : []

  return { candidateSourceVacancy, serverCandidates, serverBaseCandidates }
}
