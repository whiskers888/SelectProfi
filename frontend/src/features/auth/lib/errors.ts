import type { AuthSession } from '@/app/authSessionSlice'

type ServerProblemError = {
  detail?: string
  title?: string
  code?: string
  errors?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function extractProblem(data: unknown): ServerProblemError | null {
  if (!isRecord(data)) return null
  return data as ServerProblemError
}

export function extractProblemCode(data: unknown): string | null {
  const problem = extractProblem(data)
  return typeof problem?.code === 'string' ? problem.code : null
}

export function extractProblemMessage(data: unknown, fallback: string): string {
  const problem = extractProblem(data)
  if (typeof problem?.detail === 'string' && problem.detail.trim()) return problem.detail
  if (typeof problem?.title === 'string' && problem.title.trim()) return problem.title
  return fallback
}

export function extractVerifiedSession(response: { accessToken: string; refreshToken: string }): AuthSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  }
}
