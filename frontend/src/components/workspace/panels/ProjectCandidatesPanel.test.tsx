import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WorkspaceCandidate } from '../model/data'
import { ProjectCandidatesPanel } from './ProjectCandidatesPanel'

afterEach(cleanup)

const candidate: WorkspaceCandidate = {
  id: 'candidate-1',
  name: 'Мария Соколова',
  position: 'Менеджер по продажам',
  orderId: 'order-1',
  source: 'База кандидатов',
  stage: 'Pool',
  isCustomerSubmitted: false,
  rating: '—',
  statusLabel: 'В рабочем списке',
  statusTone: 'warning',
  comment: '',
}

const defaultProps = {
  candidates: [candidate],
  canAddCandidate: true,
  canManageCandidates: true,
  isCustomerViewer: false,
  isExecutorViewer: true,
  isLoading: false,
  isError: false,
  isRemovingCandidate: false,
  isSubmittingCandidateList: false,
  requestedCandidatesCount: 1,
  vacancyIsPublished: true,
}

describe('ProjectCandidatesPanel', () => {
  it('requires confirmation before unlinking a candidate from the project', async () => {
    const onRemoveCandidate = vi.fn(async () => true)
    render(<ProjectCandidatesPanel {...defaultProps} onRemoveCandidate={onRemoveCandidate} />)

    fireEvent.click(screen.getByRole('button', { name: `Удалить ${candidate.name} из проекта` }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(onRemoveCandidate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Удалить из проекта' }))
    await waitFor(() => expect(onRemoveCandidate).toHaveBeenCalledWith(candidate.id))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('keeps the official customer list read-only', () => {
    const submittedCandidate = { ...candidate, isCustomerSubmitted: true }
    render(
      <ProjectCandidatesPanel
        {...defaultProps}
        candidates={[submittedCandidate]}
        submittedAtUtc="2026-11-15T10:00:00Z"
      />,
    )

    expect(screen.getByText('Список кандидатов для заказчика')).toBeTruthy()
    expect(screen.getByText('Отправлен')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Удалить/ })).toBeNull()
  })
})
