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
  useGetMyProfileQuery,
  useSwitchMyActiveRoleMutation,
  type UserRole,
} from '@/shared/api/profile'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { RoleSwitch } from '../navigation/RoleSwitch'
import {
  defaultPreviewRole,
  defaultPreviewView,
  previewDataByRole,
  previewToneToBadgeVariant,
  type PreviewCandidate,
  type PreviewChatThread,
  type PreviewOrder,
  type PreviewRole,
  type PreviewView,
} from '../model/data'

type PageBanner = {
  message: string
  variant: 'default' | 'success' | 'destructive'
}

type OrderFilter = 'all' | 'active' | 'paused'

function createHeaderTitle(role: PreviewRole): string {
  if (role === 'Executor') {
    return 'Проекты и кандидаты'
  }

  if (role === 'Applicant') {
    return 'Отклики и коммуникации'
  }

  return 'Заказы и отклики'
}

function createActionLabel(role: PreviewRole): string {
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

function toPreviewRole(role: UserRole | null | undefined): PreviewRole | null {
  if (role === 'Customer' || role === 'Executor' || role === 'Applicant') {
    return role
  }

  return null
}

function toAvailablePreviewRoles(roles: UserRole[] | undefined, fallbackRole: PreviewRole): PreviewRole[] {
  if (!roles || roles.length === 0) {
    return [fallbackRole]
  }

  const mappedRoles = roles
    .map((role) => toPreviewRole(role))
    .filter((role): role is PreviewRole => role !== null)

  if (mappedRoles.length === 0) {
    return [fallbackRole]
  }

  return Array.from(new Set(mappedRoles))
}

function toRoleLabel(role: PreviewRole): string {
  if (role === 'Applicant') {
    return 'Соискатель'
  }

  if (role === 'Executor') {
    return 'Исполнитель'
  }

  return 'Заказчик'
}

export function ShellPage() {
  const navigate = useNavigate()
  const { data: profile, isFetching: isProfileFetching, refetch: refetchProfile } = useGetMyProfileQuery()
  const { data: authMe } = useGetMyAuthInfoQuery()
  const [switchMyActiveRole, { isLoading: isRoleSwitching }] = useSwitchMyActiveRoleMutation()
  // @dvnull: Раньше роль бралась из query-параметра, теперь primary source — профиль с бэкенда.
  const role = toPreviewRole(profile?.activeRole ?? profile?.role) ?? defaultPreviewRole
  const availableRoles = toAvailablePreviewRoles(profile?.roles, role)
  const canSwitchRole = availableRoles.includes('Applicant') && availableRoles.includes('Executor')
  const profileDisplayName =
    `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || authMe?.email || 'Пользователь'
  const profileEmail = profile?.email ?? authMe?.email ?? '—'
  const profileRoleLabel = toRoleLabel(role)
  const dataset = previewDataByRole[role]

  const [activeView, setActiveView] = useState<PreviewView>(defaultPreviewView)
  const [searchValue, setSearchValue] = useState('')
  const [orderFilter] = useState<OrderFilter>('all')
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [banner, setBanner] = useState<PageBanner | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PreviewOrder | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<PreviewCandidate | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [preferredOrderId, setPreferredOrderId] = useState<string | null>(null)
  const [preferredChatId, setPreferredChatId] = useState<string | null>(null)

  const [threadsByRole, setThreadsByRole] = useState<Record<PreviewRole, PreviewChatThread[]>>({
    Customer: previewDataByRole.Customer.chats,
    Executor: previewDataByRole.Executor.chats,
    Applicant: previewDataByRole.Applicant.chats,
  })
  const [manualOrdersByRole, setManualOrdersByRole] = useState<Record<PreviewRole, PreviewOrder[]>>({
    Customer: [],
    Executor: [],
    Applicant: [],
  })
  const [manualCandidatesByRole, setManualCandidatesByRole] = useState<
    Record<PreviewRole, PreviewCandidate[]>
  >({
    Customer: [],
    Executor: [],
    Applicant: [],
  })
  const [analyticsRecoveredByRole, setAnalyticsRecoveredByRole] = useState<
    Record<PreviewRole, boolean>
  >({
    Customer: false,
    Executor: false,
    Applicant: false,
  })

  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (!transitionTimeoutRef.current) {
        return
      }
      window.clearTimeout(transitionTimeoutRef.current)
    },
    [],
  )

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
  const manualOrders = manualOrdersByRole[role]
  const manualCandidates = manualCandidatesByRole[role]
  const analyticsError = analyticsRecoveredByRole[role] ? null : dataset.analyticsError ?? null

  const allOrders = [...manualOrders, ...dataset.orders]
  const allCandidates = [...manualCandidates, ...dataset.candidates]
  const normalizedSearch = searchValue.trim().toLowerCase()

  const filteredOrders = allOrders.filter((order) => {
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

  const counters: Partial<Record<PreviewView, number>> = {
    dashboard: dataset.meetings.length,
    orders: filteredOrders.length,
    candidates: filteredCandidates.length,
    meetings: dataset.meetings.length,
    chats: filteredThreads.reduce((sum, thread) => sum + thread.unread, 0),
  }

  function handleViewChange(nextView: PreviewView) {
    setActiveView(nextView)
    startViewTransition()
  }

  async function handleRoleChange(nextRole: PreviewRole) {
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

  function handleCreateEntity(event: FormEvent<HTMLFormElement>) {
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
      const nextCandidate: PreviewCandidate = {
        id: `cand-local-${Date.now()}`,
        name: title,
        position: organization,
        source: 'Добавлен вручную',
        rating: '4.6',
        orderId: filteredOrders[0]?.id ?? 'local-order',
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

    const nextOrder: PreviewOrder = {
      id: `ord-local-${Date.now()}`,
      title,
      company: organization,
      location: 'Новый заказ',
      priority: 'medium',
      responses: 0,
      statusLabel: 'Новый',
      statusTone: 'default',
      updatedAt: 'Только что',
    }

    setManualOrdersByRole((previousOrdersByRole) => ({
      ...previousOrdersByRole,
      [role]: [nextOrder, ...previousOrdersByRole[role]],
    }))
    setPreferredOrderId(nextOrder.id)
    setBanner({
      variant: 'success',
      message: note
        ? 'Заказ создан и передан в работу.'
        : 'Заказ создан. Добавьте комментарий для команды.',
    })
    setCreateModalOpen(false)
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

            {banner ? <Alert variant={banner.variant}>{banner.message}</Alert> : null}

            {(activeView === 'dashboard' ||
              activeView === 'orders' ||
              activeView === 'candidates') && (
              <>
                <StatsGrid stats={dataset.stats} />
                <MainFeedPanel
                  candidates={filteredCandidates}
                  isLoading={isViewLoading}
                  onOpenCandidate={setSelectedCandidate}
                  onOpenOrder={setSelectedOrder}
                  onSelectOrder={setPreferredOrderId}
                  orders={filteredOrders}
                  selectedOrderId={selectedOrderId}
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
              form="create-entity-form"
              type="submit"
            >
              Сохранить
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
          <div className="flex justify-end">
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
              <Badge variant={previewToneToBadgeVariant(selectedOrder.statusTone)}>
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
              <Badge variant={previewToneToBadgeVariant(selectedCandidate.statusTone)}>
                {selectedCandidate.statusLabel}
              </Badge>
            </div>
          </dl>
        ) : null}
      </Modal>
    </div>
  )
}
