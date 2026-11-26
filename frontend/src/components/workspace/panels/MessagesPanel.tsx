import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useGetMyAuthInfoQuery } from '@/shared/api/auth'
import {
  useGetOrderConversationsQuery,
  useGetOrderMessagesQuery,
  useDownloadOrderMessageAttachmentMutation,
  useSendOrderMessageMutation,
} from '@/shared/api/messages/api'
import type { OrderMessageResponse } from '@/shared/api/messages/api'
import type { WorkspaceRole } from '../model/data'
import { MeetingScheduleDialog } from './MeetingScheduleDialog'

type MessagesPanelProps = { role: WorkspaceRole; onOpenOrder: (orderId: string) => void }

const participantRoleLabels: Record<'Customer' | 'Executor', string> = {
  Customer: 'Заказчик',
  Executor: 'Исполнитель',
}

function messageTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function messageDate(value: string | null): string {
  if (!value) return 'Переписка ещё не началась'
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function MessagesPanel({ role, onOpenOrder }: MessagesPanelProps) {
  const { data: auth } = useGetMyAuthInfoQuery()
  const { data, isLoading, isError, refetch } = useGetOrderConversationsQuery(undefined, {
    skip: role === 'Applicant',
    pollingInterval: role === 'Applicant' ? 0 : 10_000,
  })
  const conversations = useMemo(() => data?.items ?? [], [data?.items])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({})
  const [isMeetingOpen, setIsMeetingOpen] = useState(false)
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false)
  const [sendMessage, { isLoading: isSending }] = useSendOrderMessageMutation()
  const [downloadAttachment] = useDownloadOrderMessageAttachmentMutation()
  const fileInput = useRef<HTMLInputElement>(null)
  const [attachmentErrors, setAttachmentErrors] = useState<Record<string, string>>({})

  function chooseFile(accept: string) {
    if (!fileInput.current) return
    fileInput.current.accept = accept
    fileInput.current.click()
    setIsAttachmentMenuOpen(false)
  }
  const activeId = selectedOrderId === ''
    ? null
    : conversations.some((item) => item.orderId === selectedOrderId)
      ? selectedOrderId
      : conversations[0]?.orderId ?? null
  const {
    currentData: history,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useGetOrderMessagesQuery(activeId ?? skipToken, {
    pollingInterval: activeId ? 10_000 : 0,
  })
  const activeConversation = conversations.find((item) => item.orderId === activeId) ?? null
  const visibleConversations = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('ru-RU')
    if (!normalized) return conversations
    return conversations.filter((item) =>
      `${item.participantName} ${participantRoleLabels[item.participantRole]} ${item.orderTitle} ${item.lastMessage ?? ''}`
        .toLocaleLowerCase('ru-RU')
        .includes(normalized),
    )
  }, [conversations, search])

  const draft = activeId ? (drafts[activeId] ?? '') : ''
  const selectedFile = activeId ? selectedFiles[activeId] ?? null : null
  const attachmentError = activeId ? attachmentErrors[activeId] ?? null : null
  const isHistoryPending = isHistoryLoading || (isHistoryFetching && !history)

  function selectConversation(orderId: string) {
    if (activeId && activeId !== orderId) {
      setSelectedFiles((current) => {
        const next = { ...current }
        delete next[activeId]
        return next
      })
      setAttachmentErrors((current) => {
        const next = { ...current }
        delete next[activeId]
        return next
      })
    }
    if (fileInput.current) fileInput.current.value = ''
    setSelectedOrderId(orderId)
  }

  function updateDraft(value: string) {
    if (!activeId) return
    setDrafts((current) => ({ ...current, [activeId]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!activeId || (!text && !selectedFile) || isSending) return
    const orderId = activeId
    const submittedFile = selectedFile
    try {
      await sendMessage({ orderId, text, file: submittedFile ?? undefined }).unwrap()
      setDrafts((current) => current[orderId] === draft ? { ...current, [orderId]: '' } : current)
      if (submittedFile) {
        setSelectedFiles((current) => {
          if (current[orderId] !== submittedFile) return current
          const next = { ...current }
          delete next[orderId]
          return next
        })
      }
      setIsAttachmentMenuOpen(false)
      if (activeId === orderId && fileInput.current) fileInput.current.value = ''
      setAttachmentErrors((current) => {
        if (!(orderId in current)) return current
        const next = { ...current }
        delete next[orderId]
        return next
      })
    } catch {
      setAttachmentErrors((current) => ({ ...current, [orderId]: 'Не удалось отправить сообщение. Проверьте соединение и попробуйте ещё раз.' }))
    }
  }

  async function handleDownload(message: OrderMessageResponse) {
    if (!activeId || !message.attachmentFileName) return
    const orderId = activeId
    try {
      const file = await downloadAttachment({ orderId, messageId: message.id }).unwrap()
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = message.attachmentFileName
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setAttachmentErrors((current) => ({ ...current, [orderId]: 'Не удалось скачать вложение.' }))
    }
  }

  return (
    <section className="mx-auto flex h-full min-h-[640px] w-full max-w-[1680px] flex-col gap-5 py-1">
      <header className="px-8">
        <h1 className="text-3xl font-semibold text-foreground">Сообщения</h1>
      </header>

      {role === 'Applicant' ? (
        <Card className="flex flex-1 items-center justify-center rounded-2xl border-border p-8 text-center shadow-none">
          <div role="status"><h2 className="font-semibold text-foreground">Переписка по заказам недоступна</h2><p className="mt-2 text-sm text-muted-foreground">Сообщения доступны заказчикам и назначенным исполнителям.</p></div>
        </Card>
      ) : (
        <Card className="mx-8 grid min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border-border p-0 shadow-none lg:grid-cols-[minmax(320px,29%)_minmax(0,1fr)]">
          <aside className={`${activeId ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 flex-col border-border lg:border-r`} aria-label="Список диалогов">
            <div className="border-b border-border p-4">
              <h2 className="text-base font-semibold text-foreground">Диалоги</h2>
              <Input className="mt-3 rounded-xl" aria-label="Поиск диалогов" placeholder="Имя или заказ" value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {isLoading ? <p className="p-4 text-sm text-muted-foreground" role="status">Загружаем диалоги…</p> : null}
              {isError ? <div className="p-4 text-sm text-destructive" role="alert">Не удалось загрузить переписку. <button className="underline" onClick={() => void refetch()} type="button">Повторить</button></div> : null}
              {!isLoading && !isError && visibleConversations.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground" role="status">{conversations.length ? 'Диалоги не найдены.' : 'Диалоги появятся после назначения исполнителя на заказ.'}</p>
              ) : null}
              {visibleConversations.map((conversation) => (
                <button
                  key={conversation.orderId}
                  className={`mb-1 w-full rounded-xl border p-3 text-left transition-colors ${activeId === conversation.orderId ? 'border-primary/30 bg-primary/10' : 'border-transparent hover:bg-muted'}`}
                  onClick={() => selectConversation(conversation.orderId)}
                  type="button"
                >
                  <span className="flex items-start justify-between gap-3"><span className="font-semibold text-foreground">{conversation.participantName}</span>{conversation.unreadCount > 0 ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{conversation.unreadCount}</span> : null}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{participantRoleLabels[conversation.participantRole]}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{conversation.orderTitle}</span>
                  <span className="mt-2 block truncate text-sm text-muted-foreground">{conversation.lastMessage ?? 'Напишите первое сообщение'}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{messageDate(conversation.lastMessageAtUtc)}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className={`${activeId ? 'flex' : 'hidden lg:flex'} min-h-0 min-w-0 flex-col`} aria-label="Переписка">
            {activeConversation ? <>
              <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
                <button className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Назад к диалогам" onClick={() => { if (activeId) selectConversation('') }} type="button">←</button>
                <div className="min-w-0"><h2 className="truncate font-semibold text-foreground">{activeConversation.participantName}</h2><p className="truncate text-xs text-muted-foreground">{participantRoleLabels[activeConversation.participantRole]} · {activeConversation.orderTitle}</p></div>
                <Button className="ml-auto h-9 shrink-0 rounded-lg px-2 text-xs sm:px-3 sm:text-sm" onClick={() => onOpenOrder(activeConversation.orderId)} type="button" variant="outline">К проекту</Button>
              </header>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col-reverse gap-3 overflow-y-auto bg-muted/30 px-4 py-5 sm:px-6" role="log" aria-label="История сообщений">
                {isHistoryPending ? <p className="text-sm text-muted-foreground" role="status">Загружаем историю…</p> : null}
                {isHistoryError ? (
                  <div className="m-auto rounded-xl border border-destructive/30 bg-card p-6 text-center text-sm text-destructive" role="alert">
                    <p>Не удалось загрузить историю сообщений.</p>
                    <button className="mt-2 underline" onClick={() => void refetchHistory()} type="button">Повторить загрузку</button>
                  </div>
                ) : null}
                {!isHistoryPending && !isHistoryError && (history?.items.length ?? 0) === 0 ? <p className="m-auto rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">Начните переписку по заказу «{activeConversation.orderTitle}».</p> : null}
                {[...(history?.items ?? [])].reverse().map((message) => (
                  <article key={message.id} className={`min-w-0 max-w-[min(78%,42rem)] break-words [overflow-wrap:anywhere] rounded-2xl px-4 py-3 shadow-sm ${message.senderUserId === auth?.userId ? 'ml-auto bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}>
                    <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
                    {message.attachmentFileName ? <button className={`mt-2 block max-w-full truncate text-sm underline ${message.senderUserId === auth?.userId ? 'text-primary-foreground' : 'text-primary'}`} onClick={() => void handleDownload(message)} type="button">Скачать файл: {message.attachmentFileName}</button> : null}
                    <p className={`mt-1 text-right text-xs ${message.senderUserId === auth?.userId ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{message.senderUserId === auth?.userId ? 'Вы · ' : ''}{messageTime(message.createdAtUtc)}</p>
                  </article>
                ))}
              </div>
              <form className="border-t border-border p-3 sm:p-4" onSubmit={(event) => void handleSubmit(event)}>
                <label className="sr-only" htmlFor="order-message-draft">Текст сообщения</label>
                <div className="flex flex-wrap items-end gap-2 sm:flex-nowrap">
                  <input key={activeId ?? 'no-order'} ref={fileInput} className="sr-only" aria-label="Выбрать файл для отправки" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.png,.jpg,.jpeg,.mp3,.m4a,.wav,.ogg,.mp4,.webm,.mov" onChange={(event) => { if (activeId) { const file = event.currentTarget.files?.[0]; setSelectedFiles((current) => { const next = { ...current }; if (file) next[activeId] = file; else delete next[activeId]; return next }) } }} />
                  <div className="relative">
                    <Button aria-expanded={isAttachmentMenuOpen} aria-label="Прикрепить или запланировать" className="h-11 rounded-xl" onClick={() => setIsAttachmentMenuOpen((open) => !open)} type="button" variant="outline">＋</Button>
                    {isAttachmentMenuOpen ? <div className="absolute bottom-full left-0 z-10 mb-2 min-w-48 rounded-xl border border-border bg-card p-1 shadow-lg"><button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => chooseFile('.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.png,.jpg,.jpeg')} type="button">Прикрепить файл</button><button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => chooseFile('.mp3,.m4a,.wav,.ogg')} type="button">Аудио</button><button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => chooseFile('.mp4,.webm,.mov')} type="button">Видео</button><button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => { setIsMeetingOpen(true); setIsAttachmentMenuOpen(false) }} type="button">Запланировать встречу</button></div> : null}
                  </div>
                  <Button aria-label="Аудиозвонок недоступен" className="h-11 rounded-xl" disabled title="Аудиозвонки пока недоступны" type="button" variant="outline">☎</Button>
                  <Button aria-label="Видеозвонок недоступен" className="h-11 rounded-xl" disabled title="Видеозвонки пока недоступны" type="button" variant="outline">▣</Button>
                  <textarea id="order-message-draft" aria-keyshortcuts="Control+Enter Meta+Enter" className="order-2 min-h-11 max-h-36 basis-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:order-none sm:min-w-0 sm:flex-1" maxLength={4000} placeholder="Напишите сообщение…" value={draft} onChange={(event) => updateDraft(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} />
                  <Button className="order-3 ml-auto h-11 rounded-xl sm:order-none sm:ml-0" disabled={(!draft.trim() && !selectedFile) || isSending} type="submit">{isSending ? 'Отправляем…' : 'Отправить'}</Button>
                </div>
                {selectedFile ? <p className="mt-2 flex min-w-0 items-center gap-2 text-xs text-muted-foreground"><span className="min-w-0 flex-1 truncate">Файл: {selectedFile.name}</span><button className="shrink-0 whitespace-nowrap underline" onClick={() => { if (activeId) setSelectedFiles((current) => { const next = { ...current }; delete next[activeId]; return next }); if (fileInput.current) fileInput.current.value = '' }} type="button">Убрать</button></p> : null}
                {attachmentError ? <p className="mt-2 text-sm text-destructive" role="alert">{attachmentError}</p> : null}
                <p className="mt-2 text-xs text-muted-foreground">Переписка доступна только участникам этого заказа.</p>
              </form>
            </> : <div className="m-auto hidden max-w-md p-8 text-center lg:block"><h2 className="font-semibold text-foreground">Выберите диалог</h2><p className="mt-2 text-sm text-muted-foreground">Здесь откроется история переписки с заказчиком или исполнителем.</p></div>}
          </section>
        </Card>
      )}
      {isMeetingOpen ? <MeetingScheduleDialog initialOrderId={activeId} onClose={() => setIsMeetingOpen(false)} open={isMeetingOpen} role={role} /> : null}
    </section>
  )
}
