"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 transition-opacity duration-500 ${
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200' />

      {/* Content */}
      <div className='relative z-10 flex flex-col items-center space-y-6'>
        {/* Logo */}
        <div className='relative'>
          <Link href="/">
            <img
              src='/Logo-Leora-PNG.png'
              alt='Logo Leora'
              width={120}
              height={120}
              className='pointer-events-none select-none object-contain'
            />
          </Link>
        </div>

        {/* Text */}
        <div className='text-center space-y-2'>
          <h1 className='text-2xl font-bold text-brand-primary tracking-wide'>
            Leora ERP
          </h1>
        </div>

        {/* Loading indicator */}
        <div className='flex space-x-1'>
          <div className='w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]' />
          <div className='w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]' />
          <div className='w-2 h-2 bg-slate-400 rounded-full animate-bounce' />
        </div>
      </div>
    </div>
  );
}
