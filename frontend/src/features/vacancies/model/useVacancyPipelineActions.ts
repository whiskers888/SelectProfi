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
  const fullNameMaxLength = 200
  const specializationMaxLength = 120
  const resumeTitleMaxLength = 200
  const emailMaxLength = 254
  const phoneMaxLength = 32
  const birthDatePattern = /^\d{4}-\d{2}-\d{2}$/

  function hasVisibleText(html: string): boolean {
    const normalized = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    return normalized.length > 0
  }

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
    const resumeRichTextHtml = createCandidateResumeForm.resumeRichTextHtml.trim()
    const birthDate = createCandidateResumeForm.birthDate.trim()
    const email = createCandidateResumeForm.email.trim()
    const phone = createCandidateResumeForm.phone.trim()

    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }
    if (!ensurePublishedVacancyForPipeline()) {
      return
    }

    if (!fullName || !specialization || !resumeTitle || !hasVisibleText(resumeRichTextHtml)) {
      setSubmitMessage({
        status: 'error',
        text: 'Заполните fullName, specialization, resumeTitle и содержимое резюме.',
      })
      return
    }
    // @dvnull: Ранее ручное добавление кандидата проверяло только обязательные поля; добавлены контрактные ограничения длины/формата до вызова API.
    if (fullName.length > fullNameMaxLength) {
      setSubmitMessage({ status: 'error', text: 'FullName не должен превышать 200 символов.' })
      return
    }
    if (specialization.length > specializationMaxLength) {
      setSubmitMessage({ status: 'error', text: 'Specialization не должен превышать 120 символов.' })
      return
    }
    if (resumeTitle.length > resumeTitleMaxLength) {
      setSubmitMessage({ status: 'error', text: 'ResumeTitle не должен превышать 200 символов.' })
      return
    }
    if (email && email.length > emailMaxLength) {
      setSubmitMessage({ status: 'error', text: 'Email не должен превышать 254 символа.' })
      return
    }
    if (phone && phone.length > phoneMaxLength) {
      setSubmitMessage({ status: 'error', text: 'Phone не должен превышать 32 символа.' })
      return
    }
    if (birthDate && !birthDatePattern.test(birthDate)) {
      setSubmitMessage({ status: 'error', text: 'Дата рождения должна быть в формате YYYY-MM-DD.' })
      return
    }

    const resumeContentJson = buildResumeContentJson(createCandidateResumeForm)
    const resumeAttachmentsJson = buildResumeAttachmentsJson(createCandidateResumeForm)

    try {
      const result = await createCandidateResumeRequest({
        vacancyId,
        body: {
          fullName,
          birthDate: birthDate || undefined,
          email: email || undefined,
          phone: phone || undefined,
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
