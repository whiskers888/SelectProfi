import { isPublishedVacancyStatus } from '@/features/vacancies/lib/policy'
import type { VacancyStatusContract } from '@/shared/api/vacancies'
import type { SubmitMessage } from './types'

type UseVacancyPipelineGuardsArgs = {
  currentVacancyStatus: VacancyStatusContract | undefined
  setSubmitMessage: (message: SubmitMessage) => void
}

export function useVacancyPipelineGuards({
  currentVacancyStatus,
  setSubmitMessage,
}: UseVacancyPipelineGuardsArgs) {
  // @dvnull: Ранее guard ensurePublishedVacancyForPipeline был локальной функцией в VacanciesPage; вынесен в model-хук без изменения условия и текста ошибки.
  function ensurePublishedVacancyForPipeline(): boolean {
    if (isPublishedVacancyStatus(currentVacancyStatus)) {
      return true
    }

    setSubmitMessage({ status: 'error', text: 'Операции pipeline доступны только для опубликованной вакансии.' })
    return false
  }

  return {
    ensurePublishedVacancyForPipeline,
  }
}
