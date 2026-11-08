// Browser-only workspace state kept in localStorage (no backend contract yet).

export const sidebarCollapsedStorageKey = 'workspace-sidebar-collapsed-v1'
const vacancyCreateDraftsStorageKey = 'workspace-vacancy-create-drafts-v1'
const applicantRespondedVacanciesStorageKey = 'workspace-applicant-responded-vacancies-v1'

type VacancyCreateDraft = {
  title: string
  description: string
  updatedAtUtc: string
}

function readJsonMap<TValue>(storageKey: string): Record<string, TValue> {
  try {
    const rawValue = window.localStorage.getItem(storageKey)
    if (!rawValue) {
      return {}
    }

    const parsedValue: unknown = JSON.parse(rawValue)
    return typeof parsedValue === 'object' && parsedValue !== null
      ? (parsedValue as Record<string, TValue>)
      : {}
  } catch {
    return {}
  }
}

function writeJsonMap<TValue>(storageKey: string, value: Record<string, TValue>): void {
  window.localStorage.setItem(storageKey, JSON.stringify(value))
}

export function readInitialSidebarCollapsedState(): boolean {
  try {
    return window.localStorage.getItem(sidebarCollapsedStorageKey) === '1'
  } catch {
    return false
  }
}

function makeVacancyCreateDraftKey(userId: string, orderId: string): string {
  return `${userId}:${orderId}`
}

export function readVacancyCreateDraft(userId: string, orderId: string): VacancyCreateDraft | null {
  return readJsonMap<VacancyCreateDraft>(vacancyCreateDraftsStorageKey)[makeVacancyCreateDraftKey(userId, orderId)] ?? null
}

export function saveVacancyCreateDraft(
  userId: string,
  orderId: string,
  formValues: { title: string; description: string },
): void {
  const draftsMap = readJsonMap<VacancyCreateDraft>(vacancyCreateDraftsStorageKey)
  draftsMap[makeVacancyCreateDraftKey(userId, orderId)] = {
    title: formValues.title,
    description: formValues.description,
    updatedAtUtc: new Date().toISOString(),
  }
  writeJsonMap(vacancyCreateDraftsStorageKey, draftsMap)
}

export function clearVacancyCreateDraft(userId: string, orderId: string): void {
  const key = makeVacancyCreateDraftKey(userId, orderId)
  const draftsMap = readJsonMap<VacancyCreateDraft>(vacancyCreateDraftsStorageKey)
  if (!(key in draftsMap)) {
    return
  }

  delete draftsMap[key]
  writeJsonMap(vacancyCreateDraftsStorageKey, draftsMap)
}

export function readApplicantRespondedOrderIds(userId: string): string[] {
  const value = readJsonMap<string[]>(applicantRespondedVacanciesStorageKey)[userId]
  return Array.isArray(value) ? value : []
}

export function saveApplicantRespondedOrderIds(userId: string, orderIds: string[]): void {
  const map = readJsonMap<string[]>(applicantRespondedVacanciesStorageKey)
  map[userId] = orderIds
  writeJsonMap(applicantRespondedVacanciesStorageKey, map)
}
