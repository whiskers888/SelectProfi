import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WorkspaceCandidate } from '../model/data'
import { CandidateDetailsPagePanel } from './CandidateDetailsPagePanel'

afterEach(cleanup)

const candidate: WorkspaceCandidate = {
  id: 'candidate-1',
  name: 'Мария Соколова',
  position: 'Рекрутер',
  orderId: 'order-1',
  source: 'База кандидатов',
  rating: '4.8',
  statusLabel: 'В рабочем списке',
  statusTone: 'warning',
  comment: 'Синтетическая заметка из даты обновления',
}

describe('CandidateDetailsPagePanel', () => {
  it('shows candidate information without claiming a purchase or recruiter comments', () => {
    render(<CandidateDetailsPagePanel candidate={candidate} onBack={vi.fn()} />)

    expect(screen.getByText('Информация о кандидате')).toBeInTheDocument()
    expect(screen.getByText('Покупка профиля и доступ к комментариям не поддерживаются.')).toBeInTheDocument()
    expect(screen.queryByText(candidate.comment)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Купить' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Куплено' })).not.toBeInTheDocument()
  })

  it('keeps the back action working', () => {
    const onBack = vi.fn()
    render(<CandidateDetailsPagePanel candidate={candidate} onBack={onBack} />)

    fireEvent.click(screen.getByRole('button', { name: 'Назад' }))

    expect(onBack).toHaveBeenCalledOnce()
  })
})
