// frontend/src/components/workspace/shell/hooks/useWorkspaceShellController.ts
import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useNotifications } from '@/components/ui/useNotifications'
import { routePaths } from '@/app/routePaths'
import type { AppDispatch } from '@/app/store'
import { toRoleLabel, toWorkspaceRole, deriveWorkspaceViewState } from '../workspaceShell.helpers'
import { useWorkspaceUIState } from './useWorkspaceUIState'
import { useWorkspaceForms } from './useWorkspaceForms'
import { useWorkspaceApiQueries } from './useWorkspaceApiQueries'
import { useWorkspaceDataQueries } from './api/useWorkspaceDataQueries'
import { useWorkspaceOrderData } from './data/useWorkspaceOrderData'
import { useWorkspaceCandidateData } from './data/useWorkspaceCandidateData'
import { useWorkspaceCallbacks } from './useWorkspaceCallbacks'
import { useWorkspaceEffects } from './useWorkspaceEffects'
import { useWorkspaceNavigation } from './useWorkspaceNavigation'

const defaultWorkspaceRole = 'Customer'

export function useWorkspaceShellController() {
  const { notify } = useNotifications()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()

  // === 1. API queries (profile, auth, dashboard stats) ===
  const apiQueries = useWorkspaceApiQueries()
  const { profile, authMe, isProfileFetching, isAuthMeFetching } = apiQueries

  // === 2. Compute role ===
  const role = toWorkspaceRole(profile?.activeRole ?? profile?.role) ?? defaultWorkspaceRole
  const isBootstrapLoading = (isProfileFetching || isAuthMeFetching) && (!profile || !authMe)

  // === 3. UI State (forms, search, dialogs) ===
  const uiState = useWorkspaceUIState()

  // === 4. Forms State ===
  const forms = useWorkspaceForms()

  const navigation = useWorkspaceNavigation({
    location,
    navigate,
    role,
    setActiveView: uiState.setActiveView,
    setIsCreateApplicantResponsePageOpen: uiState.setIsCreateApplicantResponsePageOpen,
    setIsCreateCandidatePageOpen: uiState.setIsCreateCandidatePageOpen,
    setIsCreateOrderPageOpen: uiState.setIsCreateOrderPageOpen,
    setIsCreateVacancyPageOpen: uiState.setIsCreateVacancyPageOpen,
    setPreferredOrderId: uiState.setPreferredOrderId,
    startViewTransition: uiState.startViewTransition,
  })

  const handleCreateCandidateFormFieldChange = useCallback(
    (field: keyof typeof forms.createCandidateFormValues, value: string) => {
      forms.setCreateCandidateFormValues((previousValues) => ({ ...previousValues, [field]: value }))
    },
    [forms],
  )

  // === 5. Data Queries (orders, vacancies, candidates) ===
  const dataQueries = useWorkspaceDataQueries({
    role,
    authMeUserId: authMe?.userId,
    canLoadServerOrders: !isBootstrapLoading,
    canLoadServerCandidates: role !== 'Applicant' && !isBootstrapLoading,
    canLoadExecutorBaseCandidates: role === 'Executor' && !isBootstrapLoading,
    preferredOrderId: uiState.preferredOrderId,
  })

  // === 6. Normalize order data ===
  const orderData = useWorkspaceOrderData({
    role,
    ordersResponse: dataQueries.ordersResponse,
    vacanciesResponse: dataQueries.vacanciesResponse,
    preferredOrderId: uiState.preferredOrderId,
    canLoadServerOrders: !isBootstrapLoading,
  })

  // === 7. Normalize candidate data ===
  const candidateData = useWorkspaceCandidateData({
    candidateScopeOrderId: orderData.candidateScopeOrderId,
    vacanciesResponse: dataQueries.vacanciesResponse,
    vacancyCandidatesResponse: dataQueries.vacancyCandidatesResponse,
    vacancyBaseCandidatesResponse: dataQueries.vacancyBaseCandidatesResponse,
    canLoadServerCandidates: role !== 'Applicant' && !isBootstrapLoading,
    canLoadExecutorBaseCandidates: role === 'Executor' && !isBootstrapLoading,
  })

  // === 8. Derive view state from all data ===
  const derivedState = deriveWorkspaceViewState({
    activeView: uiState.activeView,
    analyticsError: null,
    baseOrders: orderData.baseOrders,
    canLoadExecutorBaseCandidates: role === 'Executor',
    canLoadServerCandidates: role !== 'Applicant',
    canLoadServerOrders: !isBootstrapLoading,
    candidateSourceVacancy: candidateData.candidateSourceVacancy,
    customerDashboardStats: apiQueries.customerDashboardStats,
    executorDashboardStats: apiQueries.executorDashboardStats,
    executorGlobalBaseCandidates: [],
    executorGlobalCandidates: [],
    fallbackCandidates: [],
    fallbackMeetings: [],
    fallbackStats: [],
    isOrdersFetching: dataQueries.isOrdersFetching,
    isVacancyCandidatesError: dataQueries.isVacancyCandidatesError,
    isVacancyCandidatesFetching: dataQueries.isVacancyCandidatesFetching,
    locationSearch: location.search,
    manualCandidates: [],
    meetings: [],
    orderFilter: uiState.orderFilter,
    ordersResponseExists: Boolean(dataQueries.ordersResponse),
    preferredChatId: uiState.preferredChatId,
    preferredOrderId: uiState.preferredOrderId,
    purchasedCandidateIds: uiState.purchasedCandidateIds,
    role,
    searchValue: uiState.searchValue,
    serverBaseCandidates: candidateData.serverBaseCandidates,
    serverCandidates: candidateData.serverCandidates,
    threads: [],
    vacanciesResponseExists: Boolean(dataQueries.vacanciesResponse),
    vacancyCandidatesItems: dataQueries.vacancyCandidatesResponse?.items ?? null,
  })

  // === 9. Actions & Callbacks ===
  const callbacks = useWorkspaceCallbacks({
    role,
    activeView: uiState.activeView,
    authMe,
    profile,
    uiState,
    forms,
    apiQueries,
    dataQueries,
    notify,
    dispatch,
    navigate,
    location,
    derivedState,
  })

  // === 10. Effects (persistence, cleanup) ===
  useWorkspaceEffects({
    authMe,
    uiState,
    forms,
    apiQueries,
  })

  // === Helper values ===
  const profileDisplayName =
    `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() ||
    authMe?.email ||
    'Пользователь'
  const profileEmail = profile?.email ?? authMe?.email ?? '—'
  const profileRoleLabel = toRoleLabel(role)
  const canSwitchApplicantExecutor = role === 'Applicant' || role === 'Executor'
  const canManageOrder = authMe?.role === 'Customer' || authMe?.role === 'Admin'

  return {
    // Profile & Auth
    activeView: uiState.activeView,
    role,
    authMe,
    profile,
    isBootstrapLoading,
    canSwitchApplicantExecutor,
    canManageOrder,
    profileDisplayName,
    profileEmail,
    profileRoleLabel,
    isProfileRoute: location.pathname === routePaths.profile,

    // UI State
    searchValue: uiState.searchValue,
    setSearchValue: uiState.setSearchValue,
    isSidebarCollapsed: uiState.isSidebarCollapsed,
    toggleSidebar: uiState.toggleSidebar,
    isViewLoading: uiState.isViewLoading,
    isCreateOrderPageOpen: uiState.isCreateOrderPageOpen,
    isCreateVacancyPageOpen: uiState.isCreateVacancyPageOpen,
    isCreateCandidatePageOpen: uiState.isCreateCandidatePageOpen,
    isCreateApplicantResponsePageOpen: uiState.isCreateApplicantResponsePageOpen,
    chatDraft: uiState.chatDraft,
    setChatDraft: uiState.setChatDraft,
    setPreferredChatId: uiState.setPreferredChatId,
    setPreferredOrderId: uiState.setPreferredOrderId,

    // Forms
    createOrderFormValues: forms.createOrderFormValues,
    createCandidateFormValues: forms.createCandidateFormValues,
    createApplicantResponseFormValues: forms.createApplicantResponseFormValues,
    createVacancyFormValues: forms.createVacancyFormValues,
    handleCreateCandidateFormFieldChange,

    // API Data
    orderSpecializationOptions: apiQueries.orderSpecializationOptions,
    isOrderSpecializationsLoading: apiQueries.isOrderSpecializationsLoading,
    isOrderSpecializationsError: apiQueries.isOrderSpecializationsError,
    executorDashboardStats: apiQueries.executorDashboardStats,
    customerDashboardStats: apiQueries.customerDashboardStats,

    // Derived State
    filteredOrders: derivedState.filteredOrders,
    filteredCandidates: derivedState.filteredCandidates,
    filteredThreads: derivedState.filteredThreads,
    counters: derivedState.counters ?? {
      dashboard: 0,
      orders: 0,
      candidates: 0,
      meetings: 0,
      chats: 0,
    },
    runtimeStats: derivedState.runtimeStats,
    selectedCandidate: derivedState.selectedCandidate,
    selectedOrder: derivedState.selectedOrder,
    selectedOrderId: derivedState.selectedOrderId,
    isDetailsPageOpen: derivedState.isDetailsPageOpen,
    isCandidatesApiLoading: derivedState.isCandidatesApiLoading,
    isOrdersApiLoading: derivedState.isOrdersApiLoading,
    isSelectedCandidatePurchased: derivedState.isSelectedCandidatePurchased,
    analyticsError: derivedState.analyticsError,
    activeThread: derivedState.activeThread,
    candidateViewOrders: derivedState.candidateViewOrders,
    candidateViewSelectedOrderId: derivedState.candidateViewSelectedOrderId,
    executorBaseCandidates: derivedState.executorBaseCandidates,
    executorMyCandidates: derivedState.executorMyCandidates,
    filteredBaseCandidates: derivedState.filteredBaseCandidates,

    // Callbacks
    ...callbacks,
    handleViewChange: navigation.handleViewChange,
    handleOpenOrderDetails: navigation.handleOpenOrderDetails,
    handleOpenCandidateDetails: navigation.handleOpenCandidateDetails,
    closeOrderDetails: () => navigation.setDetailsInUrl({ orderId: null }),
    closeCandidateDetails: () => navigation.setDetailsInUrl({ candidateId: null }),
  }
}
