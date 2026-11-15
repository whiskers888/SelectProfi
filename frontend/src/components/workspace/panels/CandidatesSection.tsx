import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatExperienceYears, getWorkspaceCandidatePipelineStage } from '../shell/workspaceShell.helpers'
import { workspaceToneToBadgeVariant } from '../model/data'
import type { MainFeedPanelViewProps } from './MainFeedPanel.types'

interface CandidatesSectionProps extends MainFeedPanelViewProps {
  dashboardSummary?: boolean
}

export function CandidatesSection({
  candidateDataScope,
  candidateSourceFilter,
  candidateStageFilter,
  filteredCandidateRows,
  handleCandidateSourceFilterChange,
  handleCandidateStageFilterChange,
  hasActiveCandidateFilters,
  isApplicantView,
  isCandidateDataError = false,
  isCandidateDataLoading = false,
  isSelectingVacancyCandidate = false,
  isBaseScope,
  isCandidateFiltersMenuOpen,
  onRetryCandidateData,
  onOpenCandidate,
  setCandidateDataScope,
  setCandidateSourceFilter,
  setCandidateStageFilter,
  setIsCandidateFiltersMenuOpen,
  shouldShowBaseCandidateTab,
  shouldShowCandidateFilters,
  shouldShowCandidateScopeSwitcher,
  dashboardSummary = false,
  canSelectFinalist = false,
  hasSelectedFinalist = false,
  onSelectVacancyCandidate,
  role,
}: CandidatesSectionProps) {
  const isCustomerDashboardSummary = dashboardSummary && role === 'Customer'
  const isExecutorDashboardSummary = dashboardSummary && role === 'Executor'
  const visibleCandidateRows = dashboardSummary ? filteredCandidateRows.slice(0, 5) : filteredCandidateRows

  return (
    <Card className="rounded-xl border-border p-4 shadow-none">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {isCustomerDashboardSummary
              ? 'Список кандидатов'
              : isExecutorDashboardSummary
                ? 'Рабочий список и список кандидатов'
              : isApplicantView
                ? 'Мои резюме'
                : 'Мои кандидаты'}
          </h3>
          {dashboardSummary ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {isCustomerDashboardSummary
                ? 'Псевдонимы и статус по выбранной вакансии.'
                : 'Кандидаты из ваших вакансий, полученные через API.'}
            </p>
          ) : null}
        </div>
        {!dashboardSummary ? (
          <div className="relative flex flex-wrap items-center gap-2">
          {shouldShowCandidateScopeSwitcher ? (
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
              <button
                className={cn(
                  'h-8 rounded-md px-3 text-xs font-medium',
                  candidateDataScope === 'mine' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                )}
                onClick={() => setCandidateDataScope('mine')}
                type="button"
              >
                Мои кандидаты
              </button>
              {shouldShowBaseCandidateTab ? (
                <button
                  className={cn(
                    'h-8 rounded-md px-3 text-xs font-medium',
                    candidateDataScope === 'base' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                  )}
                  onClick={() => setCandidateDataScope('base')}
                  type="button"
                >
                  База кандидатов
                </button>
              ) : null}
            </div>
          ) : null}
          {shouldShowCandidateFilters ? (
            <>
              <button
                className={cn(
                  'h-9 rounded-lg border px-3 text-sm',
                  hasActiveCandidateFilters
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted',
                )}
                onClick={() => setIsCandidateFiltersMenuOpen((previousValue) => !previousValue)}
                type="button"
              >
                Фильтры
              </button>
              <div
                className={cn(
                  'absolute right-0 top-full z-20 mt-2 w-[280px] rounded-xl border border-border bg-card p-3 shadow-lg transition-all duration-200',
                  isCandidateFiltersMenuOpen
                    ? 'translate-x-0 opacity-100'
                    : 'pointer-events-none translate-x-3 opacity-0',
                )}
              >
                <div className="space-y-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Кандидаты</p>
                    <select
                      className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                      onChange={(event) => handleCandidateSourceFilterChange(event.target.value)}
                      value={candidateSourceFilter}
                    >
                      <option value="all">Все</option>
                      <option value="registered">Зарегистрированные</option>
                      <option value="recruiter">Рекрутерские</option>
                    </select>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Этапы</p>
                    <select
                      className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                      onChange={(event) => handleCandidateStageFilterChange(event.target.value)}
                      value={candidateStageFilter}
                    >
                      <option value="all">Все</option>
                      <option value="pool">Рабочий список</option>
                      <option value="shortlist">Список кандидатов</option>
                      <option value="selected">Выбран</option>
                      <option value="no_stage">Без этапа</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      className="h-8 rounded-lg border border-border px-2 text-xs text-muted-foreground hover:bg-muted"
                      onClick={() => {
                        setCandidateSourceFilter('all')
                        setCandidateStageFilter('all')
                      }}
                      type="button"
                    >
                      Сбросить
                    </button>
                    <button
                      className="h-8 rounded-lg bg-foreground px-3 text-xs text-primary-foreground hover:bg-foreground/85"
                      onClick={() => setIsCandidateFiltersMenuOpen(false)}
                      type="button"
                    >
                      Применить
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          </div>
        ) : null}
      </div>
      {isCandidateDataError ? (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          <p>
            {isExecutorDashboardSummary
              ? 'Не удалось загрузить списки кандидатов.'
              : 'Не удалось загрузить список кандидатов.'}
          </p>
          {onRetryCandidateData ? (
            <button
              className="mt-2 rounded-md border border-current px-3 py-1 text-sm font-medium"
              onClick={onRetryCandidateData}
              type="button"
            >
              Повторить
            </button>
          ) : null}
        </div>
      ) : null}
      {isCandidateDataLoading && filteredCandidateRows.length === 0 ? (
        <div className="preview11-loading" role="status">
          <span aria-hidden="true" className="preview11-loading-spin" />
          <span>
            {isExecutorDashboardSummary
              ? 'Загружаем кандидатов из ваших вакансий...'
              : 'Загружаем список кандидатов...'}
          </span>
        </div>
      ) : filteredCandidateRows.length === 0 ? (
        isCandidateDataError ? null : (
        <div className="rounded-xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
          {isCustomerDashboardSummary
            ? 'В списке кандидатов пока нет записей.'
            : isExecutorDashboardSummary
              ? 'В рабочем списке и списке кандидатов пока нет записей.'
            : isApplicantView
              ? 'Резюме пока не добавлены.'
              : 'Кандидаты по текущим фильтрам не найдены.'}
        </div>
        )
      ) : (
        <Table stackOnMobile>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                {isCustomerDashboardSummary ? 'Псевдоним' : isApplicantView ? 'Резюме' : 'Кандидат'}
              </TableHead>
              <TableHead>Опыт</TableHead>
              {dashboardSummary ? (
                <TableHead>Вакансия</TableHead>
              ) : !isBaseScope ? (
                <TableHead>Источник</TableHead>
              ) : null}
              <TableHead>{dashboardSummary ? 'Обновлено' : 'Рейтинг'}</TableHead>
              {!isBaseScope ? <TableHead>Статус</TableHead> : null}
              {isCustomerDashboardSummary ? <TableHead>Действие</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCandidateRows.map((candidate) => (
              <TableRow
                key={candidate.id}
                className={dashboardSummary ? '' : 'cursor-pointer'}
                onClick={dashboardSummary ? undefined : () => onOpenCandidate(candidate)}
              >
                <TableCell className="font-medium">
                  {dashboardSummary ? (
                    <button
                      className="text-left font-medium text-primary hover:underline"
                      onClick={() => onOpenCandidate(candidate)}
                      type="button"
                    >
                      {candidate.name}
                    </button>
                  ) : (
                    candidate.name
                  )}
                </TableCell>
                <TableCell data-label="Опыт">{formatExperienceYears(candidate.experienceYears)}</TableCell>
                {dashboardSummary ? (
                  <TableCell data-label="Вакансия">{candidate.position}</TableCell>
                ) : !isBaseScope ? (
                  <TableCell data-label="Источник">{candidate.source}</TableCell>
                ) : null}
                <TableCell data-label={dashboardSummary ? 'Обновлено' : 'Рейтинг'}>
                  {dashboardSummary ? candidate.comment : candidate.rating}
                </TableCell>
                {!isBaseScope ? (
                  <TableCell>
                    {candidate.statusLabel.trim() ? (
                      <Badge variant={workspaceToneToBadgeVariant(candidate.statusTone)}>{candidate.statusLabel}</Badge>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </TableCell>
                ) : null}
                {isCustomerDashboardSummary ? (
                  <TableCell data-label="Действие">
                    {candidate.statusLabel === 'Выбран' ? (
                      <span className="whitespace-nowrap text-sm font-medium text-primary">
                        Финалист выбран
                      </span>
                    ) : getWorkspaceCandidatePipelineStage(candidate) === 'Shortlist' && hasSelectedFinalist ? (
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        Финалист уже выбран
                      </span>
                    ) : getWorkspaceCandidatePipelineStage(candidate) === 'Shortlist' && !canSelectFinalist ? (
                      <span className="text-sm text-muted-foreground">
                        Доступно после публикации вакансии
                      </span>
                    ) : getWorkspaceCandidatePipelineStage(candidate) === 'Shortlist' && onSelectVacancyCandidate ? (
                      <button
                        aria-label={`Выбрать финалистом ${candidate.name}`}
                        className="h-8 whitespace-nowrap rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSelectingVacancyCandidate}
                        onClick={() => {
                          void onSelectVacancyCandidate(candidate.orderId, candidate.id)
                        }}
                        type="button"
                      >
                        {isSelectingVacancyCandidate ? 'Выбираем…' : 'Выбрать финалистом'}
                      </button>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}
