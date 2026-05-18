// src/components/workspace/shell/hooks/useWorkspaceApiQueries.ts
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetMyAuthInfoQuery } from '@/shared/api/auth';
import { useGetCustomerDashboardStatsQuery, useGetExecutorDashboardStatsQuery } from '@/shared/api/dashboard';
import { useGetOrderSpecializationsQuery } from '@/shared/api/orders';
import { useGetMyProfileQuery, useSwitchMyActiveRoleMutation } from '@/shared/api/profile';
import { useGetVacanciesQuery } from '@/shared/api/vacancies';

export function useWorkspaceApiQueries() {
    const { data: profile, isFetching: isProfileFetching, refetch: refetchProfile } = useGetMyProfileQuery();
    const { data: authMe, isFetching: isAuthMeFetching } = useGetMyAuthInfoQuery();

    const { data: orderSpecializationsResponse, isError: isOrderSpecializationsError, isFetching: isOrderSpecializationsLoading } =
        useGetOrderSpecializationsQuery(authMe?.role === 'Customer' ? undefined : skipToken);

    const { data: executorDashboardStats } = useGetExecutorDashboardStatsQuery(
        authMe?.role === 'Executor' ? undefined : skipToken,
    );
    const { data: customerDashboardStats } = useGetCustomerDashboardStatsQuery(
        authMe?.role === 'Customer' ? undefined : skipToken,
    );
    const { data: vacanciesResponse, refetch: refetchVacancies } = useGetVacanciesQuery(undefined);

    const [switchMyActiveRole, { isLoading: isSwitchingRole }] = useSwitchMyActiveRoleMutation();

    const orderSpecializationOptions = orderSpecializationsResponse?.items.map((item) => ({
        id: item.id,
        name: item.name
    })) ?? [];

    return {
        profile,
        refetchProfile,
        isProfileFetching,
        authMe,
        isAuthMeFetching,
        switchMyActiveRole,
        isSwitchingRole,
        orderSpecializationOptions,
        isOrderSpecializationsLoading,
        isOrderSpecializationsError,
        executorDashboardStats,
        customerDashboardStats,
        vacanciesResponse,
        refetchVacancies,
    };
}