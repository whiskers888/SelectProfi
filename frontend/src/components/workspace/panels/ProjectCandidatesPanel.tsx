import { useState } from 'react'
import { Check, Trash2, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import type { WorkspaceCandidate } from '../model/data'
import { formatExperienceYears } from '../shell/workspaceShell.helpers'

interface ProjectCandidatesPanelProps {
  candidates: WorkspaceCandidate[]
  canAddCandidate: boolean
  canManageCandidates: boolean
  isCustomerViewer: boolean
  isExecutorViewer: boolean
  isLoading: boolean
  isError: boolean
  isRemovingCandidate: boolean
  isSubmittingCandidateList: boolean
  requestedCandidatesCount: number
  submittedAtUtc?: string | null
  vacancyIsPublished: boolean
  onAddCandidate?: () => void
  onRemoveCandidate?: (candidateId: string) => boolean | Promise<boolean>
  onRetry?: () => void
  onSubmitCandidateList?: () => boolean | Promise<boolean>
}

interface CandidateRowProps {
  candidate: WorkspaceCandidate
  canRemove: boolean
  isRemoving: boolean
  onRemove: (candidate: WorkspaceCandidate) => void
}

function CandidateRow({ candidate, canRemove, isRemoving, onRemove }: Readonly<CandidateRowProps>) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{candidate.name}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{candidate.position}</p>
        <p className="mt-1 text-xs text-muted-foreground">Опыт: {formatExperienceYears(candidate.experienceYears)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={candidate.statusTone === 'success' ? 'success' : 'neutral'}>
          {candidate.statusLabel || 'В рабочем списке'}
        </Badge>
        {canRemove ? (
          <Button
            aria-label={`Удалить ${candidate.name} из проекта`}
            className="h-8 rounded-lg border-destructive/30 px-2 text-destructive hover:bg-error-muted"
            disabled={isRemoving}
            onClick={() => onRemove(candidate)}
            type="button"
            variant="outline"
          >
            <Trash2 aria-hidden="true" className="mr-1.5" size={14} />
            {isRemoving ? 'Удаляем…' : 'Удалить'}
          </Button>
        ) : null}
      </div>
    </li>
  )
}

function formatSubmittedAt(submittedAtUtc: string | null | undefined): string | null {
  if (!submittedAtUtc) {
    return null
  }

  const submittedAt = new Date(submittedAtUtc)
  return Number.isNaN(submittedAt.getTime()) ? null : submittedAt.toLocaleString('ru-RU')
}

export function ProjectCandidatesPanel({
  candidates,
  canAddCandidate,
  canManageCandidates,
  isCustomerViewer,
  isExecutorViewer,
  isLoading,
  isError,
  isRemovingCandidate,
  isSubmittingCandidateList,
  requestedCandidatesCount,
  submittedAtUtc,
  vacancyIsPublished,
  onAddCandidate,
  onRemoveCandidate,
  onRetry,
  onSubmitCandidateList,
}: Readonly<ProjectCandidatesPanelProps>) {
  const [candidateToRemove, setCandidateToRemove] = useState<WorkspaceCandidate | null>(null)
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] = useState(false)
  const customerCandidates = candidates.filter((candidate) => candidate.isCustomerSubmitted)
  const workingCandidates = isCustomerViewer
    ? []
    : candidates.filter((candidate) => !candidate.isCustomerSubmitted)
  const officialCandidates = customerCandidates
  const shortlistCount = workingCandidates.filter((candidate) => candidate.stage === 'Shortlist').length
  const minimumCount = Math.max(1, requestedCandidatesCount)
  const hasSubmittedList = customerCandidates.length > 0 || Boolean(submittedAtUtc)
  const submittedAtLabel = formatSubmittedAt(submittedAtUtc)
  const canSubmitList =
    isExecutorViewer &&
    canManageCandidates &&
    vacancyIsPublished &&
    !hasSubmittedList &&
    shortlistCount >= minimumCount &&
    Boolean(onSubmitCandidateList)

  async function confirmRemoveCandidate() {
    if (!candidateToRemove || !onRemoveCandidate) {
      return
    }

    const wasRemoved = await onRemoveCandidate(candidateToRemove.id)
    if (wasRemoved) {
      setCandidateToRemove(null)
    }
  }

  async function confirmSubmitCandidateList() {
    if (!onSubmitCandidateList) {
      return
    }

    const wasSubmitted = await onSubmitCandidateList()
    if (wasSubmitted) {
      setIsSubmitConfirmationOpen(false)
    }
  }

  const showExecutorLists = isExecutorViewer && canManageCandidates
  const showCustomerList = isCustomerViewer

  if (!showExecutorLists && !showCustomerList) {
    return null
  }

  return (
    <Card className="mt-5 rounded-xl border-border p-4 shadow-none sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {isCustomerViewer ? 'Список кандидатов' : 'Кандидаты проекта'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isCustomerViewer
              ? 'Список, который исполнитель официально передал заказчику.'
              : 'Рабочий список проекта и отдельно зафиксированный список для заказчика.'}
          </p>
        </div>
        {showExecutorLists && canAddCandidate ? (
          <Button className="h-9 rounded-lg" onClick={onAddCandidate} type="button">
            <UserPlus aria-hidden="true" className="mr-2" size={16} />
            Добавить кандидата
          </Button>
        ) : null}
      </div>

      {isError ? (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-error-muted p-3 text-sm text-destructive" role="alert">
          <p>Не удалось загрузить список кандидатов проекта.</p>
          {onRetry ? (
            <Button className="mt-2 h-8 rounded-md border-destructive/40 px-2 text-destructive" onClick={onRetry} type="button" variant="outline">
              Повторить
            </Button>
          ) : null}
        </div>
      ) : null}

      {isLoading && candidates.length === 0 ? (
        <p className="mt-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground" role="status">Загружаем кандидатов проекта…</p>
      ) : null}

      {showExecutorLists ? (
        <section aria-labelledby="project-working-candidates-title" className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground" id="project-working-candidates-title">
              В работе <span className="ml-1 text-muted-foreground">{workingCandidates.length}</span>
            </h4>
          </div>
          {workingCandidates.length > 0 ? (
            <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
              {workingCandidates.map((candidate) => (
                <CandidateRow
                  candidate={candidate}
                  canRemove={canManageCandidates}
                  isRemoving={isRemovingCandidate}
                  key={candidate.id}
                  onRemove={setCandidateToRemove}
                />
              ))}
            </ul>
          ) : isLoading || isError ? null : (
            <p className="mt-2 rounded-lg border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
              В рабочем списке пока нет кандидатов.
            </p>
          )}
        </section>
      ) : null}

      {showExecutorLists || showCustomerList ? (
        <section aria-labelledby="customer-candidate-list-title" className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground" id="customer-candidate-list-title">
              {isCustomerViewer ? 'Официальный список' : 'Список кандидатов для заказчика'}
              <span className="ml-1 text-muted-foreground">{officialCandidates.length}</span>
            </h4>
            {hasSubmittedList ? <Badge variant="success"><Check aria-hidden="true" className="mr-1" size={13} />Отправлен</Badge> : null}
          </div>

          {showExecutorLists ? (
            <div className="mt-2 rounded-lg border border-border bg-muted p-3">
              {hasSubmittedList ? (
                <p className="text-sm text-muted-foreground">
                  Список зафиксирован{submittedAtLabel ? ` ${submittedAtLabel}` : ''}. Изменения рабочего списка на него не повлияют.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Передать можно после добавления кандидатов в список проекта.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    В списке: {shortlistCount} · Требуется: {minimumCount}
                  </p>
                  <Button
                    className="mt-3 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!canSubmitList || isSubmittingCandidateList}
                    onClick={() => setIsSubmitConfirmationOpen(true)}
                    type="button"
                  >
                    {isSubmittingCandidateList ? 'Отправляем…' : 'Передать заказчику'}
                  </Button>
                </>
              )}
            </div>
          ) : null}

          {officialCandidates.length > 0 ? (
            <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
              {officialCandidates.map((candidate) => (
                <CandidateRow
                  candidate={candidate}
                  canRemove={false}
                  isRemoving={false}
                  key={candidate.id}
                  onRemove={setCandidateToRemove}
                />
              ))}
            </ul>
          ) : isLoading || isError ? null : (
            <p className="mt-2 rounded-lg border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
              {hasSubmittedList ? 'Официальный список отправлен, но его строки сейчас недоступны.' : 'Заказчику пока не передавали список.'}
            </p>
          )}
        </section>
      ) : null}

      <Modal
        description="Будут переданы кандидаты из списка проекта. После отправки его состав нельзя будет незаметно изменить."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsSubmitConfirmationOpen(false)} type="button" variant="outline">Отмена</Button>
            <Button disabled={isSubmittingCandidateList} onClick={() => void confirmSubmitCandidateList()} type="button">
              {isSubmittingCandidateList ? 'Отправляем…' : 'Подтвердить отправку'}
            </Button>
          </div>
        }
        onOpenChange={setIsSubmitConfirmationOpen}
        open={isSubmitConfirmationOpen}
        title="Передать список заказчику?"
      >
        <p className="text-sm text-muted-foreground">К отправке подготовлено: {shortlistCount} · Минимум: {minimumCount}.</p>
      </Modal>

      <Modal
        description="Профиль кандидата останется в вашей базе. Удалится только его связь с этой вакансией."
        footer={
          <div className="flex justify-end gap-2">
            <Button disabled={isRemovingCandidate} onClick={() => setCandidateToRemove(null)} type="button" variant="outline">Отмена</Button>
            <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isRemovingCandidate} onClick={() => void confirmRemoveCandidate()} type="button">
              {isRemovingCandidate ? 'Удаляем…' : 'Удалить из проекта'}
            </Button>
          </div>
        }
        onOpenChange={(isOpen) => {
          if (!isOpen && !isRemovingCandidate) {
            setCandidateToRemove(null)
          }
        }}
        open={candidateToRemove !== null}
        title="Удалить кандидата из проекта?"
      >
        <p className="text-sm text-muted-foreground">
          {candidateToRemove?.name ?? 'Кандидат'} будет исключён из этой вакансии. После официальной отправки заказчику список не редактируется.
        </p>
      </Modal>
    </Card>
  )
}
