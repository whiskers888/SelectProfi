import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { workspaceToneToBadgeVariant } from '../model/data'
import type { MainFeedPanelViewProps } from './MainFeedPanel.types'

export function CandidatesSection({
  candidateDataScope,
  candidateSourceFilter,
  candidateStageFilter,
  filteredCandidateRows,
  handleCandidateSourceFilterChange,
  handleCandidateStageFilterChange,
  hasActiveCandidateFilters,
  isApplicantView,
  isBaseScope,
  isCandidateFiltersMenuOpen,
  onOpenCandidate,
  setCandidateDataScope,
  setCandidateSourceFilter,
  setCandidateStageFilter,
  setIsCandidateFiltersMenuOpen,
  shouldShowBaseCandidateTab,
  shouldShowCandidateFilters,
  shouldShowCandidateScopeSwitcher,
}: MainFeedPanelViewProps) {
  return (
    <Card className="rounded-xl border-border p-4 shadow-none">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{isApplicantView ? 'Мои резюме' : 'Мои кандидаты'}</h3>
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
                      <option value="pool">Pool</option>
                      <option value="shortlist">Shortlist</option>
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
      </div>
      {filteredCandidateRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
          {isApplicantView ? 'Резюме пока не добавлены.' : 'Кандидаты по текущим фильтрам не найдены.'}
        </div>
      ) : (
        <Table stackOnMobile>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{isApplicantView ? 'Резюме' : 'Кандидат'}</TableHead>
              {!isBaseScope ? <TableHead>Источник</TableHead> : null}
              <TableHead>Рейтинг</TableHead>
              {!isBaseScope ? <TableHead>Статус</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidateRows.map((candidate) => (
              <TableRow key={candidate.id} className="cursor-pointer" onClick={() => onOpenCandidate(candidate)}>
                <TableCell className="font-medium">{candidate.name}</TableCell>
                {!isBaseScope ? <TableCell data-label="Источник">{candidate.source}</TableCell> : null}
                <TableCell data-label="Рейтинг">{candidate.rating}</TableCell>
                {!isBaseScope ? (
                  <TableCell>
                    {candidate.statusLabel.trim() ? (
                      <Badge variant={workspaceToneToBadgeVariant(candidate.statusTone)}>{candidate.statusLabel}</Badge>
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
