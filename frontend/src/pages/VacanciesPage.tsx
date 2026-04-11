import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { Link } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getRequestErrorMessage } from '@/features/vacancies/lib/errors'
import {
  canCreateVacancy as canCreateVacancyByRole,
  canEditVacancy as canEditVacancyByRole,
  canManagePipeline as canManagePipelineByRole,
  canReadExecutorContacts as canReadExecutorContactsByRole,
  canReadSelectedContacts as canReadSelectedContactsByRole,
  canReadVacancyCandidates as canReadVacancyCandidatesByRole,
  canSelectCandidate as canSelectCandidateByRole,
} from '@/features/vacancies/lib/policy'
import {
  type CreateCandidateResumeFormState,
  type CreateVacancyFormState,
  type PipelineFormState,
  type SubmitMessage,
  type VacancyWorkspaceSection,
  useVacancyContactsActions,
  useVacancyContextState,
  useVacanciesQueryState,
  useVacancyCrudActions,
  useVacancyPipelineGuards,
  useVacancyPipelineActions,
  useVacancyFormReset,
  useVacancyFormState,
  useVacanciesServer,
} from '@/features/vacancies/model'
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
} from '@/shared/api/candidates'
import {
  useGetVacancyByIdQuery,
  type VacancyStatusContract,
} from '@/shared/api/vacancies'

export function VacanciesPage() {
  const defaultVacanciesLimit = 20
  const defaultVacanciesOffset = 0
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
      resumeRichTextHtml: '',
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
  const { applyVacancyContext } = useVacancyContextState({
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
  })
  const {
    vacanciesQuery,
    vacanciesLimitInput,
    vacanciesOffsetInput,
    handleVacanciesQueryInputChange,
    handleApplyVacanciesQuery,
    handlePreviousVacanciesPage,
    handleNextVacanciesPage,
  } = useVacanciesQueryState({
    defaultLimit: defaultVacanciesLimit,
    defaultOffset: defaultVacanciesOffset,
    onApplyQuery: () => {
      applyVacancyContext('')
    },
    onValidationError: (message) => {
      setSubmitMessage({ status: 'error', text: message })
    },
  })
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
  const currentUserRole = authMe?.role
  const canCreateVacancy = canCreateVacancyByRole(currentUserRole)
  const canEditVacancy = canEditVacancyByRole(currentUserRole)
  const {
    data: ordersData,
    error: ordersError,
    isFetching: isOrdersLoading,
  } = useGetOrdersQuery(canCreateVacancy ? undefined : skipToken)
  const availableOrders = ordersData?.items ?? []
  const currentCreateOrderId = selectedCreateOrderId || availableOrders[0]?.id || ''
  const canManagePipeline = canManagePipelineByRole(currentUserRole)
  const canSelectCandidate = canSelectCandidateByRole(currentUserRole)
  const canReadSelectedContacts = canReadSelectedContactsByRole(currentUserRole)
  const canReadExecutorContacts = canReadExecutorContactsByRole(currentUserRole)
  const canReadVacancyCandidates = canReadVacancyCandidatesByRole(currentUserRole)
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
  const { ensurePublishedVacancyForPipeline } = useVacancyPipelineGuards({
    currentVacancyStatus,
    setSubmitMessage,
  })
  const { resetCreateForm, resetVacancyEditState } = useVacancyFormReset({
    setCreateForm,
    setVacancyEditTitleInput,
    setVacancyEditDescriptionInput,
    setIsVacancyEditTitleDirty,
    setIsVacancyEditDescriptionDirty,
  })

  const { handleCreateVacancy, handleStatusTransition, handleUpdateVacancyDetails, handleDeleteVacancy } =
    useVacancyCrudActions({
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
      refetchVacancies: async () => {
        await refetch()
      },
      refetchVacancyDetails: () => {
        void refetchVacancyDetails()
      },
      createVacancyRequest: async (body) => {
        await createVacancy(body).unwrap()
      },
      updateVacancyRequest: async (args) => {
        await updateVacancy(args).unwrap()
      },
      updateVacancyStatusRequest: async (args) => {
        await updateVacancyStatus(args).unwrap()
      },
      deleteVacancyRequest: async (vacancyId) => {
        await deleteVacancy(vacancyId).unwrap()
      },
    })
  const { handleCreateCandidateResume, handleAddCandidateFromBase, handleUpdateCandidateStage } =
    useVacancyPipelineActions({
      canManagePipeline,
      currentVacancyId,
      currentAddFromBaseCandidateId,
      currentCandidateId,
      pipelineStage: pipelineForm.stage,
      createCandidateResumeForm,
      setSubmitMessage,
      setSelectedCandidateId,
      clearSelectedAddFromBaseCandidateId: () => {
        setSelectedAddFromBaseCandidateId('')
      },
      resetCreateCandidateResumeForm: () => {
        setCreateCandidateResumeForm({
          fullName: '',
          birthDate: '',
          email: '',
          phone: '',
          specialization: '',
          resumeTitle: '',
          resumeRichTextHtml: '',
          resumeSkills: '',
          resumeAttachmentLinks: '',
        })
      },
      ensurePublishedVacancyForPipeline,
      refetchVacancies: async () => {
        await refetch()
      },
      refetchVacancyCandidates: () => {
        void refetchVacancyCandidates()
      },
      refetchVacancyBaseCandidates: () => {
        void refetchVacancyBaseCandidates()
      },
      createCandidateResumeRequest: async (args) => createCandidateResume(args).unwrap(),
      addCandidateFromBaseRequest: async (args) => addCandidateFromBase(args).unwrap(),
      updateVacancyCandidateStageRequest: async (args) => updateVacancyCandidateStage(args).unwrap(),
    })
  const { handleSelectCandidate, handleGetSelectedCandidateContacts, handleGetExecutorCandidateContacts } =
    useVacancyContactsActions({
      canSelectCandidate,
      canReadSelectedContacts,
      canReadExecutorContacts,
      currentVacancyId,
      currentCandidateId,
      setSubmitMessage,
      setSelectedCandidateId,
      clearSelectedCandidateContacts: () => {
        setSelectedCandidateContacts(null)
      },
      setSelectedCandidateContacts,
      setExecutorCandidateContacts,
      refetchVacancies: async () => {
        await refetch()
      },
      refetchVacancyCandidates: () => {
        void refetchVacancyCandidates()
      },
      selectVacancyCandidateRequest: async (args) => selectVacancyCandidate(args).unwrap(),
      fetchSelectedCandidateContactsRequest: async (args) => fetchSelectedCandidateContacts(args).unwrap(),
      fetchExecutorCandidateContactsRequest: async (args) => fetchExecutorCandidateContacts(args).unwrap(),
    })
  const {
    handleCreateFormChange,
    handleCreateOrderSelectChange,
    handleAddFromBaseCandidateSelectChange,
    handleVacancyEditTitleChange,
    handleVacancyEditDescriptionChange,
    handlePipelineStageChange,
    handleCreateCandidateResumeInputChange,
    handleCreateCandidateResumeRichTextChange,
  } = useVacancyFormState({
    setCreateForm,
    setSelectedCreateOrderId,
    setSelectedAddFromBaseCandidateId,
    setVacancyEditTitleInput,
    setIsVacancyEditTitleDirty,
    setVacancyEditDescriptionInput,
    setIsVacancyEditDescriptionDirty,
    setPipelineForm,
    setCreateCandidateResumeForm,
  })

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
                    onClick={() =>
                      handlePreviousVacanciesPage({
                        currentVacanciesLimit,
                        currentVacanciesOffset,
                      })
                    }
                    disabled={isLoading || currentVacanciesOffset <= 0}
                  >
                    Назад
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleNextVacanciesPage({
                        currentVacanciesLimit,
                        currentVacanciesOffset,
                        vacanciesLength: vacancies.length,
                      })
                    }
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
            onSelectVacancy={applyVacancyContext}
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
                      required
                      maxLength={200}
                      disabled={!canCreateVacancy || isCreatingVacancy}
                    />
                    <div className="grid gap-2 md:col-span-3">
                      <Textarea
                        value={createForm.description}
                        onChange={(event) => handleCreateFormChange('description', event)}
                        placeholder="Описание"
                        required
                        maxLength={4000}
                        className="min-h-24"
                        disabled={!canCreateVacancy || isCreatingVacancy}
                      />
                      <div>
                        <Button
                          type="submit"
                          disabled={
                            !canCreateVacancy ||
                            isCreatingVacancy ||
                            !currentCreateOrderId.trim() ||
                            !createForm.title.trim() ||
                            !createForm.description.trim()
                          }
                        >
                          Создать
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : null}

          {activeVacancySection === 'pipeline' ? (
            <VacancyPipelineSurface
              mode="pipeline"
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
              onCreateCandidateResumeRichTextChange={handleCreateCandidateResumeRichTextChange}
              onCreateCandidateResume={handleCreateCandidateResume}
              getRequestErrorMessage={getRequestErrorMessage}
            />
          ) : null}

          {activeVacancySection === 'candidate-create' ? (
            <VacancyPipelineSurface
              mode="candidate-create"
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
              onCreateCandidateResumeRichTextChange={handleCreateCandidateResumeRichTextChange}
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
