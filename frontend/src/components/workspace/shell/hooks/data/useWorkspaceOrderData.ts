import type { OrderListResponse } from '@/shared/api/orders'
import type { VacancyListResponse } from '@/shared/api/vacancies'
import { toWorkspaceOrder, toWorkspaceOrderFromVacancy } from '../../workspaceShell.helpers'
import type { WorkspaceRole } from '../../../model/data'

type UseWorkspaceOrderDataProps = {
  role: WorkspaceRole
  ordersResponse?: OrderListResponse
  vacanciesResponse?: VacancyListResponse
  preferredOrderId: string | null
  canLoadServerOrders: boolean
}

export function useWorkspaceOrderData({
  role,
  ordersResponse,
  vacanciesResponse,
  preferredOrderId,
}: UseWorkspaceOrderDataProps) {
  const orders = ordersResponse?.items.map(toWorkspaceOrder) ?? []
  const vacancyOrders = vacanciesResponse?.items.map(toWorkspaceOrderFromVacancy) ?? []
  const baseOrders = role === 'Executor' && vacancyOrders.length > 0 ? vacancyOrders : orders
  const candidateScopeOrderId =
    baseOrders.find((order) => order.id === preferredOrderId)?.id ?? baseOrders[0]?.id ?? null

  return { baseOrders, candidateScopeOrderId }
}
