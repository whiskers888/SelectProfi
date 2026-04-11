import { getRequestErrorMessage } from '@/features/orders/lib/errors'

type SubmitMessage = {
  status: 'idle' | 'success' | 'error'
  text: string
}

type UseOrderDetailsActionsArgs = {
  setSelectedOrderId: (orderId: string) => void
  setSubmitMessage: (message: SubmitMessage) => void
  fetchOrderByIdRequest: (orderId: string) => Promise<{ id: string }>
}

export function useOrderDetailsActions({
  setSelectedOrderId,
  setSubmitMessage,
  fetchOrderByIdRequest,
}: UseOrderDetailsActionsArgs) {
  // @dvnull: Ранее handler загрузки деталей заказа был локально в OrdersPage; вынесен в model-хук без изменения порядка установки selectedOrderId и сообщений.
  async function handleLoadOrderDetails(orderId: string) {
    try {
      const result = await fetchOrderByIdRequest(orderId)
      setSelectedOrderId(result.id)
      setSubmitMessage({ status: 'success', text: 'Детали заказа загружены.' })
    } catch (requestError) {
      setSelectedOrderId(orderId)
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  return {
    handleLoadOrderDetails,
  }
}
