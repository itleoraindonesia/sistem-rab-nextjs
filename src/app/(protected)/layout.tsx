"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "../../components/layout/Header";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { FormProvider } from "../../context/FormContext";
import { supabase } from "../../lib/supabase/client";
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
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push(`/login?redirect=${pathname}`);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push(`/login?redirect=${pathname}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

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
