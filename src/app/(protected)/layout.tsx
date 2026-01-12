"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "../../components/layout/Header";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { useAuth } from "../../context/AuthContext";
import { FormProvider } from "../../context/FormContext";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    pathname === "/rab/baru" || pathname.startsWith("/rab/edit/");

  // Redirect if not authenticated - move to useEffect to avoid setState during render
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto'></div>
          <p className='mt-4 text-gray-600'>Memuat...</p>
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 pt-4 pb-8 p-4">
          <FormProvider onSubmittingChange={setIsSubmitting}>
            {children}
          </FormProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
