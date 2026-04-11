import type { VacancyCandidateStageContract } from '@/shared/api/candidates'

export type SubmitMessageStatus = 'idle' | 'success' | 'error'

export type SubmitMessage = {
  status: SubmitMessageStatus
  text: string
}

export type CreateVacancyFormState = {
  title: string
  description: string
}

export type CreateCandidateResumeFormState = {
  fullName: string
  birthDate: string
  email: string
  phone: string
  specialization: string
  resumeTitle: string
  resumeRichTextHtml: string
  resumeSkills: string
  resumeAttachmentLinks: string
}

export type PipelineFormState = {
  stage: VacancyCandidateStageContract
}

export type VacancyWorkspaceSection = 'details' | 'pipeline' | 'candidates' | 'candidate-create'
