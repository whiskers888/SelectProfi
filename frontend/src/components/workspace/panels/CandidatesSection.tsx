import { useState } from 'react'
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
  view,
}: CandidatesSectionProps) {
  const [baseSearch, setBaseSearch] = useState('')
  const [baseExperienceFilter, setBaseExperienceFilter] = useState<'all' | '0-2' | '3-5' | '6+'>('all')
  const isCustomerDashboardSummary = dashboardSummary && role === 'Customer'
  const isExecutorDashboardSummary = dashboardSummary && role === 'Executor'
  const sectionTitle = isCustomerDashboardSummary
    ? 'Список кандидатов'
    : isExecutorDashboardSummary
      ? 'Рабочий список и список кандидатов'
      : isBaseScope
        ? 'База кандидатов'
        : isApplicantView
          ? 'Мои резюме'
          : 'Мои кандидаты'
  const matchingBaseCandidates = isBaseScope
    ? filteredCandidateRows.filter((candidate) => {
        const search = baseSearch.trim().toLocaleLowerCase('ru-RU')
        const matchesSearch = !search ||
          `${candidate.name} ${candidate.position ?? ''} ${candidate.experienceSummary ?? ''} ${candidate.source} ${formatExperienceYears(candidate.experienceYears)}`
            .toLocaleLowerCase('ru-RU')
            .includes(search)
        const experience = candidate.experienceYears
        const matchesExperience = baseExperienceFilter === 'all' || (
          typeof experience === 'number' && (
            baseExperienceFilter === '0-2'
              ? experience >= 0 && experience <= 2
              : baseExperienceFilter === '3-5'
                ? experience >= 3 && experience <= 5
                : experience >= 6
          )
        )
        return matchesSearch && matchesExperience
      })
    : filteredCandidateRows
  const visibleCandidateRows = dashboardSummary
    ? filteredCandidateRows.slice(0, 5)
    : matchingBaseCandidates

  return (
    <Card className={cn('rounded-xl border-border p-4 shadow-none', isBaseScope && role === 'Executor' && 'border-0 bg-transparent p-0')}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          {view === 'candidates' ? (
            <h1 className={cn('text-xl font-extrabold leading-tight text-foreground', isBaseScope && role === 'Executor' && 'text-3xl font-semibold tracking-tight')}>{sectionTitle}</h1>
          ) : (
            <h3 className="text-base font-semibold text-foreground">{sectionTitle}</h3>
          )}
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
          {shouldShowCandidateFilters && !isBaseScope ? (
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
      {isBaseScope ? (
        <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside aria-label="Фильтры базы кандидатов" className="h-fit rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Фильтры</h2>
              <button
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => {
                  setCandidateSourceFilter('all')
                  setCandidateStageFilter('all')
                  setBaseExperienceFilter('all')
                  setBaseSearch('')
                }}
                type="button"
              >
                Сбросить
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-medium text-muted-foreground">
                Источник
                <select
                  aria-label="Фильтр по источнику кандидата"
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  onChange={(event) => handleCandidateSourceFilterChange(event.target.value)}
                  value={candidateSourceFilter}
                >
                  <option value="all">Все источники</option>
                  <option value="registered">Зарегистрированные</option>
                  <option value="recruiter">Добавленные исполнителем</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-muted-foreground">
                Этап
                <select
                  aria-label="Фильтр по этапу кандидата"
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  onChange={(event) => handleCandidateStageFilterChange(event.target.value)}
                  value={candidateStageFilter}
                >
                  <option value="all">Все этапы</option>
                  <option value="pool">Рабочий список</option>
                  <option value="shortlist">Список кандидатов</option>
                  <option value="selected">Выбран</option>
                  <option value="no_stage">Без этапа</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-muted-foreground">
                Опыт работы
                <select
                  aria-label="Фильтр по опыту работы"
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === 'all' || value === '0-2' || value === '3-5' || value === '6+') {
                      setBaseExperienceFilter(value)
                    }
                  }}
                  value={baseExperienceFilter}
                >
                  <option value="all">Любой опыт</option>
                  <option value="0-2">До 2 лет</option>
                  <option value="3-5">3–5 лет</option>
                  <option value="6+">6 лет и больше</option>
                </select>
              </label>
            </div>
          </aside>

          <section aria-label="Результаты поиска по базе кандидатов" className="min-w-0">
            <label className="block text-xs font-medium text-muted-foreground">
              Поиск по имени или источнику
              <input
                aria-label="Поиск по базе кандидатов"
                className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                onChange={(event) => setBaseSearch(event.target.value)}
                placeholder="Введите имя или источник"
                type="search"
                value={baseSearch}
              />
            </label>
            <p aria-live="polite" className="my-4 text-sm font-medium text-foreground">
              Найдено профилей · {visibleCandidateRows.length}
            </p>
            {isCandidateDataError ? (
              <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
                <p>Не удалось загрузить список кандидатов.</p>
                {onRetryCandidateData ? (
                  <button className="mt-2 rounded-md border border-current px-3 py-1 text-sm font-medium" onClick={onRetryCandidateData} type="button">
                    Повторить
                  </button>
                ) : null}
              </div>
            ) : null}
            {isCandidateDataLoading && filteredCandidateRows.length === 0 ? (
              <div className="preview11-loading" role="status">
                <span aria-hidden="true" className="preview11-loading-spin" />
                <span>Загружаем список кандидатов...</span>
              </div>
            ) : visibleCandidateRows.length === 0 ? (
              isCandidateDataError ? null : (
                <div className="rounded-xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
                  {filteredCandidateRows.length === 0 && !hasActiveCandidateFilters
                    ? 'В базе пока нет доступных кандидатов.'
                    : 'По выбранным условиям кандидаты не найдены.'}
                </div>
              )
            ) : (
              <div className="space-y-3">
                {visibleCandidateRows.map((candidate) => (
                  <button
                    aria-label={`Открыть профиль ${candidate.name}`}
                    className="flex w-full min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-row sm:items-start sm:justify-between sm:p-5"
                    key={candidate.id}
                    onClick={() => onOpenCandidate(candidate)}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-lg font-semibold text-foreground">{candidate.name}</span>
                      <span className="mt-2 block text-sm text-muted-foreground">Источник: {candidate.source || 'Не указан'}</span>
                      {candidate.comment.trim() ? (
                        <span className="mt-3 block text-sm leading-5 text-muted-foreground">{candidate.comment}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                      Опыт: {formatExperienceYears(candidate.experienceYears)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
      {!isBaseScope && isCandidateDataError ? (
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
      {!isBaseScope && isCandidateDataLoading && filteredCandidateRows.length === 0 ? (
        <div className="preview11-loading" role="status">
          <span aria-hidden="true" className="preview11-loading-spin" />
          <span>
            {isExecutorDashboardSummary
              ? 'Загружаем кандидатов из ваших вакансий...'
              : 'Загружаем список кандидатов...'}
          </span>
        </div>
      ) : !isBaseScope && visibleCandidateRows.length === 0 ? (
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
      ) : !isBaseScope ? (
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
                  <TableCell data-label="Вакансия / специализация">
                    {candidate.vacancyTitle || candidate.position || 'Не указана'}
                  </TableCell>
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
      ) : null}
    </Card>
  )
}
