import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WorkspaceCandidate } from '../model/data'
import { CandidateCreatePagePanel } from './CandidateCreatePagePanel'

afterEach(cleanup)

const baseCandidate: WorkspaceCandidate = {
  id: 'candidate-base',
  name: 'Мария Соколова',
  position: '',
  vacancyTitle: 'Менеджер по продажам',
  orderId: 'order-1',
  source: 'База кандидатов',
  experienceYears: 2,
  rating: '—',
  statusLabel: '',
  statusTone: 'neutral',
  comment: '',
}

const applicantResponder: WorkspaceCandidate = {
  ...baseCandidate,
  id: 'candidate-response',
  name: 'Иван Петров',
  stage: 'Pool',
  applicantSubmittedAtUtc: '2026-11-15T10:00:00Z',
  statusLabel: 'В рабочем списке',
}

describe('CandidateCreatePagePanel', () => {
  it('shows all three sources and runs the real add-from-base action', async () => {
    const onAddCandidateFromBase = vi.fn(async () => true)

    render(
      <CandidateCreatePagePanel
        applicantResponders={[applicantResponder]}
        assignedCandidateIds={[]}
        availableCandidates={[baseCandidate]}
        canAddToProject
        formValues={{
          fullName: '',
          birthDate: '',
          email: '',
          phone: '',
          specialization: '',
          specializationId: '',
          resumeTitle: '',
          experienceYears: '',
          resumeRichTextHtml: '',
          resumeAttachmentLinks: '',
        }}
        onAddCandidateFromBase={onAddCandidateFromBase}
        onBack={vi.fn()}
        onFieldChange={vi.fn()}
        onSubmit={vi.fn()}
        specializationOptions={[]}
        orderTitle="Менеджер по продажам"
      />,
    )

    expect(screen.getByRole('tab', { name: 'Из своей базы' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Из откликов' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Загрузить резюме' })).toBeTruthy()
    expect(screen.getByText(baseCandidate.name)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Добавить в проект' }))
    expect(onAddCandidateFromBase).toHaveBeenCalledWith(baseCandidate.id)

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Из откликов' }), { button: 0, ctrlKey: false })
    expect(await screen.findByText(applicantResponder.name)).toBeTruthy()
    expect(screen.getByText('Уже в проекте')).toBeTruthy()

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Загрузить резюме' }), { button: 0, ctrlKey: false })
    expect(screen.getByRole('heading', { name: 'Загрузить резюме' })).toBeTruthy()
    expect(screen.getByLabelText('Опыт работы, лет')).toBeTruthy()
  })
})
