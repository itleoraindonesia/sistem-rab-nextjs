"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export default function PWALoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if we're in PWA mode
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isPWA) {
      // Show splash for minimum 2 seconds, maximum 5 seconds
      const minTimer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      const maxTimer = setTimeout(() => {
        setShowSplash(false);
      }, 5000);

      // Hide when app is ready
      const handleLoad = () => {
        setIsLoading(false);
        setTimeout(() => setShowSplash(false), 500);
      };

      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
      }

      return () => {
        clearTimeout(minTimer);
        clearTimeout(maxTimer);
        window.removeEventListener("load", handleLoad);
      };
    } else {
      // Not PWA, hide immediately
      setShowSplash(false);
    }
  }, []);

  if (!showSplash) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Background */}
      <div className='absolute inset-0 bg-white' />

      {/* Content */}
      <div className='relative z-10 flex flex-col items-center space-y-6'>
        {/* Logo */}
        <div className='relative'>
          <img
            src='/Logo-Leora-PNG.png'
            alt='Logo Leora'
            width={120}
            height={120}
            className='pointer-events-none select-none object-contain'
          />
        </div>

        {/* Loading indicator */}
        <div className='text-center'>
          <RefreshCw className='h-10 w-10 animate-spin text-brand-primary mx-auto' />
          <p className='mt-3 text-sm text-gray-500'>Memuat data...</p>
        </div>
      </div>
    </div>
  );
}
