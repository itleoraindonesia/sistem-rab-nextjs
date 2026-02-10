// Permission system berdasarkan AUTH.md specification
export const PERMISSIONS = {
  // Dashboard
  'dashboard.view': 'View Dashboard',

  // Dokumen permissions
  'dokumen.create': 'Create Documents',
  'dokumen.create.own': 'Create Own Documents',
  'dokumen.submit': 'Submit Documents',
  'dokumen.review': 'Review Documents',
  'dokumen.approve': 'Approve Documents',

  // Produk & RAB permissions
  'produk-rab.view': 'View RAB',
  'produk-rab.create': 'Create RAB',
  'produk-rab.edit': 'Edit RAB',
  'produk-rab.delete': 'Delete RAB',

  // CRM permissions
  'crm.view': 'View CRM',
  'crm.manage': 'Manage CRM',
  'crm.create': 'Create CRM Data',
  'crm.edit': 'Edit CRM Data',

  // Master Data permissions
  'master.view': 'View Master Data',
  'master.manage': 'Manage Master Data',

  // Meeting permissions
  'meeting.view': 'View Meetings',
  'meeting.manage': 'Manage Meetings',

  // Supply Chain permissions (soon)
  'supply-chain.view': 'View Supply Chain',
  'supply-chain.manage': 'Manage Supply Chain',

  // File Manager permissions
  'files.view': 'View File Manager',
  'files.download': 'Download Files',

  // User management
  'users.manage': 'Manage Users',
  'users.view': 'View Users'
} as const

export type Permission = keyof typeof PERMISSIONS

// Permission matrix berdasarkan AUTH.md
export const PERMISSION_MATRIX = {
  admin: Object.keys(PERMISSIONS),

  manager: {
    'Corsec': [
      'dashboard.view',
      'meeting.view', 'meeting.manage',
      'files.view'
      // Security-related modules - can be expanded as needed
    ],
    'Finance': [
      'dashboard.view',
      'dokumen.create', 'produk-rab.view', 'produk-rab.create', 'produk-rab.edit',
      'master.view', 'master.manage',
      'meeting.view', 'meeting.manage',
      'files.view'
    ],
    'Human Capital': [
      'dashboard.view',
      'dokumen.create', 'dokumen.submit', 'dokumen.review', 'dokumen.approve',
      'meeting.view', 'meeting.manage',
      'files.view'
    ],
    'Konstruksi': [
      'dashboard.view',
      'dokumen.create', 'dokumen.submit', 'dokumen.review', 'dokumen.approve',
      'produk-rab.view', 'produk-rab.create', 'produk-rab.edit', 'produk-rab.delete',
      'crm.view', 'crm.manage', 'crm.create', 'crm.edit',
      'master.view', 'master.manage',
      'meeting.view', 'meeting.manage',
      'files.view'
    ],
    'Marketing': [
      'dashboard.view',
      'crm.view', 'crm.manage', 'crm.create', 'crm.edit',
      'meeting.view', 'meeting.manage',
      'files.view'
    ],
    'PBD': Object.keys(PERMISSIONS), // FULL ACCESS like admin
    'SCM': [
      'dashboard.view',
      'supply-chain.view', 'supply-chain.manage',
      'meeting.view', 'meeting.manage',
      'files.view'
    ]
  },

  reviewer: [
    'dashboard.view',
    'dokumen.create', 'dokumen.submit', 'dokumen.review'
  ],

  approver: [
    'dashboard.view',
    'dokumen.create', 'dokumen.submit', 'dokumen.approve'
  ],

  user: [
    'dashboard.view',
    'dokumen.create.own', 'dokumen.submit',
    'produk-rab.view',
    'crm.view'
  ]
} as const

export type UserRole = keyof typeof PERMISSION_MATRIX
export type Department = keyof typeof PERMISSION_MATRIX.manager

// User type (aligned with database)
export interface User {
  id: string
  nik: string
  username: string
  email: string
  nama: string
  jabatan?: string
  departemen?: string
  no_hp?: string
  instansi_id?: string
  role: UserRole
  is_active: boolean
  avatar_url?: string
  signature_image?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

// Utility functions
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.is_active) return false

  // Admin has all permissions
  if (user.role === 'admin') return true

  const userPermissions = getUserPermissions(user)
  return userPermissions.includes(permission)
}

export function getUserPermissions(user: User | null): string[] {
  if (!user) return []

  if (user.role === 'admin') {
    return [...PERMISSION_MATRIX.admin]
  }

  if (user.role === 'manager') {
    const deptPermissions = PERMISSION_MATRIX.manager[user.departemen as Department]
    return deptPermissions ? [...deptPermissions] : []
  }

  return PERMISSION_MATRIX[user.role] ? [...PERMISSION_MATRIX[user.role]] : []
}

export function canAccess(user: User | null, permissions: string[], requireAll = false): boolean {
  if (!user) return false

  if (requireAll) {
    // AND logic - user must have ALL permissions
    return permissions.every(p => hasPermission(user, p))
  } else {
    // OR logic - user must have at least ONE permission
    return permissions.some(p => hasPermission(user, p))
  }
}

// Menu permissions mapping
export const MENU_PERMISSIONS = {
  '/': ['dashboard.view'],
  '/documents': ['dokumen.create', 'dokumen.review', 'dokumen.approve'],
  '/produk-rab': ['produk-rab.view', 'produk-rab.create'],
  '/crm': ['crm.view', 'crm.manage'],
  '/master': ['master.view', 'master.manage'],
  '/meeting': ['meeting.view', 'meeting.manage'],
  '/files': ['files.view'],
  '/supply-chain': ['supply-chain.view', 'supply-chain.manage'] // Not implemented yet
} as const

// Check if user can access a specific menu
export function canAccessMenu(user: User | null, menuPath: string): boolean {
  const requiredPermissions = MENU_PERMISSIONS[menuPath as keyof typeof MENU_PERMISSIONS]
  if (!requiredPermissions) return true // Menu without specific permissions

  return canAccess(user, [...requiredPermissions])
}
