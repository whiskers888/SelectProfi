import type { UserRole } from '@/shared/api/profile'
import type { OrderResponse } from '@/shared/api/orders'
import type {
  VacancyBaseCandidatesItemResponse,
  VacancyCandidatesItemResponse,
} from '@/shared/api/candidates'
import type { VacancyResponse } from '@/shared/api/vacancies'
import type {
  ApplicantDashboardStatsResponse,
  CustomerDashboardStatsResponse,
  ExecutorDashboardStatsResponse,
} from '@/shared/api/dashboard'
import type {
  WorkspaceCandidate,
  WorkspaceChatThread,
  WorkspaceMeeting,
  WorkspaceOrder,
  WorkspaceRole,
  WorkspaceStat,
  WorkspaceTone,
  WorkspaceView,
} from '../model/data'

type ProblemDetailsPayload = {
  detail?: string
  title?: string
}

export function createHeaderTitle(role: WorkspaceRole): string {
  if (role === 'Executor') {
    return 'Проекты'
  }

  if (role === 'Applicant') {
    return 'Отклики и коммуникации'
  }

  return 'Заказы'
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

function toPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
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
    price: order.price,
    grossAmount: order.grossAmount,
    serviceCommissionPercent: order.serviceCommissionPercent,
    serviceCommissionAmount: order.serviceCommissionAmount,
    executorNetAmount: order.executorNetAmount,
    isPricingLocked: order.isPricingLocked,
    title: order.title,
    company: order.customerCompanyName?.trim() || 'Компания не указана',
    location: order.location,
    employeeCompensation: order.employeeCompensation,
    functional: order.functional,
    requirements: order.requirements,
    otherConditions: order.otherConditions,
    priority: hasExecutor ? 'medium' : 'high',
    responses: 0,
    statusLabel: isArchived
      ? 'Архив'
      : isPaused
        ? 'На паузе'
        : hasExecutor
          ? 'В работе'
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
    price: null,
    grossAmount: null,
    serviceCommissionPercent: null,
    serviceCommissionAmount: null,
    executorNetAmount: null,
    isPricingLocked: false,
    title: vacancy.title,
    // The vacancy contract has no company field; the description is the vacancy text, not a company name.
    company: 'Компания не указана',
    location: '',
    employeeCompensation: '',
    functional: toPlainText(vacancy.description),
    requirements: '',
    otherConditions: '',
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

export function updateWorkspaceCandidateStage(
  candidates: WorkspaceCandidate[],
  orderId: string,
  candidateId: string,
  stage: 'Pool' | 'Shortlist',
): WorkspaceCandidate[] {
  return candidates.map((candidate) => {
    if (candidate.orderId !== orderId || candidate.id !== candidateId) {
      return candidate
    }

    return {
      ...candidate,
      statusLabel: stage,
      statusTone: stage === 'Shortlist' ? 'default' : 'warning',
    }
  })
}

export function toWorkspaceCandidate(
  item: VacancyCandidatesItemResponse,
  vacancy: VacancyResponse,
  usePublicAlias = false,
): WorkspaceCandidate {
  return {
    id: item.candidateId,
    name: usePublicAlias ? item.publicAlias : item.displayName || item.publicAlias,
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

function formatCurrencyAmount(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: currencyCode }).format(amount)
  } catch {
    return `${amount.toLocaleString('ru-RU')} ${currencyCode}`
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

function resolveCandidateFlowTone(count: number): WorkspaceTone {
  if (count <= 0) {
    return 'default'
  }

  if (count < 3) {
    return 'warning'
  }

  return 'success'
}

function resolveIncomingFromExecutorTone(count: number): WorkspaceTone {
  if (count <= 0) {
    return 'default'
  }

  return 'warning'
}

function resolveIncomingFromExecutorNote(count: number): string {
  if (count > 1) {
    return 'Есть новые кандидаты, стоит проверить их.'
  }

  if (count === 1) {
    return 'Есть новый кандидат, стоит проверить.'
  }

  return 'Новых кандидатов от исполнителя пока нет.'
}

type DeriveWorkspaceViewStateInput = {
  activeView: WorkspaceView;
  analyticsError?: string | null;
  baseOrders: WorkspaceOrder[];
  canLoadExecutorBaseCandidates: boolean;
  canLoadServerCandidates: boolean;
  canLoadServerOrders: boolean;
  candidateSourceVacancy: VacancyResponse | null;
  executorDashboardStats?: ExecutorDashboardStatsResponse;
  executorGlobalBaseCandidates: WorkspaceCandidate[];
  executorGlobalCandidates: WorkspaceCandidate[];
  fallbackCandidates: WorkspaceCandidate[];
  fallbackMeetings: WorkspaceMeeting[];
  fallbackStats: WorkspaceStat[];
  isOrdersFetching: boolean;
  isVacancyCandidatesError: boolean;
  isVacancyCandidatesFetching: boolean;
  locationSearch: string;
  manualCandidates: WorkspaceCandidate[];
  meetings: WorkspaceMeeting[];
  ordersResponseExists: boolean;
  preferredChatId: string | null;
  preferredOrderId: string | null;
  purchasedCandidateIds: string[];
  role: WorkspaceRole;
  searchValue: string;
  serverBaseCandidates: WorkspaceCandidate[];
  serverCandidates: WorkspaceCandidate[];
  threads: WorkspaceChatThread[];
  vacanciesResponseExists: boolean;
  vacancyCandidatesItems: VacancyCandidatesItemResponse[] | null;
  applicantDashboardStats?: ApplicantDashboardStatsResponse;
  customerDashboardStats?: CustomerDashboardStatsResponse;
};

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
  executorDashboardCandidates: WorkspaceCandidate[]
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
  analyticsError,
  baseOrders,
  canLoadExecutorBaseCandidates,
  canLoadServerCandidates,
  canLoadServerOrders,
  candidateSourceVacancy,
  applicantDashboardStats,
  executorDashboardStats,
  executorGlobalBaseCandidates,
  executorGlobalCandidates,
  fallbackCandidates = [],
  fallbackMeetings = [],
  fallbackStats = [],
  isOrdersFetching,
  isVacancyCandidatesError,
  isVacancyCandidatesFetching,
  locationSearch,
  manualCandidates = [],
  meetings = [],
  ordersResponseExists,
  preferredChatId,
  preferredOrderId,
  purchasedCandidateIds,
  role,
  searchValue,
  serverBaseCandidates = [],
  serverCandidates = [],
  threads = [],
  vacanciesResponseExists,
  vacancyCandidatesItems,
  customerDashboardStats,
}: DeriveWorkspaceViewStateInput): DeriveWorkspaceViewStateResult {
  const resolvedAnalyticsError = analyticsError ?? null;

  const hasExecutorVacancies = role === 'Executor' && vacanciesResponseExists;
  const executorCandidatesForUi = hasExecutorVacancies ? executorGlobalCandidates : [];
  const executorBaseCandidatesForUi = hasExecutorVacancies ? executorGlobalBaseCandidates : [];

  let baseCandidates: WorkspaceCandidate[];
  if (role === 'Executor') {
    baseCandidates = vacanciesResponseExists ? executorCandidatesForUi : fallbackCandidates;
  } else if (!canLoadServerCandidates) {
    baseCandidates = fallbackCandidates;
  } else if (!vacanciesResponseExists) {
    baseCandidates = fallbackCandidates;
  } else if (!candidateSourceVacancy) {
    baseCandidates = [];
  } else if (vacancyCandidatesItems) {
    baseCandidates = serverCandidates ?? [];
  } else if (isVacancyCandidatesError) {
    baseCandidates = fallbackCandidates ?? [];
  } else {
    baseCandidates = [];
  }

  const isOrdersApiLoading = canLoadServerOrders && !ordersResponseExists && isOrdersFetching;
  const isCandidatesApiLoading = role !== 'Executor' && canLoadServerCandidates && !vacancyCandidatesItems && isVacancyCandidatesFetching;

  const allOrders = baseOrders;
  const allCandidates = role === 'Customer' ? baseCandidates : [...manualCandidates, ...baseCandidates];
  const allBaseCandidates = role === 'Executor'
    ? executorBaseCandidatesForUi
    : canLoadExecutorBaseCandidates
      ? serverBaseCandidates
      : [];

  const normalizedSearch = searchValue.trim().toLowerCase();

  const filteredOrders = allOrders.filter((order) => {
    if (activeView !== 'dashboard' && order.isArchived) return false;
    if (!normalizedSearch) return true;
    return (
      order.title.toLowerCase().includes(normalizedSearch) ||
      order.company.toLowerCase().includes(normalizedSearch) ||
      order.location.toLowerCase().includes(normalizedSearch)
    );
  });

  const orderTitleById = new Map(allOrders.map(order => [order.id, order.title]));

  const filteredCandidates = allCandidates.filter(candidate => {
    if (!normalizedSearch) return true;
    return (
      candidate.name.toLowerCase().includes(normalizedSearch) ||
      candidate.position.toLowerCase().includes(normalizedSearch) ||
      candidate.source.toLowerCase().includes(normalizedSearch) ||
      (orderTitleById.get(candidate.orderId) ?? '').toLowerCase().includes(normalizedSearch)
    );
  });

  const customerShortlistCandidates = role === 'Customer'
    ? filteredCandidates.filter(candidate => {
        const stage = candidate.statusLabel.trim().toLowerCase()
        return stage === 'shortlist' || stage === 'выбран'
      })
    : filteredCandidates;

  const filteredBaseCandidates = allBaseCandidates.filter(candidate => {
    if (!normalizedSearch) return true;
    return (
      candidate.name.toLowerCase().includes(normalizedSearch) ||
      candidate.position.toLowerCase().includes(normalizedSearch) ||
      candidate.source.toLowerCase().includes(normalizedSearch) ||
      (orderTitleById.get(candidate.orderId) ?? '').toLowerCase().includes(normalizedSearch)
    );
  });

  const executorMyCandidates = filteredCandidates.filter(candidate =>
    candidate.isOwnedByRequester === true || purchasedCandidateIds.includes(candidate.id)
  );
  const executorDashboardCandidates = executorCandidatesForUi.filter(candidate => {
    const stage = candidate.statusLabel.trim().toLowerCase();
    if (stage !== 'pool' && stage !== 'shortlist' && stage !== 'выбран') {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      candidate.name.toLowerCase().includes(normalizedSearch) ||
      candidate.position.toLowerCase().includes(normalizedSearch) ||
      candidate.source.toLowerCase().includes(normalizedSearch) ||
      (orderTitleById.get(candidate.orderId) ?? '').toLowerCase().includes(normalizedSearch)
    );
  });
  const executorBaseCandidates = filteredBaseCandidates.filter(candidate =>
    candidate.isOwnedByRequester !== true && !purchasedCandidateIds.includes(candidate.id)
  );

  const selectedOrderId = filteredOrders.find(order => order.id === preferredOrderId)?.id ?? filteredOrders[0]?.id ?? null;
  const detailParams = new URLSearchParams(locationSearch);
  const selectedOrderIdFromUrl = detailParams.get('orderId');
  const selectedCandidateIdFromUrl = detailParams.get('candidateId');
  const selectedOrder = allOrders.find(order => order.id === selectedOrderIdFromUrl) ?? null;

  const knownCandidates = [...allCandidates, ...allBaseCandidates];
  const selectedCandidate = knownCandidates.find(candidate => candidate.id === selectedCandidateIdFromUrl) ?? null;
  const isSelectedCandidatePurchased = selectedCandidate ? purchasedCandidateIds.includes(selectedCandidate.id) : false;

  const candidateViewOrders = allOrders.filter(order => !order.isArchived);
  const candidateViewSelectedOrderId = candidateViewOrders.find(order => order.id === preferredOrderId)?.id ?? candidateViewOrders[0]?.id ?? null;

  const filteredThreads = threads.filter(thread => {
    if (!normalizedSearch) return true;
    return thread.participant.toLowerCase().includes(normalizedSearch) ||
      thread.preview.toLowerCase().includes(normalizedSearch);
  });

  const activeThread = filteredThreads.find(thread => thread.id === preferredChatId) ?? filteredThreads[0] ?? null;

  const candidatesCounter = role === 'Customer'
    ? customerShortlistCandidates.length
    : filteredCandidates.length;

  const meetingsList = meetings ?? fallbackMeetings ?? [];

  const counters: Partial<Record<WorkspaceView, number>> = {
    dashboard:
      role === 'Applicant'
        ? (applicantDashboardStats?.applicationsCount ?? 0)
        : role === 'Executor'
          ? (executorDashboardStats?.activeProjectsCount ?? 0)
          : (customerDashboardStats?.activeProjectsCount ?? 0),
    orders: filteredOrders.length,
    candidates: candidatesCounter,
    meetings: meetingsList.length,
    chats: filteredThreads.reduce((sum, thread) => sum + thread.unread, 0),
  };

  let runtimeStats: WorkspaceStat[];
  if (role === 'Executor' && executorDashboardStats) {
    runtimeStats = [
      {
        id: 'projects',
        label: 'Проекты в работе',
        value: String(executorDashboardStats?.activeProjectsCount ?? 0),
        note: `${executorDashboardStats?.onApprovalVacanciesCount ?? 0} проектов на согласовании`,
        tone: 'default',
      },
      {
        id: 'pipeline',
        label: 'Кандидаты в работе',
        value: `${executorDashboardStats?.pipelineCandidatesCount ?? 0} чел.`,
        note: 'Отклики на вакансии и кандидаты, добавленные вами.',
        tone: resolveCandidateFlowTone(executorDashboardStats?.pipelineCandidatesCount ?? 0),
      },
      {
        id: 'shortlist',
        label: 'Финалисты',
        value: `${executorDashboardStats?.shortlistCandidatesCount ?? 0} чел.`,
        note: '',
        tone: resolveCandidateFlowTone(executorDashboardStats?.shortlistCandidatesCount ?? 0),
      },
      {
        id: 'balance',
        label: 'Доступно к получению',
        value: formatCurrencyAmount(
          executorDashboardStats.availableBalance,
          executorDashboardStats.currencyCode,
        ),
        note: `В резерве: ${formatCurrencyAmount(
          executorDashboardStats.reservedBalance,
          executorDashboardStats.currencyCode,
        )}`,
        tone: 'default',
      },
    ];
  } else if (role === 'Customer' && customerDashboardStats) {
    runtimeStats = [
      {
        id: 'projects',
        label: 'Заказы в работе',
        value: String(customerDashboardStats?.activeProjectsCount ?? 0),
        note: '',
        tone: 'default',
      },
      {
        id: 'pipeline',
        label: 'Кандидаты на рассмотрении',
        value: `${customerDashboardStats?.pipelineCandidatesCount ?? 0} чел.`,
        note: 'Кандидаты ожидают вашего финального решения, выберете одного из них.',
        tone: resolveCandidateFlowTone(customerDashboardStats?.pipelineCandidatesCount ?? 0),
      },
      {
        id: 'shortlist',
        label: 'Получено новых кандидатов',
        value: `${customerDashboardStats?.shortlistCandidatesCount ?? 0} чел.`,
        note: resolveIncomingFromExecutorNote(customerDashboardStats?.shortlistCandidatesCount ?? 0),
        tone: resolveIncomingFromExecutorTone(customerDashboardStats?.shortlistCandidatesCount ?? 0),
      },
      {
        id: 'balance',
        label: 'Доступный баланс',
        value: formatCurrencyAmount(
          customerDashboardStats.availableBalance,
          customerDashboardStats.currencyCode,
        ),
        note: `Зарезервировано в эскроу: ${formatCurrencyAmount(
          customerDashboardStats.reservedBalance,
          customerDashboardStats.currencyCode,
        )}`,
        tone: 'default',
      },
    ];
  } else if (role === 'Applicant' && applicantDashboardStats) {
    runtimeStats = [
      {
        id: 'applications',
        label: 'Мои отклики',
        value: `${applicantDashboardStats.applicationsCount} шт.`,
        note: applicantDashboardStats.resumeTitle
          ? `Резюме: ${applicantDashboardStats.resumeTitle}`
          : 'Резюме не заполнено',
        tone: 'default',
      },
      {
        id: 'shortlist',
        label: 'В shortlist',
        value: `${applicantDashboardStats.shortlistCandidatesCount} шт.`,
        note: 'Отклики, перешедшие к следующему этапу.',
        tone: resolveCandidateFlowTone(applicantDashboardStats.shortlistCandidatesCount),
      },
      {
        id: 'notifications',
        label: 'Непрочитанные уведомления',
        value: String(applicantDashboardStats.unreadNotificationsCount),
        note: '',
        tone: applicantDashboardStats.unreadNotificationsCount > 0 ? 'warning' : 'neutral',
      },
    ];
  } else if (role === 'Applicant') {
    runtimeStats = []
  } else if (role === 'Customer') {
    runtimeStats = []
  } else if (role === 'Executor') {
    runtimeStats = []
  } else {
    runtimeStats = fallbackStats ?? [];
  }

  const isStandaloneOrderDetailsOpen = Boolean(selectedOrder) && activeView !== 'orders';
  const isDetailsPageOpen = Boolean(selectedCandidate) || isStandaloneOrderDetailsOpen;

  return {
    activeThread,
    allBaseCandidates,
    allCandidates,
    allOrders,
    analyticsError: resolvedAnalyticsError,
    baseCandidates,
    candidateViewOrders,
    candidateViewSelectedOrderId,
    counters,
    executorBaseCandidates,
    executorDashboardCandidates,
    executorMyCandidates,
    filteredBaseCandidates,
    filteredCandidates: customerShortlistCandidates,
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
  };
}
