"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "../../components/layout/Header";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { FormProvider } from "../../context/FormContext";
import { usePermissions } from "../../hooks/usePermissions";
import { Loader2 } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

// Note: Authentication is already checked in middleware (proxy.ts)
// No need to check again here to avoid double auth API calls

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canAccessMenu, isLoading } = usePermissions();

  // Auth check removed - handled by middleware for better performance
  // The middleware caches auth for 5 minutes, making navigation instant

  // Permission check - redirect if no access
  useEffect(() => {
    if (!isLoading && !canAccessMenu(pathname)) {
      router.push('/unauthorized');
    }
  }, [isLoading, canAccessMenu, pathname, router]);

  const handleCancel = () => {
    router.back();
  };

  // Show loading while checking permissions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Memeriksa izin akses...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 pt-4 lg:pt-6 pb-8 w-full xl:max-w-7xl mx-auto">
          <FormProvider onSubmittingChange={setIsSubmitting}>
            {children}
          </FormProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
