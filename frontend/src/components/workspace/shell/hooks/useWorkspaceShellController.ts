import { skipToken } from '@reduxjs/toolkit/query'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearAuthSession } from '@/app/authSessionSlice'
import { routePaths } from '@/app/routePaths'
import type { AppDispatch } from '@/app/store'
import { useGetMyAuthInfoQuery } from '@/shared/api/auth'
import {
  useGetVacancyBaseCandidatesQuery,
  useGetVacancyCandidatesQuery,
  useLazyGetVacancyBaseCandidatesQuery,
  useLazyGetVacancyCandidatesQuery,
  useMarkVacancyCandidateViewedByCustomerMutation,
} from '@/shared/api/candidates'
import { useGetCustomerDashboardStatsQuery, useGetExecutorDashboardStatsQuery } from '@/shared/api/dashboard'
import {
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetMyOrderResponseQuery,
  useGetOrderResponsesQuery,
  useGetOrdersQuery,
  useRejectOrderResponseExecutorMutation,
  useRespondToOrderMutation,
  useSelectOrderResponseExecutorMutation,
  useUpdateOrderMutation,
} from '@/shared/api/orders'
import { useGetMyProfileQuery } from '@/shared/api/profile'
import { useGetVacanciesQuery } from '@/shared/api/vacancies'
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

type PageBanner = {
  message: string
  variant: 'default' | 'success' | 'destructive'
}

type OrderFilter = 'all' | 'active' | 'paused'
const sidebarCollapsedStorageKey = 'workspace-sidebar-collapsed-v1'

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

export function useWorkspaceShellController() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: profile } = useGetMyProfileQuery()
  const { data: authMe } = useGetMyAuthInfoQuery()
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()
  const [updateOrder, { isLoading: isOrderStatusUpdating }] = useUpdateOrderMutation()
  const [deleteOrder, { isLoading: isDeletingOrder }] = useDeleteOrderMutation()
  const [respondToOrder, { isLoading: isRespondingToOrder }] = useRespondToOrderMutation()
  const [rejectOrderResponseExecutor, { isLoading: isRejectingOrderExecutor }] =
    useRejectOrderResponseExecutorMutation()
  const [selectOrderResponseExecutor, { isLoading: isSelectingOrderExecutor }] =
    useSelectOrderResponseExecutorMutation()
  const [markVacancyCandidateViewedByCustomer] = useMarkVacancyCandidateViewedByCustomerMutation()
  const [loadVacancyCandidates] = useLazyGetVacancyCandidatesQuery()
  const [loadVacancyBaseCandidates] = useLazyGetVacancyBaseCandidatesQuery()
  const [preferredOrderId, setPreferredOrderId] = useState<string | null>(null)
  const role = toWorkspaceRole(profile?.activeRole ?? profile?.role) ?? defaultWorkspaceRole
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
  const { data: executorDashboardStats } = useGetExecutorDashboardStatsQuery(
    dashboardRole === 'Executor' ? undefined : skipToken,
  )
  const { data: customerDashboardStats } = useGetCustomerDashboardStatsQuery(
    dashboardRole === 'Customer' ? undefined : skipToken,
  )
  const canLoadServerVacancies = true
  const canLoadServerCandidates = role !== 'Applicant'
  const canLoadExecutorBaseCandidates = role === 'Executor'
  const { data: vacanciesResponse } = useGetVacanciesQuery(canLoadServerVacancies ? undefined : skipToken)
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

  const [activeView, setActiveView] = useState<WorkspaceView>(defaultWorkspaceView)
  const [searchValue, setSearchValue] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(readInitialSidebarCollapsedState)
  const [orderFilter] = useState<OrderFilter>('all')
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [banner, setBanner] = useState<PageBanner | null>(null)
  const [isCreateOrderPageOpen, setIsCreateOrderPageOpen] = useState(false)
  const [isCreateCandidatePageOpen, setIsCreateCandidatePageOpen] = useState(false)
  const [isCreateApplicantResponsePageOpen, setIsCreateApplicantResponsePageOpen] = useState(false)
  const [createOrderFormValues, setCreateOrderFormValues] = useState({
    title: '',
    organization: '',
    note: '',
  })
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
    if (!banner) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setBanner(null)
    }, 3200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [banner])

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
      ? vacancyCandidatesResponse.items.map((item) => toWorkspaceCandidate(item, candidateSourceVacancy))
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
    baseOrders,
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
  const canRespondToSelectedOrder =
    role === 'Executor' &&
    Boolean(selectedOrder && !selectedOrder.isArchived && !selectedOrder.isPaused && !selectedOrder.executorId)
  const { data: myOrderResponse } = useGetMyOrderResponseQuery(
    role === 'Executor' && selectedOrder ? selectedOrder.id : skipToken,
  )
  const hasRespondedToSelectedOrder = myOrderResponse?.hasResponse === true
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
    role,
    setActiveView,
    setBanner,
    setChatDraft,
    setDetailsInUrl,
    setIsCreateApplicantResponsePageOpen,
    setIsCreateCandidatePageOpen,
    setIsCreateOrderPageOpen,
    setThreadsByRole,
    todayTimeLabel,
    onLogout: () => {
      dispatch(clearAuthSession())
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
  } = useWorkspaceCreateActions({
    createApplicantResponseFormValues,
    createCandidateFormValues,
    createOrder,
    createOrderFormValues,
    filteredOrders,
    getRequestErrorMessage,
    manualCandidatesByRole,
    refetchOrders,
    role,
    setActiveView,
    setBanner,
    setCreateApplicantResponseFormValues,
    setCreateCandidateFormValues,
    setCreateOrderFormValues,
    setIsCreateApplicantResponsePageOpen,
    setIsCreateCandidatePageOpen,
    setIsCreateOrderPageOpen,
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

  return {
    activeThread,
    activeView,
    analyticsError,
    authMe,
    banner,
    canLoadExecutorBaseCandidates,
    canLoadServerCandidates,
    canLoadServerOrders,
    canManageOrder,
    canManageOrderResponses,
    canRespondToSelectedOrder,
    candidateViewOrders,
    candidateViewSelectedOrderId,
    chatDraft,
    closeCandidateDetails,
    closeCreateApplicantResponsePage,
    closeCreateCandidatePage,
    closeCreateOrderPage,
    closeOrderDetails,
    counters,
    createApplicantResponseFormValues,
    createCandidateFormValues,
    createOrderFormValues,
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
    handleHeaderCreateAction,
    handleHeaderMenuAction,
    handleOpenCandidateDetails,
    handleOpenOrderDetails,
    handlePauseOrders,
    handlePurchaseCandidate,
    handleRejectOrderExecutor,
    handleRespondToOrder,
    handleRetryAnalytics,
    handleSelectOrderExecutor,
    handleSendMessage,
    handleViewChange,
    hasRespondedToSelectedOrder,
    isCandidatesApiLoading,
    isCreateApplicantResponsePageOpen,
    isCreateCandidatePageOpen,
    isCreateOrderPageOpen,
    isCreatingOrder,
    isDeletingOrder,
    isDetailsPageOpen,
    isOrderResponsesFetching,
    isOrderStatusUpdating,
    isOrdersApiLoading,
    isOrdersError,
    isRejectingOrderExecutor,
    isRespondingToOrder,
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
    selectedCandidate,
    selectedOrder,
    selectedOrderExecutorName,
    selectedOrderId,
    selectedOrderWithResponses,
    setChatDraft,
    setPreferredChatId,
    setPreferredOrderId,
    setSearchValue,
    toggleSidebar,
  }
}
