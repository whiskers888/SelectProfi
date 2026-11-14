import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApplicantDashboardApplicationResponse } from '@/shared/api/dashboard/api'
import type { VacancyResponse } from '@/shared/api/vacancies'

interface ApplicantApplicationsSectionProps {
  applications: ApplicantDashboardApplicationResponse[]
  vacancies: VacancyResponse[]
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
  vacancies,
  isError,
  isLoading,
  onRetry,
  unclassifiedCandidateLinksCount,
}: ApplicantApplicationsSectionProps) {
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null)
  const [detailsVisible, setDetailsVisible] = useState(true)
  const effectiveSelectedVacancyId = applications.some(
    (application) => application.vacancyId === selectedVacancyId,
  )
    ? selectedVacancyId
    : (applications[0]?.vacancyId ?? null)
  const selectedApplication =
    applications.find((application) => application.vacancyId === effectiveSelectedVacancyId) ?? null
  const selectedVacancy =
    vacancies.find((vacancy) => vacancy.id === selectedApplication?.vacancyId) ?? null

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
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            role="alert"
          >
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
          <div
            className="rounded-xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground"
            role="status"
          >
            Подтверждённых откликов пока нет.
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.7fr)]">
            <div className="grid min-w-0 content-start gap-2">
              {applications.map((application) => {
                const isSelected = effectiveSelectedVacancyId === application.vacancyId
                return (
                  <article
                    className="min-w-0 rounded-lg border border-border p-3"
                    key={application.vacancyId}
                  >
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold text-foreground">
                          {application.vacancyTitle}
                        </h3>
                        <p className="break-words text-xs text-muted-foreground">
                          {application.companyName?.trim() || 'Работодатель'}
                        </p>
                      </div>
                      <Badge variant={application.stage === 'Shortlist' ? 'success' : 'neutral'}>
                        {application.stage === 'Shortlist' ? 'В шорт-листе' : 'Отклик отправлен'}
                      </Badge>
                    </div>
                    <dl className="mt-3 grid min-w-0 gap-2 text-xs sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Дата отклика</dt>
                        <dd className="mt-0.5 font-medium text-foreground">
                          {formatDate(application.submittedAtUtc)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Активность резюме</dt>
                        <dd className="mt-0.5 break-words font-medium text-foreground">
                          {application.firstViewedAtUtc
                            ? `Первый просмотр ${formatDate(application.firstViewedAtUtc)}`
                            : 'Просмотр ещё не зафиксирован'}
                        </dd>
                      </div>
                    </dl>
                    <button
                      aria-controls={
                        detailsVisible && isSelected ? 'applicant-application-details' : undefined
                      }
                      aria-expanded={detailsVisible && isSelected}
                      aria-label={`${detailsVisible && isSelected ? 'Скрыть' : 'Показать'} детали отклика ${application.vacancyTitle}`}
                      className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted"
                      onClick={() => {
                        if (isSelected && detailsVisible) {
                          setDetailsVisible(false)
                          return
                        }
                        setSelectedVacancyId(application.vacancyId)
                        setDetailsVisible(true)
                      }}
                      type="button"
                    >
                      {detailsVisible && isSelected ? 'Скрыть' : 'Подробнее'}
                    </button>
                  </article>
                )
              })}
            </div>
            {selectedApplication && detailsVisible ? (
              <section
                aria-label={`Детали отклика ${selectedApplication.vacancyTitle}`}
                className="min-w-0 rounded-xl border border-border bg-muted/40 p-4"
                id="applicant-application-details"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedApplication.vacancyTitle}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedApplication.companyName?.trim() || 'Работодатель'}
                    </p>
                  </div>
                  <Badge
                    variant={selectedApplication.stage === 'Shortlist' ? 'success' : 'neutral'}
                  >
                    {selectedApplication.stage === 'Shortlist'
                      ? 'В шорт-листе'
                      : 'Отклик отправлен'}
                  </Badge>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Дата отклика</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {formatDate(selectedApplication.submittedAtUtc)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Первый просмотр</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {selectedApplication.firstViewedAtUtc
                        ? formatDate(selectedApplication.firstViewedAtUtc)
                        : 'Просмотр ещё не зафиксирован'}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-border pt-4">
                  <h4 className="text-sm font-semibold text-foreground">Описание вакансии</h4>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {selectedVacancy?.description.trim() || 'Описание вакансии сейчас недоступно.'}
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        )}
        {unclassifiedCandidateLinksCount > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground" role="note">
            У {unclassifiedCandidateLinksCount} записей не сохранён источник, поэтому они не
            включены в список откликов.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
