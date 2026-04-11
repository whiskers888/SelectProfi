import type { MyAuthInfoResponse } from '@/shared/api/auth'

type UserRole = MyAuthInfoResponse['role'] | undefined

export function canCreateOrder(role: UserRole): boolean {
  // @dvnull: Ранее policy-проверки были локально в OrdersPage; вынесены в lib без изменения правил доступа.
  return role === 'Customer'
}

export function canEditOrder(role: UserRole): boolean {
  return role === 'Customer' || role === 'Admin'
}

export function canDeleteOrder(role: UserRole): boolean {
  return role === 'Customer' || role === 'Admin'
}

export function canAssignExecutor(role: UserRole): boolean {
  return role === 'Customer'
}
