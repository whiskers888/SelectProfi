import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WorkspaceCandidate, WorkspaceOrder } from '../model/data'
import { MainFeedPanel } from './MainFeedPanel'
import type { MainFeedPanelProps } from './MainFeedPanel.types'

afterEach(cleanup)

const executorId = 'executor-1'
const order: WorkspaceOrder = {
  id: 'order-1',
  customerId: 'customer-1',
  executorId,
  price: 100000,
  grossAmount: 100000,
  serviceCommissionPercent: 15,
  serviceCommissionAmount: 15000,
  executorNetAmount: 85000,
  isPricingLocked: true,
  title: 'Senior разработчик',
  company: 'ООО Альфа',
  location: 'Москва',
  employeeCompensation: '250 000 ₽',
  functional: 'Разработка',
  requirements: 'Опыт',
  otherConditions: 'ДМС',
  priority: 'medium',
  responses: 0,
  statusLabel: 'В работе',
  statusTone: 'success',
  updatedAt: 'Обновлено сегодня',
  isArchived: false,
  isPaused: false,
}

const poolCandidate: WorkspaceCandidate = {
  id: 'candidate-1',
  name: 'Мария Соколова',
  position: '',
  orderId: order.id,
  source: 'База кандидатов',
  rating: '4.8',
  statusLabel: 'В рабочем списке',
  stage: 'Pool',
  statusTone: 'warning',
  experienceSummary: 'Рекрутер',
  comment: 'Сохранённая заметка',
}
const shortlistCandidate: WorkspaceCandidate = {
  ...poolCandidate,
  name: 'Кандидат № 42',
  statusLabel: 'В списке кандидатов',
  stage: 'Shortlist',
  statusTone: 'default',
}
const selectedCandidate: WorkspaceCandidate = {
  ...shortlistCandidate,
  id: 'candidate-2',
  statusLabel: 'Выбран',
  statusTone: 'success',
}
const applicantResponseCandidate: WorkspaceCandidate = {
  ...poolCandidate,
  id: 'response-candidate',
  name: 'Новый отклик',
  position: '',
  source: 'Отклик соискателя',
  experienceSummary: 'Backend-разработка и API',
  experienceYears: 5,
  applicantSubmittedAtUtc: '2026-11-15T10:00:00Z',
}

function renderDashboard(
  role: 'Customer' | 'Executor',
  canManageOrders: boolean,
  overrides: Partial<MainFeedPanelProps> = {},
) {
  return render(
    <MainFeedPanel
      baseCandidates={[]}
      candidates={[]}
      canManageOrders={canManageOrders}
      isLoading={false}
      onOpenCandidate={vi.fn()}
      onOpenOrder={vi.fn()}
      onSelectOrder={vi.fn()}
      orders={[order]}
      requesterUserId={role === 'Executor' ? executorId : 'customer-1'}
      role={role}
      selectedOrderId={null}
      view="dashboard"
      {...overrides}
    />,
  )
}

function renderApplicant(view: 'dashboard' | 'orders', applicantRespondedOrderIds: string[]) {
  return render(
    <MainFeedPanel
      applicantRespondedOrderIds={applicantRespondedOrderIds}
      baseCandidates={[]}
      candidates={[]}
      isLoading={false}
      onOpenCandidate={vi.fn()}
      onOpenOrder={vi.fn()}
      onSelectOrder={vi.fn()}
      orders={[order]}
      role="Applicant"
      selectedOrderId={null}
      view={view}
    />,
  )
}

function renderExecutorExchange() {
  return render(
    <MainFeedPanel
      baseCandidates={[]}
      candidates={[]}
      isLoading={false}
      onOpenCandidate={vi.fn()}
      onOpenOrder={vi.fn()}
      onSelectOrder={vi.fn()}
      orders={[order, { ...order, id: 'exchange-order', executorId: null, title: 'Вакантный проект' }]}
      requesterUserId={executorId}
      role="Executor"
      selectedOrderId={null}
      view="orders"
    />,
  )
}

describe('MainFeedPanel projects in work', () => {
  it('shows a role-appropriate empty state when executor has no projects', () => {
    renderDashboard('Executor', false, { orders: [] })

    expect(screen.getByText('Назначенные вам проекты появятся здесь.')).toBeTruthy()
    expect(screen.queryByText(/Создайте новый проект/)).toBeNull()
  })

  it('shows executor net amount and read-only project controls', () => {
    renderDashboard('Executor', false)

    expect(screen.getAllByText('В работе').length).toBeGreaterThan(0)
    expect(screen.getByText(/К получению:\s*85[\s\u00a0]?000 ₽/)).toBeTruthy()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'На паузу' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Активировать' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'В архив' })).toBeNull()
  })

  it('moves a selected-project candidate from Pool into Shortlist', () => {
    const onSetCandidateStage = vi.fn()
    const onOpenCandidate = vi.fn()

    renderDashboard('Executor', false, {
      executorDashboardCandidates: [poolCandidate],
      onOpenCandidate,
      onSetCandidateStage,
    })

    fireEvent.click(screen.getByRole('button', { name: `Добавить ${poolCandidate.name} в список кандидатов` }))

    expect(onSetCandidateStage).toHaveBeenCalledWith(order.id, poolCandidate.id, 'Shortlist')
    expect(onOpenCandidate).not.toHaveBeenCalled()
    expect(screen.getByText('Рекрутер')).toBeTruthy()
    expect(screen.queryByText('Сохранённая заметка')).toBeNull()
  })

  it('returns a selected-project candidate from Shortlist to Pool', () => {
    const onSetCandidateStage = vi.fn()
    const shortlistCandidate: WorkspaceCandidate = {
      ...poolCandidate,
      statusLabel: 'В списке кандидатов',
      stage: 'Shortlist',
      statusTone: 'default',
    }

    renderDashboard('Executor', false, {
      executorDashboardCandidates: [shortlistCandidate],
      onSetCandidateStage,
    })

    fireEvent.click(screen.getByRole('button', { name: `Вернуть ${shortlistCandidate.name} в рабочий список` }))

    expect(onSetCandidateStage).toHaveBeenCalledWith(order.id, shortlistCandidate.id, 'Pool')
  })

  it('keeps Pool completed after its last candidate moves to Shortlist', () => {
    renderDashboard('Executor', false, {
      executorDashboardCandidates: [shortlistCandidate],
      selectedOrderId: order.id,
      dashboardVacancies: [
        {
          id: 'vacancy-1',
          orderId: order.id,
          customerId: 'customer-1',
          executorId,
          title: 'Senior разработчик',
          description: 'Опыт работы от пяти лет',
          status: 'Published',
          createdAtUtc: '2026-11-01T10:00:00Z',
          updatedAtUtc: '2026-11-10T10:00:00Z',
        },
      ],
      selectedOrderVacancyPreview: {
        title: 'Senior разработчик',
        description: 'Опыт работы от пяти лет',
        status: 'Draft',
        createdAtUtc: '2026-11-01T10:00:00Z',
        updatedAtUtc: '2026-11-10T10:00:00Z',
      },
    })

    const currentStep = screen
      .getByRole('list', { name: 'Этапы проекта' })
      .querySelector('[aria-current="step"]')

    expect(currentStep?.textContent).toContain('Список кандидатов')
  })

  it('shows project-scoped candidates from the stage filters', () => {
    const otherOrder: WorkspaceOrder = { ...order, id: 'order-2', title: 'Другой проект' }
    const finalist: WorkspaceCandidate = {
      ...shortlistCandidate,
      id: 'finalist-1',
      name: 'Финалист проекта',
    }
    const otherProjectCandidate: WorkspaceCandidate = {
      ...poolCandidate,
      id: 'candidate-other-project',
      name: 'Кандидат другого проекта',
      orderId: otherOrder.id,
    }

    renderDashboard('Executor', false, {
      executorDashboardCandidates: [poolCandidate, finalist, otherProjectCandidate],
      orders: [order, otherOrder],
      selectedOrderId: order.id,
    })

    fireEvent.click(screen.getByRole('button', { name: /^Pool/ }))
    expect(screen.queryByText(finalist.name)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Все этапы/ }))
    expect(screen.getByText(poolCandidate.name)).toBeTruthy()
    expect(screen.getByText(finalist.name)).toBeTruthy()
    expect(screen.queryByText(otherProjectCandidate.name)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Список кандидатов · финалисты/ }))
    expect(screen.getByText(finalist.name)).toBeTruthy()
    expect(screen.queryByText(poolCandidate.name)).toBeNull()
    expect(screen.queryByText(otherProjectCandidate.name)).toBeNull()
  })

  it('disables candidate stage actions while an update is pending', () => {
    renderDashboard('Executor', false, {
      executorDashboardCandidates: [poolCandidate],
      isUpdatingCandidateStage: true,
      onSetCandidateStage: vi.fn(),
    })

    const button = screen.getByRole('button', { name: `Добавить ${poolCandidate.name} в список кандидатов` })

    expect(button.hasAttribute('disabled')).toBe(true)
  })

  it('freezes Pool stage actions when any candidate for the selected vacancy is submitted', () => {
    const onSetCandidateStage = vi.fn()
    const submittedCandidate: WorkspaceCandidate = {
      ...shortlistCandidate,
      id: 'candidate-submitted',
      isCustomerSubmitted: true,
    }
    const poolCandidateNotSubmitted: WorkspaceCandidate = {
      ...poolCandidate,
      isCustomerSubmitted: false,
    }

    renderDashboard('Executor', false, {
      executorDashboardCandidates: [poolCandidateNotSubmitted, submittedCandidate],
      onSetCandidateStage,
      selectedOrderId: order.id,
    })

    fireEvent.click(screen.getByRole('button', { name: /Рабочий список/ }))

    expect(screen.queryByRole('button', {
      name: `Добавить ${poolCandidateNotSubmitted.name} в список кандидатов`,
    })).toBeNull()
    expect(screen.getByText('Список отправлен заказчику')).toBeTruthy()
    expect(onSetCandidateStage).not.toHaveBeenCalled()
  })

  it('separates the official customer submission from the working candidate list', () => {
    const submittedCandidate: WorkspaceCandidate = {
      ...shortlistCandidate,
      id: 'candidate-submitted',
      name: 'Отправленный кандидат',
      isCustomerSubmitted: true,
    }

    renderDashboard('Executor', false, {
      executorDashboardCandidates: [poolCandidate, submittedCandidate],
      selectedOrderId: order.id,
    })

    expect(screen.getByText(poolCandidate.name)).toBeTruthy()
    expect(screen.queryByText(submittedCandidate.name)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Отправлены заказчику/ }))

    expect(screen.getByText(submittedCandidate.name)).toBeTruthy()
    expect(screen.queryByText(poolCandidate.name)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Список кандидатов · финалисты/ }))
    expect(screen.getByText(submittedCandidate.name)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Pool 0/ })).toBeTruthy()
  })

  it('shows only submitted applicant responses and searches by candidate qualification', () => {
    const juniorResponse: WorkspaceCandidate = {
      ...applicantResponseCandidate,
      id: 'junior-response',
      name: 'Анна Смирнова',
      position: '',
      experienceYears: 2,
      experienceSummary: 'Опыт тестирования',
      applicantSubmittedAtUtc: '2026-11-14T10:00:00Z',
    }
    const recruiterCandidate: WorkspaceCandidate = {
      ...poolCandidate,
      id: 'recruiter-candidate',
      name: 'Кандидат из базы',
      applicantSubmittedAtUtc: null,
    }
    const otherOrderResponse: WorkspaceCandidate = {
      ...applicantResponseCandidate,
      id: 'other-order-response',
      name: 'Отклик другого проекта',
      orderId: 'order-2',
    }

    renderDashboard('Executor', false, {
      executorDashboardCandidates: [
        applicantResponseCandidate,
        juniorResponse,
        recruiterCandidate,
        otherOrderResponse,
      ],
      selectedOrderId: order.id,
    })

    fireEvent.click(screen.getByRole('button', { name: /^Отклики/ }))

    expect(screen.getByText('Отклики соискателей')).toBeTruthy()
    expect(screen.getByText(applicantResponseCandidate.name)).toBeTruthy()
    expect(screen.getByText(juniorResponse.name)).toBeTruthy()
    expect(screen.queryByText(recruiterCandidate.name)).toBeNull()
    expect(screen.queryByText(otherOrderResponse.name)).toBeNull()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Поиск откликов' }), {
      target: { value: 'backend' },
    })

    expect(screen.getByText(applicantResponseCandidate.name)).toBeTruthy()
    expect(screen.queryByText(juniorResponse.name)).toBeNull()
  })

  it('applies response experience and stage filters from the filter modal', () => {
    const shortlistResponse: WorkspaceCandidate = {
      ...applicantResponseCandidate,
      id: 'shortlist-response',
      name: 'Отклик в списке кандидатов',
      stage: 'Shortlist',
      statusLabel: 'В списке кандидатов',
    }
    const juniorResponse: WorkspaceCandidate = {
      ...applicantResponseCandidate,
      id: 'junior-response',
      name: 'Отклик с малым опытом',
      experienceYears: 2,
    }

    renderDashboard('Executor', false, {
      executorDashboardCandidates: [applicantResponseCandidate, shortlistResponse, juniorResponse],
      selectedOrderId: order.id,
    })

    fireEvent.click(screen.getByRole('button', { name: /^Отклики/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Фильтры откликов' }))

    const dialog = screen.getByRole('dialog', { name: 'Фильтры откликов' })
    fireEvent.change(within(dialog).getByLabelText('Опыт'), { target: { value: '5' } })
    fireEvent.change(within(dialog).getByLabelText('Этап'), { target: { value: 'pool' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Показать отклики' }))

    expect(screen.getByText(applicantResponseCandidate.name)).toBeTruthy()
    expect(screen.queryByText(shortlistResponse.name)).toBeNull()
    expect(screen.queryByText(juniorResponse.name)).toBeNull()
    expect(screen.getByText('Опыт от 5 лет')).toBeTruthy()
  })

  it('opens the selected project details from the dashboard summary', () => {
    const onOpenOrder = vi.fn()

    renderDashboard('Executor', false, { onOpenOrder })

    fireEvent.click(screen.getByRole('button', { name: `Открыть детали проекта ${order.title}` }))

    expect(onOpenOrder).toHaveBeenCalledWith(order)
  })

  it('lets a customer choose a shortlist candidate by ID while showing only the public alias', () => {
    const onSelectVacancyCandidate = vi.fn()

    renderDashboard('Customer', false, {
      candidates: [shortlistCandidate],
      canSelectFinalist: true,
      onSelectVacancyCandidate,
    })

    expect(screen.getByText('Кандидат № 42')).toBeTruthy()
    expect(screen.queryByText('Мария Соколова')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Выбрать финалистом Кандидат № 42' }))

    expect(onSelectVacancyCandidate).toHaveBeenCalledWith(order.id, shortlistCandidate.id)
  })

  it('shows the selected order details beside the customer shortlist', () => {
    renderDashboard('Customer', false, { candidates: [shortlistCandidate] })

    expect(screen.getByRole('region', { name: 'Детали выбранного заказа' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Детали выбранного заказа' }).textContent).toContain('ООО Альфа • Москва')
    expect(screen.getByText('Разработка')).toBeTruthy()
    expect(screen.getByText('Кандидат № 42')).toBeTruthy()
  })

  it('selects another customer order without navigating away', () => {
    const onOpenOrder = vi.fn()
    const onSelectOrder = vi.fn()
    const secondOrder: WorkspaceOrder = { ...order, id: 'order-2', title: 'Другой проект' }
    renderDashboard('Customer', false, { onOpenOrder, onSelectOrder, orders: [order, secondOrder] })

    fireEvent.click(screen.getByRole('button', { name: /Другой проект/ }))

    expect(onOpenOrder).not.toHaveBeenCalled()
    expect(onSelectOrder).toHaveBeenCalledWith(secondOrder.id)
  })

  it('opens customer order route from the explicit details action', () => {
    const onOpenOrder = vi.fn()
    renderDashboard('Customer', false, { onOpenOrder })

    fireEvent.click(screen.getByRole('button', { name: 'Открыть детали заказа' }))

    expect(onOpenOrder).toHaveBeenCalledWith(order)
  })

  it('keeps Customer details and shortlist scoped to the selected archived order', () => {
    const archivedOrder: WorkspaceOrder = {
      ...order,
      id: 'order-archived',
      title: 'Завершённый проект',
      isArchived: true,
    }
    const activeCandidate = { ...shortlistCandidate, id: 'active-candidate', name: 'Активный кандидат' }
    const archivedCandidate = {
      ...shortlistCandidate,
      id: 'archived-candidate',
      name: 'Кандидат архивного заказа',
      orderId: archivedOrder.id,
    }
    const onSelectOrder = vi.fn()
    const onSelectVacancyCandidate = vi.fn()

    renderDashboard('Customer', false, {
      candidates: [activeCandidate, archivedCandidate],
      canSelectFinalist: true,
      onSelectOrder,
      onSelectVacancyCandidate,
      orders: [order, archivedOrder],
      selectedOrderId: order.id,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Архив' }))

    expect(onSelectOrder).toHaveBeenCalledWith(archivedOrder.id)
    expect(screen.getByRole('region', { name: 'Детали выбранного заказа' }).textContent).toContain(archivedOrder.title)
    expect(screen.getByText(archivedCandidate.name)).toBeTruthy()
    expect(screen.queryByText(activeCandidate.name)).toBeNull()
    expect(screen.queryByRole('button', { name: /Выбрать финалистом/ })).toBeNull()
    expect(onSelectVacancyCandidate).not.toHaveBeenCalled()
  })

  it('keeps Executor archived candidates read-only', () => {
    const archivedOrder: WorkspaceOrder = {
      ...order,
      id: 'order-archived',
      title: 'Завершённый проект',
      isArchived: true,
    }
    const archivedCandidate: WorkspaceCandidate = {
      ...poolCandidate,
      id: 'archived-candidate',
      orderId: archivedOrder.id,
    }
    const onSetCandidateStage = vi.fn()
    const onSelectOrder = vi.fn()

    renderDashboard('Executor', false, {
      executorDashboardCandidates: [poolCandidate, archivedCandidate],
      onSelectOrder,
      onSetCandidateStage,
      orders: [order, archivedOrder],
      selectedOrderId: order.id,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Архив' }))

    expect(onSelectOrder).toHaveBeenCalledWith(archivedOrder.id)
    expect(screen.getByText(archivedCandidate.name)).toBeTruthy()
    expect(screen.getByText('Только просмотр')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Добавить .* в список кандидатов/ })).toBeNull()
    expect(onSetCandidateStage).not.toHaveBeenCalled()
  })

  it('keeps order filters available when the selected archive is empty', () => {
    renderDashboard('Customer', false, { selectedOrderId: order.id })

    fireEvent.click(screen.getByRole('button', { name: 'Архив' }))

    expect(screen.getByRole('button', { name: 'Активные' })).toBeTruthy()
    expect(screen.getByText('Нет заказов в выбранном состоянии.')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Активные' }))

    expect(
      screen.getByRole('region', { name: 'Детали выбранного заказа' }).textContent,
    ).toContain(order.title)
  })

  it('does not offer finalist selection when one is already selected', () => {
    renderDashboard('Customer', false, {
      candidates: [selectedCandidate, shortlistCandidate],
      canSelectFinalist: true,
      hasSelectedFinalist: true,
      onSelectVacancyCandidate: vi.fn(),
    })

    expect(screen.getByText('Финалист выбран')).toBeTruthy()
    expect(screen.getByText('Финалист уже выбран')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Выбрать финалистом/ })).toBeNull()
  })

  it('disables finalist selection while the request is pending', () => {
    renderDashboard('Customer', false, {
      candidates: [shortlistCandidate],
      canSelectFinalist: true,
      isSelectingVacancyCandidate: true,
      onSelectVacancyCandidate: vi.fn(),
    })

    expect(screen.getByRole('button', { name: 'Выбрать финалистом Кандидат № 42' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('Выбираем…')).toBeTruthy()
  })

  it('does not show the customer finalist action for Pool candidates or non-dashboard views', () => {
    renderDashboard('Customer', false, {
      candidates: [poolCandidate],
      canSelectFinalist: true,
      onSelectVacancyCandidate: vi.fn(),
    })

    expect(screen.queryByRole('button', { name: /Выбрать финалистом/ })).toBeNull()
    cleanup()

    render(
      <MainFeedPanel
        baseCandidates={[]}
        candidates={[shortlistCandidate]}
        isLoading={false}
        canSelectFinalist
        onSelectVacancyCandidate={vi.fn()}
        onOpenCandidate={vi.fn()}
        onOpenOrder={vi.fn()}
        onSelectOrder={vi.fn()}
        orders={[order]}
        role="Customer"
        selectedOrderId={null}
        view="candidates"
      />,
    )

    expect(screen.queryByRole('button', { name: /Выбрать финалистом/ })).toBeNull()
  })

  it('keeps aligned selection and pause action for customer active orders', () => {
    const onPauseOrders = vi.fn()
    const secondOrder: WorkspaceOrder = { ...order, id: 'order-2', title: 'Другой проект' }

    renderDashboard('Customer', true, { onPauseOrders, orders: [order, secondOrder] })

    expect(screen.getAllByText(/Цена:\s*100[\s\u00a0]?000 ₽/)).toHaveLength(2)
    const secondOrderCheckbox = screen.getByRole('checkbox', { name: `Выбрать заказ ${secondOrder.title}` })
    expect(secondOrderCheckbox).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Активировать' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'В архив' })).toBeNull()

    fireEvent.click(secondOrderCheckbox)
    const pauseButton = screen.getByRole('button', { name: 'На паузу' })
    expect(pauseButton.hasAttribute('disabled')).toBe(false)
    fireEvent.click(pauseButton)

    expect(onPauseOrders).toHaveBeenCalledWith([secondOrder.id])
  })

  it('shows only applicant responses on the dashboard', () => {
    renderApplicant('dashboard', [])

    expect(screen.getByText('Подтверждённых откликов пока нет.')).toBeTruthy()
  })

  it('lists platform vacancies without order scope switches for applicants', () => {
    renderApplicant('orders', [])

    expect(screen.getByText('Senior разработчик')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть фильтры вакансий' }))
    expect(screen.getByRole('dialog', { name: 'Фильтры вакансий' })).toBeTruthy()
    expect(screen.getAllByText('Скоро появится')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: 'Мои заказы' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Биржа заказов' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Список вакансий' })).toBeTruthy()
  })

  it('omits order archive controls from the applicant responses dashboard', () => {
    renderApplicant('dashboard', [])

    expect(screen.getByText('Подтверждённых откликов пока нет.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'На паузе' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Архив' })).toBeNull()
    expect(screen.queryByText(order.title)).toBeNull()
  })

  it('shows salary instead of priority in the applicant vacancy list', () => {
    renderApplicant('orders', [])

    expect(screen.getByRole('heading', { name: 'Список вакансий' })).toBeTruthy()
    expect(screen.getByText('250 000 ₽')).toBeTruthy()
    expect(screen.queryByText('Приоритет')).toBeNull()
  })

  it('shows only available projects on the executor exchange', () => {
    renderExecutorExchange()

    expect(screen.getByRole('heading', { name: 'Биржа проектов' })).toBeTruthy()
    expect(screen.getByText('Вакантный проект')).toBeTruthy()
    expect(screen.queryByText('Senior разработчик')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Мои проекты' })).toBeNull()
  })
})
