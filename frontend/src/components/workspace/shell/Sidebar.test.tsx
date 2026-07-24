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
        onToggleCollapse={vi.fn()}
        onViewChange={vi.fn()}
        role="Applicant"
      />,
    )

    expect(screen.getByRole('button', { name: 'Мои отклики' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Вакансии' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Мои заказы' })).toBeNull()
  })
})
