import {
  useGetMyProfileQuery,
  useSwitchMyActiveRoleMutation,
  useUpdateMyProfileMutation,
} from '@/shared/api/profile'

export type { ExecutorEmploymentType, MyProfileResponse, UserRole } from '@/shared/api/profile'
export type { CustomerLegalForm } from '@/shared/api/profile'

export function useProfileServer() {
  const { data, error, isError, isLoading, refetch } = useGetMyProfileQuery()
  const [updateMyProfile, { isLoading: isUpdatingProfile }] = useUpdateMyProfileMutation()
  const [switchMyActiveRole, { isLoading: isSwitchingRole }] = useSwitchMyActiveRoleMutation()

  return {
    data,
    error,
    isError,
    isLoading,
    isSwitchingRole,
    isUpdatingProfile,
    refetch,
    switchMyActiveRole,
    updateMyProfile,
  }
}
