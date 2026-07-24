import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WorkspaceOrder } from '../model/data'
import { MainFeedPanel } from './MainFeedPanel'

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

function renderDashboard(role: 'Customer' | 'Executor', canManageOrders: boolean) {
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

describe('MainFeedPanel projects in work', () => {
  it('shows executor net amount and read-only project controls', () => {
    renderDashboard('Executor', false)

    expect(screen.getByText('В работе')).toBeTruthy()
    expect(screen.getByText(/К получению:\s*85[\s\u00a0]?000 ₽/)).toBeTruthy()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'На паузу' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Активировать' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'В архив' })).toBeNull()
  })

  it('keeps aligned selection and pause action for customer active orders', () => {
    const { container } = renderDashboard('Customer', true)

    expect(screen.getByText(/Цена:\s*100[\s\u00a0]?000 ₽/)).toBeTruthy()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'На паузу' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Активировать' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'В архив' })).toBeNull()
    expect(container.querySelector('.preview11-order-row-with-selection')).toBeTruthy()
  })

  it('shows only applicant responses on the dashboard', () => {
    renderApplicant('dashboard', [])

    expect(screen.getByText('Нет откликов')).toBeTruthy()
  })

  it('lists platform vacancies without order scope switches for applicants', () => {
    renderApplicant('orders', [])

    expect(screen.getByText('Senior разработчик')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть фильтры вакансий' }))
    expect(screen.getByRole('dialog', { name: 'Фильтры вакансий' })).toBeTruthy()
    expect(screen.getAllByText('Скоро появится')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: 'Мои заказы' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Биржа заказов' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Вакансии' })).toBeNull()
  })
})
