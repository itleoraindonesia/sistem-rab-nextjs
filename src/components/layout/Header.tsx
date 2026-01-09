"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className='sticky top-0 md:hidden bg-brand-primary text-white shadow-md z-50'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <Link href='/' className='flex items-center gap-3 md:hidden'>
            <div className='bg-brand-accent w-10 h-10 rounded-lg flex items-center justify-center'>
              <span className='font-bold text-brand-primary text-lg'>R</span>
            </div>
            <div>
              <h1 className='text-lg font-bold'>Sistem RAB</h1>
              <p className='text-xs opacity-80'>Hitung Cepat & Akurat</p>
            </div>
          </Link>

          <button
            onClick={logout}
            className='text-sm text-white/80 hover:text-white transition-colors md:hidden'
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
