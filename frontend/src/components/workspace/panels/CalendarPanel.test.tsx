import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CalendarPanel } from './CalendarPanel'

const mocks = vi.hoisted(() => ({
  meetings: { items: [] as Array<Record<string, unknown>> },
  conversations: { items: [] as Array<Record<string, unknown>> },
  createMeeting: vi.fn(),
}))

vi.mock('@/shared/api/meetings/api', () => ({
  useGetOrderMeetingsQuery: () => ({ data: mocks.meetings, isLoading: false, isError: false, refetch: vi.fn() }),
  useCreateOrderMeetingMutation: () => [mocks.createMeeting, { isLoading: false }],
}))

vi.mock('@/shared/api/messages/api', () => ({
  useGetOrderConversationsQuery: () => ({ data: mocks.conversations, isLoading: false }),
}))

afterEach(cleanup)

describe('CalendarPanel', () => {
  beforeEach(() => {
    mocks.meetings = { items: [] }
    mocks.conversations = { items: [{ orderId: 'order-1', orderTitle: 'Менеджер по продажам', participantName: 'Ирина Заказчик' }] }
    mocks.createMeeting.mockReset().mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  it('shows an empty agenda when there are no meetings on the selected day', () => {
    render(<CalendarPanel role="Executor" />)

    expect(screen.getByRole('heading', { name: 'Календарь встреч' })).toBeTruthy()
    expect(screen.getByText('На этот день встреч нет')).toBeTruthy()
  })

  it('shows meetings on the selected date and includes them in the calendar', () => {
    const today = new Date()
    const startsAtUtc = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30).toISOString()
    mocks.meetings = { items: [{
      id: 'meeting-1',
      orderId: 'order-1',
      orderTitle: 'Менеджер по продажам',
      participantId: 'customer-1',
      participantName: 'Ирина Заказчик',
      createdByUserId: 'executor-1',
      title: 'Обсуждение кандидатов',
      format: 'VideoCall',
      startsAtUtc,
      note: 'Подготовить список',
      createdAtUtc: startsAtUtc,
    }] }

    render(<CalendarPanel role="Executor" />)

    expect(screen.getByText('Обсуждение кандидатов')).toBeTruthy()
    expect(screen.getByText('Видеозвонок')).toBeTruthy()
    expect(screen.getByText('Подготовить список')).toBeTruthy()
  })

  it('creates a meeting for one of the user’s assigned orders', async () => {
    render(<CalendarPanel role="Executor" />)
    fireEvent.click(screen.getByRole('button', { name: '+ Запланировать встречу' }))
    fireEvent.change(screen.getByLabelText('Тема встречи'), { target: { value: 'Собеседование' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить встречу' }))

    await waitFor(() => expect(mocks.createMeeting).toHaveBeenCalledWith(expect.objectContaining({
      orderId: 'order-1',
      title: 'Собеседование',
      format: 'VideoCall',
    })))
  })
})
