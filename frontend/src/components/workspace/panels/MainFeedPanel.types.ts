import type { OrderExecutorResponseItemResponse } from '@/shared/api/orders'
import type { WorkspaceCandidate, WorkspaceOrder, WorkspaceRole } from '../model/data'

export type MainFeedPanelProps = {
  baseCandidates: WorkspaceCandidate[]
  applicantRespondedOrderIds?: string[]
  canManageOrderResponses?: boolean
  canPublishVacancyForCustomer?: boolean
  canRespondToOrder?: boolean
  hasRespondedToOrder?: boolean
  candidates: WorkspaceCandidate[]
  canManageOrders?: boolean
  canViewBaseCandidates?: boolean
  isLoading: boolean
  isOrdersArchiving?: boolean
  isRejectingOrderExecutor?: boolean
  isOrdersStateUpdating?: boolean
  isPublishingVacancyForCustomer?: boolean
  onActivateOrders?: (orderIds: string[]) => void | Promise<void>
  onArchiveOrders?: (orderIds: string[]) => void | Promise<void>
  onCreateVacancyFromOrder?: (orderId: string) => void
  onPauseOrders?: (orderIds: string[]) => void | Promise<void>
  onOpenCandidate: (candidate: WorkspaceCandidate) => void
  onCloseOrderDetails?: () => void
  onOpenOrder: (order: WorkspaceOrder) => void
  onPublishVacancyForCustomer?: () => void | Promise<void>
  onMoveApplicantResponderToShortlist?: (orderId: string, candidateId: string) => void | Promise<void>
  onRejectApplicantResponder?: (orderId: string, candidateId: string) => void | Promise<void>
  onRejectOrderExecutor?: (orderId: string, executorId: string) => void | Promise<void>
  onRespondToOrder?: (orderId: string) => void | Promise<void>
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
  selectedOrderVacancyPreview?: {
    title: string
    description: string
  } | null
  view: 'dashboard' | 'orders' | 'candidates'
  isOrderResponsesLoading?: boolean
  isUpdatingApplicantResponderStage?: boolean
  isRespondingToOrder?: boolean
  isSelectingOrderExecutor?: boolean
}

export type DashboardSort = 'updated' | 'responses' | 'priority'
export type DashboardState = 'active' | 'paused' | 'archive'
export type CandidateSourceFilter = 'all' | 'registered' | 'recruiter'
export type CandidateStageFilter = 'all' | 'pool' | 'shortlist' | 'selected' | 'no_stage'
