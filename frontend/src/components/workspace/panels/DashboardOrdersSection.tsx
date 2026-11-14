import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { workspaceToneToBadgeVariant } from '../model/data'
import type { MainFeedPanelViewProps } from './MainFeedPanel.types'

interface DashboardOrdersSectionProps extends MainFeedPanelViewProps {
  stackHeader?: boolean
}

function renderEmptyState(title: string, description: string) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1">{description}</p>
    </div>
  )
}

function toOrderPriceLabel(price: number | null | undefined): string {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    return 'Стоимость требует уточнения'
  }

  return `${price.toLocaleString('ru-RU')} ₽`
}

export function DashboardOrdersSection({
  allVisibleChecked,
  canManageOrders = false,
  checkedOrderIds,
  checkedVisibleOrderIds,
  dashboardSort,
  dashboardState,
  handleDashboardSortChange,
  handleSelectAllVisibleOrders,
  handleToggleOrderChecked,
  isOrdersStateUpdating = false,
  onActivateOrders,
  onOpenOrder,
  onPauseOrders,
  onSelectOrder,
  orders,
  role = 'Executor',
  selectedDashboardOrder,
  stackHeader,
  setDashboardState,
  visibleDashboardOrders,
}: DashboardOrdersSectionProps) {
  const isApplicantRole = role === 'Applicant'
  const isExecutorRole = role === 'Executor'
  const ordersNoun = isExecutorRole ? 'проектов' : 'заказов'
  const orderNounSingular = isExecutorRole ? 'проект' : 'заказ'
  const ordersInWorkLabel = isExecutorRole ? 'Проекты в работе' : 'Заказы в работе'
  const orderPriceLabelPrefix = isExecutorRole ? 'К получению' : 'Цена'
  const canSelectDashboardOrders = canManageOrders && dashboardState !== 'archive'
  const shouldStackHeader = stackHeader ?? isExecutorRole

  if (orders.length === 0) {
    return renderEmptyState(
      isApplicantRole ? 'Нет откликов' : `Нет данных по ${ordersNoun}`,
      isApplicantRole
        ? 'Вы ещё не откликнулись ни на одну вакансию.'
        : `Создайте новый ${orderNounSingular} или снимите фильтры, чтобы увидеть активные вакансии.`,
    )
  }

  return (
    <section className="rounded-xl border border-border bg-card text-card-foreground shadow-none">
      <div className={cn('flex min-w-0 flex-col gap-4 border-b border-border p-4', !shouldStackHeader && 'lg:flex-row lg:items-start lg:justify-between')}>
        <div className="min-w-0">
          <h3 className="text-base font-semibold">
            {isApplicantRole ? 'Мои отклики' : ordersInWorkLabel}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isApplicantRole ? 'Здесь отображаются только вакансии, на которые вы откликнулись.' : `Выберите ${orderNounSingular}, чтобы открыть детали.`}
          </p>
        </div>
        <div className={cn('flex min-w-0 flex-col gap-3', shouldStackHeader ? 'items-stretch' : 'sm:flex-row sm:items-center')}>
          <div className="inline-flex w-fit rounded-lg border border-border bg-muted p-1" role="group" aria-label="Состояние заказов">
            <button
              aria-pressed={dashboardState === 'active'}
              className={cn('rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground', dashboardState === 'active' && 'bg-background text-foreground shadow-sm')}
              onClick={() => setDashboardState('active')}
              type="button"
            >
              Активные
            </button>
            {!isApplicantRole ? (
              <button
                aria-pressed={dashboardState === 'paused'}
                className={cn('rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground', dashboardState === 'paused' && 'bg-background text-foreground shadow-sm')}
                onClick={() => setDashboardState('paused')}
                type="button"
              >
                На паузе
              </button>
            ) : null}
            <button
              aria-pressed={dashboardState === 'archive'}
              className={cn('rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground', dashboardState === 'archive' && 'bg-background text-foreground shadow-sm')}
              onClick={() => setDashboardState('archive')}
              type="button"
            >
              Архив
            </button>
          </div>
          <select
            aria-label="Сортировка заказов"
            className={cn('h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring', shouldStackHeader && 'w-full')}
            onChange={(event) => handleDashboardSortChange(event.target.value)}
            value={dashboardSort}
          >
            <option value="updated">Сначала обновлённые</option>
            <option value="responses">По числу откликов</option>
            <option value="priority">По приоритету</option>
          </select>
        </div>
      </div>

      <div className="p-4">
        {canSelectDashboardOrders ? (
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                checked={allVisibleChecked}
                className="size-4 rounded border-input accent-primary"
                onChange={(event) => handleSelectAllVisibleOrders(event.target.checked)}
                type="checkbox"
              />
              <span>Выбрать все</span>
              <span className="text-muted-foreground">{checkedVisibleOrderIds.length}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {dashboardState === 'active' ? (
                <button
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                  disabled={checkedVisibleOrderIds.length === 0 || isOrdersStateUpdating}
                  onClick={() => {
                    if (!onPauseOrders || checkedVisibleOrderIds.length === 0) return
                    void onPauseOrders(checkedVisibleOrderIds)
                  }}
                  type="button"
                >
                  {isOrdersStateUpdating ? 'Обновляем...' : 'На паузу'}
                </button>
              ) : null}
              {dashboardState === 'paused' ? (
                <button
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                  disabled={checkedVisibleOrderIds.length === 0 || isOrdersStateUpdating}
                  onClick={() => {
                    if (!onActivateOrders || checkedVisibleOrderIds.length === 0) return
                    void onActivateOrders(checkedVisibleOrderIds)
                  }}
                  type="button"
                >
                  {isOrdersStateUpdating ? 'Обновляем...' : 'Активировать'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4">
          {visibleDashboardOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {`Нет ${ordersNoun} в выбранном состоянии.`}
            </div>
          ) : (
            visibleDashboardOrders.map((order) => {
              const isSelected = selectedDashboardOrder?.id === order.id
              return (
                <div
                  key={order.id}
                  className={cn('flex overflow-hidden rounded-lg border border-border transition-colors', canSelectDashboardOrders && 'items-stretch', isSelected && 'border-primary ring-1 ring-primary/30')}
                >
                  {canSelectDashboardOrders ? (
                    <div className="flex items-center px-3">
                      <input
                        aria-label={`Выбрать заказ ${order.title}`}
                        checked={checkedOrderIds.includes(order.id)}
                        className="size-4 rounded border-input accent-primary"
                        onChange={(event) => handleToggleOrderChecked(order.id, event.target.checked)}
                        type="checkbox"
                      />
                    </div>
                  ) : null}
                  <button
                    aria-pressed={isSelected}
                    className={cn('min-w-0 flex-1 p-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring', isSelected && 'bg-primary/5')}
                    onClick={() => {
                      onSelectOrder(order.id)
                      onOpenOrder(order)
                    }}
                    type="button"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{order.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {order.company} • {order.location}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <Badge variant={workspaceToneToBadgeVariant(order.statusTone)}>{order.statusLabel}</Badge>
                        {role !== 'Applicant' ? (
                          <p className="text-sm text-muted-foreground">
                            {orderPriceLabelPrefix}:{' '}
                            {toOrderPriceLabel(
                              isExecutorRole
                                ? order.executorNetAmount
                                : (order.grossAmount ?? order.price),
                            )}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
