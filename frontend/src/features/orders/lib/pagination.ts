export function parseNonNegativeInteger(rawValue: string): number | null {
  // @dvnull: Ранее parser пагинации был локально в OrdersPage; вынесен в lib без изменения валидации.
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
