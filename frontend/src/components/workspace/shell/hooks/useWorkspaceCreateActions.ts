import { type FormEvent, useCallback } from 'react'
import type { WorkspaceCandidate, WorkspaceOrder, WorkspaceRole, WorkspaceView } from '../../model/data'
import { buildResumeAttachmentsJson, buildResumeContentJson } from '@/features/vacancies/lib/resume'

type BannerVariant = 'default' | 'success' | 'destructive'

type OrderCreateFormValues = {
  title: string
  organization: string
  specialization: string
  specializationId: string
  price: string
  note: string
  requestedCandidatesCount: string
}

type CandidateCreateFormValues = {
  fullName: string
  birthDate: string
  email: string
  phone: string
  specialization: string
  specializationId: string
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
      specialization?: string
      specializationId?: string
      price?: number
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
  createCandidateResume: MutationTrigger<
    {
      vacancyId: string
      body: {
        fullName: string
        birthDate?: string
        email?: string
        phone: string
        specializationId: string
        resumeTitle: string
        resumeContentJson: string
        resumeAttachmentsJson?: string
      }
    },
    { candidateId: string; candidateResumeId: string }
  >
  createMyCandidateResume: MutationTrigger<
    {
      fullName: string
      birthDate?: string
      email?: string
      phone: string
      specializationId: string
      resumeTitle: string
      resumeContentJson: string
      resumeAttachmentsJson?: string
    },
    { candidateId: string; candidateResumeId: string }
  >
  uploadCandidateResumeAttachment: MutationTrigger<
    { vacancyId: string; resumeId: string; file: File },
    { attachmentId: string }
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
  candidateSourceVacancyId: string | null
  candidateSourceOrderId: string | null
  getExistingVacancyByOrderId: (orderId: string) => ExistingVacancySummary | null
  orderSpecializationOptions: { id: string; name: string }[]
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
  openOrderDetails: (orderId: string) => void
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
  createCandidateResume,
  createMyCandidateResume,
  uploadCandidateResumeAttachment,
  updateVacancy,
  updateVacancyStatus,
  createOrderFormValues,
  createVacancyFormValues,
  createVacancyOrderId,
  candidateSourceVacancyId,
  candidateSourceOrderId,
  getExistingVacancyByOrderId,
  orderSpecializationOptions,
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
  openOrderDetails,
}: WorkspaceCreateActionsDependencies) {
  const handleCreateOrderFormFieldChange = useCallback(
    (
      field: 'title' | 'organization' | 'specialization' | 'specializationId' | 'price' | 'note' | 'requestedCandidatesCount',
      value: string,
    ) => {
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
      const specializationId = createOrderFormValues.specializationId.trim()
      const selectedSpecialization = orderSpecializationOptions.find((item) => item.id === specializationId)
      // @dvnull: Ранее специализация всегда отправлялась как свободный текст; добавлен приоритет справочника specializationId с fallback на ручной ввод.
      const specialization = (selectedSpecialization?.name ?? createOrderFormValues.specialization).trim()
      const price = Number.parseFloat(createOrderFormValues.price.trim())
      const note = createOrderFormValues.note.trim()
      const requestedCandidatesCount = Number.parseInt(createOrderFormValues.requestedCandidatesCount.trim(), 10)

      // @dvnull: Ранее форма заказа требовала только title/company; добавлены обязательные specialization и price для явной структуры нового заказа.
      if (!title || !organization || !specialization) {
        setBanner({
          variant: 'destructive',
          message: 'Заполните обязательные поля формы.',
        })
        return
      }
      if (!Number.isFinite(price) || price <= 0) {
        setBanner({
          variant: 'destructive',
          message: 'Укажите корректную цену заказа больше 0.',
        })
        return
      }
      // @dvnull: Ранее workspace create-order проверял минимум requestedCandidatesCount >=3; обновлено до >=1 под актуальный backend-контракт.
      if (!Number.isFinite(requestedCandidatesCount) || requestedCandidatesCount < 1) {
        setBanner({
          variant: 'destructive',
          message: 'Укажите количество кандидатов не меньше 1.',
        })
        return
      }

      // @dvnull: Ранее description собирался как "organization + note"; добавлены specialization/price в формируемый backend-compatible description без изменения API-контракта.
      const descriptionParts = [
        `Компания: ${organization}`,
        `Специализация: ${specialization}`,
        `Цена заказа: ${price.toLocaleString('ru-RU')} ₽`,
      ]
      if (note) {
        descriptionParts.push(`Комментарий: ${note}`)
      }
      const description = descriptionParts.join('\n')

      try {
        const createdOrder = await createOrder({
          title,
          description,
          // @dvnull: Ранее create-order не отправлял specializationId; добавлен проброс выбранного элемента справочника.
          specialization,
          specializationId: selectedSpecialization?.id,
          price,
          requestedCandidatesCount,
        }).unwrap()
        setPreferredOrderId(createdOrder.id)
        setCreateOrderFormValues({
          title: '',
          organization: '',
          specialization: '',
          specializationId: '',
          price: '',
          note: '',
          requestedCandidatesCount: '1',
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
      createOrderFormValues.price,
      createOrderFormValues.requestedCandidatesCount,
      createOrderFormValues.specialization,
      createOrderFormValues.specializationId,
      createOrderFormValues.title,
      getRequestErrorMessage,
      orderSpecializationOptions,
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
        | 'specializationId'
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
    async (event: FormEvent<HTMLFormElement>, files: File[] = []) => {
      event.preventDefault()

      const fullName = createCandidateFormValues.fullName.trim()
      const specializationId = createCandidateFormValues.specializationId.trim()
      const phone = createCandidateFormValues.phone.trim()
      const resumeTitle = createCandidateFormValues.resumeTitle.trim()
      const resumeSummary = toResumeSummary(createCandidateFormValues.resumeRichTextHtml)

      if (!fullName || !phone || !specializationId || !resumeTitle || !resumeSummary) {
        setBanner({
          variant: 'destructive',
          message: 'Заполните ФИО, специализацию, заголовок и содержимое резюме.',
        })
        return
      }

      try {
        const body = {
            fullName,
            birthDate: createCandidateFormValues.birthDate.trim() || undefined,
            email: createCandidateFormValues.email.trim() || undefined,
            phone,
            specializationId,
            resumeTitle,
            resumeContentJson: buildResumeContentJson({ resumeSkills: '', resumeRichTextHtml: createCandidateFormValues.resumeRichTextHtml }),
            resumeAttachmentsJson: buildResumeAttachmentsJson({ resumeAttachmentLinks: createCandidateFormValues.resumeAttachmentLinks }),
          }
        const created = candidateSourceVacancyId
          ? await createCandidateResume({ vacancyId: candidateSourceVacancyId, body }).unwrap()
          : await createMyCandidateResume(body).unwrap()
        if (candidateSourceVacancyId) {
          await Promise.all(files.map((file) => uploadCandidateResumeAttachment({ vacancyId: candidateSourceVacancyId, resumeId: created.candidateResumeId, file }).unwrap()))
          await refetchVacancies()
        } else {
          setManualCandidatesByRole((previous) => ({
            ...previous,
            [role]: [{
              id: created.candidateId,
              name: fullName,
              position: createCandidateFormValues.specialization,
              orderId: '',
              source: 'Добавлен вручную',
              sourceType: 'AddedByExecutor',
              isOwnedByRequester: true,
              rating: '—',
              statusLabel: 'Новый',
              statusTone: 'default',
              comment: resumeTitle,
            }, ...previous[role]],
          }))
        }
      } catch (error) {
        setBanner({ variant: 'destructive', message: getRequestErrorMessage(error) })
        return
      }

      setCreateCandidateFormValues({
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
        specialization: '',
        specializationId: '',
        resumeTitle: '',
        resumeRichTextHtml: '',
        resumeAttachmentLinks: '',
      })
      setIsCreateCandidatePageOpen(false)
      if (candidateSourceOrderId) {
        openOrderDetails(candidateSourceOrderId)
      } else {
        setActiveView('candidates')
      }
      setBanner({
        variant: 'success',
        message: 'Кандидат добавлен в рабочий список.',
      })
    },
    [
      createCandidateFormValues.fullName,
      createCandidateFormValues.birthDate,
      createCandidateFormValues.email,
      createCandidateFormValues.phone,
      createCandidateFormValues.resumeRichTextHtml,
      createCandidateFormValues.resumeTitle,
      createCandidateFormValues.specializationId,
      createCandidateFormValues.resumeAttachmentLinks,
      candidateSourceVacancyId,
      candidateSourceOrderId,
      createCandidateResume,
      createMyCandidateResume,
      uploadCandidateResumeAttachment,
      refetchVacancies,
      getRequestErrorMessage,
      setActiveView,
      setBanner,
      setCreateCandidateFormValues,
      setIsCreateCandidatePageOpen,
      openOrderDetails,
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
        specializationId: '',
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
