import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OrderResponse } from '@/shared/api/orders'

export type OrderDetailsSurfaceProps = {
  selectedOrderId: string
  isOrderDetailLoading: boolean
  orderDetailError: unknown
  orderDetail: OrderResponse | undefined
  getRequestErrorMessage: (error: unknown) => string
}

export function OrderDetailsSurface({
  selectedOrderId,
  isOrderDetailLoading,
  orderDetailError,
  orderDetail,
  getRequestErrorMessage,
}: OrderDetailsSurfaceProps) {
  if (!selectedOrderId) {
    return null
  }

  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Детали заказа</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isOrderDetailLoading ? <Alert>Загрузка деталей заказа...</Alert> : null}
        {!isOrderDetailLoading && orderDetailError ? (
          <Alert variant="destructive">{getRequestErrorMessage(orderDetailError)}</Alert>
        ) : null}
        {!isOrderDetailLoading && !orderDetailError && orderDetail ? (
          <>
            <p>Id: {orderDetail.id}</p>
            <p>CustomerId: {orderDetail.customerId}</p>
            <p>ExecutorId: {orderDetail.executorId ?? '—'}</p>
            <p>Title: {orderDetail.title}</p>
            <p>Description: {orderDetail.description}</p>
            <p>CreatedAtUtc: {orderDetail.createdAtUtc}</p>
            <p>UpdatedAtUtc: {orderDetail.updatedAtUtc}</p>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
