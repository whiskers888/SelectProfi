import { useMemo, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { routePaths } from '@/app/routePaths'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getRequestErrorMessage } from '@/features/orders/lib/errors'
import {
  canAssignExecutor as canAssignExecutorByRole,
  canCreateOrder as canCreateOrderByRole,
  canDeleteOrder as canDeleteOrderByRole,
  canEditOrder as canEditOrderByRole,
} from '@/features/orders/lib/policy'
import {
  useOrderDetailsActions,
  useOrderFormState,
  useOrdersCrudActions,
  useOrdersQueryState,
  useOrdersServer,
} from '@/features/orders/model'
import {
  OrderDetailsSurface,
  OrdersCreateSurface,
  OrdersHeaderSurface,
  OrdersListSurface,
  OrdersPaginationSurface,
  OrdersRuntimeAlertsSurface,
} from '@/features/orders/ui'
import { useGetMyAuthInfoQuery } from '@/shared/api/auth'
import { useGetOrderExecutorsQuery, useLazyGetOrderByIdQuery } from '@/shared/api/orders'

export function OrdersPage() {
  const defaultOrdersLimit = 20
  const defaultOrdersOffset = 0
  const [submitMessage, setSubmitMessage] = useState<{ status: 'idle' | 'success' | 'error'; text: string }>(
    { status: 'idle', text: '' },
  )
  const [selectedOrderId, setSelectedOrderId] = useState('')
  // @dvnull: Ранее создание и список заказов рендерились одновременно; добавлено секционное page-представление без изменения CRUD-цепочек.
  const [activeOrdersSection, setActiveOrdersSection] = useState<'list' | 'create'>('list')
  const {
    ordersQuery,
    ordersLimitInput,
    ordersOffsetInput,
    handleOrdersQueryInputChange,
    handleApplyOrdersQuery,
    handlePreviousOrdersPage,
    handleNextOrdersPage,
  } = useOrdersQueryState({
    defaultLimit: defaultOrdersLimit,
    defaultOffset: defaultOrdersOffset,
    onApplyQuery: () => {
      setSelectedOrderId('')
    },
    onValidationError: (message) => {
      setSubmitMessage({ status: 'error', text: message })
    },
  })
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
  const { handleExecutorSelectChange, handleCreateInputChange, handleOrderEditInputChange } = useOrderFormState({
    setSelectedExecutorIdsByOrder,
    setCreateForm,
    setOrderEditsById,
  })

  const items = data?.items ?? []
  const currentUserRole = authMe?.role
  const canCreateOrder = canCreateOrderByRole(currentUserRole)
  const canEditOrder = canEditOrderByRole(currentUserRole)
  const canDeleteOrder = canDeleteOrderByRole(currentUserRole)
  const canAssignExecutor = canAssignExecutorByRole(currentUserRole)
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
  const { handleCreateOrder, handleAssignExecutor, handleUpdateOrderDetails, handleDeleteOrder } =
    useOrdersCrudActions({
      canCreateOrder,
      canEditOrder,
      canDeleteOrder,
      canAssignExecutor,
      createForm,
      selectedExecutorIdsByOrder,
      orderEditsById,
      setSubmitMessage,
      resetCreateForm: () => {
        setCreateForm({ title: '', description: '' })
      },
      clearOrderEdit: (orderId) => {
        setOrderEditsById((previous) => {
          if (!previous[orderId]) {
            return previous
          }

          const next = { ...previous }
          delete next[orderId]
          return next
        })
      },
      clearSelectedExecutor: (orderId) => {
        setSelectedExecutorIdsByOrder((previous) => {
          if (!previous[orderId]) {
            return previous
          }

          const next = { ...previous }
          delete next[orderId]
          return next
        })
      },
      refetchOrders: async () => {
        await refetch()
      },
      createOrderRequest: async (body) => {
        await createOrder(body).unwrap()
      },
      updateOrderRequest: async (args) => {
        await updateOrder(args).unwrap()
      },
      deleteOrderRequest: async (orderId) => {
        await deleteOrder(orderId).unwrap()
      },
    })
  const { handleLoadOrderDetails } = useOrderDetailsActions({
    setSelectedOrderId,
    setSubmitMessage,
    fetchOrderByIdRequest: async (orderId) => fetchOrderById(orderId).unwrap(),
  })

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

          <Card className="border-slate-200 shadow-none">
            <CardContent className="flex flex-wrap gap-2 pt-6">
              <Button
                type="button"
                variant={activeOrdersSection === 'list' ? 'default' : 'outline'}
                onClick={() => setActiveOrdersSection('list')}
              >
                Список заказов
              </Button>
              <Button
                type="button"
                variant={activeOrdersSection === 'create' ? 'default' : 'outline'}
                onClick={() => setActiveOrdersSection('create')}
              >
                Создание заказа
              </Button>
            </CardContent>
          </Card>

          {activeOrdersSection === 'create' ? (
            <OrdersCreateSurface
              canCreateOrder={canCreateOrder}
              isCreatingOrder={isCreatingOrder}
              createForm={createForm}
              onCreateOrder={handleCreateOrder}
              onCreateInputChange={handleCreateInputChange}
            />
          ) : null}

          {activeOrdersSection === 'list' ? (
            <>
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
                onPreviousOrdersPage={() =>
                  handlePreviousOrdersPage({
                    currentOrdersLimit,
                    currentOrdersOffset,
                  })
                }
                onNextOrdersPage={() =>
                  handleNextOrdersPage({
                    currentOrdersLimit,
                    currentOrdersOffset,
                    itemsLength: items.length,
                  })
                }
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
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
