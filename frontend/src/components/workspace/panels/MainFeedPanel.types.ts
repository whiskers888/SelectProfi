import type { OrderExecutorResponseItemResponse } from '@/shared/api/orders'
import type { WorkspaceCandidate, WorkspaceOrder, WorkspaceRole } from '../model/data'

export type MainFeedPanelProps = {
  baseCandidates: WorkspaceCandidate[]
  canManageOrderResponses?: boolean
  canRespondToOrder?: boolean
  hasRespondedToOrder?: boolean
  candidates: WorkspaceCandidate[]
  canManageOrders?: boolean
  canViewBaseCandidates?: boolean
  isLoading: boolean
  isOrdersArchiving?: boolean
  isRejectingOrderExecutor?: boolean
  isOrdersStateUpdating?: boolean
  onActivateOrders?: (orderIds: string[]) => void | Promise<void>
  onArchiveOrders?: (orderIds: string[]) => void | Promise<void>
  onPauseOrders?: (orderIds: string[]) => void | Promise<void>
  onOpenCandidate: (candidate: WorkspaceCandidate) => void
  onCloseOrderDetails?: () => void
  onOpenOrder: (order: WorkspaceOrder) => void
  onRejectOrderExecutor?: (orderId: string, executorId: string) => void | Promise<void>
  onRespondToOrder?: (orderId: string) => void | Promise<void>
  onSelectOrderExecutor?: (orderId: string, executorId: string) => void | Promise<void>
  onSelectOrder: (orderId: string) => void
  orderResponses?: OrderExecutorResponseItemResponse[]
  orders: WorkspaceOrder[]
  requesterUserId?: string
  role?: WorkspaceRole
  selectedOrderDetails?: WorkspaceOrder | null
  selectedOrderExecutorName?: string | null
  selectedOrderId: string | null
  view: 'dashboard' | 'orders' | 'candidates'
  isOrderResponsesLoading?: boolean
  isRespondingToOrder?: boolean
  isSelectingOrderExecutor?: boolean
}

export type DashboardSort = 'updated' | 'responses' | 'priority'
export type DashboardState = 'active' | 'paused' | 'archive'
export type CandidateSourceFilter = 'all' | 'registered' | 'recruiter'
export type CandidateStageFilter = 'all' | 'pool' | 'shortlist' | 'selected' | 'no_stage'
