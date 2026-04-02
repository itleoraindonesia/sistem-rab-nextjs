import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { supabase } from '@/lib/supabase/client';

interface PermissionGuardProps {
  permissions: string[]
  fallback?: React.ReactNode
  requireAll?: boolean // true = AND, false = OR
  loading?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({
  permissions,
  fallback = null,
  requireAll = false,
  loading = null,
  children
}: PermissionGuardProps) {
  const { canAccess, isLoading } = usePermissions()

  if (isLoading) {
    return <>{loading}</>
  }

  const hasAccess = canAccess(permissions, requireAll)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Component for single permission check
interface HasPermissionProps {
  permission: string
  fallback?: React.ReactNode
  loading?: React.ReactNode
  children: React.ReactNode
}

export function HasPermission({ permission, fallback = null, loading = null, children }: HasPermissionProps) {
  const { hasPermission, isLoading } = usePermissions()

  if (isLoading) {
    return <>{loading}</>
  }

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}

// Component for role-based rendering
interface RoleGuardProps {
  roles: string[]
  fallback?: React.ReactNode
  loading?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ roles, fallback = null, loading = null, children }: RoleGuardProps) {
  const { user, isLoading } = usePermissions()

  if (isLoading) {
    return <>{loading}</>
  }

  const hasRole = user && user.role_slug && roles.includes(user.role_slug)

  return hasRole ? <>{children}</> : <>{fallback}</>
}

// Component for department-based rendering
interface DepartmentGuardProps {
  departments: string[]
  fallback?: React.ReactNode
  loading?: React.ReactNode
  children: React.ReactNode
}

export function DepartmentGuard({ departments, fallback = null, loading = null, children }: DepartmentGuardProps) {
  const { user, isLoading } = usePermissions()

  if (isLoading) {
    return <>{loading}</>
  }

  const hasDepartment = user && user.department_slug && departments.includes(user.department_slug)

  return hasDepartment ? <>{children}</> : <>{fallback}</>
}
