import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGetOrderMeetingsQuery, type OrderMeetingResponse } from '@/shared/api/meetings/api'
import type { WorkspaceRole } from '../model/data'
import { MeetingScheduleDialog } from './MeetingScheduleDialog'

type CalendarPanelProps = { role: WorkspaceRole }

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const formatLabels: Record<OrderMeetingResponse['format'], string> = {
  AudioCall: 'Аудиозвонок',
  VideoCall: 'Видеозвонок',
  Chat: 'Встреча в чате',
  InPerson: 'Личная встреча',
}

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDateKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function dateLabel(value: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('ru-RU', options).format(parseDateKey(value))
}

function meetingDateKey(meeting: OrderMeetingResponse): string {
  return toLocalDateKey(new Date(meeting.startsAtUtc))
}

export function CalendarPanel({ role }: CalendarPanelProps) {
  const today = new Date()
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(today))
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const range = useMemo(() => {
    const startOffset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7
    const from = new Date(month.getFullYear(), month.getMonth(), 1 - startOffset)
    const to = new Date(from)
    to.setDate(to.getDate() + 42)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [month])
  const { data, isLoading, isError, refetch } = useGetOrderMeetingsQuery(range, { skip: role === 'Applicant' })
  const meetings = data?.items ?? []
  const monthLabel = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(month)
  const firstWeekday = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = useMemo(() => [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)),
  ], [daysInMonth, firstWeekday, month])
  const dayMeetings = meetings.filter((meeting) => meetingDateKey(meeting) === selectedDate)
  const selectedLabel = dateLabel(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })

  function changeMonth(delta: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1)
    setMonth(next)
    setSelectedDate(toLocalDateKey(next))
  }

  if (role === 'Applicant') {
    return <Card className="m-5 flex min-h-72 items-center justify-center rounded-2xl border-border p-8 text-center shadow-none"><p className="text-sm text-muted-foreground" role="status">Календарь встреч доступен заказчикам и исполнителям по назначенным заказам.</p></Card>
  }

  return (
    <section className="mx-auto flex min-h-full w-full max-w-[1680px] flex-col gap-6 py-3">
      <header className="mx-4 flex flex-wrap items-start justify-between gap-4 sm:mx-8 sm:items-end">
        <div className="min-w-0"><p className="text-sm text-muted-foreground">Кабинет менеджера</p><h1 className="mt-1 text-2xl font-semibold capitalize leading-tight text-foreground sm:text-3xl">Календарь встреч</h1><p className="mt-1 text-sm text-muted-foreground">Встречи с заказчиками и кандидатами</p></div>
        <Button className="rounded-xl" onClick={() => setIsScheduleOpen(true)} type="button">+ Запланировать встречу</Button>
      </header>

      <div className="mx-8 grid gap-5 xl:grid-cols-[minmax(320px,410px)_minmax(0,1fr)]">
        <Card className="rounded-2xl border-border p-5 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <Button aria-label="Предыдущий месяц" className="h-9 w-9 rounded-lg p-0 text-xl" onClick={() => changeMonth(-1)} type="button" variant="outline">‹</Button>
            <h2 className="font-semibold capitalize text-foreground">{monthLabel}</h2>
            <Button aria-label="Следующий месяц" className="h-9 w-9 rounded-lg p-0 text-xl" onClick={() => changeMonth(1)} type="button" variant="outline">›</Button>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {weekdays.map((weekday) => <div className="py-2" key={weekday}>{weekday}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, index) => {
              if (!date) return <span aria-hidden="true" className="h-11" key={`blank-${index}`} />
              const key = toLocalDateKey(date)
              const hasMeeting = meetings.some((meeting) => meetingDateKey(meeting) === key)
              const isSelected = selectedDate === key
              const isToday = key === toLocalDateKey(today)
              return <button aria-label={dateLabel(key, { day: 'numeric', month: 'long' })} aria-pressed={isSelected} className={`relative h-11 rounded-xl text-sm transition-colors hover:bg-muted ${isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : isToday ? 'border border-primary/40 text-primary' : 'text-foreground'}`} key={key} onClick={() => setSelectedDate(key)} type="button">{date.getDate()}{hasMeeting ? <span aria-label="Есть встреча" className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} /> : null}</button>
            })}
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary" /> Запланирована встреча</p>
        </Card>

        <Card className="min-h-[420px] rounded-2xl border-border p-5 shadow-none">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold capitalize text-foreground">{selectedLabel}</h2><span className="text-sm text-muted-foreground">{dayMeetings.length} {dayMeetings.length === 1 ? 'встреча' : 'встреч'}</span></div>
          {isLoading ? <p className="mt-8 text-center text-sm text-muted-foreground" role="status">Загружаем встречи…</p> : null}
          {isError ? <div className="mt-8 text-center text-sm text-destructive" role="alert">Не удалось загрузить календарь. <button className="underline" onClick={() => void refetch()} type="button">Повторить</button></div> : null}
          {!isLoading && !isError && dayMeetings.length === 0 ? <div className="mt-20 text-center"><h3 className="font-semibold text-foreground">На этот день встреч нет</h3><p className="mt-2 text-sm text-muted-foreground">Выберите дату с отметкой или запланируйте новую встречу.</p><Button className="mt-4 rounded-xl" onClick={() => setIsScheduleOpen(true)} type="button" variant="outline">Запланировать встречу</Button></div> : null}
          <div className="mt-5 space-y-3">
            {dayMeetings.map((meeting) => (
              <article className="rounded-xl border border-border bg-card p-4" key={meeting.id}>
                <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold text-foreground">{meeting.title}</h3><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{formatLabels[meeting.format]}</span></div>
                <p className="mt-2 text-sm text-muted-foreground">{new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(meeting.startsAtUtc))} · {meeting.participantName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{meeting.orderTitle}</p>
                {meeting.note ? <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{meeting.note}</p> : null}
              </article>
            ))}
          </div>
        </Card>
      </div>

      {isScheduleOpen ? <MeetingScheduleDialog onClose={() => setIsScheduleOpen(false)} open role={role} /> : null}
    </section>
  )
}
