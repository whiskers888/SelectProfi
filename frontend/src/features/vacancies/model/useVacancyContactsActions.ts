import { getRequestErrorMessage } from '@/features/vacancies/lib/errors'
import type {
  ExecutorCandidateContactsResponse,
  SelectedCandidateContactsResponse,
} from '@/shared/api/candidates'
import type { SubmitMessage } from './types'

type UseVacancyContactsActionsArgs = {
  canSelectCandidate: boolean
  canReadSelectedContacts: boolean
  canReadExecutorContacts: boolean
  currentVacancyId: string
  currentCandidateId: string
  setSubmitMessage: (message: SubmitMessage) => void
  setSelectedCandidateId: (candidateId: string) => void
  clearSelectedCandidateContacts: () => void
  setSelectedCandidateContacts: (contacts: SelectedCandidateContactsResponse) => void
  setExecutorCandidateContacts: (contacts: ExecutorCandidateContactsResponse) => void
  refetchVacancies: () => Promise<unknown>
  refetchVacancyCandidates: () => void
  selectVacancyCandidateRequest: (args: {
    vacancyId: string
    body: { candidateId: string }
  }) => Promise<{ selectedCandidateId: string }>
  fetchSelectedCandidateContactsRequest: (args: {
    vacancyId: string
  }) => Promise<SelectedCandidateContactsResponse>
  fetchExecutorCandidateContactsRequest: (args: {
    vacancyId: string
    candidateId: string
  }) => Promise<ExecutorCandidateContactsResponse>
}

export function useVacancyContactsActions({
  canSelectCandidate,
  canReadSelectedContacts,
  canReadExecutorContacts,
  currentVacancyId,
  currentCandidateId,
  setSubmitMessage,
  setSelectedCandidateId,
  clearSelectedCandidateContacts,
  setSelectedCandidateContacts,
  setExecutorCandidateContacts,
  refetchVacancies,
  refetchVacancyCandidates,
  selectVacancyCandidateRequest,
  fetchSelectedCandidateContactsRequest,
  fetchExecutorCandidateContactsRequest,
}: UseVacancyContactsActionsArgs) {
  async function handleSelectCandidate() {
    if (!canSelectCandidate) {
      setSubmitMessage({ status: 'error', text: 'Финальный выбор кандидата доступен только заказчику.' })
      return
    }

    const vacancyId = currentVacancyId.trim()
    const candidateId = currentCandidateId

    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }

    if (!candidateId) {
      setSubmitMessage({ status: 'error', text: 'Выберите кандидата в таблице вакансии.' })
      return
    }

    try {
      const result = await selectVacancyCandidateRequest({
        vacancyId,
        body: { candidateId },
      })
      setSelectedCandidateId(result.selectedCandidateId)
      setSubmitMessage({ status: 'success', text: 'Финальный кандидат выбран.' })
      clearSelectedCandidateContacts()
      await refetchVacancies()
      refetchVacancyCandidates()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleGetSelectedCandidateContacts() {
    if (!canReadSelectedContacts) {
      setSubmitMessage({ status: 'error', text: 'Контакты выбранного кандидата доступны только заказчику.' })
      return
    }

    const vacancyId = currentVacancyId.trim()
    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }

    try {
      const contacts = await fetchSelectedCandidateContactsRequest({ vacancyId })
      setSelectedCandidateContacts(contacts)
      setSelectedCandidateId(contacts.candidateId)
      setSubmitMessage({ status: 'success', text: 'Контакты выбранного кандидата загружены.' })
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleGetExecutorCandidateContacts() {
    if (!canReadExecutorContacts) {
      setSubmitMessage({ status: 'error', text: 'Контакты кандидата в вакансии доступны только исполнителю.' })
      return
    }

    const vacancyId = currentVacancyId.trim()
    const candidateId = currentCandidateId
    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }

    if (!candidateId) {
      setSubmitMessage({ status: 'error', text: 'Выберите кандидата в таблице вакансии.' })
      return
    }

    try {
      const contacts = await fetchExecutorCandidateContactsRequest({ vacancyId, candidateId })
      setExecutorCandidateContacts(contacts)
      setSelectedCandidateId(contacts.candidateId)
      setSubmitMessage({ status: 'success', text: 'Контакты кандидата загружены.' })
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  return {
    handleSelectCandidate,
    handleGetSelectedCandidateContacts,
    handleGetExecutorCandidateContacts,
  }
}
