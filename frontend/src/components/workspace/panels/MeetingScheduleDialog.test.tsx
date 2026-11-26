import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MeetingScheduleDialog } from './MeetingScheduleDialog'

const mocks = vi.hoisted(() => ({
  conversations: {
    items: [
      { orderId: 'order-a', orderTitle: 'Заказ A', participantName: 'Анна' },
      { orderId: 'order-b', orderTitle: 'Заказ B', participantName: 'Борис' },
    ] as Array<Record<string, unknown>>,
  },
  createMeeting: vi.fn(),
}))

vi.mock('@/shared/api/messages/api', () => ({
  useGetOrderConversationsQuery: () => ({ data: mocks.conversations }),
}))

vi.mock('@/shared/api/meetings/api', () => ({
  useCreateOrderMeetingMutation: () => [mocks.createMeeting, { isLoading: false }],
}))

afterEach(cleanup)

function DialogHarness() {
  const [open, setOpen] = useState(false)
  const [initialOrderId, setInitialOrderId] = useState<string | null>(null)

  return (
    <>
      <button onClick={() => { setInitialOrderId('order-a'); setOpen(true) }} type="button">Открыть по заказу A</button>
      <button onClick={() => { setInitialOrderId('order-b'); setOpen(true) }} type="button">Открыть по заказу B</button>
      {open ? <MeetingScheduleDialog initialOrderId={initialOrderId} onClose={() => setOpen(false)} open role="Executor" /> : null}
    </>
  )
}

describe('MeetingScheduleDialog', () => {
  beforeEach(() => {
    mocks.createMeeting.mockReset().mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  it('resets the selected order and form when reopened from another conversation', async () => {
    render(<DialogHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Открыть по заказу A' }))
    const orderSelect = screen.getByLabelText('Заказ')
    expect(orderSelect).toHaveValue('order-a')
    fireEvent.change(orderSelect, { target: { value: 'order-b' } })
    fireEvent.change(screen.getByLabelText('Тема встречи'), { target: { value: 'Старое название' } })
    fireEvent.change(screen.getByLabelText('Формат'), { target: { value: 'AudioCall' } })
    fireEvent.change(screen.getByLabelText('Заметка'), { target: { value: 'Старая заметка' } })
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))

    fireEvent.click(screen.getByRole('button', { name: 'Открыть по заказу B' }))

    expect(screen.getByLabelText('Заказ')).toHaveValue('order-b')
    expect(screen.getByLabelText('Тема встречи')).toHaveValue('Обсуждение заказа')
    expect(screen.getByLabelText('Формат')).toHaveValue('VideoCall')
    expect(screen.getByLabelText('Заметка')).toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить встречу' }))

    await waitFor(() => expect(mocks.createMeeting).toHaveBeenCalledWith(expect.objectContaining({
      orderId: 'order-b',
      title: 'Обсуждение заказа',
      format: 'VideoCall',
      note: '',
    })))
  })
})
