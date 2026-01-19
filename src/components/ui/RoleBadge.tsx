interface RoleBadgeProps {
  role: string
  departemen?: string
  size?: 'sm' | 'md' | 'lg'
  showDepartemen?: boolean
}

export function RoleBadge({
  role,
  departemen,
  size = 'md',
  showDepartemen = true
}: RoleBadgeProps) {
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'ADMIN',
          color: 'bg-red-100 text-red-800 border-red-200',
          description: 'Administrator'
        }
      case 'manager':
        return {
          label: 'MANAGER',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Manager'
        }
      case 'reviewer':
        return {
          label: 'REVIEWER',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          description: 'Reviewer'
        }
      case 'approver':
        return {
          label: 'APPROVER',
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Approver'
        }
      case 'user':
        return {
          label: 'USER',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'User'
        }
      default:
        return {
          label: role.toUpperCase(),
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: role
        }
    }
  }

  const roleInfo = getRoleInfo(role)

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const displayText = showDepartemen && departemen
    ? `${roleInfo.label} - ${departemen.toUpperCase()}`
    : roleInfo.label

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${roleInfo.color}
        ${sizeClasses[size]}
      `}
      title={`${roleInfo.description}${departemen ? ` - ${departemen}` : ''}`}
    >
      {displayText}
    </span>
  )
}

// Compact version for sidebar
export function CompactRoleBadge({
  role,
  departemen
}: {
  role: string
  departemen?: string
}) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500'
      case 'manager': return 'bg-blue-500'
      case 'reviewer': return 'bg-yellow-500'
      case 'approver': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-2 h-2 rounded-full ${getRoleColor(role)}`}
        title={`${role.toUpperCase()}${departemen ? ` - ${departemen}` : ''}`}
      />
      <span className="text-xs text-gray-500 capitalize">
        {departemen ? `${role} - ${departemen}` : role}
      </span>
    </div>
  )
}
