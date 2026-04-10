import {
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderMutation,
  type GetOrdersRequest,
} from '@/shared/api/orders'

export function useOrdersServer(query?: GetOrdersRequest) {
  const { data, error, isError, isLoading, refetch } = useGetOrdersQuery(query)
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()
  const [deleteOrder, { isLoading: isDeletingOrder }] = useDeleteOrderMutation()
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation()

  return {
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
  }
}
