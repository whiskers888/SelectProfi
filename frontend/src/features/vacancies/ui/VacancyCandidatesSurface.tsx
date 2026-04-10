import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { VacancyCandidateStageContract } from '@/shared/api/candidates'

export type VacancyCandidatesSurfaceProps = {
  canReadVacancyCandidates: boolean
  currentVacancyId: string
  isVacancyCandidatesFetching: boolean
  vacancyCandidatesError: unknown
  vacancyCandidates: Array<{
    vacancyCandidateId: string
    candidateId: string
    publicAlias: string
    stage: VacancyCandidateStageContract
    updatedAtUtc: string
    isSelected: boolean
  }>
  currentCandidateId: string
  backendSelectedCandidateId: string
  onSelectCandidateId: (candidateId: string) => void
  getRequestErrorMessage: (error: unknown) => string
}

export function VacancyCandidatesSurface({
  canReadVacancyCandidates,
  currentVacancyId,
  isVacancyCandidatesFetching,
  vacancyCandidatesError,
  vacancyCandidates,
  currentCandidateId,
  backendSelectedCandidateId,
  onSelectCandidateId,
  getRequestErrorMessage,
}: VacancyCandidatesSurfaceProps) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Кандидаты выбранной вакансии</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!canReadVacancyCandidates ? <Alert>Список кандидатов доступен только ролям Customer, Admin и Executor.</Alert> : null}
        {canReadVacancyCandidates && !currentVacancyId ? (
          <Alert>Выберите вакансию в таблице, чтобы загрузить pipeline кандидатов.</Alert>
        ) : null}
        {canReadVacancyCandidates && currentVacancyId && isVacancyCandidatesFetching ? <Alert>Загрузка кандидатов...</Alert> : null}
        {canReadVacancyCandidates && currentVacancyId && vacancyCandidatesError ? (
          <Alert variant="destructive">{getRequestErrorMessage(vacancyCandidatesError)}</Alert>
        ) : null}
        {canReadVacancyCandidates &&
        currentVacancyId &&
        !isVacancyCandidatesFetching &&
        !vacancyCandidatesError &&
        vacancyCandidates.length === 0 ? (
          <Alert>В pipeline этой вакансии пока нет кандидатов.</Alert>
        ) : null}
        {canReadVacancyCandidates &&
        currentVacancyId &&
        !isVacancyCandidatesFetching &&
        !vacancyCandidatesError &&
        vacancyCandidates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Public alias</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Selected</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[160px]">Контекст</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacancyCandidates.map((item) => (
                <TableRow
                  key={item.vacancyCandidateId}
                  className={item.candidateId === currentCandidateId ? 'bg-slate-50' : undefined}
                >
                  <TableCell>{item.publicAlias}</TableCell>
                  <TableCell>{item.stage}</TableCell>
                  <TableCell>{item.isSelected ? 'Да' : 'Нет'}</TableCell>
                  <TableCell>{item.updatedAtUtc}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant={item.candidateId === currentCandidateId ? 'default' : 'outline'}
                      onClick={() => onSelectCandidateId(item.candidateId)}
                    >
                      Использовать ID
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
        {backendSelectedCandidateId ? <Alert>Selected candidate (backend): {backendSelectedCandidateId}</Alert> : null}
      </CardContent>
    </Card>
  )
}
