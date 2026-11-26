import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MessagesPanel } from './MessagesPanel'

const mocks = vi.hoisted(() => ({
  conversations: { items: [] as Array<Record<string, unknown>> },
  messages: { items: [] as Array<Record<string, unknown>> },
  historyOrderId: null as string | null,
  historyData: undefined as { items: Array<Record<string, unknown>> } | undefined,
  historyLoading: false,
  historyFetching: false,
  historyError: false,
  historyRefetch: vi.fn(),
  conversationsQueryOptions: undefined as unknown,
  historyQueryOptions: undefined as unknown,
  send: vi.fn(),
  download: vi.fn(),
  createMeeting: vi.fn(),
  openOrder: vi.fn(),
}))

vi.mock('@/shared/api/auth', () => ({
  useGetMyAuthInfoQuery: () => ({ data: { userId: 'executor-1' } }),
}))

vi.mock('@/shared/api/messages/api', () => ({
  useGetOrderConversationsQuery: (_arg: unknown, options: unknown) => {
    if (typeof options === 'object' && options !== null && 'pollingInterval' in options) {
      mocks.conversationsQueryOptions = options
    }
    return { data: mocks.conversations, isLoading: false, isError: false, refetch: vi.fn() }
  },
  useGetOrderMessagesQuery: (orderId: unknown, options: unknown) => {
    mocks.historyQueryOptions = options
    return {
      currentData: orderId === mocks.historyOrderId ? mocks.historyData : undefined,
      isLoading: mocks.historyLoading,
      isFetching: mocks.historyFetching,
      isError: mocks.historyError,
      refetch: mocks.historyRefetch,
    }
  },
  useSendOrderMessageMutation: () => [mocks.send, { isLoading: false }],
  useDownloadOrderMessageAttachmentMutation: () => [mocks.download, { isLoading: false }],
}))

vi.mock('@/shared/api/meetings/api', () => ({
  useCreateOrderMeetingMutation: () => [mocks.createMeeting, { isLoading: false }],
}))

afterEach(cleanup)

function renderMessagesPanel() {
  return render(<MessagesPanel onOpenOrder={mocks.openOrder} role="Executor" />)
}

describe('MessagesPanel', () => {
  beforeEach(() => {
    mocks.conversations = {
      items: [{
        orderId: 'order-1',
        orderTitle: 'Менеджер по продажам',
        participantId: 'customer-1',
        participantName: 'Анна Заказчик',
        participantRole: 'Customer',
        lastMessage: 'Буду ждать список кандидатов',
        lastMessageAtUtc: '2026-11-27T10:20:00Z',
        unreadCount: 1,
      }, {
        orderId: 'order-2',
        orderTitle: 'Инженер-конструктор',
        participantId: 'customer-2',
        participantName: 'Борис Заказчик',
        participantRole: 'Customer',
        lastMessage: 'Согласуем детали заказа',
        lastMessageAtUtc: '2026-11-27T11:20:00Z',
        unreadCount: 0,
      }],
    }
    mocks.messages = {
      items: [{
        id: 'message-1',
        senderUserId: 'customer-1',
        senderName: 'Анна Заказчик',
        text: 'Буду ждать список кандидатов',
        createdAtUtc: '2026-11-27T10:20:00Z',
        readAtUtc: null,
      }],
    }
    mocks.historyOrderId = 'order-1'
    mocks.historyData = mocks.messages
    mocks.historyLoading = false
    mocks.historyFetching = false
    mocks.historyError = false
    mocks.historyRefetch.mockReset()
    mocks.conversationsQueryOptions = undefined
    mocks.historyQueryOptions = undefined
    mocks.send.mockReset().mockReturnValue({ unwrap: () => Promise.resolve() })
    mocks.download.mockReset().mockReturnValue({ unwrap: () => Promise.resolve(new Blob()) })
    mocks.createMeeting.mockReset().mockReturnValue({ unwrap: () => Promise.resolve() })
    mocks.openOrder.mockReset()
  })

  it('shows saved conversations and their persisted message history', () => {
    renderMessagesPanel()

    expect(screen.getAllByText('Анна Заказчик')).toHaveLength(2)
    expect(screen.getAllByText(/Менеджер по продажам/)).toHaveLength(2)
    expect(screen.getAllByText('Буду ждать список кандидатов')).toHaveLength(2)
    expect(screen.getByRole('log', { name: 'История сообщений' })).toBeTruthy()
  })

  it('searches by participant role and opens the related project', () => {
    renderMessagesPanel()
    fireEvent.change(screen.getByRole('textbox', { name: 'Поиск диалогов' }), { target: { value: 'заказчик' } })
    expect(screen.getAllByRole('button', { name: /Заказчик/ })).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'К проекту' }))
    expect(mocks.openOrder).toHaveBeenCalledWith('order-1')
  })

  it('sends the draft on Ctrl+Enter', async () => {
    renderMessagesPanel()
    const composer = screen.getByRole('textbox', { name: 'Текст сообщения' })
    fireEvent.change(composer, { target: { value: 'Быстрая отправка' } })
    fireEvent.keyDown(composer, { key: 'Enter', ctrlKey: true })

    await waitFor(() => expect(mocks.send).toHaveBeenCalledWith({ orderId: 'order-1', text: 'Быстрая отправка' }))
  })

  it('polls the conversation list and active history every ten seconds', () => {
    renderMessagesPanel()

    expect(mocks.conversationsQueryOptions).toMatchObject({ pollingInterval: 10_000 })
    expect(mocks.historyQueryOptions).toMatchObject({ pollingInterval: 10_000 })
  })

  it('sends a non-empty message to the selected order', async () => {
    renderMessagesPanel()
    fireEvent.change(screen.getByRole('textbox', { name: 'Текст сообщения' }), {
      target: { value: 'Список кандидатов будет готов сегодня.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() => expect(mocks.send).toHaveBeenCalledWith({
      orderId: 'order-1',
      text: 'Список кандидатов будет готов сегодня.',
    }))
  })

  it('preserves text typed while an earlier message is being sent', async () => {
    let completeSend = () => {}
    mocks.send.mockReturnValue({ unwrap: () => new Promise<void>((resolve) => { completeSend = resolve }) })
    renderMessagesPanel()
    const composer = screen.getByRole('textbox', { name: 'Текст сообщения' })
    fireEvent.change(composer, { target: { value: 'Первый текст' } })
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() => expect(mocks.send).toHaveBeenCalledWith({ orderId: 'order-1', text: 'Первый текст' }))
    fireEvent.change(composer, { target: { value: 'Новое сообщение' } })
    await act(async () => { completeSend() })

    await waitFor(() => expect(composer).toHaveValue('Новое сообщение'))
  })

  it('attaches an allowed document to a message', async () => {
    renderMessagesPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить или запланировать' }))
    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить файл' }))
    const file = new File(['resume'], 'candidate.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Выбрать файл для отправки'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    await waitFor(() => expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({
      orderId: 'order-1',
      text: '',
      file,
    })))
  })

  it('keeps the remove action available for a long filename', () => {
    renderMessagesPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить или запланировать' }))
    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить файл' }))
    const longFileName = `${'a'.repeat(251)}.pdf`
    expect(longFileName).toHaveLength(255)
    const file = new File(['resume'], longFileName, { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Выбрать файл для отправки'), { target: { files: [file] } })

    expect(screen.getByText(`Файл: ${longFileName}`)).toBeTruthy()
    const removeButton = screen.getByRole('button', { name: 'Убрать' })
    expect(removeButton).toBeTruthy()
    fireEvent.click(removeButton)
    expect(screen.queryByText(`Файл: ${longFileName}`)).toBeNull()
  })

  it('clears a pending attachment when switching to another order before sending', async () => {
    renderMessagesPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить или запланировать' }))
    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить файл' }))
    const file = new File(['resume'], 'candidate.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Выбрать файл для отправки'), { target: { files: [file] } })
    expect(screen.getByText('Файл: candidate.pdf')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Борис Заказчик/ }))

    expect(screen.queryByText('Файл: candidate.pdf')).toBeNull()
    fireEvent.change(screen.getByRole('textbox', { name: 'Текст сообщения' }), {
      target: { value: 'Ответ по другому заказу.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))
    await waitFor(() => expect(mocks.send).toHaveBeenCalledWith({
      orderId: 'order-2',
      text: 'Ответ по другому заказу.',
      file: undefined,
    }))
  })

  it('resets meeting details when reopened for another order', async () => {
    renderMessagesPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить или запланировать' }))
    fireEvent.click(screen.getByRole('button', { name: 'Запланировать встречу' }))

    const firstDialog = screen.getByRole('dialog', { name: 'Запланировать встречу' })
    expect(within(firstDialog).getByLabelText('Заказ')).toHaveValue('order-1')
    fireEvent.change(within(firstDialog).getByLabelText('Тема встречи'), { target: { value: 'Обсудить кандидата' } })
    fireEvent.click(within(firstDialog).getByRole('button', { name: 'Отмена' }))

    fireEvent.click(screen.getByRole('button', { name: /Борис Заказчик/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить или запланировать' }))
    fireEvent.click(screen.getByRole('button', { name: 'Запланировать встречу' }))

    const secondDialog = screen.getByRole('dialog', { name: 'Запланировать встречу' })
    expect(within(secondDialog).getByLabelText('Заказ')).toHaveValue('order-2')
    expect(within(secondDialog).getByLabelText('Тема встречи')).toHaveValue('Обсуждение заказа')
    fireEvent.click(within(secondDialog).getByRole('button', { name: 'Сохранить встречу' }))

    await waitFor(() => expect(mocks.createMeeting).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order-2' })))
  })

  it('does not show the previous order history while the next history is loading', () => {
    renderMessagesPanel()
    const historyLog = screen.getByRole('log', { name: 'История сообщений' })
    expect(within(historyLog).getByText('Буду ждать список кандидатов')).toBeTruthy()

    mocks.historyOrderId = 'order-2'
    mocks.historyData = undefined
    mocks.historyLoading = true
    mocks.historyFetching = true
    fireEvent.click(screen.getByRole('button', { name: /Борис Заказчик/ }))

    expect(within(historyLog).getByText('Загружаем историю…')).toBeTruthy()
    expect(within(historyLog).queryByText('Буду ждать список кандидатов')).toBeNull()
  })

  it('shows a retry action when the selected order history fails to load', () => {
    renderMessagesPanel()
    mocks.historyOrderId = 'order-2'
    mocks.historyData = undefined
    mocks.historyLoading = false
    mocks.historyFetching = false
    mocks.historyError = true

    fireEvent.click(screen.getByRole('button', { name: /Борис Заказчик/ }))

    expect(screen.getByRole('alert').textContent).toContain('Не удалось загрузить историю сообщений.')
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }))
    expect(mocks.historyRefetch).toHaveBeenCalledOnce()
    expect(screen.queryByText(/Начните переписку по заказу/)).toBeNull()
  })
})
