import type { FormEvent } from 'react'
import { getRequestErrorMessage } from '@/features/orders/lib/errors'

type OrderFormState = {
  title: string
  description: string
}

type SubmitMessage = {
  status: 'idle' | 'success' | 'error'
  text: string
}

type UpdateOrderRequestBody = {
  title?: string
  description?: string
  executorId?: string
}

type UseOrdersCrudActionsArgs = {
  canCreateOrder: boolean
  canEditOrder: boolean
  canDeleteOrder: boolean
  canAssignExecutor: boolean
  createForm: OrderFormState
  selectedExecutorIdsByOrder: Record<string, string>
  orderEditsById: Record<string, OrderFormState>
  setSubmitMessage: (message: SubmitMessage) => void
  resetCreateForm: () => void
  clearOrderEdit: (orderId: string) => void
  clearSelectedExecutor: (orderId: string) => void
  refetchOrders: () => Promise<unknown>
  createOrderRequest: (body: { title: string; description: string }) => Promise<unknown>
  updateOrderRequest: (args: { orderId: string; body: UpdateOrderRequestBody }) => Promise<unknown>
  deleteOrderRequest: (orderId: string) => Promise<unknown>
}

export function useOrdersCrudActions({
  canCreateOrder,
  canEditOrder,
  canDeleteOrder,
  canAssignExecutor,
  createForm,
  selectedExecutorIdsByOrder,
  orderEditsById,
  setSubmitMessage,
  resetCreateForm,
  clearOrderEdit,
  clearSelectedExecutor,
  refetchOrders,
  createOrderRequest,
  updateOrderRequest,
  deleteOrderRequest,
}: UseOrdersCrudActionsArgs) {
  // @dvnull: Ранее CRUD/use-case handlers были локально в OrdersPage; вынесены в model-хук без изменения проверок прав, текстов ошибок и reset/refetch последовательности.
  async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canCreateOrder) {
      setSubmitMessage({ status: 'error', text: 'Создавать заказ может только заказчик.' })
      return
    }

    const title = createForm.title.trim()
    const description = createForm.description.trim()

    if (!title || !description) {
      setSubmitMessage({ status: 'error', text: 'Заполните title и description.' })
      return
    }

    try {
      await createOrderRequest({ title, description })
      setSubmitMessage({ status: 'success', text: 'Заказ создан.' })
      resetCreateForm()
      await refetchOrders()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleAssignExecutor(orderId: string) {
    if (!canAssignExecutor) {
      setSubmitMessage({ status: 'error', text: 'Назначать рекрутера может только заказчик.' })
      return
    }

    const rawExecutorId = (selectedExecutorIdsByOrder[orderId] ?? '').trim()
    if (!rawExecutorId) {
      setSubmitMessage({ status: 'error', text: 'Выберите исполнителя перед назначением.' })
      return
    }

    try {
      await updateOrderRequest({
        orderId,
        body: { executorId: rawExecutorId },
      })
      setSubmitMessage({ status: 'success', text: 'Рекрутер назначен.' })
      await refetchOrders()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleUpdateOrderDetails(orderId: string, currentTitle: string, currentDescription: string) {
    if (!canEditOrder) {
      setSubmitMessage({ status: 'error', text: 'Редактировать заказ может только заказчик или администратор.' })
      return
    }

    const nextTitle = (orderEditsById[orderId]?.title ?? currentTitle).trim()
    const nextDescription = (orderEditsById[orderId]?.description ?? currentDescription).trim()
    if (!nextTitle || !nextDescription) {
      setSubmitMessage({ status: 'error', text: 'Для обновления заказа укажите title и description.' })
      return
    }

    try {
      await updateOrderRequest({
        orderId,
        body: {
          title: nextTitle,
          description: nextDescription,
        },
      })
      clearOrderEdit(orderId)
      setSubmitMessage({ status: 'success', text: 'Заказ обновлен.' })
      await refetchOrders()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleDeleteOrder(orderId: string) {
    if (!canDeleteOrder) {
      setSubmitMessage({ status: 'error', text: 'Удалять заказ может только заказчик или администратор.' })
      return
    }

    try {
      await deleteOrderRequest(orderId)
      clearOrderEdit(orderId)
      clearSelectedExecutor(orderId)
      setSubmitMessage({ status: 'success', text: 'Заказ удален.' })
      await refetchOrders()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  return {
    handleCreateOrder,
    handleAssignExecutor,
    handleUpdateOrderDetails,
    handleDeleteOrder,
  }
}
