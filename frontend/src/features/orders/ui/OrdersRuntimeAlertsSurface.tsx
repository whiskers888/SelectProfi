import { Alert } from '@/components/ui/alert'

export type OrdersRuntimeAlertsSurfaceProps = {
  isLoading: boolean
  isError: boolean
  error: unknown
  canAssignExecutor: boolean
  isExecutorsLoading: boolean
  executorsError: unknown
  executorsCount: number
  itemsCount: number
  currentOrdersOffset: number
  getRequestErrorMessage: (error: unknown) => string
}

export function OrdersRuntimeAlertsSurface({
  isLoading,
  isError,
  error,
  canAssignExecutor,
  isExecutorsLoading,
  executorsError,
  executorsCount,
  itemsCount,
  currentOrdersOffset,
  getRequestErrorMessage,
}: OrdersRuntimeAlertsSurfaceProps) {
  return (
    <>
      {isLoading ? <Alert>Загрузка заказов...</Alert> : null}
      {isError ? <Alert variant="destructive">{getRequestErrorMessage(error)}</Alert> : null}
      {!isLoading && !isError && !canAssignExecutor ? (
        <Alert>Назначение рекрутера доступно только для роли заказчика.</Alert>
      ) : null}
      {canAssignExecutor && isExecutorsLoading ? <Alert>Загрузка исполнителей...</Alert> : null}
      {canAssignExecutor && executorsError ? (
        <Alert variant="destructive">{getRequestErrorMessage(executorsError)}</Alert>
      ) : null}
      {canAssignExecutor && !isExecutorsLoading && !executorsError && executorsCount === 0 ? (
        <Alert>Нет доступных исполнителей для назначения.</Alert>
      ) : null}
      {!isLoading && !isError && itemsCount === 0 ? (
        <Alert>
          {currentOrdersOffset > 0
            ? 'На выбранной странице заказов нет. Измените offset или вернитесь назад.'
            : 'Пока нет заказов.'}
        </Alert>
      ) : null}
    </>
  )
}
