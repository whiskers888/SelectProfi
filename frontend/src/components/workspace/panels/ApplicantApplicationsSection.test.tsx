import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { ApplicantDashboardApplicationResponse } from '@/shared/api/dashboard/api'
import type { VacancyResponse } from '@/shared/api/vacancies'
import { ApplicantApplicationsSection } from './ApplicantApplicationsSection'

afterEach(cleanup)

const application: ApplicantDashboardApplicationResponse = {
  vacancyId: 'vacancy-1',
  vacancyTitle: 'Senior React Developer',
  companyName: 'ООО Альфа',
  stage: 'Shortlist',
  submittedAtUtc: '2026-07-23T10:00:00Z',
  firstViewedAtUtc: '2026-07-24T10:00:00Z',
}

const vacancy: VacancyResponse = {
  id: application.vacancyId,
  orderId: 'order-1',
  customerId: 'customer-1',
  executorId: 'executor-1',
  title: application.vacancyTitle,
  description: 'Разработка пользовательского интерфейса на React и TypeScript.',
  status: 'Published',
  createdAtUtc: '2026-07-22T10:00:00Z',
  updatedAtUtc: '2026-07-23T10:00:00Z',
}

function renderApplications(vacancies: VacancyResponse[], applications = [application]) {
  return render(
    <ApplicantApplicationsSection
      applications={applications}
      isError={false}
      isLoading={false}
      unclassifiedCandidateLinksCount={0}
      vacancies={vacancies}
    />,
  )
}

describe('ApplicantApplicationsSection', () => {
  it('shows the first application details with the real vacancy description and saved activity', () => {
    renderApplications([vacancy])

    expect(
      screen.getByRole('region', { name: 'Детали отклика Senior React Developer' }),
    ).toBeTruthy()
    expect(screen.getByText(vacancy.description)).toBeTruthy()
    expect(screen.getAllByText('Дата отклика')).toHaveLength(2)
    expect(screen.getAllByText(/Первый просмотр/)).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /приглаш|встреч|перенести/i })).toBeNull()
  })

  it('selects another application and lets the applicant hide and re-show its details', () => {
    const secondApplication = {
      ...application,
      vacancyId: 'vacancy-2',
      vacancyTitle: 'Frontend Engineer',
    }
    renderApplications([], [application, secondApplication])

    fireEvent.click(
      screen.getByRole('button', { name: 'Показать детали отклика Frontend Engineer' }),
    )
    expect(screen.getByRole('region', { name: 'Детали отклика Frontend Engineer' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Скрыть детали отклика Frontend Engineer' }))
    expect(screen.queryByRole('region', { name: 'Детали отклика Frontend Engineer' })).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Показать детали отклика Frontend Engineer' }),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: 'Показать детали отклика Frontend Engineer' }),
    )
    expect(screen.getByRole('region', { name: 'Детали отклика Frontend Engineer' })).toBeTruthy()
  })

  it('selects the first response when applications arrive after initial render', () => {
    const { rerender } = renderApplications([], [])
    expect(
      screen.queryByRole('region', { name: 'Детали отклика Senior React Developer' }),
    ).toBeNull()

    rerender(
      <ApplicantApplicationsSection
        applications={[application]}
        isError={false}
        isLoading={false}
        unclassifiedCandidateLinksCount={0}
        vacancies={[vacancy]}
      />,
    )

    expect(
      screen.getByRole('region', { name: 'Детали отклика Senior React Developer' }),
    ).toBeTruthy()
  })

  it('falls back to the first remaining response and clears details when applications become empty', () => {
    const secondApplication = {
      ...application,
      vacancyId: 'vacancy-2',
      vacancyTitle: 'Frontend Engineer',
    }
    const { rerender } = renderApplications([vacancy], [application, secondApplication])

    fireEvent.click(
      screen.getByRole('button', { name: 'Показать детали отклика Frontend Engineer' }),
    )
    expect(
      screen.getByRole('region', { name: 'Детали отклика Frontend Engineer' }),
    ).toBeTruthy()

    rerender(
      <ApplicantApplicationsSection
        applications={[application]}
        isError={false}
        isLoading={false}
        unclassifiedCandidateLinksCount={0}
        vacancies={[vacancy]}
      />,
    )
    expect(
      screen.getByRole('region', { name: 'Детали отклика Senior React Developer' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('region', { name: 'Детали отклика Frontend Engineer' }),
    ).toBeNull()

    rerender(
      <ApplicantApplicationsSection
        applications={[]}
        isError={false}
        isLoading={false}
        unclassifiedCandidateLinksCount={0}
        vacancies={[vacancy]}
      />,
    )
    expect(screen.queryByRole('region')).toBeNull()
    expect(screen.getByText('Подтверждённых откликов пока нет.')).toBeTruthy()
  })

  it('states when vacancy details are unavailable instead of filling missing data', () => {
    renderApplications([])

    expect(screen.getByText('Описание вакансии сейчас недоступно.')).toBeTruthy()
  })
})
