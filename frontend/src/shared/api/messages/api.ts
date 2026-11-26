import { emptyApi } from '../emptyApi'

export type OrderConversationResponse = {
  orderId: string
  orderTitle: string
  participantId: string
  participantName: string
  participantRole: 'Customer' | 'Executor'
  lastMessage: string | null
  lastMessageAtUtc: string | null
  unreadCount: number
}

export type OrderConversationListResponse = { items: OrderConversationResponse[] }

export type OrderMessageResponse = {
  id: string
  senderUserId: string
  senderName: string
  text: string
  createdAtUtc: string
  readAtUtc: string | null
  attachmentFileName: string | null
  attachmentContentType: string | null
  attachmentLength: number | null
}

export type OrderMessageListResponse = { items: OrderMessageResponse[] }

export const messagesApi = emptyApi.injectEndpoints({
  endpoints: (build) => ({
    getOrderConversations: build.query<OrderConversationListResponse, void>({
      query: () => ({ url: '/api/messages/conversations' }),
      providesTags: ['OrderChat'],
    }),
    getOrderMessages: build.query<OrderMessageListResponse, string>({
      query: (orderId) => ({ url: `/api/messages/orders/${orderId}` }),
      providesTags: (_result, _error, orderId) => [{ type: 'OrderChat', id: orderId }],
    }),
    sendOrderMessage: build.mutation<OrderMessageResponse, { orderId: string; text: string; file?: File }>({
      query: ({ orderId, text, file }) => {
        const body = new FormData()
        body.append('text', text)
        if (file) body.append('file', file)
        return { url: `/api/messages/orders/${orderId}`, method: 'POST', body }
      },
      invalidatesTags: (_result, _error, { orderId }) => [
        'OrderChat',
        { type: 'OrderChat', id: orderId },
      ],
    }),
    downloadOrderMessageAttachment: build.mutation<Blob, { orderId: string; messageId: string }>({
      query: ({ orderId, messageId }) => ({
        url: `/api/messages/orders/${orderId}/messages/${messageId}/attachment`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
})

export const {
  useGetOrderConversationsQuery,
  useGetOrderMessagesQuery,
  useSendOrderMessageMutation,
  useDownloadOrderMessageAttachmentMutation,
} = messagesApi
