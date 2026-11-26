import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { workspaceToneToBadgeVariant, type WorkspaceCandidate, type WorkspaceOrder } from '../model/data'
import type { OrderExecutorResponseItemResponse } from '@/shared/api/orders'
import { ProjectCandidatesPanel } from './ProjectCandidatesPanel'

interface OrderDetailsPagePanelProps {
  applicantResponders?: WorkspaceCandidate[]
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
    shortlistSentToCustomerAtUtc?: string | null
  } | null
  canManageOrderResponses?: boolean
  isExecutorViewer?: boolean
  isCustomerViewer?: boolean
  isApplicantViewer?: boolean
  hasRespondedToOrder?: boolean
  myResponseMessage?: string | null
  canRespondToOrder?: boolean
  isOrderResponsesLoading?: boolean
  isPublishingVacancyForCustomer?: boolean
  isRejectingOrderExecutor?: boolean
  isRespondingToOrder?: boolean
  isSelectingOrderExecutor?: boolean
  isUpdatingApplicantResponderStage?: boolean
  isRemovingVacancyCandidate?: boolean
  isSubmittingCandidateList?: boolean
  isProjectCandidatesLoading?: boolean
  isProjectCandidatesError?: boolean
  order: WorkspaceOrder
  projectCandidates?: WorkspaceCandidate[]
  assignedExecutorName?: string | null
  onBack: () => void
  onOpenChat?: () => void
  onCreateVacancyFromOrder?: () => void
  onCreateCandidateFromOrder?: () => void
  onRemoveCandidateFromVacancy?: (candidateId: string) => boolean | Promise<boolean>
  onSubmitCandidateList?: () => boolean | Promise<boolean>
  onRetryProjectCandidates?: () => void
  onPublishVacancyForCustomer?: () => void | Promise<void>
  onRespondToOrder?: () => void | Promise<void>
  onOpenApplicantResponder?: (candidate: WorkspaceCandidate) => void
  onMoveApplicantResponderToShortlist?: (candidateId: string) => void | Promise<void>
  onRejectApplicantResponder?: (candidateId: string) => void | Promise<void>
  onRejectOrderExecutor?: (executorId: string) => void | Promise<void>
  onSelectOrderExecutor?: (executorId: string) => void | Promise<void>
  orderResponses?: OrderExecutorResponseItemResponse[]
}

interface OrderDetailRowProps {
  label: string
  value: string
}

function OrderDetailRow({ label, value }: Readonly<OrderDetailRowProps>) {
  const visibleValue = value.trim() || 'Не указано'

  return (
    <div className="grid gap-2 md:grid-cols-[10rem_minmax(0,1fr)] md:items-start md:gap-4">
      <dt className="pt-3 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-h-11 whitespace-pre-wrap break-words rounded-xl border border-border bg-muted px-4 py-3 text-sm leading-6 text-foreground">
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

function formatSalaryRange(minimum?: number | null, maximum?: number | null): string {
  const min = typeof minimum === 'number' ? minimum : null
  const max = typeof maximum === 'number' ? maximum : null
  if (min !== null && max !== null) return `${min.toLocaleString('ru-RU')}–${max.toLocaleString('ru-RU')} ₽ / мес.`
  if (min !== null) return `от ${min.toLocaleString('ru-RU')} ₽ / мес.`
  if (max !== null) return `до ${max.toLocaleString('ru-RU')} ₽ / мес.`
  return ''
}

export function OrderDetailsPagePanel({
  applicantResponders = [],
  projectCandidates = [],
  canCreateVacancyFromOrder = false,
  canCreateCandidateFromOrder = false,
  canManageCandidatesFromOrder = false,
  hasCreateVacancyDraft = false,
  canPublishVacancyForCustomer = false,
  vacancyPreview = null,
  canManageOrderResponses = false,
  isExecutorViewer = false,
  isCustomerViewer = false,
  isApplicantViewer = false,
  hasRespondedToOrder = false,
  myResponseMessage = null,
  canRespondToOrder = false,
  isOrderResponsesLoading = false,
  isPublishingVacancyForCustomer = false,
  isRejectingOrderExecutor = false,
  isRespondingToOrder = false,
  isSelectingOrderExecutor = false,
  isUpdatingApplicantResponderStage = false,
  isRemovingVacancyCandidate = false,
  isSubmittingCandidateList = false,
  isProjectCandidatesLoading = false,
  isProjectCandidatesError = false,
  order,
  assignedExecutorName = null,
  onBack,
  onOpenChat,
  onCreateVacancyFromOrder,
  onCreateCandidateFromOrder,
  onRemoveCandidateFromVacancy,
  onSubmitCandidateList,
  onRetryProjectCandidates,
  onPublishVacancyForCustomer,
  onRespondToOrder,
  onOpenApplicantResponder,
  onMoveApplicantResponderToShortlist,
  onRejectApplicantResponder,
  onRejectOrderExecutor,
  onSelectOrderExecutor,
  orderResponses = [],
}: Readonly<OrderDetailsPagePanelProps>) {
  const hasAssignedExecutor = Boolean(order.executorId)
  const [isResponsesExpanded, setIsResponsesExpanded] = useState(() => !hasAssignedExecutor)
  const [expandedExecutorIds, setExpandedExecutorIds] = useState<Set<string>>(() => new Set<string>())

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
  const isCandidateListSubmitted = Boolean(vacancyPreview?.shortlistSentToCustomerAtUtc)
  const vacancyStatusLabel = vacancyPreview?.status === 'Published'
    ? 'Согласовано и опубликовано'
    : vacancyPreview?.status === 'OnApproval'
      ? 'Отправлено на согласование'
      : 'Черновик сохранён'
  const vacancyStatusDate = vacancyPreview?.status === 'Draft'
    ? vacancyPreview.createdAtUtc
    : vacancyPreview?.updatedAtUtc

  return (
    <Card className="rounded-xl border-border p-4 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {isApplicantViewer ? 'Детали вакансии' : 'Детали заказа'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{order.updatedAt}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Назад"
            className="h-10 rounded-xl border-border text-muted-foreground"
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
        {order.workMode ? <OrderDetailRow label="Формат работы" value={order.workMode === 'Remote' ? 'Удалённо' : order.workMode === 'Office' ? 'В офисе' : 'Гибридный'} /> : null}
        <OrderDetailRow label="Оплата" value={order.employeeCompensation} />
        {formatSalaryRange(order.salaryMin, order.salaryMax) ? <OrderDetailRow label="Зарплата кандидата" value={formatSalaryRange(order.salaryMin, order.salaryMax)} /> : null}
        {order.fulfillmentDays ? <OrderDetailRow label="Срок подбора" value={`${order.fulfillmentDays} дней`} /> : null}
        <OrderDetailRow label="Функционал" value={order.functional} />
        <OrderDetailRow label="Требования" value={order.requirements} />
        <OrderDetailRow label="Другие условия" value={order.otherConditions} />
        {isExecutorViewer ? (
          <OrderDetailRow label="К получению" value={toExecutorPaymentLabel(order.executorNetAmount)} />
        ) : null}
        {isExecutorViewer && order.warrantyMonths ? <OrderDetailRow label="Гарантия" value={`${order.warrantyMonths} мес., дополнительное вознаграждение ${toExecutorPaymentLabel(order.guaranteeReward)}`} /> : null}
        {!isApplicantViewer ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Отклики</dt>
            <dd className="mt-1 text-sm text-foreground">{order.responses}</dd>
          </div>
        ) : null}
        <div className="pt-1">
          <Badge variant={workspaceToneToBadgeVariant(order.statusTone)}>{order.statusLabel}</Badge>
        </div>
        {canManageOrderResponses && hasAssignedExecutor ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              Назначенный исполнитель
            </dt>
            <dd className="mt-1 text-sm text-foreground">{assignedExecutorName || 'Исполнитель назначен'}</dd>
          </div>
        ) : null}
        {canCreateVacancyFromOrder ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              Откликнувшиеся соискатели
            </dt>
            {applicantResponders.length > 0 ? (
              <dd className="mt-2 space-y-2">
                {applicantResponders.map((candidate) => {
                  const isShortlist = candidate.stage === 'Shortlist'
                  return (
                    <div key={candidate.id} className="rounded-lg border border-border bg-muted p-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">Статус: {candidate.statusLabel || 'В рабочем списке'}</p>
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
                            className="h-8 rounded-lg bg-primary px-2 text-xs text-primary-foreground hover:bg-primary/90"
                            disabled={isCandidateListSubmitted || isShortlist || isUpdatingApplicantResponderStage}
                            onClick={() => {
                              if (!onMoveApplicantResponderToShortlist) {
                                return
                              }
                              void onMoveApplicantResponderToShortlist(candidate.id)
                            }}
                            type="button"
                          >
                            В список кандидатов
                          </Button>
                          <Button
                            className="h-8 rounded-lg px-2 text-xs"
                            disabled={isCandidateListSubmitted || !isShortlist || isUpdatingApplicantResponderStage}
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
              <dd className="mt-1 text-sm text-muted-foreground">Пока нет откликов соискателей.</dd>
            )}
          </div>
        ) : null}
      </dl>

      <ProjectCandidatesPanel
        candidates={projectCandidates}
        canAddCandidate={canCreateCandidateFromOrder}
        canManageCandidates={canManageCandidatesFromOrder}
        isCustomerViewer={isCustomerViewer}
        isError={isProjectCandidatesError}
        isExecutorViewer={isExecutorViewer}
        isLoading={isProjectCandidatesLoading}
        isRemovingCandidate={isRemovingVacancyCandidate}
        isSubmittingCandidateList={isSubmittingCandidateList}
        onAddCandidate={onCreateCandidateFromOrder}
        onRemoveCandidate={onRemoveCandidateFromVacancy}
        onRetry={onRetryProjectCandidates}
        onSubmitCandidateList={onSubmitCandidateList}
        requestedCandidatesCount={order.requestedCandidatesCount ?? 1}
        submittedAtUtc={vacancyPreview?.shortlistSentToCustomerAtUtc}
        vacancyIsPublished={vacancyPreview?.status === 'Published'}
      />

      <div className="mt-5">
        {vacancyPreview ? (
          <div className="mb-4 rounded-xl border border-border bg-muted p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Статус вакансии</p>
            <p className="mt-2 text-sm font-medium text-foreground">{vacancyStatusLabel}</p>
            {vacancyStatusDate ? (
              <p className="mt-1 text-xs text-muted-foreground">{new Date(vacancyStatusDate).toLocaleString('ru-RU')}</p>
            ) : null}
          </div>
        ) : null}
        {canRespondToOrder ? (
          <Button
            className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
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
        {isExecutorViewer && hasRespondedToOrder ? (
          <div className="mt-3 rounded-lg border border-border bg-muted p-3 text-sm">
            <strong>Отклик отправлен</strong>
            {myResponseMessage ? <p className="mt-2 whitespace-pre-wrap break-words">{myResponseMessage}</p> : null}
          </div>
        ) : null}
        {canCreateVacancyFromOrder ? (
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
                className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
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
          </div>
        ) : null}
        {canPublishVacancyForCustomer ? (
          <div className="mt-4 rounded-xl border border-border bg-muted p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Вакансия на согласовании</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {vacancyPreview?.title || 'Заголовок вакансии не найден'}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {vacancyDescriptionPreview || 'Описание вакансии отсутствует.'}
            </p>
            <Button
              className="mt-3 h-10 rounded-xl bg-success text-primary-foreground hover:bg-success/90"
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
            <h4 className="text-sm font-semibold text-foreground">Отклики исполнителей</h4>
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
            <p className="mt-2 text-sm text-muted-foreground">Загружаем отклики...</p>
          ) : null}
          {isResponsesExpanded && !isOrderResponsesLoading && orderResponses.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Пока нет откликов исполнителей.</p>
          ) : null}
          {isResponsesExpanded && !isOrderResponsesLoading && orderResponses.length > 0 ? (
            <div className="mt-3 space-y-2">
              {orderResponses.map((response) => (
                <div
                  key={response.executorId}
                  className="cursor-pointer rounded-lg border border-border p-3"
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
                      <p className="text-sm font-medium text-foreground">{response.executorFullName || response.executorId}</p>
                      <p className="text-xs text-muted-foreground">
                        {toStatusLabel(response.status)} · {new Date(response.updatedAtUtc).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {response.status === 'Pending' ? (
                        <>
                          <Button
                            className="h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
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
                            className="h-8 rounded-lg border-error/40 text-destructive hover:bg-error-muted"
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
                    <div className="mt-3 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                      <p><span className="font-semibold">Грейд:</span> {response.executorGrade || '—'}</p>
                      <p><span className="font-semibold">Текущий проект:</span> {response.executorProjectTitle || '—'}</p>
                      <p><span className="font-semibold">Компания:</span> {response.executorProjectCompanyName || '—'}</p>
                      <p><span className="font-semibold">Опыт:</span> {response.executorExperienceSummary || '—'}</p>
                      {response.message ? <p className="mt-2 whitespace-pre-wrap break-words"><span className="font-semibold">Сообщение:</span> {response.message}</p> : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
