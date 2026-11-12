export function joinName(firstName: string, lastName: string): string {
  if (!firstName && !lastName) return ''
  return [firstName, lastName].filter(Boolean).join(' ')
}

export function splitName(value: string): { firstName: string; lastName: string } {
  const tokens = value.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return { firstName: '', lastName: '' }
  if (tokens.length === 1) return { firstName: tokens[0], lastName: '' }
  return { firstName: tokens[0], lastName: tokens.slice(1).join(' ') }
}
