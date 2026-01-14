"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Package, Home, LogOut, User, ClipboardCheck, CheckSquare, Users } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
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
} from "@/components/ui/sidebar"

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, children: [], allowedRoles: ["admin", "user", "guest"] },
  {
    name: "Dokumen RAB",
    path: "/rab",
    icon: FileText,
    children: [],
    activeColor: "green", // Warna untuk child routes
    allowedRoles: ["admin", "user", "guest"],
  },
  {
    name: "CRM",
    path: "/crm",
    icon: Users,
    children: ["/crm/input", "/crm/clients"],
    allowedRoles: ["admin", "user", "guest"],
  },
  {
    name: "Dokumen",
    path: "/dokumen",
    icon: FileText,
    children: [
      "/dokumen/surat-keluar",
      "/dokumen/memo",
      "/dokumen/mom",
    ],
    allowedRoles: ["admin", "user"], // Hidden from guest
  },
  {
    name: "Dokumen Perlu Tindakan",
    path: "/dokumen/perlu-tindakan",
    icon: ClipboardCheck,
    children: ["/dokumen/review", "/dokumen/approval"],
    badge: 5, // Total dari review (3) + approval (2)
    allowedRoles: ["admin", "user"], // Hidden from guest
  },
  {
    name: "Master Data",
    path: "/master",
    icon: Package,
    children: ["/master/panel", "/master/ongkir"], // Child route patterns
    allowedRoles: ["admin", "user"], // Hidden from guest
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Filter menu items based on user role
  const visibleNavItems = navItems.filter(item => {
    const userRole = user?.role || "user"
    return item.allowedRoles.includes(userRole)
  })

  // Helper function to check if current path is child of parent
  const isChildRoute = (item: (typeof navItems)[0]) => {
    if (!item.children || item.children.length === 0) return false

    // Special handling for RAB routes - simplified logic
    if (item.path === "/rab") {
      // If path starts with /rab/ but is not exactly /rab, it's a child route
      if (pathname.startsWith("/rab/") && pathname !== "/rab") {
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
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const { isActive, isChildActive } = getNavItemState(item)

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive} hasActiveChild={isChildActive}>
                    <Link href={item.path} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                  {item.children?.length ? (
                    <SidebarMenuSub>
                      {item.children.map((childPath) => {
                        const isChildActive = pathname === childPath || pathname.startsWith(`${childPath}/`)

                        // Custom labels for different menu types
                        let childLabel = "Buat RAB Baru"
                        
                        if (childPath === "/crm/input") {
                          childLabel = "Input Data"
                        } else if (childPath === "/crm/clients") {
                          childLabel = "Daftar Client"
                        } else if (childPath === "/dokumen/review") {
                          childLabel = "Review (3)"
                        } else if (childPath === "/dokumen/approval") {
                          childLabel = "Approval (2)"
                        } else if (childPath === "/master/panel") {
                          childLabel = "Data Panel"
                        } else if (childPath === "/master/ongkir") {
                          childLabel = "Data Ongkir"
                        } else if (childPath === "/dokumen/surat-keluar") {
                          childLabel = "Surat Keluar"
                        } else if (childPath === "/dokumen/memo") {
                          childLabel = "Internal Memo"
                        } else if (childPath === "/dokumen/mom") {
                          childLabel = "MoM Meeting"
                        }

                        return (
                          <SidebarMenuSubItem key={childPath}>
                            <SidebarMenuSubButton asChild isActive={isChildActive}>
                              <Link href={childPath}>
                                <span>{childLabel}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  ) : null}
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
              <SidebarMenuButton size="sm" className="data-[state=open]:bg-sidebar-accent">
                <User className="size-4" />
                <span>{user.username}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button onClick={logout}>
                <LogOut className="size-4" />
                <span>Keluar</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
