"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/layout/Header";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { FormProvider } from "../../context/FormContext";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth check removed - handled by middleware for better performance
  // The middleware caches auth for 5 minutes, making navigation instant

  const handleCancel = () => {
    router.back();
  };

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
