import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  VacancyBaseCandidatesItemResponse,
  VacancyCandidatesItemResponse,
} from '@/shared/api/candidates'
import type { VacancyResponse } from '@/shared/api/vacancies'
import type { WorkspaceCandidate } from '../../model/data'
import { useSyncExecutorGlobalCandidates } from './useWorkspaceCandidateEffects'

afterEach(cleanup)

describe('useSyncExecutorGlobalCandidates', () => {
  it('loads candidate pools only for published vacancies', async () => {
    const vacancies: VacancyResponse[] = [
      {
        id: 'draft-vacancy',
        orderId: 'draft-order',
        customerId: 'customer-1',
        executorId: 'executor-1',
        title: 'Черновик',
        description: '',
        status: 'Draft',
        createdAtUtc: '2026-11-15T10:00:00Z',
        updatedAtUtc: '2026-11-15T10:00:00Z',
      },
      {
        id: 'published-vacancy',
        orderId: 'published-order',
        customerId: 'customer-1',
        executorId: 'executor-1',
        title: 'Опубликованная вакансия',
        description: '',
        status: 'Published',
        createdAtUtc: '2026-11-15T10:00:00Z',
        updatedAtUtc: '2026-11-15T10:00:00Z',
      },
    ]
    const vacanciesResponse = { items: vacancies }
    const loadVacancyCandidates = vi.fn(({ vacancyId }: { vacancyId: string }) => ({
      unwrap: () =>
        vacancyId === 'draft-vacancy'
          ? Promise.reject(new Error('409 vacancy_not_published'))
          : Promise.resolve({ items: [] as VacancyCandidatesItemResponse[] }),
    }))
    const loadVacancyBaseCandidates = vi.fn(({ vacancyId }: { vacancyId: string }) => ({
      unwrap: () =>
        vacancyId === 'draft-vacancy'
          ? Promise.reject(new Error('409 vacancy_not_published'))
          : Promise.resolve({ items: [] as VacancyBaseCandidatesItemResponse[] }),
    }))
    const setExecutorGlobalCandidates = vi.fn(() => undefined)
    const setExecutorGlobalBaseCandidates = vi.fn(() => undefined)
    const toWorkspaceCandidate = vi.fn(
      (candidate: VacancyCandidatesItemResponse, vacancy: VacancyResponse): WorkspaceCandidate => ({
        id: candidate.candidateId,
        name: candidate.publicAlias,
        position: '',
        orderId: vacancy.orderId,
        source: 'Отклик',
        rating: '—',
        statusLabel: 'Pool',
        statusTone: 'default',
        comment: '',
      }),
    )
    const toWorkspaceBaseCandidate = vi.fn(
      (candidate: VacancyBaseCandidatesItemResponse, vacancy: VacancyResponse): WorkspaceCandidate => ({
        id: candidate.candidateId,
        name: candidate.publicAlias,
        position: '',
        orderId: vacancy.orderId,
        source: 'База',
        rating: '—',
        statusLabel: 'Pool',
        statusTone: 'default',
        comment: '',
      }),
    )

    const { result } = renderHook(() =>
      useSyncExecutorGlobalCandidates({
        loadVacancyBaseCandidates,
        loadVacancyCandidates,
        role: 'Executor',
        setExecutorGlobalBaseCandidates,
        setExecutorGlobalCandidates,
        toWorkspaceBaseCandidate,
        toWorkspaceCandidate,
        vacanciesResponse,
      }),
    )

    await waitFor(() => expect(loadVacancyCandidates).toHaveBeenCalledOnce())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(loadVacancyCandidates).toHaveBeenCalledWith({ vacancyId: 'published-vacancy' })
    expect(loadVacancyBaseCandidates).toHaveBeenCalledOnce()
    expect(loadVacancyBaseCandidates).toHaveBeenCalledWith({ vacancyId: 'published-vacancy' })
    expect(result.current.isError).toBe(false)
    expect(setExecutorGlobalCandidates).toHaveBeenLastCalledWith([])
    expect(setExecutorGlobalBaseCandidates).toHaveBeenLastCalledWith([])
  })

  it('refetches and updates the local candidate aggregate when retried', async () => {
    const vacancy: VacancyResponse = {
      id: 'published-vacancy',
      orderId: 'published-order',
      customerId: 'customer-1',
      executorId: 'executor-1',
      title: 'Опубликованная вакансия',
      description: '',
      status: 'Published',
      createdAtUtc: '2026-11-15T10:00:00Z',
      updatedAtUtc: '2026-11-15T10:00:00Z',
    }
    const candidate: VacancyCandidatesItemResponse = {
      vacancyCandidateId: 'vacancy-candidate-1',
      candidateId: 'candidate-added-from-base',
      publicAlias: 'Кандидат № 42',
      displayName: 'Имя кандидата',
      source: 'AddedByExecutor',
      isOwnedByRequester: true,
      isAnonymized: false,
      isCustomerSubmitted: false,
      stage: 'Pool',
      addedAtUtc: '2026-11-18T10:00:00Z',
      updatedAtUtc: '2026-11-18T10:00:00Z',
      isSelected: false,
    }
    const shortlistCandidate: VacancyCandidatesItemResponse = {
      ...candidate,
      vacancyCandidateId: 'vacancy-candidate-2',
      candidateId: 'candidate-shortlisted',
      publicAlias: 'Кандидат № 43',
      displayName: 'Имя кандидата 2',
      stage: 'Shortlist',
      updatedAtUtc: '2026-11-18T11:00:00Z',
    }
    let candidateFetchCount = 0
    const loadVacancyCandidates = vi.fn(() => {
      candidateFetchCount += 1
      const items = candidateFetchCount > 1 ? [candidate, shortlistCandidate] : []
      return { unwrap: () => Promise.resolve({ items }) }
    })
    const loadVacancyBaseCandidates = vi.fn(() => ({ unwrap: () => Promise.resolve({ items: [] }) }))
    const setExecutorGlobalCandidates = vi.fn(() => undefined)
    const setExecutorGlobalBaseCandidates = vi.fn(() => undefined)
    const toWorkspaceCandidate = vi.fn(
      (item: VacancyCandidatesItemResponse, project: VacancyResponse): WorkspaceCandidate => ({
        id: item.candidateId,
        name: item.publicAlias,
        position: '',
        orderId: project.orderId,
        source: 'Отклик',
        rating: '—',
        stage: item.stage,
        statusLabel: item.stage === 'Shortlist' ? 'В коротком списке' : 'В рабочем списке',
        statusTone: item.stage === 'Shortlist' ? 'default' : 'warning',
        comment: '',
      }),
    )
    const toWorkspaceBaseCandidate = vi.fn(
      (item: VacancyBaseCandidatesItemResponse, project: VacancyResponse): WorkspaceCandidate => ({
        id: item.candidateId,
        name: item.publicAlias,
        position: '',
        orderId: project.orderId,
        source: 'База',
        rating: '—',
        statusLabel: 'Pool',
        statusTone: 'default',
        comment: '',
      }),
    )
    const vacanciesResponse = { items: [vacancy] }

    const { result } = renderHook(() =>
      useSyncExecutorGlobalCandidates({
        loadVacancyBaseCandidates,
        loadVacancyCandidates,
        role: 'Executor',
        setExecutorGlobalBaseCandidates,
        setExecutorGlobalCandidates,
        toWorkspaceBaseCandidate,
        toWorkspaceCandidate,
        vacanciesResponse,
      }),
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(setExecutorGlobalCandidates).toHaveBeenLastCalledWith([])

    result.current.retry()

    await waitFor(() => expect(loadVacancyCandidates).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(setExecutorGlobalCandidates).toHaveBeenLastCalledWith([
      expect.objectContaining({
        id: candidate.candidateId,
        name: candidate.publicAlias,
        orderId: vacancy.orderId,
        stage: 'Pool',
        statusLabel: 'В рабочем списке',
      }),
      expect.objectContaining({
        id: shortlistCandidate.candidateId,
        name: shortlistCandidate.publicAlias,
        orderId: vacancy.orderId,
        stage: 'Shortlist',
        statusLabel: 'В коротком списке',
      }),
    ])
  })
})
