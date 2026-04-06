import {
  useCreateVacancyMutation,
  useGetVacanciesQuery,
  useUpdateVacancyStatusMutation,
} from '@/shared/api/vacancies'

export function useVacanciesServer() {
  const { data, error, isError, isLoading, refetch } = useGetVacanciesQuery()
  const [createVacancy, { isLoading: isCreatingVacancy }] = useCreateVacancyMutation()
  const [updateVacancyStatus, { isLoading: isUpdatingVacancyStatus }] = useUpdateVacancyStatusMutation()

  return {
    data,
    error,
    isError,
    isLoading,
    isCreatingVacancy,
    isUpdatingVacancyStatus,
    refetch,
    createVacancy,
    updateVacancyStatus,
  }
}
