import { api } from '../generated/openapi'

export type OrderStatusContract = 'Active' | 'Paused' | 'Completed'

export type OrderResponse = {
  id: string
  customerId: string
  executorId?: string | null
  title: string
  description: string
  location: string
  employeeCompensation: string
  functional: string
  requirements: string
  otherConditions: string
  specializationId?: string | null
  specialization: string
  price: number
  grossAmount: number
  serviceCommissionPercent: number
  serviceCommissionAmount: number
  executorNetAmount: number
  isPricingLocked: boolean
  customerCompanyName?: string | null
  requestedCandidatesCount: number
  status: OrderStatusContract
  dueDate?: string | null
  completedAtUtc?: string | null
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

export type OrderSpecializationResponse = {
  id: string
  name: string
  isActive: boolean
  sortOrder: number
  createdAtUtc: string
  updatedAtUtc: string
}

export type OrderSpecializationListResponse = {
  items: OrderSpecializationResponse[]
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
  specialization?: string
  specializationId?: string
  price?: number
  location?: string
  employeeCompensation?: string
  functional?: string
  requirements?: string
  otherConditions?: string
  requestedCandidatesCount: number
}

export type UpdateOrderRequest = {
  title?: string
  description?: string
  location?: string
  employeeCompensation?: string
  functional?: string
  requirements?: string
  otherConditions?: string
  executorId?: string
  status?: OrderStatusContract
}

export type ProjectActivityResponse = {
  id: string
  action: string
  description: string
  createdAtUtc: string
}

export type ProjectActivityListResponse = { items: ProjectActivityResponse[] }

export type ProjectDocumentResponse = {
  id: string
  fileName: string
  contentType: string
  length: number
  createdAtUtc: string
}

export type ProjectDocumentListResponse = { items: ProjectDocumentResponse[] }

export type ProjectDueDateResponse = {
  orderId: string
  dueDate?: string | null
  updatedAtUtc: string
}

const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<OrderListResponse, GetOrdersRequest | void>({
      query: (params) => ({
        url: '/api/orders',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: ['Order'],
    }),
    getMyOrders: build.query<OrderListResponse, GetOrdersRequest | void>({
      query: (params) => ({
        url: '/api/orders/my',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: ['Order'],
    }),
    getOrderById: build.query<OrderResponse, string>({
      query: (orderId) => ({
        url: `/api/orders/${orderId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: orderId }],
    }),
    getProjectHistory: build.query<ProjectActivityListResponse, string>({
      query: (orderId) => ({ url: `/api/orders/${orderId}/history`, method: 'GET' }),
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: orderId }],
    }),
    getProjectDocuments: build.query<ProjectDocumentListResponse, string>({
      query: (orderId) => ({ url: `/api/orders/${orderId}/documents`, method: 'GET' }),
      providesTags: (_result, _error, orderId) => [{ type: 'Order', id: orderId }],
    }),
    getOrderExecutors: build.query<OrderExecutorListResponse, void>({
      query: () => ({
        url: '/api/orders/executors',
        method: 'GET',
      }),
    }),
    getOrderSpecializations: build.query<OrderSpecializationListResponse, void>({
      query: () => ({
        url: '/api/order-specializations',
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
      invalidatesTags: ['Order'],
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
    setProjectDueDate: build.mutation<ProjectDueDateResponse, { orderId: string; dueDate: string }>({
      query: ({ orderId, dueDate }) => ({
        url: `/api/orders/${orderId}/deadline`,
        method: 'PUT',
        body: { dueDate },
      }),
      invalidatesTags: ['Order'],
    }),
    clearProjectDueDate: build.mutation<ProjectDueDateResponse, string>({
      query: (orderId) => ({ url: `/api/orders/${orderId}/deadline`, method: 'DELETE' }),
      invalidatesTags: ['Order'],
    }),
    uploadProjectDocument: build.mutation<ProjectDocumentResponse, { orderId: string; file: File }>({
      query: ({ orderId, file }) => {
        const body = new FormData()
        body.append('file', file)
        return { url: `/api/orders/${orderId}/documents`, method: 'POST', body }
      },
      invalidatesTags: ['Order'],
    }),
    downloadProjectDocument: build.mutation<Blob, { orderId: string; documentId: string }>({
      query: ({ orderId, documentId }) => ({
        url: `/api/orders/${orderId}/documents/${documentId}`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetOrdersQuery,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetProjectHistoryQuery,
  useGetProjectDocumentsQuery,
  useLazyGetOrderByIdQuery,
  useGetOrderExecutorsQuery,
  useGetOrderSpecializationsQuery,
  useGetMyOrderResponseQuery,
  useGetOrderResponsesQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useSetProjectDueDateMutation,
  useClearProjectDueDateMutation,
  useUploadProjectDocumentMutation,
  useDownloadProjectDocumentMutation,
  useDeleteOrderMutation,
  useRespondToOrderMutation,
  useSelectOrderResponseExecutorMutation,
  useRejectOrderResponseExecutorMutation,
} = ordersApi
