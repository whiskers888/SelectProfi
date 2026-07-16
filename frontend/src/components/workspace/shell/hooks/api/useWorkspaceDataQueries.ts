// frontend/src/components/workspace/shell/hooks/api/useWorkspaceDataQueries.ts
import { skipToken } from '@reduxjs/toolkit/query'
import {
  useGetVacancyBaseCandidatesQuery,
  useGetVacancyCandidatesQuery,
} from '@/shared/api/candidates'
import {
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetMyOrderResponseQuery,
  useGetMyOrdersQuery,
  useGetOrderResponsesQuery,
  useGetOrdersQuery,
  useRejectOrderResponseExecutorMutation,
  useRespondToOrderMutation,
  useSelectOrderResponseExecutorMutation,
  useUpdateOrderMutation,
} from '@/shared/api/orders'
import {
  useCreateVacancyMutation,
  useGetVacanciesQuery,
  useUpdateVacancyMutation,
  useUpdateVacancyStatusMutation,
} from '@/shared/api/vacancies'
import type { WorkspaceRole } from '../../model/data'

type UseWorkspaceDataQueriesProps = {
  role: WorkspaceRole
  authMeUserId: string | undefined
  canLoadServerOrders: boolean
  canLoadServerCandidates: boolean
  canLoadExecutorBaseCandidates: boolean
  preferredOrderId: string | null
}

export function useWorkspaceDataQueries({
  role,
  authMeUserId,
  canLoadServerOrders,
  canLoadServerCandidates,
  canLoadExecutorBaseCandidates,
  preferredOrderId,
}: UseWorkspaceDataQueriesProps) {
  const ordersQueryParams = { limit: 100, includeArchived: true } as const
  const shouldLoadMyOrders = role === 'Executor'
  const shouldLoadAllOrders = role === 'Customer' || role === 'Applicant'

  // Заказы
  const {
    data: allOrdersResponse,
    isError: isAllOrdersError,
    isFetching: isAllOrdersFetching,
    refetch: refetchAllOrders,
  } = useGetOrdersQuery(
    canLoadServerOrders && shouldLoadAllOrders ? ordersQueryParams : skipToken,
  )

  const {
    data: myOrdersResponse,
    isError: isMyOrdersError,
    isFetching: isMyOrdersFetching,
    refetch: refetchMyOrders,
  } = useGetMyOrdersQuery(shouldLoadMyOrders && canLoadServerOrders ? ordersQueryParams : skipToken)

  const ordersResponse = shouldLoadMyOrders ? myOrdersResponse : allOrdersResponse
  const isOrdersError = shouldLoadMyOrders ? isMyOrdersError : isAllOrdersError
  const isOrdersFetching = shouldLoadMyOrders ? isMyOrdersFetching : isAllOrdersFetching
  const refetchOrders = shouldLoadMyOrders ? refetchMyOrders : refetchAllOrders

  // Вакансии
  const { data: vacanciesResponse, refetch: refetchVacancies } = useGetVacanciesQuery(
    canLoadServerOrders ? undefined : skipToken,
  )

  // Найти вакансию по orderId для кандидатов
  const getCandidateSourceVacancyByOrderId = (orderId: string) => {
    return vacanciesResponse?.items.find((vacancy) => vacancy.orderId === orderId) ?? null
  }

  // Кандидаты по вакансии
  const candidateVacancy = vacanciesResponse?.items.find((vacancy) => vacancy.orderId === preferredOrderId)
    ?? vacanciesResponse?.items[0]
  const candidateVacancyId = candidateVacancy?.id
  const {
    data: vacancyCandidatesResponse,
    isFetching: isVacancyCandidatesFetching,
    isError: isVacancyCandidatesError,
  } = useGetVacancyCandidatesQuery(
    canLoadServerCandidates && candidateVacancyId ? { vacancyId: candidateVacancyId } : skipToken,
  )
  const { data: vacancyBaseCandidatesResponse } = useGetVacancyBaseCandidatesQuery(
    canLoadExecutorBaseCandidates && candidateVacancyId ? { vacancyId: candidateVacancyId } : skipToken,
  )

  // Ответы на заказы
  const { data: myOrderResponse, refetch: refetchMyOrderResponse } = useGetMyOrderResponseQuery(
    role === 'Executor' && authMeUserId ? skipToken : skipToken, // TODO: pass orderId when selected
  )

  const {
    data: orderResponsesResponse,
    isFetching: isOrderResponsesFetching,
    refetch: refetchOrderResponses,
  } = useGetOrderResponsesQuery(skipToken) // TODO: pass orderId when selected

  // Mutations
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()
  const [updateOrder, { isLoading: isOrderStatusUpdating }] = useUpdateOrderMutation()
  const [deleteOrder, { isLoading: isDeletingOrder }] = useDeleteOrderMutation()
  const [respondToOrder, { isLoading: isRespondingToOrder }] = useRespondToOrderMutation()
  const [selectOrderResponseExecutor, { isLoading: isSelectingOrderExecutor }] =
    useSelectOrderResponseExecutorMutation()
  const [rejectOrderResponseExecutor, { isLoading: isRejectingOrderExecutor }] =
    useRejectOrderResponseExecutorMutation()

  const [createVacancy, { isLoading: isCreatingVacancy }] = useCreateVacancyMutation()
  const [updateVacancy, { isLoading: isUpdatingVacancy }] = useUpdateVacancyMutation()
  const [updateVacancyStatus, { isLoading: isSendingVacancyToCustomer }] =
    useUpdateVacancyStatusMutation()

  return {
    // Запросы заказов
    ordersResponse,
    isOrdersError,
    isOrdersFetching,
    refetchOrders,
    refetchMyOrders,
    refetchAllOrders,

    // Запросы вакансий
    vacanciesResponse,
    refetchVacancies,
    getCandidateSourceVacancyByOrderId,

    // Запросы кандидатов
    vacancyCandidatesResponse,
    vacancyBaseCandidatesResponse,
    isVacancyCandidatesFetching,
    isVacancyCandidatesError,

    // Запросы ответов
    myOrderResponse,
    refetchMyOrderResponse,
    orderResponsesResponse,
    isOrderResponsesFetching,
    refetchOrderResponses,

    // Mutations заказов
    createOrder,
    updateOrder,
    deleteOrder,
    respondToOrder,
    selectOrderResponseExecutor,
    rejectOrderResponseExecutor,
    isCreatingOrder,
    isOrderStatusUpdating,
    isDeletingOrder,
    isRespondingToOrder,
    isSelectingOrderExecutor,
    isRejectingOrderExecutor,

    // Mutations вакансий
    createVacancy,
    updateVacancy,
    updateVacancyStatus,
    isCreatingVacancy,
    isUpdatingVacancy,
    isSendingVacancyToCustomer,
  }
}
