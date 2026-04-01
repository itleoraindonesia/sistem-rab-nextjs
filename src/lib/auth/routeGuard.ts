import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/permissions'

interface CachedProfile {
  id: string
  role_slug: string
  stakeholder_type: string
  is_active: boolean
  permissions: string[]
}

const getCachedProfile = cache(async (): Promise<CachedProfile> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile || !profile.is_active) {
    redirect('/login')
  }

  const permissions = profile.role_slug === 'admin'
    ? Object.keys(require('@/lib/permissions').PERMISSIONS)
    : (profile.role_permissions as string[]) || []

  return {
    id: profile.id,
    role_slug: profile.role_slug,
    stakeholder_type: profile.stakeholder_type,
    is_active: profile.is_active,
    permissions,
  }
})

export async function requirePermission(permission: string, redirectTo = '/unauthorized') {
  const profile = await getCachedProfile()

  if (!hasPermission(profile.permissions, permission)) {
    redirect(redirectTo)
  }

  return profile
}

export async function requireAnyPermission(permissions: string[], redirectTo = '/unauthorized') {
  const profile = await getCachedProfile()

  const hasAny = permissions.some(p => hasPermission(profile.permissions, p))

  if (!hasAny) {
    redirect(redirectTo)
  }

  return profile
}

export async function requireAllPermissions(permissions: string[], redirectTo = '/unauthorized') {
  const profile = await getCachedProfile()

  const hasAll = permissions.every(p => hasPermission(profile.permissions, p))

  if (!hasAll) {
    redirect(redirectTo)
  }

  return profile
}

export async function requireRole(roles: string[], redirectTo = '/unauthorized') {
  const profile = await getCachedProfile()

  if (!roles.includes(profile.role_slug)) {
    redirect(redirectTo)
  }

  return profile
}

export async function requireDepartment(departments: string[], redirectTo = '/unauthorized') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('department_slug, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    redirect('/login')
  }

  if (!profile.department_slug || !departments.includes(profile.department_slug)) {
    redirect(redirectTo)
  }

  return profile
}

export async function requireInternalUser(redirectTo = '/login') {
  const profile = await getCachedProfile()

  if (profile.stakeholder_type !== 'internal') {
    redirect(redirectTo)
  }

  return profile
}

export async function requireVendor(redirectTo = '/login') {
  const profile = await getCachedProfile()

  if (profile.stakeholder_type !== 'vendor') {
    redirect(redirectTo)
  }

  return profile
}

export async function requireClient(redirectTo = '/login') {
  const profile = await getCachedProfile()

  if (profile.stakeholder_type !== 'client') {
    redirect(redirectTo)
  }

  return profile
}

export async function getCurrentUser() {
  return getCachedProfile()
}
