'use client';

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "../../components/layout/Header";
import Navbar from "../../components/layout/Navbar";
import PWAInstallBanner from "../../components/ui/PWAInstallBanner";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  // Responsive screen detection
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      setIsMobile(mobile);

      // Optional: Add body classes for responsive styling
      document.body.classList.toggle("mobile-view", mobile);
      document.body.classList.toggle("tablet-view", tablet);
      document.body.classList.toggle("desktop-view", window.innerWidth >= 1024);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Check if current route is form route
  const isFormRoute =
    pathname === "/rab/baru" ||
    pathname.startsWith("/rab/edit/");

  // Redirect if not authenticated - move to useEffect to avoid setState during render
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
    // This will be handled by form context
    console.log("Save action triggered");
  };

  // Update form validity
  const updateFormValidity = (isValid: boolean) => {
    setIsFormValid(isValid);
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-50 z-50'>
      {/* PWA Install Banner - Mobile Only */}
      <PWAInstallBanner />

      {/* Header Tetap di Atas */}
      <Header />

      {/* Kontainer Utama untuk Sidebar dan Konten */}
      <div className='flex flex-1 w-full'>
        {/* Sidebar untuk Desktop & Tablet - Responsive */}
        <aside className='hidden md:block md:w-64 lg:w-72 xl:w-80 bg-white border-r border-gray-200 sticky top-0 h-fit overflow-hidden'>
          <Navbar
            isFormRoute={isFormRoute}
            onCancel={handleCancel}
            onSave={handleSave}
            isFormValid={isFormValid}
          />
        </aside>

        {/* Konten Utama - Responsive Padding & Margin */}
        <main
          className={`
          flex-1
          w-full
          bg-gray-50
          pb-20
          md:p-4
          md:pb-6
          lg:p-6
          xl:p-8
          ${isMobile ? "overflow-x-auto" : ""}
        `}
        >
          {/* Responsive Container untuk Konten */}
          <div className='w-full'>
            {children}
          </div>
        </main>
      </div>

      {/* Navbar Bawah untuk Mobile - Responsive */}
      <div
        className={`
        ${isMobile ? "block" : "hidden"}
        fixed bottom-0 left-0 right-0 z-40
      `}
      >
        <Navbar
          isFormRoute={isFormRoute}
          onCancel={handleCancel}
          onSave={handleSave}
          isFormValid={isFormValid}
        />
      </div>

      {/* Safe Area untuk Mobile (mencegah konten tertutup navbar) */}
      {isMobile && !isFormRoute && <div className='h-16 md:hidden'></div>}
    </div>
  );
}
