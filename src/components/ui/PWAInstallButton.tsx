"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface PWAInstallButtonProps {
  isCollapsed?: boolean;
}

export default function PWAInstallButton({ isCollapsed = false }: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Cek apakah PWA sudah di-install
    const isInstalled =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true);

    // Jika sudah di-install, tidak perlu setup listener
    if (isInstalled) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      setDeferredPrompt(null);
    }
  };

  // Tombol muncul hanya jika PWA bisa di-install (belum install dan browser mendukung)
  if (!deferredPrompt) return null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={handleInstall}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm"
        title={isCollapsed ? "Install Leora ERP di HP" : undefined}
      >
        <Download className="size-4 shrink-0" />
        {!isCollapsed && <span className="text-sm font-medium">Install Leora ERP di HP</span>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
