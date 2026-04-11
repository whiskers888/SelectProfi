import type { Dispatch, SetStateAction } from 'react'
import type { CreateVacancyFormState } from './types'

type UseVacancyFormResetArgs = {
  setCreateForm: Dispatch<SetStateAction<CreateVacancyFormState>>
  setVacancyEditTitleInput: Dispatch<SetStateAction<string>>
  setVacancyEditDescriptionInput: Dispatch<SetStateAction<string>>
  setIsVacancyEditTitleDirty: Dispatch<SetStateAction<boolean>>
  setIsVacancyEditDescriptionDirty: Dispatch<SetStateAction<boolean>>
}

export function useVacancyFormReset({
  setCreateForm,
  setVacancyEditTitleInput,
  setVacancyEditDescriptionInput,
  setIsVacancyEditTitleDirty,
  setIsVacancyEditDescriptionDirty,
}: UseVacancyFormResetArgs) {
  // @dvnull: Ранее resetCreateForm/resetVacancyEditState объявлялись inline в VacanciesPage; вынесены в model-хук без изменения полей сброса.
  function resetCreateForm() {
    setCreateForm({ title: '', description: '' })
  }

  function resetVacancyEditState() {
    setVacancyEditTitleInput('')
    setVacancyEditDescriptionInput('')
    setIsVacancyEditTitleDirty(false)
    setIsVacancyEditDescriptionDirty(false)
  }

  return {
    resetCreateForm,
    resetVacancyEditState,
  }
}
