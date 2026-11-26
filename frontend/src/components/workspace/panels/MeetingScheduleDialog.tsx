import { useState, type FormEvent } from 'react'
import { useGetOrderConversationsQuery } from '@/shared/api/messages/api'
import { useCreateOrderMeetingMutation, type OrderMeetingFormat } from '@/shared/api/meetings/api'
import type { WorkspaceRole } from '../model/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type MeetingScheduleDialogProps = {
  open: boolean
  role: WorkspaceRole
  initialOrderId?: string | null
  onClose: () => void
}

function localDateTimeValue(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function dateTimeWithLocalOffset(value: string): string {
  const date = new Date(value)
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, '0')
  return `${value}:00${sign}${hours}:${minutes}`
}

export function MeetingScheduleDialog({ open, role, initialOrderId, onClose }: MeetingScheduleDialogProps) {
  const { data } = useGetOrderConversationsQuery(undefined, { skip: !open || role === 'Applicant' })
  const conversations = data?.items ?? []
  const initialOrder = conversations.find((item) => item.orderId === initialOrderId)?.orderId ?? conversations[0]?.orderId ?? ''
  const [orderId, setOrderId] = useState(initialOrderId ?? '')
  const [title, setTitle] = useState('Обсуждение заказа')
  const [startsAt, setStartsAt] = useState(() => localDateTimeValue(new Date(Date.now() + 60 * 60 * 1000)))
  const [format, setFormat] = useState<OrderMeetingFormat>('VideoCall')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createMeeting, { isLoading }] = useCreateOrderMeetingMutation()
  const selectedOrderId = conversations.some((item) => item.orderId === orderId) ? orderId : initialOrder

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedOrderId || !startsAt || !title.trim()) return
    try {
      await createMeeting({
        orderId: selectedOrderId,
        title: title.trim(),
        startsAt: dateTimeWithLocalOffset(startsAt),
        format,
        note: note.trim(),
      }).unwrap()
      setError(null)
      onClose()
    } catch {
      setError('Не удалось сохранить встречу. Проверьте дату и попробуйте ещё раз.')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section aria-labelledby="meeting-dialog-title" aria-modal="true" className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-xl" role="dialog">
        <h2 className="text-lg font-semibold text-foreground" id="meeting-dialog-title">Запланировать встречу</h2>
        {conversations.length === 0 ? <p className="mt-4 text-sm text-muted-foreground" role="status">Планировать встречи можно после назначения исполнителя на заказ.</p> : (
          <form className="mt-4 space-y-4" onSubmit={(event) => void submit(event)}>
            <label className="block text-sm font-medium text-foreground">Заказ
              <select className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" value={selectedOrderId} onChange={(event) => setOrderId(event.currentTarget.value)}>
                {conversations.map((item) => <option key={item.orderId} value={item.orderId}>{item.orderTitle} · {item.participantName}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">Тема встречи
              <Input className="mt-1 rounded-xl" maxLength={200} required value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">Дата и время
                <Input className="mt-1 rounded-xl" min={localDateTimeValue()} required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.currentTarget.value)} />
              </label>
              <label className="block text-sm font-medium text-foreground">Формат
                <select className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" value={format} onChange={(event) => setFormat(event.currentTarget.value as OrderMeetingFormat)}>
                  <option value="VideoCall">Видеозвонок</option><option value="AudioCall">Аудиозвонок</option><option value="Chat">Встреча в чате</option><option value="InPerson">Личная встреча</option>
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium text-foreground">Заметка
              <textarea className="mt-1 min-h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" maxLength={1000} value={note} onChange={(event) => setNote(event.currentTarget.value)} />
            </label>
            <p className="text-xs text-muted-foreground">Встреча появится в календаре участников и в истории переписки по заказу.</p>
            {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
            <div className="flex justify-end gap-2"><Button onClick={onClose} type="button" variant="outline">Отмена</Button><Button disabled={isLoading || !selectedOrderId} type="submit">{isLoading ? 'Сохраняем…' : 'Сохранить встречу'}</Button></div>
          </form>
        )}
        {conversations.length === 0 ? <div className="mt-4 flex justify-end"><Button onClick={onClose} type="button" variant="outline">Закрыть</Button></div> : null}
      </section>
    </div>
  )
}
