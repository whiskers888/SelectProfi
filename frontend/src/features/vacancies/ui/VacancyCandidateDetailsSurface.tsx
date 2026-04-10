import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { VacancyCandidateStageContract } from '@/shared/api/candidates'

export type VacancyCandidateDetailsSurfaceProps = {
  canSelectCandidate: boolean
  canReadSelectedContacts: boolean
  canReadExecutorContacts: boolean
  isSelectionActionLoading: boolean
  currentVacancyId: string
  currentCandidateId: string
  candidatePublicAlias: string | null
  candidateStage: VacancyCandidateStageContract | null
  candidateUpdatedAtUtc: string | null
  candidateIsSelected: boolean
  onSelectCandidate: () => void | Promise<void>
  onGetSelectedCandidateContacts: () => void | Promise<void>
  onGetExecutorCandidateContacts: () => void | Promise<void>
}

export function VacancyCandidateDetailsSurface({
  canSelectCandidate,
  canReadSelectedContacts,
  canReadExecutorContacts,
  isSelectionActionLoading,
  currentVacancyId,
  currentCandidateId,
  candidatePublicAlias,
  candidateStage,
  candidateUpdatedAtUtc,
  candidateIsSelected,
  onSelectCandidate,
  onGetSelectedCandidateContacts,
  onGetExecutorCandidateContacts,
}: VacancyCandidateDetailsSurfaceProps) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Карточка выбранного кандидата</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!canSelectCandidate && !canReadExecutorContacts ? (
          <Alert>Операции выбора и чтения контактов доступны заказчику или исполнителю.</Alert>
        ) : null}
        {!currentVacancyId ? <Alert>Выберите вакансию в таблице.</Alert> : null}
        {currentVacancyId && !currentCandidateId ? <Alert>Выберите кандидата в таблице вакансии.</Alert> : null}

        {currentVacancyId && currentCandidateId ? (
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <p>CandidateId: {currentCandidateId}</p>
            <p>Public alias: {candidatePublicAlias ?? '—'}</p>
            <p>Stage: {candidateStage ?? '—'}</p>
            <p>Selected: {candidateIsSelected ? 'Да' : 'Нет'}</p>
            <p>UpdatedAtUtc: {candidateUpdatedAtUtc ?? '—'}</p>
          </div>
        ) : null}

        <div className="flex gap-2">
          {canSelectCandidate ? (
            <Button
              type="button"
              onClick={() => void onSelectCandidate()}
              disabled={isSelectionActionLoading || !currentCandidateId}
            >
              Select candidate
            </Button>
          ) : null}
          {canReadSelectedContacts ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void onGetSelectedCandidateContacts()}
              disabled={isSelectionActionLoading}
            >
              Selected contacts
            </Button>
          ) : null}
          {canReadExecutorContacts ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void onGetExecutorCandidateContacts()}
              disabled={isSelectionActionLoading || !currentCandidateId}
            >
              Candidate contacts
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
