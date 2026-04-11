export function toTextOrDash(value: string | null | undefined): string {
  const normalized = value?.trim()
  return normalized ? normalized : '—'
}

export function toListOrDash(values: string[] | null | undefined): string {
  if (!values || values.length === 0) {
    return '—'
  }

  return values.join(', ')
}

export function toCommaSeparated(values: string[] | null | undefined): string {
  if (!values || values.length === 0) {
    return ''
  }

  return values.join(', ')
}

export function fromCommaSeparated(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  return items.length > 0 ? items : undefined
}

export function normalizeOptional(value: string): string | undefined {
  const normalized = value.trim()
  return normalized ? normalized : undefined
}

export function toDateTimeOrDash(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString('ru-RU')
}
