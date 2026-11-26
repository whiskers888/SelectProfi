import type { WorkspaceOrder } from '../../model/data'

export function includeFetchedOrderForDetails(
  orders: WorkspaceOrder[],
  requestedOrderId: string | null,
  fetchedOrder: WorkspaceOrder | undefined,
): WorkspaceOrder[] {
  if (
    !requestedOrderId ||
    !fetchedOrder ||
    fetchedOrder.id !== requestedOrderId ||
    orders.some((order) => order.id === requestedOrderId)
  ) {
    return orders
  }

  return [...orders, fetchedOrder]
}
