import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { OrderExecutorResponseItemResponse } from '@/shared/api/orders'
import {
  workspaceToneToBadgeVariant,
  type WorkspaceCandidate,
  type WorkspaceOrder,
  type WorkspaceTone,
} from '../model/data'
import { OrderDetailsPagePanel } from './OrderDetailsPagePanel'

type MainFeedPanelProps = {
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
  selectedOrderDetails?: WorkspaceOrder | null
  selectedOrderExecutorName?: string | null
  selectedOrderId: string | null
  view: 'dashboard' | 'orders' | 'candidates'
  isOrderResponsesLoading?: boolean
  isRespondingToOrder?: boolean
  isSelectingOrderExecutor?: boolean
}

type DashboardSort = 'updated' | 'responses' | 'priority'
type DashboardState = 'active' | 'paused' | 'archive'
type CandidateSourceFilter = 'all' | 'registered' | 'recruiter'
type CandidateStageFilter = 'all' | 'pool' | 'shortlist' | 'selected' | 'no_stage'

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

function renderLoading() {
  return (
    <div className="preview11-card">
      <div className="preview11-loading" role="status">
        <span aria-hidden="true" className="preview11-loading-spin" />
        <span>Обновляем данные раздела...</span>
      </div>
    </div>
  )
}

function renderEmptyState(title: string, description: string) {
  return (
    <div className="preview11-empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function toneClassName(tone: WorkspaceTone): string {
  if (tone === 'success') {
    return 'preview11-tag-ok'
  }

  if (tone === 'warning') {
    return 'preview11-tag-warn'
  }

  if (tone === 'danger') {
    return 'preview11-tag-danger'
  }

  return 'preview11-tag-neutral'
}

export function MainFeedPanel({
  baseCandidates,
  canManageOrderResponses = false,
  canRespondToOrder = false,
  hasRespondedToOrder = false,
  candidates,
  canManageOrders = false,
  canViewBaseCandidates = false,
  isLoading,
  isOrdersArchiving = false,
  isRejectingOrderExecutor = false,
  isOrdersStateUpdating = false,
  onActivateOrders,
  onArchiveOrders,
  onPauseOrders,
  onOpenCandidate,
  onCloseOrderDetails,
  onOpenOrder,
  onRejectOrderExecutor,
  onRespondToOrder,
  onSelectOrderExecutor,
  onSelectOrder,
  orderResponses = [],
  orders,
  requesterUserId,
  selectedOrderDetails = null,
  selectedOrderExecutorName = null,
  selectedOrderId,
  view,
  isOrderResponsesLoading = false,
  isRespondingToOrder = false,
  isSelectingOrderExecutor = false,
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

  if (isLoading) {
    return renderLoading()
  }

  if (view === 'dashboard') {
    const selectedOrder =
      orders.find((order) => order.id === selectedOrderId) ??
      (orders.length > 0 ? orders[0] : null)
    const scopedOrders =
      dashboardState === 'paused'
        ? orders.filter((order) => !order.isArchived && Boolean(order.isPaused))
        : dashboardState === 'archive'
          ? orders.filter((order) => order.isArchived)
          : orders.filter((order) => !order.isArchived && !order.isPaused)
    const sortedOrders = [...scopedOrders]

    if (dashboardSort === 'responses') {
      sortedOrders.sort((left, right) => right.responses - left.responses)
    } else if (dashboardSort === 'priority') {
      const priorityWeight: Record<WorkspaceOrder['priority'], number> = {
        high: 0,
        medium: 1,
        low: 2,
      }
      sortedOrders.sort((left, right) => priorityWeight[left.priority] - priorityWeight[right.priority])
    }

    const visibleOrders = sortedOrders.slice(0, 4)
    const checkedVisibleOrderIds = checkedOrderIds.filter((checkedId) =>
      visibleOrders.some((order) => order.id === checkedId),
    )
    const allVisibleChecked =
      visibleOrders.length > 0 && checkedVisibleOrderIds.length === visibleOrders.length

    if (!selectedOrder || orders.length === 0) {
      return renderEmptyState(
        'Нет данных по заказам',
        'Создайте новый заказ или снимите фильтры, чтобы увидеть активные вакансии.',
      )
    }

    return (
      <section className="preview11-card">
        <div className="preview11-orders-top">
          <div>
            <h3 className="preview11-panel-title">Заказы в работе</h3>
            <p className="preview11-panel-subtitle">Выберите заказ, чтобы открыть детали.</p>
          </div>
          <div className="preview11-orders-controls">
            <select
              className="preview11-select preview11-orders-select"
              onChange={(event) => {
                const value = event.target.value
                if (value === 'updated' || value === 'responses' || value === 'priority') {
                  setDashboardSort(value)
                }
              }}
              value={dashboardSort}
            >
              <option value="updated">Сначала обновлённые</option>
              <option value="responses">По числу откликов</option>
              <option value="priority">По приоритету</option>
            </select>
            <button className="preview11-mini-btn" type="button">
              Фильтры
            </button>
          </div>
        </div>

        <div className="preview11-panel-body">
          <div className="preview11-orders-bulk">
            <label className="preview11-orders-bulk-left">
              <input
                checked={allVisibleChecked}
                className="preview11-order-select"
                onChange={(event) => {
                  const nextChecked = event.target.checked
                  setCheckedOrderIds((previous) => {
                    const withoutVisible = previous.filter(
                      (orderId) => !visibleOrders.some((order) => order.id === orderId),
                    )
                    if (!nextChecked) {
                      return withoutVisible
                    }
                    return [...withoutVisible, ...visibleOrders.map((order) => order.id)]
                  })
                }}
                type="checkbox"
              />
              <span>Выбрать все</span>
              <span>{checkedVisibleOrderIds.length}</span>
            </label>
            <div className="preview11-orders-bulk-actions">
              <button
                className="preview11-mini-btn"
                disabled={
                  checkedVisibleOrderIds.length === 0 ||
                  !canManageOrders ||
                  isOrdersStateUpdating
                }
                onClick={() => {
                  if (!onPauseOrders || checkedVisibleOrderIds.length === 0) {
                    return
                  }
                  // @dvnull: Кнопка "На паузу" переведена с UI-заглушки на PATCH-обновление статуса заказа.
                  void onPauseOrders(checkedVisibleOrderIds)
                }}
                type="button"
              >
                {isOrdersStateUpdating ? 'Обновляем...' : 'На паузу'}
              </button>
              <button
                className="preview11-mini-btn"
                disabled={
                  checkedVisibleOrderIds.length === 0 ||
                  !canManageOrders ||
                  isOrdersArchiving ||
                  dashboardState === 'archive'
                }
                onClick={() => {
                  if (!onArchiveOrders || checkedVisibleOrderIds.length === 0) {
                    return
                  }
                  // @dvnull: Кнопка "В архив" переведена с UI-заглушки на реальное действие soft delete через callback страницы.
                  void onArchiveOrders(checkedVisibleOrderIds)
                }}
                type="button"
              >
                {isOrdersArchiving ? 'Архивируем...' : 'В архив'}
              </button>
              <button
                className="preview11-mini-btn"
                disabled={
                  checkedVisibleOrderIds.length === 0 ||
                  !canManageOrders ||
                  isOrdersStateUpdating
                }
                onClick={() => {
                  if (!onActivateOrders || checkedVisibleOrderIds.length === 0) {
                    return
                  }
                  // @dvnull: Кнопка "Активировать" переведена с UI-заглушки на PATCH-обновление статуса заказа.
                  void onActivateOrders(checkedVisibleOrderIds)
                }}
                type="button"
              >
                {isOrdersStateUpdating ? 'Обновляем...' : 'Активировать'}
              </button>
            </div>
          </div>

          <div className="preview11-orders-layout">
            <div className="preview11-feed preview11-orders-feed">
              {/* @dvnull: Добавлен HTML-паттерн order-row + bulk/state rail без изменения основной логики выбора заказа. */}
              {visibleOrders.length === 0 ? (
                <div className="preview11-empty-state">
                  <p>Нет заказов в выбранном состоянии.</p>
                </div>
              ) : (
                visibleOrders.map((order) => {
                  const isChecked = checkedOrderIds.includes(order.id)

                  return (
                    <div key={order.id} className="preview11-order-row">
                      <div className="preview11-order-select-wrap">
                        <input
                          checked={isChecked}
                          className="preview11-order-select"
                          onChange={(event) => {
                            const nextChecked = event.target.checked
                            setCheckedOrderIds((previous) => {
                              if (nextChecked) {
                                return previous.includes(order.id) ? previous : [...previous, order.id]
                              }
                              return previous.filter((orderId) => orderId !== order.id)
                            })
                          }}
                          type="checkbox"
                        />
                      </div>
                      <button
                        className={cn(
                          'preview11-feed-item',
                          selectedOrder.id === order.id
                            ? 'preview11-feed-item-active'
                            : 'preview11-feed-item-hover',
                        )}
                        onClick={() => {
                          onSelectOrder(order.id)
                          onOpenOrder(order)
                        }}
                        type="button"
                      >
                        <div className="preview11-feed-item-top">
                          <div>
                            <p className="preview11-feed-item-title">{order.title}</p>
                            <p className="preview11-feed-item-text">
                              {order.company} • {order.location}
                            </p>
                          </div>
                          <span className={`preview11-tag ${toneClassName(order.statusTone)}`}>
                            {order.statusLabel}
                          </span>
                        </div>
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            <div className="preview11-state-rail">
              <button
                className={`preview11-state-btn${dashboardState === 'active' ? ' preview11-state-btn-active' : ''}`}
                onClick={() => setDashboardState('active')}
                type="button"
              >
                Активные
              </button>
              <button
                className={`preview11-state-btn${dashboardState === 'paused' ? ' preview11-state-btn-active' : ''}`}
                onClick={() => setDashboardState('paused')}
                type="button"
              >
                На паузе
              </button>
              <button
                className={`preview11-state-btn${dashboardState === 'archive' ? ' preview11-state-btn-active' : ''}`}
                onClick={() => setDashboardState('archive')}
                type="button"
              >
                Архив
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (view === 'orders') {
    const isOrderDetailsOpen = Boolean(selectedOrderDetails)
    const filteredOrders = orders.filter((order) => {
      if (orderDataScope === 'exchange') {
        return !order.executorId
      }

      if (!requesterUserId) {
        return true
      }

      return order.executorId === requesterUserId || order.customerId === requesterUserId
    })

    return (
      <div className="space-y-4 lg:flex lg:items-start lg:gap-4 lg:space-y-0">
        <Card
          className={cn(
            'rounded-xl border-slate-200 p-4 shadow-none transition-all duration-300 ease-out lg:flex-shrink-0',
            selectedOrderDetails ? 'lg:w-1/3' : 'lg:w-full',
          )}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">Список заказов</h3>
            {/* @dvnull: Добавлен UX-переключатель "Мои заказы/Биржа заказов" вместо единого плоского списка. */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                className={cn(
                  'h-8 rounded-md px-3 text-xs font-medium',
                  orderDataScope === 'mine'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100',
                )}
                onClick={() => setOrderDataScope('mine')}
                type="button"
              >
                Мои заказы
              </button>
              <button
                className={cn(
                  'h-8 rounded-md px-3 text-xs font-medium',
                  orderDataScope === 'exchange'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100',
                )}
                onClick={() => setOrderDataScope('exchange')}
                type="button"
              >
                Биржа заказов
              </button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Вакансия</TableHead>
                {!isOrderDetailsOpen ? <TableHead>Компания</TableHead> : null}
                {!isOrderDetailsOpen ? <TableHead>Локация</TableHead> : null}
                {!isOrderDetailsOpen ? <TableHead>Приоритет</TableHead> : null}
                {!isOrderDetailsOpen ? <TableHead>Статус</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell className="py-8 text-center text-sm text-slate-500" colSpan={isOrderDetailsOpen ? 1 : 5}>
                    {orderDataScope === 'mine'
                      ? 'В разделе "Мои заказы" пока нет записей.'
                      : 'В разделе "Биржа заказов" пока нет доступных заказов.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={cn(
                      'cursor-pointer',
                      selectedOrderId === order.id && 'bg-blue-50/70',
                    )}
                    onClick={() => {
                      // @dvnull: В режиме "Заказы" список теперь сжимается до 1/3, а справа выезжают детали выбранного заказа на 2/3.
                      onSelectOrder(order.id)
                      onOpenOrder(order)
                    }}
                  >
                    <TableCell className="font-medium">{order.title}</TableCell>
                    {!isOrderDetailsOpen ? <TableCell>{order.company}</TableCell> : null}
                    {!isOrderDetailsOpen ? <TableCell>{order.location}</TableCell> : null}
                    {!isOrderDetailsOpen ? (
                      <TableCell>
                        <Badge
                          variant={
                            order.priority === 'high'
                              ? 'destructive'
                              : order.priority === 'medium'
                                ? 'default'
                                : 'neutral'
                          }
                        >
                          {order.priority === 'high'
                            ? 'Высокий'
                            : order.priority === 'medium'
                              ? 'Средний'
                              : 'Низкий'}
                        </Badge>
                      </TableCell>
                    ) : null}
                    {!isOrderDetailsOpen ? (
                      <TableCell>
                        <Badge variant={workspaceToneToBadgeVariant(order.statusTone)}>
                          {order.statusLabel}
                        </Badge>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <div
          className={cn(
            'transition-all duration-300 ease-out lg:w-2/3',
            selectedOrderDetails
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-10 opacity-0 lg:w-0 lg:overflow-hidden',
          )}
        >
          {selectedOrderDetails ? (
            <OrderDetailsPagePanel
              key={`${selectedOrderDetails.id}:${selectedOrderDetails.executorId ?? 'none'}`}
              canManageOrderResponses={canManageOrderResponses}
              canRespondToOrder={canRespondToOrder}
              hasRespondedToOrder={hasRespondedToOrder}
              isOrderResponsesLoading={isOrderResponsesLoading}
              isRejectingOrderExecutor={isRejectingOrderExecutor}
              isRespondingToOrder={isRespondingToOrder}
              isSelectingOrderExecutor={isSelectingOrderExecutor}
              onBack={onCloseOrderDetails ?? (() => {})}
              onRespondToOrder={() => {
                if (!onRespondToOrder) {
                  return
                }
                void onRespondToOrder(selectedOrderDetails.id)
              }}
              onRejectOrderExecutor={(executorId) => {
                if (!onRejectOrderExecutor) {
                  return
                }
                void onRejectOrderExecutor(selectedOrderDetails.id, executorId)
              }}
              onSelectOrderExecutor={(executorId) => {
                if (!onSelectOrderExecutor) {
                  return
                }
                void onSelectOrderExecutor(selectedOrderDetails.id, executorId)
              }}
              order={selectedOrderDetails}
              assignedExecutorName={selectedOrderExecutorName}
              orderResponses={orderResponses}
            />
          ) : null}
        </div>
      </div>
    )
  }

  const scopedCandidates = candidates
  const scopedBaseCandidates = baseCandidates
  const candidateRows =
    candidateDataScope === 'base' && canViewBaseCandidates
      ? scopedBaseCandidates
      : scopedCandidates
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
  const hasActiveCandidateFilters =
    candidateSourceFilter !== 'all' || candidateStageFilter !== 'all'

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">Кандидаты и этапы</h3>
        <div className="relative flex flex-wrap items-center gap-2">
          {/* @dvnull: Ранее в разделе кандидатов был только один список; добавлен UX-переключатель "Мои кандидаты/База кандидатов" для явного выбора источника. */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              className={cn(
                'h-8 rounded-md px-3 text-xs font-medium',
                candidateDataScope === 'mine'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100',
              )}
              onClick={() => setCandidateDataScope('mine')}
              type="button"
            >
              Мои кандидаты
            </button>
            {canViewBaseCandidates ? (
              <button
                className={cn(
                  'h-8 rounded-md px-3 text-xs font-medium',
                  candidateDataScope === 'base'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100',
                )}
                onClick={() => setCandidateDataScope('base')}
                type="button"
              >
                База кандидатов
              </button>
            ) : null}
          </div>
          {/* @dvnull: Инлайн-select фильтров заменены на отдельную кнопку с выезжающим меню и сохранением выбранных значений. */}
          <button
            className={cn(
              'h-9 rounded-lg border px-3 text-sm',
              hasActiveCandidateFilters
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
            )}
            onClick={() => setIsCandidateFiltersMenuOpen((previousValue) => !previousValue)}
            type="button"
          >
            Фильтры
          </button>
          <div
            className={cn(
              'absolute right-0 top-full z-20 mt-2 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg transition-all duration-200',
              isCandidateFiltersMenuOpen
                ? 'translate-x-0 opacity-100'
                : 'pointer-events-none translate-x-3 opacity-0',
            )}
          >
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.04em] text-slate-500">
                  Кандидаты
                </p>
                <select
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === 'all' || value === 'registered' || value === 'recruiter') {
                      setCandidateSourceFilter(value)
                    }
                  }}
                  value={candidateSourceFilter}
                >
                  <option value="all">Все</option>
                  <option value="registered">Зарегистрированные</option>
                  <option value="recruiter">Рекрутерские</option>
                </select>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.04em] text-slate-500">Этапы</p>
                <select
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  onChange={(event) => {
                    const value = event.target.value
                    if (
                      value === 'all' ||
                      value === 'pool' ||
                      value === 'shortlist' ||
                      value === 'selected' ||
                      value === 'no_stage'
                    ) {
                      setCandidateStageFilter(value)
                    }
                  }}
                  value={candidateStageFilter}
                >
                  <option value="all">Все</option>
                  <option value="pool">Pool</option>
                  <option value="shortlist">Shortlist</option>
                  <option value="selected">Выбран</option>
                  <option value="no_stage">Без этапа</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setCandidateSourceFilter('all')
                    setCandidateStageFilter('all')
                  }}
                  type="button"
                >
                  Сбросить
                </button>
                <button
                  className="h-8 rounded-lg bg-slate-900 px-3 text-xs text-white hover:bg-slate-700"
                  onClick={() => setIsCandidateFiltersMenuOpen(false)}
                  type="button"
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
          <Badge variant="neutral">{filteredCandidateRows.length}</Badge>
        </div>
      </div>
      {filteredCandidateRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          Кандидаты по текущим фильтрам не найдены.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Кандидат</TableHead>
              {!isBaseScope ? <TableHead>Источник</TableHead> : null}
              <TableHead>Рейтинг</TableHead>
              {!isBaseScope ? <TableHead>Статус</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidateRows.map((candidate) => (
              <TableRow
                key={candidate.id}
                className="cursor-pointer"
                onClick={() => onOpenCandidate(candidate)}
              >
                <TableCell className="font-medium">{candidate.name}</TableCell>
                {!isBaseScope ? <TableCell>{candidate.source}</TableCell> : null}
                <TableCell>{candidate.rating}</TableCell>
                {!isBaseScope ? (
                  <TableCell>
                    {candidate.statusLabel.trim() ? (
                      <Badge variant={workspaceToneToBadgeVariant(candidate.statusTone)}>
                        {candidate.statusLabel}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}
