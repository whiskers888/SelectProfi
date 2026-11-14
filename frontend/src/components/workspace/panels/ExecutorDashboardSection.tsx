import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { workspaceToneToBadgeVariant } from '../model/data'
import type { WorkspaceCandidate, WorkspaceOrder } from '../model/data'
import type { MainFeedPanelViewProps } from './MainFeedPanel.types'
import { DashboardOrdersSection } from './DashboardOrdersSection'

interface ExecutorDashboardSectionProps {
  viewProps: MainFeedPanelViewProps
}

type CandidateStage = 'pool' | 'shortlist' | 'selected'
type CandidateFilter = 'all' | CandidateStage

function candidateStage(candidate: WorkspaceCandidate): CandidateStage | null {
  const status = candidate.statusLabel.trim().toLowerCase()
  if (status === 'выбран' || status === 'selected') return 'selected'
  if (status === 'shortlist') return 'shortlist'
  if (status === 'pool') return 'pool'
  return null
}

function orderCompensation(order: WorkspaceOrder): string {
  return order.employeeCompensation || 'Не указана'
}

export function ExecutorDashboardSection({ viewProps }: ExecutorDashboardSectionProps) {
  const [stageFilter, setStageFilter] = useState<CandidateFilter>('all')
  const selectedOrder = viewProps.selectedDashboardOrder
  const candidates = viewProps.executorDashboardCandidates ?? []
  const orderCandidates = useMemo(
    () => selectedOrder
      ? candidates.filter((candidate) => candidate.orderId === selectedOrder.id && candidateStage(candidate) !== null)
      : [],
    [candidates, selectedOrder],
  )
  const stageCounts: Record<CandidateStage, number> = {
    pool: orderCandidates.filter((candidate) => candidateStage(candidate) === 'pool').length,
    shortlist: orderCandidates.filter((candidate) => candidateStage(candidate) === 'shortlist').length,
    selected: orderCandidates.filter((candidate) => candidateStage(candidate) === 'selected').length,
  }
  const filteredCandidates = orderCandidates.filter(
    (candidate) => stageFilter === 'all' || candidateStage(candidate) === stageFilter,
  )
  const dashboardOrdersProps: MainFeedPanelViewProps = { ...viewProps, onOpenOrder: () => undefined }

  return (
    <div className="space-y-4">
      {viewProps.isOrdersError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
          <p>Не удалось загрузить проекты.</p>
          {viewProps.onRetryOrders ? (
            <button className="mt-3 rounded-md border border-current px-3 py-2 font-medium" onClick={viewProps.onRetryOrders} type="button">
              Повторить
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.6fr)]">
        <div className="min-w-0">
          <DashboardOrdersSection {...dashboardOrdersProps} />
        </div>

        <div className="min-w-0 space-y-5">
          <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Выбранный проект</p>
                <CardTitle className="mt-2 text-xl">{selectedOrder?.title ?? 'Выберите заказ'}</CardTitle>
              </div>
              {selectedOrder && <Badge variant={workspaceToneToBadgeVariant(selectedOrder.statusTone)}>{selectedOrder.statusLabel}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOrder ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Компания</p><p className="mt-1 font-medium">{selectedOrder.company || '—'}</p></div>
                  <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Локация</p><p className="mt-1 font-medium">{selectedOrder.location || '—'}</p></div>
                  <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Компенсация</p><p className="mt-1 font-medium">{orderCompensation(selectedOrder)}</p></div>
                  {selectedOrder.executorNetAmount != null && <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Ваш доход</p><p className="mt-1 font-medium">{selectedOrder.executorNetAmount.toLocaleString('ru-RU')} ₽</p></div>}
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-2 rounded-lg border p-3"><p className="text-xs font-semibold text-muted-foreground">Функционал</p><p className="mt-1 whitespace-pre-line text-sm">{selectedOrder.functional || 'Не указан'}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs font-semibold text-muted-foreground">Требования</p><p className="mt-1 whitespace-pre-line text-sm">{selectedOrder.requirements || 'Не указаны'}</p></div>
                </div>
                {selectedOrder.otherConditions && <p className="text-sm text-muted-foreground">{selectedOrder.otherConditions}</p>}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-label={`Открыть детали проекта ${selectedOrder.title}`}
                    onClick={() => viewProps.onOpenOrder(selectedOrder)}
                    className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Детали проекта
                  </button>
                  {viewProps.onOpenChat && (
                    <button
                      type="button"
                      onClick={viewProps.onOpenChat}
                      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Перейти к чатам
                    </button>
                  )}
                </div>
              </>
            ) : <p className="text-sm text-muted-foreground">Нет доступных заказов для отображения.</p>}
          </CardContent>
          </Card>

          <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg">Кандидаты по проекту</CardTitle>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по этапу кандидата">
                {(['all', 'pool', 'shortlist', 'selected'] as const).map((stage) => {
                  const label = stage === 'all' ? 'Все' : stage === 'pool' ? 'Pool' : stage === 'shortlist' ? 'Shortlist' : 'Выбран'
                  const count = stage === 'all' ? orderCandidates.length : stageCounts[stage]
                  return <button key={stage} type="button" aria-pressed={stageFilter === stage} onClick={() => setStageFilter(stage)} className={`rounded-full border px-3 py-1.5 text-sm ${stageFilter === stage ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{label} <span className="ml-1 opacity-75">{count}</span></button>
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewProps.isCandidateDataLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Загружаем кандидатов…</p>
            ) : viewProps.isCandidateDataError ? (
              <div className="py-8 text-center"><p className="text-sm text-destructive">Не удалось загрузить кандидатов.</p>{viewProps.onRetryCandidateData && <button type="button" onClick={viewProps.onRetryCandidateData} className="mt-3 rounded-md border px-3 py-2 text-sm hover:bg-muted">Повторить</button>}</div>
            ) : !selectedOrder ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Выберите заказ, чтобы посмотреть кандидатов.</p>
            ) : orderCandidates.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">В этом заказе пока нет кандидатов.</p>
            ) : filteredCandidates.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">На этом этапе пока нет кандидатов.</p>
            ) : (
              <Table stackOnMobile>
                <TableHeader>
                  <TableRow>
                    <TableHead>Кандидат</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => {
                    const stage = candidateStage(candidate)
                    const nextStage = stage === 'pool' ? 'Shortlist' : stage === 'shortlist' ? 'Pool' : null

                    return (
                      <TableRow
                        key={candidate.id}
                        className="cursor-pointer"
                        onClick={() => viewProps.onOpenCandidate(candidate)}
                      >
                        <TableCell data-label="Кандидат">
                          <button
                            type="button"
                            className="text-left font-medium text-primary hover:underline"
                            onClick={(event) => {
                              event.stopPropagation()
                              viewProps.onOpenCandidate(candidate)
                            }}
                          >
                            {candidate.name}
                          </button>
                          <p className="text-xs text-muted-foreground">{candidate.position}</p>
                          {candidate.comment && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{candidate.comment}</p>
                          )}
                        </TableCell>
                        <TableCell data-label="Источник">{candidate.source || '—'}</TableCell>
                        <TableCell data-label="Рейтинг">{candidate.rating || '—'}</TableCell>
                        <TableCell data-label="Статус">
                          <Badge variant={workspaceToneToBadgeVariant(candidate.statusTone)}>
                            {candidate.statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Действие">
                          {nextStage && viewProps.onSetCandidateStage ? (
                            <button
                              type="button"
                              aria-label={
                                nextStage === 'Shortlist'
                                  ? `Добавить ${candidate.name} в Shortlist`
                                  : `Вернуть ${candidate.name} в Pool`
                              }
                              disabled={viewProps.isUpdatingCandidateStage}
                              onClick={(event) => {
                                event.stopPropagation()
                                void viewProps.onSetCandidateStage?.(selectedOrder.id, candidate.id, nextStage)
                              }}
                              className="rounded-md border border-primary/40 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {nextStage === 'Shortlist' ? 'Добавить в Shortlist' : 'Вернуть в Pool'}
                            </button>
                          ) : stage === 'selected' ? (
                            <span className="text-xs text-muted-foreground">Финалист выбран</span>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
