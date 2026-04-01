import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUser } from './useUser'
import { hasPermission, getUserPermissions, canAccess, canAccessMenu, fetchUserPermissions } from '@/lib/permissions'

export const permissionsKeys = {
  all: ['permissions'] as const,
  current: () => [...permissionsKeys.all, 'current'] as const,
}

export function usePermissions() {
  const { data: user, isLoading: userLoading, error: userError } = useUser()

  const { data: permissions = [], isLoading: permsLoading } = useQuery({
    queryKey: permissionsKeys.current(),
    queryFn: async (): Promise<string[]> => {
      if (!user) return []
      if (user.role_slug === 'admin') {
        return Object.keys(require('@/lib/permissions').PERMISSIONS)
      }
      const perms = await fetchUserPermissions(user.id)
      return perms
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return useMemo(() => ({
    hasPermission: (permission: string) => hasPermission(permissions, permission),

    permissions: getUserPermissions(permissions),

    canAccess: (required: string[], requireAll = false) =>
      canAccess(permissions, required, requireAll),

    canAccessMenu: (menuPath: string) => canAccessMenu(permissions, menuPath),

    user: user ?? null,
    isLoading: userLoading || permsLoading,
    error: userError,

    isAdmin: user?.role_slug === 'admin',
    isManager: user?.role_slug === 'manager',
    isReviewer: user?.role_slug === 'reviewer',
    isApprover: user?.role_slug === 'approver',
    isUser: user?.role_slug === 'user',

    department: user?.department_name,
    departmentSlug: user?.department_slug,
    isIT: user?.department_slug === 'it',
    isHR: user?.department_slug === 'human-capital',
    isFinance: user?.department_slug === 'finance',
    isMarketing: user?.department_slug === 'marketing',

    stakeholderType: user?.stakeholder_type ?? 'internal',
    isInternal: user?.stakeholder_type === 'internal',
    isVendor: user?.stakeholder_type === 'vendor',
    isClient: user?.stakeholder_type === 'client',

    isReviewerEligible: user?.is_reviewer_eligible ?? false,
    isApproverEligible: user?.is_approver_eligible ?? false,
  }), [user, userLoading, permsLoading, userError, permissions])
}
