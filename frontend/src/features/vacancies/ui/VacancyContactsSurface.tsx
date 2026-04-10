import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ExecutorCandidateContactsResponse, SelectedCandidateContactsResponse } from '@/shared/api/candidates'

export type VacancyContactsSurfaceProps = {
  selectedCandidateContacts: SelectedCandidateContactsResponse | null
  executorCandidateContacts: ExecutorCandidateContactsResponse | null
}

export function VacancyContactsSurface({
  selectedCandidateContacts,
  executorCandidateContacts,
}: VacancyContactsSurfaceProps) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Контакты кандидата</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!selectedCandidateContacts && !executorCandidateContacts ? <Alert>Контакты еще не загружены.</Alert> : null}

        {selectedCandidateContacts ? (
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">Контакты выбранного кандидата (Customer)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              <p>CandidateId: {selectedCandidateContacts.candidateId}</p>
              <p>ФИО: {selectedCandidateContacts.fullName}</p>
              <p>Email: {selectedCandidateContacts.email ?? '—'}</p>
              <p>Телефон: {selectedCandidateContacts.phone ?? '—'}</p>
            </CardContent>
          </Card>
        ) : null}

        {executorCandidateContacts ? (
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">Контакты кандидата в вакансии (Executor)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              <p>CandidateId: {executorCandidateContacts.candidateId}</p>
              <p>ФИО: {executorCandidateContacts.fullName}</p>
              <p>Email: {executorCandidateContacts.email ?? '—'}</p>
              <p>Телефон: {executorCandidateContacts.phone ?? '—'}</p>
              <p>Доступ до: {executorCandidateContacts.contactsAccessExpiresAtUtc}</p>
            </CardContent>
          </Card>
        ) : null}
      </CardContent>
    </Card>
  )
}
