import { useGetHealthQuery } from '@/shared/api/generated/openapi'

export function useHealthServer() {
  const { isError, isLoading, refetch } = useGetHealthQuery()

  return {
    isError,
    isLoading,
    refetch,
  }
}
