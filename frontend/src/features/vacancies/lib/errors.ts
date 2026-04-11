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
      case 'order_not_found':
        return 'Заказ для вакансии не найден.'
      case 'vacancy_create_forbidden':
        return 'У вас нет прав создавать вакансию для этого заказа.'
      case 'vacancy_access_forbidden':
        return 'У вас нет доступа к этой вакансии.'
      case 'vacancy_status_forbidden':
        return 'У вас нет прав менять статус этой вакансии.'
      case 'vacancy_conflict':
        return 'Не удалось сохранить вакансию из-за конфликта данных.'
      case 'vacancy_status_transition_invalid':
        return 'Недопустимый переход статуса вакансии.'
      case 'vacancy_status_conflict':
        return 'Конфликт при обновлении статуса вакансии.'
      case 'vacancy_not_published':
        return 'Операция доступна только для опубликованной вакансии.'
      case 'vacancy_candidates_forbidden':
        return 'У вас нет доступа к списку кандидатов этой вакансии.'
      case 'vacancy_base_candidates_forbidden':
        return 'У вас нет доступа к списку кандидатов из системной базы для этой вакансии.'
      case 'candidate_resume_create_forbidden':
        return 'У вас нет прав на ручное добавление кандидата в эту вакансию.'
      case 'candidate_resume_invalid_input':
        return 'Проверьте поля формы кандидата и резюме.'
      case 'candidate_already_exists':
        return 'Кандидат с такими идентификаторами уже существует.'
      case 'candidate_resume_conflict':
        return 'Не удалось добавить кандидата из-за конфликта данных.'
      case 'candidate_not_found':
        return 'Кандидат не найден в системной базе.'
      case 'candidate_link_forbidden':
      case 'candidate_stage_forbidden':
        return 'У вас нет доступа к операциям pipeline для этой вакансии.'
      case 'candidate_link_conflict':
        return 'Кандидат уже добавлен в pipeline этой вакансии.'
      case 'vacancy_candidate_not_found':
        return 'Кандидат не найден в pipeline этой вакансии.'
      case 'vacancy_candidate_stage_invalid':
        return 'Некорректная стадия кандидата.'
      case 'vacancy_candidate_stage_conflict':
        return 'Не удалось изменить стадию кандидата из-за ограничения процесса.'
      case 'candidate_select_forbidden':
        return 'У вас нет прав финального выбора кандидата по этой вакансии.'
      case 'candidate_not_in_shortlist':
        return 'Кандидат не находится в shortlist этой вакансии.'
      case 'candidate_select_conflict':
        return 'Финальный кандидат уже выбран и не может быть изменен.'
      case 'selected_candidate_contacts_forbidden':
        return 'У вас нет доступа к контактам выбранного кандидата.'
      case 'candidate_not_selected':
        return 'Финальный кандидат еще не выбран.'
      case 'selected_candidate_not_found':
        return 'Выбранный кандидат не найден.'
      case 'vacancy_candidate_contacts_forbidden':
        return 'У вас нет доступа к контактам кандидата.'
      case 'vacancy_candidate_contacts_access_denied':
        return 'Доступ к контактам кандидата ограничен (owner/TTL).'
      default:
        // @dvnull: Локальный parser ошибок из VacanciesPage вынесен в feature/lib для переиспользования и разгрузки page.
        return error.data.detail ?? error.data.title ?? 'Не удалось выполнить запрос.'
    }
  }

  return 'Не удалось выполнить запрос.'
}
