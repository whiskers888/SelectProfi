import type { MyProfileResponse, UserRole } from '@/features/profile/model'

export function toRoleLabel(role: UserRole): string {
  switch (role) {
    case 'Applicant':
      return 'Соискатель'
    case 'Executor':
      return 'Исполнитель'
    case 'Customer':
      return 'Заказчик'
    case 'Admin':
      return 'Администратор'
    default:
      return role
  }
}

export function isUserRole(value: string): value is UserRole {
  return value === 'Applicant' || value === 'Executor' || value === 'Customer' || value === 'Admin'
}

export function resolveActiveRole(profile: MyProfileResponse): UserRole {
  if (profile.activeRole && isUserRole(profile.activeRole)) {
    return profile.activeRole
  }

  return profile.role
}

export function resolveAvailableRoles(profile: MyProfileResponse, activeRole: UserRole): UserRole[] {
  const roleCandidates = profile.roles?.filter(isUserRole) ?? []
  const uniqueRoles = Array.from(new Set(roleCandidates))

  if (!uniqueRoles.includes(activeRole)) {
    uniqueRoles.unshift(activeRole)
  }

  return uniqueRoles.length > 0 ? uniqueRoles : [activeRole]
}
