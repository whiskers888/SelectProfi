import { type FormEvent } from 'react'
import { getRequestErrorMessage } from '@/features/vacancies/lib/errors'
import { buildResumeAttachmentsJson, buildResumeContentJson } from '@/features/vacancies/lib/resume'
import type {
  CandidateResumeResponse,
  VacancyCandidateResponse,
  VacancyCandidateStageContract,
} from '@/shared/api/candidates'
import type { CreateCandidateResumeFormState, SubmitMessage } from './types'

type UseVacancyPipelineActionsArgs = {
  canManagePipeline: boolean
  currentVacancyId: string
  currentAddFromBaseCandidateId: string
  currentCandidateId: string
  pipelineStage: VacancyCandidateStageContract
  createCandidateResumeForm: CreateCandidateResumeFormState
  setSubmitMessage: (message: SubmitMessage) => void
  setSelectedCandidateId: (candidateId: string) => void
  clearSelectedAddFromBaseCandidateId: () => void
  resetCreateCandidateResumeForm: () => void
  ensurePublishedVacancyForPipeline: () => boolean
  refetchVacancies: () => Promise<unknown>
  refetchVacancyCandidates: () => void
  refetchVacancyBaseCandidates: () => void
  createCandidateResumeRequest: (args: {
    vacancyId: string
    body: {
      fullName: string
      birthDate?: string
      email?: string
      phone?: string
      specialization: string
      resumeTitle: string
      resumeContentJson: string
      resumeAttachmentsJson?: string
    }
  }) => Promise<CandidateResumeResponse>
  addCandidateFromBaseRequest: (args: {
    vacancyId: string
    candidateId: string
  }) => Promise<VacancyCandidateResponse>
  updateVacancyCandidateStageRequest: (args: {
    vacancyId: string
    candidateId: string
    body: { stage: VacancyCandidateStageContract }
  }) => Promise<VacancyCandidateResponse>
}

export function useVacancyPipelineActions({
  canManagePipeline,
  currentVacancyId,
  currentAddFromBaseCandidateId,
  currentCandidateId,
  pipelineStage,
  createCandidateResumeForm,
  setSubmitMessage,
  setSelectedCandidateId,
  clearSelectedAddFromBaseCandidateId,
  resetCreateCandidateResumeForm,
  ensurePublishedVacancyForPipeline,
  refetchVacancies,
  refetchVacancyCandidates,
  refetchVacancyBaseCandidates,
  createCandidateResumeRequest,
  addCandidateFromBaseRequest,
  updateVacancyCandidateStageRequest,
}: UseVacancyPipelineActionsArgs) {
  async function handleCreateCandidateResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canManagePipeline) {
      setSubmitMessage({ status: 'error', text: 'Ручное добавление кандидата доступно только исполнителю.' })
      return
    }

    const vacancyId = currentVacancyId.trim()
    const fullName = createCandidateResumeForm.fullName.trim()
    const specialization = createCandidateResumeForm.specialization.trim()
    const resumeTitle = createCandidateResumeForm.resumeTitle.trim()
    const resumeSummary = createCandidateResumeForm.resumeSummary.trim()

    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }
    if (!ensurePublishedVacancyForPipeline()) {
      return
    }

    if (!fullName || !specialization || !resumeTitle || !resumeSummary) {
      setSubmitMessage({
        status: 'error',
        text: 'Заполните fullName, specialization, resumeTitle и резюме (summary).',
      })
      return
    }

    const resumeContentJson = buildResumeContentJson(createCandidateResumeForm)
    const resumeAttachmentsJson = buildResumeAttachmentsJson(createCandidateResumeForm)

    try {
      const result = await createCandidateResumeRequest({
        vacancyId,
        body: {
          fullName,
          birthDate: createCandidateResumeForm.birthDate.trim() || undefined,
          email: createCandidateResumeForm.email.trim() || undefined,
          phone: createCandidateResumeForm.phone.trim() || undefined,
          specialization,
          resumeTitle,
          resumeContentJson,
          resumeAttachmentsJson,
        },
      })
      setSelectedCandidateId(result.candidateId)
      setSubmitMessage({ status: 'success', text: 'Кандидат с резюме добавлен в pipeline.' })
      resetCreateCandidateResumeForm()
      await refetchVacancies()
      refetchVacancyCandidates()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleAddCandidateFromBase() {
    if (!canManagePipeline) {
      setSubmitMessage({ status: 'error', text: 'Операции pipeline доступны только исполнителю.' })
      return
    }

    const vacancyId = currentVacancyId.trim()
    const candidateId = currentAddFromBaseCandidateId

    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }
    if (!ensurePublishedVacancyForPipeline()) {
      return
    }

    if (!candidateId) {
      setSubmitMessage({ status: 'error', text: 'Выберите кандидата из системной базы.' })
      return
    }

    try {
      const result = await addCandidateFromBaseRequest({ vacancyId, candidateId })
      setSelectedCandidateId(result.candidateId)
      clearSelectedAddFromBaseCandidateId()
      setSubmitMessage({ status: 'success', text: 'Кандидат добавлен в pipeline (Pool).' })
      await refetchVacancies()
      refetchVacancyCandidates()
      refetchVacancyBaseCandidates()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleUpdateCandidateStage() {
    if (!canManagePipeline) {
      setSubmitMessage({ status: 'error', text: 'Операции pipeline доступны только исполнителю.' })
      return
    }

    const vacancyId = currentVacancyId.trim()
    const candidateId = currentCandidateId

    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }
    if (!ensurePublishedVacancyForPipeline()) {
      return
    }

    if (!candidateId) {
      setSubmitMessage({ status: 'error', text: 'Выберите кандидата в таблице вакансии.' })
      return
    }

    try {
      const result = await updateVacancyCandidateStageRequest({
        vacancyId,
        candidateId,
        body: { stage: pipelineStage },
      })
      setSelectedCandidateId(result.candidateId)
      setSubmitMessage({ status: 'success', text: `Стадия кандидата обновлена: ${pipelineStage}.` })
      await refetchVacancies()
      refetchVacancyCandidates()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  return {
    handleCreateCandidateResume,
    handleAddCandidateFromBase,
    handleUpdateCandidateStage,
  }
}
