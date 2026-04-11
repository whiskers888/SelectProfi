import { type FormEvent } from 'react'
import { getRequestErrorMessage } from '@/features/vacancies/lib/errors'
import { getLifecycleAction } from '@/features/vacancies/lib/lifecycle'
import type { MyAuthInfoResponse } from '@/shared/api/auth'
import type { VacancyResponse, VacancyStatusContract } from '@/shared/api/vacancies'
import type { CreateVacancyFormState, SubmitMessage } from './types'

type UpdateVacancyRequestBody = {
  title: string
  description: string
}

type UseVacancyCrudActionsArgs = {
  currentUserRole: MyAuthInfoResponse['role'] | undefined
  canCreateVacancy: boolean
  canEditVacancy: boolean
  currentCreateOrderId: string
  createForm: CreateVacancyFormState
  currentVacancyId: string
  currentVacancyEditTitle: string
  currentVacancyEditDescription: string
  vacancies: VacancyResponse[]
  setSubmitMessage: (message: SubmitMessage) => void
  resetCreateForm: () => void
  resetVacancyEditState: () => void
  applyVacancyContext: (vacancyId: string) => void
  refetchVacancies: () => Promise<unknown>
  refetchVacancyDetails: () => void
  createVacancyRequest: (body: {
    orderId: string
    title: string
    description: string
  }) => Promise<unknown>
  updateVacancyRequest: (args: { vacancyId: string; body: UpdateVacancyRequestBody }) => Promise<unknown>
  updateVacancyStatusRequest: (args: {
    vacancyId: string
    body: { status: VacancyStatusContract }
  }) => Promise<unknown>
  deleteVacancyRequest: (vacancyId: string) => Promise<unknown>
}

export function useVacancyCrudActions({
  currentUserRole,
  canCreateVacancy,
  canEditVacancy,
  currentCreateOrderId,
  createForm,
  currentVacancyId,
  currentVacancyEditTitle,
  currentVacancyEditDescription,
  vacancies,
  setSubmitMessage,
  resetCreateForm,
  resetVacancyEditState,
  applyVacancyContext,
  refetchVacancies,
  refetchVacancyDetails,
  createVacancyRequest,
  updateVacancyRequest,
  updateVacancyStatusRequest,
  deleteVacancyRequest,
}: UseVacancyCrudActionsArgs) {
  async function handleCreateVacancy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canCreateVacancy) {
      setSubmitMessage({ status: 'error', text: 'Создавать вакансию может только исполнитель.' })
      return
    }

    const orderId = currentCreateOrderId.trim()
    const title = createForm.title.trim()
    const description = createForm.description.trim()

    if (!orderId || !title || !description) {
      setSubmitMessage({ status: 'error', text: 'Выберите orderId, заполните title и description.' })
      return
    }

    try {
      await createVacancyRequest({ orderId, title, description })
      setSubmitMessage({ status: 'success', text: 'Вакансия создана.' })
      resetCreateForm()
      await refetchVacancies()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleStatusTransition(vacancy: VacancyResponse) {
    const nextAction = getLifecycleAction(currentUserRole, vacancy)
    if (!nextAction) {
      return
    }

    try {
      await updateVacancyStatusRequest({
        vacancyId: vacancy.id,
        body: { status: nextAction.status },
      })
      setSubmitMessage({ status: 'success', text: `Статус вакансии обновлен: ${nextAction.status}.` })
      await refetchVacancies()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleUpdateVacancyDetails() {
    if (!canEditVacancy) {
      setSubmitMessage({ status: 'error', text: 'Редактирование вакансии доступно только исполнителю.' })
      return
    }

    const vacancyId = currentVacancyId.trim()
    const title = currentVacancyEditTitle.trim()
    const description = currentVacancyEditDescription.trim()

    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }

    if (!title || !description) {
      setSubmitMessage({ status: 'error', text: 'Заполните title и description для редактирования вакансии.' })
      return
    }

    try {
      await updateVacancyRequest({
        vacancyId,
        body: {
          title,
          description,
        },
      })
      resetVacancyEditState()
      setSubmitMessage({ status: 'success', text: 'Вакансия обновлена.' })
      await refetchVacancies()
      // @dvnull: Ранее refetch деталей вызывался напрямую из VacanciesPage после успешного update; сохранено через callback без изменения последовательности.
      refetchVacancyDetails()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleDeleteVacancy() {
    if (!canEditVacancy) {
      setSubmitMessage({ status: 'error', text: 'Удаление вакансии доступно только исполнителю.' })
      return
    }

    const vacancyId = currentVacancyId.trim()
    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }

    const confirmed = window.confirm('Удалить выбранную вакансию? Действие необратимо.')
    if (!confirmed) {
      return
    }

    try {
      await deleteVacancyRequest(vacancyId)
      const nextVacancyId = vacancies.find((vacancy) => vacancy.id !== vacancyId)?.id ?? ''
      applyVacancyContext(nextVacancyId)
      setSubmitMessage({ status: 'success', text: 'Вакансия удалена.' })
      await refetchVacancies()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  return {
    handleCreateVacancy,
    handleStatusTransition,
    handleUpdateVacancyDetails,
    handleDeleteVacancy,
  }
}
