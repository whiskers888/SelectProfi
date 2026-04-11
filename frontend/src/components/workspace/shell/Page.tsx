import { skipToken } from '@reduxjs/toolkit/query'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
import '../styles/shell.css'
import { CalendarPanel } from '../panels/CalendarPanel'
import { MainFeedPanel } from '../panels/MainFeedPanel'
import { PipelinePanel } from '../panels/PipelinePanel'
import { StatsGrid } from '../panels/StatsGrid'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useGetMyAuthInfoQuery } from '@/shared/api/auth'
import {
  useGetVacancyCandidatesQuery,
  useMarkVacancyCandidateViewedByCustomerMutation,
  type VacancyCandidatesItemResponse,
} from '@/shared/api/candidates'
import {
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderMutation,
  type OrderStatusContract,
  type OrderResponse,
} from '@/shared/api/orders'
import { useGetVacanciesQuery, type VacancyResponse } from '@/shared/api/vacancies'
import {
  useGetMyProfileQuery,
  useSwitchMyActiveRoleMutation,
  type UserRole,
} from '@/shared/api/profile'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { RoleSwitch } from '../navigation/RoleSwitch'
import {
  defaultWorkspaceRole,
  defaultWorkspaceView,
  workspaceDataByRole,
  workspaceToneToBadgeVariant,
  type WorkspaceCandidate,
  type WorkspaceChatThread,
  type WorkspaceOrder,
  type WorkspaceRole,
  type WorkspaceView,
} from '../model/data'

type PageBanner = {
  message: string
  variant: 'default' | 'success' | 'destructive'
}

type ProblemDetailsPayload = {
  detail?: string
  title?: string
}

type OrderFilter = 'all' | 'active' | 'paused'

function createHeaderTitle(role: WorkspaceRole): string {
  if (role === 'Executor') {
    return 'Проекты и кандидаты'
  }

  if (role === 'Applicant') {
    return 'Отклики и коммуникации'
  }

  return 'Заказы и отклики'
}

function createActionLabel(role: WorkspaceRole): string {
  if (role === 'Executor') {
    return 'Добавить кандидата'
  }

  if (role === 'Applicant') {
    return 'Добавить отклик'
  }

  return 'Создать заказ'
}

function todayTimeLabel(): string {
  return new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toWorkspaceRole(role: UserRole | null | undefined): WorkspaceRole | null {
  if (role === 'Customer' || role === 'Executor' || role === 'Applicant') {
    return role
  }

  return null
}

function toAvailableWorkspaceRoles(roles: UserRole[] | undefined, fallbackRole: WorkspaceRole): WorkspaceRole[] {
  if (!roles || roles.length === 0) {
    return [fallbackRole]
  }

  const mappedRoles = roles
    .map((role) => toWorkspaceRole(role))
    .filter((role): role is WorkspaceRole => role !== null)

  if (mappedRoles.length === 0) {
    return [fallbackRole]
  }

  return Array.from(new Set(mappedRoles))
}

function toRoleLabel(role: WorkspaceRole): string {
  if (role === 'Applicant') {
    return 'Соискатель'
  }

  if (role === 'Executor') {
    return 'Исполнитель'
  }

  return 'Заказчик'
}

function toOrderCompanyLabel(description: string): string {
  const normalizedDescription = description.trim()
  if (!normalizedDescription) {
    return 'Компания не указана'
  }

  return normalizedDescription.length > 64
    ? `${normalizedDescription.slice(0, 61)}...`
    : normalizedDescription
}

function toOrderUpdatedAtLabel(updatedAtUtc: string): string {
  const parsedDate = new Date(updatedAtUtc)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Обновлено недавно'
  }

  return `Обновлено ${parsedDate.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

function toWorkspaceOrder(order: OrderResponse): WorkspaceOrder {
  const isArchived = Boolean(order.deletedAtUtc)
  const isPaused = order.status === 'Paused'
  const hasExecutor = Boolean(order.executorId)

  return {
    id: order.id,
    title: order.title,
    company: toOrderCompanyLabel(order.description),
    location: 'Локация не указана',
    priority: hasExecutor ? 'medium' : 'high',
    responses: 0,
    statusLabel: isArchived
      ? 'Архив'
      : isPaused
        ? 'На паузе'
        : hasExecutor
          ? 'Исполнитель назначен'
          : 'Ожидает назначения',
    statusTone: isArchived ? 'neutral' : isPaused ? 'danger' : hasExecutor ? 'success' : 'warning',
    updatedAt: toOrderUpdatedAtLabel(order.updatedAtUtc),
    isArchived,
    isPaused,
  }
}

function toCandidateStatusLabel(stage: VacancyCandidatesItemResponse['stage'], isSelected: boolean): string {
  if (isSelected) {
    return 'Выбран'
  }

  return stage === 'Shortlist' ? 'Shortlist' : 'Pool'
}

function toCandidateStatusTone(
  stage: VacancyCandidatesItemResponse['stage'],
  isSelected: boolean,
): WorkspaceCandidate['statusTone'] {
  if (isSelected) {
    return 'success'
  }

  return stage === 'Shortlist' ? 'default' : 'warning'
}

function toWorkspaceCandidate(
  item: VacancyCandidatesItemResponse,
  vacancy: VacancyResponse,
): WorkspaceCandidate {
  return {
    id: item.candidateId,
    name: item.publicAlias,
    position: vacancy.title,
    orderId: vacancy.orderId,
    source: `Vacancy ${vacancy.id.slice(0, 8)}`,
    rating: '—',
    statusLabel: toCandidateStatusLabel(item.stage, item.isSelected),
    statusTone: toCandidateStatusTone(item.stage, item.isSelected),
    comment: `Обновлено ${new Date(item.updatedAtUtc).toLocaleString('ru-RU')}`,
  }
}

function toSlugPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё-]/g, '')

  return normalized || 'item'
}

function isProblemDetailsPayload(value: unknown): value is ProblemDetailsPayload {
  return typeof value === 'object' && value !== null
}

function getRequestErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return 'Не удалось выполнить запрос.'
  }

  const apiError = error as { status: number | string; data?: unknown }
  if (apiError.status === 'FETCH_ERROR') {
    return 'Не удалось установить соединение с сервером.'
  }

  if (apiError.status === 401) {
    return 'Требуется авторизация.'
  }

  if (typeof apiError.status === 'number' && isProblemDetailsPayload(apiError.data)) {
    return apiError.data.detail ?? apiError.data.title ?? 'Не удалось выполнить запрос.'
  }

  return 'Не удалось выполнить запрос.'
}

export function ShellPage() {
  const navigate = useNavigate()
  const { data: profile, isFetching: isProfileFetching, refetch: refetchProfile } = useGetMyProfileQuery()
  const { data: authMe } = useGetMyAuthInfoQuery()
  const [switchMyActiveRole, { isLoading: isRoleSwitching }] = useSwitchMyActiveRoleMutation()
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()
  const [updateOrder, { isLoading: isOrderStatusUpdating }] = useUpdateOrderMutation()
  const [deleteOrder, { isLoading: isDeletingOrder }] = useDeleteOrderMutation()
  const [markVacancyCandidateViewedByCustomer] = useMarkVacancyCandidateViewedByCustomerMutation()
  const [preferredOrderId, setPreferredOrderId] = useState<string | null>(null)
  // @dvnull: Раньше роль бралась из query-параметра, теперь primary source — профиль с бэкенда.
  const role = toWorkspaceRole(profile?.activeRole ?? profile?.role) ?? defaultWorkspaceRole
  const availableRoles = toAvailableWorkspaceRoles(profile?.roles, role)
  const canSwitchRole = availableRoles.includes('Applicant') && availableRoles.includes('Executor')
  const profileDisplayName =
    `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || authMe?.email || 'Пользователь'
  const profileEmail = profile?.email ?? authMe?.email ?? '—'
  const profileRoleLabel = toRoleLabel(role)
  const canManageOrder = authMe?.role === 'Customer' || authMe?.role === 'Admin'
  const dataset = workspaceDataByRole[role]
  // @dvnull: Ранее список заказов в рабочем пространстве формировался только из локального датасета, теперь источник — /api/orders с fallback.
  const canLoadServerOrders = role !== 'Applicant'
  const {
    data: ordersResponse,
    isError: isOrdersError,
    isFetching: isOrdersFetching,
    refetch: refetchOrders,
  } = useGetOrdersQuery(
    canLoadServerOrders
      ? {
          // @dvnull: Для вкладки "Архив" запрашиваем и soft-deleted заказы, которые раньше скрывались на уровне API.
          includeArchived: true,
        }
      : skipToken,
  )
  const serverOrders = ordersResponse?.items.map(toWorkspaceOrder) ?? []
  const baseOrders =
    canLoadServerOrders && ordersResponse ? serverOrders : dataset.orders
  const candidateScopeOrderId =
    baseOrders.find((order) => order.id === preferredOrderId && !order.isArchived)?.id ??
    baseOrders.find((order) => !order.isArchived)?.id ??
    baseOrders.find((order) => order.id === preferredOrderId)?.id ??
    baseOrders[0]?.id ??
    null
  // @dvnull: Ранее кандидаты подгружались по первой вакансии из списка; теперь источник кандидатов привязан к выбранному заказу.
  const canLoadServerCandidates = role !== 'Applicant'
  const { data: vacanciesResponse } = useGetVacanciesQuery(canLoadServerCandidates ? undefined : skipToken)
  const candidateSourceVacancy =
    candidateScopeOrderId && vacanciesResponse
      ? vacanciesResponse.items.find((vacancy) => vacancy.orderId === candidateScopeOrderId) ?? null
      : null
  const {
    data: vacancyCandidatesResponse,
    isError: isVacancyCandidatesError,
    isFetching: isVacancyCandidatesFetching,
    refetch: refetchVacancyCandidates,
  } = useGetVacancyCandidatesQuery(
    canLoadServerCandidates && candidateSourceVacancy
      ? { vacancyId: candidateSourceVacancy.id }
      : skipToken,
  )

  const [activeView, setActiveView] = useState<WorkspaceView>(defaultWorkspaceView)
  const [searchValue, setSearchValue] = useState('')
  const [orderFilter] = useState<OrderFilter>('all')
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [banner, setBanner] = useState<PageBanner | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WorkspaceOrder | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<WorkspaceCandidate | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [preferredChatId, setPreferredChatId] = useState<string | null>(null)

  const [threadsByRole, setThreadsByRole] = useState<Record<WorkspaceRole, WorkspaceChatThread[]>>({
    Customer: workspaceDataByRole.Customer.chats,
    Executor: workspaceDataByRole.Executor.chats,
    Applicant: workspaceDataByRole.Applicant.chats,
  })
  const [manualCandidatesByRole, setManualCandidatesByRole] = useState<
    Record<WorkspaceRole, WorkspaceCandidate[]>
  >({
    Customer: [],
    Executor: [],
    Applicant: [],
  })
  const [analyticsRecoveredByRole, setAnalyticsRecoveredByRole] = useState<
    Record<WorkspaceRole, boolean>
  >({
    Customer: false,
    Executor: false,
    Applicant: false,
  })

  const transitionTimeoutRef = useRef<number | null>(null)
  const viewedCandidateRequestKeyRef = useRef<string | null>(null)

  useEffect(
    () => () => {
      if (!transitionTimeoutRef.current) {
        return
      }
      window.clearTimeout(transitionTimeoutRef.current)
    },
    [],
  )

  // @dvnull: Добавлена автопометка просмотра профиля кандидата заказчиком при открытии модалки, чтобы считать только новые профили.
  useEffect(() => {
    if (!banner) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setBanner(null)
    }, 3200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [banner])

  useEffect(() => {
    if (role !== 'Customer' || !selectedCandidate || !vacanciesResponse || !vacancyCandidatesResponse) {
      viewedCandidateRequestKeyRef.current = null
      return
    }

    const vacancyForCandidate =
      vacanciesResponse.items.find((vacancy) => vacancy.orderId === selectedCandidate.orderId) ?? null
    if (!vacancyForCandidate || vacancyForCandidate.id !== candidateSourceVacancy?.id) {
      return
    }

    const vacancyCandidate = vacancyCandidatesResponse.items.find(
      (item) => item.candidateId === selectedCandidate.id,
    )
    if (!vacancyCandidate || vacancyCandidate.viewedByCustomerAtUtc) {
      return
    }

    const requestKey = `${vacancyForCandidate.id}:${selectedCandidate.id}`
    if (viewedCandidateRequestKeyRef.current === requestKey) {
      return
    }

    viewedCandidateRequestKeyRef.current = requestKey
    void markVacancyCandidateViewedByCustomer({
      vacancyId: vacancyForCandidate.id,
      candidateId: selectedCandidate.id,
    })
      .unwrap()
      .then(() => {
        void refetchVacancyCandidates()
      })
      .catch(() => {
        viewedCandidateRequestKeyRef.current = null
      })
  }, [
    candidateSourceVacancy?.id,
    markVacancyCandidateViewedByCustomer,
    refetchVacancyCandidates,
    role,
    selectedCandidate,
    vacanciesResponse,
    vacancyCandidatesResponse,
  ])

  function startViewTransition() {
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current)
    }

    setIsViewLoading(true)
    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsViewLoading(false)
      transitionTimeoutRef.current = null
    }, 280)
  }

  const threads = threadsByRole[role]
  const manualCandidates = manualCandidatesByRole[role]
  const analyticsError = analyticsRecoveredByRole[role] ? null : dataset.analyticsError ?? null
  const serverCandidates =
    candidateSourceVacancy && vacancyCandidatesResponse
      ? vacancyCandidatesResponse.items.map((item) => toWorkspaceCandidate(item, candidateSourceVacancy))
      : []
  const baseCandidates =
    !canLoadServerCandidates
      ? dataset.candidates
      : !vacanciesResponse
        ? dataset.candidates
        : !candidateSourceVacancy
          ? []
          : vacancyCandidatesResponse
            ? serverCandidates
            : isVacancyCandidatesError
              ? dataset.candidates
              : []
  const isOrdersApiLoading = canLoadServerOrders && !ordersResponse && isOrdersFetching
  const isCandidatesApiLoading =
    canLoadServerCandidates && !vacancyCandidatesResponse && isVacancyCandidatesFetching

  const allOrders = baseOrders
  const allCandidates = [...manualCandidates, ...baseCandidates]
  const normalizedSearch = searchValue.trim().toLowerCase()

  const filteredOrders = allOrders.filter((order) => {
    if (activeView !== 'dashboard' && order.isArchived) {
      return false
    }

    const matchesFilter =
      orderFilter === 'all' ||
      (orderFilter === 'active' && order.statusTone !== 'danger') ||
      (orderFilter === 'paused' && order.statusTone === 'danger')

    if (!matchesFilter) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    return (
      order.title.toLowerCase().includes(normalizedSearch) ||
      order.company.toLowerCase().includes(normalizedSearch) ||
      order.location.toLowerCase().includes(normalizedSearch)
    )
  })

  const orderTitleById = new Map(allOrders.map((order) => [order.id, order.title]))

  const filteredCandidates = allCandidates.filter((candidate) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      candidate.name.toLowerCase().includes(normalizedSearch) ||
      candidate.position.toLowerCase().includes(normalizedSearch) ||
      candidate.source.toLowerCase().includes(normalizedSearch) ||
      (orderTitleById.get(candidate.orderId) ?? '').toLowerCase().includes(normalizedSearch)
    )
  })

  const selectedOrderId =
    filteredOrders.find((order) => order.id === preferredOrderId)?.id ??
    filteredOrders[0]?.id ??
    null
  const candidateViewOrders = allOrders.filter((order) => !order.isArchived)
  const candidateViewSelectedOrderId =
    candidateViewOrders.find((order) => order.id === preferredOrderId)?.id ??
    candidateViewOrders[0]?.id ??
    null

  const filteredThreads = threads.filter((thread) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      thread.participant.toLowerCase().includes(normalizedSearch) ||
      thread.preview.toLowerCase().includes(normalizedSearch)
    )
  })

  const activeThread =
    filteredThreads.find((thread) => thread.id === preferredChatId) ?? filteredThreads[0] ?? null
  // @dvnull: Счетчик раздела "Кандидаты" для заказчика переключен на количество непросмотренных кандидатов по выбранному заказу.
  const candidatesCounter =
    role === 'Customer' && candidateSourceVacancy && vacancyCandidatesResponse
      ? vacancyCandidatesResponse.items.filter((item) => !item.viewedByCustomerAtUtc).length
      : filteredCandidates.length

  const counters: Partial<Record<WorkspaceView, number>> = {
    dashboard: dataset.meetings.length,
    orders: filteredOrders.length,
    candidates: candidatesCounter,
    meetings: dataset.meetings.length,
    chats: filteredThreads.reduce((sum, thread) => sum + thread.unread, 0),
  }

  function handleViewChange(nextView: WorkspaceView) {
    setActiveView(nextView)
    startViewTransition()
  }

  async function handleRoleChange(nextRole: WorkspaceRole) {
    if (nextRole === role) {
      return
    }

    if (!canSwitchRole || !availableRoles.includes(nextRole)) {
      setBanner({
        variant: 'destructive',
        message: 'Эта роль недоступна для текущего профиля.',
      })
      return
    }

    try {
      await switchMyActiveRole({ activeRole: nextRole }).unwrap()
      setBanner({
        variant: 'success',
        message: `Активная роль изменена на «${nextRole === 'Applicant' ? 'Соискатель' : 'Исполнитель'}».`,
      })
      void refetchProfile()
    } catch {
      setBanner({
        variant: 'destructive',
        message: 'Не удалось переключить роль. Повторите попытку.',
      })
    }
  }

  function handleSendMessage() {
    if (!activeThread) {
      setBanner({
        variant: 'destructive',
        message: 'Откройте чат, чтобы отправить сообщение.',
      })
      return
    }

    const messageText = chatDraft.trim()
    if (!messageText) {
      setBanner({
        variant: 'destructive',
        message: 'Введите текст сообщения.',
      })
      return
    }

    setThreadsByRole((previousThreadsByRole) => ({
      ...previousThreadsByRole,
      [role]: previousThreadsByRole[role].map((thread) =>
        thread.id !== activeThread.id
          ? thread
          : {
              ...thread,
              preview: messageText,
              unread: 0,
              messages: [
                ...thread.messages,
                {
                  id: `msg-${Date.now()}`,
                  author: 'me',
                  text: messageText,
                  time: todayTimeLabel(),
                },
              ],
            },
      ),
    }))

    setChatDraft('')
    setBanner({
      variant: 'success',
      message: 'Сообщение отправлено.',
    })
  }

  async function handleCreateEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '').trim()
    const organization = String(formData.get('organization') ?? '').trim()
    const note = String(formData.get('note') ?? '').trim()

    if (!title || !organization) {
      setBanner({
        variant: 'destructive',
        message: 'Заполните обязательные поля формы.',
      })
      return
    }

    if (role === 'Executor') {
      const nextCandidate: WorkspaceCandidate = {
        id: `cand-local-${toSlugPart(title)}-${toSlugPart(organization)}`,
        name: title,
        position: organization,
        source: 'Добавлен вручную',
        rating: '4.6',
        orderId: filteredOrders.find((order) => !order.isArchived)?.id ?? filteredOrders[0]?.id ?? 'local-order',
        statusLabel: 'Новый',
        statusTone: 'warning',
        comment: note || 'Новый профиль добавлен исполнителем.',
      }

      setManualCandidatesByRole((previousCandidatesByRole) => ({
        ...previousCandidatesByRole,
        [role]: [nextCandidate, ...previousCandidatesByRole[role]],
      }))
      setBanner({
        variant: 'success',
        message: 'Кандидат добавлен в рабочий список.',
      })
      setCreateModalOpen(false)
      return
    }

    if (role === 'Applicant') {
      setBanner({
        variant: 'success',
        message: 'Отклик создан. Мы уведомим вас о новом статусе.',
      })
      setCreateModalOpen(false)
      return
    }

    const description = note ? `${organization}. ${note}` : organization

    try {
      // @dvnull: Ранее заказ в рабочем экране создавался только локально через manualOrdersByRole; переведено на POST /api/orders + refetch списка.
      const createdOrder = await createOrder({
        title,
        description,
      }).unwrap()
      setPreferredOrderId(createdOrder.id)
      await refetchOrders()
      setBanner({
        variant: 'success',
        message: 'Заказ создан и сохранен в системе.',
      })
      setCreateModalOpen(false)
    } catch (error) {
      setBanner({
        variant: 'destructive',
        message: getRequestErrorMessage(error),
      })
    }
  }

  async function handleUpdateOrdersStatus(orderIds: string[], status: OrderStatusContract) {
    if (orderIds.length === 0) {
      return
    }

    if (!canManageOrder) {
      setBanner({
        variant: 'destructive',
        message: 'Изменять статус заказа может только заказчик или администратор.',
      })
      return
    }

    const targetLabel = status === 'Paused' ? 'на паузу' : 'в активные'
    const confirmed = window.confirm(`Перевести выбранные заказы (${orderIds.length}) ${targetLabel}?`)
    if (!confirmed) {
      return
    }

    try {
      // @dvnull: Добавлена массовая смена статуса заказа через PATCH, чтобы кнопки "На паузу/Активировать" работали от API.
      const results = await Promise.allSettled(
        orderIds.map(async (orderId) => {
          await updateOrder({
            orderId,
            body: { status },
          }).unwrap()
        }),
      )
      const succeededCount = results.filter((result) => result.status === 'fulfilled').length
      const failedResults = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      )
      await refetchOrders()

      if (failedResults.length === 0) {
        setBanner({
          variant: 'success',
          message:
            succeededCount === 1
              ? `Заказ переведен ${targetLabel}.`
              : `Заказы переведены ${targetLabel}: ${succeededCount}.`,
        })
        return
      }

      const firstErrorMessage = getRequestErrorMessage(failedResults[0].reason)
      setBanner({
        variant: 'destructive',
        message: `Изменение статуса выполнено частично (${succeededCount}/${orderIds.length}). ${firstErrorMessage}`,
      })
    } catch (error) {
      setBanner({
        variant: 'destructive',
        message: getRequestErrorMessage(error),
      })
    }
  }

  async function handlePauseOrders(orderIds: string[]) {
    await handleUpdateOrdersStatus(orderIds, 'Paused')
  }

  async function handleActivateOrders(orderIds: string[]) {
    await handleUpdateOrdersStatus(orderIds, 'Active')
  }

  async function handleArchiveOrders(orderIds: string[]) {
    if (orderIds.length === 0) {
      return
    }

    if (!canManageOrder) {
      setBanner({
        variant: 'destructive',
        message: 'Перемещать заказ в архив может только заказчик или администратор.',
      })
      return
    }

    const confirmed = window.confirm(`Переместить в архив выбранные заказы (${orderIds.length})?`)
    if (!confirmed) {
      return
    }

    try {
      // @dvnull: Удаление из модалки заменено на bulk-архив из dashboard; endpoint DELETE остается, так как на бэке это soft delete.
      const results = await Promise.allSettled(
        orderIds.map(async (orderId) => {
          await deleteOrder(orderId).unwrap()
        }),
      )
      const succeededCount = results.filter((result) => result.status === 'fulfilled').length
      const failedResults = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      )
      await refetchOrders()
      setPreferredOrderId((previousOrderId) =>
        previousOrderId && orderIds.includes(previousOrderId) ? null : previousOrderId,
      )
      setSelectedOrder((previousOrder) =>
        previousOrder && orderIds.includes(previousOrder.id) ? null : previousOrder,
      )
      if (failedResults.length === 0) {
        setBanner({
          variant: 'success',
          message:
            succeededCount === 1
              ? 'Заказ перемещен в архив.'
              : `Заказы перемещены в архив: ${succeededCount}.`,
        })
        return
      }

      const firstErrorMessage = getRequestErrorMessage(failedResults[0].reason)
      setBanner({
        variant: 'destructive',
        message: `Архивирование выполнено частично (${succeededCount}/${orderIds.length}). ${firstErrorMessage}`,
      })
    } catch (error) {
      setBanner({
        variant: 'destructive',
        message: getRequestErrorMessage(error),
      })
    }
  }

  // @dvnull: Ранее shell был привязан к blue-теме; перевел каркас страницы на HTML-эталон customer/executor preview.
  return (
    <div className="preview11-html">
      <div className="preview11-app">
        <Sidebar
          activeView={activeView}
          counters={counters}
          onViewChange={handleViewChange}
          role={role}
        />

        <div className="preview11-main">
          <Header
            activeView={activeView}
            createLabel={createActionLabel(role)}
            meetingsCount={dataset.meetings.length}
            notificationsCount={counters.chats ?? 0}
            onCreateAction={() => setCreateModalOpen(true)}
            onOpenMeetings={() => handleViewChange('meetings')}
            onOpenNotifications={() => handleViewChange('chats')}
            onMenuAction={(action) => {
              if (action === 'orders') {
                navigate(routePaths.orders)
                return
              }

              if (action === 'vacancies') {
                navigate(routePaths.vacancies)
                return
              }

              setBanner({
                variant: action === 'logout' ? 'destructive' : 'default',
                message:
                  action === 'profile'
                    ? 'Профиль откроется в следующей итерации.'
                    : action === 'settings'
                      ? 'Настройки аккаунта скоро будут доступны.'
                      : 'Demo-режим: выход недоступен.',
              })
            }}
            onSearchChange={setSearchValue}
            profileDisplayName={profileDisplayName}
            profileEmail={profileEmail}
            profileRoleLabel={profileRoleLabel}
            searchValue={searchValue}
            subtitle={dataset.headerSubtitle}
            title={createHeaderTitle(role)}
          />

          <main className="preview11-content flex-1 space-y-4">
            {canSwitchRole ? (
              <RoleSwitch
                disabled={isProfileFetching || isRoleSwitching}
                role={role}
                roles={availableRoles}
                onRoleChange={handleRoleChange}
              />
            ) : null}

            {canLoadServerOrders && isOrdersError ? (
              <Alert variant="destructive">
                Не удалось загрузить заказы из API. Временно показаны локальные данные.
              </Alert>
            ) : null}
            {canLoadServerCandidates && isVacancyCandidatesError ? (
              <Alert variant="destructive">
                Не удалось загрузить кандидатов из API. Временно показаны локальные данные.
              </Alert>
            ) : null}

            {banner ? <Alert variant={banner.variant}>{banner.message}</Alert> : null}

            {(activeView === 'dashboard' ||
              activeView === 'orders' ||
              activeView === 'candidates') && (
              <>
                <StatsGrid stats={dataset.stats} />
                <MainFeedPanel
                  candidates={filteredCandidates}
                  canManageOrders={canManageOrder}
                  isLoading={isViewLoading || isOrdersApiLoading || isCandidatesApiLoading}
                  isOrdersArchiving={isDeletingOrder}
                  isOrdersStateUpdating={isOrderStatusUpdating}
                  onActivateOrders={handleActivateOrders}
                  onArchiveOrders={handleArchiveOrders}
                  onPauseOrders={handlePauseOrders}
                  onOpenCandidate={setSelectedCandidate}
                  onOpenOrder={setSelectedOrder}
                  onSelectOrder={setPreferredOrderId}
                  orders={activeView === 'candidates' ? candidateViewOrders : filteredOrders}
                  selectedOrderId={activeView === 'candidates' ? candidateViewSelectedOrderId : selectedOrderId}
                  view={activeView === 'dashboard' ? 'dashboard' : activeView}
                />
              </>
            )}

            {activeView === 'meetings' ? <CalendarPanel meetings={dataset.meetings} /> : null}

            {activeView === 'chats' ? (
              <Card className="rounded-xl border-slate-200 p-4 shadow-none">
                <h3 className="text-base font-semibold text-slate-900">Чаты</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Быстрая коммуникация между ролями и фиксация следующих шагов.
                </p>

                {isViewLoading ? (
                  <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
                    />
                    Загружаем треды...
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                    По запросу «{searchValue}» чаты не найдены.
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 lg:grid-cols-[320px_1fr]">
                    <div className="space-y-2">
                      {filteredThreads.map((thread) => (
                        <button
                          key={thread.id}
                          className={cn(
                            'w-full rounded-xl border p-3 text-left transition-colors',
                            activeThread?.id === thread.id
                              ? 'border-blue-200 bg-blue-50'
                              : 'border-slate-200 bg-white hover:bg-slate-50',
                          )}
                          onClick={() => setPreferredChatId(thread.id)}
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {thread.participant}
                            </p>
                            {thread.unread > 0 ? <Badge variant="default">{thread.unread}</Badge> : null}
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{thread.preview}</p>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {activeThread?.participant}
                        </p>
                      </div>
                      <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
                        {activeThread?.messages.map((message) => (
                          <article
                            key={message.id}
                            className={cn(
                              'max-w-[78%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                              message.author === 'me'
                                ? 'ml-auto bg-blue-50 text-blue-900'
                                : 'bg-slate-100 text-slate-700',
                            )}
                          >
                            <p>{message.text}</p>
                            <p className="mt-1 text-xs text-slate-500">{message.time}</p>
                          </article>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 border-t border-slate-200 px-4 py-3">
                        <Input
                          className="h-10 rounded-xl border-slate-200 text-slate-900"
                          onChange={(event) => setChatDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          placeholder="Написать сообщение..."
                          value={chatDraft}
                        />
                        <Button
                          className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                          onClick={handleSendMessage}
                          type="button"
                        >
                          Отправить
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ) : null}

            {activeView === 'analytics' ? (
              <PipelinePanel
                errorMessage={analyticsError}
                onRetry={() => {
                  setAnalyticsRecoveredByRole((previous) => ({
                    ...previous,
                    [role]: true,
                  }))
                  setBanner({
                    variant: 'success',
                    message: 'Отчет аналитики успешно обновлен.',
                  })
                }}
                pipeline={dataset.pipeline}
              />
            ) : null}
          </main>
        </div>
      </div>

      <Modal
        description={
          role === 'Customer'
            ? 'Добавьте ключевые данные по вакансии, чтобы команда подбора сразу начала работу.'
            : role === 'Executor'
              ? 'Добавьте профиль кандидата в pipeline и приложите комментарий.'
              : 'Создайте отклик и оставьте краткое сопроводительное сообщение.'
        }
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              className="h-10 rounded-xl border-slate-200 text-slate-700"
              onClick={() => setCreateModalOpen(false)}
              type="button"
              variant="outline"
            >
              Отмена
            </Button>
            <Button
              className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              disabled={role === 'Customer' && isCreatingOrder}
              form="create-entity-form"
              type="submit"
            >
              {role === 'Customer' && isCreatingOrder ? 'Сохраняем...' : 'Сохранить'}
            </Button>
          </div>
        }
        onOpenChange={setCreateModalOpen}
        open={createModalOpen}
        title={createActionLabel(role)}
      >
        <form className="grid gap-4" id="create-entity-form" onSubmit={handleCreateEntity}>
          <div className="space-y-2">
            <Label className="text-slate-600" htmlFor="entity-title">
              {role === 'Executor'
                ? 'ФИО кандидата'
                : role === 'Applicant'
                  ? 'Вакансия'
                  : 'Название заказа'}
            </Label>
            <Input
              className="h-11 rounded-xl border-slate-200 text-slate-900"
              id="entity-title"
              name="title"
              placeholder={
                role === 'Executor' ? 'Например, Елена Петрова' : 'Например, Senior React Developer'
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600" htmlFor="entity-organization">
              {role === 'Executor'
                ? 'Позиция / специализация'
                : role === 'Applicant'
                  ? 'Компания'
                  : 'Компания / отдел'}
            </Label>
            <Input
              className="h-11 rounded-xl border-slate-200 text-slate-900"
              id="entity-organization"
              name="organization"
              placeholder={role === 'Executor' ? 'Senior Frontend Developer' : 'ООО Альфа'}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600" htmlFor="entity-note">
              Комментарий
            </Label>
            <Textarea
              className="min-h-[120px] rounded-xl border-slate-200 text-slate-900"
              id="entity-note"
              name="note"
              placeholder="Ключевые детали, сроки и пожелания по профилю."
            />
          </div>
        </form>
      </Modal>

      <Modal
        description={selectedOrder?.updatedAt}
        footer={
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button
              className="h-10 rounded-xl border-slate-200 text-slate-700"
              onClick={() => setSelectedOrder(null)}
              type="button"
              variant="outline"
            >
              Закрыть
            </Button>
          </div>
        }
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null)
          }
        }}
        open={Boolean(selectedOrder)}
        title={selectedOrder?.title ?? 'Детали заказа'}
      >
        {selectedOrder ? (
          <dl className="grid gap-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
                Компания
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{selectedOrder.company}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
                Локация
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{selectedOrder.location}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
                Отклики
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{selectedOrder.responses}</dd>
            </div>
            <div className="pt-1">
              <Badge variant={workspaceToneToBadgeVariant(selectedOrder.statusTone)}>
                {selectedOrder.statusLabel}
              </Badge>
            </div>
          </dl>
        ) : null}
      </Modal>

      <Modal
        description={selectedCandidate?.comment}
        footer={
          <div className="flex justify-end">
            <Button
              className="h-10 rounded-xl border-slate-200 text-slate-700"
              onClick={() => setSelectedCandidate(null)}
              type="button"
              variant="outline"
            >
              Закрыть
            </Button>
          </div>
        }
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCandidate(null)
          }
        }}
        open={Boolean(selectedCandidate)}
        title={selectedCandidate?.name ?? 'Профиль кандидата'}
      >
        {selectedCandidate ? (
          <dl className="grid gap-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
                Позиция
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{selectedCandidate.position}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
                Источник
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{selectedCandidate.source}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-600">
                Рейтинг
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{selectedCandidate.rating}</dd>
            </div>
            <div className="pt-1">
              <Badge variant={workspaceToneToBadgeVariant(selectedCandidate.statusTone)}>
                {selectedCandidate.statusLabel}
              </Badge>
            </div>
          </dl>
        ) : null}
      </Modal>
    </div>
  )
}
