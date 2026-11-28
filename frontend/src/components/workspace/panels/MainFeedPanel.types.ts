import type { OrderExecutorResponseItemResponse } from '@/shared/api/orders'
import type { ApplicantDashboardApplicationResponse } from '@/shared/api/dashboard/api'
import type { VacancyResponse } from '@/shared/api/vacancies'
import type { WorkspaceCandidate, WorkspaceOrder, WorkspaceRole } from '../model/data'
import type { useMainFeedPanelController } from './hooks/useMainFeedPanelController'

export type MainFeedPanelProps = {
  baseCandidates: WorkspaceCandidate[]
  applicantDashboardApplications?: ApplicantDashboardApplicationResponse[]
  applicantDashboardVacancies?: VacancyResponse[]
  unclassifiedCandidateLinksCount?: number
  isApplicantDashboardStatsLoading?: boolean
  isApplicantDashboardStatsError?: boolean
  onRetryApplicantDashboardStats?: () => void
  applicantRespondedOrderIds?: string[]
  canManageOrderResponses?: boolean
  canPublishVacancyForCustomer?: boolean
  canCreateVacancyFromOrder?: boolean
  canCreateCandidateFromOrder?: boolean
  canRespondToOrder?: boolean
  hasRespondedToOrder?: boolean
  myResponseMessage?: string | null
  candidates: WorkspaceCandidate[]
  canManageOrders?: boolean
  canViewBaseCandidates?: boolean
  executorDashboardCandidates?: WorkspaceCandidate[]
  dashboardVacancies?: VacancyResponse[]
  isDashboardVacanciesLoading?: boolean
  isDashboardVacanciesError?: boolean
  onRetryDashboardVacancies?: () => void
  isLoading: boolean
  isCandidateDataLoading?: boolean
  isCandidateDataError?: boolean
  isSubmittingCandidateList?: boolean
  isOrdersError?: boolean
  isOrdersArchiving?: boolean
  isRejectingOrderExecutor?: boolean
  isOrdersStateUpdating?: boolean
  isPublishingVacancyForCustomer?: boolean
  onActivateOrders?: (orderIds: string[]) => void | Promise<void>
  onArchiveOrders?: (orderIds: string[]) => void | Promise<void>
  onCreateVacancyFromOrder?: (orderId: string) => void
  onCreateCandidateFromOrder?: (orderId: string) => void
  onOpenChat?: () => void
  onSetCandidateStage?: (
    orderId: string,
    candidateId: string,
    stage: 'Pool' | 'Shortlist',
  ) => void | Promise<void>
  onSubmitCandidateListForOrder?: (orderId: string) => boolean | Promise<boolean>
  onSelectVacancyCandidate?: (orderId: string, candidateId: string) => void | Promise<void>
  onPauseOrders?: (orderIds: string[]) => void | Promise<void>
  onOpenCandidate: (candidate: WorkspaceCandidate) => void
  onCloseOrderDetails?: () => void
  onOpenOrder: (order: WorkspaceOrder) => void
  onRetryCandidateData?: () => void
  onRetryOrders?: () => void
  onPublishVacancyForCustomer?: () => void | Promise<void>
  onMoveApplicantResponderToShortlist?: (orderId: string, candidateId: string) => void | Promise<void>
  onRejectApplicantResponder?: (orderId: string, candidateId: string) => void | Promise<void>
  onRejectOrderExecutor?: (orderId: string, executorId: string) => void | Promise<void>
  onRespondToOrder?: (orderId: string, message?: string) => void | Promise<boolean | void>
  onSelectOrderExecutor?: (orderId: string, executorId: string) => void | Promise<void>
  onSelectOrder: (orderId: string) => void
  orderResponses?: OrderExecutorResponseItemResponse[]
  orders: WorkspaceOrder[]
  requesterUserId?: string
  role?: WorkspaceRole
  selectedOrderDetails?: WorkspaceOrder | null
  selectedOrderApplicantResponders?: WorkspaceCandidate[]
  selectedOrderExecutorName?: string | null
  selectedOrderId: string | null
  requestedOrderDetailsId?: string | null
  selectedOrderVacancyPreview?: {
    title: string
    description: string
    status: 'Draft' | 'OnApproval' | 'Published'
    createdAtUtc: string
    updatedAtUtc: string
    shortlistSentToCustomerAtUtc?: string | null
  } | null
  view: 'dashboard' | 'orders' | 'candidates'
  isOrderResponsesLoading?: boolean
  isUpdatingApplicantResponderStage?: boolean
  isUpdatingCandidateStage?: boolean
  isRespondingToOrder?: boolean
  isSelectingOrderExecutor?: boolean
  canSelectFinalist?: boolean
  hasSelectedFinalist?: boolean
  isSelectingVacancyCandidate?: boolean
}

export type DashboardSort = 'updated' | 'responses' | 'priority' | 'dueDate'
export type DashboardState = 'all' | 'active' | 'completed' | 'paused' | 'archive'
export type CandidateSourceFilter = 'all' | 'registered' | 'recruiter'
export type CandidateStageFilter = 'all' | 'pool' | 'shortlist' | 'selected' | 'no_stage'

export type MainFeedPanelViewProps = MainFeedPanelProps & ReturnType<typeof useMainFeedPanelController>
