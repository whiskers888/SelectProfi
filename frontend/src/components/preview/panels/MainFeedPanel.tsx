import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  previewToneToBadgeVariant,
  type PreviewCandidate,
  type PreviewOrder,
  type PreviewTone,
} from '../model/data'

type MainFeedPanelProps = {
  candidates: PreviewCandidate[]
  isLoading: boolean
  onOpenCandidate: (candidate: PreviewCandidate) => void
  onOpenOrder: (order: PreviewOrder) => void
  onSelectOrder: (orderId: string) => void
  orders: PreviewOrder[]
  selectedOrderId: string | null
  view: 'dashboard' | 'orders' | 'candidates'
}

type DashboardSort = 'updated' | 'responses' | 'priority'
type DashboardState = 'active' | 'paused' | 'archive'

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

function toneClassName(tone: PreviewTone): string {
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
  candidates,
  isLoading,
  onOpenCandidate,
  onOpenOrder,
  onSelectOrder,
  orders,
  selectedOrderId,
  view,
}: MainFeedPanelProps) {
  const [dashboardSort, setDashboardSort] = useState<DashboardSort>('updated')
  const [dashboardState, setDashboardState] = useState<DashboardState>('active')
  const [checkedOrderIds, setCheckedOrderIds] = useState<string[]>([])

  if (isLoading) {
    return renderLoading()
  }

  if (view === 'dashboard') {
    const selectedOrder =
      orders.find((order) => order.id === selectedOrderId) ??
      (orders.length > 0 ? orders[0] : null)
    const scopedOrders =
      dashboardState === 'paused'
        ? orders.filter((order) => order.statusTone === 'danger')
        : dashboardState === 'archive'
          ? []
          : orders
    const sortedOrders = [...scopedOrders]

    if (dashboardSort === 'responses') {
      sortedOrders.sort((left, right) => right.responses - left.responses)
    } else if (dashboardSort === 'priority') {
      const priorityWeight: Record<PreviewOrder['priority'], number> = {
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
              <button className="preview11-mini-btn" disabled={checkedVisibleOrderIds.length === 0} type="button">
                На паузу
              </button>
              <button className="preview11-mini-btn" disabled={checkedVisibleOrderIds.length === 0} type="button">
                В архив
              </button>
              <button className="preview11-mini-btn" disabled={checkedVisibleOrderIds.length === 0} type="button">
                Активировать
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
    if (orders.length === 0) {
      return renderEmptyState(
        'Заказы не найдены',
        'По текущему фильтру нет заказов. Измените фильтр или очистите поиск.',
      )
    }

    return (
      <Card className="rounded-xl border-slate-200 p-4 shadow-none">
        <h3 className="mb-3 text-base font-semibold text-slate-900">Список заказов</h3>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Вакансия</TableHead>
              <TableHead>Компания</TableHead>
              <TableHead>Локация</TableHead>
              <TableHead>Приоритет</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className={cn(
                  'cursor-pointer',
                  selectedOrderId === order.id && 'bg-blue-50/70',
                )}
                onClick={() => onSelectOrder(order.id)}
              >
                <TableCell className="font-medium">{order.title}</TableCell>
                <TableCell>{order.company}</TableCell>
                <TableCell>{order.location}</TableCell>
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
                <TableCell>
                  <Badge variant={previewToneToBadgeVariant(order.statusTone)}>
                    {order.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    className="h-8 rounded-lg border-slate-200 text-slate-700"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenOrder(order)
                    }}
                    type="button"
                    variant="outline"
                  >
                    Детали
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    )
  }

  if (candidates.length === 0) {
    return renderEmptyState(
      'Кандидаты не найдены',
      'Список пуст по текущему поиску. Попробуйте сменить запрос или сбросить фильтры.',
    )
  }

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <h3 className="mb-3 text-base font-semibold text-slate-900">Кандидаты и этапы</h3>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Кандидат</TableHead>
            <TableHead>Позиция</TableHead>
            <TableHead>Источник</TableHead>
            <TableHead>Рейтинг</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="font-medium">{candidate.name}</TableCell>
              <TableCell>{candidate.position}</TableCell>
              <TableCell>{candidate.source}</TableCell>
              <TableCell>{candidate.rating}</TableCell>
              <TableCell>
                <Badge variant={previewToneToBadgeVariant(candidate.statusTone)}>
                  {candidate.statusLabel}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  className="h-8 rounded-lg border-slate-200 text-slate-700"
                  onClick={() => onOpenCandidate(candidate)}
                  type="button"
                  variant="outline"
                >
                  Профиль
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
