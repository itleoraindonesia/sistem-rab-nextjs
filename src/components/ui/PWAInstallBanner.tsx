'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if already installed or dismissed
    const isDismissed = localStorage.getItem('pwa-banner-dismissed') === 'true';
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    if (!isDismissed && !isInstalled && isMobile) {
      // Listen for install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Show banner after a delay if no prompt event
      const timer = setTimeout(() => {
        if (!deferredPrompt && !isDismissed && !isInstalled && isMobile) {
          setShowBanner(true);
        }
      }, 3000);

      return () => {
        window.removeEventListener('resize', checkMobile);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [deferredPrompt, isMobile]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleLater = () => {
    setShowBanner(false);
    // Will show again on next visit
  };

  if (!showBanner || !isMobile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg animate-slide-down">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              Install Aplikasi Sistem RAB
            </p>
            <p className="text-xs opacity-90">
              Untuk pengalaman terbaik di perangkat Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button
            onClick={handleLater}
            className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-md transition-colors"
          >
            Nanti
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1 text-xs bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}