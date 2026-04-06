import { type ChangeEvent, type FormEvent, useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Link } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useVacanciesServer } from '@/features/vacancies/model'
import { useGetMyAuthInfoQuery } from '@/shared/api/auth'
import {
  useAddCandidateFromBaseMutation,
  useCreateCandidateResumeMutation,
  useLazyGetExecutorCandidateContactsQuery,
  useLazyGetSelectedCandidateContactsQuery,
  useSelectVacancyCandidateMutation,
  useUpdateVacancyCandidateStageMutation,
  type ExecutorCandidateContactsResponse,
  type SelectedCandidateContactsResponse,
  type VacancyCandidateStageContract,
} from '@/shared/api/candidates'
import type { VacancyResponse, VacancyStatusContract } from '@/shared/api/vacancies'

type ProblemDetailsPayload = {
  code?: string
  detail?: string
  title?: string
}

type SubmitMessage = {
  status: 'idle' | 'success' | 'error'
  text: string
}

type CreateVacancyFormState = {
  orderId: string
  title: string
  description: string
}

type PipelineFormState = {
  stage: VacancyCandidateStageContract
}

type CreateCandidateResumeFormState = {
  fullName: string
  birthDate: string
  email: string
  phone: string
  specialization: string
  resumeTitle: string
  resumeContentJson: string
  resumeAttachmentsJson: string
}

function isProblemDetailsPayload(value: unknown): value is ProblemDetailsPayload {
  return typeof value === 'object' && value !== null
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

function getRequestErrorMessage(error: unknown): string {
  if (!isFetchBaseQueryError(error)) {
    return 'Не удалось выполнить запрос.'
  }

  if (error.status === 'FETCH_ERROR') {
    return 'Не удалось установить соединение с сервером.'
  }

  if (error.status === 401) {
    return 'Требуется авторизация.'
  }

  if (typeof error.status === 'number' && isProblemDetailsPayload(error.data)) {
    switch (error.data.code) {
      case 'order_not_found':
        return 'Заказ для вакансии не найден.'
      case 'vacancy_create_forbidden':
        return 'У вас нет прав создавать вакансию для этого заказа.'
      case 'vacancy_status_forbidden':
        return 'У вас нет прав менять статус этой вакансии.'
      case 'vacancy_status_transition_invalid':
        return 'Недопустимый переход статуса вакансии.'
      case 'vacancy_status_conflict':
        return 'Конфликт при обновлении статуса вакансии.'
      case 'vacancy_not_published':
        return 'Операция доступна только для опубликованной вакансии.'
      case 'candidate_resume_create_forbidden':
        return 'У вас нет прав на ручное добавление кандидата в эту вакансию.'
      case 'candidate_resume_invalid_input':
        return 'Проверьте поля формы кандидата и резюме.'
      case 'candidate_already_exists':
        return 'Кандидат с такими идентификаторами уже существует.'
      case 'candidate_resume_conflict':
        return 'Не удалось добавить кандидата из-за конфликта данных.'
      case 'candidate_not_found':
        return 'Кандидат не найден в системной базе.'
      case 'candidate_link_forbidden':
      case 'candidate_stage_forbidden':
        return 'У вас нет доступа к операциям pipeline для этой вакансии.'
      case 'candidate_link_conflict':
        return 'Кандидат уже добавлен в pipeline этой вакансии.'
      case 'vacancy_candidate_not_found':
        return 'Кандидат не найден в pipeline этой вакансии.'
      case 'vacancy_candidate_stage_invalid':
        return 'Некорректная стадия кандидата.'
      case 'vacancy_candidate_stage_conflict':
        return 'Не удалось изменить стадию кандидата из-за ограничения процесса.'
      case 'candidate_select_forbidden':
        return 'У вас нет прав финального выбора кандидата по этой вакансии.'
      case 'candidate_not_in_shortlist':
        return 'Кандидат не находится в shortlist этой вакансии.'
      case 'candidate_select_conflict':
        return 'Финальный кандидат уже выбран и не может быть изменен.'
      case 'selected_candidate_contacts_forbidden':
        return 'У вас нет доступа к контактам выбранного кандидата.'
      case 'candidate_not_selected':
        return 'Финальный кандидат еще не выбран.'
      case 'selected_candidate_not_found':
        return 'Выбранный кандидат не найден.'
      case 'vacancy_candidate_contacts_forbidden':
        return 'У вас нет доступа к контактам кандидата.'
      case 'vacancy_candidate_contacts_access_denied':
        return 'Доступ к контактам кандидата ограничен (owner/TTL).'
      default:
        return error.data.detail ?? error.data.title ?? 'Не удалось выполнить запрос.'
    }
  }

  return 'Не удалось выполнить запрос.'
}

function getLifecycleAction(
  role: string | undefined,
  vacancy: VacancyResponse,
): { label: string; status: VacancyStatusContract } | null {
  if (role === 'Executor' && vacancy.status === 'Draft') {
    return { label: 'На согласование', status: 'OnApproval' }
  }

  if (role === 'Executor' && vacancy.status === 'OnApproval') {
    return { label: 'Вернуть в Draft', status: 'Draft' }
  }

  if (role === 'Customer' && vacancy.status === 'OnApproval') {
    return { label: 'Опубликовать', status: 'Published' }
  }

  return null
}

export function VacanciesPage() {
  const {
    data,
    error,
    isError,
    isLoading,
    isCreatingVacancy,
    isUpdatingVacancyStatus,
    refetch,
    createVacancy,
    updateVacancyStatus,
  } = useVacanciesServer()
  const { data: authMe } = useGetMyAuthInfoQuery()
  const [createCandidateResume, { isLoading: isCreatingCandidateResume }] = useCreateCandidateResumeMutation()
  const [addCandidateFromBase, { isLoading: isAddingCandidateFromBase }] = useAddCandidateFromBaseMutation()
  const [updateVacancyCandidateStage, { isLoading: isUpdatingCandidateStage }] =
    useUpdateVacancyCandidateStageMutation()
  const [selectVacancyCandidate, { isLoading: isSelectingCandidate }] = useSelectVacancyCandidateMutation()
  const [fetchSelectedCandidateContacts, { isFetching: isFetchingSelectedCandidateContacts }] =
    useLazyGetSelectedCandidateContactsQuery()
  const [fetchExecutorCandidateContacts, { isFetching: isFetchingExecutorCandidateContacts }] =
    useLazyGetExecutorCandidateContactsQuery()
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage>({ status: 'idle', text: '' })
  const [createForm, setCreateForm] = useState<CreateVacancyFormState>({
    orderId: '',
    title: '',
    description: '',
  })
  const [pipelineForm, setPipelineForm] = useState<PipelineFormState>({
    stage: 'Pool',
  })
  const [candidateInputId, setCandidateInputId] = useState('')
  const [createCandidateResumeForm, setCreateCandidateResumeForm] =
    useState<CreateCandidateResumeFormState>({
      fullName: '',
      birthDate: '',
      email: '',
      phone: '',
      specialization: '',
      resumeTitle: '',
      resumeContentJson: '{}',
      resumeAttachmentsJson: '',
    })
  const [selectedCandidateContacts, setSelectedCandidateContacts] =
    useState<SelectedCandidateContactsResponse | null>(null)
  const [executorCandidateContacts, setExecutorCandidateContacts] =
    useState<ExecutorCandidateContactsResponse | null>(null)
  const [selectedVacancyId, setSelectedVacancyId] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState('')

  const vacancies = data?.items ?? []
  const currentVacancyId = selectedVacancyId || vacancies[0]?.id || ''
  const currentCandidateId = candidateInputId.trim() || selectedCandidateId
  const canCreateVacancy = authMe?.role === 'Executor'
  const canManagePipeline = authMe?.role === 'Executor'
  const canSelectCandidate = authMe?.role === 'Customer'
  const canReadSelectedContacts = authMe?.role === 'Customer'
  const canReadExecutorContacts = authMe?.role === 'Executor'
  const isSelectionActionLoading =
    isSelectingCandidate || isFetchingSelectedCandidateContacts || isFetchingExecutorCandidateContacts

  function handleCreateFormChange(
    field: keyof CreateVacancyFormState,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const nextValue = event.target.value
    setCreateForm((previous) => ({
      ...previous,
      [field]: nextValue,
    }))
  }

  function handleCandidateInputChange(event: ChangeEvent<HTMLInputElement>) {
    setCandidateInputId(event.target.value)
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

  async function handleCreateVacancy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canCreateVacancy) {
      setSubmitMessage({ status: 'error', text: 'Создавать вакансию может только исполнитель.' })
      return
    }

    const orderId = createForm.orderId.trim()
    const title = createForm.title.trim()
    const description = createForm.description.trim()

    if (!orderId || !title || !description) {
      setSubmitMessage({ status: 'error', text: 'Заполните orderId, title и description.' })
      return
    }

    try {
      await createVacancy({ orderId, title, description }).unwrap()
      setSubmitMessage({ status: 'success', text: 'Вакансия создана.' })
      setCreateForm({ orderId: '', title: '', description: '' })
      await refetch()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  async function handleStatusTransition(vacancy: VacancyResponse) {
    const nextAction = getLifecycleAction(authMe?.role, vacancy)
    if (!nextAction) {
      return
    }

    try {
      await updateVacancyStatus({
        vacancyId: vacancy.id,
        body: { status: nextAction.status },
      }).unwrap()
      setSubmitMessage({ status: 'success', text: `Статус вакансии обновлен: ${nextAction.status}.` })
      await refetch()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
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
    const resumeContentJson = createCandidateResumeForm.resumeContentJson.trim()

    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }

    if (!fullName || !specialization || !resumeTitle || !resumeContentJson) {
      setSubmitMessage({
        status: 'error',
        text: 'Заполните fullName, specialization, resumeTitle и resumeContentJson.',
      })
      return
    }

    try {
      const result = await createCandidateResume({
        vacancyId,
        body: {
          fullName,
          birthDate: createCandidateResumeForm.birthDate.trim() || undefined,
          email: createCandidateResumeForm.email.trim() || undefined,
          phone: createCandidateResumeForm.phone.trim() || undefined,
          specialization,
          resumeTitle,
          resumeContentJson,
          resumeAttachmentsJson: createCandidateResumeForm.resumeAttachmentsJson.trim() || undefined,
        },
      }).unwrap()
      setSelectedCandidateId(result.candidateId)
      setCandidateInputId(result.candidateId)
      setSubmitMessage({ status: 'success', text: 'Кандидат с резюме добавлен в pipeline.' })
      setCreateCandidateResumeForm({
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
        specialization: '',
        resumeTitle: '',
        resumeContentJson: '{}',
        resumeAttachmentsJson: '',
      })
      await refetch()
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
    const candidateId = currentCandidateId

    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }

    if (!candidateId) {
      setSubmitMessage({ status: 'error', text: 'Заполните candidateId.' })
      return
    }

    try {
      const result = await addCandidateFromBase({ vacancyId, candidateId }).unwrap()
      setSelectedCandidateId(result.candidateId)
      setCandidateInputId(result.candidateId)
      setSubmitMessage({ status: 'success', text: 'Кандидат добавлен в pipeline (Pool).' })
      await refetch()
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

    if (!candidateId) {
      setSubmitMessage({ status: 'error', text: 'Заполните candidateId.' })
      return
    }

    try {
      const result = await updateVacancyCandidateStage({
        vacancyId,
        candidateId,
        body: { stage: pipelineForm.stage },
      }).unwrap()
      setSelectedCandidateId(result.candidateId)
      setCandidateInputId(result.candidateId)
      setSubmitMessage({ status: 'success', text: `Стадия кандидата обновлена: ${pipelineForm.stage}.` })
      await refetch()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

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
      setSubmitMessage({ status: 'error', text: 'Заполните candidateId для выбора кандидата.' })
      return
    }

    try {
      const result = await selectVacancyCandidate({
        vacancyId,
        body: { candidateId },
      }).unwrap()
      setSelectedCandidateId(result.selectedCandidateId)
      setCandidateInputId(result.selectedCandidateId)
      setSubmitMessage({ status: 'success', text: 'Финальный кандидат выбран.' })
      setSelectedCandidateContacts(null)
      await refetch()
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
      const contacts = await fetchSelectedCandidateContacts({ vacancyId }).unwrap()
      setSelectedCandidateContacts(contacts)
      setSelectedCandidateId(contacts.candidateId)
      setCandidateInputId(contacts.candidateId)
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
      setSubmitMessage({ status: 'error', text: 'Заполните candidateId для чтения контактов.' })
      return
    }

    try {
      const contacts = await fetchExecutorCandidateContacts({ vacancyId, candidateId }).unwrap()
      setExecutorCandidateContacts(contacts)
      setSelectedCandidateId(contacts.candidateId)
      setCandidateInputId(contacts.candidateId)
      setSubmitMessage({ status: 'success', text: 'Контакты кандидата загружены.' })
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  return (
    <section className="page profile-page">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl">Вакансии (Lifecycle API)</CardTitle>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Обновить
            </Button>
            <Button asChild type="button" variant="ghost">
              <Link to={routePaths.app}>В preview</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? <Alert>Загрузка вакансий...</Alert> : null}
          {isError ? <Alert variant="destructive">{getRequestErrorMessage(error)}</Alert> : null}
          {submitMessage.status !== 'idle' ? (
            <Alert variant={submitMessage.status === 'error' ? 'destructive' : 'success'}>
              {submitMessage.text}
            </Alert>
          ) : null}
          <Alert>
            Контекст: vacancyId={currentVacancyId || 'не выбрано'}, candidateId={currentCandidateId || 'не выбрано'}
          </Alert>
          {!isLoading && !isError && vacancies.length === 0 ? <Alert>Пока нет вакансий.</Alert> : null}

          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Создать вакансию</CardTitle>
            </CardHeader>
            <CardContent>
              {!canCreateVacancy ? (
                <Alert>Создание вакансии доступно только для роли исполнителя.</Alert>
              ) : null}
              <form onSubmit={handleCreateVacancy} className="grid gap-3 md:grid-cols-3">
                <Input
                  value={createForm.orderId}
                  onChange={(event) => handleCreateFormChange('orderId', event)}
                  placeholder="orderId (GUID)"
                  disabled={!canCreateVacancy || isCreatingVacancy}
                />
                <Input
                  value={createForm.title}
                  onChange={(event) => handleCreateFormChange('title', event)}
                  placeholder="Название вакансии"
                  disabled={!canCreateVacancy || isCreatingVacancy}
                />
                <div className="flex gap-2">
                  <Input
                    value={createForm.description}
                    onChange={(event) => handleCreateFormChange('description', event)}
                    placeholder="Описание"
                    disabled={!canCreateVacancy || isCreatingVacancy}
                  />
                  <Button type="submit" disabled={!canCreateVacancy || isCreatingVacancy}>
                    Создать
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Pipeline кандидатов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!canManagePipeline ? (
                <Alert>Операции pipeline доступны только для роли исполнителя.</Alert>
              ) : null}
              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  value={currentVacancyId}
                  placeholder="vacancyId из таблицы"
                  readOnly
                  disabled
                />
                <Input
                  value={candidateInputId}
                  onChange={handleCandidateInputChange}
                  placeholder="candidateId (GUID)"
                  disabled={!canManagePipeline || isAddingCandidateFromBase || isUpdatingCandidateStage}
                />
                <select
                  value={pipelineForm.stage}
                  onChange={handlePipelineStageChange}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!canManagePipeline || isAddingCandidateFromBase || isUpdatingCandidateStage}
                >
                  <option value="Pool">Pool</option>
                  <option value="Shortlist">Shortlist</option>
                </select>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleAddCandidateFromBase()}
                    disabled={!canManagePipeline || isAddingCandidateFromBase || isUpdatingCandidateStage}
                  >
                    Add from base
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleUpdateCandidateStage()}
                    disabled={!canManagePipeline || isAddingCandidateFromBase || isUpdatingCandidateStage}
                  >
                    Update stage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Ручное добавление кандидата с резюме</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!canManagePipeline ? (
                <Alert>Ручное добавление кандидата доступно только для роли исполнителя.</Alert>
              ) : null}
              <form onSubmit={handleCreateCandidateResume} className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    value={currentVacancyId}
                    placeholder="vacancyId из таблицы"
                    readOnly
                    disabled
                  />
                  <Input
                    value={createCandidateResumeForm.fullName}
                    onChange={(event) => handleCreateCandidateResumeInputChange('fullName', event)}
                    placeholder="ФИО"
                    disabled={!canManagePipeline || isCreatingCandidateResume}
                  />
                  <Input
                    value={createCandidateResumeForm.birthDate}
                    onChange={(event) => handleCreateCandidateResumeInputChange('birthDate', event)}
                    placeholder="Дата рождения (YYYY-MM-DD)"
                    disabled={!canManagePipeline || isCreatingCandidateResume}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    value={createCandidateResumeForm.email}
                    onChange={(event) => handleCreateCandidateResumeInputChange('email', event)}
                    placeholder="Email"
                    disabled={!canManagePipeline || isCreatingCandidateResume}
                  />
                  <Input
                    value={createCandidateResumeForm.phone}
                    onChange={(event) => handleCreateCandidateResumeInputChange('phone', event)}
                    placeholder="Телефон"
                    disabled={!canManagePipeline || isCreatingCandidateResume}
                  />
                  <Input
                    value={createCandidateResumeForm.specialization}
                    onChange={(event) => handleCreateCandidateResumeInputChange('specialization', event)}
                    placeholder="Специализация"
                    disabled={!canManagePipeline || isCreatingCandidateResume}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={createCandidateResumeForm.resumeTitle}
                    onChange={(event) => handleCreateCandidateResumeInputChange('resumeTitle', event)}
                    placeholder="Заголовок резюме"
                    disabled={!canManagePipeline || isCreatingCandidateResume}
                  />
                  <Input
                    value={createCandidateResumeForm.resumeAttachmentsJson}
                    onChange={(event) =>
                      handleCreateCandidateResumeInputChange('resumeAttachmentsJson', event)
                    }
                    placeholder="attachmentsJson (optional)"
                    disabled={!canManagePipeline || isCreatingCandidateResume}
                  />
                </div>
                <Textarea
                  value={createCandidateResumeForm.resumeContentJson}
                  onChange={(event) => handleCreateCandidateResumeInputChange('resumeContentJson', event)}
                  placeholder="resumeContentJson"
                  disabled={!canManagePipeline || isCreatingCandidateResume}
                />
                <div>
                  <Button type="submit" disabled={!canManagePipeline || isCreatingCandidateResume}>
                    Add resume
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Финальный выбор и контакты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!canSelectCandidate && !canReadExecutorContacts ? (
                <Alert>Операции выбора и чтения контактов доступны заказчику или исполнителю.</Alert>
              ) : null}
              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  value={currentVacancyId}
                  placeholder="vacancyId из таблицы"
                  readOnly
                  disabled
                />
                <Input
                  value={candidateInputId}
                  onChange={handleCandidateInputChange}
                  placeholder="candidateId (GUID)"
                  disabled={isSelectionActionLoading}
                />
                <div className="flex gap-2 md:col-span-2">
                  {canSelectCandidate ? (
                    <Button
                      type="button"
                      onClick={() => void handleSelectCandidate()}
                      disabled={isSelectionActionLoading}
                    >
                      Select candidate
                    </Button>
                  ) : null}
                  {canReadSelectedContacts ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleGetSelectedCandidateContacts()}
                      disabled={isSelectionActionLoading}
                    >
                      Selected contacts
                    </Button>
                  ) : null}
                  {canReadExecutorContacts ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleGetExecutorCandidateContacts()}
                      disabled={isSelectionActionLoading}
                    >
                      Candidate contacts
                    </Button>
                  ) : null}
                </div>
              </div>

              {selectedCandidateContacts ? (
                <Card className="border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-sm">Контакты выбранного кандидата (Customer)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-1 text-sm">
                    <p>CandidateId: {selectedCandidateContacts.candidateId}</p>
                    <p>ФИО: {selectedCandidateContacts.fullName}</p>
                    <p>Email: {selectedCandidateContacts.email ?? '—'}</p>
                    <p>Телефон: {selectedCandidateContacts.phone ?? '—'}</p>
                  </CardContent>
                </Card>
              ) : null}

              {executorCandidateContacts ? (
                <Card className="border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-sm">Контакты кандидата в вакансии (Executor)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-1 text-sm">
                    <p>CandidateId: {executorCandidateContacts.candidateId}</p>
                    <p>ФИО: {executorCandidateContacts.fullName}</p>
                    <p>Email: {executorCandidateContacts.email ?? '—'}</p>
                    <p>Телефон: {executorCandidateContacts.phone ?? '—'}</p>
                    <p>Доступ до: {executorCandidateContacts.contactsAccessExpiresAtUtc}</p>
                  </CardContent>
                </Card>
              ) : null}
            </CardContent>
          </Card>

          {vacancies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>OrderId</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[140px]">Контекст</TableHead>
                  <TableHead className="w-[220px]">Lifecycle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacancies.map((vacancy) => {
                  const action = getLifecycleAction(authMe?.role, vacancy)
                  return (
                    <TableRow key={vacancy.id} className={vacancy.id === currentVacancyId ? 'bg-slate-50' : undefined}>
                      <TableCell>{vacancy.title}</TableCell>
                      <TableCell>{vacancy.orderId}</TableCell>
                      <TableCell>{vacancy.status}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant={vacancy.id === currentVacancyId ? 'default' : 'outline'}
                          onClick={() => setSelectedVacancyId(vacancy.id)}
                        >
                          Использовать
                        </Button>
                      </TableCell>
                      <TableCell>
                        {action ? (
                          <Button
                            type="button"
                            onClick={() => void handleStatusTransition(vacancy)}
                            disabled={isUpdatingVacancyStatus}
                          >
                            {action.label}
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Нет доступного перехода</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
