import { type FormEvent, useCallback } from 'react'
import type { WorkspaceCandidate, WorkspaceOrder, WorkspaceRole, WorkspaceView } from '../../model/data'

type BannerVariant = 'default' | 'success' | 'destructive'

type OrderCreateFormValues = {
  title: string
  organization: string
  note: string
  requestedCandidatesCount: string
}

type CandidateCreateFormValues = {
  fullName: string
  birthDate: string
  email: string
  phone: string
  specialization: string
  resumeTitle: string
  resumeRichTextHtml: string
  resumeAttachmentLinks: string
}

type ApplicantResumeFormValues = CandidateCreateFormValues
type VacancyCreateFormValues = {
  title: string
  description: string
}
type VacancyStatusContract = 'Draft' | 'OnApproval' | 'Published'
type ExistingVacancySummary = {
  id: string
  status: VacancyStatusContract
}

type UnwrappableMutationResult<TResult> = {
  unwrap: () => Promise<TResult>
}

type MutationTrigger<TArgs, TResult> = (args: TArgs) => UnwrappableMutationResult<TResult>

type WorkspaceCreateActionsDependencies = {
  createApplicantResponseFormValues: ApplicantResumeFormValues
  createCandidateFormValues: CandidateCreateFormValues
  createOrder: MutationTrigger<
    {
      description: string
      title: string
      requestedCandidatesCount: number
    },
    { id: string }
  >
  createVacancy: MutationTrigger<
    {
      orderId: string
      title: string
      description: string
    },
    { id: string; status: VacancyStatusContract }
  >
  updateVacancy: MutationTrigger<
    {
      vacancyId: string
      body: {
        title: string
        description: string
      }
    },
    { id: string; status: VacancyStatusContract }
  >
  updateVacancyStatus: MutationTrigger<
    {
      vacancyId: string
      body: { status: 'OnApproval' }
    },
    unknown
  >
  createOrderFormValues: OrderCreateFormValues
  createVacancyFormValues: VacancyCreateFormValues
  createVacancyOrderId: string | null
  getExistingVacancyByOrderId: (orderId: string) => ExistingVacancySummary | null
  filteredOrders: WorkspaceOrder[]
  getRequestErrorMessage: (error: unknown) => string
  manualCandidatesByRole: Record<WorkspaceRole, WorkspaceCandidate[]>
  refetchOrders: () => Promise<unknown>
  refetchVacancies: () => Promise<unknown>
  role: WorkspaceRole
  clearCreateVacancyDraft: (orderId: string) => void
  setActiveView: (view: WorkspaceView) => void
  setBanner: (banner: { message: string; variant: BannerVariant }) => void
  setCreateApplicantResponseFormValues: (
    value:
      | ApplicantResumeFormValues
      | ((previousValues: ApplicantResumeFormValues) => ApplicantResumeFormValues),
  ) => void
  setCreateCandidateFormValues: (
    value: CandidateCreateFormValues | ((previousValues: CandidateCreateFormValues) => CandidateCreateFormValues),
  ) => void
  setCreateOrderFormValues: (
    value: OrderCreateFormValues | ((previousValues: OrderCreateFormValues) => OrderCreateFormValues),
  ) => void
  setCreateVacancyFormValues: (
    value: VacancyCreateFormValues | ((previousValues: VacancyCreateFormValues) => VacancyCreateFormValues),
  ) => void
  setIsCreateApplicantResponsePageOpen: (value: boolean) => void
  setIsCreateCandidatePageOpen: (value: boolean) => void
  setIsCreateOrderPageOpen: (value: boolean) => void
  setIsCreateVacancyPageOpen: (value: boolean) => void
  setManualCandidatesByRole: (
    value:
      | Record<WorkspaceRole, WorkspaceCandidate[]>
      | ((
          previousCandidatesByRole: Record<WorkspaceRole, WorkspaceCandidate[]>,
        ) => Record<WorkspaceRole, WorkspaceCandidate[]>),
  ) => void
  setPreferredOrderId: (value: string | null) => void
}

function getPreferredOrderId(orders: WorkspaceOrder[]): string {
  return orders.find((order) => !order.isArchived)?.id ?? orders[0]?.id ?? 'local-order'
}

function toNormalizedCandidateKey(fullName: string, specialization: string): string {
  return `${fullName}-${specialization}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё-]/g, '')
}

function toResumeSummary(resumeRichTextHtml: string): string {
  return resumeRichTextHtml.replace(/<[^>]*>/g, ' ').trim()
}

function hasVisibleRichText(value: string): boolean {
  return value.replace(/<[^>]*>/g, ' ').trim().length > 0
}

export function useWorkspaceCreateActions({
  createApplicantResponseFormValues,
  createCandidateFormValues,
  createOrder,
  createVacancy,
  updateVacancy,
  updateVacancyStatus,
  createOrderFormValues,
  createVacancyFormValues,
  createVacancyOrderId,
  getExistingVacancyByOrderId,
  filteredOrders,
  getRequestErrorMessage,
  manualCandidatesByRole,
  refetchOrders,
  refetchVacancies,
  role,
  clearCreateVacancyDraft,
  setActiveView,
  setBanner,
  setCreateApplicantResponseFormValues,
  setCreateCandidateFormValues,
  setCreateOrderFormValues,
  setCreateVacancyFormValues,
  setIsCreateApplicantResponsePageOpen,
  setIsCreateCandidatePageOpen,
  setIsCreateOrderPageOpen,
  setIsCreateVacancyPageOpen,
  setManualCandidatesByRole,
  setPreferredOrderId,
}: WorkspaceCreateActionsDependencies) {
  const handleCreateOrderFormFieldChange = useCallback(
    (field: 'title' | 'organization' | 'note' | 'requestedCandidatesCount', value: string) => {
      setCreateOrderFormValues((previousValues) => ({
        ...previousValues,
        [field]: value,
      }))
    },
    [setCreateOrderFormValues],
  )

  const handleCreateOrderFromPage = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const title = createOrderFormValues.title.trim()
      const organization = createOrderFormValues.organization.trim()
      const note = createOrderFormValues.note.trim()
      const requestedCandidatesCount = Number.parseInt(createOrderFormValues.requestedCandidatesCount.trim(), 10)

      if (!title || !organization) {
        setBanner({
          variant: 'destructive',
          message: 'Заполните обязательные поля формы.',
        })
        return
      }
      // @dvnull: Ранее workspace create-order отправлял только title/description; добавлен requestedCandidatesCount с минимальным client guard (>=3) под backend-контракт.
      if (!Number.isFinite(requestedCandidatesCount) || requestedCandidatesCount < 3) {
        setBanner({
          variant: 'destructive',
          message: 'Укажите количество кандидатов не меньше 3.',
        })
        return
      }

      const description = note ? `${organization}. ${note}` : organization

      try {
        const createdOrder = await createOrder({
          title,
          description,
          requestedCandidatesCount,
        }).unwrap()
        setPreferredOrderId(createdOrder.id)
        setCreateOrderFormValues({
          title: '',
          organization: '',
          note: '',
          requestedCandidatesCount: '3',
        })
        await refetchOrders()
        setIsCreateOrderPageOpen(false)
        setActiveView('dashboard')
        setBanner({
          variant: 'success',
          message: 'Заказ создан и сохранен в системе.',
        })
      } catch (error) {
        setBanner({
          variant: 'destructive',
          message: getRequestErrorMessage(error),
        })
      }
    },
    [
      createOrder,
      createOrderFormValues.note,
      createOrderFormValues.organization,
      createOrderFormValues.requestedCandidatesCount,
      createOrderFormValues.title,
      getRequestErrorMessage,
      refetchOrders,
      setActiveView,
      setBanner,
      setCreateOrderFormValues,
      setIsCreateOrderPageOpen,
      setPreferredOrderId,
    ],
  )

  const handleCreateVacancyFormFieldChange = useCallback(
    (field: 'title' | 'description', value: string) => {
      setCreateVacancyFormValues((previousValues) => ({
        ...previousValues,
        [field]: value,
      }))
    },
    [setCreateVacancyFormValues],
  )

  const upsertVacancyForOrder = useCallback(
    async (orderId: string, title: string, description: string): Promise<{ id: string; status: VacancyStatusContract }> => {
      const existingVacancy = getExistingVacancyByOrderId(orderId)
      if (existingVacancy) {
        const updatedVacancy = await updateVacancy({
          vacancyId: existingVacancy.id,
          body: { title, description },
        }).unwrap()

        return {
          id: updatedVacancy.id,
          status: updatedVacancy.status,
        }
      }

      const createdVacancy = await createVacancy({ orderId, title, description }).unwrap()
      return {
        id: createdVacancy.id,
        status: createdVacancy.status,
      }
    },
    [createVacancy, getExistingVacancyByOrderId, updateVacancy],
  )

  const handleCreateVacancyFromPage = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const orderId = createVacancyOrderId?.trim() ?? ''
      const title = createVacancyFormValues.title.trim()
      const description = createVacancyFormValues.description.trim()
      const hasVisibleDescription = hasVisibleRichText(description)

      if (!orderId || !title || !hasVisibleDescription) {
        setBanner({
          variant: 'destructive',
          message: 'Заполните название и содержимое описания вакансии.',
        })
        return
      }

      try {
        // @dvnull: Ранее при повторном сохранении для уже созданной вакансии выполнялся create и возникал 409 из-за дубликата orderId.
        await upsertVacancyForOrder(orderId, title, description)
        clearCreateVacancyDraft(orderId)
        setCreateVacancyFormValues({
          title: '',
          description: '',
        })
        setIsCreateVacancyPageOpen(false)
        await Promise.all([refetchOrders(), refetchVacancies()])
        setActiveView('dashboard')
        setBanner({
          variant: 'success',
          message: 'Вакансия создана в статусе Draft.',
        })
      } catch (error) {
        setBanner({
          variant: 'destructive',
          message: getRequestErrorMessage(error),
        })
      }
    },
    [
      createVacancyFormValues.description,
      createVacancyFormValues.title,
      createVacancyOrderId,
      clearCreateVacancyDraft,
      getRequestErrorMessage,
      refetchOrders,
      refetchVacancies,
      setActiveView,
      setBanner,
      setCreateVacancyFormValues,
      setIsCreateVacancyPageOpen,
      upsertVacancyForOrder,
    ],
  )

  const handleCreateVacancyAndSendToCustomerFromPage = useCallback(async () => {
    const orderId = createVacancyOrderId?.trim() ?? ''
    const title = createVacancyFormValues.title.trim()
    const description = createVacancyFormValues.description.trim()
    const hasVisibleDescription = hasVisibleRichText(description)

    if (!orderId || !title || !hasVisibleDescription) {
      setBanner({
        variant: 'destructive',
        message: 'Заполните название и содержимое описания вакансии.',
      })
      return
    }

    try {
      const vacancy = await upsertVacancyForOrder(orderId, title, description)
      if (vacancy.status === 'OnApproval') {
        clearCreateVacancyDraft(orderId)
        setCreateVacancyFormValues({
          title: '',
          description: '',
        })
        setIsCreateVacancyPageOpen(false)
        await Promise.all([refetchOrders(), refetchVacancies()])
        setActiveView('dashboard')
        setBanner({
          variant: 'success',
          message: 'Вакансия уже находится на согласовании у заказчика.',
        })
        return
      }

      if (vacancy.status === 'Published') {
        clearCreateVacancyDraft(orderId)
        setCreateVacancyFormValues({
          title: '',
          description: '',
        })
        setIsCreateVacancyPageOpen(false)
        await Promise.all([refetchOrders(), refetchVacancies()])
        setActiveView('dashboard')
        setBanner({
          variant: 'success',
          message: 'Вакансия уже опубликована.',
        })
        return
      }

      try {
        await updateVacancyStatus({
          vacancyId: vacancy.id,
          body: { status: 'OnApproval' },
        }).unwrap()
      } catch (statusError) {
        clearCreateVacancyDraft(orderId)
        setCreateVacancyFormValues({
          title: '',
          description: '',
        })
        setIsCreateVacancyPageOpen(false)
        await Promise.all([refetchOrders(), refetchVacancies()])
        setActiveView('dashboard')
        setBanner({
          variant: 'destructive',
          message: `Вакансия создана как Draft, но не отправлена заказчику. ${getRequestErrorMessage(statusError)}`,
        })
        return
      }

      clearCreateVacancyDraft(orderId)
      setCreateVacancyFormValues({
        title: '',
        description: '',
      })
      setIsCreateVacancyPageOpen(false)
      await Promise.all([refetchOrders(), refetchVacancies()])
      setActiveView('dashboard')
      setBanner({
        variant: 'success',
        message: 'Вакансия отправлена заказчику на согласование.',
      })
    } catch (error) {
      setBanner({
        variant: 'destructive',
        message: getRequestErrorMessage(error),
      })
    }
  }, [
    clearCreateVacancyDraft,
    createVacancyFormValues.description,
    createVacancyFormValues.title,
    createVacancyOrderId,
    getRequestErrorMessage,
    refetchOrders,
    refetchVacancies,
    setActiveView,
    setBanner,
    setCreateVacancyFormValues,
    setIsCreateVacancyPageOpen,
    upsertVacancyForOrder,
    updateVacancyStatus,
  ])

  const handleCreateCandidateFormFieldChange = useCallback(
    (
      field:
        | 'fullName'
        | 'birthDate'
        | 'email'
        | 'phone'
        | 'specialization'
        | 'resumeTitle'
        | 'resumeRichTextHtml'
        | 'resumeAttachmentLinks',
      value: string,
    ) => {
      setCreateCandidateFormValues((previousValues) => ({
        ...previousValues,
        [field]: value,
      }))
    },
    [setCreateCandidateFormValues],
  )

  const handleCreateCandidateFromPage = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const fullName = createCandidateFormValues.fullName.trim()
      const specialization = createCandidateFormValues.specialization.trim()
      const resumeTitle = createCandidateFormValues.resumeTitle.trim()
      const resumeSummary = toResumeSummary(createCandidateFormValues.resumeRichTextHtml)

      if (!fullName || !specialization || !resumeTitle || !resumeSummary) {
        setBanner({
          variant: 'destructive',
          message: 'Заполните ФИО, специализацию, заголовок и содержимое резюме.',
        })
        return
      }

      const normalizedCandidateKey = toNormalizedCandidateKey(fullName, specialization)
      const nextCandidateIndex = manualCandidatesByRole[role].length + 1

      const nextCandidate: WorkspaceCandidate = {
        id: `cand-local-${normalizedCandidateKey || 'candidate'}-${nextCandidateIndex}`,
        name: fullName,
        position: specialization,
        source: 'Добавлен вручную',
        rating: '4.6',
        orderId: getPreferredOrderId(filteredOrders),
        statusLabel: 'Новый',
        statusTone: 'warning',
        comment: resumeSummary || 'Новый профиль добавлен исполнителем.',
      }

      setManualCandidatesByRole((previousCandidatesByRole) => ({
        ...previousCandidatesByRole,
        [role]: [nextCandidate, ...previousCandidatesByRole[role]],
      }))
      setCreateCandidateFormValues({
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
        specialization: '',
        resumeTitle: '',
        resumeRichTextHtml: '',
        resumeAttachmentLinks: '',
      })
      setIsCreateCandidatePageOpen(false)
      setActiveView('candidates')
      setBanner({
        variant: 'success',
        message: 'Кандидат добавлен в рабочий список.',
      })
    },
    [
      createCandidateFormValues.fullName,
      createCandidateFormValues.resumeRichTextHtml,
      createCandidateFormValues.resumeTitle,
      createCandidateFormValues.specialization,
      filteredOrders,
      manualCandidatesByRole,
      role,
      setActiveView,
      setBanner,
      setCreateCandidateFormValues,
      setIsCreateCandidatePageOpen,
      setManualCandidatesByRole,
    ],
  )

  const handleCreateApplicantResponseFormFieldChange = useCallback(
    (
      field:
        | 'fullName'
        | 'birthDate'
        | 'email'
        | 'phone'
        | 'specialization'
        | 'resumeTitle'
        | 'resumeRichTextHtml'
        | 'resumeAttachmentLinks',
      value: string,
    ) => {
      setCreateApplicantResponseFormValues((previousValues) => ({
        ...previousValues,
        [field]: value,
      }))
    },
    [setCreateApplicantResponseFormValues],
  )

  const handleCreateApplicantResponseFromPage = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const fullName = createApplicantResponseFormValues.fullName.trim()
      const specialization = createApplicantResponseFormValues.specialization.trim()
      const resumeTitle = createApplicantResponseFormValues.resumeTitle.trim()
      const resumeSummary = toResumeSummary(createApplicantResponseFormValues.resumeRichTextHtml)

      if (!fullName || !specialization || !resumeTitle || !resumeSummary) {
        setBanner({
          variant: 'destructive',
          message: 'Заполните ФИО, специализацию, заголовок и содержимое резюме.',
        })
        return
      }

      const normalizedCandidateKey = toNormalizedCandidateKey(fullName, specialization)
      const nextCandidateIndex = manualCandidatesByRole[role].length + 1

      const nextCandidate: WorkspaceCandidate = {
        id: `cand-applicant-local-${normalizedCandidateKey || 'resume'}-${nextCandidateIndex}`,
        name: fullName,
        position: specialization,
        source: 'Личное резюме',
        rating: '—',
        orderId: getPreferredOrderId(filteredOrders),
        statusLabel: 'Резюме добавлено',
        statusTone: 'default',
        comment: resumeSummary,
      }

      setManualCandidatesByRole((previousCandidatesByRole) => ({
        ...previousCandidatesByRole,
        [role]: [nextCandidate, ...previousCandidatesByRole[role]],
      }))
      setCreateApplicantResponseFormValues({
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
        specialization: '',
        resumeTitle: '',
        resumeRichTextHtml: '',
        resumeAttachmentLinks: '',
      })
      setIsCreateApplicantResponsePageOpen(false)
      setActiveView('candidates')
      setBanner({
        variant: 'success',
        message: 'Резюме добавлено в раздел "Мои резюме".',
      })
    },
    [
      createApplicantResponseFormValues.fullName,
      createApplicantResponseFormValues.resumeRichTextHtml,
      createApplicantResponseFormValues.resumeTitle,
      createApplicantResponseFormValues.specialization,
      filteredOrders,
      manualCandidatesByRole,
      role,
      setActiveView,
      setBanner,
      setCreateApplicantResponseFormValues,
      setIsCreateApplicantResponsePageOpen,
      setManualCandidatesByRole,
    ],
  )

  return {
    handleCreateApplicantResponseFormFieldChange,
    handleCreateApplicantResponseFromPage,
    handleCreateCandidateFormFieldChange,
    handleCreateCandidateFromPage,
    handleCreateOrderFormFieldChange,
    handleCreateOrderFromPage,
    handleCreateVacancyAndSendToCustomerFromPage,
    handleCreateVacancyFormFieldChange,
    handleCreateVacancyFromPage,
  }
}
