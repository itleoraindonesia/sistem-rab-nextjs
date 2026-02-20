import { useMemo } from 'react'
import { useUser } from './useUser'
import { hasPermission, getUserPermissions, canAccess, canAccessMenu } from '@/lib/permissions'

export function usePermissions() {
  const { data: user, isLoading, error } = useUser()

  return useMemo(() => ({
    hasPermission: (permission: string) => hasPermission(user ?? null, permission),

    permissions: getUserPermissions(user ?? null),

    canAccess: (permissions: string[], requireAll = false) =>
      canAccess(user ?? null, permissions, requireAll),

    canAccessMenu: (menuPath: string) => canAccessMenu(user ?? null, menuPath),

    user: user ?? null,
    isLoading,
    error,

    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isReviewer: user?.role === 'reviewer',
    isApprover: user?.role === 'approver',
    isUser: user?.role === 'user',

    department: user?.departemen,
    isIT: user?.departemen === 'IT',
    isHR: user?.departemen === 'HR',
    isFinance: user?.departemen === 'Finance',
    isMarketing: user?.departemen === 'Marketing'
  }), [user, isLoading, error])
}
