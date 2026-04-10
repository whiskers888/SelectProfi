import { type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type OrdersQueryField = 'limit' | 'offset'

export type OrdersPaginationSurfaceProps = {
  isLoading: boolean
  ordersLimitInput: string
  ordersOffsetInput: string
  currentOrdersLimit: number
  currentOrdersOffset: number
  isPreviousDisabled: boolean
  isNextDisabled: boolean
  onApplyOrdersQuery: (event: FormEvent<HTMLFormElement>) => void
  onOrdersQueryInputChange: (field: OrdersQueryField, event: ChangeEvent<HTMLInputElement>) => void
  onPreviousOrdersPage: () => void
  onNextOrdersPage: () => void
}

export function OrdersPaginationSurface({
  isLoading,
  ordersLimitInput,
  ordersOffsetInput,
  currentOrdersLimit,
  currentOrdersOffset,
  isPreviousDisabled,
  isNextDisabled,
  onApplyOrdersQuery,
  onOrdersQueryInputChange,
  onPreviousOrdersPage,
  onNextOrdersPage,
}: OrdersPaginationSurfaceProps) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Пагинация заказов</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={onApplyOrdersQuery} className="grid gap-3 md:grid-cols-4">
          <Input
            type="number"
            min={1}
            value={ordersLimitInput}
            onChange={(event) => onOrdersQueryInputChange('limit', event)}
            placeholder="limit"
            disabled={isLoading}
          />
          <Input
            type="number"
            min={0}
            value={ordersOffsetInput}
            onChange={(event) => onOrdersQueryInputChange('offset', event)}
            placeholder="offset"
            disabled={isLoading}
          />
          <Button type="submit" variant="outline" disabled={isLoading}>
            Применить
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onPreviousOrdersPage} disabled={isPreviousDisabled}>
              Назад
            </Button>
            <Button type="button" variant="outline" onClick={onNextOrdersPage} disabled={isNextDisabled}>
              Вперед
            </Button>
          </div>
        </form>
        <Alert>
          Текущая выборка: limit={currentOrdersLimit}, offset={currentOrdersOffset}
        </Alert>
      </CardContent>
    </Card>
  )
}
