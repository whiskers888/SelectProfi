import { describe, expect, it } from 'vitest'
import type { OrderResponse } from '@/shared/api/orders'
import type { VacancyBaseCandidatesItemResponse, VacancyCandidatesItemResponse } from '@/shared/api/candidates'
import type { VacancyResponse } from '@/shared/api/vacancies'
import {
  createActionLabel,
  createHeaderTitle,
  deriveWorkspaceViewState,
  formatExperienceYears,
  getWorkspaceCandidatePipelineStage,
  toWorkspaceBaseCandidate,
  toWorkspaceCandidate,
  toWorkspaceOrder,
  updateWorkspaceCandidateStage,
} from './workspaceShell.helpers'
import type { WorkspaceCandidate } from '../model/data'

const makeCandidate = (id: string, orderId: string): WorkspaceCandidate => ({
  id,
  name: `Candidate ${id}`,
  position: 'Developer',
  orderId,
  source: 'Test source',
  rating: '—',
  statusLabel: 'В рабочем списке',
  stage: 'Pool',
  statusTone: 'warning',
  comment: 'Original comment',
})

describe('formatExperienceYears', () => {
  it.each([
    { years: 1, expected: '1 год' },
    { years: 2, expected: '2 года' },
    { years: 3, expected: '3 года' },
    { years: 4, expected: '4 года' },
    { years: 5, expected: '5 лет' },
    { years: 11, expected: '11 лет' },
    { years: 21, expected: '21 год' },
    { years: 22, expected: '22 года' },
    { years: null, expected: '—' },
  ])('formats $years as $expected', ({ years, expected }) => {
    expect(formatExperienceYears(years)).toBe(expected)
  })
})

describe('createActionLabel', () => {
  it('uses an action supported by each role', () => {
    expect(createActionLabel('Applicant')).toBe('Найти вакансию')
    expect(createActionLabel('Executor')).toBe('Добавить кандидата')
    expect(createActionLabel('Customer')).toBe('Создать заказ')
  })
})

describe('updateWorkspaceCandidateStage', () => {
  it('updates the matching candidate and preserves its comment and other fields', () => {
    const candidate = makeCandidate('candidate-1', 'order-1')
    const updated = updateWorkspaceCandidateStage([candidate], 'order-1', 'candidate-1', 'Shortlist')

    expect(updated[0]).toEqual({
      ...candidate,
      stage: 'Shortlist',
      statusLabel: 'В списке кандидатов',
      statusTone: 'default',
    })
    expect(updated[0].comment).toBe('Original comment')
  })

  it('leaves the same candidate ID on a different order unchanged', () => {
    const candidate = makeCandidate('candidate-1', 'order-2')

    expect(updateWorkspaceCandidateStage([candidate], 'order-1', 'candidate-1', 'Shortlist')[0]).toBe(candidate)
  })

  it('leaves unrelated candidates unchanged', () => {
    const matching = makeCandidate('candidate-1', 'order-1')
    const unrelated = makeCandidate('candidate-2', 'order-1')
    const updated = updateWorkspaceCandidateStage([matching, unrelated], 'order-1', 'candidate-1', 'Shortlist')

    expect(updated[1]).toBe(unrelated)
    expect(updated[1]).toEqual(unrelated)
  })
})

describe('getWorkspaceCandidatePipelineStage', () => {
  it('uses the stored stage and keeps selected status separate from the label', () => {
    const poolCandidate = makeCandidate('candidate-pool', 'order-1')
    const shortlistCandidate = {
      ...poolCandidate,
      id: 'candidate-shortlist',
      stage: 'Shortlist' as const,
      statusLabel: 'В списке кандидатов',
    }
    const selectedCandidate = { ...shortlistCandidate, statusLabel: 'Выбран' }

    expect(getWorkspaceCandidatePipelineStage(poolCandidate)).toBe('Pool')
    expect(getWorkspaceCandidatePipelineStage(shortlistCandidate)).toBe('Shortlist')
    expect(getWorkspaceCandidatePipelineStage(selectedCandidate)).toBe('Selected')
    expect(getWorkspaceCandidatePipelineStage({ ...poolCandidate, statusLabel: '', stage: undefined })).toBeNull()
  })
})

describe('toWorkspaceOrder', () => {
  it('maps structured vacancy details without confusing company or salary with legacy fields', () => {
    const response: OrderResponse = {
      id: 'order-1',
      customerId: 'customer-1',
      executorId: null,
      title: 'Senior React Developer',
      description: 'Legacy description that is not a company',
      location: 'Москва / удалённо',
      employeeCompensation: '200 000–250 000 ₽ net',
      functional: 'Разработка продукта',
      requirements: 'React и TypeScript',
      otherConditions: 'ДМС и техника',
      specialization: 'Frontend',
      specializationId: 'specialization-1',
      price: 500000,
      grossAmount: 500000,
      serviceCommissionPercent: 15,
      serviceCommissionAmount: 75000,
      executorNetAmount: 425000,
      isPricingLocked: false,
      customerCompanyName: 'ООО Альфа',
      requestedCandidatesCount: 3,
      status: 'Active',
      createdAtUtc: '2026-07-23T10:00:00Z',
      updatedAtUtc: '2026-07-23T11:00:00Z',
      deletedAtUtc: null,
    }

    const order = toWorkspaceOrder(response)

    expect(order.company).toBe('ООО Альфа')
    expect(order.company).not.toBe(response.description)
    expect(order.employeeCompensation).toBe(response.employeeCompensation)
    expect(order.employeeCompensation).not.toBe(String(response.price))
    expect(order.location).toBe(response.location)
    expect(order.functional).toBe(response.functional)
    expect(order.requirements).toBe(response.requirements)
    expect(order.otherConditions).toBe(response.otherConditions)
    expect(order.grossAmount).toBe(500000)
    expect(order.executorNetAmount).toBe(425000)

    const completedOrder = toWorkspaceOrder({
      ...response,
      executorId: 'executor-1',
      status: 'Completed',
      dueDate: '2026-12-01',
      completedAtUtc: '2026-11-25T11:00:00Z',
    })
    expect(completedOrder.statusLabel).toBe('Выполнен')
    expect(completedOrder.dueDate).toBe('2026-12-01')
    expect(completedOrder.completedAtUtc).toBe('2026-11-25T11:00:00Z')
  })

  it('maps an assigned active order to the working status', () => {
    const response: OrderResponse = {
      id: 'order-2',
      customerId: 'customer-1',
      executorId: 'executor-1',
      title: 'Backend Developer',
      description: 'Description',
      location: 'Удалённо',
      employeeCompensation: '250 000 ₽',
      functional: 'Разработка',
      requirements: 'Опыт',
      otherConditions: 'ДМС',
      specialization: 'Backend',
      price: 100000,
      grossAmount: 100000,
      serviceCommissionPercent: 15,
      serviceCommissionAmount: 15000,
      executorNetAmount: 85000,
      isPricingLocked: true,
      customerCompanyName: 'ООО Альфа',
      requestedCandidatesCount: 3,
      status: 'Active',
      createdAtUtc: '2026-07-23T10:00:00Z',
      updatedAtUtc: '2026-07-23T11:00:00Z',
      deletedAtUtc: null,
    }

    expect(toWorkspaceOrder(response).statusLabel).toBe('В работе')
  })
})

describe('toWorkspaceCandidate', () => {
  it('uses the public alias for a Customer candidate even when the API also has a display name', () => {
    const vacancy: VacancyResponse = {
      id: 'vacancy-1',
      orderId: 'order-1',
      customerId: 'customer-1',
      executorId: 'executor-1',
      title: 'Frontend Developer',
      description: 'React and TypeScript',
      status: 'Published',
      createdAtUtc: '2026-07-23T10:00:00Z',
      updatedAtUtc: '2026-07-23T11:00:00Z',
    }
    const item: VacancyCandidatesItemResponse = {
      vacancyCandidateId: 'vacancy-candidate-1',
      candidateId: 'candidate-1',
      publicAlias: 'Кандидат № 42',
      displayName: 'Виктория Петрова',
      source: 'RegisteredUser',
      isOwnedByRequester: false,
      isAnonymized: true,
      isCustomerSubmitted: false,
      stage: 'Shortlist',
      addedAtUtc: '2026-07-23T10:00:00Z',
      updatedAtUtc: '2026-07-23T11:00:00Z',
      isSelected: false,
    }

    const candidate = toWorkspaceCandidate(item, vacancy, true)

    expect(candidate.name).toBe(item.publicAlias)
    expect(candidate.name).not.toBe(item.displayName)
    expect(candidate.isAnonymized).toBe(true)
    expect(candidate.position).toBeUndefined()
    expect(candidate.vacancyTitle).toBe(vacancy.title)
  })

  it('keeps base candidate vacancy context separate from candidate specialization', () => {
    const vacancy: VacancyResponse = {
      id: 'vacancy-1',
      orderId: 'order-1',
      customerId: 'customer-1',
      executorId: 'executor-1',
      title: 'Frontend Developer',
      description: 'React and TypeScript',
      status: 'Published',
      createdAtUtc: '2026-07-23T10:00:00Z',
      updatedAtUtc: '2026-07-23T11:00:00Z',
    }
    const item: VacancyBaseCandidatesItemResponse = {
      candidateId: 'candidate-1',
      publicAlias: 'Кандидат № 42',
      displayName: 'Виктория Петрова',
      source: 'AddedByExecutor',
      isOwnedByRequester: true,
      isAnonymized: false,
      experienceYears: 5,
      updatedAtUtc: '2026-07-23T11:00:00Z',
    }

    const candidate = toWorkspaceBaseCandidate(item, vacancy)

    expect(candidate.position).toBeUndefined()
    expect(candidate.vacancyTitle).toBe(vacancy.title)
  })
})

function deriveStats(role: 'Customer' | 'Executor') {
  const stats = {
    activeProjectsCount: 2,
    onApprovalVacanciesCount: 1,
    pipelineCandidatesCount: 4,
    shortlistCandidatesCount: 3,
    availableBalance: 0,
    reservedBalance: 0,
    currencyCode: 'RUB',
    unreadNotificationsCount: 0,
  }

  return deriveWorkspaceViewState({
    activeView: 'dashboard',
    baseOrders: [],
    canLoadExecutorBaseCandidates: false,
    canLoadServerCandidates: false,
    canLoadServerOrders: false,
    candidateSourceVacancy: null,
    customerDashboardStats: role === 'Customer' ? stats : undefined,
    executorDashboardStats: role === 'Executor' ? stats : undefined,
    executorGlobalBaseCandidates: [],
    executorGlobalCandidates: [],
    fallbackCandidates: [],
    fallbackMeetings: [],
    fallbackStats: [],
    isOrdersFetching: false,
    isVacancyCandidatesError: false,
    isVacancyCandidatesFetching: false,
    locationSearch: '',
    manualCandidates: [],
    meetings: [],
    ordersResponseExists: false,
    preferredChatId: null,
    preferredOrderId: null,
    role,
    searchValue: '',
    serverBaseCandidates: [],
    serverCandidates: [],
    threads: [],
    vacanciesResponseExists: false,
    vacancyCandidatesItems: null,
  }).runtimeStats
}

describe('dashboard stats wording', () => {
  it('uses executor wording for the executor', () => {
    const [projects, pipeline] = deriveStats('Executor')

    expect(projects.note).toBe('1 проектов на согласовании')
    expect(pipeline.label).toBe('Кандидаты в работе')
    expect(pipeline.note).toContain('Отклики на вакансии')
  })

  it('does not show the approval note to the customer', () => {
    const [projects] = deriveStats('Customer')

    expect(projects.note).not.toContain('согласовани')
    expect(createHeaderTitle('Customer')).toBe('Заказы')
  })
})
