import { getRequestErrorMessage } from '@/features/vacancies/lib/errors'
import type { VacancyCandidateResponse } from '@/shared/api/candidates'
import type { SubmitMessage } from './types'

type UseVacancyRespondActionsArgs = {
  canRespondToVacancy: boolean
  currentVacancyId: string
  setSubmitMessage: (message: SubmitMessage) => void
  setSelectedCandidateId: (candidateId: string) => void
  refetchVacancies: () => Promise<unknown>
  respondToVacancyRequest: (args: { vacancyId: string }) => Promise<VacancyCandidateResponse>
}

export function useVacancyRespondActions({
  canRespondToVacancy,
  currentVacancyId,
  setSubmitMessage,
  setSelectedCandidateId,
  refetchVacancies,
  respondToVacancyRequest,
}: UseVacancyRespondActionsArgs) {
  async function handleRespondToVacancy() {
    if (!canRespondToVacancy) {
      setSubmitMessage({ status: 'error', text: 'Отклик на вакансию доступен только соискателю.' })
      return
    }

    const vacancyId = currentVacancyId.trim()
    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в списке.' })
      return
    }

    try {
      const result = await respondToVacancyRequest({ vacancyId })
      setSelectedCandidateId(result.candidateId)
      setSubmitMessage({ status: 'success', text: 'Отклик на вакансию отправлен.' })
      await refetchVacancies()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  return {
    handleRespondToVacancy,
  }
}
