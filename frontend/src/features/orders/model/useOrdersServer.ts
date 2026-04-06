import { useGetOrdersQuery, useUpdateOrderMutation } from '@/shared/api/orders'

export function useOrdersServer() {
  const { data, error, isError, isLoading, refetch } = useGetOrdersQuery()
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation()

  return {
    data,
    error,
    isError,
    isLoading,
    isUpdatingOrder,
    refetch,
    updateOrder,
  }
}
