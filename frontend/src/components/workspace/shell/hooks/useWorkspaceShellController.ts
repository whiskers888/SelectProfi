// src/components/workspace/shell/hooks/useWorkspaceShellController.ts
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNotifications } from '@/components/ui/useNotifications';
import { routePaths } from '@/app/routePaths';
import type { AppDispatch } from '@/app/store';
import { toRoleLabel, toWorkspaceRole, deriveWorkspaceViewState } from '../workspaceShell.helpers';
import { useWorkspaceUIState } from './useWorkspaceUIState';
import { useWorkspaceForms } from './useWorkspaceForms';
import { useWorkspaceApiQueries } from './useWorkspaceApiQueries';
import { useWorkspaceCallbacks } from './useWorkspaceCallbacks';
import { useWorkspaceEffects } from './useWorkspaceEffects';

const defaultWorkspaceRole = 'Customer';

export function useWorkspaceShellController() {
  const { notify } = useNotifications();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. API данные
  const apiQueries = useWorkspaceApiQueries();
  const { profile, authMe, isProfileFetching, isAuthMeFetching } = apiQueries;

  // 2. Вычисляем role
  const role = toWorkspaceRole(profile?.activeRole ?? profile?.role) ?? defaultWorkspaceRole;
  const isBootstrapLoading = (isProfileFetching || isAuthMeFetching) && (!profile || !authMe);

  // 3. UI State
  const uiState = useWorkspaceUIState();

  // 4. Forms State
  const forms = useWorkspaceForms();

  // TODO: Здесь нужно подготовить данные для deriveWorkspaceViewState
  // Это временные заглушки, нужно заменить на реальные данные из API
  const baseOrders: any[] = [];
  const serverCandidates: any[] = [];
  const serverBaseCandidates: any[] = [];
  const manualCandidates: any[] = [];
  const threads: any[] = [];
  const executorGlobalCandidates: any[] = [];
  const executorGlobalBaseCandidates: any[] = [];

  // 5. Вызываем deriveWorkspaceViewState
  const {
    filteredOrders,
    filteredCandidates,
    filteredThreads,
    activeThread,
    analyticsError,
    candidateViewOrders,
    candidateViewSelectedOrderId,
    counters,
    executorBaseCandidates,
    executorMyCandidates,
    filteredBaseCandidates,
    isCandidatesApiLoading,
    isDetailsPageOpen,
    isOrdersApiLoading,
    isSelectedCandidatePurchased,
    runtimeStats,
    selectedCandidate,
    selectedOrder,
    selectedOrderId,
  } = deriveWorkspaceViewState({
    activeView: uiState.activeView,
    analyticsError: null,
    baseOrders,
    canLoadExecutorBaseCandidates: role === 'Executor',
    canLoadServerCandidates: role !== 'Applicant',
    canLoadServerOrders: true,
    candidateSourceVacancy: null,
    customerDashboardStats: apiQueries.customerDashboardStats,
    executorDashboardStats: apiQueries.executorDashboardStats,
    executorGlobalBaseCandidates,
    executorGlobalCandidates,
    isOrdersFetching: false,
    isVacancyCandidatesError: false,
    isVacancyCandidatesFetching: false,
    locationSearch: location.search,
    manualCandidates,
    meetings: [],
    orderFilter: uiState.orderFilter,
    ordersResponseExists: false,
    preferredChatId: uiState.preferredChatId,
    preferredOrderId: uiState.preferredOrderId,
    purchasedCandidateIds: uiState.purchasedCandidateIds,
    role,
    searchValue: uiState.searchValue,
    serverBaseCandidates,
    serverCandidates,
    threads,
    vacanciesResponseExists: false,
    vacancyCandidatesItems: null,
    fallbackCandidates: [],
    fallbackMeetings: [],
    fallbackStats: [],
  });

  // 6. Callbacks (передаем полученные данные)
  const callbacks = useWorkspaceCallbacks({
    role,
    activeView: uiState.activeView,
    authMe,
    profile,
    uiState,
    forms,
    apiQueries,
    notify,
    dispatch,
    navigate,
    location,
    filteredOrders,
    filteredCandidates,
    filteredThreads,
  });

  // 7. Effects
  useWorkspaceEffects({ authMe, uiState, forms, apiQueries });

  const profileDisplayName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || authMe?.email || 'Пользователь';
  const profileEmail = profile?.email ?? authMe?.email ?? '—';
  const profileRoleLabel = toRoleLabel(role);
  const canSwitchApplicantExecutor = role === 'Applicant' || role === 'Executor';
  const canManageOrder = authMe?.role === 'Customer' || authMe?.role === 'Admin';

  return {
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

    createOrderFormValues: forms.createOrderFormValues,
    createCandidateFormValues: forms.createCandidateFormValues,
    createApplicantResponseFormValues: forms.createApplicantResponseFormValues,
    createVacancyFormValues: forms.createVacancyFormValues,

    orderSpecializationOptions: apiQueries.orderSpecializationOptions,
    isOrderSpecializationsLoading: apiQueries.isOrderSpecializationsLoading,
    isOrderSpecializationsError: apiQueries.isOrderSpecializationsError,
    executorDashboardStats: apiQueries.executorDashboardStats,
    customerDashboardStats: apiQueries.customerDashboardStats,

    // Данные из deriveWorkspaceViewState
    filteredOrders,
    filteredCandidates,
    filteredThreads,
    counters: counters ?? { dashboard: 0, orders: 0, candidates: 0, meetings: 0, chats: 0 },
    runtimeStats,
    selectedCandidate,
    selectedOrder,
    selectedOrderId,
    isDetailsPageOpen,
    isCandidatesApiLoading,
    isOrdersApiLoading,
    isSelectedCandidatePurchased,
    analyticsError,
    activeThread,
    candidateViewOrders,
    candidateViewSelectedOrderId,
    executorBaseCandidates,
    executorMyCandidates,
    filteredBaseCandidates,

    // Callbacks
    handleViewChange: callbacks.handleViewChange,
    handleHeaderCreateAction: callbacks.handleHeaderCreateAction,
    handleHeaderMenuAction: callbacks.handleHeaderMenuAction,
    handleSendMessage: callbacks.handleSendMessage,
    handleOpenCandidateDetails: callbacks.handleOpenCandidateDetails,
    handleOpenOrderDetails: callbacks.handleOpenOrderDetails,
    handleToggleRole: callbacks.handleToggleRole,
    handlePurchaseCandidate: callbacks.handlePurchaseCandidate,
    handleRespondToOrder: callbacks.handleRespondToOrder,
    handleRespondToSelectedVacancy: callbacks.handleRespondToSelectedVacancy,
    handleSetApplicantResponderStage: callbacks.handleSetApplicantResponderStage,
    handleCreateOrderFromPage: callbacks.handleCreateOrderFromPage,
    handleCreateCandidateFromPage: callbacks.handleCreateCandidateFromPage,
    handleCreateApplicantResponseFromPage: callbacks.handleCreateApplicantResponseFromPage,
    handleCreateVacancyFromPage: callbacks.handleCreateVacancyFromPage,
    handleCreateVacancyAndSendToCustomerFromPage: callbacks.handleCreateVacancyAndSendToCustomerFromPage,
    handleCreateVacancyFromOrder: callbacks.handleCreateVacancyFromOrder,
    handlePublishVacancyForSelectedOrder: callbacks.handlePublishVacancyForSelectedOrder,
    handleActivateOrders: callbacks.handleActivateOrders,
    handleArchiveOrders: callbacks.handleArchiveOrders,
    handlePauseOrders: callbacks.handlePauseOrders,
    handleRejectOrderExecutor: callbacks.handleRejectOrderExecutor,
    handleSelectOrderExecutor: callbacks.handleSelectOrderExecutor,
    handleRetryAnalytics: callbacks.handleRetryAnalytics,
    closeCreateOrderPage: callbacks.closeCreateOrderPage,
    closeCreateVacancyPage: callbacks.closeCreateVacancyPage,
    closeCreateCandidatePage: callbacks.closeCreateCandidatePage,
    closeCreateApplicantResponsePage: callbacks.closeCreateApplicantResponsePage,
    closeOrderDetails: callbacks.closeOrderDetails,
    closeCandidateDetails: callbacks.closeCandidateDetails,
  };
}