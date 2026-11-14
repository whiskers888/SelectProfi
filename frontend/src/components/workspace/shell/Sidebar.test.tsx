import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'

afterEach(cleanup)

const executorRewardFixture = {
  stat: null,
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
}

describe('Sidebar applicant navigation', () => {
  it('labels the dashboard as applicant responses and keeps vacancies separate', () => {
    render(
      <Sidebar
        activeView="dashboard"
        collapsed={false}
        counters={{}}
        createLabel={null}
        mobileOpen={false}
        onCloseMobile={vi.fn()}
        onCreateAction={vi.fn()}
        onToggleCollapse={vi.fn()}
        onViewChange={vi.fn()}
        roleLabel="Соискатель"
        role="Applicant"
      />,
    )

    expect(screen.getByRole('button', { name: 'Мои отклики' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Вакансии' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Мои заказы' })).toBeNull()
    expect(screen.getByText('Роль аккаунта')).toBeTruthy()
    expect(screen.getByText('Соискатель')).toBeTruthy()
  })

  it('uses the green active style for every selected menu section', () => {
    render(
      <Sidebar
        activeView="dashboard"
        collapsed={false}
        counters={{}}
        createLabel={null}
        mobileOpen={false}
        onCloseMobile={vi.fn()}
        onCreateAction={vi.fn()}
        onToggleCollapse={vi.fn()}
        onViewChange={vi.fn()}
        roleLabel="Исполнитель"
        role="Executor"
        executorReward={executorRewardFixture}
      />,
    )

    expect(screen.getByRole('button', { name: 'Мои проекты' }).className).toContain(
      'preview11-nav-btn-active',
    )
    expect(screen.getByRole('button', { name: 'Биржа проектов' })).toBeTruthy()

    cleanup()

    render(
      <Sidebar
        activeView="orders"
        collapsed={false}
        counters={{}}
        createLabel={null}
        mobileOpen={false}
        onCloseMobile={vi.fn()}
        onCreateAction={vi.fn()}
        onToggleCollapse={vi.fn()}
        onViewChange={vi.fn()}
        roleLabel="Исполнитель"
        role="Executor"
        executorReward={executorRewardFixture}
      />,
    )

    expect(screen.getByRole('button', { name: 'Биржа проектов' }).className).toContain(
      'preview11-nav-btn-active',
    )
  })

  it('shows available and reserved executor balance in the reward card', () => {
    render(
      <Sidebar
        activeView="dashboard"
        collapsed={false}
        counters={{}}
        createLabel={null}
        mobileOpen={false}
        onCloseMobile={vi.fn()}
        onCreateAction={vi.fn()}
        onToggleCollapse={vi.fn()}
        onViewChange={vi.fn()}
        roleLabel="Исполнитель"
        role="Executor"
        executorReward={{
          stat: {
            id: 'balance',
            label: 'Доступно к получению',
            value: '255 000 ₽',
            note: 'В резерве: 15 000 ₽',
          },
          isLoading: false,
          isError: false,
          onRetry: vi.fn(),
        }}
      />,
    )

    expect(screen.getByRole('region', { name: 'Вознаграждение' })).toBeTruthy()
    expect(screen.getByText('Доступно к получению')).toBeTruthy()
    expect(screen.getByText('255 000 ₽')).toBeTruthy()
    expect(screen.getByText('В резерве: 15 000 ₽')).toBeTruthy()
  })

  it('shows loading and retryable error states for executor reward', () => {
    const onRetry = vi.fn()
    const sidebarProps = {
      activeView: 'dashboard' as const,
      collapsed: false,
      counters: {},
      createLabel: null,
      mobileOpen: false,
      onCloseMobile: vi.fn(),
      onCreateAction: vi.fn(),
      onToggleCollapse: vi.fn(),
      onViewChange: vi.fn(),
      roleLabel: 'Исполнитель',
      role: 'Executor' as const,
    }

    const { rerender } = render(
      <Sidebar
        {...sidebarProps}
        executorReward={{ stat: null, isLoading: true, isError: false, onRetry }}
      />,
    )
    expect(screen.getByRole('status').textContent).toContain('Загружаем баланс')

    rerender(
      <Sidebar
        {...sidebarProps}
        executorReward={{ stat: null, isLoading: false, isError: true, onRetry }}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))

    expect(screen.getByRole('alert').textContent).toContain('Не удалось загрузить')
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
