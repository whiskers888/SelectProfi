import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
  position: 'Рекрутер',
  orderId: order.id,
  source: 'База кандидатов',
  rating: '4.8',
  statusLabel: 'Pool',
  statusTone: 'warning',
  comment: 'Сохранённая заметка',
}
const shortlistCandidate: WorkspaceCandidate = {
  ...poolCandidate,
  name: 'Кандидат № 42',
  statusLabel: 'Shortlist',
  statusTone: 'default',
}
const selectedCandidate: WorkspaceCandidate = {
  ...shortlistCandidate,
  id: 'candidate-2',
  statusLabel: 'Выбран',
  statusTone: 'success',
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

    fireEvent.click(screen.getByRole('button', { name: `Добавить ${poolCandidate.name} в Shortlist` }))

    expect(onSetCandidateStage).toHaveBeenCalledWith(order.id, poolCandidate.id, 'Shortlist')
    expect(onOpenCandidate).not.toHaveBeenCalled()
    expect(screen.getByText('Сохранённая заметка')).toBeTruthy()
  })

  it('returns a selected-project candidate from Shortlist to Pool', () => {
    const onSetCandidateStage = vi.fn()
    const shortlistCandidate: WorkspaceCandidate = {
      ...poolCandidate,
      statusLabel: 'Shortlist',
      statusTone: 'default',
    }

    renderDashboard('Executor', false, {
      executorDashboardCandidates: [shortlistCandidate],
      onSetCandidateStage,
    })

    fireEvent.click(screen.getByRole('button', { name: `Вернуть ${shortlistCandidate.name} в Pool` }))

    expect(onSetCandidateStage).toHaveBeenCalledWith(order.id, shortlistCandidate.id, 'Pool')
  })

  it('disables candidate stage actions while an update is pending', () => {
    renderDashboard('Executor', false, {
      executorDashboardCandidates: [poolCandidate],
      isUpdatingCandidateStage: true,
      onSetCandidateStage: vi.fn(),
    })

    const button = screen.getByRole('button', { name: `Добавить ${poolCandidate.name} в Shortlist` })

    expect(button.hasAttribute('disabled')).toBe(true)
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
    expect(screen.queryByRole('button', { name: /Добавить .* в Shortlist/ })).toBeNull()
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
