import { supabase } from './supabase/client';

export const PERMISSIONS = {
  'dashboard.view': 'View Dashboard',
  'dokumen.create': 'Create Documents',
  'dokumen.create.own': 'Create Own Documents',
  'dokumen.submit': 'Submit Documents',
  'dokumen.review': 'Review Documents',
  'dokumen.approve': 'Approve Documents',
  'products.view': 'View Products',
  'products.create': 'Create Products',
  'products.edit': 'Edit Products',
  'products.delete': 'Delete Products',
  'crm.view': 'View CRM',
  'crm.manage': 'Manage CRM',
  'crm.create': 'Create CRM Data',
  'crm.edit': 'Edit CRM Data',
  'master.view': 'View Master Data',
  'master.manage': 'Manage Master Data',
  'meeting.view': 'View Meetings',
  'meeting.manage': 'Manage Meetings',
  'supply-chain.view': 'View Supply Chain',
  'supply-chain.manage': 'Manage Supply Chain',
  'files.view': 'View File Manager',
  'files.download': 'Download Files',
  'users.manage': 'Manage Users',
  'users.view': 'View Users',
  'workflow.manage': 'Manage Workflows',
  'konstruksi.view': 'View Konstruksi',
  'konstruksi.manage': 'Manage Konstruksi'
} as const

export type Permission = keyof typeof PERMISSIONS

export type StakeholderType = 'internal' | 'vendor' | 'client'

export interface UserProfile {
  id: string
  nik: string
  username: string
  email: string
  nama: string
  jabatan?: string
  department_id?: string
  department_name?: string
  department_slug?: string
  no_hp?: string
  role_id: string
  role_name?: string
  role_slug?: string
  is_active: boolean
  stakeholder_type: StakeholderType
  is_reviewer_eligible: boolean
  is_approver_eligible: boolean
  avatar_url?: string
  signature_image?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    nik: data.nik,
    username: data.username,
    email: data.email,
    nama: data.nama,
    jabatan: data.jabatan,
    department_id: data.department_id,
    department_name: data.department_name,
    department_slug: data.department_slug,
    no_hp: data.no_hp,
    role_id: data.role_id,
    role_name: data.role_name,
    role_slug: data.role_slug,
    is_active: data.is_active,
    stakeholder_type: data.stakeholder_type,
    is_reviewer_eligible: data.is_reviewer_eligible,
    is_approver_eligible: data.is_approver_eligible,
    avatar_url: data.avatar_url,
    signature_image: data.signature_image,
    last_login_at: data.last_login_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function fetchUserPermissions(userId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_user_permissions')

  if (error) {
    console.error('Failed to fetch user permissions:', error)
    return []
  }

  if (!data) return []

  return data as string[]
}

export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission)
}

export function getUserPermissions(permissions: string[]): string[] {
  return [...permissions]
}

export function canAccess(permissions: string[], required: string[], requireAll = false): boolean {
  if (requireAll) {
    return required.every(p => permissions.includes(p))
  }
  return required.some(p => permissions.includes(p))
}

export const MENU_PERMISSIONS = {
  '/': ['dashboard.view'],
  '/documents': ['dokumen.create', 'dokumen.review', 'dokumen.approve'],
  '/products': ['products.view', 'products.create'],
  '/crm': ['crm.view', 'crm.manage'],
  '/master': ['master.view', 'master.manage'],
  '/meeting': ['meeting.view', 'meeting.manage'],
  '/files': ['files.view'],
  '/supply-chain': ['supply-chain.view', 'supply-chain.manage'],
  '/setting': ['workflow.manage'],
  '/setting/workflow': ['workflow.manage'],
  '/setting/updates': [],
  '/construction': ['konstruksi.view']
} as const

export function canAccessMenu(permissions: string[], menuPath: string): boolean {
  const requiredPermissions = MENU_PERMISSIONS[menuPath as keyof typeof MENU_PERMISSIONS]
  if (!requiredPermissions) return true
  return canAccess(permissions, [...requiredPermissions])
}
