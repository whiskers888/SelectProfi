import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { workspaceToneToBadgeVariant, type WorkspaceTone } from '../model/data'
import type { MainFeedPanelProps } from './MainFeedPanel.types'
import { OrderDetailsPagePanel } from './OrderDetailsPagePanel'
import { useMainFeedPanelController } from './hooks/useMainFeedPanelController'

type MainFeedPanelViewProps = MainFeedPanelProps & ReturnType<typeof useMainFeedPanelController>

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

export function MainFeedPanelView({
  allVisibleChecked,
  canManageOrderResponses = false,
  canManageOrders = false,
  canRespondToOrder = false,
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
  hasRespondedToOrder = false,
  isApplicantView,
  isBaseScope,
  isCandidateFiltersMenuOpen,
  isLoading,
  isOrderResponsesLoading = false,
  isOrdersArchiving = false,
  isOrdersStateUpdating = false,
  isRejectingOrderExecutor = false,
  isRespondingToOrder = false,
  isSelectingOrderExecutor = false,
  onActivateOrders,
  onArchiveOrders,
  onCloseOrderDetails,
  onOpenCandidate,
  onOpenOrder,
  onPauseOrders,
  onRejectOrderExecutor,
  onRespondToOrder,
  onSelectOrder,
  onSelectOrderExecutor,
  orderDataScope,
  orderResponses = [],
  orders,
  role = 'Executor',
  selectedDashboardOrder,
  selectedOrderDetails = null,
  selectedOrderExecutorName = null,
  selectedOrderId,
  setCandidateDataScope,
  setCandidateSourceFilter,
  setCandidateStageFilter,
  setDashboardState,
  setIsCandidateFiltersMenuOpen,
  setOrderDataScope,
  shouldShowBaseCandidateTab,
  shouldShowCandidateFilters,
  shouldShowCandidateScopeSwitcher,
  view,
  visibleDashboardOrders,
}: MainFeedPanelViewProps) {
  if (isLoading) {
    return renderLoading()
  }

  const isApplicantRole = role === 'Applicant'

  if (view === 'dashboard') {
    if (!selectedDashboardOrder || orders.length === 0) {
      return renderEmptyState(
        isApplicantRole ? 'Нет данных по вакансиям' : 'Нет данных по заказам',
        isApplicantRole
          ? 'Сейчас нет доступных вакансий. Попробуйте обновить страницу позже.'
          : 'Создайте новый заказ или снимите фильтры, чтобы увидеть активные вакансии.',
      )
    }

    return (
      <section className="preview11-card">
        <div className="preview11-orders-top">
          <div>
            <h3 className="preview11-panel-title">
              {isApplicantRole ? 'Вакансии' : 'Заказы в работе'}
            </h3>
            <p className="preview11-panel-subtitle">
              {isApplicantRole ? 'Выберите вакансию, чтобы открыть детали.' : 'Выберите заказ, чтобы открыть детали.'}
            </p>
          </div>
          <div className="preview11-orders-controls">
            <select
              className="preview11-select preview11-orders-select"
              onChange={(event) => handleDashboardSortChange(event.target.value)}
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
                onChange={(event) => handleSelectAllVisibleOrders(event.target.checked)}
                type="checkbox"
              />
              <span>Выбрать все</span>
              <span>{checkedVisibleOrderIds.length}</span>
            </label>
            <div className="preview11-orders-bulk-actions">
              <button
                className="preview11-mini-btn"
                disabled={checkedVisibleOrderIds.length === 0 || !canManageOrders || isOrdersStateUpdating}
                onClick={() => {
                  if (!onPauseOrders || checkedVisibleOrderIds.length === 0) {
                    return
                  }
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
                  void onArchiveOrders(checkedVisibleOrderIds)
                }}
                type="button"
              >
                {isOrdersArchiving ? 'Архивируем...' : 'В архив'}
              </button>
              <button
                className="preview11-mini-btn"
                disabled={checkedVisibleOrderIds.length === 0 || !canManageOrders || isOrdersStateUpdating}
                onClick={() => {
                  if (!onActivateOrders || checkedVisibleOrderIds.length === 0) {
                    return
                  }
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
              {visibleDashboardOrders.length === 0 ? (
                <div className="preview11-empty-state">
                  <p>Нет заказов в выбранном состоянии.</p>
                </div>
              ) : (
                visibleDashboardOrders.map((order) => (
                  <div key={order.id} className="preview11-order-row">
                    <div className="preview11-order-select-wrap">
                      <input
                        checked={checkedOrderIds.includes(order.id)}
                        className="preview11-order-select"
                        onChange={(event) => handleToggleOrderChecked(order.id, event.target.checked)}
                        type="checkbox"
                      />
                    </div>
                    <button
                      className={cn(
                        'preview11-feed-item',
                        selectedDashboardOrder.id === order.id
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
                        <span className={`preview11-tag ${toneClassName(order.statusTone)}`}>{order.statusLabel}</span>
                      </div>
                    </button>
                  </div>
                ))
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
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                className={cn(
                  'h-8 rounded-md px-3 text-xs font-medium',
                  orderDataScope === 'mine' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100',
                )}
                onClick={() => setOrderDataScope('mine')}
                type="button"
              >
                Мои заказы
              </button>
              <button
                className={cn(
                  'h-8 rounded-md px-3 text-xs font-medium',
                  orderDataScope === 'exchange' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100',
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
                    className={cn('cursor-pointer', selectedOrderId === order.id && 'bg-blue-50/70')}
                    onClick={() => {
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
                          {order.priority === 'high' ? 'Высокий' : order.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </Badge>
                      </TableCell>
                    ) : null}
                    {!isOrderDetailsOpen ? (
                      <TableCell>
                        <Badge variant={workspaceToneToBadgeVariant(order.statusTone)}>{order.statusLabel}</Badge>
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
              assignedExecutorName={selectedOrderExecutorName}
              canManageOrderResponses={canManageOrderResponses}
              canRespondToOrder={canRespondToOrder}
              hasRespondedToOrder={hasRespondedToOrder}
              isOrderResponsesLoading={isOrderResponsesLoading}
              isRejectingOrderExecutor={isRejectingOrderExecutor}
              isRespondingToOrder={isRespondingToOrder}
              isSelectingOrderExecutor={isSelectingOrderExecutor}
              onBack={onCloseOrderDetails ?? (() => {})}
              onRejectOrderExecutor={(executorId) => {
                if (!onRejectOrderExecutor) {
                  return
                }
                void onRejectOrderExecutor(selectedOrderDetails.id, executorId)
              }}
              onRespondToOrder={() => {
                if (!onRespondToOrder) {
                  return
                }
                void onRespondToOrder(selectedOrderDetails.id)
              }}
              onSelectOrderExecutor={(executorId) => {
                if (!onSelectOrderExecutor) {
                  return
                }
                void onSelectOrderExecutor(selectedOrderDetails.id, executorId)
              }}
              order={selectedOrderDetails}
              orderResponses={orderResponses}
            />
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{isApplicantView ? 'Мои резюме' : 'Кандидаты и этапы'}</h3>
        <div className="relative flex flex-wrap items-center gap-2">
          {shouldShowCandidateScopeSwitcher ? (
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                className={cn(
                  'h-8 rounded-md px-3 text-xs font-medium',
                  candidateDataScope === 'mine' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100',
                )}
                onClick={() => setCandidateDataScope('mine')}
                type="button"
              >
                Мои кандидаты
              </button>
              {shouldShowBaseCandidateTab ? (
                <button
                  className={cn(
                    'h-8 rounded-md px-3 text-xs font-medium',
                    candidateDataScope === 'base' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100',
                  )}
                  onClick={() => setCandidateDataScope('base')}
                  type="button"
                >
                  База кандидатов
                </button>
              ) : null}
            </div>
          ) : null}
          {shouldShowCandidateFilters ? (
            <>
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
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.04em] text-slate-500">Кандидаты</p>
                    <select
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      onChange={(event) => handleCandidateSourceFilterChange(event.target.value)}
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
                      onChange={(event) => handleCandidateStageFilterChange(event.target.value)}
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
            </>
          ) : null}
          <Badge variant="neutral">{filteredCandidateRows.length}</Badge>
        </div>
      </div>
      {filteredCandidateRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          {isApplicantView ? 'Резюме пока не добавлены.' : 'Кандидаты по текущим фильтрам не найдены.'}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{isApplicantView ? 'Резюме' : 'Кандидат'}</TableHead>
              {!isBaseScope ? <TableHead>Источник</TableHead> : null}
              <TableHead>Рейтинг</TableHead>
              {!isBaseScope ? <TableHead>Статус</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidateRows.map((candidate) => (
              <TableRow key={candidate.id} className="cursor-pointer" onClick={() => onOpenCandidate(candidate)}>
                <TableCell className="font-medium">{candidate.name}</TableCell>
                {!isBaseScope ? <TableCell>{candidate.source}</TableCell> : null}
                <TableCell>{candidate.rating}</TableCell>
                {!isBaseScope ? (
                  <TableCell>
                    {candidate.statusLabel.trim() ? (
                      <Badge variant={workspaceToneToBadgeVariant(candidate.statusTone)}>{candidate.statusLabel}</Badge>
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
