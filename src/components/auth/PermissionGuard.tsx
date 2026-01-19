import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  permissions: string[]
  fallback?: React.ReactNode
  requireAll?: boolean // true = AND, false = OR
  children: React.ReactNode
}

export function PermissionGuard({
  permissions,
  fallback = null,
  requireAll = false,
  children
}: PermissionGuardProps) {
  const { canAccess } = usePermissions()

  const hasAccess = canAccess(permissions, requireAll)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Component for single permission check
interface HasPermissionProps {
  permission: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function HasPermission({ permission, fallback = null, children }: HasPermissionProps) {
  const { hasPermission } = usePermissions()

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}

// Component for role-based rendering
interface RoleGuardProps {
  roles: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { user } = usePermissions()

  const hasRole = user && roles.includes(user.role)

  return hasRole ? <>{children}</> : <>{fallback}</>
}

// Component for department-based rendering
interface DepartmentGuardProps {
  departments: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function DepartmentGuard({ departments, fallback = null, children }: DepartmentGuardProps) {
  const { user } = usePermissions()

  const hasDepartment = user && user.departemen && departments.includes(user.departemen)

  return hasDepartment ? <>{children}</> : <>{fallback}</>
}
