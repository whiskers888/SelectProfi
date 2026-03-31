import { useGetMyProfileQuery, useUpdateMyProfileMutation } from '@/shared/api/profile'

export type { ExecutorEmploymentType, MyProfileResponse, UserRole } from '@/shared/api/profile'

export function useProfileServer() {
  const { data, error, isError, isLoading, refetch } = useGetMyProfileQuery()
  const [updateMyProfile, { isLoading: isUpdatingProfile }] = useUpdateMyProfileMutation()

  return {
    data,
    error,
    isError,
    isLoading,
    isUpdatingProfile,
    refetch,
    updateMyProfile,
  }
}
