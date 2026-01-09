"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Package, Home, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, children: [] },
  {
    name: "Dokumen RAB",
    path: "/rab",
    icon: FileText,
    children: ["/rab/baru", "/rab/edit", "/rab/print"], // Child route patterns
    activeColor: "green", // Warna untuk child routes
  },
  { name: "Master Data", path: "/master", icon: Package, children: [] },
];

interface NavbarProps {
  isFormRoute?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  isFormValid?: boolean;
  isSubmitting?: boolean;
}

export default function Navbar({
  isFormRoute = false,
  onCancel,
  onSave,
  isFormValid = true,
  isSubmitting = false,
}: NavbarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Helper function to check if current path is child of parent
  const isChildRoute = (item: (typeof navItems)[0]) => {
    if (!item.children || item.children.length === 0) return false;

    // Special handling for RAB routes - simplified logic
    if (item.path === "/rab") {
      // If path starts with /rab/ but is not exactly /rab, it's a child route
      if (pathname.startsWith("/rab/") && pathname !== "/rab") {
        return true;
      }
    }

    // General child route checking for other menus
    return item.children.some((childPath) => {
      return pathname === childPath || pathname.startsWith(`${childPath}/`);
    });
  };

  // Get active state and color for nav item
  const getNavItemState = (item: (typeof navItems)[0]) => {
    const isExactActive = pathname === item.path;
    const isChildActive = isChildRoute(item);

    return {
      isActive: isExactActive || isChildActive,
      isChildActive,
      activeColor: item.activeColor,
    };
  };

  if (isMobile) {
    // Normal mobile navbar
    return (
      <nav
        className={`fixed bottom-0 left-0 right-0 bg-surface shadow-xl  md:hidden z-50 inset-shadow-xl border-t border-gray-200 bg-white ${
          isFormRoute ? "hidden" : ""
        }`}
      >
        <div className='grid grid-cols-3'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const { isActive, isChildActive, activeColor } =
              getNavItemState(item);

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex flex-col items-center justify-center py-3 px-2 text-xs ${
                  isActive
                    ? "text-brand-primary font-medium"
                    : "text-muted hover:text-secondary"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-brand-accent" : ""}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Desktop: sidebar kiri - Logo lebih kecil dan layout lebih rapi
  return (
    <aside className='hidden md:flex md:flex-col w-64 lg:w-72 xl:w-80 bg-surface border-r border-default min-h-screen sticky overflow-hidden'>
      <div className='p-4 pt-6'>
        {/* Logo yang lebih kecil */}
        <Link
          href='/'
          className='flex items-center gap-3 text-brand-primary font-bold mb-8 hover:opacity-90 transition'
        >
          <div className='w-12 h-12 rounded-lg flex items-center justify-center'>
            <Home size={20} className='text-brand-primary' />
            <Image src='/logo-only.png' width={100} height={100} alt='logo' />
          </div>
          <div>
            <h1 className='text-lg font-bold'>Sistem RAB Leora</h1>
            <p className='text-xs opacity-80'>Hitung Cepat & Akurat</p>
          </div>
        </Link>

        {/* Menu Navigasi */}
        <nav className='space-y-1'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const { isActive, isChildActive, activeColor } =
              getNavItemState(item);

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  isActive
                    ? "bg-brand-primary text-inverse text-white"
                    : "text-brand-primary hover:bg-surface-hover"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-inverse" : "text-muted"}
                />
                <span className='text-sm'>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Sidebar */}
      <div className='mt-auto p-4 border-t border-default'>
        {/* User Info */}
        {user && (
          <div className='text-xs text-muted mb-3'>
            <div className='font-medium'>Halo, {user.username}</div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className='flex items-center gap-2 w-full px-3 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors mb-3'
        >
          <LogOut size={14} />
          <span>Keluar</span>
        </button>

        {/* Status & Copyright */}
        <div className='text-xs text-subtle'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='w-2 h-2 bg-brand-accent rounded-full'></div>
            <span>Online</span>
          </div>
          <div>© 2025 Leora</div>
        </div>
      </div>
    </aside>
  );
}
