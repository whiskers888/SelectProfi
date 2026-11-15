import { useMemo, useState } from 'react'
import { ArrowUpRight, FileText, History, LockKeyhole, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  formatExperienceYears,
  getWorkspaceCandidatePipelineStage,
} from '../shell/workspaceShell.helpers'
import { workspaceToneToBadgeVariant } from '../model/data'
import type { WorkspaceCandidate, WorkspaceOrder } from '../model/data'
import type { MainFeedPanelViewProps } from './MainFeedPanel.types'
import { DashboardOrdersSection } from './DashboardOrdersSection'

interface ExecutorDashboardSectionProps {
  viewProps: MainFeedPanelViewProps
}

type CandidateStage = 'pool' | 'shortlist' | 'selected'
type CandidateFilter = 'all' | CandidateStage
type CandidateList = 'working' | 'submitted' | 'responses'
type ResponseFilters = {
  minimumExperience: 'all' | '3' | '5' | '7'
  stage: CandidateFilter
  sort: 'date' | 'experience'
}

const defaultResponseFilters: ResponseFilters = {
  minimumExperience: 'all',
  stage: 'all',
  sort: 'date',
}

const candidateFilters: Array<{ value: CandidateFilter; label: string }> = [
  { value: 'all', label: 'Все этапы' },
  { value: 'pool', label: 'Pool' },
  { value: 'shortlist', label: 'Список кандидатов · финалисты' },
  { value: 'selected', label: 'Выбран' },
]

function candidateStage(candidate: WorkspaceCandidate): CandidateStage | null {
  const stage = getWorkspaceCandidatePipelineStage(candidate)
  if (stage === 'Selected') return 'selected'
  if (stage === 'Shortlist') return 'shortlist'
  if (stage === 'Pool') return 'pool'
  return null
}

function orderCompensation(order: WorkspaceOrder): string {
  const value = order.employeeCompensation.trim()
  if (!value) return 'Не указана'

  const amount = Number(value)
  return Number.isFinite(amount) ? `${amount.toLocaleString('ru-RU')} ₽` : value
}

function formatAmount(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return '—'
  return `${amount.toLocaleString('ru-RU')} ₽`
}

function vacancyStatusLabel(status: 'Draft' | 'OnApproval' | 'Published'): string {
  if (status === 'Draft') return 'Черновик'
  if (status === 'OnApproval') return 'На согласовании'
  return 'Опубликована'
}

export function ExecutorDashboardSection({ viewProps }: ExecutorDashboardSectionProps) {
  const [stageFilter, setStageFilter] = useState<CandidateFilter>('all')
  const [candidateList, setCandidateList] = useState<CandidateList>('working')
  const [responseSearch, setResponseSearch] = useState('')
  const [responseFilters, setResponseFilters] = useState<ResponseFilters>(defaultResponseFilters)
  const [responseFilterDraft, setResponseFilterDraft] = useState<ResponseFilters>(defaultResponseFilters)
  const [isResponseFiltersOpen, setIsResponseFiltersOpen] = useState(false)
  const selectedOrder = viewProps.selectedDashboardOrder
  const vacancyPreview = viewProps.selectedDashboardVacancyPreview
  const isVacancyLoading = !vacancyPreview && Boolean(viewProps.isDashboardVacanciesLoading)
  const isVacancyError = !vacancyPreview && Boolean(viewProps.isDashboardVacanciesError)
  const vacancyNoticeTitle = isVacancyLoading
    ? 'Загружаем данные вакансии'
    : isVacancyError
      ? 'Не удалось загрузить вакансию проекта'
      : !vacancyPreview
        ? 'Для проекта пока нет опубликованной вакансии'
        : vacancyPreview.status === 'Draft'
          ? 'Вакансия пока не опубликована'
          : 'Вакансия ожидает согласования'
  const orderCandidates = useMemo(() => {
    const candidates = viewProps.executorDashboardCandidates ?? []
    return selectedOrder
      ? candidates.filter(
          (candidate) => candidate.orderId === selectedOrder.id && candidateStage(candidate) !== null,
        )
      : []
  }, [viewProps.executorDashboardCandidates, selectedOrder])
  const workingCandidates = orderCandidates.filter((candidate) => !candidate.isCustomerSubmitted)
  const submittedCandidates = orderCandidates.filter((candidate) => candidate.isCustomerSubmitted)
  const responseCandidates = orderCandidates.filter((candidate) => Boolean(candidate.applicantSubmittedAtUtc))
  const visibleCandidates =
    candidateList === 'submitted'
      ? submittedCandidates
      : candidateList === 'responses'
        ? responseCandidates
        : workingCandidates
  const stageCounts: Record<CandidateStage, number> = {
    pool: orderCandidates.filter((candidate) => candidateStage(candidate) === 'pool').length,
    shortlist: orderCandidates.filter((candidate) => candidateStage(candidate) === 'shortlist').length,
    selected: orderCandidates.filter((candidate) => candidateStage(candidate) === 'selected').length,
  }
  const visibleStageCounts: Record<CandidateStage, number> = {
    pool: visibleCandidates.filter((candidate) => candidateStage(candidate) === 'pool').length,
    shortlist: visibleCandidates.filter((candidate) => candidateStage(candidate) === 'shortlist').length,
    selected: visibleCandidates.filter((candidate) => candidateStage(candidate) === 'selected').length,
  }
  const isCandidateListSubmitted =
    Boolean(vacancyPreview?.shortlistSentToCustomerAtUtc) ||
    orderCandidates.some((candidate) => candidate.isCustomerSubmitted)
  const activeStageFilter = candidateList === 'responses' ? responseFilters.stage : stageFilter
  const minimumExperience = Number(responseFilters.minimumExperience)
  const normalizedResponseSearch = responseSearch.trim().toLocaleLowerCase()
  const filteredCandidates = visibleCandidates
    .filter((candidate) => activeStageFilter === 'all' || candidateStage(candidate) === activeStageFilter)
    .filter((candidate) => {
      if (candidateList !== 'responses') return true
      if (responseFilters.minimumExperience !== 'all' && (candidate.experienceYears ?? -1) < minimumExperience) {
        return false
      }
      if (!normalizedResponseSearch) return true
      return [candidate.name, candidate.experienceSummary]
        .some((value) => value?.toLocaleLowerCase().includes(normalizedResponseSearch))
    })
    .sort((left, right) => {
      if (candidateList !== 'responses') return 0
      if (responseFilters.sort === 'experience') {
        return (right.experienceYears ?? -1) - (left.experienceYears ?? -1)
      }
      return Date.parse(right.applicantSubmittedAtUtc ?? '') - Date.parse(left.applicantSubmittedAtUtc ?? '')
    })
  const responseFilterCount =
    Number(responseFilters.minimumExperience !== 'all') +
    Number(responseFilters.stage !== 'all') +
    Number(responseFilters.sort !== 'date')
  const responseFilterSummary = [
    responseFilters.minimumExperience !== 'all' ? `Опыт от ${responseFilters.minimumExperience} лет` : null,
    responseFilters.stage !== 'all'
      ? candidateFilters.find((filter) => filter.value === responseFilters.stage)?.label
      : null,
    responseFilters.sort === 'experience' ? 'Сортировка: по опыту' : null,
  ].filter((value): value is string => Boolean(value))
  const dashboardOrdersProps: MainFeedPanelViewProps = { ...viewProps, onOpenOrder: () => undefined }
  const rawSteps = [
    { label: 'Заказ', complete: Boolean(selectedOrder) },
    { label: 'Назначение', complete: Boolean(selectedOrder) },
    { label: 'Вакансия', complete: vacancyPreview?.status === 'Published' },
    { label: 'Pool кандидатов', complete: orderCandidates.length > 0 },
    { label: 'Список кандидатов', complete: isCandidateListSubmitted },
    { label: 'Финалист', complete: stageCounts.selected > 0 },
  ]
  const currentStepIndex = rawSteps.findIndex((step) => !step.complete)
  const steps = rawSteps.map((step, index) => ({
    ...step,
    state: step.complete
      ? ('complete' as const)
      : index === currentStepIndex
        ? ('current' as const)
        : ('pending' as const),
  }))

  return (
    <div className="preview11-executor-dashboard">
      <div className="preview11-executor-projects">
        {viewProps.isOrdersError ? (
          <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
            <p>Не удалось загрузить проекты.</p>
            {viewProps.onRetryOrders ? (
              <button
                className="mt-2 rounded-md border border-current px-3 py-1.5 font-medium"
                onClick={viewProps.onRetryOrders}
                type="button"
              >
                Повторить
              </button>
            ) : null}
          </div>
        ) : null}
        <DashboardOrdersSection {...dashboardOrdersProps} />
      </div>

      <section aria-label="Выбранный проект" className="preview11-executor-project-detail">
        {selectedOrder ? (
          <>
            <header className="preview11-executor-project-header">
              <p className="preview11-executor-breadcrumb">Мои проекты / {selectedOrder.title}</p>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="preview11-executor-project-title">{selectedOrder.title}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedOrder.company || 'Заказчик не указан'}
                    {selectedOrder.location ? ` · ${selectedOrder.location}` : ''}
                  </p>
                </div>
                <Badge variant={workspaceToneToBadgeVariant(selectedOrder.statusTone)}>
                  {selectedOrder.statusLabel}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-label={`Открыть детали проекта ${selectedOrder.title}`}
                  className="preview11-executor-secondary-action"
                  onClick={() => viewProps.onOpenOrder(selectedOrder)}
                >
                  Подробнее о проекте <ArrowUpRight size={15} aria-hidden="true" />
                </button>
                {viewProps.onOpenChat ? (
                  <button
                    className="preview11-executor-secondary-action"
                    onClick={viewProps.onOpenChat}
                    type="button"
                  >
                    Написать заказчику
                  </button>
                ) : null}
              </div>
            </header>

            {isVacancyLoading || isVacancyError || !vacancyPreview || vacancyPreview.status !== 'Published' ? (
              <div className="preview11-executor-notice" role={isVacancyError ? 'alert' : 'status'}>
                <div>
                  <strong>{vacancyNoticeTitle}</strong>
                  <p>
                    {isVacancyLoading
                      ? 'Подождите, пока загрузится статус вакансии.'
                      : isVacancyError
                        ? 'Проверьте соединение и повторите запрос.'
                        : !vacancyPreview
                          ? 'Отклики появятся после создания и публикации вакансии.'
                          : 'Отклики и база кандидатов станут доступны после публикации вакансии.'}
                  </p>
                </div>
                {vacancyPreview ? (
                  <Badge variant="neutral">{vacancyStatusLabel(vacancyPreview.status)}</Badge>
                ) : null}
                {isVacancyError && viewProps.onRetryDashboardVacancies ? (
                  <button
                    className="preview11-executor-secondary-action"
                    onClick={viewProps.onRetryDashboardVacancies}
                    type="button"
                  >
                    Повторить
                  </button>
                ) : null}
              </div>
            ) : isCandidateListSubmitted ? (
              <div className="preview11-executor-notice preview11-executor-notice-success" role="status">
                <strong>Официальный список кандидатов отправлен заказчику</strong>
                <span>Изменение этапов этого списка временно недоступно.</span>
              </div>
            ) : null}

            <ol aria-label="Этапы проекта" className="preview11-executor-progress">
              {steps.map((step, index) => (
                <li
                  key={step.label}
                  aria-current={step.state === 'current' ? 'step' : undefined}
                  className={`preview11-executor-progress-step preview11-executor-progress-${step.state}`}
                >
                  <span className="preview11-executor-progress-index">
                    {step.state === 'complete' ? '✓' : index + 1}
                  </span>
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>

            <div className="preview11-executor-overview">
              <div>
                <span>Заказчик проекта</span>
                <strong>{selectedOrder.company || '—'}</strong>
              </div>
              <div>
                <span>Ваш доход</span>
                <strong>{formatAmount(selectedOrder.executorNetAmount)}</strong>
              </div>
              <div>
                <span>Зарплата сотрудника</span>
                <strong>{orderCompensation(selectedOrder)}</strong>
              </div>
              <div>
                <span>График и локация</span>
                <strong>{selectedOrder.location || '—'}</strong>
              </div>
              <div>
                <span>Кандидаты в проекте</span>
                <strong>{orderCandidates.length}</strong>
              </div>
              <div>
                <span>Официальный список</span>
                <strong>{isCandidateListSubmitted ? 'Отправлен' : 'Не отправлен'}</strong>
              </div>
            </div>

            <div className="preview11-executor-lower-grid">
              <div className="preview11-executor-primary-column">
                <Card className="preview11-executor-card">
                  <CardHeader className="preview11-executor-card-header">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">
                          {candidateList === 'working'
                            ? 'Рабочие кандидаты'
                            : candidateList === 'responses'
                              ? 'Отклики соискателей'
                              : 'Список, отправленный заказчику'}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {candidateList === 'working'
                            ? 'Pool и список кандидатов, доступные для работы по проекту.'
                            : candidateList === 'responses'
                              ? 'Самостоятельные отклики из опубликованной вакансии.'
                              : 'Кандидаты, официально переданные заказчику.'}
                        </p>
                      </div>
                      {candidateList !== 'responses' ? (
                        <span className="preview11-executor-submission-state">
                          {isCandidateListSubmitted ? 'Список отправлен' : 'Список не отправлен'}
                        </span>
                      ) : (
                        <span className="preview11-executor-submission-state">Откликов: {responseCandidates.length}</span>
                      )}
                    </div>

                    <div className="preview11-executor-list-switch" role="group" aria-label="Список кандидатов">
                      <button
                        aria-pressed={candidateList === 'working'}
                        onClick={() => setCandidateList('working')}
                        type="button"
                      >
                        Рабочий список <span>{workingCandidates.length}</span>
                      </button>
                      <button
                        aria-pressed={candidateList === 'submitted'}
                        onClick={() => setCandidateList('submitted')}
                        type="button"
                      >
                        Отправлены заказчику <span>{submittedCandidates.length}</span>
                      </button>
                      <button
                        aria-pressed={candidateList === 'responses'}
                        onClick={() => setCandidateList('responses')}
                        type="button"
                      >
                        Отклики <span>{responseCandidates.length}</span>
                      </button>
                    </div>

                    {candidateList === 'responses' ? (
                      <div className="grid gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            aria-label="Поиск откликов"
                            className="h-9 min-w-[200px] flex-1 rounded-lg border-border"
                            onChange={(event) => setResponseSearch(event.target.value)}
                            placeholder="Поиск по имени и опыту"
                            type="search"
                            value={responseSearch}
                          />
                          <Button
                            aria-label={responseFilterCount ? `Фильтры откликов: ${responseFilterCount}` : 'Фильтры откликов'}
                            className="h-9 rounded-lg border-border"
                            onClick={() => {
                              setResponseFilterDraft(responseFilters)
                              setIsResponseFiltersOpen(true)
                            }}
                            type="button"
                            variant={responseFilterCount ? 'default' : 'outline'}
                          >
                            <SlidersHorizontal aria-hidden="true" size={15} />
                            Фильтры{responseFilterCount ? ` · ${responseFilterCount}` : ''}
                          </Button>
                        </div>
                        {responseFilterSummary.length > 0 ? (
                          <div
                            aria-label="Применённые фильтры откликов"
                            className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                          >
                            {responseFilterSummary.map((filter) => (
                              <span className="rounded-full border border-border bg-muted px-2.5 py-1" key={filter}>
                                {filter}
                              </span>
                            ))}
                            <button
                              className="font-medium text-primary hover:underline"
                              onClick={() => setResponseFilters(defaultResponseFilters)}
                              type="button"
                            >
                              Сбросить
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="preview11-executor-stage-filters" role="group" aria-label="Фильтр по этапу кандидата">
                        {candidateFilters.map((filter) => {
                          const count =
                            filter.value === 'all'
                              ? visibleCandidates.length
                              : visibleStageCounts[filter.value]
                          return (
                            <button
                              key={filter.value}
                              aria-pressed={stageFilter === filter.value}
                              onClick={() => setStageFilter(filter.value)}
                              type="button"
                            >
                              {filter.label} <span>{count}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="preview11-executor-card-content">
                    {viewProps.isCandidateDataLoading ? (
                      <p className="py-8 text-center text-sm text-muted-foreground" role="status">
                        Загружаем кандидатов…
                      </p>
                    ) : viewProps.isCandidateDataError ? (
                      <div className="py-8 text-center" role="alert">
                        <p className="text-sm text-destructive">Не удалось загрузить кандидатов.</p>
                        {viewProps.onRetryCandidateData ? (
                          <button
                            type="button"
                            onClick={viewProps.onRetryCandidateData}
                            className="mt-3 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                          >
                            Повторить
                          </button>
                        ) : null}
                      </div>
                    ) : candidateList === 'submitted' && !isCandidateListSubmitted ? (
                      <p className="preview11-executor-empty" role="status">
                        Официальный список ещё не отправлен заказчику.
                      </p>
                    ) : !selectedOrder ? (
                      <p className="preview11-executor-empty" role="status">
                        Выберите проект, чтобы посмотреть кандидатов.
                      </p>
                    ) : visibleCandidates.length === 0 ? (
                      <p className="preview11-executor-empty" role="status">
                        {!vacancyPreview || vacancyPreview.status !== 'Published'
                          ? 'Кандидаты появятся после публикации вакансии.'
                          : candidateList === 'working'
                            ? 'В рабочем списке пока нет кандидатов.'
                            : candidateList === 'responses'
                              ? 'По этой вакансии пока нет откликов.'
                              : 'В отправленном списке пока нет кандидатов.'}
                      </p>
                    ) : filteredCandidates.length === 0 ? (
                      <p className="preview11-executor-empty" role="status">
                        {candidateList === 'responses'
                          ? 'По заданным условиям отклики не найдены.'
                          : 'На этом этапе пока нет кандидатов.'}
                      </p>
                    ) : (
                      <Table stackOnMobile>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Кандидат</TableHead>
                            <TableHead>Опыт и квалификация</TableHead>
                            <TableHead>Этап</TableHead>
                            <TableHead>Источник</TableHead>
                            <TableHead>Действие</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCandidates.map((candidate) => {
                            const stage = candidateStage(candidate)
                            const nextStage = stage === 'pool' ? 'Shortlist' : stage === 'shortlist' ? 'Pool' : null
                            const experienceYears = formatExperienceYears(candidate.experienceYears)
                            const experienceDetails = candidate.experienceSummary?.trim()

                            return (
                              <TableRow
                                key={`${candidate.orderId}:${candidate.id}`}
                                className="cursor-pointer"
                                onClick={() => viewProps.onOpenCandidate(candidate)}
                              >
                                <TableCell data-label="Кандидат">
                                  <button
                                    type="button"
                                    className="text-left font-semibold text-primary hover:underline"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      viewProps.onOpenCandidate(candidate)
                                    }}
                                  >
                                    {candidate.name}
                                  </button>
                                  {candidate.isAnonymized ? (
                                    <p className="mt-1 text-xs text-muted-foreground">Контакты скрыты</p>
                                  ) : null}
                                </TableCell>
                                <TableCell data-label="Опыт и квалификация">
                                  <span className="font-medium">
                                    {experienceYears !== '—' ? experienceYears : 'Опыт не указан'}
                                  </span>
                                  {experienceDetails ? (
                                    <p className="mt-1 text-xs text-muted-foreground">{experienceDetails}</p>
                                  ) : null}
                                </TableCell>
                                <TableCell data-label="Этап">
                                  <Badge variant={workspaceToneToBadgeVariant(candidate.statusTone)}>
                                    {candidate.statusLabel}
                                  </Badge>
                                </TableCell>
                                <TableCell data-label="Источник">{candidate.source || '—'}</TableCell>
                                <TableCell data-label="Действие">
                                  {stage === 'selected' ? (
                                    <span className="text-xs text-muted-foreground">Финалист выбран</span>
                                  ) : candidate.isCustomerSubmitted ? (
                                    <span className="text-xs text-muted-foreground">Отправлен заказчику</span>
                                  ) : viewProps.dashboardState === 'archive' ? (
                                    <span className="text-xs text-muted-foreground">Только просмотр</span>
                                  ) : isCandidateListSubmitted ? (
                                    <span className="text-xs text-muted-foreground">Список отправлен заказчику</span>
                                  ) : nextStage && viewProps.onSetCandidateStage ? (
                                    <button
                                      type="button"
                                      aria-label={
                                        nextStage === 'Shortlist'
                                          ? `Добавить ${candidate.name} в список кандидатов`
                                          : `Вернуть ${candidate.name} в рабочий список`
                                      }
                                      disabled={viewProps.isUpdatingCandidateStage}
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        void viewProps.onSetCandidateStage?.(
                                          selectedOrder.id,
                                          candidate.id,
                                          nextStage,
                                        )
                                      }}
                                      className="preview11-executor-candidate-action"
                                    >
                                      {nextStage === 'Shortlist'
                                        ? 'Добавить в список кандидатов'
                                        : 'Вернуть в рабочий список'}
                                    </button>
                                  ) : null}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card className="preview11-executor-card">
                  <CardHeader className="preview11-executor-card-header">
                    <CardTitle className="text-base">Требования вакансии</CardTitle>
                  </CardHeader>
                  <CardContent className="preview11-executor-requirements">
                    {selectedOrder.functional ? (
                      <div>
                        <h3>Функционал</h3>
                        <p>{selectedOrder.functional}</p>
                      </div>
                    ) : null}
                    {selectedOrder.requirements ? (
                      <div>
                        <h3>Требования</h3>
                        <p>{selectedOrder.requirements}</p>
                      </div>
                    ) : null}
                    {selectedOrder.otherConditions ? (
                      <div>
                        <h3>Дополнительные условия</h3>
                        <p>{selectedOrder.otherConditions}</p>
                      </div>
                    ) : null}
                    {vacancyPreview?.description ? (
                      <div>
                        <h3>{vacancyPreview.title || 'Описание вакансии'}</h3>
                        <p>{vacancyPreview.description}</p>
                      </div>
                    ) : null}
                    {!selectedOrder.functional &&
                    !selectedOrder.requirements &&
                    !selectedOrder.otherConditions &&
                    !vacancyPreview?.description ? (
                      <p className="preview11-executor-empty">Требования по проекту пока не указаны.</p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <aside className="preview11-executor-aside">
                <Card className="preview11-executor-card">
                  <CardHeader className="preview11-executor-card-header preview11-executor-aside-title">
                    <FileText size={17} aria-hidden="true" />
                    <CardTitle className="text-sm">Документы по проекту</CardTitle>
                  </CardHeader>
                  <CardContent className="preview11-executor-aside-empty">
                    <p>Документы недоступны в кабинете исполнителя.</p>
                  </CardContent>
                </Card>

                <Card className="preview11-executor-card">
                  <CardHeader className="preview11-executor-card-header preview11-executor-aside-title">
                    <History size={17} aria-hidden="true" />
                    <CardTitle className="text-sm">История проекта</CardTitle>
                  </CardHeader>
                  <CardContent className="preview11-executor-aside-empty">
                    <p>История действий по проекту недоступна.</p>
                  </CardContent>
                </Card>

                <div className="preview11-executor-privacy-note">
                  <LockKeyhole size={17} aria-hidden="true" />
                  <p>Контактные данные кандидатов отображаются только там, где это разрешено для проекта.</p>
                </div>
              </aside>
            </div>
          </>
        ) : (
          <div className="preview11-executor-no-project" role="status">
            <h1>Выберите проект</h1>
            <p>Выберите проект слева, чтобы открыть этапы, условия и кандидатов.</p>
          </div>
        )}
      </section>
      <Modal
        className="max-w-xl"
        description="Фильтры применяются только к откликам выбранного проекта и учитывают данные профиля кандидата."
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button onClick={() => setResponseFilterDraft(defaultResponseFilters)} type="button" variant="ghost">
              Очистить
            </Button>
            <div className="flex flex-wrap justify-end gap-2">
              <Button onClick={() => setIsResponseFiltersOpen(false)} type="button" variant="outline">
                Отмена
              </Button>
              <Button
                onClick={() => {
                  setResponseFilters(responseFilterDraft)
                  setIsResponseFiltersOpen(false)
                }}
                type="button"
              >
                Показать отклики
              </Button>
            </div>
          </div>
        }
        onOpenChange={setIsResponseFiltersOpen}
        open={isResponseFiltersOpen}
        title="Фильтры откликов"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="executor-response-experience">Опыт</Label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              id="executor-response-experience"
              onChange={(event) =>
                setResponseFilterDraft((current) => ({
                  ...current,
                  minimumExperience: event.target.value as ResponseFilters['minimumExperience'],
                }))
              }
              value={responseFilterDraft.minimumExperience}
            >
              <option value="all">Любой</option>
              <option value="3">От 3 лет</option>
              <option value="5">От 5 лет</option>
              <option value="7">От 7 лет</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="executor-response-stage">Этап</Label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              id="executor-response-stage"
              onChange={(event) =>
                setResponseFilterDraft((current) => ({
                  ...current,
                  stage: event.target.value as CandidateFilter,
                }))
              }
              value={responseFilterDraft.stage}
            >
              {candidateFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.value === 'all' ? 'Все отклики' : filter.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="executor-response-sort">Сортировка</Label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              id="executor-response-sort"
              onChange={(event) =>
                setResponseFilterDraft((current) => ({
                  ...current,
                  sort: event.target.value as ResponseFilters['sort'],
                }))
              }
              value={responseFilterDraft.sort}
            >
              <option value="date">По дате отклика</option>
              <option value="experience">По опыту</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
