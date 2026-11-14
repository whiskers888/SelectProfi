import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ApplicantDashboardApplicationResponse } from '@/shared/api/dashboard/api'

interface ApplicantApplicationsSectionProps {
  applications: ApplicantDashboardApplicationResponse[]
  isError: boolean
  isLoading: boolean
  onRetry?: () => void
  unclassifiedCandidateLinksCount: number
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
}

export function ApplicantApplicationsSection({
  applications,
  isError,
  isLoading,
  onRetry,
  unclassifiedCandidateLinksCount,
}: ApplicantApplicationsSectionProps) {
  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Мои отклики</CardTitle>
        <CardDescription>Текущий этап и активность по отправленным резюме.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="preview11-loading" role="status">
            <span aria-hidden="true" className="preview11-loading-spin" />
            <span>Загружаем отклики...</span>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
            <p>Не удалось загрузить список откликов.</p>
            {onRetry ? (
              <button
                className="mt-2 rounded-md border border-current px-3 py-1 font-medium"
                onClick={onRetry}
                type="button"
              >
                Повторить
              </button>
            ) : null}
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground" role="status">
            Подтверждённых откликов пока нет.
          </div>
        ) : (
          <Table stackOnMobile>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Вакансия</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата отклика</TableHead>
                <TableHead>Активность резюме</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.vacancyId}>
                  <TableCell className="font-medium" data-label="Вакансия">
                    <div>{application.vacancyTitle}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {application.companyName?.trim() || 'Работодатель'}
                    </div>
                  </TableCell>
                  <TableCell data-label="Статус">
                    <Badge variant={application.stage === 'Shortlist' ? 'success' : 'neutral'}>
                      {application.stage === 'Shortlist' ? 'В шорт-листе' : 'Отклик отправлен'}
                    </Badge>
                  </TableCell>
                  <TableCell data-label="Дата отклика">{formatDate(application.submittedAtUtc)}</TableCell>
                  <TableCell data-label="Активность резюме">
                    {application.firstViewedAtUtc
                      ? `Первый просмотр ${formatDate(application.firstViewedAtUtc)}`
                      : 'Просмотр ещё не зафиксирован'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {unclassifiedCandidateLinksCount > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground" role="note">
            У {unclassifiedCandidateLinksCount} записей не сохранён источник, поэтому они не включены в список откликов.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
