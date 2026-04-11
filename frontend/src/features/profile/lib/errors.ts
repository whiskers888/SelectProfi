import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

type ProblemDetailsPayload = {
  detail?: string
  title?: string
}

function isProblemDetailsPayload(payload: unknown): payload is ProblemDetailsPayload {
  return typeof payload === 'object' && payload !== null
}

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function getRequestErrorMessage(error: unknown): string {
  if (!isFetchBaseQueryError(error)) {
    return 'Не удалось выполнить запрос.'
  }

  if (error.status === 'FETCH_ERROR') {
    return 'Не удалось установить соединение с сервером.'
  }

  if (error.status === 401) {
    return 'Требуется авторизация для выполнения действия.'
  }

  if (typeof error.status === 'number' && isProblemDetailsPayload(error.data)) {
    return error.data.detail ?? error.data.title ?? 'Не удалось выполнить запрос.'
  }

  return 'Не удалось выполнить запрос.'
}
