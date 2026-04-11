import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import type { CreateCandidateResumeFormState, CreateVacancyFormState, PipelineFormState } from './types'

type UseVacancyFormStateArgs = {
  setCreateForm: Dispatch<SetStateAction<CreateVacancyFormState>>
  setSelectedCreateOrderId: Dispatch<SetStateAction<string>>
  setSelectedAddFromBaseCandidateId: Dispatch<SetStateAction<string>>
  setVacancyEditTitleInput: Dispatch<SetStateAction<string>>
  setIsVacancyEditTitleDirty: Dispatch<SetStateAction<boolean>>
  setVacancyEditDescriptionInput: Dispatch<SetStateAction<string>>
  setIsVacancyEditDescriptionDirty: Dispatch<SetStateAction<boolean>>
  setPipelineForm: Dispatch<SetStateAction<PipelineFormState>>
  setCreateCandidateResumeForm: Dispatch<SetStateAction<CreateCandidateResumeFormState>>
}

export function useVacancyFormState({
  setCreateForm,
  setSelectedCreateOrderId,
  setSelectedAddFromBaseCandidateId,
  setVacancyEditTitleInput,
  setIsVacancyEditTitleDirty,
  setVacancyEditDescriptionInput,
  setIsVacancyEditDescriptionDirty,
  setPipelineForm,
  setCreateCandidateResumeForm,
}: UseVacancyFormStateArgs) {
  // @dvnull: Ранее handlers изменения инпутов/селектов были локально в VacanciesPage; вынесены в model-хук без изменения поведения.
  function handleCreateFormChange(
    field: keyof CreateVacancyFormState,
    // @dvnull: Ранее create-вакансия принимала только Input-события; расширено до Textarea для description без изменения структуры state.
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const nextValue = event.target.value
    setCreateForm((previous) => ({
      ...previous,
      [field]: nextValue,
    }))
  }

  function handleCreateOrderSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCreateOrderId(event.target.value)
  }

  function handleAddFromBaseCandidateSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedAddFromBaseCandidateId(event.target.value)
  }

  function handleVacancyEditTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setVacancyEditTitleInput(event.target.value)
    setIsVacancyEditTitleDirty(true)
  }

  function handleVacancyEditDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setVacancyEditDescriptionInput(event.target.value)
    setIsVacancyEditDescriptionDirty(true)
  }

  function handlePipelineStageChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextValue = event.target.value
    if (nextValue !== 'Pool' && nextValue !== 'Shortlist') {
      return
    }

    setPipelineForm((previous) => ({
      ...previous,
      stage: nextValue,
    }))
  }

  function handleCreateCandidateResumeInputChange(
    field: keyof CreateCandidateResumeFormState,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const nextValue = event.target.value
    setCreateCandidateResumeForm((previous) => ({
      ...previous,
      [field]: nextValue,
    }))
  }

  function handleCreateCandidateResumeRichTextChange(value: string) {
    setCreateCandidateResumeForm((previous) => ({
      ...previous,
      resumeRichTextHtml: value,
    }))
  }

  return {
    handleCreateFormChange,
    handleCreateOrderSelectChange,
    handleAddFromBaseCandidateSelectChange,
    handleVacancyEditTitleChange,
    handleVacancyEditDescriptionChange,
    handlePipelineStageChange,
    handleCreateCandidateResumeInputChange,
    handleCreateCandidateResumeRichTextChange,
  }
}
