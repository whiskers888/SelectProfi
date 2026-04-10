import {
  useCreateVacancyMutation,
  useDeleteVacancyMutation,
  useGetVacanciesQuery,
  useUpdateVacancyMutation,
  useUpdateVacancyStatusMutation,
  type GetVacanciesRequest,
} from '@/shared/api/vacancies'

export function useVacanciesServer(query?: GetVacanciesRequest) {
  const { data, error, isError, isLoading, refetch } = useGetVacanciesQuery(query)
  const [createVacancy, { isLoading: isCreatingVacancy }] = useCreateVacancyMutation()
  const [updateVacancy, { isLoading: isUpdatingVacancy }] = useUpdateVacancyMutation()
  const [updateVacancyStatus, { isLoading: isUpdatingVacancyStatus }] = useUpdateVacancyStatusMutation()
  const [deleteVacancy, { isLoading: isDeletingVacancy }] = useDeleteVacancyMutation()

  return {
    data,
    error,
    isError,
    isLoading,
    isCreatingVacancy,
    isUpdatingVacancy,
    isUpdatingVacancyStatus,
    isDeletingVacancy,
    refetch,
    createVacancy,
    updateVacancy,
    updateVacancyStatus,
    deleteVacancy,
  }
}
