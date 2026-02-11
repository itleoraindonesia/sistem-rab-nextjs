"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FileText, Package, Home, LogOut, User, ClipboardCheck, CheckSquare, Users, Truck, ChevronDown, ChevronRight, Calendar, Lock, Settings, Eye, EyeOff, AlertCircle, Folder, GitBranch } from "lucide-react"
import { supabase } from "../../lib/supabase/client"
import type { Tables } from "../../types/database"
import { usePermissions } from "../../hooks/usePermissions"
import { canAccessMenu } from "../../lib/permissions"
import { CompactRoleBadge } from "../../components/ui/RoleBadge"
import { usePendingReviews, usePendingApprovals, useLetters } from "../../hooks/useLetters"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, children: [] },
  {
    name: "Administrasi",
    path: "/documents",
    icon: FileText,
    children: [
      "/documents/dashboard",
      "/documents/outgoing-letter",
      "/documents/memo",
      "/documents/revisi",
      "/documents/review",
      "/documents/approval",
    ],
  },
  {
    name: "Produk & RAB",
    path: "/produk-rab",
    icon: Package,
    children: ["/produk-rab/dashboard", "/produk-rab/kalkulator-harga", "/produk-rab/panel-lantai-dinding", "/produk-rab/pagar-beton"],
    activeColor: "green", // Warna untuk child routes
  },
  {
    name: "Marketing",
    path: "/crm",
    icon: Users,
    children: ["/crm/dashboard", "/crm/input", "/crm/clients"],
  },
  // Hidden temporarily - Supply Chain
  // {
  //   name: "Supply Chain (soon)",
  //   path: "/supply-chain",
  //   icon: Truck,
  //   children: [
  //     "/supply-chain/dashboard",
  //     "/supply-chain/pr",
  //     "/supply-chain/po",
  //     "/supply-chain/list-material"
  //   ],
  // },
  {
    name: "Meeting",
    path: "/meeting",
    icon: Calendar,
    children: [
      "/meeting",
      "/meeting/baru"
    ],
  },
  {
    name: "File Manager",
    path: "/files",
    icon: Folder,
    children: [],
  },
  {
    name: "Setting",
    path: "/setting",
    icon: Settings,
    children: ["/setting/workflow"],
  },
  // Hidden temporarily - Master Data
  // {
  //   name: "Master Data",
  //   path: "/master",
  //   icon: Package,
  //   children: ["/master/panel", "/master/ongkir"], // Child route patterns
  // },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar()
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null)
  const [user, setUser] = React.useState<Tables<'users'> | null>(null)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [showPasswordModal, setShowPasswordModal] = React.useState(false)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { canAccessMenu } = usePermissions()

  // Hooks for badges
  const { data: pendingReviews } = usePendingReviews(user?.id)
  const { data: pendingApprovals } = usePendingApprovals(user?.id)
  const { data: revisionMemos } = useLetters({ status: 'REVISION_REQUESTED', created_by_id: user?.id })

  const isCollapsed = isMobile ? false : sidebarState === "collapsed"

  // Fetch user data
  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Fetch user profile from public.users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userData) {
          setUser(userData)
        }
      }
    }
    fetchUser()
  }, [])

  // Set mounted state for portal
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Logout function
  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      // Logout dari Supabase
      await supabase.auth.signOut()
    } catch (error) {
      // Log error untuk debugging, tapi tetap lanjut ke login
      console.error('Logout error:', error)
    } finally {
      // Cleanup state
      setUser(null)
      
      // Clear ALL auth cookies sebelum redirect
      if (typeof document !== 'undefined') {
        // Clear auth-cache cookie
        document.cookie = 'auth-cache=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        
        // Clear all Supabase auth cookies (sb-*)
        // Supabase SSR menyimpan session di cookies dengan prefix sb-
        const cookies = document.cookie.split(';')
        cookies.forEach(cookie => {
          const [name] = cookie.split('=')
          const trimmedName = name.trim()
          if (trimmedName.startsWith('sb-')) {
            // Clear dengan domain yang sama
            document.cookie = `${trimmedName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${window.location.hostname};`
            // Clear tanpa domain juga (fallback)
            document.cookie = `${trimmedName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
          }
        })
        
        // Clear session storage untuk menghindari cache issues
        sessionStorage.removeItem('session_id')
      }
      
      // Force redirect ke /login dengan window.location.href
      // Menggunakan href (bukan replace) agar browser melakukan full page load
      // dan middleware membaca cookies yang sudah di-clear
      if (typeof window !== 'undefined') {
        window.location.href = '/login?logged_out=true'
      }
      setIsLoggingOut(false)
    }
  }

  // Password change function
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (newPassword !== confirmPassword) {
      setPasswordError("Password baru dan konfirmasi password tidak sama")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("Password baru minimal 6 karakter")
      return
    }

    setIsUpdatingPassword(true)

    try {
      // First verify current password by attempting to sign in
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) {
        setPasswordError("Tidak dapat mengidentifikasi user")
        return
      }

      // Verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      })

      if (verifyError) {
        setPasswordError("Password saat ini salah")
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        setPasswordError(updateError.message)
      } else {
        // Reset form and close modal
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setShowPasswordModal(false)
        alert("Password berhasil diubah!")
      }
    } catch (err) {
      setPasswordError("Terjadi kesalahan saat mengubah password")
      console.error(err)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle user profile click
  const handleProfileClick = () => {
    setShowPasswordModal(true)
  }

  // Disable body scroll when modal is open
  React.useEffect(() => {
    if (showPasswordModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPasswordModal])

  // Helper function to check if current path is child of parent
  const isChildRoute = (item: (typeof navItems)[0]) => {
    if (!item.children || item.children.length === 0) return false

    // Special handling for RAB routes - simplified logic
    if (item.path === "/produk-rab") {
      // If path starts with /rab/ but is not exactly /rab, it's a child route
      if (pathname.startsWith("/produk-rab/") && pathname !== "/produk-rab") {
        return true
      }
    }

    // General child route checking for other menus
    return item.children.some((childPath) => {
      return pathname === childPath || pathname.startsWith(`${childPath}/`)
    })
  }

  // Get active state for nav item
  const getNavItemState = (item: (typeof navItems)[0]) => {
    const isExactActive = pathname === item.path
    const isChildActive = isChildRoute(item)

    return {
      isActive: isExactActive || isChildActive,
      isChildActive,
      activeColor: item.activeColor,
    }
  }

  // Handle category toggle
  const handleCategoryToggle = (itemName: string, hasChildren: boolean, itemPath: string) => {
    if (hasChildren) {
      // Toggle expansion for categories with children
      setExpandedCategory(expandedCategory === itemName ? null : itemName)
    } else {
      // Navigate directly for categories without children
      router.push(itemPath)
      if (isMobile) {
        setOpenMobile(false)
      }
    }
  }

  // Auto-expand category if a child route is active
  React.useEffect(() => {
    const activeItem = navItems.find(item => {
      const { isChildActive } = getNavItemState(item)
      return isChildActive
    })

    if (activeItem && activeItem.children?.length) {
      setExpandedCategory(activeItem.name)
    }

    // Close mobile sidebar on navigation
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  const Badge = ({ count }: { count: number }) => {
    if (count === 0) return null;
    return (
      <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
        {count}
      </span>
    );
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className={`w-full ${isCollapsed ? 'justify-center' : ''}`} size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img src="/logo-only.png" alt="Logo" className="w-5 h-5 pointer-events-none select-none" />
                </div>
                {!isCollapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight text-sidebar-foreground">
                     <span className="truncate font-semibold">Leora ERP</span>
                     <span className="truncate text-xs text-muted-foreground">Aplikasi Internal Manajemen</span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigasi</SidebarGroupLabel>
          <SidebarMenu>
            {navItems
              .filter((item) => canAccessMenu(item.path)) // Filter berdasarkan permissions
              .map((item) => {
              const Icon = item.icon
              const { isActive, isChildActive } = getNavItemState(item)
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedCategory === item.name

              // Calculate badge for Administrasi parent menu
              let totalAdminBadge = 0
              if (item.name === "Administrasi") {
                totalAdminBadge = (pendingReviews?.length || 0) + (pendingApprovals?.length || 0)
              }

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => handleCategoryToggle(item.name, !!hasChildren, item.path)}
                    className={`cursor-pointer ${
                      isActive && !hasChildren 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground" 
                        : ""
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 shrink-0" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                      
                      {!isCollapsed && (
                        <div className="ml-auto flex items-center gap-2">
                          {item.name === "Administrasi" && totalAdminBadge > 0 && (
                            <Badge count={totalAdminBadge} />
                          )}
                          
                          {hasChildren && (
                            isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </SidebarMenuButton>
                  {hasChildren && isExpanded && (
                    <SidebarMenuSub>
                      {item.children.map((childPath) => {
                        // Special handling for meeting routes
                        let isChildActive = false
                        if (childPath === "/meeting") {
                          // /meeting is active for: exact /meeting, /meeting/[id], /meeting/[id]/edit
                          // but NOT for /meeting/baru
                          isChildActive = pathname === "/meeting" || 
                                         (pathname.startsWith("/meeting/") && !pathname.startsWith("/meeting/baru"))
                        } else if (childPath === "/meeting/baru") {
                          // /meeting/baru is only active for exact match or its children
                          isChildActive = pathname === childPath || pathname.startsWith(`${childPath}/`)
                        } else {
                          // Default behavior for other routes
                          isChildActive = pathname === childPath || pathname.startsWith(`${childPath}/`)
                        }

                        // Custom labels for different menu types
                        let childLabel: React.ReactNode = ""
                        let badge: React.ReactNode = null;
                        const pendingReviewsCount = pendingReviews?.length || 0;
                        const pendingApprovalsCount = pendingApprovals?.length || 0;

                        if (childPath === "/produk-rab/dashboard") {
                          childLabel = "Dashboard Produk & RAB"
                        } else if (childPath === "/produk-rab/kalkulator-harga") {
                          childLabel = "Kalkulator Harga"
                        } else if (childPath === "/produk-rab/panel-lantai-dinding") {
                          childLabel = "Panel Lantai & Dinding"
                        } else if (childPath === "/produk-rab/pagar-beton") {
                          childLabel = "Pagar Beton (soon)"
                        } else if (childPath === "/crm/dashboard") {
                          childLabel = "CRM Dashboard"
                        } else if (childPath === "/crm/input") {
                          childLabel = "Input Data"
                        } else if (childPath === "/crm/clients") {
                          childLabel = "Daftar Client"
                        } else if (childPath === "/documents/dashboard") {
                          childLabel = "Dashboard";
                        } else if (childPath === "/documents/review") {
                          childLabel = "Review";
                          badge = pendingReviews?.length ? <Badge count={pendingReviews.length} /> : null;
                        } else if (childPath === "/documents/revisi") {
                          childLabel = "Revisi";
                          badge = revisionMemos?.length ? <Badge count={revisionMemos.length} /> : null;
                        } else if (childPath === "/documents/approval") {
                          childLabel = "Approval";
                          badge = pendingApprovalsCount > 0 ? <Badge count={pendingApprovalsCount} /> : null;
                        } else if (childPath === "/master/panel") {
                          childLabel = "Data Panel"
                        } else if (childPath === "/master/ongkir") {
                          childLabel = "Data Ongkir"
                        } else if (childPath === "/documents/outgoing-letter") {
                          childLabel = "Surat Keluar"
                        } else if (childPath === "/supply-chain/dashboard") {
                          childLabel = "Dashboard Supply Chain"
                        } else if (childPath === "/supply-chain/pr") {
                          childLabel = "PR"
                        } else if (childPath === "/supply-chain/po") {
                          childLabel = "PO"
                        } else if (childPath === "/supply-chain/list-material") {
                          childLabel = "List Material"
                        } else if (childPath === "/documents/memo") {
                          childLabel = "Internal Memo"
                        } else if (childPath === "/documents/revisi") {
                          childLabel = "Revisi";
                        } else if (childPath === "/documents/review") {
                        } else if (childPath === "/meeting") {
                          childLabel = "List Meeting"
                        } else if (childPath === "/meeting/baru") {
                          childLabel = "Buat Meeting"
                        } else if (childPath === "/setting/workflow") {
                          childLabel = "Workflow Approval"
                        }

                        return (
                          <SidebarMenuSubItem key={childPath}>
                            <SidebarMenuSubButton 
                              asChild 
                              isActive={isChildActive}
                              className={isChildActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground" : ""}
                            >
                              <Link href={childPath} className="flex items-center justify-between w-full">
                                <span>{childLabel}</span>
                                {badge}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                className="data-[state=open]:bg-sidebar-accent py-2 h-auto cursor-pointer hover:bg-sidebar-accent"
                title={isCollapsed ? `${user.nama} - Klik untuk pengaturan` : undefined}
                onClick={handleProfileClick}
              >
                <User className="size-4 shrink-0" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user.nama}</span>
                      <CompactRoleBadge
                        role={user.role || 'user'}
                        departemen={user.departemen || undefined}
                      />
                    </div>
                    <Settings className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={isLoggingOut}
              title={isCollapsed ? "Keluar" : undefined}
            >
              {isLoggingOut ? (
                <div className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <LogOut className="size-4 shrink-0" />
              )}
              {!isCollapsed && <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    {/* Password Settings Modal - Rendered via Portal */}
    {mounted && showPasswordModal && createPortal(
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={(e) => {
          // Close modal when clicking on backdrop
          if (e.target === e.currentTarget) {
            setShowPasswordModal(false)
          }
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Pengaturan Password</h2>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Alert */}
            {passwordError && (
              <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passwordError}
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="current-password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Password Saat Ini
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="current-password"
                  name="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="new-password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Password Baru
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="new-password"
                  name="new-password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Konfirmasi Password Baru
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-900 font-medium mb-1">💡 Tips Password Aman:</p>
              <ul className="text-xs text-blue-800 space-y-0.5">
                <li>• Minimal 6 karakter</li>
                <li>• Kombinasikan huruf dan angka</li>
                <li>• Gunakan password yang unik</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg hover:shadow-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center gap-2"
              >
                {isUpdatingPassword ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Mengubah...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Ubah Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )}
    </>
  )
}
