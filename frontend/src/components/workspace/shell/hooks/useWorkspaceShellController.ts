import { skipToken } from '@reduxjs/toolkit/query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearAuthSession } from '@/app/authSessionSlice'
import { routePaths } from '@/app/routePaths'
import type { AppDispatch } from '@/app/store'
import { useNotifications } from '@/components/ui/useNotifications'
import { api } from '@/shared/api/generated/openapi'
import { useGetMyAuthInfoQuery } from '@/shared/api/auth'
import {
  useGetVacancyBaseCandidatesQuery,
  useGetVacancyCandidatesQuery,
  useLazyGetVacancyBaseCandidatesQuery,
  useLazyGetVacancyCandidatesQuery,
  useMarkVacancyCandidateViewedByCustomerMutation,
  useRespondToVacancyMutation,
  useUpdateVacancyCandidateStageMutation,
} from '@/shared/api/candidates'
import { useGetCustomerDashboardStatsQuery, useGetExecutorDashboardStatsQuery } from '@/shared/api/dashboard'
import {
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetMyOrderResponseQuery,
  useGetOrderResponsesQuery,
  useGetOrderSpecializationsQuery,
  useGetOrdersQuery,
  useRejectOrderResponseExecutorMutation,
  useRespondToOrderMutation,
  useSelectOrderResponseExecutorMutation,
  useUpdateOrderMutation,
} from '@/shared/api/orders'
import { useGetMyProfileQuery } from '@/shared/api/profile'
import {
  useCreateVacancyMutation,
  useGetVacanciesQuery,
  useUpdateVacancyMutation,
  useUpdateVacancyStatusMutation,
} from '@/shared/api/vacancies'
import {
  defaultWorkspaceRole,
  defaultWorkspaceView,
  type WorkspaceCandidate,
  type WorkspaceChatThread,
  type WorkspaceRole,
  type WorkspaceView,
  workspaceDataByRole,
} from '../../model/data'
import {
  useMarkCustomerViewedCandidate,
  useSyncExecutorGlobalCandidates,
} from './useWorkspaceCandidateEffects'
import { useWorkspaceCreateActions } from './useWorkspaceCreateActions'
import { useWorkspaceNavigation } from './useWorkspaceNavigation'
import { useWorkspaceOrderActions } from './useWorkspaceOrderActions'
import { useWorkspaceUiActions } from './useWorkspaceUiActions'
import {
  deriveWorkspaceViewState,
  getRequestErrorMessage,
  toRoleLabel,
  todayTimeLabel,
  toWorkspaceBaseCandidate,
  toWorkspaceCandidate,
  toWorkspaceOrder,
  toWorkspaceOrderFromVacancy,
  toWorkspaceRole,
} from '../workspaceShell.helpers'

type OrderFilter = 'all' | 'active' | 'paused'
const sidebarCollapsedStorageKey = 'workspace-sidebar-collapsed-v1'
const vacancyCreateDraftsStorageKey = 'workspace-vacancy-create-drafts-v1'
const applicantRespondedVacanciesStorageKey = 'workspace-applicant-responded-vacancies-v1'

type VacancyCreateDraft = {
  title: string
  description: string
  updatedAtUtc: string
}

type VacancyCreateDraftsMap = Record<string, VacancyCreateDraft>
type ApplicantRespondedVacanciesMap = Record<string, string[]>

function readInitialSidebarCollapsedState(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(sidebarCollapsedStorageKey) === '1'
  } catch {
    return false
  }
}

function makeVacancyCreateDraftKey(userId: string, orderId: string): string {
  return `${userId}:${orderId}`
}

function readVacancyCreateDraftsMap(): VacancyCreateDraftsMap {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(vacancyCreateDraftsStorageKey)
    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue) as VacancyCreateDraftsMap
    if (typeof parsedValue !== 'object' || parsedValue === null) {
      return {}
    }

    return parsedValue
  } catch {
    return {}
  }
}

function writeVacancyCreateDraftsMap(value: VacancyCreateDraftsMap): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(vacancyCreateDraftsStorageKey, JSON.stringify(value))
}

function readVacancyCreateDraft(userId: string, orderId: string): VacancyCreateDraft | null {
  const key = makeVacancyCreateDraftKey(userId, orderId)
  const draftsMap = readVacancyCreateDraftsMap()
  return draftsMap[key] ?? null
}

function saveVacancyCreateDraft(userId: string, orderId: string, formValues: { title: string; description: string }): void {
  const key = makeVacancyCreateDraftKey(userId, orderId)
  const draftsMap = readVacancyCreateDraftsMap()
  draftsMap[key] = {
    title: formValues.title,
    description: formValues.description,
    updatedAtUtc: new Date().toISOString(),
  }
  writeVacancyCreateDraftsMap(draftsMap)
}

function clearVacancyCreateDraft(userId: string, orderId: string): void {
  const key = makeVacancyCreateDraftKey(userId, orderId)
  const draftsMap = readVacancyCreateDraftsMap()
  if (!(key in draftsMap)) {
    return
  }

  delete draftsMap[key]
  writeVacancyCreateDraftsMap(draftsMap)
}

function readApplicantRespondedVacanciesMap(): ApplicantRespondedVacanciesMap {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(applicantRespondedVacanciesStorageKey)
    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue) as ApplicantRespondedVacanciesMap
    if (typeof parsedValue !== 'object' || parsedValue === null) {
      return {}
    }

    return parsedValue
  } catch {
    return {}
  }
}

function writeApplicantRespondedVacanciesMap(value: ApplicantRespondedVacanciesMap): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(applicantRespondedVacanciesStorageKey, JSON.stringify(value))
}

function readApplicantRespondedOrderIds(userId: string): string[] {
  const map = readApplicantRespondedVacanciesMap()
  const value = map[userId]
  return Array.isArray(value) ? value : []
}

function saveApplicantRespondedOrderIds(userId: string, orderIds: string[]): void {
  const map = readApplicantRespondedVacanciesMap()
  map[userId] = orderIds
  writeApplicantRespondedVacanciesMap(map)
}

export function useWorkspaceShellController() {
  const { notify } = useNotifications()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: profile } = useGetMyProfileQuery()
  const { data: authMe } = useGetMyAuthInfoQuery()
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()
  const [createVacancy, { isLoading: isCreatingVacancy }] = useCreateVacancyMutation()
  const [updateVacancy, { isLoading: isUpdatingVacancy }] = useUpdateVacancyMutation()
  const [updateVacancyStatus, { isLoading: isSendingVacancyToCustomer }] = useUpdateVacancyStatusMutation()
  const [updateOrder, { isLoading: isOrderStatusUpdating }] = useUpdateOrderMutation()
  const [deleteOrder, { isLoading: isDeletingOrder }] = useDeleteOrderMutation()
  const [respondToOrder, { isLoading: isRespondingToOrder }] = useRespondToOrderMutation()
  const [rejectOrderResponseExecutor, { isLoading: isRejectingOrderExecutor }] =
    useRejectOrderResponseExecutorMutation()
  const [selectOrderResponseExecutor, { isLoading: isSelectingOrderExecutor }] =
    useSelectOrderResponseExecutorMutation()
  const [markVacancyCandidateViewedByCustomer] = useMarkVacancyCandidateViewedByCustomerMutation()
  const [respondToVacancy, { isLoading: isRespondingToVacancy }] = useRespondToVacancyMutation()
  const [updateVacancyCandidateStage, { isLoading: isUpdatingApplicantResponderStage }] =
    useUpdateVacancyCandidateStageMutation()
  const [loadVacancyCandidates] = useLazyGetVacancyCandidatesQuery()
  const [loadVacancyBaseCandidates] = useLazyGetVacancyBaseCandidatesQuery()
  const [preferredOrderId, setPreferredOrderId] = useState<string | null>(null)
  const role = toWorkspaceRole(profile?.activeRole ?? profile?.role) ?? defaultWorkspaceRole
  const applicantRespondedOrderIds = useMemo(
    () => (role === 'Applicant' && authMe?.userId ? readApplicantRespondedOrderIds(authMe.userId) : []),
    [authMe?.userId, role],
  )
  const profileDisplayName =
    `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || authMe?.email || 'Пользователь'
  const profileEmail = profile?.email ?? authMe?.email ?? '—'
  const profileRoleLabel = toRoleLabel(role)
  const canManageOrder = authMe?.role === 'Customer' || authMe?.role === 'Admin'
  const dashboardRole = authMe?.role === 'Customer' || authMe?.role === 'Executor' ? authMe.role : null
  const dataset = workspaceDataByRole[role]
  const canLoadServerOrders = role !== 'Applicant'
  const {
    data: ordersResponse,
    isError: isOrdersError,
    isFetching: isOrdersFetching,
    refetch: refetchOrders,
  } = useGetOrdersQuery(
    canLoadServerOrders
      ? {
          limit: 100,
          includeArchived: true,
        }
      : skipToken,
  )
  const {
    data: orderSpecializationsResponse,
    isError: isOrderSpecializationsError,
    isFetching: isOrderSpecializationsLoading,
  } = useGetOrderSpecializationsQuery(role === 'Customer' ? undefined : skipToken)
  // @dvnull: Ранее форма заказа не имела данных справочника специализаций; добавлена загрузка и нормализация options для select.
  const orderSpecializationOptions = orderSpecializationsResponse?.items.map((item) => ({ id: item.id, name: item.name })) ?? []
  const { data: executorDashboardStats } = useGetExecutorDashboardStatsQuery(
    dashboardRole === 'Executor' ? undefined : skipToken,
  )
  const { data: customerDashboardStats } = useGetCustomerDashboardStatsQuery(
    dashboardRole === 'Customer' ? undefined : skipToken,
  )
  const canLoadServerVacancies = true
  const canLoadServerCandidates = role !== 'Applicant'
  const canLoadExecutorBaseCandidates = role === 'Executor'
  const { data: vacanciesResponse, refetch: refetchVacancies } = useGetVacanciesQuery(
    canLoadServerVacancies ? undefined : skipToken,
  )
  const applicantVacancyOrders =
    role === 'Applicant' && vacanciesResponse
      ? vacanciesResponse.items.map(toWorkspaceOrderFromVacancy)
      : []
  const serverOrders = ordersResponse?.items.map(toWorkspaceOrder) ?? []
  const baseOrders =
    role === 'Applicant'
      ? applicantVacancyOrders
      : canLoadServerOrders && ordersResponse
        ? serverOrders
        : dataset.orders
  const candidateScopeOrderId =
    baseOrders.find((order) => order.id === preferredOrderId && !order.isArchived)?.id ??
    baseOrders.find((order) => !order.isArchived)?.id ??
    baseOrders.find((order) => order.id === preferredOrderId)?.id ??
    baseOrders[0]?.id ??
    null
  const candidateSourceVacancy =
    candidateScopeOrderId && vacanciesResponse
      ? vacanciesResponse.items.find((vacancy) => vacancy.orderId === candidateScopeOrderId) ?? null
      : null
  const {
    data: vacancyCandidatesResponse,
    isError: isVacancyCandidatesError,
    isFetching: isVacancyCandidatesFetching,
    refetch: refetchVacancyCandidates,
  } = useGetVacancyCandidatesQuery(
    canLoadServerCandidates && candidateSourceVacancy ? { vacancyId: candidateSourceVacancy.id } : skipToken,
  )
  const { data: vacancyBaseCandidatesResponse } = useGetVacancyBaseCandidatesQuery(
    canLoadExecutorBaseCandidates && candidateSourceVacancy
      ? { vacancyId: candidateSourceVacancy.id }
      : skipToken,
  )
  const isProfileRoute = location.pathname === routePaths.profile

  const [workspaceView, setActiveView] = useState<WorkspaceView>(defaultWorkspaceView)
  const activeView: WorkspaceView = isProfileRoute ? 'profile' : workspaceView
  const [searchValue, setSearchValue] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(readInitialSidebarCollapsedState)
  const [orderFilter] = useState<OrderFilter>('all')
  const [isViewLoading, setIsViewLoading] = useState(false)
  const setBanner = useCallback(
    (banner: { message: string; variant: 'default' | 'success' | 'destructive' }) => {
      notify({ message: banner.message, variant: banner.variant })
    },
    [notify],
  )
  const [isCreateOrderPageOpen, setIsCreateOrderPageOpen] = useState(false)
  const [isCreateVacancyPageOpen, setIsCreateVacancyPageOpen] = useState(false)
  const [isCreateCandidatePageOpen, setIsCreateCandidatePageOpen] = useState(false)
  const [isCreateApplicantResponsePageOpen, setIsCreateApplicantResponsePageOpen] = useState(false)
  const [createOrderFormValues, setCreateOrderFormValues] = useState({
    title: '',
    organization: '',
    // @dvnull: Ранее create-order state не содержал specialization/price; добавлены поля для новой формы заказа.
    specialization: '',
    // @dvnull: Ранее выбор специализации по справочнику отсутствовал; добавлено отдельное specializationId для select.
    specializationId: '',
    price: '',
    note: '',
    requestedCandidatesCount: '1',
  })
  const customerCompanyName = profile?.customerProfile?.companyName?.trim() ?? ''
  const [createCandidateFormValues, setCreateCandidateFormValues] = useState({
    fullName: '',
    birthDate: '',
    email: '',
    phone: '',
    specialization: '',
    resumeTitle: '',
    resumeRichTextHtml: '',
    resumeAttachmentLinks: '',
  })
  const [createApplicantResponseFormValues, setCreateApplicantResponseFormValues] = useState({
    fullName: '',
    birthDate: '',
    email: '',
    phone: '',
    specialization: '',
    resumeTitle: '',
    resumeRichTextHtml: '',
    resumeAttachmentLinks: '',
  })
  const [createVacancyFormValues, setCreateVacancyFormValues] = useState({
    title: '',
    description: '',
  })
  const [createVacancyOrderId, setCreateVacancyOrderId] = useState<string | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [preferredChatId, setPreferredChatId] = useState<string | null>(null)
  const [threadsByRole, setThreadsByRole] = useState<Record<WorkspaceRole, WorkspaceChatThread[]>>({
    Customer: workspaceDataByRole.Customer.chats,
    Executor: workspaceDataByRole.Executor.chats,
    Applicant: workspaceDataByRole.Applicant.chats,
  })
  const [manualCandidatesByRole, setManualCandidatesByRole] = useState<Record<WorkspaceRole, WorkspaceCandidate[]>>({
    Customer: [],
    Executor: [],
    Applicant: [],
  })
  const [analyticsRecoveredByRole, setAnalyticsRecoveredByRole] = useState<Record<WorkspaceRole, boolean>>({
    Customer: false,
    Executor: false,
    Applicant: false,
  })
  const [purchasedCandidateIds, setPurchasedCandidateIds] = useState<string[]>([])
  const [executorGlobalCandidates, setExecutorGlobalCandidates] = useState<WorkspaceCandidate[]>([])
  const [executorGlobalBaseCandidates, setExecutorGlobalBaseCandidates] = useState<WorkspaceCandidate[]>([])
  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (!transitionTimeoutRef.current) {
        return
      }

      window.clearTimeout(transitionTimeoutRef.current)
    },
    [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(sidebarCollapsedStorageKey, isSidebarCollapsed ? '1' : '0')
  }, [isSidebarCollapsed])

  useEffect(() => {
    const userId = authMe?.userId
    const orderId = createVacancyOrderId
    if (!userId || !orderId) {
      return
    }

    const hasMeaningfulDraft =
      createVacancyFormValues.title.trim().length > 0 || createVacancyFormValues.description.trim().length > 0

    // @dvnull: Ранее черновик создания вакансии в workspace не сохранялся между закрытием/повторным открытием формы.
    if (!hasMeaningfulDraft) {
      clearVacancyCreateDraft(userId, orderId)
      return
    }

    saveVacancyCreateDraft(userId, orderId, createVacancyFormValues)
  }, [authMe?.userId, createVacancyFormValues, createVacancyOrderId])

  useSyncExecutorGlobalCandidates({
    loadVacancyBaseCandidates,
    loadVacancyCandidates,
    role,
    setExecutorGlobalBaseCandidates,
    setExecutorGlobalCandidates,
    toWorkspaceBaseCandidate,
    toWorkspaceCandidate,
    vacanciesResponse,
  })

  function startViewTransition() {
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current)
    }

    setIsViewLoading(true)
    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsViewLoading(false)
      transitionTimeoutRef.current = null
    }, 280)
  }

  const threads = threadsByRole[role]
  const manualCandidates = manualCandidatesByRole[role]
  const serverCandidates =
    candidateSourceVacancy && vacancyCandidatesResponse
      ? vacancyCandidatesResponse.items
          .filter((item) => role !== 'Customer' || item.stage === 'Shortlist' || item.isSelected)
          .map((item) => toWorkspaceCandidate(item, candidateSourceVacancy))
      : []
  const serverBaseCandidates =
    candidateSourceVacancy && vacancyBaseCandidatesResponse
      ? vacancyBaseCandidatesResponse.items.map((item) => toWorkspaceBaseCandidate(item, candidateSourceVacancy))
      : []
  const {
    activeThread,
    analyticsError,
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
    runtimeStats,
    selectedCandidate,
    selectedOrder,
    selectedOrderId,
  } = deriveWorkspaceViewState({
    activeView,
    analyticsRecovered: analyticsRecoveredByRole[role],
    baseOrders:
      role === 'Executor'
        ? baseOrders.map((order) => {
            const candidatesCount = executorGlobalCandidates.filter(
              (candidate) => candidate.orderId === order.id,
            ).length

            return {
              ...order,
              responses: candidatesCount > 0 ? candidatesCount : order.responses,
            }
          })
        : baseOrders,
    canLoadExecutorBaseCandidates,
    canLoadServerCandidates,
    canLoadServerOrders,
    candidateSourceVacancy,
    customerDashboardStats,
    dataset,
    executorDashboardStats,
    executorGlobalBaseCandidates,
    executorGlobalCandidates,
    isOrdersFetching,
    isVacancyCandidatesError,
    isVacancyCandidatesFetching,
    locationSearch: location.search,
    manualCandidates,
    orderFilter,
    ordersResponseExists: Boolean(ordersResponse),
    preferredChatId,
    preferredOrderId,
    purchasedCandidateIds,
    role,
    searchValue,
    serverBaseCandidates,
    serverCandidates,
    threads,
    vacanciesResponseExists: Boolean(vacanciesResponse),
    vacancyCandidatesItems: vacancyCandidatesResponse?.items ?? null,
  })
  const { data: myOrderResponse, refetch: refetchMyOrderResponse } = useGetMyOrderResponseQuery(
    role === 'Executor' && selectedOrder ? selectedOrder.id : skipToken,
  )
  const canManageOrderResponses = authMe?.role === 'Customer' || authMe?.role === 'Admin'
  const {
    data: orderResponsesResponse,
    isFetching: isOrderResponsesFetching,
    refetch: refetchOrderResponses,
  } = useGetOrderResponsesQuery(
    canManageOrderResponses && selectedOrder ? selectedOrder.id : skipToken,
  )
  const orderResponses = orderResponsesResponse?.items ?? []
  const selectedOrderExecutorName = selectedOrder?.executorId
    ? orderResponses.find((response) => response.executorId === selectedOrder.executorId)?.executorFullName ?? null
    : null
  const selectedOrderWithResponses = selectedOrder
    ? {
        ...selectedOrder,
        responses: canManageOrderResponses ? orderResponses.length : selectedOrder.responses,
      }
    : null
  const selectedOrderVacancy =
    selectedOrder && vacanciesResponse
      ? vacanciesResponse.items.find((vacancy) => vacancy.orderId === selectedOrder.id) ?? null
      : null
  const selectedOrderApplicantResponders =
    role === 'Executor' && selectedOrder
      ? Array.from(
          new Map(
            executorGlobalCandidates
              .filter(
                (candidate) =>
                  candidate.orderId === selectedOrder.id && candidate.sourceType === 'RegisteredUser',
              )
              .map((candidate) => [candidate.id, candidate]),
          ).values(),
        )
      : []
  const hasRespondedToSelectedOrder =
    role === 'Applicant'
      ? Boolean(selectedOrder && applicantRespondedOrderIds.includes(selectedOrder.id))
      : myOrderResponse?.hasResponse === true
  const canRespondToSelectedOrder =
    role === 'Executor'
      ? Boolean(selectedOrder && !selectedOrder.isArchived && !selectedOrder.isPaused && !selectedOrder.executorId)
      : role === 'Applicant'
        ? Boolean(selectedOrderVacancy && selectedOrder && !applicantRespondedOrderIds.includes(selectedOrder.id))
        : false
  const canCreateVacancyFromSelectedOrder =
    role === 'Executor' &&
    Boolean(
      selectedOrder &&
        selectedOrder.executorId &&
        selectedOrder.executorId === authMe?.userId &&
        !selectedOrder.isArchived,
    )
  const canPublishVacancyForSelectedOrder =
    role === 'Customer' && selectedOrderVacancy?.status === 'OnApproval'
  // @dvnull: Ранее превью вакансии не прокидывалось в panel деталей заказа, из-за чего заказчик не видел текст перед подтверждением.
  const selectedOrderVacancyPreview = selectedOrderVacancy
    ? {
        title: selectedOrderVacancy.title,
        description: selectedOrderVacancy.description,
      }
    : null
  const handlePublishVacancyForSelectedOrder = useCallback(async () => {
    if (!selectedOrderVacancy) {
      setBanner({
        variant: 'destructive',
        message: 'Вакансия для подтверждения не найдена.',
      })
      return
    }

    try {
      // @dvnull: Ранее в workspace не было действия заказчика для публикации вакансии после этапа OnApproval.
      await updateVacancyStatus({
        vacancyId: selectedOrderVacancy.id,
        body: { status: 'Published' },
      }).unwrap()
      await refetchVacancies()
      setBanner({
        variant: 'success',
        message: 'Вакансия подтверждена и опубликована.',
      })
    } catch (error) {
      setBanner({
        variant: 'destructive',
        message: getRequestErrorMessage(error),
      })
    }
  }, [refetchVacancies, selectedOrderVacancy, setBanner, updateVacancyStatus])
  const handleRespondToSelectedVacancy = useCallback(async (orderId: string) => {
    if (role !== 'Applicant') {
      return
    }

    const vacancy = vacanciesResponse?.items.find((item) => item.orderId === orderId)
    if (!vacancy) {
      setBanner({
        variant: 'destructive',
        message: 'Вакансия для отклика не найдена.',
      })
      return
    }

    try {
      await respondToVacancy({ vacancyId: vacancy.id }).unwrap()
      if (authMe?.userId) {
        const nextIds = applicantRespondedOrderIds.includes(orderId)
          ? applicantRespondedOrderIds
          : [...applicantRespondedOrderIds, orderId]
        saveApplicantRespondedOrderIds(authMe.userId, nextIds)
      }
      setBanner({
        variant: 'success',
        message: 'Отклик на вакансию отправлен.',
      })
    } catch (error) {
      const errorStatus =
        typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number | string }).status
          : undefined
      if (errorStatus === 409 && authMe?.userId) {
        const nextIds = applicantRespondedOrderIds.includes(orderId)
          ? applicantRespondedOrderIds
          : [...applicantRespondedOrderIds, orderId]
        // @dvnull: Ранее при 409 на повторном отклике вакансия оставалась в "Бирже"; синхронизируем "Мои заказы" на фронте.
        saveApplicantRespondedOrderIds(authMe.userId, nextIds)
        setBanner({
          variant: 'success',
          message: 'Отклик уже был отправлен ранее.',
        })
        return
      }
      setBanner({
        variant: 'destructive',
        message: getRequestErrorMessage(error),
      })
    }
  }, [applicantRespondedOrderIds, authMe?.userId, respondToVacancy, role, setBanner, vacanciesResponse])
  const handleSetApplicantResponderStage = useCallback(
    async (orderId: string, candidateId: string, stage: 'Pool' | 'Shortlist') => {
      if (role !== 'Executor') {
        return
      }

      const vacancy = vacanciesResponse?.items.find((item) => item.orderId === orderId)
      if (!vacancy) {
        setBanner({
          variant: 'destructive',
          message: 'Вакансия для изменения стадии не найдена.',
        })
        return
      }

      try {
        await updateVacancyCandidateStage({
          vacancyId: vacancy.id,
          candidateId,
          body: { stage },
        }).unwrap()
        setExecutorGlobalCandidates((previousCandidates) =>
          previousCandidates.map((candidate) => {
            if (candidate.id !== candidateId || candidate.orderId !== orderId) {
              return candidate
            }

            // @dvnull: Ранее после смены стадии отклика в деталях заказа не было мгновенного UI-обновления.
            return {
              ...candidate,
              statusLabel: stage === 'Shortlist' ? 'Shortlist' : 'Pool',
              statusTone: stage === 'Shortlist' ? 'default' : 'warning',
              comment: `Обновлено ${new Date().toLocaleString('ru-RU')}`,
            }
          }),
        )
        if (candidateSourceVacancy?.id === vacancy.id) {
          await refetchVacancyCandidates()
        }
        setBanner({
          variant: 'success',
          message:
            stage === 'Shortlist'
              ? 'Соискатель добавлен в shortlist.'
              : 'Соискатель переведен в Pool.',
        })
      } catch (error) {
        setBanner({
          variant: 'destructive',
          message: getRequestErrorMessage(error),
        })
      }
    },
    [
      candidateSourceVacancy?.id,
      refetchVacancyCandidates,
      role,
      setBanner,
      updateVacancyCandidateStage,
      vacanciesResponse,
    ],
  )
  const linkedCreateVacancyOrder =
    (createVacancyOrderId ? baseOrders.find((order) => order.id === createVacancyOrderId) : null) ?? selectedOrder ?? null
  const hasCreateVacancyDraftForSelectedOrder =
    Boolean(authMe?.userId && selectedOrder) &&
    Boolean(readVacancyCreateDraft(authMe?.userId ?? '', selectedOrder?.id ?? ''))
  const handleCreateVacancyFromOrder = useCallback(
    (orderId: string) => {
      const order = baseOrders.find((item) => item.id === orderId)
      if (!order) {
        setBanner({
          variant: 'destructive',
          message: 'Не удалось определить заказ для создания вакансии.',
        })
        return
      }
      const userId = authMe?.userId ?? ''
      const savedDraft = userId ? readVacancyCreateDraft(userId, order.id) : null
      // @dvnull: Ранее кнопка в деталях заказа переводила на отдельную страницу /vacancies; переносим создание в workspace-форму.
      setCreateVacancyOrderId(order.id)
      setCreateVacancyFormValues({
        title: savedDraft?.title ?? order.title,
        description: savedDraft?.description ?? '',
      })
      setIsCreateVacancyPageOpen(true)
    },
    [authMe?.userId, baseOrders, setBanner],
  )

  useMarkCustomerViewedCandidate({
    candidateSourceVacancyId: candidateSourceVacancy?.id,
    markVacancyCandidateViewedByCustomer,
    refetchVacancyCandidates,
    role,
    selectedCandidate,
    vacanciesResponse,
    vacancyCandidatesResponse,
  })

  const { handleOpenCandidateDetails, handleOpenOrderDetails, handleViewChange, setDetailsInUrl } =
    useWorkspaceNavigation({
      location,
      navigate,
      role,
      setActiveView,
      setIsCreateApplicantResponsePageOpen,
      setIsCreateCandidatePageOpen,
      setIsCreateOrderPageOpen,
      setIsCreateVacancyPageOpen,
      setPreferredOrderId,
      startViewTransition,
    })
  const {
    handleActivateOrders,
    handleArchiveOrders,
    handlePauseOrders,
    handleRejectOrderExecutor,
    handleRespondToOrder,
    handleSelectOrderExecutor,
  } = useWorkspaceOrderActions({
    canManageOrder,
    canManageOrderResponses,
    deleteOrder,
    getRequestErrorMessage,
    refetchOrderResponses,
    refetchOrders,
    refetchMyOrderResponse,
    rejectOrderResponseExecutor,
    respondToOrder,
    selectedOrderId: selectedOrder?.id ?? null,
    selectOrderResponseExecutor,
    setBanner,
    setPreferredOrderId,
    setSelectedOrderId: (orderId) => setDetailsInUrl({ orderId }, true),
    updateOrder,
  })

  function handlePurchaseCandidate(candidate: WorkspaceCandidate) {
    if (purchasedCandidateIds.includes(candidate.id)) {
      return
    }

    setPurchasedCandidateIds((previousPurchasedCandidateIds) => [...previousPurchasedCandidateIds, candidate.id])
    setBanner({
      variant: 'success',
      message: 'Доступ к комментариям кандидата открыт.',
    })
  }

  const { handleHeaderCreateAction, handleHeaderMenuAction, handleSendMessage } = useWorkspaceUiActions({
    activeThread,
    chatDraft,
    customerCompanyName,
    role,
    setActiveView,
    setBanner,
    setChatDraft,
    setCreateOrderFormValues,
    setDetailsInUrl,
    setIsCreateApplicantResponsePageOpen,
    setIsCreateCandidatePageOpen,
    setIsCreateOrderPageOpen,
    setThreadsByRole,
    todayTimeLabel,
    onOpenWorkspace: () => {
      if (location.pathname === routePaths.profile) {
        navigate(routePaths.app, { replace: true })
      }
    },
    onOpenProfile: () => {
      navigate(routePaths.profile)
    },
    onLogout: () => {
      // @dvnull: Ранее при logout чистилась только auth-сессия; query-cache сохранял профиль прошлого аккаунта до hard reload.
      dispatch(clearAuthSession())
      dispatch(api.util.resetApiState())
      navigate(routePaths.auth, { replace: true })
    },
  })
  const {
    handleCreateApplicantResponseFormFieldChange,
    handleCreateApplicantResponseFromPage,
    handleCreateCandidateFormFieldChange,
    handleCreateCandidateFromPage,
    handleCreateOrderFormFieldChange,
    handleCreateOrderFromPage,
    handleCreateVacancyAndSendToCustomerFromPage,
    handleCreateVacancyFormFieldChange,
    handleCreateVacancyFromPage,
  } = useWorkspaceCreateActions({
    createApplicantResponseFormValues,
    createCandidateFormValues,
    createOrder,
    createVacancy,
    updateVacancy,
    updateVacancyStatus,
    createOrderFormValues,
    createVacancyFormValues,
    createVacancyOrderId,
    getExistingVacancyByOrderId: (orderId: string) => {
      const vacancy = vacanciesResponse?.items.find((item) => item.orderId === orderId)
      if (!vacancy) {
        return null
      }

      return {
        id: vacancy.id,
        status: vacancy.status,
      }
    },
    orderSpecializationOptions,
    filteredOrders,
    getRequestErrorMessage,
    manualCandidatesByRole,
    refetchOrders,
    refetchVacancies,
    role,
    clearCreateVacancyDraft: (orderId: string) => {
      if (!authMe?.userId) {
        return
      }
      clearVacancyCreateDraft(authMe.userId, orderId)
    },
    setActiveView,
    setBanner,
    setCreateApplicantResponseFormValues,
    setCreateCandidateFormValues,
    setCreateOrderFormValues,
    setCreateVacancyFormValues,
    setIsCreateApplicantResponsePageOpen,
    setIsCreateCandidatePageOpen,
    setIsCreateOrderPageOpen,
    setIsCreateVacancyPageOpen,
    setManualCandidatesByRole,
    setPreferredOrderId,
  })

  function toggleSidebar() {
    setIsSidebarCollapsed((previousValue) => !previousValue)
  }

  function closeOrderDetails() {
    setDetailsInUrl({ orderId: null })
  }

  function closeCandidateDetails() {
    setDetailsInUrl({ candidateId: null })
  }

  function handleRetryAnalytics() {
    setAnalyticsRecoveredByRole((previous) => ({
      ...previous,
      [role]: true,
    }))
    setBanner({
      variant: 'success',
      message: 'Отчет аналитики успешно обновлен.',
    })
  }

  function closeCreateCandidatePage() {
    setIsCreateCandidatePageOpen(false)
  }

  function closeCreateApplicantResponsePage() {
    setIsCreateApplicantResponsePageOpen(false)
  }

  function closeCreateOrderPage() {
    setIsCreateOrderPageOpen(false)
    setActiveView('dashboard')
  }

  function closeCreateVacancyPage() {
    setIsCreateVacancyPageOpen(false)
    setCreateVacancyOrderId(null)
  }

  return {
    activeThread,
    activeView,
    analyticsError,
    authMe,
    canLoadExecutorBaseCandidates,
    canLoadServerCandidates,
    canLoadServerOrders,
    canManageOrder,
    canManageOrderResponses,
    canCreateVacancyFromSelectedOrder,
    canPublishVacancyForSelectedOrder,
    handlePublishVacancyForSelectedOrder,
    hasCreateVacancyDraftForSelectedOrder,
    canRespondToSelectedOrder,
    applicantRespondedOrderIds,
    candidateViewOrders,
    candidateViewSelectedOrderId,
    chatDraft,
    closeCandidateDetails,
    closeCreateApplicantResponsePage,
    closeCreateCandidatePage,
    closeCreateOrderPage,
    closeCreateVacancyPage,
    closeOrderDetails,
    counters,
    createApplicantResponseFormValues,
    createCandidateFormValues,
    createOrderFormValues,
    orderSpecializationOptions,
    isOrderSpecializationsLoading,
    isOrderSpecializationsError,
    createVacancyFormValues,
    dataset,
    executorBaseCandidates,
    executorMyCandidates,
    filteredBaseCandidates,
    filteredCandidates,
    filteredOrders,
    filteredThreads,
    handleActivateOrders,
    handleArchiveOrders,
    handleCreateApplicantResponseFormFieldChange,
    handleCreateApplicantResponseFromPage,
    handleCreateCandidateFormFieldChange,
    handleCreateCandidateFromPage,
    handleCreateOrderFormFieldChange,
    handleCreateOrderFromPage,
    handleCreateVacancyAndSendToCustomerFromPage,
    handleCreateVacancyFormFieldChange,
    handleCreateVacancyFromPage,
    handleCreateVacancyFromOrder,
    handleHeaderCreateAction,
    handleHeaderMenuAction,
    handleOpenCandidateDetails,
    handleOpenOrderDetails,
    handlePauseOrders,
    handlePurchaseCandidate,
    handleRejectOrderExecutor,
    handleRespondToOrder,
    handleRespondToSelectedVacancy,
    handleSetApplicantResponderStage,
    handleRetryAnalytics,
    handleSelectOrderExecutor,
    handleSendMessage,
    handleViewChange,
    hasRespondedToSelectedOrder,
    isCandidatesApiLoading,
    isCreateApplicantResponsePageOpen,
    isCreateCandidatePageOpen,
    isCreateOrderPageOpen,
    isCreateVacancyPageOpen,
    isCreatingOrder,
    isCreatingVacancy: isCreatingVacancy || isUpdatingVacancy,
    isPublishingVacancyForCustomer: isSendingVacancyToCustomer,
    isSendingVacancyToCustomer,
    isDeletingOrder,
    isDetailsPageOpen,
    isOrderResponsesFetching,
    isOrderStatusUpdating,
    isOrdersApiLoading,
    isOrdersError,
    isRejectingOrderExecutor,
    isRespondingToOrder: isRespondingToOrder || isRespondingToVacancy,
    isUpdatingApplicantResponderStage,
    isSelectedCandidatePurchased,
    isSelectingOrderExecutor,
    isSidebarCollapsed,
    isVacancyCandidatesError,
    isViewLoading,
    orderResponses,
    profileDisplayName,
    profileEmail,
    profileRoleLabel,
    role,
    runtimeStats,
    searchValue,
    linkedCreateVacancyOrder,
    selectedCandidate,
    selectedOrder,
    selectedOrderExecutorName,
    selectedOrderId,
    selectedOrderApplicantResponders,
    selectedOrderVacancyPreview,
    selectedOrderWithResponses,
    setChatDraft,
    setPreferredChatId,
    setPreferredOrderId,
    setSearchValue,
    toggleSidebar,
  }
}
