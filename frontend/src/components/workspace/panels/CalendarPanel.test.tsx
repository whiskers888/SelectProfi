import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { WorkspaceMeeting } from '../model/data'
import { CalendarPanel } from './CalendarPanel'

afterEach(cleanup)

const meeting: WorkspaceMeeting = {
  id: 'meeting-1',
  title: 'Интервью с работодателем',
  owner: 'HR-команда',
  slot: '14 ноября 2026, 14:30',
  statusLabel: 'Запланирована',
  statusTone: 'success',
  linkLabel: 'Ссылка появится после подключения календаря',
}

describe('CalendarPanel', () => {
  it('states that the calendar integration is unavailable', () => {
    render(<CalendarPanel meetings={null} />)

    expect(screen.getByRole('status').textContent).toContain('Раздел встреч пока не подключён.')
  })

  it('shows an empty schedule only when meeting data is available', () => {
    render(<CalendarPanel meetings={[]} />)

    expect(screen.getByRole('status').textContent).toContain('В расписании пока нет встреч.')
  })

  it('continues to render real meetings when supplied', () => {
    render(<CalendarPanel meetings={[meeting]} />)

    expect(screen.getByText(meeting.title)).toBeTruthy()
    expect(screen.getByText('14 ноября 2026')).toBeTruthy()
    expect(screen.getByText('14:30 • HR-команда')).toBeTruthy()
  })
})
