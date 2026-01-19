import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/permissions'

// Server-side route guard function
export async function requirePermission(permission: string, redirectTo = '/unauthorized') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    redirect('/login')
  }

  if (!hasPermission(profile, permission)) {
    redirect(redirectTo)
  }

  return profile
}

// Check multiple permissions (OR logic)
export async function requireAnyPermission(permissions: string[], redirectTo = '/unauthorized') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    redirect('/login')
  }

  const hasAnyPermission = permissions.some(p => hasPermission(profile, p))

  if (!hasAnyPermission) {
    redirect(redirectTo)
  }

  return profile
}

// Check multiple permissions (AND logic)
export async function requireAllPermissions(permissions: string[], redirectTo = '/unauthorized') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    redirect('/login')
  }

  const hasAllPermissions = permissions.every(p => hasPermission(profile, p))

  if (!hasAllPermissions) {
    redirect(redirectTo)
  }

  return profile
}

// Role-based route guard
export async function requireRole(roles: string[], redirectTo = '/unauthorized') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    redirect('/login')
  }

  if (!roles.includes(profile.role)) {
    redirect(redirectTo)
  }

  return profile
}

// Department-based route guard
export async function requireDepartment(departments: string[], redirectTo = '/unauthorized') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    redirect('/login')
  }

  if (!profile.departemen || !departments.includes(profile.departemen)) {
    redirect(redirectTo)
  }

  return profile
}
