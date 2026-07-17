import { useEffect, useRef } from 'react'
import type { WorkspaceCandidate, WorkspaceRole } from '../../model/data'
import type { VacancyBaseCandidatesItemResponse, VacancyCandidatesItemResponse } from '@/shared/api/candidates'
import type { VacancyResponse } from '@/shared/api/vacancies'

type LazyVacancyCandidatesResponse = {
  items: VacancyCandidatesItemResponse[]
}

type LazyVacancyBaseCandidatesResponse = {
  items: VacancyBaseCandidatesItemResponse[]
}

type UnwrappableResult<TResult> = {
  unwrap: () => Promise<TResult>
}

type LoadVacancyCandidates = (args: { vacancyId: string }) => UnwrappableResult<LazyVacancyCandidatesResponse>
type LoadVacancyBaseCandidates = (args: { vacancyId: string }) => UnwrappableResult<LazyVacancyBaseCandidatesResponse>

type MarkViewedTrigger = (args: { candidateId: string; vacancyId: string }) => UnwrappableResult<void>

type UseSyncExecutorGlobalCandidatesInput = {
  loadVacancyBaseCandidates: LoadVacancyBaseCandidates
  loadVacancyCandidates: LoadVacancyCandidates
  role: WorkspaceRole
  setExecutorGlobalBaseCandidates: (value: WorkspaceCandidate[]) => void
  setExecutorGlobalCandidates: (value: WorkspaceCandidate[]) => void
  toWorkspaceBaseCandidate: (
    candidate: VacancyBaseCandidatesItemResponse,
    vacancy: VacancyResponse,
  ) => WorkspaceCandidate
  toWorkspaceCandidate: (
    candidate: VacancyCandidatesItemResponse,
    vacancy: VacancyResponse,
  ) => WorkspaceCandidate
  vacanciesResponse?: { items: VacancyResponse[] }
}

export function useSyncExecutorGlobalCandidates({
  loadVacancyBaseCandidates,
  loadVacancyCandidates,
  role,
  setExecutorGlobalBaseCandidates,
  setExecutorGlobalCandidates,
  toWorkspaceBaseCandidate,
  toWorkspaceCandidate,
  vacanciesResponse,
}: UseSyncExecutorGlobalCandidatesInput) {
  const executorVacancyIdsSignature =
    role === 'Executor' && vacanciesResponse
      ? vacanciesResponse.items
          .map((vacancy) => vacancy.id)
          .sort((left, right) => left.localeCompare(right))
          .join('|')
      : ''

  useEffect(() => {
    if (role !== 'Executor' || !vacanciesResponse) {
      return
    }

    const vacancies = vacanciesResponse.items
    if (vacancies.length === 0) {
      return
    }

    let cancelled = false
    void Promise.all(
      vacancies.map(async (vacancy) => {
        const [vacancyCandidatesResponseResult, vacancyBaseCandidatesResponseResult] = await Promise.all([
          loadVacancyCandidates({ vacancyId: vacancy.id }).unwrap(),
          loadVacancyBaseCandidates({ vacancyId: vacancy.id }).unwrap(),
        ])

        return {
          vacancy,
          vacancyCandidates: vacancyCandidatesResponseResult.items,
          vacancyBaseCandidates: vacancyBaseCandidatesResponseResult.items,
        }
      }),
    )
      .then((results) => {
        if (cancelled) {
          return
        }

        const globalCandidatesMap = new Map<string, WorkspaceCandidate>()
        const globalCandidatesUpdatedAt = new Map<string, number>()
        const globalBaseCandidatesMap = new Map<string, WorkspaceCandidate>()
        const globalBaseCandidatesUpdatedAt = new Map<string, number>()

        for (const result of results) {
          for (const item of result.vacancyCandidates) {
            const mappedCandidate = toWorkspaceCandidate(item, result.vacancy)
            const nextUpdatedAt = new Date(item.updatedAtUtc).getTime()
            const currentUpdatedAt = globalCandidatesUpdatedAt.get(item.candidateId) ?? Number.NEGATIVE_INFINITY

            if (nextUpdatedAt > currentUpdatedAt) {
              globalCandidatesMap.set(item.candidateId, mappedCandidate)
              globalCandidatesUpdatedAt.set(item.candidateId, nextUpdatedAt)
            }
          }

          for (const item of result.vacancyBaseCandidates) {
            const mappedBaseCandidate = toWorkspaceBaseCandidate(item, result.vacancy)
            const nextUpdatedAt = new Date(item.updatedAtUtc).getTime()
            const currentUpdatedAt =
              globalBaseCandidatesUpdatedAt.get(item.candidateId) ?? Number.NEGATIVE_INFINITY

            if (nextUpdatedAt > currentUpdatedAt) {
              globalBaseCandidatesMap.set(item.candidateId, mappedBaseCandidate)
              globalBaseCandidatesUpdatedAt.set(item.candidateId, nextUpdatedAt)
            }

            if (mappedBaseCandidate.isOwnedByRequester && !globalCandidatesMap.has(item.candidateId)) {
              globalCandidatesMap.set(item.candidateId, mappedBaseCandidate)
              globalCandidatesUpdatedAt.set(item.candidateId, nextUpdatedAt)
            }
          }
        }

        setExecutorGlobalCandidates(Array.from(globalCandidatesMap.values()))
        setExecutorGlobalBaseCandidates(Array.from(globalBaseCandidatesMap.values()))
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setExecutorGlobalCandidates([])
        setExecutorGlobalBaseCandidates([])
      })

    return () => {
      cancelled = true
    }
  }, [
    executorVacancyIdsSignature,
    loadVacancyBaseCandidates,
    loadVacancyCandidates,
    role,
    setExecutorGlobalBaseCandidates,
    setExecutorGlobalCandidates,
    toWorkspaceBaseCandidate,
    toWorkspaceCandidate,
    vacanciesResponse,
  ])
}

type UseMarkCustomerViewedCandidateInput = {
  candidateSourceVacancyId?: string
  markVacancyCandidateViewedByCustomer: MarkViewedTrigger
  refetchVacancyCandidates: () => Promise<unknown>
  role: WorkspaceRole
  selectedCandidate: WorkspaceCandidate | null
  vacanciesResponse?: { items: VacancyResponse[] }
  vacancyCandidatesResponse?: { items: VacancyCandidatesItemResponse[] }
}

export function useMarkCustomerViewedCandidate({
  candidateSourceVacancyId,
  markVacancyCandidateViewedByCustomer,
  refetchVacancyCandidates,
  role,
  selectedCandidate,
  vacanciesResponse,
  vacancyCandidatesResponse,
}: UseMarkCustomerViewedCandidateInput) {
  const viewedCandidateRequestKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (role !== 'Customer' || !selectedCandidate || !vacanciesResponse || !vacancyCandidatesResponse) {
      viewedCandidateRequestKeyRef.current = null
      return
    }

    const vacancyForCandidate =
      vacanciesResponse.items.find((vacancy) => vacancy.orderId === selectedCandidate.orderId) ?? null
    if (!vacancyForCandidate || vacancyForCandidate.id !== candidateSourceVacancyId) {
      return
    }

    const vacancyCandidate = vacancyCandidatesResponse.items.find(
      (item) => item.candidateId === selectedCandidate.id,
    )
    if (!vacancyCandidate || vacancyCandidate.viewedByCustomerAtUtc) {
      return
    }

    const requestKey = `${vacancyForCandidate.id}:${selectedCandidate.id}`
    if (viewedCandidateRequestKeyRef.current === requestKey) {
      return
    }

    viewedCandidateRequestKeyRef.current = requestKey
    void markVacancyCandidateViewedByCustomer({
      vacancyId: vacancyForCandidate.id,
      candidateId: selectedCandidate.id,
    })
      .unwrap()
      .then(() => {
        void refetchVacancyCandidates()
      })
      .catch(() => {
        viewedCandidateRequestKeyRef.current = null
      })
  }, [
    candidateSourceVacancyId,
    markVacancyCandidateViewedByCustomer,
    refetchVacancyCandidates,
    role,
    selectedCandidate,
    vacanciesResponse,
    vacancyCandidatesResponse,
  ])
}
