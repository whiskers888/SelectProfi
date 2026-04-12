import type { UserRole } from '@/shared/api/profile'
import type { OrderResponse } from '@/shared/api/orders'
import type {
  VacancyBaseCandidatesItemResponse,
  VacancyCandidatesItemResponse,
} from '@/shared/api/candidates'
import type { VacancyResponse } from '@/shared/api/vacancies'
import type {
  WorkspaceCandidate,
  WorkspaceChatThread,
  WorkspaceDataset,
  WorkspaceOrder,
  WorkspaceRole,
  WorkspaceStat,
  WorkspaceView,
} from '../model/data'

type ProblemDetailsPayload = {
  detail?: string
  title?: string
}

export function createHeaderTitle(role: WorkspaceRole): string {
  if (role === 'Executor') {
    return 'Проекты и кандидаты'
  }

  if (role === 'Applicant') {
    return 'Отклики и коммуникации'
  }

  return 'Заказы и отклики'
}

export function createActionLabel(role: WorkspaceRole): string {
  if (role === 'Executor') {
    return 'Добавить кандидата'
  }

  if (role === 'Applicant') {
    return 'Добавить резюме'
  }

  return 'Создать заказ'
}

export function todayTimeLabel(): string {
  return new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function toWorkspaceRole(role: UserRole | null | undefined): WorkspaceRole | null {
  if (role === 'Customer' || role === 'Executor' || role === 'Applicant') {
    return role
  }

  return null
}

export function toRoleLabel(role: WorkspaceRole): string {
  if (role === 'Applicant') {
    return 'Соискатель'
  }

  if (role === 'Executor') {
    return 'Исполнитель'
  }

  return 'Заказчик'
}

export function toOrderCompanyLabel(description: string): string {
  const normalizedDescription = description.trim()
  if (!normalizedDescription) {
    return 'Компания не указана'
  }

  return normalizedDescription.length > 64
    ? `${normalizedDescription.slice(0, 61)}...`
    : normalizedDescription
}

export function toOrderUpdatedAtLabel(updatedAtUtc: string): string {
  const parsedDate = new Date(updatedAtUtc)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Обновлено недавно'
  }

  return `Обновлено ${parsedDate.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function toWorkspaceOrder(order: OrderResponse): WorkspaceOrder {
  const isArchived = Boolean(order.deletedAtUtc)
  const isPaused = order.status === 'Paused'
  const hasExecutor = Boolean(order.executorId)

  return {
    id: order.id,
    customerId: order.customerId,
    executorId: order.executorId ?? null,
    title: order.title,
    company: toOrderCompanyLabel(order.description),
    location: 'Локация не указана',
    priority: hasExecutor ? 'medium' : 'high',
    responses: 0,
    statusLabel: isArchived
      ? 'Архив'
      : isPaused
        ? 'На паузе'
        : hasExecutor
          ? 'Исполнитель назначен'
          : 'Ожидает назначения',
    statusTone: isArchived ? 'neutral' : isPaused ? 'danger' : hasExecutor ? 'success' : 'warning',
    updatedAt: toOrderUpdatedAtLabel(order.updatedAtUtc),
    isArchived,
    isPaused,
  }
}

export function toWorkspaceOrderFromVacancy(vacancy: VacancyResponse): WorkspaceOrder {
  const isPublished = vacancy.status === 'Published'
  const isOnApproval = vacancy.status === 'OnApproval'

  return {
    id: vacancy.orderId,
    customerId: vacancy.customerId,
    executorId: vacancy.executorId,
    title: vacancy.title,
    company: toOrderCompanyLabel(vacancy.description),
    location: 'Локация не указана',
    priority: isPublished ? 'medium' : 'high',
    responses: 0,
    statusLabel: isPublished ? 'Опубликована' : isOnApproval ? 'На согласовании' : 'Черновик',
    statusTone: isPublished ? 'success' : isOnApproval ? 'warning' : 'neutral',
    updatedAt: toOrderUpdatedAtLabel(vacancy.updatedAtUtc),
    isArchived: false,
    isPaused: false,
  }
}

function toCandidateStatusLabel(stage: VacancyCandidatesItemResponse['stage'], isSelected: boolean): string {
  if (isSelected) {
    return 'Выбран'
  }

  return stage === 'Shortlist' ? 'Shortlist' : 'Pool'
}

function toCandidateStatusTone(
  stage: VacancyCandidatesItemResponse['stage'],
  isSelected: boolean,
): WorkspaceCandidate['statusTone'] {
  if (isSelected) {
    return 'success'
  }

  return stage === 'Shortlist' ? 'default' : 'warning'
}

export function toWorkspaceCandidate(
  item: VacancyCandidatesItemResponse,
  vacancy: VacancyResponse,
): WorkspaceCandidate {
  return {
    id: item.candidateId,
    name: item.displayName || item.publicAlias,
    position: vacancy.title,
    orderId: vacancy.orderId,
    source: `Vacancy ${vacancy.id.slice(0, 8)}`,
    sourceType: item.source,
    isOwnedByRequester: item.isOwnedByRequester,
    isAnonymized: item.isAnonymized,
    rating: '—',
    statusLabel: toCandidateStatusLabel(item.stage, item.isSelected),
    statusTone: toCandidateStatusTone(item.stage, item.isSelected),
    comment: `Обновлено ${new Date(item.updatedAtUtc).toLocaleString('ru-RU')}`,
  }
}

export function toWorkspaceBaseCandidate(
  candidate: VacancyBaseCandidatesItemResponse,
  vacancy: VacancyResponse,
): WorkspaceCandidate {
  return {
    id: candidate.candidateId,
    name: candidate.displayName || candidate.publicAlias,
    position: vacancy.title,
    orderId: vacancy.orderId,
    source: `База Vacancy ${vacancy.id.slice(0, 8)}`,
    sourceType: candidate.source,
    isOwnedByRequester: candidate.isOwnedByRequester,
    isAnonymized: candidate.isAnonymized,
    rating: '—',
    statusLabel: '',
    statusTone: 'neutral',
    comment: `Обновлено ${new Date(candidate.updatedAtUtc).toLocaleString('ru-RU')}`,
  }
}

function isProblemDetailsPayload(value: unknown): value is ProblemDetailsPayload {
  return typeof value === 'object' && value !== null
}

export function getRequestErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return 'Не удалось выполнить запрос.'
  }

  const apiError = error as { status: number | string; data?: unknown }
  if (apiError.status === 'FETCH_ERROR') {
    return 'Не удалось установить соединение с сервером.'
  }

  if (apiError.status === 401) {
    return 'Требуется авторизация.'
  }

  if (typeof apiError.status === 'number' && isProblemDetailsPayload(apiError.data)) {
    return apiError.data.detail ?? apiError.data.title ?? 'Не удалось выполнить запрос.'
  }

  return 'Не удалось выполнить запрос.'
}

type DashboardStatsSnapshot = {
  activeProjectsCount: number
  onApprovalVacanciesCount: number
  pipelineCandidatesCount: number
  shortlistCandidatesCount: number
}

type DeriveWorkspaceViewStateInput = {
  activeView: WorkspaceView
  analyticsRecovered: boolean
  baseOrders: WorkspaceOrder[]
  canLoadExecutorBaseCandidates: boolean
  canLoadServerCandidates: boolean
  canLoadServerOrders: boolean
  candidateSourceVacancy: VacancyResponse | null
  dataset: WorkspaceDataset
  executorDashboardStats?: DashboardStatsSnapshot
  executorGlobalBaseCandidates: WorkspaceCandidate[]
  executorGlobalCandidates: WorkspaceCandidate[]
  isOrdersFetching: boolean
  isVacancyCandidatesError: boolean
  isVacancyCandidatesFetching: boolean
  locationSearch: string
  manualCandidates: WorkspaceCandidate[]
  orderFilter: 'all' | 'active' | 'paused'
  ordersResponseExists: boolean
  preferredChatId: string | null
  preferredOrderId: string | null
  purchasedCandidateIds: string[]
  role: WorkspaceRole
  searchValue: string
  serverBaseCandidates: WorkspaceCandidate[]
  serverCandidates: WorkspaceCandidate[]
  threads: WorkspaceChatThread[]
  vacanciesResponseExists: boolean
  vacancyCandidatesItems: VacancyCandidatesItemResponse[] | null
  customerDashboardStats?: DashboardStatsSnapshot
}

type DeriveWorkspaceViewStateResult = {
  activeThread: WorkspaceChatThread | null
  allBaseCandidates: WorkspaceCandidate[]
  allCandidates: WorkspaceCandidate[]
  allOrders: WorkspaceOrder[]
  analyticsError: string | null
  baseCandidates: WorkspaceCandidate[]
  candidateViewOrders: WorkspaceOrder[]
  candidateViewSelectedOrderId: string | null
  counters: Partial<Record<WorkspaceView, number>>
  executorBaseCandidates: WorkspaceCandidate[]
  executorMyCandidates: WorkspaceCandidate[]
  filteredBaseCandidates: WorkspaceCandidate[]
  filteredCandidates: WorkspaceCandidate[]
  filteredOrders: WorkspaceOrder[]
  filteredThreads: WorkspaceChatThread[]
  isCandidatesApiLoading: boolean
  isDetailsPageOpen: boolean
  isOrdersApiLoading: boolean
  isSelectedCandidatePurchased: boolean
  isStandaloneOrderDetailsOpen: boolean
  runtimeStats: WorkspaceStat[]
  selectedCandidate: WorkspaceCandidate | null
  selectedOrder: WorkspaceOrder | null
  selectedOrderId: string | null
}

export function deriveWorkspaceViewState({
  activeView,
  analyticsRecovered,
  baseOrders,
  canLoadExecutorBaseCandidates,
  canLoadServerCandidates,
  canLoadServerOrders,
  candidateSourceVacancy,
  dataset,
  executorDashboardStats,
  executorGlobalBaseCandidates,
  executorGlobalCandidates,
  isOrdersFetching,
  isVacancyCandidatesError,
  isVacancyCandidatesFetching,
  locationSearch,
  manualCandidates,
  orderFilter,
  ordersResponseExists,
  preferredChatId,
  preferredOrderId,
  purchasedCandidateIds,
  role,
  searchValue,
  serverBaseCandidates,
  serverCandidates,
  threads,
  vacanciesResponseExists,
  vacancyCandidatesItems,
  customerDashboardStats,
}: DeriveWorkspaceViewStateInput): DeriveWorkspaceViewStateResult {
  const analyticsError = analyticsRecovered ? null : dataset.analyticsError ?? null
  const hasExecutorVacancies = role === 'Executor' && vacanciesResponseExists
  const executorCandidatesForUi = hasExecutorVacancies ? executorGlobalCandidates : []
  const executorBaseCandidatesForUi = hasExecutorVacancies ? executorGlobalBaseCandidates : []
  const baseCandidates =
    role === 'Executor'
      ? vacanciesResponseExists
        ? executorCandidatesForUi
        : dataset.candidates
      : !canLoadServerCandidates
        ? dataset.candidates
        : !vacanciesResponseExists
          ? dataset.candidates
          : !candidateSourceVacancy
            ? []
            : vacancyCandidatesItems
              ? serverCandidates
              : isVacancyCandidatesError
                ? dataset.candidates
                : []
  const isOrdersApiLoading = canLoadServerOrders && !ordersResponseExists && isOrdersFetching
  const isCandidatesApiLoading =
    role === 'Executor'
      ? false
      : canLoadServerCandidates && !vacancyCandidatesItems && isVacancyCandidatesFetching

  const allOrders = baseOrders
  const allCandidates = [...manualCandidates, ...baseCandidates]
  const allBaseCandidates =
    role === 'Executor'
      ? executorBaseCandidatesForUi
      : canLoadExecutorBaseCandidates
        ? serverBaseCandidates
        : []
  const normalizedSearch = searchValue.trim().toLowerCase()

  const filteredOrders = allOrders.filter((order) => {
    if (activeView !== 'dashboard' && order.isArchived) {
      return false
    }

    const matchesFilter =
      orderFilter === 'all' ||
      (orderFilter === 'active' && order.statusTone !== 'danger') ||
      (orderFilter === 'paused' && order.statusTone === 'danger')

    if (!matchesFilter) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    return (
      order.title.toLowerCase().includes(normalizedSearch) ||
      order.company.toLowerCase().includes(normalizedSearch) ||
      order.location.toLowerCase().includes(normalizedSearch)
    )
  })

  const orderTitleById = new Map(allOrders.map((order) => [order.id, order.title]))

  const filteredCandidates = allCandidates.filter((candidate) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      candidate.name.toLowerCase().includes(normalizedSearch) ||
      candidate.position.toLowerCase().includes(normalizedSearch) ||
      candidate.source.toLowerCase().includes(normalizedSearch) ||
      (orderTitleById.get(candidate.orderId) ?? '').toLowerCase().includes(normalizedSearch)
    )
  })
  const filteredBaseCandidates = allBaseCandidates.filter((candidate) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      candidate.name.toLowerCase().includes(normalizedSearch) ||
      candidate.position.toLowerCase().includes(normalizedSearch) ||
      candidate.source.toLowerCase().includes(normalizedSearch) ||
      (orderTitleById.get(candidate.orderId) ?? '').toLowerCase().includes(normalizedSearch)
    )
  })
  const executorMyCandidates = filteredCandidates.filter(
    (candidate) =>
      candidate.isOwnedByRequester === true || purchasedCandidateIds.includes(candidate.id),
  )
  const executorBaseCandidates = filteredBaseCandidates.filter(
    (candidate) =>
      candidate.isOwnedByRequester !== true && !purchasedCandidateIds.includes(candidate.id),
  )

  const selectedOrderId =
    filteredOrders.find((order) => order.id === preferredOrderId)?.id ??
    filteredOrders[0]?.id ??
    null
  const detailParams = new URLSearchParams(locationSearch)
  const selectedOrderIdFromUrl = detailParams.get('orderId')
  const selectedCandidateIdFromUrl = detailParams.get('candidateId')
  const selectedOrder = allOrders.find((order) => order.id === selectedOrderIdFromUrl) ?? null

  const knownCandidates = [...allCandidates, ...allBaseCandidates]
  const selectedCandidate =
    knownCandidates.find((candidate) => candidate.id === selectedCandidateIdFromUrl) ?? null
  const isSelectedCandidatePurchased =
    selectedCandidate ? purchasedCandidateIds.includes(selectedCandidate.id) : false
  const candidateViewOrders = allOrders.filter((order) => !order.isArchived)
  const candidateViewSelectedOrderId =
    candidateViewOrders.find((order) => order.id === preferredOrderId)?.id ??
    candidateViewOrders[0]?.id ??
    null

  const filteredThreads = threads.filter((thread) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      thread.participant.toLowerCase().includes(normalizedSearch) ||
      thread.preview.toLowerCase().includes(normalizedSearch)
    )
  })

  const activeThread =
    filteredThreads.find((thread) => thread.id === preferredChatId) ?? filteredThreads[0] ?? null
  const candidatesCounter =
    role === 'Customer' && candidateSourceVacancy && vacancyCandidatesItems
      ? vacancyCandidatesItems.filter((item) => !item.viewedByCustomerAtUtc).length
      : filteredCandidates.length

  const counters: Partial<Record<WorkspaceView, number>> = {
    dashboard: dataset.meetings.length,
    orders: filteredOrders.length,
    candidates: candidatesCounter,
    meetings: dataset.meetings.length,
    chats: filteredThreads.reduce((sum, thread) => sum + thread.unread, 0),
  }
  const runtimeStats: WorkspaceStat[] =
    role === 'Executor'
      ? [
          {
            id: 'projects',
            label: 'Проекты в работе',
            value: String(executorDashboardStats?.activeProjectsCount ?? 0),
            note: `${executorDashboardStats?.onApprovalVacanciesCount ?? 0} на этапе согласования`,
            tone: 'default',
          },
          {
            id: 'pipeline',
            label: 'Кандидаты в пайплайне',
            value: String(executorDashboardStats?.pipelineCandidatesCount ?? 0),
            note: '',
            tone: 'warning',
          },
          {
            id: 'shortlist',
            label: 'Отправлено в short-list',
            value: String(executorDashboardStats?.shortlistCandidatesCount ?? 0),
            note: '',
            tone: 'success',
          },
        ]
      : role === 'Customer'
        ? [
            {
              id: 'projects',
              label: 'Проекты в работе',
              value: String(customerDashboardStats?.activeProjectsCount ?? 0),
              note: `${customerDashboardStats?.onApprovalVacanciesCount ?? 0} на этапе согласования`,
              tone: 'default',
            },
            {
              id: 'pipeline',
              label: 'Кандидаты в пайплайне',
              value: String(customerDashboardStats?.pipelineCandidatesCount ?? 0),
              note: '',
              tone: 'warning',
            },
            {
              id: 'shortlist',
              label: 'Отправлено в short-list',
              value: String(customerDashboardStats?.shortlistCandidatesCount ?? 0),
              note: '',
              tone: 'success',
            },
          ]
        : dataset.stats
  const isStandaloneOrderDetailsOpen = Boolean(selectedOrder) && activeView !== 'orders'
  const isDetailsPageOpen = Boolean(selectedCandidate) || isStandaloneOrderDetailsOpen

  return {
    activeThread,
    allBaseCandidates,
    allCandidates,
    allOrders,
    analyticsError,
    baseCandidates,
    candidateViewOrders,
    candidateViewSelectedOrderId,
    counters,
    executorBaseCandidates,
    executorMyCandidates,
    filteredBaseCandidates,
    filteredCandidates,
    filteredOrders,
    filteredThreads,
    isCandidatesApiLoading,
    isDetailsPageOpen,
    isOrdersApiLoading,
    isSelectedCandidatePurchased,
    isStandaloneOrderDetailsOpen,
    runtimeStats,
    selectedCandidate,
    selectedOrder,
    selectedOrderId,
  }
}
