import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { workspaceToneToBadgeVariant, type WorkspaceCandidate, type WorkspaceOrder } from '../model/data'
import type { OrderExecutorResponseItemResponse } from '@/shared/api/orders'

type OrderDetailsPagePanelProps = {
  applicantResponders?: WorkspaceCandidate[]
  availableCandidates?: WorkspaceCandidate[]
  assignedCandidateIds?: string[]
  canCreateVacancyFromOrder?: boolean
  canCreateCandidateFromOrder?: boolean
  canManageCandidatesFromOrder?: boolean
  hasCreateVacancyDraft?: boolean
  canPublishVacancyForCustomer?: boolean
  vacancyPreview?: {
    title: string
    description: string
    status: 'Draft' | 'OnApproval' | 'Published'
    createdAtUtc: string
    updatedAtUtc: string
  } | null
  canManageOrderResponses?: boolean
  isExecutorViewer?: boolean
  isApplicantViewer?: boolean
  hasRespondedToOrder?: boolean
  canRespondToOrder?: boolean
  isOrderResponsesLoading?: boolean
  isPublishingVacancyForCustomer?: boolean
  isRejectingOrderExecutor?: boolean
  isRespondingToOrder?: boolean
  isSelectingOrderExecutor?: boolean
  isUpdatingApplicantResponderStage?: boolean
  isAddingCandidateFromBase?: boolean
  isRemovingVacancyCandidate?: boolean
  order: WorkspaceOrder
  assignedExecutorName?: string | null
  onBack: () => void
  onOpenChat?: () => void
  onCreateVacancyFromOrder?: () => void
  onCreateCandidateFromOrder?: () => void
  onAddCandidateFromBase?: (candidateId: string) => boolean | Promise<boolean>
  onRemoveCandidateFromVacancy?: (candidateId: string) => void | Promise<void>
  onPublishVacancyForCustomer?: () => void | Promise<void>
  onRespondToOrder?: () => void | Promise<void>
  onOpenApplicantResponder?: (candidate: WorkspaceCandidate) => void
  onMoveApplicantResponderToShortlist?: (candidateId: string) => void | Promise<void>
  onRejectApplicantResponder?: (candidateId: string) => void | Promise<void>
  onRejectOrderExecutor?: (executorId: string) => void | Promise<void>
  onSelectOrderExecutor?: (executorId: string) => void | Promise<void>
  orderResponses?: OrderExecutorResponseItemResponse[]
}

function OrderDetailRow({ label, value }: { label: string; value: string }) {
  const visibleValue = value.trim() || 'Не указано'

  return (
    <div className="grid gap-2 md:grid-cols-[10rem_minmax(0,1fr)] md:items-start md:gap-4">
      <dt className="pt-3 text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
        {label}
      </dt>
      <dd className="min-h-11 whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900">
        {visibleValue}
      </dd>
    </div>
  )
}

function toExecutorPaymentLabel(amount: number | null | undefined): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return 'Стоимость требует уточнения'
  }

  return `${amount.toLocaleString('ru-RU')} ₽`
}

export function OrderDetailsPagePanel({
  applicantResponders = [],
  availableCandidates = [],
  assignedCandidateIds = [],
  canCreateVacancyFromOrder = false,
  canCreateCandidateFromOrder = false,
  canManageCandidatesFromOrder = false,
  hasCreateVacancyDraft = false,
  canPublishVacancyForCustomer = false,
  vacancyPreview = null,
  canManageOrderResponses = false,
  isExecutorViewer = false,
  isApplicantViewer = false,
  hasRespondedToOrder = false,
  canRespondToOrder = false,
  isOrderResponsesLoading = false,
  isPublishingVacancyForCustomer = false,
  isRejectingOrderExecutor = false,
  isRespondingToOrder = false,
  isSelectingOrderExecutor = false,
  isUpdatingApplicantResponderStage = false,
  isAddingCandidateFromBase = false,
  isRemovingVacancyCandidate = false,
  order,
  assignedExecutorName = null,
  onBack,
  onOpenChat,
  onCreateVacancyFromOrder,
  onCreateCandidateFromOrder,
  onAddCandidateFromBase,
  onRemoveCandidateFromVacancy,
  onPublishVacancyForCustomer,
  onRespondToOrder,
  onOpenApplicantResponder,
  onMoveApplicantResponderToShortlist,
  onRejectApplicantResponder,
  onRejectOrderExecutor,
  onSelectOrderExecutor,
  orderResponses = [],
}: OrderDetailsPagePanelProps) {
  const hasAssignedExecutor = Boolean(order.executorId)
  const [isResponsesExpanded, setIsResponsesExpanded] = useState(() => !hasAssignedExecutor)
  const [expandedExecutorIds, setExpandedExecutorIds] = useState<Set<string>>(() => new Set<string>())
  const [isCandidatePickerOpen, setIsCandidatePickerOpen] = useState(false)
  const [candidateSearch, setCandidateSearch] = useState('')
  const normalizedCandidateSearch = candidateSearch.trim().toLocaleLowerCase('ru-RU')
  const assignedCandidateIdSet = new Set(assignedCandidateIds)
  const matchingCandidates = availableCandidates.filter(
    (candidate) =>
      !normalizedCandidateSearch ||
      `${candidate.name} ${candidate.position}`.toLocaleLowerCase('ru-RU').includes(normalizedCandidateSearch),
  )

  function toStatusLabel(status: OrderExecutorResponseItemResponse['status']): string {
    if (status === 'Pending') {
      return 'Ожидает'
    }

    if (status === 'Accepted') {
      return 'Принят'
    }

    if (status === 'Rejected') {
      return 'Отклонен'
    }

    return 'Отозван'
  }

  const showChatWithExecutorButton = canManageOrderResponses && Boolean(order.executorId)
  const showChatWithCustomerButton = !canManageOrderResponses
  const vacancyDescriptionPreview = vacancyPreview
    ? vacancyPreview.description.replace(/<[^>]*>/g, ' ').trim()
    : ''
  const vacancyStatusLabel = vacancyPreview?.status === 'Published'
    ? 'Согласовано и опубликовано'
    : vacancyPreview?.status === 'OnApproval'
      ? 'Отправлено на согласование'
      : 'Черновик сохранён'
  const vacancyStatusDate = vacancyPreview?.status === 'Draft'
    ? vacancyPreview.createdAtUtc
    : vacancyPreview?.updatedAtUtc

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {isApplicantViewer ? 'Детали вакансии' : 'Детали заказа'}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{order.updatedAt}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Назад"
            className="h-10 rounded-xl border-slate-200 text-slate-700"
            onClick={onBack}
            type="button"
            variant="outline"
          >
            Назад
          </Button>
          {showChatWithExecutorButton ? (
            <Button
              aria-label="Перейти в чат с исполнителем"
              className="h-10 w-10 rounded-xl p-0"
              onClick={onOpenChat}
              title="Перейти в чат с исполнителем"
              type="button"
              variant="outline"
            >
              <MessageCircle aria-hidden="true" size={18} />
            </Button>
          ) : null}
        </div>
      </div>

      <dl className="mt-4 grid gap-3">
        <OrderDetailRow label="Компания" value={order.company} />
        <OrderDetailRow label="Вакансия" value={order.title} />
        <OrderDetailRow label="Локация" value={order.location} />
        <OrderDetailRow label="Оплата" value={order.employeeCompensation} />
        <OrderDetailRow label="Функционал" value={order.functional} />
        <OrderDetailRow label="Требования" value={order.requirements} />
        <OrderDetailRow label="Другие условия" value={order.otherConditions} />
        {isExecutorViewer ? (
          <OrderDetailRow label="К получению" value={toExecutorPaymentLabel(order.executorNetAmount)} />
        ) : null}
        {!isApplicantViewer ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">Отклики</dt>
            <dd className="mt-1 text-sm text-slate-900">{order.responses}</dd>
          </div>
        ) : null}
        <div className="pt-1">
          <Badge variant={workspaceToneToBadgeVariant(order.statusTone)}>{order.statusLabel}</Badge>
        </div>
        {canManageOrderResponses && hasAssignedExecutor ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
              Назначенный исполнитель
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{assignedExecutorName || 'Исполнитель назначен'}</dd>
          </div>
        ) : null}
        {canCreateVacancyFromOrder ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
              Откликнувшиеся соискатели
            </dt>
            {applicantResponders.length > 0 ? (
              <dd className="mt-2 space-y-2">
                {applicantResponders.map((candidate) => {
                  const isShortlist = candidate.statusLabel.trim().toLowerCase() === 'shortlist'
                  return (
                    <div key={candidate.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{candidate.name}</p>
                          <p className="text-xs text-slate-500">Статус: {candidate.statusLabel || 'Pool'}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            className="h-8 rounded-lg px-2 text-xs"
                            onClick={() => onOpenApplicantResponder?.(candidate)}
                            type="button"
                            variant="outline"
                          >
                            Профиль
                          </Button>
                          <Button
                            aria-label="Открыть чат с соискателем"
                            className="h-8 w-8 rounded-lg p-0"
                            onClick={() => {
                            }}
                            type="button"
                            variant="outline"
                          >
                            <svg
                              aria-hidden="true"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8 10.5h8M8 14h5m-9 7 2.2-3.8a9 9 0 1 1 3.6 2.2L4 21Z"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                              />
                            </svg>
                          </Button>
                          <Button
                            className="h-8 rounded-lg bg-blue-600 px-2 text-xs text-white hover:bg-blue-700"
                            disabled={isShortlist || isUpdatingApplicantResponderStage}
                            onClick={() => {
                              if (!onMoveApplicantResponderToShortlist) {
                                return
                              }
                              void onMoveApplicantResponderToShortlist(candidate.id)
                            }}
                            type="button"
                          >
                            В shortlist
                          </Button>
                          <Button
                            className="h-8 rounded-lg px-2 text-xs"
                            disabled={!isShortlist || isUpdatingApplicantResponderStage}
                            onClick={() => {
                              if (!onRejectApplicantResponder) {
                                return
                              }
                              void onRejectApplicantResponder(candidate.id)
                            }}
                            type="button"
                            variant="outline"
                          >
                            Отказать
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </dd>
            ) : (
              <dd className="mt-1 text-sm text-slate-500">Пока нет откликов соискателей.</dd>
            )}
          </div>
        ) : null}
      </dl>

      <div className="mt-5">
        {vacancyPreview ? (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">Статус вакансии</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{vacancyStatusLabel}</p>
            {vacancyStatusDate ? (
              <p className="mt-1 text-xs text-slate-600">{new Date(vacancyStatusDate).toLocaleString('ru-RU')}</p>
            ) : null}
          </div>
        ) : null}
        {canRespondToOrder ? (
          <Button
            className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            disabled={isRespondingToOrder || hasRespondedToOrder}
            onClick={() => {
              if (!onRespondToOrder) {
                return
              }
              void onRespondToOrder()
            }}
            type="button"
          >
            {hasRespondedToOrder
              ? 'Вы уже откликнулись'
              : isRespondingToOrder
                ? 'Отправляем отклик...'
                : isApplicantViewer
                  ? 'Откликнуться на вакансию'
                  : 'Откликнуться на заказ'}
          </Button>
        ) : null}
        {canCreateVacancyFromOrder || canManageCandidatesFromOrder ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {canCreateVacancyFromOrder ? (
              <div>
            <div className="mb-2 flex items-center gap-2">
              {hasCreateVacancyDraft ? <Badge variant="default">Незавершенный черновик</Badge> : null}
            </div>
            <div className="flex items-center gap-2">
              {showChatWithCustomerButton ? (
                <Button
                  aria-label="Перейти в чат с заказчиком"
                  className="h-10 w-10 rounded-xl p-0"
                  onClick={onOpenChat}
                  title="Перейти в чат с заказчиком"
                  type="button"
                  variant="outline"
                >
                  <MessageCircle aria-hidden="true" size={18} />
                </Button>
              ) : null}
              <Button
                className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  if (!onCreateVacancyFromOrder) {
                    return
                  }
                  onCreateVacancyFromOrder()
                }}
                type="button"
              >
                {hasCreateVacancyDraft ? 'Продолжить черновик вакансии' : 'Создать вакансию'}
              </Button>
            </div>
              </div>
            ) : null}
            {canManageCandidatesFromOrder ? (
              <div>
            <Button
              className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setIsCandidatePickerOpen(true)}
              type="button"
              disabled={!canCreateCandidateFromOrder}
            >
              Добавить кандидата
            </Button>
              </div>
            ) : null}
          </div>
        ) : null}
        {canPublishVacancyForCustomer ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">Вакансия на согласовании</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {vacancyPreview?.title || 'Заголовок вакансии не найден'}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {vacancyDescriptionPreview || 'Описание вакансии отсутствует.'}
            </p>
            <Button
              className="mt-3 h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => {
                if (!onPublishVacancyForCustomer) {
                  return
                }
                void onPublishVacancyForCustomer()
              }}
              type="button"
              disabled={isPublishingVacancyForCustomer}
            >
              {isPublishingVacancyForCustomer ? 'Публикуем...' : 'Подтвердить и опубликовать'}
            </Button>
          </div>
        ) : null}
      </div>

      {canManageOrderResponses ? (
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">Отклики исполнителей</h4>
            {hasAssignedExecutor ? (
              <Button
                aria-label={isResponsesExpanded ? 'Свернуть отклики' : 'Раскрыть отклики'}
                className="h-7 w-7 rounded-lg"
                onClick={() => setIsResponsesExpanded((previousValue) => !previousValue)}
                type="button"
                variant="outline"
              >
                {isResponsesExpanded ? '▾' : '▸'}
              </Button>
            ) : null}
          </div>
          {isResponsesExpanded && isOrderResponsesLoading ? (
            <p className="mt-2 text-sm text-slate-500">Загружаем отклики...</p>
          ) : null}
          {isResponsesExpanded && !isOrderResponsesLoading && orderResponses.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Пока нет откликов исполнителей.</p>
          ) : null}
          {isResponsesExpanded && !isOrderResponsesLoading && orderResponses.length > 0 ? (
            <div className="mt-3 space-y-2">
              {orderResponses.map((response) => (
                <div
                  key={response.executorId}
                  className="cursor-pointer rounded-lg border border-slate-200 p-3"
                  onClick={() => {
                    setExpandedExecutorIds((previousValue) => {
                      const nextValue = new Set(previousValue)
                      if (nextValue.has(response.executorId)) {
                        nextValue.delete(response.executorId)
                      } else {
                        nextValue.add(response.executorId)
                      }
                      return nextValue
                    })
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{response.executorFullName || response.executorId}</p>
                      <p className="text-xs text-slate-500">
                        {toStatusLabel(response.status)} · {new Date(response.updatedAtUtc).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {response.status === 'Pending' ? (
                        <>
                          <Button
                            className="h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            disabled={isSelectingOrderExecutor || isRejectingOrderExecutor}
                            onClick={(event) => {
                              event.stopPropagation()
                              if (!onSelectOrderExecutor) {
                                return
                              }
                              void onSelectOrderExecutor(response.executorId)
                            }}
                            type="button"
                          >
                            {isSelectingOrderExecutor ? 'Выбираем...' : 'Выбрать исполнителя'}
                          </Button>
                          <Button
                            className="h-8 rounded-lg border-red-300 text-red-700 hover:bg-red-50"
                            disabled={isSelectingOrderExecutor || isRejectingOrderExecutor}
                            onClick={(event) => {
                              event.stopPropagation()
                              if (!onRejectOrderExecutor) {
                                return
                              }
                              void onRejectOrderExecutor(response.executorId)
                            }}
                            type="button"
                            variant="outline"
                          >
                            {isRejectingOrderExecutor ? 'Отклоняем...' : 'Отклонить'}
                          </Button>
                          <Button
                            aria-label="Перейти в чат с исполнителем"
                            className="h-8 w-8 rounded-lg"
                            onClick={(event) => {
                              event.stopPropagation()
                            }}
                            type="button"
                            variant="outline"
                          >
                            <MessageCircle aria-hidden="true" size={16} />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {expandedExecutorIds.has(response.executorId) ? (
                    <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-700">
                      <p><span className="font-semibold">Грейд:</span> {response.executorGrade || '—'}</p>
                      <p><span className="font-semibold">Текущий проект:</span> {response.executorProjectTitle || '—'}</p>
                      <p><span className="font-semibold">Компания:</span> {response.executorProjectCompanyName || '—'}</p>
                      <p><span className="font-semibold">Опыт:</span> {response.executorExperienceSummary || '—'}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <Modal
        className="max-w-3xl"
        description="Выберите кандидата из своей базы или создайте нового вручную."
        onOpenChange={setIsCandidatePickerOpen}
        open={isCandidatePickerOpen}
        title="Добавить кандидата к заказу"
        footer={
          <div className="flex flex-wrap justify-between gap-2">
            <Button onClick={() => onCreateCandidateFromOrder?.()} type="button">
              Добавить нового вручную
            </Button>
            <Button onClick={() => setIsCandidatePickerOpen(false)} type="button" variant="outline">
              Закрыть
            </Button>
          </div>
        }
      >
        <Input
          aria-label="Поиск кандидата"
          className="mb-4 h-10 rounded-xl"
          onChange={(event) => setCandidateSearch(event.target.value)}
          placeholder="Поиск по ФИО или специализации"
          value={candidateSearch}
        />
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {matchingCandidates.map((candidate) => (
            <div key={candidate.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-900">{candidate.name}</p>
                <p className="text-sm text-slate-600">{candidate.position}</p>
              </div>
              {assignedCandidateIdSet.has(candidate.id) ? (
                <Button
                  aria-label={`${candidate.name}: кандидат уже добавлен к вакансии`}
                  className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
                  disabled={isRemovingVacancyCandidate}
                  onClick={() => void onRemoveCandidateFromVacancy?.(candidate.id)}
                  title="Кандидат уже добавлен к этой вакансии"
                  type="button"
                  variant="outline"
                >
                  {isRemovingVacancyCandidate ? 'Исключаем...' : 'Исключить'}
                </Button>
              ) : (
                <Button
                  disabled={isAddingCandidateFromBase}
                  onClick={() => {
                    void Promise.resolve(onAddCandidateFromBase?.(candidate.id)).then((wasAdded) => {
                      if (wasAdded) {
                        setIsCandidatePickerOpen(false)
                      }
                    })
                  }}
                  type="button"
                  variant="outline"
                >
                  {isAddingCandidateFromBase ? 'Добавляем...' : 'Выбрать'}
                </Button>
              )}
            </div>
          ))}
          {matchingCandidates.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-600">Кандидаты не найдены.</p>
          ) : null}
        </div>
      </Modal>
    </Card>
  )
}
