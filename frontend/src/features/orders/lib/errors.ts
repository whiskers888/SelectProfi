import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

type ProblemDetailsPayload = {
  code?: string
  detail?: string
  title?: string
}

function isProblemDetailsPayload(value: unknown): value is ProblemDetailsPayload {
  return typeof value === 'object' && value !== null
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function getRequestErrorMessage(error: unknown): string {
  // @dvnull: Ранее parser ошибок был локально в OrdersPage; вынесен в lib без изменения mapping-кодов и текстов.
  if (!isFetchBaseQueryError(error)) {
    return 'Не удалось выполнить запрос.'
  }

  if (error.status === 'FETCH_ERROR') {
    return 'Не удалось установить соединение с сервером.'
  }

  if (error.status === 401) {
    return 'Требуется авторизация.'
  }

  if (typeof error.status === 'number' && isProblemDetailsPayload(error.data)) {
    switch (error.data.code) {
      case 'customer_not_found':
        return 'Профиль заказчика не найден.'
      case 'order_not_found':
        return 'Заказ не найден.'
      case 'executor_not_found':
        return 'Указанный рекрутер не найден.'
      case 'order_access_forbidden':
        return 'У вас нет доступа к этому заказу.'
      case 'order_list_access_forbidden':
        return 'У вас нет доступа к списку заказов.'
      case 'order_executors_access_forbidden':
        return 'У вас нет доступа к списку исполнителей.'
      case 'order_has_active_vacancy':
        return 'Нельзя удалить заказ, у которого есть активная вакансия.'
      case 'order_conflict':
        return 'Не удалось выполнить операцию с заказом из-за конфликта данных.'
      default:
        return error.data.detail ?? error.data.title ?? 'Не удалось выполнить запрос.'
    }
  }

  return 'Не удалось выполнить запрос.'
}
