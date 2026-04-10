import { type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { VacancyCandidateStageContract } from '@/shared/api/candidates'

type CreateCandidateResumeForm = {
  fullName: string
  birthDate: string
  email: string
  phone: string
  specialization: string
  resumeTitle: string
  resumeSummary: string
  resumeSkills: string
  resumeAttachmentLinks: string
}

export type VacancyPipelineSurfaceProps = {
  canManagePipeline: boolean
  isVacancyPublished: boolean
  currentVacancyId: string
  isVacancyBaseCandidatesFetching: boolean
  vacancyBaseCandidatesError: unknown
  vacancyBaseCandidates: Array<{ candidateId: string; publicAlias: string }>
  currentAddFromBaseCandidateId: string
  pipelineStage: VacancyCandidateStageContract
  isAddingCandidateFromBase: boolean
  isUpdatingCandidateStage: boolean
  currentCandidateId: string
  createCandidateResumeForm: CreateCandidateResumeForm
  isCreatingCandidateResume: boolean
  onAddFromBaseCandidateSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void
  onPipelineStageChange: (event: ChangeEvent<HTMLSelectElement>) => void
  onAddCandidateFromBase: () => void | Promise<void>
  onUpdateCandidateStage: () => void | Promise<void>
  onCreateCandidateResumeInputChange: (
    field: keyof CreateCandidateResumeForm,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  onCreateCandidateResume: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  getRequestErrorMessage: (error: unknown) => string
}

export function VacancyPipelineSurface({
  canManagePipeline,
  isVacancyPublished,
  currentVacancyId,
  isVacancyBaseCandidatesFetching,
  vacancyBaseCandidatesError,
  vacancyBaseCandidates,
  currentAddFromBaseCandidateId,
  pipelineStage,
  isAddingCandidateFromBase,
  isUpdatingCandidateStage,
  currentCandidateId,
  createCandidateResumeForm,
  isCreatingCandidateResume,
  onAddFromBaseCandidateSelectChange,
  onPipelineStageChange,
  onAddCandidateFromBase,
  onUpdateCandidateStage,
  onCreateCandidateResumeInputChange,
  onCreateCandidateResume,
  getRequestErrorMessage,
}: VacancyPipelineSurfaceProps) {
  return (
    <>
      <Card className="border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Pipeline кандидатов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!canManagePipeline ? <Alert>Операции pipeline доступны только для роли исполнителя.</Alert> : null}
          {canManagePipeline && currentVacancyId && !isVacancyPublished ? (
            <Alert>Операции pipeline доступны только для опубликованной вакансии.</Alert>
          ) : null}
          {canManagePipeline && !currentVacancyId ? (
            <Alert>Выберите вакансию в таблице, чтобы работать с Add from base.</Alert>
          ) : null}
          {canManagePipeline && currentVacancyId && isVacancyBaseCandidatesFetching ? (
            <Alert>Загрузка системных кандидатов...</Alert>
          ) : null}
          {canManagePipeline && currentVacancyId && vacancyBaseCandidatesError ? (
            <Alert variant="destructive">{getRequestErrorMessage(vacancyBaseCandidatesError)}</Alert>
          ) : null}
          {canManagePipeline &&
          currentVacancyId &&
          !isVacancyBaseCandidatesFetching &&
          !vacancyBaseCandidatesError &&
          vacancyBaseCandidates.length === 0 ? (
            <Alert>Нет доступных кандидатов из системной базы для этой вакансии.</Alert>
          ) : null}
          <div className="grid gap-3 md:grid-cols-4">
            <Input value={currentVacancyId} placeholder="vacancyId из таблицы" readOnly disabled />
            <select
              value={currentAddFromBaseCandidateId}
              onChange={onAddFromBaseCandidateSelectChange}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={
                !canManagePipeline ||
                !isVacancyPublished ||
                isAddingCandidateFromBase ||
                isUpdatingCandidateStage ||
                !currentVacancyId ||
                isVacancyBaseCandidatesFetching ||
                Boolean(vacancyBaseCandidatesError) ||
                vacancyBaseCandidates.length === 0
              }
            >
              <option value="" disabled>
                Кандидат из базы
              </option>
              {vacancyBaseCandidates.map((candidate) => (
                <option key={candidate.candidateId} value={candidate.candidateId}>
                  {candidate.publicAlias} ({candidate.candidateId})
                </option>
              ))}
            </select>
            <select
              value={pipelineStage}
              onChange={onPipelineStageChange}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canManagePipeline || !isVacancyPublished || isAddingCandidateFromBase || isUpdatingCandidateStage}
            >
              <option value="Pool">Pool</option>
              <option value="Shortlist">Shortlist</option>
            </select>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void onAddCandidateFromBase()}
                disabled={
                  !canManagePipeline ||
                  !isVacancyPublished ||
                  isAddingCandidateFromBase ||
                  isUpdatingCandidateStage ||
                  !currentAddFromBaseCandidateId ||
                  isVacancyBaseCandidatesFetching ||
                  Boolean(vacancyBaseCandidatesError)
                }
              >
                Add from base
              </Button>
              <Button
                type="button"
                onClick={() => void onUpdateCandidateStage()}
                disabled={
                  !canManagePipeline ||
                  !isVacancyPublished ||
                  isAddingCandidateFromBase ||
                  isUpdatingCandidateStage ||
                  !currentCandidateId
                }
              >
                Update stage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Ручное добавление кандидата с резюме</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!canManagePipeline ? <Alert>Ручное добавление кандидата доступно только для роли исполнителя.</Alert> : null}
          <form onSubmit={onCreateCandidateResume} className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Input value={currentVacancyId} placeholder="vacancyId из таблицы" readOnly disabled />
              <Input
                value={createCandidateResumeForm.fullName}
                onChange={(event) => onCreateCandidateResumeInputChange('fullName', event)}
                placeholder="ФИО"
                disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}
              />
              <Input
                value={createCandidateResumeForm.birthDate}
                onChange={(event) => onCreateCandidateResumeInputChange('birthDate', event)}
                placeholder="Дата рождения (YYYY-MM-DD)"
                disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                value={createCandidateResumeForm.email}
                onChange={(event) => onCreateCandidateResumeInputChange('email', event)}
                placeholder="Email"
                disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}
              />
              <Input
                value={createCandidateResumeForm.phone}
                onChange={(event) => onCreateCandidateResumeInputChange('phone', event)}
                placeholder="Телефон"
                disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}
              />
              <Input
                value={createCandidateResumeForm.specialization}
                onChange={(event) => onCreateCandidateResumeInputChange('specialization', event)}
                placeholder="Специализация"
                disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={createCandidateResumeForm.resumeTitle}
                onChange={(event) => onCreateCandidateResumeInputChange('resumeTitle', event)}
                placeholder="Заголовок резюме"
                disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}
              />
              <Input
                value={createCandidateResumeForm.resumeSkills}
                onChange={(event) => onCreateCandidateResumeInputChange('resumeSkills', event)}
                placeholder="Навыки через запятую (optional)"
                disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}
              />
            </div>
            <Textarea
              value={createCandidateResumeForm.resumeSummary}
              onChange={(event) => onCreateCandidateResumeInputChange('resumeSummary', event)}
              placeholder="Краткое резюме (summary)"
              disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}
            />
            <Textarea
              value={createCandidateResumeForm.resumeAttachmentLinks}
              onChange={(event) => onCreateCandidateResumeInputChange('resumeAttachmentLinks', event)}
              placeholder="Ссылки на вложения, по одной на строку (optional)"
              disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}
            />
            <div>
              <Button type="submit" disabled={!canManagePipeline || !isVacancyPublished || isCreatingCandidateResume}>
                Add resume
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
