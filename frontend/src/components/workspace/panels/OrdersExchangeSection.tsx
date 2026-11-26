import { useEffect, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useGetOrderByIdQuery, useGetOrderSpecializationsQuery, useGetOrdersQuery, useSetOrderFavoriteMutation } from '@/shared/api/orders'
import { workspaceToneToBadgeVariant, type WorkspaceOrder } from '../model/data'
import { OrderDetailsPagePanel } from './OrderDetailsPagePanel'
import type { MainFeedPanelViewProps } from './MainFeedPanel.types'

function formatSalaryRange(minimum?: number | null, maximum?: number | null): string {
  const min = typeof minimum === 'number' ? minimum : null
  const max = typeof maximum === 'number' ? maximum : null
  if (min !== null && max !== null) return `${min.toLocaleString('ru-RU')}–${max.toLocaleString('ru-RU')} ₽`
  if (min !== null) return `от ${min.toLocaleString('ru-RU')} ₽`
  if (max !== null) return `до ${max.toLocaleString('ru-RU')} ₽`
  return ''
}
import { toWorkspaceOrder } from '../shell/workspaceShell.helpers'

export function OrdersExchangeSection({
  canPublishVacancyForCustomer = false,
  canManageOrderResponses = false,
  canRespondToOrder = false,
  filteredOrders,
  hasRespondedToOrder = false,
  myResponseMessage = null,
  isOrderResponsesLoading = false,
  isPublishingVacancyForCustomer = false,
  isRejectingOrderExecutor = false,
  isRespondingToOrder = false,
  isSelectingOrderExecutor = false,
  isUpdatingApplicantResponderStage = false,
  onCreateVacancyFromOrder,
  onOpenChat,
  onCloseOrderDetails,
  onOpenCandidate,
  onOpenOrder,
  onPublishVacancyForCustomer,
  onMoveApplicantResponderToShortlist,
  onRejectApplicantResponder,
  onRejectOrderExecutor,
  onRespondToOrder,
  onSelectOrder,
  onSelectOrderExecutor,
  orderResponses = [],
  orders,
  requesterUserId,
  role = 'Executor',
  selectedOrderDetails: controlledSelectedOrderDetails = null,
  selectedOrderApplicantResponders = [],
  selectedOrderExecutorName = null,
  selectedOrderId,
  selectedOrderVacancyPreview = null,
}: MainFeedPanelViewProps) {
  const [isApplicantVacancyFiltersOpen, setIsApplicantVacancyFiltersOpen] = useState(false)
  const [exchangeQuery, setExchangeQuery] = useState('')
  const [exchangeSpecialization, setExchangeSpecialization] = useState('')
  const [exchangeMode, setExchangeMode] = useState('')
  const [exchangeWarranty, setExchangeWarranty] = useState('')
  const [exchangeMinimumReward, setExchangeMinimumReward] = useState('')
  const [exchangeSort, setExchangeSort] = useState<'new' | 'reward' | 'salary' | 'bonus'>('new')
  const [exchangeLayout, setExchangeLayout] = useState<'feed' | 'table'>('feed')
  const [exchangeTab, setExchangeTab] = useState<'all' | 'saved' | 'responses'>('all')
  const [exchangePage, setExchangePage] = useState(1)
  const [exchangePageSize, setExchangePageSize] = useState(25)
  const [exchangeDebouncedQuery, setExchangeDebouncedQuery] = useState('')
  const [localSelectedOrderId, setLocalSelectedOrderId] = useState<string | null>(null)
  const [localSelectedOrder, setLocalSelectedOrder] = useState<WorkspaceOrder | null>(null)
  const [setOrderFavorite, { isLoading: isSavingFavorite }] = useSetOrderFavoriteMutation()
  const [exchangeError, setExchangeError] = useState('')
  const [responseOrderId, setResponseOrderId] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState('')
  useEffect(() => {
    const timer = window.setTimeout(() => setExchangeDebouncedQuery(exchangeQuery.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [exchangeQuery])
  const { data: specializationData } = useGetOrderSpecializationsQuery(role === 'Executor' ? undefined : skipToken)
  const specializationId = specializationData?.items.find((item) => item.name === exchangeSpecialization)?.id
  const exchangeRequest = role === 'Executor' ? {
    limit: exchangePageSize,
    offset: (exchangePage - 1) * exchangePageSize,
    includeArchived: exchangeTab !== 'all',
    exchangeOnly: exchangeTab === 'all',
    search: exchangeDebouncedQuery || undefined,
    specializationId,
    workMode: (exchangeMode || undefined) as 'Remote' | 'Office' | 'Hybrid' | undefined,
    hasWarranty: exchangeWarranty ? exchangeWarranty === 'yes' : undefined,
    minimumReward: exchangeMinimumReward ? Number(exchangeMinimumReward) : undefined,
    favoritesOnly: exchangeTab === 'saved',
    responsesOnly: exchangeTab === 'responses',
    sortBy: exchangeSort,
  } : skipToken
  const {
    data: exchangeData,
    isError: isExchangeError,
    isFetching: isExchangeFetching,
    refetch: refetchExchange,
  } = useGetOrdersQuery(exchangeRequest)
  const countAll = useGetOrdersQuery(role === 'Executor' ? { limit: 1, exchangeOnly: true } : skipToken).data?.totalCount ?? 0
  const countSaved = useGetOrdersQuery(role === 'Executor' ? { limit: 1, includeArchived: true, favoritesOnly: true } : skipToken).data?.totalCount ?? 0
  const countResponses = useGetOrdersQuery(role === 'Executor' ? { limit: 1, includeArchived: true, responsesOnly: true } : skipToken).data?.totalCount ?? 0
  const { currentData: queriedSelectedOrder } = useGetOrderByIdQuery(localSelectedOrderId ?? skipToken)
  const lastValidPage = exchangeData?.totalCount === undefined
    ? null
    : Math.max(1, Math.ceil(exchangeData.totalCount / exchangePageSize))
  if (lastValidPage !== null && exchangePage > lastValidPage) {
    setExchangePage(lastValidPage)
  }

  const handleCloseSelectedOrder = () => {
    setLocalSelectedOrderId(null)
    setLocalSelectedOrder(null)
    onCloseOrderDetails?.()
  }
  const selectedOrderDetails = controlledSelectedOrderDetails ?? (
    localSelectedOrderId
      ? localSelectedOrder?.id === localSelectedOrderId
        ? localSelectedOrder
        : queriedSelectedOrder
          ? toWorkspaceOrder(queriedSelectedOrder)
          : null
      : null
  )
  const isApplicantRole = role === 'Applicant'
  const isExecutorRole = role === 'Executor'

    const isOrderDetailsOpen = Boolean(selectedOrderDetails)
    const listedOrders = isApplicantRole ? orders : filteredOrders

    if (isExecutorRole) {
      const sourceOrders = (exchangeData?.items ?? []).map(toWorkspaceOrder)
      const localOrderForDetails = localSelectedOrder?.id === selectedOrderDetails?.id ? localSelectedOrder : null
      const detailResponseStatus = localOrderForDetails?.myResponseStatus ?? selectedOrderDetails?.myResponseStatus
      const detailHasResponded = localOrderForDetails
        ? Boolean(localOrderForDetails.myResponseStatus)
        : hasRespondedToOrder
      const detailCanRespond = Boolean(
        selectedOrderDetails &&
        role === 'Executor' &&
        !selectedOrderDetails.executorId &&
        !selectedOrderDetails.isPaused &&
        !selectedOrderDetails.isArchived &&
        selectedOrderDetails.statusLabel === 'Ожидает назначения' &&
        !detailResponseStatus,
      )
      const specializations = specializationData?.items.map((item) => item.name) ?? []
      const pageSize = exchangePageSize
      const totalCount = exchangeData?.totalCount ?? 0
      const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
      const currentPage = Math.min(exchangePage, pageCount)
      const pageOrders = sourceOrders

      const toggleSaved = async (orderId: string) => {
        setExchangeError('')
        try {
          const order = sourceOrders.find((item) => item.id === orderId)
          await setOrderFavorite({ orderId, isFavorite: !order?.isFavorite }).unwrap()
        } catch {
          setExchangeError('Не удалось обновить избранное. Повторите попытку.')
        }
      }

      const openOrder = (order: (typeof sourceOrders)[number]) => {
        setLocalSelectedOrder(order)
        setLocalSelectedOrderId(order.id)
        onSelectOrder(order.id)
        onOpenOrder(order)
      }

      return (
        <div className="space-y-4 lg:flex lg:items-start lg:gap-4 lg:space-y-0">
          <Card className={cn('min-w-0 rounded-none border-0 bg-transparent p-0 shadow-none', selectedOrderDetails ? 'max-lg:hidden lg:w-1/3' : 'w-full')}>
            {exchangeError ? <p role="alert" className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{exchangeError}</p> : null}
            {isExchangeError ? (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                <span>Не удалось обновить список проектов. {exchangeData ? 'Показаны ранее загруженные данные.' : 'Повторите запрос.'}</span>
                <button className="rounded-lg border border-destructive/30 px-3 py-1.5 font-medium hover:bg-destructive/10" onClick={() => void refetchExchange()} type="button">Повторить</button>
              </div>
            ) : null}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground">Кабинет исполнителя / Биржа проектов</p>
              <h1 className="mt-6 text-3xl font-bold text-foreground">Биржа проектов</h1>
            </div>
            <div className="mb-4 flex gap-5 overflow-x-auto border-b border-border" role="tablist" aria-label="Проекты">
              {([
                ['all', 'Все проекты', countAll],
                ['saved', 'Избранное', countSaved],
                ['responses', 'Мои отклики', countResponses],
              ] as const).map(([tab, label, count]) => (
                <button
                  key={tab}
                  aria-pressed={exchangeTab === tab}
                  className={cn('shrink-0 border-b-2 px-1 py-2 text-sm font-medium', exchangeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground')}
                  onClick={() => { setExchangeTab(tab); setExchangePage(1) }}
                  role="tab"
                  type="button"
                >
                  {label} <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs">{count}</span>
                </button>
              ))}
            </div>
            <div className="space-y-2.5 rounded-xl border border-border bg-card p-4">
              <label className="block">
                <span className="sr-only">Поиск проектов</span>
                <input
                  aria-label="Поиск по вакансии, компании, городу или номеру"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  onChange={(event) => { setExchangeQuery(event.target.value); setExchangePage(1) }}
                  placeholder="Вакансия, компания, город или номер заказа"
                  value={exchangeQuery}
                />
              </label>
              <div className="flex flex-wrap items-end gap-2">
                <label className="w-[155px]">
                  <span className="sr-only">Специализация</span>
                  <select aria-label="Специализация" className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground" onChange={(event) => { setExchangeSpecialization(event.target.value); setExchangePage(1) }} value={exchangeSpecialization}>
                    <option value="">Все специализации</option>
                    {specializations.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="w-[125px]">
                  <span className="sr-only">Формат работы</span>
                  <select aria-label="Формат работы" className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground" onChange={(event) => { setExchangeMode(event.target.value); setExchangePage(1) }} value={exchangeMode}>
                    <option value="">Любой формат</option>
                    <option value="Remote">Удалённо</option>
                    <option value="Office">В офисе</option>
                    <option value="Hybrid">Гибридный</option>
                  </select>
                </label>
                <label className="w-[133px]">
                  <span className="sr-only">Гарантия</span>
                  <select aria-label="Гарантия" className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground" onChange={(event) => { setExchangeWarranty(event.target.value); setExchangePage(1) }} value={exchangeWarranty}>
                    <option value="">Любая гарантия</option>
                    <option value="yes">С гарантией</option>
                    <option value="no">Без гарантии</option>
                  </select>
                </label>
                <label className="w-[142px]">
                  <span className="sr-only">Вознаграждение от</span>
                  <select aria-label="Минимальное вознаграждение" className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground" onChange={(event) => { setExchangeMinimumReward(event.target.value); setExchangePage(1) }} value={exchangeMinimumReward}>
                    <option value="">Любое</option>
                    <option value="60000">60 000 ₽</option>
                    <option value="90000">90 000 ₽</option>
                    <option value="120000">120 000 ₽</option>
                  </select>
                </label>
                <button className="h-8 text-left text-sm font-medium text-primary hover:underline" onClick={() => { setExchangeQuery(''); setExchangeSpecialization(''); setExchangeMode(''); setExchangeWarranty(''); setExchangeMinimumReward(''); setExchangeSort('new'); setExchangePage(1) }} type="button">Сбросить</button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <strong>Найдено проектов: {totalCount}</strong>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-border bg-background p-1" aria-label="Вид списка">
                  <button aria-pressed={exchangeLayout === 'feed'} className={cn('rounded px-2 py-0.5 text-sm', exchangeLayout === 'feed' && 'bg-primary/10 text-primary')} onClick={() => setExchangeLayout('feed')} type="button">Лента</button>
                  <button aria-pressed={exchangeLayout === 'table'} className={cn('rounded px-2 py-0.5 text-sm', exchangeLayout === 'table' && 'bg-primary/10 text-primary')} onClick={() => setExchangeLayout('table')} type="button">Таблица</button>
                </div>
                <label className="text-xs text-muted-foreground"><span className="sr-only">Сортировка:</span><select aria-label="Сортировка проектов" className="h-9 max-w-52 rounded-lg border border-border bg-background px-2 text-sm text-foreground" onChange={(event) => setExchangeSort(event.target.value as typeof exchangeSort)} value={exchangeSort}><option value="new">Сначала новые</option><option value="salary">По зарплате кандидата ↓</option><option value="reward">По оплате за подбор ↓</option><option value="bonus">По оплате за гарантию ↓</option></select></label>
                <label className="text-xs text-muted-foreground">На странице: <select aria-label="Проектов на странице" className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground" value={pageSize} onChange={(event) => { setExchangePageSize(Number(event.target.value)); setExchangePage(1) }}>{[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
              </div>
            </div>
            {isExchangeFetching && !exchangeData ? <p className="py-8 text-center text-sm text-muted-foreground" role="status">Загружаем проекты…</p> : null}
            {totalCount === 0 && !isExchangeFetching && !isExchangeError ? (
              <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center">
                <p className="font-medium">{exchangeTab === 'saved' ? 'В избранном пока нет проектов' : exchangeTab === 'responses' ? 'Откликов пока нет' : 'Подходящих проектов не найдено'}</p>
                <p className="mt-1 text-sm text-muted-foreground">Измените запрос или сбросьте фильтры, чтобы увидеть другие проекты.</p>
                <button className="mt-3 text-sm font-medium text-primary hover:underline" onClick={() => { setExchangeTab('all'); setExchangeQuery(''); setExchangeSpecialization(''); setExchangeMode(''); setExchangeWarranty(''); setExchangeMinimumReward(''); setExchangeSort('new'); setExchangePage(1) }} type="button">Показать все проекты</button>
              </div>
            ) : exchangeLayout === 'feed' ? (
              <div className="mt-2 space-y-3">
                {pageOrders.map((order) => (
                  <article className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[minmax(0,1fr)_auto]" key={order.id}>
                    <button className="min-w-0 text-left" onClick={() => openOrder(order)} type="button">
                      <span className="text-xs text-muted-foreground">{order.company} · {order.location || 'Локация не указана'} · {order.workMode === 'Remote' ? 'Удалённо' : order.workMode === 'Office' ? 'В офисе' : order.workMode === 'Hybrid' ? 'Гибридный' : 'Формат не указан'}</span>
                      <span className="mt-1 block text-base font-semibold text-foreground">{order.title}</span>
                      <span className="mt-2 line-clamp-2 block text-sm text-muted-foreground">{order.requirements || order.functional || 'Подробности проекта доступны в карточке заказа.'}</span>
                      <span className="mt-2 block text-xs text-muted-foreground">Зарплата кандидата · {formatSalaryRange(order.salaryMin, order.salaryMax) ? `${formatSalaryRange(order.salaryMin, order.salaryMax)} / мес.` : order.employeeCompensation || 'Не указана'}</span>
                    </button>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                      <div className="text-left sm:text-right"><span className="block text-xs text-muted-foreground">За подбор</span><strong className="text-lg text-primary">{(order.executorNetAmount ?? order.price ?? 0).toLocaleString('ru-RU')} ₽</strong><span className="block text-xs text-muted-foreground">{order.warrantyMonths ? `За гарантию +${(order.guaranteeReward ?? 0).toLocaleString('ru-RU')} ₽ · ${order.warrantyMonths} мес.` : 'Без гарантии'}</span>{order.fulfillmentDays ? <span className="block text-xs text-muted-foreground">Срок подбора · {order.fulfillmentDays} дн.</span> : null}</div>
                      <div className="flex items-center gap-2">
                        {order.myResponseStatus && order.myResponseStatus !== 'Withdrawn' ? <Badge variant="neutral">Отклик отправлен</Badge> : null}
                        <button aria-label={order.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'} aria-pressed={order.isFavorite ?? false} className="h-9 rounded-lg border border-border px-3 text-sm hover:bg-muted" disabled={isSavingFavorite} onClick={() => void toggleSaved(order.id)} type="button">{order.isFavorite ? '★' : '☆'}</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-2 overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader><TableRow><TableHead>Вакансия / заказчик</TableHead><TableHead>Место работы</TableHead><TableHead>Зарплата в месяц</TableHead><TableHead>За подбор</TableHead><TableHead>За гарантию</TableHead><TableHead>Избранное</TableHead></TableRow></TableHeader>
                  <TableBody>{pageOrders.map((order) => <TableRow key={order.id}>
                    <TableCell><button className="text-left font-medium text-primary hover:underline" onClick={() => openOrder(order)} type="button">{order.title}</button><span className="block text-xs text-muted-foreground">{order.company}</span>{order.myResponseStatus && order.myResponseStatus !== 'Withdrawn' ? <span className="text-xs text-muted-foreground">Отклик отправлен</span> : null}</TableCell>
                    <TableCell>{order.location || 'Не указана'}<small className="block">{order.workMode === 'Remote' ? 'Удалённо' : order.workMode === 'Office' ? 'В офисе' : order.workMode === 'Hybrid' ? 'Гибридный' : '—'}</small></TableCell><TableCell>{formatSalaryRange(order.salaryMin, order.salaryMax) || order.employeeCompensation || '—'}</TableCell><TableCell>{(order.executorNetAmount ?? order.price ?? 0).toLocaleString('ru-RU')} ₽</TableCell><TableCell>{order.guaranteeReward ? `${order.guaranteeReward.toLocaleString('ru-RU')} ₽` : '—'}<small className="block">{order.warrantyMonths ? `${order.warrantyMonths} мес.` : 'Без гарантии'}</small></TableCell>
                    <TableCell><button aria-label={order.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'} aria-pressed={order.isFavorite ?? false} disabled={isSavingFavorite} onClick={() => void toggleSaved(order.id)} type="button">{order.isFavorite ? '★' : '☆'}</button></TableCell>
                  </TableRow>)}</TableBody>
                </Table>
              </div>
            )}
            {totalCount > pageSize ? <nav aria-label="Страницы проектов" className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} из {totalCount}</span>
              <div className="flex gap-1">{Array.from({ length: pageCount }, (_, index) => index + 1).filter((page) => page === 1 || page === pageCount || Math.abs(page - currentPage) <= 1).map((page) => <button aria-current={page === currentPage ? 'page' : undefined} className={cn('h-9 min-w-9 rounded-lg px-2 text-sm', page === currentPage ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted')} key={page} onClick={() => setExchangePage(page)} type="button">{page}</button>)}</div>
            </nav> : null}
          </Card>
          <div className={cn('transition-all duration-300 ease-out lg:w-2/3', selectedOrderDetails ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-10 opacity-0 lg:w-0 lg:overflow-hidden')}>
            {selectedOrderDetails ? <OrderDetailsPagePanel
              key={`${selectedOrderDetails.id}:${selectedOrderDetails.executorId ?? 'none'}`}
              assignedExecutorName={selectedOrderExecutorName}
              canManageOrderResponses={canManageOrderResponses}
              canCreateVacancyFromOrder={selectedOrderDetails.executorId === requesterUserId && (!selectedOrderVacancyPreview || selectedOrderVacancyPreview.status === 'Draft')}
              canPublishVacancyForCustomer={canPublishVacancyForCustomer}
              canRespondToOrder={detailCanRespond}
              hasCreateVacancyDraft={selectedOrderVacancyPreview?.status === 'Draft'}
              hasRespondedToOrder={detailHasResponded}
              myResponseMessage={localOrderForDetails?.myResponseMessage ?? selectedOrderDetails.myResponseMessage ?? myResponseMessage}
              isOrderResponsesLoading={isOrderResponsesLoading}
              isPublishingVacancyForCustomer={isPublishingVacancyForCustomer}
              isRejectingOrderExecutor={isRejectingOrderExecutor}
              isRespondingToOrder={isRespondingToOrder}
              isSelectingOrderExecutor={isSelectingOrderExecutor}
              isUpdatingApplicantResponderStage={isUpdatingApplicantResponderStage}
              isExecutorViewer
              onBack={handleCloseSelectedOrder}
              onOpenChat={onOpenChat}
              onOpenApplicantResponder={onOpenCandidate}
              onMoveApplicantResponderToShortlist={onMoveApplicantResponderToShortlist ? (candidateId) => void onMoveApplicantResponderToShortlist(selectedOrderDetails.id, candidateId) : undefined}
              onCreateVacancyFromOrder={onCreateVacancyFromOrder ? () => onCreateVacancyFromOrder(selectedOrderDetails.id) : undefined}
              onRejectApplicantResponder={onRejectApplicantResponder ? (candidateId) => void onRejectApplicantResponder(selectedOrderDetails.id, candidateId) : undefined}
              onPublishVacancyForCustomer={onPublishVacancyForCustomer}
              onRejectOrderExecutor={onRejectOrderExecutor ? (executorId) => void onRejectOrderExecutor(selectedOrderDetails.id, executorId) : undefined}
              onRespondToOrder={onRespondToOrder ? () => { setResponseOrderId(selectedOrderDetails.id); setResponseMessage('') } : undefined}
              onSelectOrderExecutor={onSelectOrderExecutor ? (executorId) => void onSelectOrderExecutor(selectedOrderDetails.id, executorId) : undefined}
              order={selectedOrderDetails}
              orderResponses={orderResponses}
              applicantResponders={selectedOrderApplicantResponders}
              vacancyPreview={selectedOrderVacancyPreview}
            /> : null}
          </div>
          <Modal
            open={responseOrderId !== null}
            onOpenChange={(open) => { if (!open) setResponseOrderId(null) }}
            title="Отклик на проект"
            description="Расскажите заказчику об опыте похожих подборов и подходе к поиску кандидатов."
            footer={<div className="flex justify-end gap-2">
              <button className="rounded-lg border border-border px-4 py-2 text-sm" onClick={() => setResponseOrderId(null)} type="button">Назад</button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={!responseMessage.trim() || isRespondingToOrder} onClick={async () => {
                if (!responseOrderId || !onRespondToOrder) return
                const sentMessage = responseMessage.trim()
                const success = await onRespondToOrder(responseOrderId, sentMessage)
                if (success !== false) {
                  setLocalSelectedOrder((current) => current?.id === responseOrderId
                    ? { ...current, myResponseStatus: 'Pending', myResponseMessage: sentMessage }
                    : current)
                  setResponseOrderId(null)
                }
              }} type="button">{isRespondingToOrder ? 'Отправляем…' : 'Отправить отклик'}</button>
            </div>}
          >
            <label className="block text-sm font-medium">Сообщение заказчику
              <textarea className="mt-2 min-h-32 w-full rounded-lg border border-border bg-background p-3 text-sm" maxLength={2000} onChange={(event) => setResponseMessage(event.target.value)} required value={responseMessage} />
            </label>
          </Modal>
        </div>
      )
    }

    return (
      <div className="space-y-4 lg:flex lg:items-start lg:gap-4 lg:space-y-0">
        <Card
          className={cn(
            'rounded-xl border-border p-4 shadow-none transition-all duration-300 ease-out lg:flex-shrink-0',
            // Below lg the details replace the list instead of being pushed under it.
            selectedOrderDetails ? 'max-lg:hidden lg:w-1/3' : 'lg:w-full',
          )}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-foreground">
              {isApplicantRole ? 'Список вакансий' : 'Биржа проектов'}
            </h3>
            {isApplicantRole ? (
              <button
                aria-label="Открыть фильтры вакансий"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
                onClick={() => setIsApplicantVacancyFiltersOpen(true)}
                title="Фильтры вакансий"
                type="button"
              >
                <SlidersHorizontal aria-hidden="true" size={18} />
              </button>
            ) : null}
          </div>
          <Table stackOnMobile>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Вакансия</TableHead>
                {!isOrderDetailsOpen ? <TableHead>Компания</TableHead> : null}
                {!isOrderDetailsOpen ? <TableHead>Локация</TableHead> : null}
                {!isOrderDetailsOpen && isApplicantRole ? <TableHead>Оплата</TableHead> : null}
                {!isOrderDetailsOpen && !isApplicantRole ? <TableHead>Приоритет</TableHead> : null}
                {!isOrderDetailsOpen && !isApplicantRole ? <TableHead>Статус</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {listedOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-sm text-muted-foreground"
                    colSpan={isOrderDetailsOpen ? 1 : isApplicantRole ? 4 : 5}
                  >
                    {isApplicantRole
                      ? 'На площадке пока нет доступных вакансий.'
                      : 'На бирже проектов пока нет доступных проектов.'}
                  </TableCell>
                </TableRow>
              ) : (
                listedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={cn('cursor-pointer', selectedOrderId === order.id && 'bg-primary/10')}
                    onClick={() => {
                      onSelectOrder(order.id)
                      onOpenOrder(order)
                    }}
                  >
                    <TableCell className="font-medium">{order.title}</TableCell>
                    {!isOrderDetailsOpen ? <TableCell data-label="Компания">{order.company}</TableCell> : null}
                    {!isOrderDetailsOpen ? <TableCell data-label="Локация">{order.location}</TableCell> : null}
                    {!isOrderDetailsOpen && isApplicantRole ? (
                      <TableCell data-label="Оплата">{order.employeeCompensation || '—'}</TableCell>
                    ) : null}
                    {!isOrderDetailsOpen && !isApplicantRole ? (
                      <TableCell>
                        <Badge
                          variant={
                            order.priority === 'high'
                              ? 'destructive'
                              : order.priority === 'medium'
                                ? 'default'
                                : 'neutral'
                          }
                        >
                          {order.priority === 'high' ? 'Высокий' : order.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </Badge>
                      </TableCell>
                    ) : null}
                    {!isOrderDetailsOpen && !isApplicantRole ? (
                      <TableCell>
                        <Badge variant={workspaceToneToBadgeVariant(order.statusTone)}>{order.statusLabel}</Badge>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <div
          className={cn(
            'transition-all duration-300 ease-out lg:w-2/3',
            selectedOrderDetails
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-10 opacity-0 lg:w-0 lg:overflow-hidden',
          )}
        >
          {selectedOrderDetails ? (
            <OrderDetailsPagePanel
              key={`${selectedOrderDetails.id}:${selectedOrderDetails.executorId ?? 'none'}`}
              assignedExecutorName={selectedOrderExecutorName}
              canManageOrderResponses={canManageOrderResponses}
              canCreateVacancyFromOrder={false}
              canPublishVacancyForCustomer={canPublishVacancyForCustomer}
              canRespondToOrder={canRespondToOrder}
              hasCreateVacancyDraft={selectedOrderVacancyPreview?.status === 'Draft'}
              hasRespondedToOrder={hasRespondedToOrder}
              isOrderResponsesLoading={isOrderResponsesLoading}
              isPublishingVacancyForCustomer={isPublishingVacancyForCustomer}
              isRejectingOrderExecutor={isRejectingOrderExecutor}
              isRespondingToOrder={isRespondingToOrder}
              isSelectingOrderExecutor={isSelectingOrderExecutor}
              isUpdatingApplicantResponderStage={isUpdatingApplicantResponderStage}
              isExecutorViewer={isExecutorRole}
              isApplicantViewer={isApplicantRole}
              onBack={onCloseOrderDetails ?? (() => {})}
              onOpenChat={onOpenChat}
              onOpenApplicantResponder={onOpenCandidate}
              onMoveApplicantResponderToShortlist={(candidateId) => {
                if (!onMoveApplicantResponderToShortlist) {
                  return
                }
                void onMoveApplicantResponderToShortlist(selectedOrderDetails.id, candidateId)
              }}
              onCreateVacancyFromOrder={() => {
                if (!onCreateVacancyFromOrder) {
                  return
                }
                onCreateVacancyFromOrder(selectedOrderDetails.id)
              }}
              onRejectApplicantResponder={(candidateId) => {
                if (!onRejectApplicantResponder) {
                  return
                }
                void onRejectApplicantResponder(selectedOrderDetails.id, candidateId)
              }}
              onPublishVacancyForCustomer={() => {
                if (!onPublishVacancyForCustomer) {
                  return
                }
                void onPublishVacancyForCustomer()
              }}
              onRejectOrderExecutor={(executorId) => {
                if (!onRejectOrderExecutor) {
                  return
                }
                void onRejectOrderExecutor(selectedOrderDetails.id, executorId)
              }}
              onRespondToOrder={() => {
                if (!onRespondToOrder) {
                  return
                }
                void onRespondToOrder(selectedOrderDetails.id)
              }}
              onSelectOrderExecutor={(executorId) => {
                if (!onSelectOrderExecutor) {
                  return
                }
                void onSelectOrderExecutor(selectedOrderDetails.id, executorId)
              }}
              order={selectedOrderDetails}
              orderResponses={orderResponses}
              applicantResponders={selectedOrderApplicantResponders}
              vacancyPreview={selectedOrderVacancyPreview}
            />
          ) : null}
        </div>
        <Modal
          description="Настройка фильтрации вакансий будет добавлена следующим этапом."
          footer={
            <div className="flex justify-end">
              <button
                className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground hover:bg-muted"
                onClick={() => setIsApplicantVacancyFiltersOpen(false)}
                type="button"
              >
                Закрыть
              </button>
            </div>
          }
          onOpenChange={setIsApplicantVacancyFiltersOpen}
          open={isApplicantRole && isApplicantVacancyFiltersOpen}
          title="Фильтры вакансий"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {['Специализация', 'Формат работы', 'Локация'].map((filterName) => (
              <div key={filterName} className="rounded-xl border border-border bg-muted px-3 py-3">
                <p className="text-sm font-medium text-foreground">{filterName}</p>
                <p className="mt-1 text-xs text-muted-foreground">Скоро появится</p>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    )
}
