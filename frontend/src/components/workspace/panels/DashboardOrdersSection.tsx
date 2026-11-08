import { cn } from '@/lib/utils'
import { type WorkspaceTone } from '../model/data'
import type { MainFeedPanelViewProps } from './MainFeedPanel.types'

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
  setDashboardState,
  visibleDashboardOrders,
}: MainFeedPanelViewProps) {
  const isApplicantRole = role === 'Applicant'
  const isExecutorRole = role === 'Executor'
  const ordersNoun = isExecutorRole ? 'проектов' : 'заказов'
  const orderNounSingular = isExecutorRole ? 'проект' : 'заказ'
  const ordersInWorkLabel = isExecutorRole ? 'Проекты в работе' : 'Заказы в работе'
  const orderPriceLabelPrefix = isExecutorRole ? 'К получению' : 'Цена'
  const canSelectDashboardOrders = canManageOrders && dashboardState !== 'archive'

    if (!selectedDashboardOrder || orders.length === 0) {
      return renderEmptyState(
        isApplicantRole ? 'Нет откликов' : `Нет данных по ${ordersNoun}`,
        isApplicantRole
          ? 'Вы ещё не откликнулись ни на одну вакансию.'
          : `Создайте новый ${orderNounSingular} или снимите фильтры, чтобы увидеть активные вакансии.`,
      )
    }

    return (
      <section className="preview11-card">
        <div className="preview11-orders-top">
          <div>
            <h3 className="preview11-panel-title">
              {isApplicantRole ? 'Мои отклики' : ordersInWorkLabel}
            </h3>
            <p className="preview11-panel-subtitle">
              {isApplicantRole ? 'Здесь отображаются только вакансии, на которые вы откликнулись.' : `Выберите ${orderNounSingular}, чтобы открыть детали.`}
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
          </div>
        </div>

        <div className="preview11-panel-body">
          {canSelectDashboardOrders ? (
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
                {dashboardState === 'active' ? (
                  <button
                    className="preview11-mini-btn"
                    disabled={checkedVisibleOrderIds.length === 0 || isOrdersStateUpdating}
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
                ) : null}
                {dashboardState === 'paused' ? (
                  <button
                    className="preview11-mini-btn"
                    disabled={checkedVisibleOrderIds.length === 0 || isOrdersStateUpdating}
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
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="preview11-orders-layout">
            <div className="preview11-feed preview11-orders-feed">
              {visibleDashboardOrders.length === 0 ? (
                <div className="preview11-empty-state">
                  <p>{`Нет ${ordersNoun} в выбранном состоянии.`}</p>
                </div>
              ) : (
                visibleDashboardOrders.map((order) => (
                  <div
                    key={order.id}
                    className={cn(
                      'preview11-order-row',
                      canSelectDashboardOrders && 'preview11-order-row-with-selection',
                    )}
                  >
                    {canSelectDashboardOrders ? (
                      <div className="preview11-order-select-wrap">
                        <input
                          checked={checkedOrderIds.includes(order.id)}
                          className="preview11-order-select"
                          onChange={(event) => handleToggleOrderChecked(order.id, event.target.checked)}
                          type="checkbox"
                        />
                      </div>
                    ) : null}
                    <button
                      className={cn('preview11-feed-item', 'preview11-feed-item-hover')}
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
                        <div className="preview11-order-side">
                          <span className={`preview11-tag ${toneClassName(order.statusTone)}`}>{order.statusLabel}</span>
                          {role !== 'Applicant' ? (
                            <p className="preview11-order-price">
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
              {!isApplicantRole ? (
                <button
                  className={`preview11-state-btn${dashboardState === 'paused' ? ' preview11-state-btn-active' : ''}`}
                  onClick={() => setDashboardState('paused')}
                  type="button"
                >
                  На паузе
                </button>
              ) : null}
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
