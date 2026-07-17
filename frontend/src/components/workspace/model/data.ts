// @dvnull: Удалены моковые данные (customerData, executorData, applicantData и workspaceDataByRole).
// Теперь файл содержит только типы, константы для ролей/вьюх и вспомогательные функции.
// Компоненты должны получать данные с бэкенда, а не из этого файла.

export type WorkspaceRole = 'Customer' | 'Executor' | 'Applicant'

export type WorkspaceView = 'dashboard' | 'orders' | 'candidates' | 'meetings' | 'chats' | 'analytics' | 'documents' 

export type WorkspaceTone = 'default' | 'success' | 'warning' | 'danger' | 'neutral'

export type WorkspaceStat = {
  id: string
  label: string
  value: string
  note: string
  tone?: WorkspaceTone
}

export type WorkspaceOrder = {
  id: string
  customerId?: string
  executorId?: string | null
  price?: number | null
  title: string
  company: string
  location: string
  priority: 'high' | 'medium' | 'low'
  responses: number
  statusLabel: string
  statusTone: WorkspaceTone
  updatedAt: string
  isArchived?: boolean
  isPaused?: boolean
}

export type WorkspaceCandidate = {
  id: string
  name: string
  position: string
  orderId: string
  source: string
  sourceType?: 'AddedByExecutor' | 'RegisteredUser'
  isOwnedByRequester?: boolean
  isAnonymized?: boolean
  rating: string
  statusLabel: string
  statusTone: WorkspaceTone
  comment: string
}

export type WorkspaceMeeting = {
  id: string
  title: string
  owner: string
  slot: string
  statusLabel: string
  statusTone: WorkspaceTone
  linkLabel: string
}

export type WorkspaceActivity = {
  id: string
  title: string
  description: string
  time: string
  tone: WorkspaceTone
}

export type WorkspacePipelineStage = {
  id: string
  label: string
  count: number
  delta: string
  tone: WorkspaceTone
}

export type WorkspaceChatMessage = {
  id: string
  author: 'me' | 'other'
  text: string
  time: string
}

export type WorkspaceChatThread = {
  id: string
  participant: string
  preview: string
  unread: number
  messages: WorkspaceChatMessage[]
}

export type WorkspaceDataset = {
  headerSubtitle: string
  stats: WorkspaceStat[]
  orders: WorkspaceOrder[]
  candidates: WorkspaceCandidate[]
  meetings: WorkspaceMeeting[]
  activity: WorkspaceActivity[]
  pipeline: WorkspacePipelineStage[]
  chats: WorkspaceChatThread[]
  analyticsError?: string
}

export const workspaceRoleOptions: Array<{
  description: string
  label: string
  value: WorkspaceRole
}> = [
  {
    value: 'Customer',
    label: 'Заказчик',
    description: 'Создает вакансии, управляет воронкой и принимает решение по кандидатам.',
  },
  {
    value: 'Executor',
    label: 'Исполнитель',
    description: 'Ведет подбор кандидатов, обновляет short-list и координирует интервью.',
  },
  {
    value: 'Applicant',
    label: 'Соискатель',
    description: 'Следит за статусом откликов и коммуникацией по выбранным вакансиям.',
  },
]

export const workspaceViewOptions: Array<{
  label: string
  value: WorkspaceView
}> = [
  { value: 'dashboard', label: 'Мои заказы' },
  { value: 'orders', label: 'Заказы' },
  { value: 'candidates', label: 'Кандидаты' },
  { value: 'meetings', label: 'Встречи' },
  { value: 'chats', label: 'Чаты' },
  { value: 'analytics', label: 'Аналитика' },
  { value: 'documents', label: 'Документооборот' },
]

const previewRoleSet = new Set<WorkspaceRole>(workspaceRoleOptions.map((option) => option.value))

export function isWorkspaceRole(value: string | null | undefined): value is WorkspaceRole {
  if (!value) return false
  return previewRoleSet.has(value as WorkspaceRole)
}

export function workspaceToneToBadgeVariant(
  tone: WorkspaceTone,
): 'default' | 'success' | 'destructive' | 'neutral' {
  if (tone === 'success') return 'success'
  if (tone === 'danger') return 'destructive'
  if (tone === 'neutral') return 'neutral'
  return 'default'
}