import type { RegistrationRole } from '@/features/auth/types'

export type RoleAnimationDirection = 'left' | 'right' | 'none'

export function getRoleAnimationDirection(
  currentRole: RegistrationRole,
  nextRole: RegistrationRole,
  roleOrder: readonly RegistrationRole[],
): RoleAnimationDirection {
  const currentRoleIndex = roleOrder.findIndex((role) => role === currentRole)
  const nextRoleIndex = roleOrder.findIndex((role) => role === nextRole)

  if (currentRoleIndex >= 0 && nextRoleIndex >= 0) {
    return nextRoleIndex > currentRoleIndex ? 'right' : 'left'
  }

  return 'right'
}

export function getRoleAnimationClassName(direction: RoleAnimationDirection): string {
  if (direction === 'left') {
    return 'auth-role-switch-left'
  }

  if (direction === 'right') {
    return 'auth-role-switch-right'
  }

  return ''
}
