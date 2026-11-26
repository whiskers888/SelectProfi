import { emptyApi } from '../emptyApi'

export type OrderMeetingFormat = 'AudioCall' | 'VideoCall' | 'Chat' | 'InPerson'

export type OrderMeetingResponse = {
  id: string
  orderId: string
  orderTitle: string
  participantId: string
  participantName: string
  createdByUserId: string
  title: string
  format: OrderMeetingFormat
  startsAtUtc: string
  note: string
  createdAtUtc: string
}

export type OrderMeetingListResponse = { items: OrderMeetingResponse[] }

export const meetingsApi = emptyApi.injectEndpoints({
  endpoints: (build) => ({
    getOrderMeetings: build.query<OrderMeetingListResponse, { from: string; to: string }>({
      query: ({ from, to }) => ({ url: '/api/meetings', params: { from, to } }),
      providesTags: ['Meeting'],
    }),
    createOrderMeeting: build.mutation<OrderMeetingResponse, {
      orderId: string
      title: string
      startsAt: string
      format: OrderMeetingFormat
      note: string
    }>({
      query: ({ orderId, ...body }) => ({ url: `/api/orders/${orderId}/meetings`, method: 'POST', body }),
      invalidatesTags: ['Meeting', 'OrderChat'],
    }),
  }),
})

export const { useGetOrderMeetingsQuery, useCreateOrderMeetingMutation } = meetingsApi
