import type { Dispatch, SetStateAction } from 'react'
import type { ExecutorCandidateContactsResponse, SelectedCandidateContactsResponse } from '@/shared/api/candidates'
import type { VacancyWorkspaceSection } from './types'

type UseVacancyContextStateArgs = {
  setSelectedVacancyId: Dispatch<SetStateAction<string>>
  setSelectedCandidateId: Dispatch<SetStateAction<string>>
  setActiveVacancySection: Dispatch<SetStateAction<VacancyWorkspaceSection>>
  setSelectedAddFromBaseCandidateId: Dispatch<SetStateAction<string>>
  setVacancyEditTitleInput: Dispatch<SetStateAction<string>>
  setVacancyEditDescriptionInput: Dispatch<SetStateAction<string>>
  setIsVacancyEditTitleDirty: Dispatch<SetStateAction<boolean>>
  setIsVacancyEditDescriptionDirty: Dispatch<SetStateAction<boolean>>
  setSelectedCandidateContacts: Dispatch<SetStateAction<SelectedCandidateContactsResponse | null>>
  setExecutorCandidateContacts: Dispatch<SetStateAction<ExecutorCandidateContactsResponse | null>>
}

export function useVacancyContextState({
  setSelectedVacancyId,
  setSelectedCandidateId,
  setActiveVacancySection,
  setSelectedAddFromBaseCandidateId,
  setVacancyEditTitleInput,
  setVacancyEditDescriptionInput,
  setIsVacancyEditTitleDirty,
  setIsVacancyEditDescriptionDirty,
  setSelectedCandidateContacts,
  setExecutorCandidateContacts,
}: UseVacancyContextStateArgs) {
  // @dvnull: Ранее reset контекста вакансии был локальной функцией в VacanciesPage; вынесен в model-хук без изменения порядка reset-операций.
  function applyVacancyContext(vacancyId: string) {
    setSelectedVacancyId(vacancyId)
    setSelectedCandidateId('')
    setActiveVacancySection('details')
    setSelectedAddFromBaseCandidateId('')
    setVacancyEditTitleInput('')
    setVacancyEditDescriptionInput('')
    setIsVacancyEditTitleDirty(false)
    setIsVacancyEditDescriptionDirty(false)
    setSelectedCandidateContacts(null)
    setExecutorCandidateContacts(null)
  }

  return {
    applyVacancyContext,
  }
}
