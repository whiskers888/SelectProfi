import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'

afterEach(cleanup)

describe('Sidebar applicant navigation', () => {
  it('labels the dashboard as applicant responses and keeps vacancies separate', () => {
    render(
      <Sidebar
        activeView="dashboard"
        collapsed={false}
        counters={{}}
        mobileOpen={false}
        onCloseMobile={vi.fn()}
        onToggleCollapse={vi.fn()}
        onViewChange={vi.fn()}
        role="Applicant"
      />,
    )

    expect(screen.getByRole('button', { name: 'Мои отклики' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Вакансии' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Мои заказы' })).toBeNull()
    expect(screen.getByText('Платформа поиска работы')).toBeTruthy()
  })

  it('uses the green active style for every selected menu section', () => {
    render(
      <Sidebar
        activeView="dashboard"
        collapsed={false}
        counters={{}}
        mobileOpen={false}
        onCloseMobile={vi.fn()}
        onToggleCollapse={vi.fn()}
        onViewChange={vi.fn()}
        role="Executor"
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
        mobileOpen={false}
        onCloseMobile={vi.fn()}
        onToggleCollapse={vi.fn()}
        onViewChange={vi.fn()}
        role="Executor"
      />,
    )

    expect(screen.getByRole('button', { name: 'Биржа проектов' }).className).toContain(
      'preview11-nav-btn-active',
    )
  })
})
