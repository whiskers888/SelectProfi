import { useState } from 'react'
import { ArrowLeft, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type WorkspaceOrder } from '../model/data'

import { exchangeProjectLocation, formatExchangeMoney, formatExchangeSalary } from '../shell/workspaceShell.helpers'

type ExchangeProjectDetailsProps = {
  canRespond: boolean
  error: string
  hasResponded: boolean
  isResponding: boolean
  isSavingFavorite: boolean
  onBack: () => void
  onRespond?: (message: string) => Promise<boolean | void>
  onToggleFavorite: () => void
  order: WorkspaceOrder
  responseMessage?: string | null
}

export function ExchangeProjectDetails({
  canRespond,
  error,
  hasResponded,
  isResponding,
  isSavingFavorite,
  onBack,
  onRespond,
  onToggleFavorite,
  order,
  responseMessage,
}: ExchangeProjectDetailsProps) {
  const [message, setMessage] = useState('')
  const [sentResponse, setSentResponse] = useState<{ message: string } | null>(null)
  const responseSent = hasResponded || sentResponse !== null
  const sections = [
    ['О вакансии', order.description],
    ['Обязанности', order.functional === order.description ? '' : order.functional],
    ['Обязательные требования', order.requirements],
    ['Зарплата кандидата', formatExchangeSalary(order)],
    ['Задача исполнителя', [
      order.requestedCandidatesCount && `Кандидатов к представлению — ${order.requestedCandidatesCount}`,
      order.fulfillmentDays && `Срок подбора — ${order.fulfillmentDays} дн.`,
    ].filter(Boolean).join(' · ')],
    ['Другие условия', order.otherConditions],
  ]

  return (
    <section>
      <button className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline" onClick={onBack} type="button">
        <ArrowLeft aria-hidden="true" size={16} /> К результатам поиска
      </button>
      {error ? <p className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p> : null}
      <div className="workspace-exchange-detail">
        <article className="min-w-0 rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">{order.company}</p>
          <h1 className="my-1 break-words text-3xl font-semibold tracking-tight">{order.title}</h1>
          <p className="text-sm text-muted-foreground">{exchangeProjectLocation(order)}</p>
          {sections.map(([label, value]) => value ? (
            <section className="mt-5" key={label}>
              <h2 className="mb-1 font-semibold">{label}</h2>
              <p className="whitespace-pre-wrap break-words text-sm">{value}</p>
            </section>
          ) : null)}
        </article>
        <aside className="min-w-0 space-y-3 rounded-lg border border-border bg-card p-5">
          <div>
            <p className="text-xs text-muted-foreground">Вознаграждение за подбор</p>
            <strong className="text-2xl text-primary">{formatExchangeMoney(order.executorNetAmount ?? order.price ?? 0)}</strong>
          </div>
          <p className="text-sm">
            {order.warrantyMonths
              ? `За гарантию · ${formatExchangeMoney(order.guaranteeReward ?? 0)} (${order.warrantyMonths} мес.)`
              : 'Без гарантии'}
          </p>
          {responseSent ? (
            <div className="rounded-lg bg-muted p-3 text-sm" role="status">
              <strong>Отклик отправлен</strong>
              {responseMessage || sentResponse?.message ? (
                <p className="mt-2 whitespace-pre-wrap break-words">{responseMessage || sentResponse?.message}</p>
              ) : null}
            </div>
          ) : canRespond && onRespond ? (
            <form className="space-y-3" onSubmit={async (event) => {
              event.preventDefault()
              if (isResponding) return
              const submittedMessage = message.trim()
              if (await onRespond(submittedMessage) !== false) setSentResponse({ message: submittedMessage })
            }}>
              <label className="block text-sm font-medium">
                Сообщение заказчику <span className="font-normal text-muted-foreground">(необязательно)</span>
                <textarea
                  className="mt-1.5 block min-h-24 w-full resize-y rounded-md border border-border bg-background p-2.5 text-sm font-normal"
                  maxLength={2000}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Расскажите об опыте похожих подборов"
                  value={message}
                />
              </label>
              <Button className="w-full" disabled={isResponding} type="submit">{isResponding ? 'Отправляем…' : 'Откликнуться'}</Button>
            </form>
          ) : null}
          <Button aria-pressed={Boolean(order.isFavorite)} className="w-full gap-2" disabled={isSavingFavorite} onClick={onToggleFavorite} type="button" variant="outline">
            <Bookmark aria-hidden="true" fill={order.isFavorite ? 'currentColor' : 'none'} size={16} />
            {order.isFavorite ? 'Убрать из избранного' : 'В избранное'}
          </Button>
        </aside>
      </div>
    </section>
  )
}
