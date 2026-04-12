import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { workspaceToneToBadgeVariant, type WorkspaceOrder } from '../model/data'
import type { OrderExecutorResponseItemResponse } from '@/shared/api/orders'

type OrderDetailsPagePanelProps = {
  canManageOrderResponses?: boolean
  hasRespondedToOrder?: boolean
  canRespondToOrder?: boolean
  isOrderResponsesLoading?: boolean
  isRejectingOrderExecutor?: boolean
  isRespondingToOrder?: boolean
  isSelectingOrderExecutor?: boolean
  order: WorkspaceOrder
  assignedExecutorName?: string | null
  onBack: () => void
  onRespondToOrder?: () => void | Promise<void>
  onRejectOrderExecutor?: (executorId: string) => void | Promise<void>
  onSelectOrderExecutor?: (executorId: string) => void | Promise<void>
  orderResponses?: OrderExecutorResponseItemResponse[]
}

export function OrderDetailsPagePanel({
  canManageOrderResponses = false,
  hasRespondedToOrder = false,
  canRespondToOrder = false,
  isOrderResponsesLoading = false,
  isRejectingOrderExecutor = false,
  isRespondingToOrder = false,
  isSelectingOrderExecutor = false,
  order,
  assignedExecutorName = null,
  onBack,
  onRespondToOrder,
  onRejectOrderExecutor,
  onSelectOrderExecutor,
  orderResponses = [],
}: OrderDetailsPagePanelProps) {
  const hasAssignedExecutor = Boolean(order.executorId)
  const [isResponsesExpanded, setIsResponsesExpanded] = useState(() => !hasAssignedExecutor)
  const [expandedExecutorIds, setExpandedExecutorIds] = useState<Set<string>>(() => new Set<string>())

  function toStatusLabel(status: OrderExecutorResponseItemResponse['status']): string {
    if (status === 'Pending') {
      return 'Ожидает'
    }

    if (status === 'Accepted') {
      return 'Принят'
    }

    if (status === 'Rejected') {
      return 'Отклонен'
    }

    return 'Отозван'
  }

  const showChatWithExecutorButton = canManageOrderResponses && Boolean(order.executorId)
  const showChatWithCustomerButton = !canManageOrderResponses

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Детали заказа</h3>
          <p className="mt-1 text-sm text-slate-600">{order.updatedAt}</p>
        </div>
        <Button
          className="h-10 rounded-xl border-slate-200 text-slate-700"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          Назад
        </Button>
      </div>

      <dl className="mt-4 grid gap-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">Вакансия</dt>
          <dd className="mt-1 text-sm text-slate-900">{order.title}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">Компания</dt>
          <dd className="mt-1 text-sm text-slate-900">{order.company}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">Локация</dt>
          <dd className="mt-1 text-sm text-slate-900">{order.location}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">Отклики</dt>
          <dd className="mt-1 text-sm text-slate-900">{order.responses}</dd>
        </div>
        <div className="pt-1">
          <Badge variant={workspaceToneToBadgeVariant(order.statusTone)}>{order.statusLabel}</Badge>
        </div>
        {canManageOrderResponses && hasAssignedExecutor ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
              Назначенный исполнитель
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{assignedExecutorName || 'Исполнитель назначен'}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5">
        {canRespondToOrder ? (
          <Button
            className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            disabled={isRespondingToOrder || hasRespondedToOrder}
            onClick={() => {
              if (!onRespondToOrder) {
                return
              }
              void onRespondToOrder()
            }}
            type="button"
          >
            {hasRespondedToOrder
              ? 'Вы уже откликнулись'
              : isRespondingToOrder
                ? 'Отправляем отклик...'
                : 'Откликнуться на заказ'}
          </Button>
        ) : null}
      </div>

      {showChatWithCustomerButton ? (
        <div className="mt-3">
          <Button className="h-10 rounded-xl" type="button" variant="outline">
            Перейти в чат с заказчиком
          </Button>
        </div>
      ) : null}
      {showChatWithExecutorButton ? (
        <div className="mt-3">
          <Button className="h-10 rounded-xl" type="button" variant="outline">
            Перейти в чат с исполнителем
          </Button>
        </div>
      ) : null}

      {canManageOrderResponses ? (
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">Отклики исполнителей</h4>
            {hasAssignedExecutor ? (
              <Button
                aria-label={isResponsesExpanded ? 'Свернуть отклики' : 'Раскрыть отклики'}
                className="h-7 w-7 rounded-lg"
                onClick={() => setIsResponsesExpanded((previousValue) => !previousValue)}
                type="button"
                variant="outline"
              >
                {isResponsesExpanded ? '▾' : '▸'}
              </Button>
            ) : null}
          </div>
          {isResponsesExpanded && isOrderResponsesLoading ? (
            <p className="mt-2 text-sm text-slate-500">Загружаем отклики...</p>
          ) : null}
          {isResponsesExpanded && !isOrderResponsesLoading && orderResponses.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Пока нет откликов исполнителей.</p>
          ) : null}
          {isResponsesExpanded && !isOrderResponsesLoading && orderResponses.length > 0 ? (
            <div className="mt-3 space-y-2">
              {orderResponses.map((response) => (
                <div
                  key={response.executorId}
                  className="cursor-pointer rounded-lg border border-slate-200 p-3"
                  onClick={() => {
                    setExpandedExecutorIds((previousValue) => {
                      const nextValue = new Set(previousValue)
                      if (nextValue.has(response.executorId)) {
                        nextValue.delete(response.executorId)
                      } else {
                        nextValue.add(response.executorId)
                      }
                      return nextValue
                    })
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{response.executorFullName || response.executorId}</p>
                      <p className="text-xs text-slate-500">
                        {toStatusLabel(response.status)} · {new Date(response.updatedAtUtc).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {response.status === 'Pending' ? (
                        <>
                          <Button
                            className="h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            disabled={isSelectingOrderExecutor || isRejectingOrderExecutor}
                            onClick={(event) => {
                              // @dvnull: Действия в строке отклика не должны переключать раскрытие профиля по клику строки.
                              event.stopPropagation()
                              if (!onSelectOrderExecutor) {
                                return
                              }
                              void onSelectOrderExecutor(response.executorId)
                            }}
                            type="button"
                          >
                            {isSelectingOrderExecutor ? 'Выбираем...' : 'Выбрать исполнителя'}
                          </Button>
                          <Button
                            className="h-8 rounded-lg border-red-300 text-red-700 hover:bg-red-50"
                            disabled={isSelectingOrderExecutor || isRejectingOrderExecutor}
                            onClick={(event) => {
                              // @dvnull: Действия в строке отклика не должны переключать раскрытие профиля по клику строки.
                              event.stopPropagation()
                              if (!onRejectOrderExecutor) {
                                return
                              }
                              void onRejectOrderExecutor(response.executorId)
                            }}
                            type="button"
                            variant="outline"
                          >
                            {isRejectingOrderExecutor ? 'Отклоняем...' : 'Отклонить'}
                          </Button>
                          <Button
                            aria-label="Перейти в чат с исполнителем"
                            className="h-8 w-8 rounded-lg"
                            onClick={(event) => {
                              // @dvnull: Действия в строке отклика не должны переключать раскрытие профиля по клику строки.
                              event.stopPropagation()
                            }}
                            type="button"
                            variant="outline"
                          >
                            💬
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {expandedExecutorIds.has(response.executorId) ? (
                    <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-700">
                      <p><span className="font-semibold">Грейд:</span> {response.executorGrade || '—'}</p>
                      <p><span className="font-semibold">Текущий проект:</span> {response.executorProjectTitle || '—'}</p>
                      <p><span className="font-semibold">Компания:</span> {response.executorProjectCompanyName || '—'}</p>
                      <p><span className="font-semibold">Опыт:</span> {response.executorExperienceSummary || '—'}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
