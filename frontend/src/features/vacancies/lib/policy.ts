import type { MyAuthInfoResponse } from '@/shared/api/auth'
import type { VacancyStatusContract } from '@/shared/api/vacancies'

type AuthRole = MyAuthInfoResponse['role'] | undefined

export function canCreateVacancy(role: AuthRole): boolean {
  return role === 'Executor'
}

export function canEditVacancy(role: AuthRole): boolean {
  return role === 'Executor'
}

export function canManagePipeline(role: AuthRole): boolean {
  return role === 'Executor'
}

export function canSelectCandidate(role: AuthRole): boolean {
  return role === 'Customer'
}

export function canReadSelectedContacts(role: AuthRole): boolean {
  return role === 'Customer'
}

export function canReadExecutorContacts(role: AuthRole): boolean {
  return role === 'Executor'
}

export function canReadVacancyCandidates(role: AuthRole): boolean {
  // @dvnull: Ранее role/policy проверки были локально в VacanciesPage; вынесены в feature/lib без изменения матрицы прав.
  return role === 'Customer' || role === 'Executor' || role === 'Admin'
}

export function isPublishedVacancyStatus(status: VacancyStatusContract | undefined): boolean {
  // @dvnull: Локальная проверка опубликованного статуса из VacanciesPage вынесена в policy helper без изменения бизнес-правила.
  return status === 'Published'
}
