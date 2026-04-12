import { useCallback } from 'react'

type BannerVariant = 'default' | 'success' | 'destructive'

type OrderStatusContract = 'Active' | 'Paused'

type UnwrappableMutationResult<TResult> = {
  unwrap: () => Promise<TResult>
}

type MutationTrigger<TArgs, TResult> = (args: TArgs) => UnwrappableMutationResult<TResult>

type WorkspaceOrderActionsDependencies = {
  canManageOrder: boolean
  canManageOrderResponses: boolean
  deleteOrder: MutationTrigger<string, unknown>
  getRequestErrorMessage: (error: unknown) => string
  refetchOrderResponses: () => Promise<unknown>
  refetchOrders: () => Promise<unknown>
  rejectOrderResponseExecutor: MutationTrigger<{ executorId: string; orderId: string }, unknown>
  respondToOrder: MutationTrigger<string, unknown>
  selectedOrderId: string | null
  selectOrderResponseExecutor: MutationTrigger<{ executorId: string; orderId: string }, unknown>
  setBanner: (banner: { message: string; variant: BannerVariant }) => void
  setPreferredOrderId: (value: string | null | ((previousValue: string | null) => string | null)) => void
  setSelectedOrderId: (orderId: string | null) => void
  updateOrder: MutationTrigger<{ body: { status: OrderStatusContract }; orderId: string }, unknown>
}

export function useWorkspaceOrderActions({
  canManageOrder,
  canManageOrderResponses,
  deleteOrder,
  getRequestErrorMessage,
  refetchOrderResponses,
  refetchOrders,
  rejectOrderResponseExecutor,
  respondToOrder,
  selectedOrderId,
  selectOrderResponseExecutor,
  setBanner,
  setPreferredOrderId,
  setSelectedOrderId,
  updateOrder,
}: WorkspaceOrderActionsDependencies) {
  const handleRespondToOrder = useCallback(
    async (orderId: string) => {
      try {
        await respondToOrder(orderId).unwrap()
        setBanner({
          variant: 'success',
          message: 'Отклик на заказ отправлен.',
        })
        await refetchOrders()
      } catch (error) {
        setBanner({
          variant: 'destructive',
          message: getRequestErrorMessage(error),
        })
      }
    },
    [getRequestErrorMessage, refetchOrders, respondToOrder, setBanner],
  )

  const handleSelectOrderExecutor = useCallback(
    async (orderId: string, executorId: string) => {
      try {
        await selectOrderResponseExecutor({ orderId, executorId }).unwrap()
        setBanner({
          variant: 'success',
          message: 'Исполнитель выбран.',
        })
        await refetchOrders()
        if (canManageOrderResponses && selectedOrderId === orderId) {
          await refetchOrderResponses()
        }
      } catch (error) {
        setBanner({
          variant: 'destructive',
          message: getRequestErrorMessage(error),
        })
      }
    },
    [
      canManageOrderResponses,
      getRequestErrorMessage,
      refetchOrderResponses,
      refetchOrders,
      selectOrderResponseExecutor,
      selectedOrderId,
      setBanner,
    ],
  )

  const handleRejectOrderExecutor = useCallback(
    async (orderId: string, executorId: string) => {
      try {
        await rejectOrderResponseExecutor({ orderId, executorId }).unwrap()
        setBanner({
          variant: 'success',
          message: 'Отклик исполнителя отклонен.',
        })
        if (canManageOrderResponses && selectedOrderId === orderId) {
          await refetchOrderResponses()
        }
      } catch (error) {
        setBanner({
          variant: 'destructive',
          message: getRequestErrorMessage(error),
        })
      }
    },
    [
      canManageOrderResponses,
      getRequestErrorMessage,
      refetchOrderResponses,
      rejectOrderResponseExecutor,
      selectedOrderId,
      setBanner,
    ],
  )

  const handleUpdateOrdersStatus = useCallback(
    async (orderIds: string[], status: OrderStatusContract) => {
      if (orderIds.length === 0) {
        return
      }

      if (!canManageOrder) {
        setBanner({
          variant: 'destructive',
          message: 'Изменять статус заказа может только заказчик или администратор.',
        })
        return
      }

      const targetLabel = status === 'Paused' ? 'на паузу' : 'в активные'
      const confirmed = window.confirm(`Перевести выбранные заказы (${orderIds.length}) ${targetLabel}?`)
      if (!confirmed) {
        return
      }

      try {
        const results = await Promise.allSettled(
          orderIds.map(async (orderId) => {
            await updateOrder({
              orderId,
              body: { status },
            }).unwrap()
          }),
        )
        const succeededCount = results.filter((result) => result.status === 'fulfilled').length
        const failedResults = results.filter(
          (result): result is PromiseRejectedResult => result.status === 'rejected',
        )
        await refetchOrders()

        if (failedResults.length === 0) {
          setBanner({
            variant: 'success',
            message:
              succeededCount === 1
                ? `Заказ переведен ${targetLabel}.`
                : `Заказы переведены ${targetLabel}: ${succeededCount}.`,
          })
          return
        }

        const firstErrorMessage = getRequestErrorMessage(failedResults[0].reason)
        setBanner({
          variant: 'destructive',
          message: `Изменение статуса выполнено частично (${succeededCount}/${orderIds.length}). ${firstErrorMessage}`,
        })
      } catch (error) {
        setBanner({
          variant: 'destructive',
          message: getRequestErrorMessage(error),
        })
      }
    },
    [canManageOrder, getRequestErrorMessage, refetchOrders, setBanner, updateOrder],
  )

  const handlePauseOrders = useCallback(
    async (orderIds: string[]) => {
      await handleUpdateOrdersStatus(orderIds, 'Paused')
    },
    [handleUpdateOrdersStatus],
  )

  const handleActivateOrders = useCallback(
    async (orderIds: string[]) => {
      await handleUpdateOrdersStatus(orderIds, 'Active')
    },
    [handleUpdateOrdersStatus],
  )

  const handleArchiveOrders = useCallback(
    async (orderIds: string[]) => {
      if (orderIds.length === 0) {
        return
      }

      if (!canManageOrder) {
        setBanner({
          variant: 'destructive',
          message: 'Перемещать заказ в архив может только заказчик или администратор.',
        })
        return
      }

      const confirmed = window.confirm(`Переместить в архив выбранные заказы (${orderIds.length})?`)
      if (!confirmed) {
        return
      }

      try {
        const results = await Promise.allSettled(
          orderIds.map(async (orderId) => {
            await deleteOrder(orderId).unwrap()
          }),
        )
        const succeededCount = results.filter((result) => result.status === 'fulfilled').length
        const failedResults = results.filter(
          (result): result is PromiseRejectedResult => result.status === 'rejected',
        )
        await refetchOrders()
        setPreferredOrderId((previousOrderId) =>
          previousOrderId && orderIds.includes(previousOrderId) ? null : previousOrderId,
        )
        if (selectedOrderId && orderIds.includes(selectedOrderId)) {
          setSelectedOrderId(null)
        }
        if (failedResults.length === 0) {
          setBanner({
            variant: 'success',
            message:
              succeededCount === 1
                ? 'Заказ перемещен в архив.'
                : `Заказы перемещены в архив: ${succeededCount}.`,
          })
          return
        }

        const firstErrorMessage = getRequestErrorMessage(failedResults[0].reason)
        setBanner({
          variant: 'destructive',
          message: `Архивирование выполнено частично (${succeededCount}/${orderIds.length}). ${firstErrorMessage}`,
        })
      } catch (error) {
        setBanner({
          variant: 'destructive',
          message: getRequestErrorMessage(error),
        })
      }
    },
    [
      canManageOrder,
      deleteOrder,
      getRequestErrorMessage,
      refetchOrders,
      selectedOrderId,
      setBanner,
      setPreferredOrderId,
      setSelectedOrderId,
    ],
  )

  return {
    handleActivateOrders,
    handleArchiveOrders,
    handlePauseOrders,
    handleRejectOrderExecutor,
    handleRespondToOrder,
    handleSelectOrderExecutor,
  }
}
