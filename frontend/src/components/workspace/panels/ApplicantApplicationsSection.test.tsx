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

function renderApplications(vacancies: VacancyResponse[]) {
  return render(
    <ApplicantApplicationsSection
      applications={[application]}
      isError={false}
      isLoading={false}
      unclassifiedCandidateLinksCount={0}
      vacancies={vacancies}
    />,
  )
}

describe('ApplicantApplicationsSection', () => {
  it('shows a selected application with the real vacancy description and saved activity', () => {
    renderApplications([vacancy])

    fireEvent.click(screen.getByRole('button', { name: 'Показать детали отклика Senior React Developer' }))

    expect(screen.getByRole('region', { name: 'Детали отклика Senior React Developer' })).toBeTruthy()
    expect(screen.getByText(vacancy.description)).toBeTruthy()
    expect(screen.getAllByText('Дата отклика')).toHaveLength(2)
    expect(screen.getAllByText(/Первый просмотр/)).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /приглаш|встреч|перенести/i })).toBeNull()
  })

  it('states when vacancy details are unavailable instead of filling missing data', () => {
    renderApplications([])

    fireEvent.click(screen.getByRole('button', { name: 'Показать детали отклика Senior React Developer' }))

    expect(screen.getByText('Описание вакансии сейчас недоступно.')).toBeTruthy()
  })
})
