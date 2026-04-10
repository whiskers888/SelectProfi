import { api } from '../generated/openapi'

export type OrderResponse = {
  id: string
  customerId: string
  executorId?: string | null
  title: string
  description: string
  createdAtUtc: string
  updatedAtUtc: string
}

export type OrderListResponse = {
  items: OrderResponse[]
  limit: number
  offset: number
}

export type GetOrdersRequest = {
  limit?: number
  offset?: number
}

export type OrderExecutorResponse = {
  id: string
  fullName: string
}

export type OrderExecutorListResponse = {
  items: OrderExecutorResponse[]
}

export type CreateOrderRequest = {
  title: string
  description: string
}

export type UpdateOrderRequest = {
  title?: string
  description?: string
  executorId?: string
}

const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<OrderListResponse, GetOrdersRequest | void>({
      query: (params) => ({
        url: '/api/orders',
        method: 'GET',
        params: params ?? undefined,
      }),
    }),
    getOrderById: build.query<OrderResponse, string>({
      query: (orderId) => ({
        url: `/api/orders/${orderId}`,
        method: 'GET',
      }),
    }),
    getOrderExecutors: build.query<OrderExecutorListResponse, void>({
      query: () => ({
        url: '/api/orders/executors',
        method: 'GET',
      }),
    }),
    createOrder: build.mutation<OrderResponse, CreateOrderRequest>({
      query: (body) => ({
        url: '/api/orders',
        method: 'POST',
        body,
      }),
    }),
    updateOrder: build.mutation<OrderResponse, { orderId: string; body: UpdateOrderRequest }>({
      query: ({ orderId, body }) => ({
        url: `/api/orders/${orderId}`,
        method: 'PATCH',
        body,
      }),
    }),
    deleteOrder: build.mutation<void, string>({
      query: (orderId) => ({
        url: `/api/orders/${orderId}`,
        method: 'DELETE',
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useLazyGetOrderByIdQuery,
  useGetOrderExecutorsQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi
