"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FileText, Package, Home, LogOut, User, ClipboardCheck, CheckSquare, Users, Truck, ChevronDown, ChevronRight, Calendar } from "lucide-react"
import { supabase } from "../../lib/supabase/client"
import type { User as SupabaseUser } from "../../types/database"
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
  useSidebar,
} from "@/components/ui/sidebar"

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, children: [] },
  {
    name: "Administrasi",
    path: "/dokumen",
    icon: FileText,
    children: [
      "/dokumen/dashboard",
      "/dokumen/surat-keluar",
      "/dokumen/memo",
      "/dokumen/review",
      "/dokumen/approval",
    ],
  },
  {
    name: "Produk & RAB",
    path: "/produk-rab",
    icon: Package,
    children: ["/produk-rab/dashboard", "/produk-rab/panel-lantai-dinding", "/produk-rab/pagar-beton"],
    activeColor: "green", // Warna untuk child routes
  },
  {
    name: "Marketing",
    path: "/crm",
    icon: Users,
    children: ["/crm/dashboard", "/crm/input", "/crm/clients"],
  },
  {
    name: "Supply Chain (soon)",
    path: "/supply-chain",
    icon: Truck,
    children: [
      "/supply-chain/dashboard",
      "/supply-chain/pr",
      "/supply-chain/po",
      "/supply-chain/list-material"
    ],
  },
  {
    name: "Meeting",
    path: "/meeting",
    icon: Calendar,
    children: [
      "/meeting/baru",
      "/meeting/mom"
    ],
  },
  {
    name: "Master Data",
    path: "/master",
    icon: Package,
    children: ["/master/panel", "/master/ongkir"], // Child route patterns
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { state: sidebarState } = useSidebar()
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null)
  const [user, setUser] = React.useState<SupabaseUser | null>(null)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  
  const isCollapsed = sidebarState === "collapsed"

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

  // Logout function
  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

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
      window.location.href = itemPath
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
  }, [pathname])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sistem RAB Leora</span>
                  <span className="truncate text-xs">Hitung Cepat & Akurat</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigasi</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon
              const { isActive, isChildActive } = getNavItemState(item)
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedCategory === item.name

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
                      {hasChildren && !isCollapsed && (
                        <div className="ml-auto">
                          {isExpanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </SidebarMenuButton>
                  {hasChildren && isExpanded && (
                    <SidebarMenuSub>
                      {item.children.map((childPath) => {
                        const isChildActive = pathname === childPath || pathname.startsWith(`${childPath}/`)

                        // Custom labels for different menu types
                        let childLabel = "Buat RAB Baru"
                        let badgeNumber = 0

                        if (childPath === "/produk-rab/dashboard") {
                          childLabel = "Dashboard Produk & RAB"
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
                        } else if (childPath === "/dokumen/dashboard") {
                          childLabel = "Dashboard Administrasi"
                        } else if (childPath === "/dokumen/review") {
                          childLabel = "Review"
                          badgeNumber = 3
                        } else if (childPath === "/dokumen/approval") {
                          childLabel = "Approval"
                          badgeNumber = 2
                        } else if (childPath === "/master/panel") {
                          childLabel = "Data Panel"
                        } else if (childPath === "/master/ongkir") {
                          childLabel = "Data Ongkir"
                        } else if (childPath === "/dokumen/surat-keluar") {
                          childLabel = "Surat Keluar"
                        } else if (childPath === "/supply-chain/dashboard") {
                          childLabel = "Dashboard Supply Chain"
                        } else if (childPath === "/supply-chain/pr") {
                          childLabel = "PR"
                        } else if (childPath === "/supply-chain/po") {
                          childLabel = "PO"
                        } else if (childPath === "/supply-chain/list-material") {
                          childLabel = "List Material"
                        } else if (childPath === "/dokumen/memo") {
                          childLabel = "Internal Memo"
                        } else if (childPath === "/meeting/mom") {
                          childLabel = "MoM Meeting"
                        } else if (childPath === "/meeting/baru") {
                          childLabel = "Buat Meeting"
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
                                {badgeNumber > 0 && (
                                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2">
                                    {badgeNumber}
                                  </span>
                                )}
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
      <SidebarFooter>
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                className="data-[state=open]:bg-sidebar-accent"
                title={isCollapsed ? user.nama : undefined}
              >
                <User className="size-4 shrink-0" />
                {!isCollapsed && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user.nama}</span>
                    <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              title={isCollapsed ? "Keluar" : undefined}
            >
              <button onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? (
                  <div className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <LogOut className="size-4 shrink-0" />
                )}
                {!isCollapsed && <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
