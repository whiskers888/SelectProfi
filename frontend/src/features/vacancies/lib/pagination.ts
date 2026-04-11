export function parseNonNegativeInteger(rawValue: string): number | null {
  const trimmedValue = rawValue.trim()
  if (!/^\d+$/.test(trimmedValue)) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  if (!Number.isSafeInteger(parsedValue)) {
    return null
  }

  // @dvnull: Ранее parser пагинации был локальным в VacanciesPage; вынесен в feature/lib без изменения контракта.
  return parsedValue
}
