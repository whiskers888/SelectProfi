import { useEffect, useState } from 'react'
import { getWorkspaceCandidatePipelineStage } from '../../shell/workspaceShell.helpers'
import type { WorkspaceOrder } from '../../model/data'
import type {
  CandidateSourceFilter,
  CandidateStageFilter,
  DashboardSort,
  DashboardState,
  MainFeedPanelProps,
} from '../MainFeedPanel.types'

const candidatesFiltersStorageKey = 'workspace-candidates-filters-v1'

// Used by dashboard "Обзор" buttons: the candidates panel reads this preset when it mounts.
export function presetCandidateStageFilter(stage: CandidateStageFilter) {
  window.localStorage.setItem(candidatesFiltersStorageKey, JSON.stringify({ source: 'all', stage }))
}

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
  executorDashboardCandidates,
  dashboardVacancies,
  candidates,
  onSelectOrder,
  orders,
  requesterUserId,
  role = 'Executor',
  selectedOrderId,
  view,
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

  useEffect(() => {
    window.localStorage.setItem(
      candidatesFiltersStorageKey,
      JSON.stringify({ source: candidateSourceFilter, stage: candidateStageFilter }),
    )
  }, [candidateSourceFilter, candidateStageFilter])

  const dashboardOrders =
    role === 'Applicant'
      ? orders.filter((order) => applicantRespondedOrderIds.includes(order.id))
      : role === 'Executor' && requesterUserId
        ? orders.filter((order) => order.executorId === requesterUserId)
        : orders
  // The applicant does not manage pauses: a paused vacancy is shown in the archive until reactivated.
  const isInArchive = (order: WorkspaceOrder) =>
    Boolean(order.isArchived) || (role === 'Applicant' && Boolean(order.isPaused))
  const scopedDashboardOrders =
    dashboardState === 'paused'
      ? dashboardOrders.filter((order) => !order.isArchived && Boolean(order.isPaused))
      : dashboardState === 'archive'
        ? dashboardOrders.filter(isInArchive)
        : dashboardOrders.filter((order) => !isInArchive(order) && !order.isPaused)
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
  const shouldSelectVisibleDashboardOrder =
    view === 'dashboard' && (role === 'Customer' || role === 'Executor')
  const selectedDashboardOrder = shouldSelectVisibleDashboardOrder
    ? visibleDashboardOrders.find((order) => order.id === selectedOrderId) ??
      visibleDashboardOrders[0] ??
      null
    : dashboardOrders.find((order) => order.id === selectedOrderId) ?? dashboardOrders[0] ?? null
  const selectedDashboardOrderId = selectedDashboardOrder?.id
  const selectedDashboardOrderVacancies = selectedDashboardOrder
    ? dashboardVacancies?.filter((vacancy) => vacancy.orderId === selectedDashboardOrder.id)
    : undefined
  const selectedDashboardVacancy = selectedDashboardOrderVacancies
    ? selectedDashboardOrderVacancies.find((vacancy) => vacancy.status === 'Published') ??
      selectedDashboardOrderVacancies[0] ??
      null
    : null
  const selectedDashboardVacancyPreview = selectedDashboardVacancy
    ? {
        title: selectedDashboardVacancy.title,
        description: selectedDashboardVacancy.description,
        status: selectedDashboardVacancy.status,
        createdAtUtc: selectedDashboardVacancy.createdAtUtc,
        updatedAtUtc: selectedDashboardVacancy.updatedAtUtc,
        shortlistSentToCustomerAtUtc: selectedDashboardVacancy.shortlistSentToCustomerAtUtc,
      }
    : null

  useEffect(() => {
    if (
      !shouldSelectVisibleDashboardOrder ||
      !selectedDashboardOrderId ||
      selectedDashboardOrderId === selectedOrderId
    ) {
      return
    }

    onSelectOrder(selectedDashboardOrderId)
  }, [onSelectOrder, selectedDashboardOrderId, selectedOrderId, shouldSelectVisibleDashboardOrder])

  const checkedVisibleOrderIds = checkedOrderIds.filter((checkedId) =>
    visibleDashboardOrders.some((order) => order.id === checkedId),
  )
  const allVisibleChecked =
    visibleDashboardOrders.length > 0 && checkedVisibleOrderIds.length === visibleDashboardOrders.length

  const filteredOrders = orders.filter((order) => {
    if (role === 'Applicant') {
      return true
    }

    if (role === 'Executor') {
      return !order.executorId
    }

    if (!requesterUserId) {
      return true
    }

    return order.executorId === requesterUserId || order.customerId === requesterUserId
  })

  const candidateRows =
    role === 'Executor' && view === 'dashboard'
      ? executorDashboardCandidates ?? candidates
      : candidateDataScope === 'base' && canViewBaseCandidates
        ? baseCandidates
        : candidates
  const filteredCandidateRows = candidateRows.filter((candidate) => {
    if ((role === 'Customer' || role === 'Executor') && view === 'dashboard') {
      return true
    }

    const matchesSource =
      candidateSourceFilter === 'all'
        ? true
        : candidateSourceFilter === 'registered'
          ? candidate.sourceType === 'RegisteredUser'
          : candidate.sourceType === 'AddedByExecutor'
    if (!matchesSource) {
      return false
    }

    const stage = getWorkspaceCandidatePipelineStage(candidate)
    if (candidateStageFilter === 'all') {
      return true
    }
    if (candidateStageFilter === 'no_stage') {
      return stage === null
    }
    if (candidateStageFilter === 'pool') {
      return stage === 'Pool'
    }
    if (candidateStageFilter === 'shortlist') {
      return stage === 'Shortlist'
    }
    return stage === 'Selected'
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
    selectedDashboardOrder,
    selectedDashboardVacancyPreview,
    setCandidateDataScope,
    setCandidateSourceFilter,
    setCandidateStageFilter,
    setDashboardState,
    setIsCandidateFiltersMenuOpen,
    shouldShowBaseCandidateTab,
    shouldShowCandidateFilters,
    shouldShowCandidateScopeSwitcher,
    visibleDashboardOrders,
  }
}
