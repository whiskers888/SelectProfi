import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react'
import { skipToken, type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { routePaths } from '@/app/routePaths'
import { Card, CardContent } from '@/components/ui/card'
import { useOrdersServer } from '@/features/orders/model'
import {
  OrderDetailsSurface,
  OrdersCreateSurface,
  OrdersHeaderSurface,
  OrdersListSurface,
  OrdersPaginationSurface,
  OrdersRuntimeAlertsSurface,
} from '@/features/orders/ui'
import { useGetMyAuthInfoQuery } from '@/shared/api/auth'
import { useGetOrderExecutorsQuery, useLazyGetOrderByIdQuery, type GetOrdersRequest } from '@/shared/api/orders'

type ProblemDetailsPayload = {
  code?: string
  detail?: string
  title?: string
}

function isProblemDetailsPayload(value: unknown): value is ProblemDetailsPayload {
  return typeof value === 'object' && value !== null
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

function getRequestErrorMessage(error: unknown): string {
  if (!isFetchBaseQueryError(error)) {
    return 'Не удалось выполнить запрос.'
  }

  if (error.status === 'FETCH_ERROR') {
    return 'Не удалось установить соединение с сервером.'
  }

  if (error.status === 401) {
    return 'Требуется авторизация.'
  }

  if (typeof error.status === 'number' && isProblemDetailsPayload(error.data)) {
    switch (error.data.code) {
      case 'customer_not_found':
        return 'Профиль заказчика не найден.'
      case 'order_not_found':
        return 'Заказ не найден.'
      case 'executor_not_found':
        return 'Указанный рекрутер не найден.'
      case 'order_access_forbidden':
        return 'У вас нет доступа к этому заказу.'
      case 'order_list_access_forbidden':
        return 'У вас нет доступа к списку заказов.'
      case 'order_executors_access_forbidden':
        return 'У вас нет доступа к списку исполнителей.'
      case 'order_has_active_vacancy':
        return 'Нельзя удалить заказ, у которого есть активная вакансия.'
      case 'order_conflict':
        return 'Не удалось выполнить операцию с заказом из-за конфликта данных.'
      default:
        return error.data.detail ?? error.data.title ?? 'Не удалось выполнить запрос.'
    }
  }

  return 'Не удалось выполнить запрос.'
}

function parseNonNegativeInteger(rawValue: string): number | null {
  const trimmedValue = rawValue.trim()
  if (!/^\d+$/.test(trimmedValue)) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  if (!Number.isSafeInteger(parsedValue)) {
    return null
  }

  return parsedValue
}

export function OrdersPage() {
  const defaultOrdersLimit = 20
  const defaultOrdersOffset = 0
  const [ordersQuery, setOrdersQuery] = useState<GetOrdersRequest>({
    limit: defaultOrdersLimit,
    offset: defaultOrdersOffset,
  })
  const [ordersLimitInput, setOrdersLimitInput] = useState(String(defaultOrdersLimit))
  const [ordersOffsetInput, setOrdersOffsetInput] = useState(String(defaultOrdersOffset))
  const {
    data,
    error,
    isError,
    isLoading,
    isCreatingOrder,
    isDeletingOrder,
    isUpdatingOrder,
    refetch,
    createOrder,
    deleteOrder,
    updateOrder,
  } = useOrdersServer(ordersQuery)
  const { data: authMe } = useGetMyAuthInfoQuery()
  const [fetchOrderById, { data: orderDetail, error: orderDetailError, isFetching: isOrderDetailLoading }] =
    useLazyGetOrderByIdQuery()
  const [selectedExecutorIdsByOrder, setSelectedExecutorIdsByOrder] = useState<Record<string, string>>({})
  const [orderEditsById, setOrderEditsById] = useState<Record<string, { title: string; description: string }>>({})
  const [createForm, setCreateForm] = useState({ title: '', description: '' })
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [submitMessage, setSubmitMessage] = useState<{ status: 'idle' | 'success' | 'error'; text: string }>(
    { status: 'idle', text: '' },
  )

  const items = data?.items ?? []
  const canCreateOrder = authMe?.role === 'Customer'
  const canEditOrder = authMe?.role === 'Customer' || authMe?.role === 'Admin'
  const canDeleteOrder = authMe?.role === 'Customer' || authMe?.role === 'Admin'
  const canAssignExecutor = authMe?.role === 'Customer'
  const isOrderMutationLoading = isUpdatingOrder || isDeletingOrder
  const {
    data: executorsData,
    error: executorsError,
    isFetching: isExecutorsLoading,
  } = useGetOrderExecutorsQuery(canAssignExecutor ? undefined : skipToken)
  const executors = executorsData?.items ?? []
  const currentOrdersLimit = data?.limit ?? ordersQuery.limit ?? defaultOrdersLimit
  const currentOrdersOffset = data?.offset ?? ordersQuery.offset ?? defaultOrdersOffset

  const canRenderTable = useMemo(() => !isLoading && !isError && items.length > 0, [isError, isLoading, items.length])

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
      await createOrder({ title, description }).unwrap()
      setSubmitMessage({ status: 'success', text: 'Заказ создан.' })
      setCreateForm({ title: '', description: '' })
      await refetch()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  function applyOrdersQuery(limit: number, offset: number) {
    setOrdersQuery({ limit, offset })
    setOrdersLimitInput(String(limit))
    setOrdersOffsetInput(String(offset))
    setSelectedOrderId('')
  }

  function handleOrdersQueryInputChange(field: 'limit' | 'offset', event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    if (field === 'limit') {
      setOrdersLimitInput(nextValue)
      return
    }

    setOrdersOffsetInput(nextValue)
  }

  function handleApplyOrdersQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedLimit = parseNonNegativeInteger(ordersLimitInput)
    const parsedOffset = parseNonNegativeInteger(ordersOffsetInput)

    if (parsedLimit === null || parsedLimit <= 0) {
      setSubmitMessage({ status: 'error', text: 'limit должен быть целым числом больше 0.' })
      return
    }

    if (parsedOffset === null) {
      setSubmitMessage({ status: 'error', text: 'offset должен быть целым числом от 0.' })
      return
    }

    applyOrdersQuery(parsedLimit, parsedOffset)
  }

  function handlePreviousOrdersPage() {
    if (currentOrdersOffset <= 0) {
      return
    }

    const nextOffset = Math.max(0, currentOrdersOffset - currentOrdersLimit)
    applyOrdersQuery(currentOrdersLimit, nextOffset)
  }

  function handleNextOrdersPage() {
    if (items.length < currentOrdersLimit) {
      return
    }

    const nextOffset = currentOrdersOffset + currentOrdersLimit
    applyOrdersQuery(currentOrdersLimit, nextOffset)
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
      await updateOrder({
        orderId,
        body: { executorId: rawExecutorId },
      }).unwrap()

      setSubmitMessage({ status: 'success', text: 'Рекрутер назначен.' })
      await refetch()
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
      await updateOrder({
        orderId,
        body: {
          title: nextTitle,
          description: nextDescription,
        },
      }).unwrap()

      setOrderEditsById((previous) => {
        if (!previous[orderId]) {
          return previous
        }

        const next = { ...previous }
        delete next[orderId]
        return next
      })
      setSubmitMessage({ status: 'success', text: 'Заказ обновлен.' })
      await refetch()
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
      await deleteOrder(orderId).unwrap()
      setOrderEditsById((previous) => {
        if (!previous[orderId]) {
          return previous
        }

        const next = { ...previous }
        delete next[orderId]
        return next
      })
      setSelectedExecutorIdsByOrder((previous) => {
        if (!previous[orderId]) {
          return previous
        }

        const next = { ...previous }
        delete next[orderId]
        return next
      })
      setSubmitMessage({ status: 'success', text: 'Заказ удален.' })
      await refetch()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  function handleExecutorSelectChange(orderId: string, event: ChangeEvent<HTMLSelectElement>) {
    const nextValue = event.target.value
    setSelectedExecutorIdsByOrder((previous) => ({
      ...previous,
      [orderId]: nextValue,
    }))
  }

  function handleCreateInputChange(field: 'title' | 'description', event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    setCreateForm((previous) => ({
      ...previous,
      [field]: nextValue,
    }))
  }

  function handleOrderEditInputChange(
    orderId: string,
    field: 'title' | 'description',
    event: ChangeEvent<HTMLInputElement>,
    currentTitle: string,
    currentDescription: string,
  ) {
    const nextValue = event.target.value
    setOrderEditsById((previous) => {
      const current = previous[orderId] ?? {
        title: currentTitle,
        description: currentDescription,
      }

      return {
        ...previous,
        [orderId]: {
          ...current,
          [field]: nextValue,
        },
      }
    })
  }

  async function handleLoadOrderDetails(orderId: string) {
    try {
      const result = await fetchOrderById(orderId).unwrap()
      setSelectedOrderId(result.id)
      setSubmitMessage({ status: 'success', text: 'Детали заказа загружены.' })
    } catch (requestError) {
      setSelectedOrderId(orderId)
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  return (
    <section className="page profile-page">
      <Card>
        <OrdersHeaderSurface onRefresh={() => void refetch()} previewPath={routePaths.app} />
        <CardContent className="space-y-4">
          <OrdersRuntimeAlertsSurface
            isLoading={isLoading}
            isError={isError}
            error={error}
            submitMessage={submitMessage}
            canAssignExecutor={canAssignExecutor}
            isExecutorsLoading={isExecutorsLoading}
            executorsError={executorsError}
            executorsCount={executors.length}
            itemsCount={items.length}
            currentOrdersOffset={currentOrdersOffset}
            getRequestErrorMessage={getRequestErrorMessage}
          />

          <OrdersCreateSurface
            canCreateOrder={canCreateOrder}
            isCreatingOrder={isCreatingOrder}
            createForm={createForm}
            onCreateOrder={handleCreateOrder}
            onCreateInputChange={handleCreateInputChange}
          />

          <OrdersPaginationSurface
            isLoading={isLoading}
            ordersLimitInput={ordersLimitInput}
            ordersOffsetInput={ordersOffsetInput}
            currentOrdersLimit={currentOrdersLimit}
            currentOrdersOffset={currentOrdersOffset}
            isPreviousDisabled={isLoading || currentOrdersOffset <= 0}
            isNextDisabled={isLoading || currentOrdersLimit <= 0 || items.length < currentOrdersLimit}
            onApplyOrdersQuery={handleApplyOrdersQuery}
            onOrdersQueryInputChange={handleOrdersQueryInputChange}
            onPreviousOrdersPage={handlePreviousOrdersPage}
            onNextOrdersPage={handleNextOrdersPage}
          />

          {canRenderTable ? (
            <OrdersListSurface
              items={items}
              orderEditsById={orderEditsById}
              selectedExecutorIdsByOrder={selectedExecutorIdsByOrder}
              executors={executors}
              canEditOrder={canEditOrder}
              canAssignExecutor={canAssignExecutor}
              canDeleteOrder={canDeleteOrder}
              isOrderMutationLoading={isOrderMutationLoading}
              isExecutorsLoading={isExecutorsLoading}
              hasExecutorsError={Boolean(executorsError)}
              isOrderDetailLoading={isOrderDetailLoading}
              onOrderEditInputChange={handleOrderEditInputChange}
              onUpdateOrderDetails={handleUpdateOrderDetails}
              onExecutorSelectChange={handleExecutorSelectChange}
              onAssignExecutor={handleAssignExecutor}
              onLoadOrderDetails={handleLoadOrderDetails}
              onDeleteOrder={handleDeleteOrder}
            />
          ) : null}

          <OrderDetailsSurface
            selectedOrderId={selectedOrderId}
            isOrderDetailLoading={isOrderDetailLoading}
            orderDetailError={orderDetailError}
            orderDetail={orderDetail}
            getRequestErrorMessage={getRequestErrorMessage}
          />
        </CardContent>
      </Card>
    </section>
  )
}
