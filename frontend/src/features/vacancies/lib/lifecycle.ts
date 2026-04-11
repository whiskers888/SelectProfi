import type { VacancyResponse, VacancyStatusContract } from '@/shared/api/vacancies'

export function getLifecycleAction(
  role: string | undefined,
  vacancy: VacancyResponse,
): { label: string; status: VacancyStatusContract } | null {
  if (role === 'Executor' && vacancy.status === 'Draft') {
    return { label: 'На согласование', status: 'OnApproval' }
  }

  if (role === 'Executor' && vacancy.status === 'OnApproval') {
    return { label: 'Вернуть в Draft', status: 'Draft' }
  }

  if (role === 'Customer' && vacancy.status === 'OnApproval') {
    return { label: 'Опубликовать', status: 'Published' }
  }

  // @dvnull: Lifecycle helper вынесен из VacanciesPage в feature/lib для декомпозиции page и переиспользования.
  return null
}
