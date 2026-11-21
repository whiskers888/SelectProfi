import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ChevronRight, FileText, History, ListChecks, LockKeyhole, MessageCircle, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useClearProjectDueDateMutation,
  useDownloadProjectDocumentMutation,
  useGetProjectDocumentsQuery,
  useGetProjectHistoryQuery,
  useSetProjectDueDateMutation,
  useUploadProjectDocumentMutation,
} from '@/shared/api/orders'
import {
  formatExperienceYears,
  getWorkspaceCandidatePipelineStage,
} from '../shell/workspaceShell.helpers'
import { isWorkspaceOrderCompleted, workspaceToneToBadgeVariant } from '../model/data'
import type { WorkspaceCandidate, WorkspaceOrder } from '../model/data'
import type { MainFeedPanelViewProps } from './MainFeedPanel.types'

interface ExecutorDashboardSectionProps {
  viewProps: MainFeedPanelViewProps
}

type CandidateStage = 'pool' | 'shortlist' | 'selected'
type CandidateFilter = 'all' | CandidateStage
type CandidateList = 'working' | 'submitted' | 'responses'
type ProjectTab = 'candidates' | 'responses' | 'requirements' | 'vacancy' | 'history' | 'documents' | 'payment'
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

const projectFilters: Array<{ value: 'all' | 'active' | 'completed'; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'В работе' },
  { value: 'completed', label: 'Выполнены' },
]

const additionalProjectFilters: Array<{ value: 'paused' | 'archive'; label: string }> = [
  { value: 'paused', label: 'На паузе' },
  { value: 'archive', label: 'Архив' },
]

function candidateStage(candidate: WorkspaceCandidate): CandidateStage | null {
  const stage = getWorkspaceCandidatePipelineStage(candidate)
  if (stage === 'Selected') return 'selected'
  if (stage === 'Shortlist') return 'shortlist'
  if (stage === 'Pool') return 'pool'
  return null
}

function isCandidateInOfficialList(candidate: WorkspaceCandidate): boolean {
  const stage = candidateStage(candidate)
  return stage === 'shortlist' || stage === 'selected' || candidate.isCustomerSubmitted === true
}

function projectRequirementText(value: string): string {
  if (!/<\/?[a-z][\w:-]*(?:\s[^>]*)?>/iu.test(value)) return value.trim()

  const document = new DOMParser().parseFromString(value, 'text/html')
  document.body.querySelectorAll('script, style').forEach((element) => element.remove())
  document.body.querySelectorAll('br').forEach((element) => element.replaceWith(document.createTextNode('\n')))
  document.body.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6').forEach((element) => {
    element.append(document.createTextNode('\n'))
  })

  return (document.body.textContent ?? '')
    .replace(/\u00a0/gu, ' ')
    .replace(/[ \t]*\n[ \t]*/gu, '\n')
    .replace(/\n{2,}/gu, '\n')
    .trim()
}

function requestedCandidateCountLabel(count: number): string {
  const lastTwoDigits = count % 100
  const lastDigit = count % 10
  const noun =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? 'кандидатов'
      : lastDigit === 1
        ? 'кандидат'
        : lastDigit >= 2 && lastDigit <= 4
          ? 'кандидата'
          : 'кандидатов'

  return `${count} ${noun}`
}

function orderReferenceLabel(orderId: string): string {
  return orderId.length > 12 ? `${orderId.slice(0, 8)}…` : orderId
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

function formatProjectDueDate(value?: string | null): string {
  if (!value) return 'Не назначен'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? 'Не назначен' : date.toLocaleDateString('ru-RU')
}

function formatDocumentSize(length: number): string {
  if (length < 1024) return `${length} Б`
  if (length < 1024 * 1024) return `${(length / 1024).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} КБ`
  return `${(length / (1024 * 1024)).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} МБ`
}

function vacancyStatusLabel(status: 'Draft' | 'OnApproval' | 'Published'): string {
  if (status === 'Draft') return 'Черновик'
  if (status === 'OnApproval') return 'На согласовании'
  return 'Опубликована'
}

export function ExecutorDashboardSection({ viewProps }: ExecutorDashboardSectionProps) {
  const selectedOrder = viewProps.selectedOrderDetails ?? viewProps.selectedDashboardOrder
  const selectedOrderKey = selectedOrder?.id ?? null
  const routeOrderId = viewProps.selectedOrderDetails?.id ?? null
  const functionalText = selectedOrder ? projectRequirementText(selectedOrder.functional) : ''
  const requirementsText = selectedOrder ? projectRequirementText(selectedOrder.requirements) : ''
  const otherConditionsText = selectedOrder ? projectRequirementText(selectedOrder.otherConditions) : ''
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(Boolean(routeOrderId))
  const [projectTab, setProjectTab] = useState<ProjectTab>('candidates')
  const [projectStateOrderId, setProjectStateOrderId] = useState<string | null>(selectedOrderKey)
  const [stageFilter, setStageFilter] = useState<CandidateFilter>('all')
  const [candidateList, setCandidateList] = useState<CandidateList>('working')
  const [responseSearch, setResponseSearch] = useState('')
  const [responseFilters, setResponseFilters] = useState<ResponseFilters>(defaultResponseFilters)
  const [responseFilterDraft, setResponseFilterDraft] = useState<ResponseFilters>(defaultResponseFilters)
  const [isResponseFiltersOpen, setIsResponseFiltersOpen] = useState(false)
  const [isSubmitCandidateListOpen, setIsSubmitCandidateListOpen] = useState(false)
  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false)
  const [dueDateDraft, setDueDateDraft] = useState(selectedOrder?.dueDate ?? '')
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null)
  const [projectWorkspaceFeedback, setProjectWorkspaceFeedback] = useState('')
  const [dueDateFeedback, setDueDateFeedback] = useState('')
  const [setProjectDueDate, { isLoading: isSettingDueDate }] = useSetProjectDueDateMutation()
  const [clearProjectDueDate, { isLoading: isClearingDueDate }] = useClearProjectDueDateMutation()
  const [uploadProjectDocument, { isLoading: isUploadingDocument }] = useUploadProjectDocumentMutation()
  const [downloadProjectDocument, { isLoading: isDownloadingDocument }] = useDownloadProjectDocumentMutation()
  const historyQuery = useGetProjectHistoryQuery(selectedOrder?.id ?? '', {
    skip: !isProjectDetailOpen || projectTab !== 'history' || !selectedOrder,
  })
  const documentsQuery = useGetProjectDocumentsQuery(selectedOrder?.id ?? '', {
    skip: !isProjectDetailOpen || projectTab !== 'documents' || !selectedOrder,
  })
  const vacancyPreview = viewProps.selectedDashboardVacancyPreview
  const vacancyDescriptionText = projectRequirementText(vacancyPreview?.description ?? '')

  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo(0, 0)
  }, [isProjectDetailOpen, selectedOrderKey])

  useEffect(() => {
    setIsProjectDetailOpen(Boolean(routeOrderId))
  }, [routeOrderId])

  useEffect(() => {
    setDueDateDraft(selectedOrder?.dueDate ?? '')
  }, [selectedOrder?.id, selectedOrder?.dueDate])

  useEffect(() => {
    setSelectedDocumentFile(null)
    setProjectWorkspaceFeedback('')
  }, [selectedOrder?.id])

  async function handleDueDateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedOrder || !dueDateDraft) return
    try {
      await setProjectDueDate({ orderId: selectedOrder.id, dueDate: dueDateDraft }).unwrap()
      setDueDateFeedback('Срок сдачи сохранён.')
    } catch {
      setDueDateFeedback('Не удалось сохранить срок сдачи. Повторите попытку.')
    }
  }

  async function handleDueDateClear() {
    if (!selectedOrder) return
    try {
      await clearProjectDueDate(selectedOrder.id).unwrap()
      setDueDateDraft('')
      setDueDateFeedback('Срок сдачи удалён.')
    } catch {
      setDueDateFeedback('Не удалось изменить срок сдачи. Повторите попытку.')
    }
  }

  function handleDueDateModalOpenChange(open: boolean) {
    setIsDueDateModalOpen(open)
    if (!open) setDueDateFeedback('')
  }

  async function handleDocumentUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedOrder || !selectedDocumentFile) return
    const form = event.currentTarget
    try {
      await uploadProjectDocument({ orderId: selectedOrder.id, file: selectedDocumentFile }).unwrap()
      setSelectedDocumentFile(null)
      form.reset()
      setProjectWorkspaceFeedback('Документ добавлен в проект.')
    } catch {
      setProjectWorkspaceFeedback('Не удалось загрузить документ. Проверьте формат и размер файла.')
    }
  }

  async function handleDocumentDownload(documentId: string, fileName: string) {
    if (!selectedOrder) return
    try {
      const file = await downloadProjectDocument({ orderId: selectedOrder.id, documentId }).unwrap()
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setProjectWorkspaceFeedback('Не удалось открыть документ. Повторите попытку.')
    }
  }

  if (projectStateOrderId !== selectedOrderKey) {
    setProjectStateOrderId(selectedOrderKey)
    setProjectTab('candidates')
    setStageFilter('all')
    setCandidateList('working')
    setResponseSearch('')
    setResponseFilters(defaultResponseFilters)
    setResponseFilterDraft(defaultResponseFilters)
    setIsResponseFiltersOpen(false)
    setIsSubmitCandidateListOpen(false)
    setIsDueDateModalOpen(false)
  }
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
  const requestedCandidatesCount = selectedOrder?.requestedCandidatesCount ?? 0
  const projectOverviewFields = selectedOrder
    ? [
        { label: 'Должность', value: selectedOrder.title },
        { label: 'Заказчик', value: selectedOrder.company || 'Не указан' },
        { label: 'Локация', value: selectedOrder.location || 'Не указана' },
        {
          label: 'План найма',
          value: requestedCandidatesCount > 0 ? requestedCandidateCountLabel(requestedCandidatesCount) : 'Не указан',
        },
      ]
    : []
  const projectConditionFields = selectedOrder
    ? [{ label: 'Доход', value: orderCompensation(selectedOrder) }]
    : []
  const minimumCandidateCount = Math.max(1, requestedCandidatesCount)
  const shortlistCandidateCount = orderCandidates.filter(
    (candidate) => candidateStage(candidate) === 'shortlist' && !candidate.isCustomerSubmitted,
  ).length
  const officialListCount = orderCandidates.filter(isCandidateInOfficialList).length
  const projectProgressPercent = isCandidateListSubmitted
    ? 100
    : requestedCandidatesCount > 0
      ? Math.min(100, Math.round((shortlistCandidateCount / requestedCandidatesCount) * 100))
      : 0
  const canSubmitCandidateList = Boolean(
    selectedOrder &&
      viewProps.role === 'Executor' &&
      !selectedOrder.isArchived &&
      vacancyPreview?.status === 'Published' &&
      !isCandidateListSubmitted &&
      shortlistCandidateCount >= minimumCandidateCount &&
      viewProps.onSubmitCandidateListForOrder,
  )
  const isProjectCompleted = selectedOrder ? isWorkspaceOrderCompleted(selectedOrder) : false
  const canManageDueDate = Boolean(
    selectedOrder && viewProps.role === 'Executor' && !selectedOrder.isArchived && !isProjectCompleted,
  )

  useEffect(() => {
    if (canManageDueDate) return
    setIsDueDateModalOpen(false)
    setDueDateFeedback('')
  }, [canManageDueDate])

  const projectStatusLabel = selectedOrder?.isPaused
    ? 'На паузе'
    : selectedOrder?.isArchived
      ? 'В архиве'
      : selectedOrder?.statusLabel ?? ''
  const shouldShowProjectStatus = Boolean(
    selectedOrder &&
      (selectedOrder.isPaused ||
        selectedOrder.isArchived ||
        isProjectCompleted ||
        !/^в работе$/iu.test(selectedOrder.statusLabel.trim())),
  )
  const isCustomerSelectionComplete = isCandidateListSubmitted && stageCounts.selected > 0
  const rawSteps = [
    { label: 'Заказ', complete: Boolean(selectedOrder) },
    { label: 'Назначение', complete: Boolean(selectedOrder?.executorId) },
    { label: 'Подготовка', complete: isCandidateListSubmitted },
    { label: 'Отправка и выбор', complete: isCustomerSelectionComplete },
    { label: 'Выполнен', complete: isProjectCompleted },
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

  function handleProjectTabChange(value: string) {
    const nextTab = value as ProjectTab
    setProjectTab(nextTab)
    if (nextTab === 'responses') {
      setCandidateList('responses')
    } else if (candidateList === 'responses') {
      setCandidateList('working')
    }
  }

  function handleCandidateListChange(nextList: CandidateList) {
    setCandidateList(nextList)
    setProjectTab(nextList === 'responses' ? 'responses' : 'candidates')
  }

  function openProject(order: WorkspaceOrder) {
    viewProps.onOpenOrder(order)
    setIsProjectDetailOpen(true)
  }

  return (
    <div className="preview11-executor-dashboard">
      {!isProjectDetailOpen || !selectedOrder ? (
        <section aria-label="Мои проекты" className="preview11-executor-project-list-page">
          <header className="preview11-executor-list-header">
            <div className="preview11-executor-list-title">
              <h1>Мои проекты в работе</h1>
              <div aria-label="Состояние проектов" className="preview11-executor-list-filters" role="group">
                {projectFilters.map((filter) => (
                  <button
                    key={filter.value}
                    aria-pressed={viewProps.dashboardState === filter.value}
                    onClick={() => viewProps.setDashboardState(filter.value)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
                <details className="preview11-executor-list-more-filters">
                  <summary
                    aria-label={
                      viewProps.dashboardState === 'paused' || viewProps.dashboardState === 'archive'
                        ? `Дополнительные состояния: ${additionalProjectFilters.find((filter) => filter.value === viewProps.dashboardState)?.label}`
                        : 'Дополнительные состояния проектов'
                    }
                    data-active={viewProps.dashboardState === 'paused' || viewProps.dashboardState === 'archive'}
                    title="На паузе и в архиве"
                  >
                    <SlidersHorizontal aria-hidden="true" size={14} />
                  </summary>
                  <div aria-label="Дополнительные состояния проектов" className="preview11-executor-list-more-menu" role="group">
                    {additionalProjectFilters.map((filter) => (
                      <button
                        key={filter.value}
                        aria-pressed={viewProps.dashboardState === filter.value}
                        onClick={(event) => {
                          viewProps.setDashboardState(filter.value)
                          const menu = event.currentTarget.closest('details')
                          if (menu) menu.open = false
                        }}
                        type="button"
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </div>
            <label className="preview11-executor-list-sort">
              <select
                aria-label="Сортировка проектов"
                onChange={(event) => viewProps.handleDashboardSortChange(event.target.value)}
                value={viewProps.dashboardSort}
              >
                <option value="updated">Сначала обновлённые</option>
                <option value="dueDate">По сроку сдачи</option>
                <option value="responses">По числу откликов</option>
                <option value="priority">По приоритету</option>
              </select>
            </label>
          </header>

          {viewProps.isOrdersError ? (
            <div className="preview11-executor-list-error" role="alert">
              <p>Не удалось загрузить проекты.</p>
              {viewProps.onRetryOrders ? (
                <button onClick={viewProps.onRetryOrders} type="button">
                  Повторить
                </button>
              ) : null}
            </div>
          ) : viewProps.isLoading ? (
            <p className="preview11-executor-list-empty" role="status">Загружаем проекты…</p>
          ) : viewProps.visibleDashboardOrders.length === 0 ? (
            <div className="preview11-executor-list-empty" role="status">
              <strong>{viewProps.orders.length === 0 ? 'Нет проектов в работе' : 'Проектов в этом списке нет'}</strong>
              <p>Назначенные вам проекты появятся здесь.</p>
            </div>
          ) : (
            <div className="preview11-executor-table-wrap">
              <Table className="preview11-executor-project-table" stackOnMobile>
                <TableHeader>
                  <TableRow>
                    <TableHead>№ заказа</TableHead>
                    <TableHead>Проект / вакансия</TableHead>
                    <TableHead>Заказчик</TableHead>
                    <TableHead>Кандидаты</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Срок сдачи</TableHead>
                    <TableHead>К получению</TableHead>
                    <TableHead>Обновлено</TableHead>
                    <TableHead aria-hidden="true" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewProps.visibleDashboardOrders.map((order) => {
                    const candidateCount = (viewProps.executorDashboardCandidates ?? []).filter(
                      (candidate) => candidate.orderId === order.id && isCandidateInOfficialList(candidate),
                    ).length
                    const requestedCount = order.requestedCandidatesCount ?? 0
                    const projectStatusLabel =
                      requestedCount > 0 && !order.isArchived && !order.isPaused && /^в работе$/iu.test(order.statusLabel.trim())
                        ? `Подготовка ${candidateCount}/${requestedCount}`
                        : order.statusLabel
                    const projectStatusTone = projectStatusLabel.startsWith('Подготовка') ? 'warning' : order.statusTone

                    return (
                      <TableRow
                        key={order.id}
                        className="preview11-executor-project-row"
                        onClick={() => openProject(order)}
                      >
                        <TableCell data-label="№ заказа">
                          <button
                            aria-label={`Открыть проект ${order.title}`}
                            className="preview11-executor-project-open"
                            onClick={(event) => {
                              event.stopPropagation()
                              openProject(order)
                            }}
                            title={order.id}
                            type="button"
                          >
                            {orderReferenceLabel(order.id)}
                          </button>
                        </TableCell>
                        <TableCell data-label="Проект / вакансия">
                          <strong>{order.title}</strong>
                          <span className="preview11-executor-project-subtitle">{order.location || 'Локация не указана'}</span>
                        </TableCell>
                        <TableCell data-label="Заказчик">{order.company || '—'}</TableCell>
                        <TableCell data-label="Кандидаты">
                          {requestedCount > 0 ? `${candidateCount} из ${requestedCount}` : candidateCount}
                        </TableCell>
                        <TableCell data-label="Статус">
                          <Badge
                            className={
                              projectStatusLabel.startsWith('Подготовка')
                                ? 'preview11-executor-project-status-preparation'
                                : undefined
                            }
                            variant={workspaceToneToBadgeVariant(projectStatusTone)}
                          >
                            {projectStatusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Срок сдачи">{formatProjectDueDate(order.dueDate)}</TableCell>
                        <TableCell data-label="К получению">
                          <strong className="preview11-executor-project-amount">{formatAmount(order.executorNetAmount)}</strong>
                          {order.employeeCompensation.trim() ? (
                            <span className="preview11-executor-project-subtitle">{orderCompensation(order)}</span>
                          ) : null}
                        </TableCell>
                        <TableCell data-label="Обновлено">
                          {(order.updatedAt || '—').replace(/^Обновлено\s*/iu, '')}
                        </TableCell>
                        <TableCell aria-hidden="true" className="preview11-executor-project-chevron">
                          <ChevronRight size={17} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      ) : (
        <section aria-label="Выбранный проект" className="preview11-executor-project-detail">
        {selectedOrder ? (
          <>
            <header className="preview11-executor-project-header">
              <nav aria-label="Хлебные крошки" className="preview11-executor-breadcrumb">
                <button
                  onClick={() => {
                    setIsProjectDetailOpen(false)
                    viewProps.onCloseOrderDetails?.()
                  }}
                  type="button"
                >
                  Мои проекты в работе
                </button>
                <span aria-hidden="true">›</span>
                <strong title={selectedOrder.id}>{orderReferenceLabel(selectedOrder.id)} · {selectedOrder.title}</strong>
              </nav>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="preview11-executor-project-title">{selectedOrder.title}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Заказ № {orderReferenceLabel(selectedOrder.id)} · Вы назначены исполнителем · Заказчик {selectedOrder.company || 'не указан'}
                  </p>
                </div>
                <div className="preview11-executor-header-actions">
                  <Badge variant="neutral">
                    Список кандидатов {officialListCount} из {requestedCandidatesCount || '—'}
                  </Badge>
                  {canManageDueDate ? (
                    <Button
                      aria-label={`Срок сдачи: ${formatProjectDueDate(selectedOrder.dueDate)}. Изменить`}
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        setDueDateDraft(selectedOrder.dueDate ?? '')
                        setDueDateFeedback('')
                        setIsDueDateModalOpen(true)
                      }}
                      title="Изменить срок сдачи"
                      type="button"
                      variant="outline"
                    >
                      {selectedOrder.dueDate
                        ? `Срок: ${formatProjectDueDate(selectedOrder.dueDate)}`
                        : 'Назначить срок'}
                    </Button>
                  ) : (
                    <Badge variant="neutral">Срок: {formatProjectDueDate(selectedOrder.dueDate)}</Badge>
                  )}
                  {selectedOrder.completedAtUtc ? (
                    <Badge variant="neutral">
                      Завершён {new Date(selectedOrder.completedAtUtc).toLocaleDateString('ru-RU')}
                    </Badge>
                  ) : null}
                  {shouldShowProjectStatus ? (
                    <Badge variant={workspaceToneToBadgeVariant(selectedOrder.statusTone)}>{projectStatusLabel}</Badge>
                  ) : (
                    <span className="sr-only">{projectStatusLabel}</span>
                  )}
                  {viewProps.onOpenChat ? (
                  <button
                    aria-label="Написать заказчику"
                    className="preview11-executor-icon-action"
                    onClick={viewProps.onOpenChat}
                    title="Написать заказчику"
                    type="button"
                  >
                    <MessageCircle aria-hidden="true" size={16} />
                  </button>
                  ) : null}
                </div>
              </div>
            </header>

            {isVacancyLoading || isVacancyError ? (
              <div className="preview11-executor-notice" role={isVacancyError ? 'alert' : 'status'}>
                <div>
                  <strong>{vacancyNoticeTitle}</strong>
                  <p>
                    {isVacancyLoading
                      ? 'Подождите, пока загрузится статус вакансии.'
                      : 'Проверьте соединение и повторите запрос.'}
                  </p>
                </div>
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
            ) : null}

            <ol aria-label="Этапы проекта" className="preview11-executor-progress">
              {steps.map((step, index) => (
                <li
                  key={step.label}
                  aria-current={step.state === 'current' ? 'step' : undefined}
                  className={`preview11-executor-progress-step preview11-executor-progress-${step.state}`}
                >
                  <span className="preview11-executor-progress-index">
                    {step.state === 'complete' ? '✓' : `${index + 1}.`}
                  </span>
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>

            <div className="preview11-executor-progress-card">
              <div className="preview11-executor-progress-main">
                <div className="preview11-executor-progress-heading">
                  <div>
                    <span>Ход подбора</span>
                    <strong>
                      {isProjectCompleted
                        ? 'Проект выполнен'
                        : isCandidateListSubmitted
                          ? 'Список кандидатов отправлен'
                          : 'Формируем список кандидатов'}
                    </strong>
                  </div>
                  <span className="preview11-executor-progress-count">
                    {officialListCount} из {requestedCandidatesCount || '—'}
                  </span>
                </div>
                <div
                  aria-label="Готовность официального списка"
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={projectProgressPercent}
                  className="preview11-executor-progress-track"
                  role="progressbar"
                >
                  <span style={{ width: `${projectProgressPercent}%` }} />
                </div>
                <p>
                  Готовность официального списка ·{' '}
                  {requestedCandidatesCount > 0 || isCandidateListSubmitted ? `${projectProgressPercent}%` : '—'}
                </p>
              </div>
              <div className="preview11-executor-progress-summary">
                <div>
                  <span>Нужно подготовить</span>
                  <strong>
                    {requestedCandidatesCount > 0
                      ? isCandidateListSubmitted
                        ? 0
                        : Math.max(0, requestedCandidatesCount - shortlistCandidateCount)
                      : '—'}
                  </strong>
                </div>
                <div>
                  <span>Выбрано заказчиком</span>
                  <strong>
                    {stageCounts.selected}
                    {requestedCandidatesCount > 0 ? ` из ${requestedCandidatesCount}` : ''}
                  </strong>
                </div>
              </div>
            </div>

            <Tabs
              className="preview11-executor-project-sections"
              onValueChange={handleProjectTabChange}
              value={projectTab}
            >
              <TabsList aria-label="Разделы проекта" className="preview11-executor-project-tabs">
                <TabsTrigger value="candidates">Кандидаты</TabsTrigger>
                <TabsTrigger value="responses">Отклики</TabsTrigger>
                <TabsTrigger value="requirements">Требования вакансии</TabsTrigger>
                <TabsTrigger value="vacancy">Моя вакансия</TabsTrigger>
                <TabsTrigger value="history">История</TabsTrigger>
                <TabsTrigger value="documents">Документы</TabsTrigger>
                <TabsTrigger value="payment">Оплата</TabsTrigger>
              </TabsList>

              <TabsContent
                className="preview11-executor-project-tab-panel"
                value={projectTab === 'responses' ? 'responses' : 'candidates'}
              >
                <Card className="preview11-executor-card">
                  <CardHeader
                    className={`preview11-executor-card-header preview11-executor-candidate-header${
                      candidateList === 'responses' ? '' : ' preview11-executor-candidate-header-list'
                    }`}
                  >
                    <div className="preview11-executor-candidate-heading">
                      <div>
                        <CardTitle className="text-base">
                          {candidateList === 'responses'
                            ? 'Отклики соискателей'
                            : candidateList === 'submitted'
                              ? 'Список кандидатов проекта'
                              : 'Кандидаты проекта'}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {candidateList === 'responses'
                            ? `${responseCandidates.length} откликов по вакансии`
                            : `${requestedCandidateCountLabel(orderCandidates.length)} · в списке кандидатов ${officialListCount} из ${requestedCandidatesCount || '—'}`}
                        </p>
                      </div>
                      {candidateList !== 'responses' ? (
                        <div className="preview11-executor-candidate-toolbar">
                          <Button
                            aria-label="Управлять списком"
                            aria-pressed={candidateList === 'working' && stageFilter === 'shortlist'}
                            className="h-9 w-9 rounded-lg p-0"
                            onClick={() => {
                              const nextStageFilter =
                                candidateList === 'submitted' || stageFilter !== 'shortlist' ? 'shortlist' : 'all'
                              if (candidateList !== 'working') handleCandidateListChange('working')
                              setStageFilter(nextStageFilter)
                            }}
                            title="Управлять списком"
                            type="button"
                            variant="outline"
                          >
                            <ListChecks aria-hidden="true" size={16} />
                          </Button>
                          <details className="preview11-executor-candidate-filters">
                            <summary aria-label="Фильтры списка кандидатов" title="Фильтры списка кандидатов">
                              <SlidersHorizontal aria-hidden="true" size={15} />
                              <span className="sr-only">Фильтры</span>
                            </summary>
                            <div className="preview11-executor-candidate-filter-menu">
                              <div className="preview11-executor-list-switch" role="group" aria-label="Список кандидатов">
                                <button
                                  aria-pressed={candidateList === 'working'}
                                  onClick={() => handleCandidateListChange('working')}
                                  type="button"
                                >
                                  Рабочий список <span>{workingCandidates.length}</span>
                                </button>
                                <button
                                  aria-pressed={candidateList === 'submitted'}
                                  onClick={() => handleCandidateListChange('submitted')}
                                  type="button"
                                >
                                  Отправлены заказчику <span>{submittedCandidates.length}</span>
                                </button>
                              </div>
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
                            </div>
                          </details>
                          {viewProps.canCreateCandidateFromOrder && viewProps.onCreateCandidateFromOrder ? (
                            <Button
                              className="h-9 rounded-lg px-3 text-xs"
                              onClick={() => viewProps.onCreateCandidateFromOrder?.(selectedOrder.id)}
                              type="button"
                            >
                              <span aria-hidden="true">+</span> Добавить кандидата
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <span className="preview11-executor-submission-state">Откликов: {responseCandidates.length}</span>
                      )}
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
                    ) : null}
                    {candidateList !== 'responses' && requestedCandidatesCount > 0 ? (
                      <div
                        aria-label="Готовность списка кандидатов"
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={projectProgressPercent}
                        className="preview11-executor-candidate-progress"
                        role="progressbar"
                      >
                        <span style={{ width: `${projectProgressPercent}%` }} />
                      </div>
                    ) : null}
                  </CardHeader>
                  <CardContent className="preview11-executor-card-content preview11-executor-candidate-content">
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
                      <div className="preview11-executor-candidate-rows">
                        {filteredCandidates.map((candidate) => {
                          const stage = candidateStage(candidate)
                          const nextStage = stage === 'pool' ? 'Shortlist' : stage === 'shortlist' ? 'Pool' : null
                          const experienceYears = formatExperienceYears(candidate.experienceYears)
                          const experienceDetails =
                            candidate.experienceSummary?.trim() || candidate.position || candidate.vacancyTitle
                          const description = [
                            experienceYears !== '—' ? experienceYears : null,
                            experienceDetails,
                            candidate.source || null,
                          ].filter((value): value is string => Boolean(value)).join(' · ')

                          return (
                            <div className="preview11-executor-candidate-row" key={`${candidate.orderId}:${candidate.id}`}>
                              <div className="preview11-executor-candidate-main">
                                <div className="preview11-executor-candidate-name-line">
                                  <button
                                    type="button"
                                    className="preview11-executor-candidate-name"
                                    onClick={() => viewProps.onOpenCandidate(candidate)}
                                  >
                                    {candidate.name}
                                  </button>
                                  <span className={`preview11-executor-candidate-tag preview11-executor-candidate-tag-${stage ?? 'pool'}`}>
                                    {candidate.statusLabel}
                                  </span>
                                </div>
                                <p className="preview11-executor-candidate-description">
                                  {description || 'Опыт не указан'}
                                </p>
                                {candidate.isAnonymized ? (
                                  <span className="preview11-executor-candidate-anonymized">Контакты скрыты</span>
                                ) : null}
                              </div>
                              <div className="preview11-executor-candidate-row-actions">
                                <Button
                                  className="preview11-executor-profile-action"
                                  onClick={() => viewProps.onOpenCandidate(candidate)}
                                  type="button"
                                  variant="outline"
                                >
                                  Профиль
                                </Button>
                                {stage === 'selected' ? (
                                  <span className="preview11-executor-candidate-status-note">Финалист выбран</span>
                                ) : candidate.isCustomerSubmitted ? (
                                  <span className="preview11-executor-candidate-status-note">Отправлен заказчику</span>
                                ) : selectedOrder.isArchived || viewProps.dashboardState === 'archive' ? (
                                  <span className="preview11-executor-candidate-status-note">Только просмотр</span>
                                ) : isCandidateListSubmitted ? (
                                  <span className="preview11-executor-candidate-status-note">Список отправлен заказчику</span>
                                ) : nextStage && viewProps.onSetCandidateStage ? (
                                  <button
                                    type="button"
                                    aria-label={
                                      nextStage === 'Shortlist'
                                        ? `Добавить ${candidate.name} в список кандидатов`
                                        : `Вернуть ${candidate.name} в рабочий список`
                                    }
                                    disabled={viewProps.isUpdatingCandidateStage}
                                    onClick={() =>
                                      void viewProps.onSetCandidateStage?.(
                                        selectedOrder.id,
                                        candidate.id,
                                        nextStage,
                                      )
                                    }
                                    className="preview11-executor-candidate-action"
                                  >
                                    {nextStage === 'Shortlist' ? 'В список кандидатов' : 'Убрать'}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {candidateList === 'working' ? (
                      <div className="preview11-executor-candidate-submit">
                        {isCandidateListSubmitted ? (
                          <p role="status">Список кандидатов официально отправлен заказчику.</p>
                        ) : (
                          <>
                            <Button
                              className="h-9 rounded-lg"
                              disabled={!canSubmitCandidateList || Boolean(viewProps.isSubmittingCandidateList)}
                              onClick={() => setIsSubmitCandidateListOpen(true)}
                              type="button"
                            >
                              {viewProps.isSubmittingCandidateList
                                ? 'Отправляем…'
                                : `Отправить полный список кандидатов (${shortlistCandidateCount}/${minimumCandidateCount})`}
                            </Button>
                            <span>
                              {vacancyPreview?.status !== 'Published'
                                ? 'Отправка доступна после публикации вакансии'
                                : `Отправка доступна только при полном составе (${shortlistCandidateCount}/${minimumCandidateCount})`}
                            </span>
                          </>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <div className="preview11-executor-privacy-note">
                  <LockKeyhole size={17} aria-hidden="true" />
                  <p>Контактные данные кандидатов отображаются только там, где это разрешено для проекта.</p>
                </div>
              </TabsContent>

              <TabsContent className="preview11-executor-project-tab-panel" value="requirements">
                <div className="preview11-executor-requirements-note">
                  Исходные требования заказчика. Описание для публикации находится отдельно во вкладке «Моя вакансия».
                </div>
                <div className="preview11-executor-requirements-grid">
                  <Card className="preview11-executor-card preview11-executor-requirement-card">
                    <CardHeader className="preview11-executor-card-header preview11-executor-requirement-header">
                      <CardTitle className="text-base">О вакансии</CardTitle>
                      <Badge>Основное</Badge>
                    </CardHeader>
                    <CardContent className="preview11-executor-requirements">
                      <dl className="preview11-executor-requirement-fields">
                        {projectOverviewFields.map((field) => (
                          <div key={field.label}>
                            <dt>{field.label}</dt>
                            <dd>{field.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </CardContent>
                  </Card>

                  <Card className="preview11-executor-card preview11-executor-requirement-card">
                    <CardHeader className="preview11-executor-card-header preview11-executor-requirement-header">
                      <CardTitle className="text-base">Условия и мотивация</CardTitle>
                    </CardHeader>
                    <CardContent className="preview11-executor-requirements">
                      <dl className="preview11-executor-requirement-fields">
                        {projectConditionFields.map((field) => (
                          <div key={field.label}>
                            <dt>{field.label}</dt>
                            <dd>{field.value}</dd>
                          </div>
                        ))}
                      </dl>
                      {otherConditionsText ? (
                        <div className="preview11-executor-requirement-copy">
                          <h3>Дополнительные условия</h3>
                          <p>{otherConditionsText}</p>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Card className="preview11-executor-card preview11-executor-requirement-card">
                    <CardHeader className="preview11-executor-card-header preview11-executor-requirement-header">
                      <CardTitle className="text-base">Функционал</CardTitle>
                    </CardHeader>
                    <CardContent className="preview11-executor-requirements">
                      <div className="preview11-executor-requirement-copy">
                        <p>{functionalText || 'Функционал в заказе не указан.'}</p>
                      </div>
                      {vacancyDescriptionText ? (
                        <div className="preview11-executor-requirement-copy">
                          <h3>Описание опубликованной вакансии · {vacancyPreview?.title || 'без названия'}</h3>
                          <p>{vacancyDescriptionText}</p>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Card className="preview11-executor-card preview11-executor-requirement-card">
                    <CardHeader className="preview11-executor-card-header preview11-executor-requirement-header">
                      <CardTitle className="text-base">Требования</CardTitle>
                    </CardHeader>
                    <CardContent className="preview11-executor-requirements">
                      <div className="preview11-executor-requirement-copy">
                        <p>{requirementsText || 'Требования в заказе не указаны.'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent className="preview11-executor-project-tab-panel" value="vacancy">
                <Card className="preview11-executor-card">
                  <CardHeader className="preview11-executor-card-header">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle className="text-base">Вакансия проекта</CardTitle>
                      <Badge variant={vacancyPreview ? workspaceToneToBadgeVariant(vacancyPreview.status === 'Published' ? 'success' : 'warning') : 'neutral'}>
                        {vacancyPreview ? vacancyStatusLabel(vacancyPreview.status) : 'Не создана'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm">
                    {vacancyPreview ? (
                      <>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Название</p>
                          <p className="mt-1 font-medium text-foreground">{vacancyPreview.title || selectedOrder.title}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Описание</p>
                          <p className="mt-1 whitespace-pre-wrap leading-6 text-foreground">
                            {vacancyDescriptionText || 'Описание пока не заполнено.'}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Обновлено {new Date(vacancyPreview.updatedAtUtc).toLocaleString('ru-RU')}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground" role="status">
                        Для проекта пока нет данных вакансии.
                      </p>
                    )}
                    {viewProps.canCreateVacancyFromOrder && viewProps.onCreateVacancyFromOrder ? (
                      <div>
                        <Button
                          className="h-9 rounded-lg"
                          onClick={() => viewProps.onCreateVacancyFromOrder?.(selectedOrder.id)}
                          type="button"
                        >
                          {vacancyPreview?.status === 'Draft' ? 'Продолжить черновик' : 'Создать вакансию'}
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="preview11-executor-project-tab-panel" value="history">
                <Card className="preview11-executor-card">
                  <CardHeader className="preview11-executor-card-header preview11-executor-aside-title">
                    <History size={17} aria-hidden="true" />
                    <CardTitle className="text-base">История проекта</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {historyQuery.isLoading ? <p role="status">Загружаем историю проекта…</p> : null}
                    {historyQuery.isError ? (
                      <div className="grid gap-2 text-sm" role="alert">
                        <p>Не удалось загрузить историю проекта.</p>
                        <Button className="w-fit" onClick={() => void historyQuery.refetch()} type="button" variant="outline">
                          Повторить
                        </Button>
                      </div>
                    ) : null}
                    {!historyQuery.isLoading && !historyQuery.isError && historyQuery.data?.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground" role="status">Событий по проекту пока нет.</p>
                    ) : null}
                    {historyQuery.data?.items.map((activity) => (
                      <div className="flex gap-3 border-b border-border pb-3 last:border-0" key={activity.id}>
                        <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <div className="grid gap-1">
                          <p className="text-sm text-foreground">{activity.description}</p>
                          <time className="text-xs text-muted-foreground" dateTime={activity.createdAtUtc}>
                            {new Date(activity.createdAtUtc).toLocaleString('ru-RU')}
                          </time>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="preview11-executor-project-tab-panel" value="documents">
                <Card className="preview11-executor-card">
                  <CardHeader className="preview11-executor-card-header preview11-executor-aside-title">
                    <FileText size={17} aria-hidden="true" />
                    <CardTitle className="text-base">Документы проекта</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {viewProps.role === 'Executor' && !isProjectCompleted ? (
                      <form className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" onSubmit={handleDocumentUpload}>
                        <Label className="grid gap-1 text-xs font-medium text-muted-foreground">
                          Добавить документ
                          <Input
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.jpg,.jpeg,.png"
                            aria-label="Файл проекта"
                            onChange={(event) => setSelectedDocumentFile(event.target.files?.[0] ?? null)}
                            type="file"
                          />
                        </Label>
                        <Button disabled={!selectedDocumentFile || isUploadingDocument} type="submit">
                          {isUploadingDocument ? 'Загрузка…' : 'Загрузить'}
                        </Button>
                        <p className="text-xs text-muted-foreground sm:col-span-2">PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, RTF, JPG, PNG · до 25 МБ</p>
                      </form>
                    ) : null}
                    {projectWorkspaceFeedback && projectTab === 'documents' ? (
                      <p className="text-sm text-muted-foreground" role="status">{projectWorkspaceFeedback}</p>
                    ) : null}
                    {documentsQuery.isLoading ? <p role="status">Загружаем документы проекта…</p> : null}
                    {documentsQuery.isError ? (
                      <div className="grid gap-2 text-sm" role="alert">
                        <p>Не удалось загрузить документы проекта.</p>
                        <Button className="w-fit" onClick={() => void documentsQuery.refetch()} type="button" variant="outline">
                          Повторить
                        </Button>
                      </div>
                    ) : null}
                    {!documentsQuery.isLoading && !documentsQuery.isError && documentsQuery.data?.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground" role="status">Документы к проекту пока не добавлены.</p>
                    ) : null}
                    {documentsQuery.data?.items.map((file) => (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3" key={file.id}>
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText aria-hidden="true" className="shrink-0 text-muted-foreground" size={17} />
                          <div className="min-w-0">
                            <strong className="block truncate text-sm text-foreground">{file.fileName}</strong>
                            <span className="text-xs text-muted-foreground">
                              {formatDocumentSize(file.length)} · {new Date(file.createdAtUtc).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                        <Button
                          disabled={isDownloadingDocument}
                          onClick={() => void handleDocumentDownload(file.id, file.fileName)}
                          type="button"
                          variant="outline"
                        >
                          Скачать
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="preview11-executor-project-tab-panel" value="payment">
                <Card className="preview11-executor-card">
                  <CardHeader className="preview11-executor-card-header">
                    <CardTitle className="text-base">Расчёты по проекту</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">К получению</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{formatAmount(selectedOrder.executorNetAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Зарплата сотрудника</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{orderCompensation(selectedOrder)}</p>
                    </div>
                    <p className="text-muted-foreground sm:col-span-2" role="status">
                      Статусы и детализация выплат по проекту здесь пока не отображаются.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="preview11-executor-no-project" role="status">
            <h1>Выберите проект</h1>
            <p>Выберите проект слева, чтобы открыть этапы, условия и кандидатов.</p>
          </div>
        )}
      </section>
      )}
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
      <Modal
        description="Укажите плановую дату завершения проекта."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => handleDueDateModalOpenChange(false)}
              type="button"
              variant="outline"
            >
              Отмена
            </Button>
            {selectedOrder?.dueDate ? (
              <Button
                disabled={isSettingDueDate || isClearingDueDate}
                onClick={() => void handleDueDateClear()}
                type="button"
                variant="ghost"
              >
                Удалить срок
              </Button>
            ) : null}
            <Button
              disabled={!dueDateDraft || isSettingDueDate || isClearingDueDate}
              form="executor-project-due-date-form"
              type="submit"
            >
              {isSettingDueDate ? 'Сохраняем…' : 'Сохранить срок'}
            </Button>
          </div>
        }
        onOpenChange={handleDueDateModalOpenChange}
        open={isDueDateModalOpen && canManageDueDate}
        title="Срок сдачи проекта"
      >
        <form
          className="grid gap-3"
          id="executor-project-due-date-form"
          onSubmit={handleDueDateSubmit}
        >
          <Label className="grid gap-1 text-sm" htmlFor="executor-project-due-date">
            Плановая дата завершения
            <Input
              id="executor-project-due-date"
              onChange={(event) => setDueDateDraft(event.target.value)}
              type="date"
              value={dueDateDraft}
            />
          </Label>
          {dueDateFeedback ? (
            <p className="text-sm text-muted-foreground" role="status">{dueDateFeedback}</p>
          ) : null}
        </form>
      </Modal>
      <Modal
        description="После отправки состав официального списка кандидатов зафиксируется для этого проекта."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              disabled={Boolean(viewProps.isSubmittingCandidateList)}
              onClick={() => setIsSubmitCandidateListOpen(false)}
              type="button"
              variant="outline"
            >
              Отмена
            </Button>
            <Button
              disabled={!canSubmitCandidateList || Boolean(viewProps.isSubmittingCandidateList)}
              onClick={async () => {
                if (!selectedOrder || !viewProps.onSubmitCandidateListForOrder) return
                const didSubmit = await viewProps.onSubmitCandidateListForOrder(selectedOrder.id)
                if (didSubmit) setIsSubmitCandidateListOpen(false)
              }}
              type="button"
            >
              {viewProps.isSubmittingCandidateList ? 'Отправляем…' : 'Подтвердить отправку'}
            </Button>
          </div>
        }
        onOpenChange={setIsSubmitCandidateListOpen}
        open={isSubmitCandidateListOpen}
        title="Отправить список кандидатов заказчику?"
      >
        <p className="text-sm text-muted-foreground">
          К отправке подготовлено: {shortlistCandidateCount} · Минимум: {minimumCandidateCount}.
        </p>
      </Modal>
    </div>
  )
}
