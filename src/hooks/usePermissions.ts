import { useMemo } from 'react'
import { useUser } from './useUser'
import { hasPermission, getUserPermissions, canAccess, canAccessMenu } from '@/lib/permissions'

export function usePermissions() {
  const user = useUser()

  return useMemo(() => ({
    // Check single permission
    hasPermission: (permission: string) => hasPermission(user, permission),

    // Get all user permissions
    permissions: getUserPermissions(user),

    // Check if user can access any/all of the permissions
    canAccess: (permissions: string[], requireAll = false) =>
      canAccess(user, permissions, requireAll),

    // Check if user can access a specific menu
    canAccessMenu: (menuPath: string) => canAccessMenu(user, menuPath),

    // User data
    user,

    // Role helpers
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isReviewer: user?.role === 'reviewer',
    isApprover: user?.role === 'approver',
    isUser: user?.role === 'user',

    // Department helpers
    department: user?.departemen,
    isIT: user?.departemen === 'IT',
    isHR: user?.departemen === 'HR',
    isFinance: user?.departemen === 'Finance',
    isMarketing: user?.departemen === 'Marketing'
  }), [user])
}
