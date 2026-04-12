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
  createOrderFormValues: OrderCreateFormValues
  filteredOrders: WorkspaceOrder[]
  getRequestErrorMessage: (error: unknown) => string
  manualCandidatesByRole: Record<WorkspaceRole, WorkspaceCandidate[]>
  refetchOrders: () => Promise<unknown>
  role: WorkspaceRole
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
  setIsCreateApplicantResponsePageOpen: (value: boolean) => void
  setIsCreateCandidatePageOpen: (value: boolean) => void
  setIsCreateOrderPageOpen: (value: boolean) => void
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

export function useWorkspaceCreateActions({
  createApplicantResponseFormValues,
  createCandidateFormValues,
  createOrder,
  createOrderFormValues,
  filteredOrders,
  getRequestErrorMessage,
  manualCandidatesByRole,
  refetchOrders,
  role,
  setActiveView,
  setBanner,
  setCreateApplicantResponseFormValues,
  setCreateCandidateFormValues,
  setCreateOrderFormValues,
  setIsCreateApplicantResponsePageOpen,
  setIsCreateCandidatePageOpen,
  setIsCreateOrderPageOpen,
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
  }
}
