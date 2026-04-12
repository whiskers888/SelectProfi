import { api } from '../generated/openapi'

export type OrderStatusContract = 'Active' | 'Paused'

export type OrderResponse = {
  id: string
  customerId: string
  executorId?: string | null
  title: string
  description: string
  status: OrderStatusContract
  createdAtUtc: string
  updatedAtUtc: string
  deletedAtUtc?: string | null
}

export type OrderListResponse = {
  items: OrderResponse[]
  limit: number
  offset: number
}

export type GetOrdersRequest = {
  limit?: number
  offset?: number
  includeArchived?: boolean
}

export type OrderExecutorResponse = {
  id: string
  fullName: string
}

export type OrderExecutorListResponse = {
  items: OrderExecutorResponse[]
}

export type OrderExecutorResponseStatusContract = 'Pending' | 'Withdrawn' | 'Accepted' | 'Rejected'

export type OrderExecutorResponseItemResponse = {
  executorId: string
  executorFullName: string
  executorGrade?: string | null
  executorProjectTitle?: string | null
  executorProjectCompanyName?: string | null
  executorExperienceSummary?: string | null
  status: OrderExecutorResponseStatusContract
  createdAtUtc: string
  updatedAtUtc: string
}

export type OrderExecutorResponsesResponse = {
  items: OrderExecutorResponseItemResponse[]
}

export type SelectOrderResponseExecutorResponse = {
  orderId: string
  executorId: string
  updatedAtUtc: string
}

export type MyOrderResponseResponse = {
  orderId: string
  hasResponse: boolean
  status?: OrderExecutorResponseStatusContract | null
  updatedAtUtc?: string | null
}

export type CreateOrderRequest = {
  title: string
  description: string
}

export type UpdateOrderRequest = {
  title?: string
  description?: string
  executorId?: string
  status?: OrderStatusContract
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
    getMyOrderResponse: build.query<MyOrderResponseResponse, string>({
      query: (orderId) => ({
        url: `/api/orders/${orderId}/my-response`,
        method: 'GET',
      }),
    }),
    getOrderResponses: build.query<OrderExecutorResponsesResponse, string>({
      query: (orderId) => ({
        url: `/api/orders/${orderId}/responses`,
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
    respondToOrder: build.mutation<OrderExecutorResponseItemResponse, string>({
      query: (orderId) => ({
        url: `/api/orders/${orderId}/respond`,
        method: 'POST',
      }),
      invalidatesTags: ['Order'],
    }),
    selectOrderResponseExecutor: build.mutation<
      SelectOrderResponseExecutorResponse,
      { executorId: string; orderId: string }
    >({
      query: ({ executorId, orderId }) => ({
        url: `/api/orders/${orderId}/responses/${executorId}/select`,
        method: 'POST',
      }),
      invalidatesTags: ['Order'],
    }),
    rejectOrderResponseExecutor: build.mutation<
      OrderExecutorResponseItemResponse,
      { executorId: string; orderId: string }
    >({
      query: ({ executorId, orderId }) => ({
        url: `/api/orders/${orderId}/responses/${executorId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useLazyGetOrderByIdQuery,
  useGetOrderExecutorsQuery,
  useGetMyOrderResponseQuery,
  useGetOrderResponsesQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useRespondToOrderMutation,
  useSelectOrderResponseExecutorMutation,
  useRejectOrderResponseExecutorMutation,
} = ordersApi
