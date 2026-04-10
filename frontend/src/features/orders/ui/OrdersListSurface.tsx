import { type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { OrderExecutorResponse, OrderResponse } from '@/shared/api/orders'

type OrderEditField = 'title' | 'description'

export type OrdersListSurfaceProps = {
  items: OrderResponse[]
  orderEditsById: Record<string, { title: string; description: string }>
  selectedExecutorIdsByOrder: Record<string, string>
  executors: OrderExecutorResponse[]
  canEditOrder: boolean
  canAssignExecutor: boolean
  canDeleteOrder: boolean
  isOrderMutationLoading: boolean
  isExecutorsLoading: boolean
  hasExecutorsError: boolean
  isOrderDetailLoading: boolean
  onOrderEditInputChange: (
    orderId: string,
    field: OrderEditField,
    event: ChangeEvent<HTMLInputElement>,
    currentTitle: string,
    currentDescription: string,
  ) => void
  onUpdateOrderDetails: (orderId: string, currentTitle: string, currentDescription: string) => void | Promise<void>
  onExecutorSelectChange: (orderId: string, event: ChangeEvent<HTMLSelectElement>) => void
  onAssignExecutor: (orderId: string) => void | Promise<void>
  onLoadOrderDetails: (orderId: string) => void | Promise<void>
  onDeleteOrder: (orderId: string) => void | Promise<void>
}

export function OrdersListSurface({
  items,
  orderEditsById,
  selectedExecutorIdsByOrder,
  executors,
  canEditOrder,
  canAssignExecutor,
  canDeleteOrder,
  isOrderMutationLoading,
  isExecutorsLoading,
  hasExecutorsError,
  isOrderDetailLoading,
  onOrderEditInputChange,
  onUpdateOrderDetails,
  onExecutorSelectChange,
  onAssignExecutor,
  onLoadOrderDetails,
  onDeleteOrder,
}: OrdersListSurfaceProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Заголовок</TableHead>
          <TableHead>Описание</TableHead>
          <TableHead className="w-[160px]">Редактирование</TableHead>
          <TableHead>ExecutorId</TableHead>
          <TableHead className="w-[300px]">Назначение</TableHead>
          <TableHead className="w-[140px]">Детали</TableHead>
          <TableHead className="w-[140px]">Удаление</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((order) => {
          const editedTitle = orderEditsById[order.id]?.title ?? order.title
          const editedDescription = orderEditsById[order.id]?.description ?? order.description

          return (
            <TableRow key={order.id}>
              <TableCell>
                <Input
                  value={editedTitle}
                  onChange={(event) => onOrderEditInputChange(order.id, 'title', event, order.title, order.description)}
                  placeholder="Заголовок заказа"
                  disabled={!canEditOrder || isOrderMutationLoading}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={editedDescription}
                  onChange={(event) =>
                    onOrderEditInputChange(order.id, 'description', event, order.title, order.description)
                  }
                  placeholder="Описание заказа"
                  disabled={!canEditOrder || isOrderMutationLoading}
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onUpdateOrderDetails(order.id, order.title, order.description)}
                  disabled={!canEditOrder || isOrderMutationLoading}
                >
                  Сохранить
                </Button>
              </TableCell>
              <TableCell>{order.executorId ?? '—'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <select
                    value={selectedExecutorIdsByOrder[order.id] ?? order.executorId ?? ''}
                    onChange={(event) => onExecutorSelectChange(order.id, event)}
                    className="h-10 min-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={
                      !canAssignExecutor ||
                      isOrderMutationLoading ||
                      isExecutorsLoading ||
                      hasExecutorsError ||
                      executors.length === 0
                    }
                  >
                    <option value="" disabled>
                      Выберите исполнителя
                    </option>
                    {executors.map((executor) => (
                      <option key={executor.id} value={executor.id}>
                        {executor.fullName} ({executor.id})
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() => void onAssignExecutor(order.id)}
                    disabled={
                      isOrderMutationLoading ||
                      !canAssignExecutor ||
                      isExecutorsLoading ||
                      hasExecutorsError ||
                      executors.length === 0 ||
                      !(selectedExecutorIdsByOrder[order.id] ?? order.executorId ?? '').trim()
                    }
                  >
                    Назначить
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onLoadOrderDetails(order.id)}
                  disabled={isOrderDetailLoading}
                >
                  Детали
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onDeleteOrder(order.id)}
                  disabled={!canDeleteOrder || isOrderMutationLoading}
                >
                  Удалить
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
