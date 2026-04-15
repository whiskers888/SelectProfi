import { useEffect, useState } from 'react'
import type { WorkspaceOrder } from '../../model/data'
import type {
  CandidateSourceFilter,
  CandidateStageFilter,
  DashboardSort,
  DashboardState,
  MainFeedPanelProps,
} from '../MainFeedPanel.types'

const candidatesFiltersStorageKey = 'workspace-candidates-filters-v1'

function readInitialCandidateSourceFilter(): CandidateSourceFilter {
  if (typeof window === 'undefined') {
    return 'all'
  }

  try {
    const rawValue = window.localStorage.getItem(candidatesFiltersStorageKey)
    if (!rawValue) {
      return 'all'
    }

    const parsedValue = JSON.parse(rawValue) as { source?: CandidateSourceFilter }
    if (
      parsedValue.source === 'all' ||
      parsedValue.source === 'registered' ||
      parsedValue.source === 'recruiter'
    ) {
      return parsedValue.source
    }
  } catch {
    return 'all'
  }

  return 'all'
}

function readInitialCandidateStageFilter(): CandidateStageFilter {
  if (typeof window === 'undefined') {
    return 'all'
  }

  try {
    const rawValue = window.localStorage.getItem(candidatesFiltersStorageKey)
    if (!rawValue) {
      return 'all'
    }

    const parsedValue = JSON.parse(rawValue) as { stage?: CandidateStageFilter }
    if (
      parsedValue.stage === 'all' ||
      parsedValue.stage === 'pool' ||
      parsedValue.stage === 'shortlist' ||
      parsedValue.stage === 'selected' ||
      parsedValue.stage === 'no_stage'
    ) {
      return parsedValue.stage
    }
  } catch {
    return 'all'
  }

  return 'all'
}

export function useMainFeedPanelController({
  applicantRespondedOrderIds = [],
  baseCandidates,
  canViewBaseCandidates = false,
  candidates,
  orders,
  requesterUserId,
  role = 'Executor',
  selectedOrderId,
}: MainFeedPanelProps) {
  const [dashboardSort, setDashboardSort] = useState<DashboardSort>('updated')
  const [dashboardState, setDashboardState] = useState<DashboardState>('active')
  const [checkedOrderIds, setCheckedOrderIds] = useState<string[]>([])
  const [candidateDataScope, setCandidateDataScope] = useState<'mine' | 'base'>('mine')
  const [candidateSourceFilter, setCandidateSourceFilter] = useState<CandidateSourceFilter>(
    readInitialCandidateSourceFilter,
  )
  const [candidateStageFilter, setCandidateStageFilter] = useState<CandidateStageFilter>(
    readInitialCandidateStageFilter,
  )
  const [isCandidateFiltersMenuOpen, setIsCandidateFiltersMenuOpen] = useState(false)
  const [orderDataScope, setOrderDataScope] = useState<'mine' | 'exchange'>('mine')

  useEffect(() => {
    window.localStorage.setItem(
      candidatesFiltersStorageKey,
      JSON.stringify({ source: candidateSourceFilter, stage: candidateStageFilter }),
    )
  }, [candidateSourceFilter, candidateStageFilter])

  const dashboardOrders =
    role === 'Executor' && requesterUserId
      ? orders.filter((order) => order.executorId === requesterUserId)
      : orders
  const selectedDashboardOrder =
    dashboardOrders.find((order) => order.id === selectedOrderId) ?? (dashboardOrders.length > 0 ? dashboardOrders[0] : null)
  const scopedDashboardOrders =
    dashboardState === 'paused'
      ? dashboardOrders.filter((order) => !order.isArchived && Boolean(order.isPaused))
      : dashboardState === 'archive'
        ? dashboardOrders.filter((order) => order.isArchived)
        : dashboardOrders.filter((order) => !order.isArchived && !order.isPaused)
  const sortedDashboardOrders = [...scopedDashboardOrders]

  if (dashboardSort === 'responses') {
    sortedDashboardOrders.sort((left, right) => right.responses - left.responses)
  } else if (dashboardSort === 'priority') {
    const priorityWeight: Record<WorkspaceOrder['priority'], number> = {
      high: 0,
      medium: 1,
      low: 2,
    }
    sortedDashboardOrders.sort((left, right) => priorityWeight[left.priority] - priorityWeight[right.priority])
  }

  const visibleDashboardOrders = sortedDashboardOrders.slice(0, 4)
  const checkedVisibleOrderIds = checkedOrderIds.filter((checkedId) =>
    visibleDashboardOrders.some((order) => order.id === checkedId),
  )
  const allVisibleChecked =
    visibleDashboardOrders.length > 0 && checkedVisibleOrderIds.length === visibleDashboardOrders.length

  const filteredOrders = orders.filter((order) => {
    if (role === 'Applicant') {
      const hasResponded = applicantRespondedOrderIds.includes(order.id)
      return orderDataScope === 'mine' ? hasResponded : !hasResponded
    }

    if (orderDataScope === 'exchange') {
      return !order.executorId
    }

    if (!requesterUserId) {
      return true
    }

    return order.executorId === requesterUserId || order.customerId === requesterUserId
  })

  const candidateRows = candidateDataScope === 'base' && canViewBaseCandidates ? baseCandidates : candidates
  const filteredCandidateRows = candidateRows.filter((candidate) => {
    const matchesSource =
      candidateSourceFilter === 'all'
        ? true
        : candidateSourceFilter === 'registered'
          ? candidate.sourceType === 'RegisteredUser'
          : candidate.sourceType === 'AddedByExecutor'
    if (!matchesSource) {
      return false
    }

    const normalizedStatus = candidate.statusLabel.trim().toLowerCase()
    if (candidateStageFilter === 'all') {
      return true
    }
    if (candidateStageFilter === 'no_stage') {
      return normalizedStatus.length === 0
    }
    if (candidateStageFilter === 'pool') {
      return normalizedStatus === 'pool'
    }
    if (candidateStageFilter === 'shortlist') {
      return normalizedStatus === 'shortlist'
    }
    return normalizedStatus === 'выбран'
  })

  const isBaseScope = canViewBaseCandidates && candidateDataScope === 'base'
  const hasActiveCandidateFilters = candidateSourceFilter !== 'all' || candidateStageFilter !== 'all'
  const isApplicantView = role === 'Applicant'
  const shouldShowCandidateScopeSwitcher = role === 'Executor'
  const shouldShowCandidateFilters = !isApplicantView
  const shouldShowBaseCandidateTab = canViewBaseCandidates && !isApplicantView

  function handleDashboardSortChange(value: string) {
    if (value === 'updated' || value === 'responses' || value === 'priority') {
      setDashboardSort(value)
    }
  }

  function handleSelectAllVisibleOrders(nextChecked: boolean) {
    setCheckedOrderIds((previous) => {
      const withoutVisible = previous.filter(
        (orderId) => !visibleDashboardOrders.some((order) => order.id === orderId),
      )
      if (!nextChecked) {
        return withoutVisible
      }
      return [...withoutVisible, ...visibleDashboardOrders.map((order) => order.id)]
    })
  }

  function handleToggleOrderChecked(orderId: string, nextChecked: boolean) {
    setCheckedOrderIds((previous) => {
      if (nextChecked) {
        return previous.includes(orderId) ? previous : [...previous, orderId]
      }
      return previous.filter((currentOrderId) => currentOrderId !== orderId)
    })
  }

  function handleCandidateSourceFilterChange(value: string) {
    if (value === 'all' || value === 'registered' || value === 'recruiter') {
      setCandidateSourceFilter(value)
    }
  }

  function handleCandidateStageFilterChange(value: string) {
    if (value === 'all' || value === 'pool' || value === 'shortlist' || value === 'selected' || value === 'no_stage') {
      setCandidateStageFilter(value)
    }
  }

  return {
    allVisibleChecked,
    candidateDataScope,
    candidateSourceFilter,
    candidateStageFilter,
    checkedOrderIds,
    checkedVisibleOrderIds,
    dashboardSort,
    dashboardState,
    filteredCandidateRows,
    filteredOrders,
    handleCandidateSourceFilterChange,
    handleCandidateStageFilterChange,
    handleDashboardSortChange,
    handleSelectAllVisibleOrders,
    handleToggleOrderChecked,
    hasActiveCandidateFilters,
    isApplicantView,
    isBaseScope,
    isCandidateFiltersMenuOpen,
    orderDataScope,
    selectedDashboardOrder,
    setCandidateDataScope,
    setCandidateSourceFilter,
    setCandidateStageFilter,
    setDashboardState,
    setIsCandidateFiltersMenuOpen,
    setOrderDataScope,
    shouldShowBaseCandidateTab,
    shouldShowCandidateFilters,
    shouldShowCandidateScopeSwitcher,
    visibleDashboardOrders,
  }
}
