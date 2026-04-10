import { type ChangeEvent, type FormEvent, useState } from 'react'
import { skipToken, type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Link } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useVacanciesServer } from '@/features/vacancies/model'
import {
  VacanciesListSurface,
  VacancyCandidateDetailsSurface,
  VacancyCandidatesSurface,
  VacancyContactsSurface,
  VacancyDetailsSurface,
  VacancyPipelineSurface,
  VacancyWorkspaceNavSurface,
} from '@/features/vacancies/ui'
import { useGetMyAuthInfoQuery } from '@/shared/api/auth'
import { useGetOrdersQuery } from '@/shared/api/orders'
import {
  useAddCandidateFromBaseMutation,
  useCreateCandidateResumeMutation,
  useGetVacancyBaseCandidatesQuery,
  useGetVacancyCandidatesQuery,
  useLazyGetExecutorCandidateContactsQuery,
  useLazyGetSelectedCandidateContactsQuery,
  useSelectVacancyCandidateMutation,
  useUpdateVacancyCandidateStageMutation,
  type ExecutorCandidateContactsResponse,
  type SelectedCandidateContactsResponse,
  type VacancyCandidateStageContract,
} from '@/shared/api/candidates'
import {
  useGetVacancyByIdQuery,
  type GetVacanciesRequest,
  type VacancyResponse,
  type VacancyStatusContract,
} from '@/shared/api/vacancies'

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
  resumeSummary: string
  resumeSkills: string
  resumeAttachmentLinks: string
}

type VacancyWorkspaceSection = 'details' | 'pipeline' | 'candidates'

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
      case 'vacancy_access_forbidden':
        return 'У вас нет доступа к этой вакансии.'
      case 'vacancy_status_forbidden':
        return 'У вас нет прав менять статус этой вакансии.'
      case 'vacancy_conflict':
        return 'Не удалось сохранить вакансию из-за конфликта данных.'
      case 'vacancy_status_transition_invalid':
        return 'Недопустимый переход статуса вакансии.'
      case 'vacancy_status_conflict':
        return 'Конфликт при обновлении статуса вакансии.'
      case 'vacancy_not_published':
        return 'Операция доступна только для опубликованной вакансии.'
      case 'vacancy_candidates_forbidden':
        return 'У вас нет доступа к списку кандидатов этой вакансии.'
      case 'vacancy_base_candidates_forbidden':
        return 'У вас нет доступа к списку кандидатов из системной базы для этой вакансии.'
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

function parseNonNegativeInteger(rawValue: string): number | null {
  const trimmedValue = rawValue.trim()
  if (!/^\d+$/.test(trimmedValue)) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  if (!Number.isSafeInteger(parsedValue)) {
    return null
  }

  return parsedValue
}

function buildResumeContentJson(form: CreateCandidateResumeFormState): string {
  const skills = form.resumeSkills
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)

  // @dvnull: Ранее `resumeContentJson` вводился вручную; переведено на сериализацию structured-полей формы.
  return JSON.stringify({
    summary: form.resumeSummary.trim(),
    skills,
  })
}

function buildResumeAttachmentsJson(form: CreateCandidateResumeFormState): string | undefined {
  const links = form.resumeAttachmentLinks
    .split('\n')
    .map((link) => link.trim())
    .filter((link) => link.length > 0)

  if (links.length === 0) {
    return undefined
  }

  return JSON.stringify(links)
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
  const defaultVacanciesLimit = 20
  const defaultVacanciesOffset = 0
  const [vacanciesQuery, setVacanciesQuery] = useState<GetVacanciesRequest>({
    limit: defaultVacanciesLimit,
    offset: defaultVacanciesOffset,
  })
  const [vacanciesLimitInput, setVacanciesLimitInput] = useState(String(defaultVacanciesLimit))
  const [vacanciesOffsetInput, setVacanciesOffsetInput] = useState(String(defaultVacanciesOffset))
  const {
    data,
    error,
    isError,
    isLoading,
    isCreatingVacancy,
    isUpdatingVacancy,
    isUpdatingVacancyStatus,
    isDeletingVacancy,
    refetch,
    createVacancy,
    updateVacancy,
    updateVacancyStatus,
    deleteVacancy,
  } = useVacanciesServer(vacanciesQuery)
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
    title: '',
    description: '',
  })
  const [selectedCreateOrderId, setSelectedCreateOrderId] = useState('')
  const [pipelineForm, setPipelineForm] = useState<PipelineFormState>({
    stage: 'Pool',
  })
  const [selectedAddFromBaseCandidateId, setSelectedAddFromBaseCandidateId] = useState('')
  const [createCandidateResumeForm, setCreateCandidateResumeForm] =
    useState<CreateCandidateResumeFormState>({
      fullName: '',
      birthDate: '',
      email: '',
      phone: '',
      specialization: '',
      resumeTitle: '',
      resumeSummary: '',
      resumeSkills: '',
      resumeAttachmentLinks: '',
    })
  const [selectedCandidateContacts, setSelectedCandidateContacts] =
    useState<SelectedCandidateContactsResponse | null>(null)
  const [executorCandidateContacts, setExecutorCandidateContacts] =
    useState<ExecutorCandidateContactsResponse | null>(null)
  const [selectedVacancyId, setSelectedVacancyId] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [activeVacancySection, setActiveVacancySection] = useState<VacancyWorkspaceSection>('details')
  const [vacancyEditTitleInput, setVacancyEditTitleInput] = useState('')
  const [vacancyEditDescriptionInput, setVacancyEditDescriptionInput] = useState('')
  const [isVacancyEditTitleDirty, setIsVacancyEditTitleDirty] = useState(false)
  const [isVacancyEditDescriptionDirty, setIsVacancyEditDescriptionDirty] = useState(false)

  const vacancies = data?.items ?? []
  const currentVacanciesLimit = data?.limit ?? vacanciesQuery.limit ?? defaultVacanciesLimit
  const currentVacanciesOffset = data?.offset ?? vacanciesQuery.offset ?? defaultVacanciesOffset
  const currentVacancyId = selectedVacancyId || vacancies[0]?.id || ''
  const vacancyDetailsQueryArg = currentVacancyId ? currentVacancyId : skipToken
  const {
    data: vacancyDetailsData,
    error: vacancyDetailsError,
    isFetching: isVacancyDetailsFetching,
    refetch: refetchVacancyDetails,
  } = useGetVacancyByIdQuery(vacancyDetailsQueryArg)
  const canCreateVacancy = authMe?.role === 'Executor'
  const canEditVacancy = authMe?.role === 'Executor'
  const {
    data: ordersData,
    error: ordersError,
    isFetching: isOrdersLoading,
  } = useGetOrdersQuery(canCreateVacancy ? undefined : skipToken)
  const availableOrders = ordersData?.items ?? []
  const currentCreateOrderId = selectedCreateOrderId || availableOrders[0]?.id || ''
  const canManagePipeline = authMe?.role === 'Executor'
  const canSelectCandidate = authMe?.role === 'Customer'
  const canReadSelectedContacts = authMe?.role === 'Customer'
  const canReadExecutorContacts = authMe?.role === 'Executor'
  const canReadVacancyCandidates =
    authMe?.role === 'Customer' || authMe?.role === 'Executor' || authMe?.role === 'Admin'
  const vacancyCandidatesQueryArg =
    canReadVacancyCandidates && currentVacancyId ? { vacancyId: currentVacancyId } : skipToken
  const {
    data: vacancyCandidatesData,
    error: vacancyCandidatesError,
    isFetching: isVacancyCandidatesFetching,
    refetch: refetchVacancyCandidates,
  } = useGetVacancyCandidatesQuery(vacancyCandidatesQueryArg)
  const vacancyBaseCandidatesQueryArg =
    canManagePipeline && currentVacancyId ? { vacancyId: currentVacancyId } : skipToken
  const {
    data: vacancyBaseCandidatesData,
    error: vacancyBaseCandidatesError,
    isFetching: isVacancyBaseCandidatesFetching,
    refetch: refetchVacancyBaseCandidates,
  } = useGetVacancyBaseCandidatesQuery(vacancyBaseCandidatesQueryArg)
  const vacancyCandidates = vacancyCandidatesData?.items ?? []
  const vacancyBaseCandidates = vacancyBaseCandidatesData?.items ?? []
  const hasSelectedAddFromBaseCandidate = vacancyBaseCandidates.some(
    (candidate) => candidate.candidateId === selectedAddFromBaseCandidateId,
  )
  const currentAddFromBaseCandidateId = hasSelectedAddFromBaseCandidate
    ? selectedAddFromBaseCandidateId
    : vacancyBaseCandidates[0]?.candidateId || ''
  const backendSelectedCandidateId = vacancyCandidatesData?.selectedCandidateId ?? ''
  const isSelectionActionLoading =
    isSelectingCandidate || isFetchingSelectedCandidateContacts || isFetchingExecutorCandidateContacts
  const isVacancyEditActionLoading = isUpdatingVacancy || isDeletingVacancy || isVacancyDetailsFetching
  const currentCandidateId = selectedCandidateId || backendSelectedCandidateId
  const currentVacancyCandidate = vacancyCandidates.find((candidate) => candidate.candidateId === currentCandidateId)
  const currentVacancyEditTitle = isVacancyEditTitleDirty
    ? vacancyEditTitleInput
    : vacancyDetailsData?.title ?? ''
  const currentVacancyEditDescription = isVacancyEditDescriptionDirty
    ? vacancyEditDescriptionInput
    : vacancyDetailsData?.description ?? ''
  const currentVacancyStatus: VacancyStatusContract | undefined =
    vacancyDetailsData?.status ?? vacancies.find((vacancy) => vacancy.id === currentVacancyId)?.status

  function ensurePublishedVacancyForPipeline(): boolean {
    if (currentVacancyStatus === 'Published') {
      return true
    }

    setSubmitMessage({ status: 'error', text: 'Операции pipeline доступны только для опубликованной вакансии.' })
    return false
  }

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

  function handleCreateOrderSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCreateOrderId(event.target.value)
  }

  function handleAddFromBaseCandidateSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedAddFromBaseCandidateId(event.target.value)
  }

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

  function handleSelectVacancy(vacancyId: string) {
    applyVacancyContext(vacancyId)
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

  function applyVacanciesQuery(limit: number, offset: number) {
    setVacanciesQuery({ limit, offset })
    setVacanciesLimitInput(String(limit))
    setVacanciesOffsetInput(String(offset))
    applyVacancyContext('')
  }

  function handleVacanciesQueryInputChange(field: 'limit' | 'offset', event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    if (field === 'limit') {
      setVacanciesLimitInput(nextValue)
      return
    }

    setVacanciesOffsetInput(nextValue)
  }

  function handleApplyVacanciesQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedLimit = parseNonNegativeInteger(vacanciesLimitInput)
    const parsedOffset = parseNonNegativeInteger(vacanciesOffsetInput)

    if (parsedLimit === null || parsedLimit <= 0) {
      setSubmitMessage({ status: 'error', text: 'limit должен быть целым числом больше 0.' })
      return
    }

    if (parsedOffset === null) {
      setSubmitMessage({ status: 'error', text: 'offset должен быть целым числом от 0.' })
      return
    }

    applyVacanciesQuery(parsedLimit, parsedOffset)
  }

  function handlePreviousVacanciesPage() {
    if (currentVacanciesOffset <= 0) {
      return
    }

    const nextOffset = Math.max(0, currentVacanciesOffset - currentVacanciesLimit)
    applyVacanciesQuery(currentVacanciesLimit, nextOffset)
  }

  function handleNextVacanciesPage() {
    if (vacancies.length < currentVacanciesLimit) {
      return
    }

    const nextOffset = currentVacanciesOffset + currentVacanciesLimit
    applyVacanciesQuery(currentVacanciesLimit, nextOffset)
  }

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
      await createVacancy({ orderId, title, description }).unwrap()
      setSubmitMessage({ status: 'success', text: 'Вакансия создана.' })
      setCreateForm({ title: '', description: '' })
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
      await updateVacancy({
        vacancyId,
        body: {
          title,
          description,
        },
      }).unwrap()
      setVacancyEditTitleInput('')
      setVacancyEditDescriptionInput('')
      setIsVacancyEditTitleDirty(false)
      setIsVacancyEditDescriptionDirty(false)
      setSubmitMessage({ status: 'success', text: 'Вакансия обновлена.' })
      await refetch()
      void refetchVacancyDetails()
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
      await deleteVacancy(vacancyId).unwrap()
      const nextVacancyId = vacancies.find((vacancy) => vacancy.id !== vacancyId)?.id ?? ''
      applyVacancyContext(nextVacancyId)
      setSubmitMessage({ status: 'success', text: 'Вакансия удалена.' })
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
    const resumeSummary = createCandidateResumeForm.resumeSummary.trim()

    if (!vacancyId) {
      setSubmitMessage({ status: 'error', text: 'Выберите вакансию в таблице.' })
      return
    }
    if (!ensurePublishedVacancyForPipeline()) {
      return
    }

    if (!fullName || !specialization || !resumeTitle || !resumeSummary) {
      setSubmitMessage({
        status: 'error',
        text: 'Заполните fullName, specialization, resumeTitle и резюме (summary).',
      })
      return
    }

    const resumeContentJson = buildResumeContentJson(createCandidateResumeForm)
    const resumeAttachmentsJson = buildResumeAttachmentsJson(createCandidateResumeForm)

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
          resumeAttachmentsJson,
        },
      }).unwrap()
      setSelectedCandidateId(result.candidateId)
      setSubmitMessage({ status: 'success', text: 'Кандидат с резюме добавлен в pipeline.' })
      setCreateCandidateResumeForm({
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
        specialization: '',
        resumeTitle: '',
        resumeSummary: '',
        resumeSkills: '',
        resumeAttachmentLinks: '',
      })
      await refetch()
      void refetchVacancyCandidates()
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
      const result = await addCandidateFromBase({ vacancyId, candidateId }).unwrap()
      setSelectedCandidateId(result.candidateId)
      setSelectedAddFromBaseCandidateId('')
      setSubmitMessage({ status: 'success', text: 'Кандидат добавлен в pipeline (Pool).' })
      await refetch()
      void refetchVacancyCandidates()
      void refetchVacancyBaseCandidates()
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
      const result = await updateVacancyCandidateStage({
        vacancyId,
        candidateId,
        body: { stage: pipelineForm.stage },
      }).unwrap()
      setSelectedCandidateId(result.candidateId)
      setSubmitMessage({ status: 'success', text: `Стадия кандидата обновлена: ${pipelineForm.stage}.` })
      await refetch()
      void refetchVacancyCandidates()
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
      setSubmitMessage({ status: 'error', text: 'Выберите кандидата в таблице вакансии.' })
      return
    }

    try {
      const result = await selectVacancyCandidate({
        vacancyId,
        body: { candidateId },
      }).unwrap()
      setSelectedCandidateId(result.selectedCandidateId)
      setSubmitMessage({ status: 'success', text: 'Финальный кандидат выбран.' })
      setSelectedCandidateContacts(null)
      await refetch()
      void refetchVacancyCandidates()
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
      const contacts = await fetchExecutorCandidateContacts({ vacancyId, candidateId }).unwrap()
      setExecutorCandidateContacts(contacts)
      setSelectedCandidateId(contacts.candidateId)
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

          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Пагинация вакансий</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleApplyVacanciesQuery} className="grid gap-3 md:grid-cols-4">
                <Input
                  type="number"
                  min={1}
                  value={vacanciesLimitInput}
                  onChange={(event) => handleVacanciesQueryInputChange('limit', event)}
                  placeholder="limit"
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  min={0}
                  value={vacanciesOffsetInput}
                  onChange={(event) => handleVacanciesQueryInputChange('offset', event)}
                  placeholder="offset"
                  disabled={isLoading}
                />
                <Button type="submit" variant="outline" disabled={isLoading}>
                  Применить
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousVacanciesPage}
                    disabled={isLoading || currentVacanciesOffset <= 0}
                  >
                    Назад
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNextVacanciesPage}
                    disabled={isLoading || currentVacanciesLimit <= 0 || vacancies.length < currentVacanciesLimit}
                  >
                    Вперед
                  </Button>
                </div>
              </form>
              <Alert>
                Текущая выборка: limit={currentVacanciesLimit}, offset={currentVacanciesOffset}
              </Alert>
            </CardContent>
          </Card>

          <VacanciesListSurface
            vacancies={vacancies}
            currentVacancyId={currentVacancyId}
            currentVacanciesOffset={currentVacanciesOffset}
            requesterRole={authMe?.role}
            isUpdatingVacancyStatus={isUpdatingVacancyStatus}
            onSelectVacancy={handleSelectVacancy}
            onStatusTransition={handleStatusTransition}
          />

          <VacancyWorkspaceNavSurface
            activeSection={activeVacancySection}
            onSectionChange={setActiveVacancySection}
          />

          {activeVacancySection === 'details' ? (
            <>
              <VacancyDetailsSurface
                currentVacancyId={currentVacancyId}
                isVacancyDetailsFetching={isVacancyDetailsFetching}
                vacancyDetailsError={vacancyDetailsError}
                vacancyDetailsData={vacancyDetailsData}
                canEditVacancy={canEditVacancy}
                currentVacancyEditTitle={currentVacancyEditTitle}
                currentVacancyEditDescription={currentVacancyEditDescription}
                isVacancyEditActionLoading={isVacancyEditActionLoading}
                onVacancyEditTitleChange={handleVacancyEditTitleChange}
                onVacancyEditDescriptionChange={handleVacancyEditDescriptionChange}
                onUpdateVacancyDetails={handleUpdateVacancyDetails}
                onDeleteVacancy={handleDeleteVacancy}
                getRequestErrorMessage={getRequestErrorMessage}
              />

              <Card className="border-slate-200 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Создать вакансию</CardTitle>
                </CardHeader>
                <CardContent>
                  {!canCreateVacancy ? (
                    <Alert>Создание вакансии доступно только для роли исполнителя.</Alert>
                  ) : null}
                  {canCreateVacancy && isOrdersLoading ? <Alert>Загрузка заказов...</Alert> : null}
                  {canCreateVacancy && ordersError ? (
                    <Alert variant="destructive">{getRequestErrorMessage(ordersError)}</Alert>
                  ) : null}
                  {canCreateVacancy && !isOrdersLoading && !ordersError && availableOrders.length === 0 ? (
                    <Alert>Нет доступных заказов для создания вакансии.</Alert>
                  ) : null}
                  <form onSubmit={handleCreateVacancy} className="grid gap-3 md:grid-cols-3">
                    <select
                      value={currentCreateOrderId}
                      onChange={handleCreateOrderSelectChange}
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={
                        !canCreateVacancy || isCreatingVacancy || isOrdersLoading || availableOrders.length === 0
                      }
                    >
                      <option value="" disabled>
                        Выберите заказ
                      </option>
                      {availableOrders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.title} ({order.id})
                        </option>
                      ))}
                    </select>
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
            </>
          ) : null}

          {activeVacancySection === 'pipeline' ? (
            <VacancyPipelineSurface
              canManagePipeline={canManagePipeline}
              isVacancyPublished={currentVacancyStatus === 'Published'}
              currentVacancyId={currentVacancyId}
              isVacancyBaseCandidatesFetching={isVacancyBaseCandidatesFetching}
              vacancyBaseCandidatesError={vacancyBaseCandidatesError}
              vacancyBaseCandidates={vacancyBaseCandidates}
              currentAddFromBaseCandidateId={currentAddFromBaseCandidateId}
              pipelineStage={pipelineForm.stage}
              isAddingCandidateFromBase={isAddingCandidateFromBase}
              isUpdatingCandidateStage={isUpdatingCandidateStage}
              currentCandidateId={currentCandidateId}
              createCandidateResumeForm={createCandidateResumeForm}
              isCreatingCandidateResume={isCreatingCandidateResume}
              onAddFromBaseCandidateSelectChange={handleAddFromBaseCandidateSelectChange}
              onPipelineStageChange={handlePipelineStageChange}
              onAddCandidateFromBase={handleAddCandidateFromBase}
              onUpdateCandidateStage={handleUpdateCandidateStage}
              onCreateCandidateResumeInputChange={handleCreateCandidateResumeInputChange}
              onCreateCandidateResume={handleCreateCandidateResume}
              getRequestErrorMessage={getRequestErrorMessage}
            />
          ) : null}

          {activeVacancySection === 'candidates' ? (
            <>
              <VacancyCandidatesSurface
                canReadVacancyCandidates={canReadVacancyCandidates}
                currentVacancyId={currentVacancyId}
                isVacancyCandidatesFetching={isVacancyCandidatesFetching}
                vacancyCandidatesError={vacancyCandidatesError}
                vacancyCandidates={vacancyCandidates}
                currentCandidateId={currentCandidateId}
                backendSelectedCandidateId={backendSelectedCandidateId}
                getRequestErrorMessage={getRequestErrorMessage}
                onSelectCandidateId={(candidateId) => {
                  setSelectedCandidateId(candidateId)
                }}
              />

              <VacancyCandidateDetailsSurface
                canSelectCandidate={canSelectCandidate}
                canReadSelectedContacts={canReadSelectedContacts}
                canReadExecutorContacts={canReadExecutorContacts}
                isSelectionActionLoading={isSelectionActionLoading}
                currentVacancyId={currentVacancyId}
                currentCandidateId={currentCandidateId}
                candidatePublicAlias={currentVacancyCandidate?.publicAlias ?? null}
                candidateStage={currentVacancyCandidate?.stage ?? null}
                candidateUpdatedAtUtc={currentVacancyCandidate?.updatedAtUtc ?? null}
                candidateIsSelected={currentVacancyCandidate?.isSelected ?? false}
                onSelectCandidate={handleSelectCandidate}
                onGetSelectedCandidateContacts={handleGetSelectedCandidateContacts}
                onGetExecutorCandidateContacts={handleGetExecutorCandidateContacts}
              />

              <VacancyContactsSurface
                selectedCandidateContacts={selectedCandidateContacts}
                executorCandidateContacts={executorCandidateContacts}
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
