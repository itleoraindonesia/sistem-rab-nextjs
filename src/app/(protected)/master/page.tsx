'use client';

import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

export default function MasterData() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Check if user has admin access
  if (!isAdmin) {
    return (
      <div className='p-4 max-w-7xl mx-auto'>
        <div className='text-center py-20'>
          <div className='text-6xl mb-4'>🔒</div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Akses Terbatas
          </h1>
          <p className='text-gray-600'>
            Anda tidak memiliki akses ke halaman Master Data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='mb-4'>
          <h1 className='text-2xl font-bold text-brand-primary'>Master Data</h1>
          <p className='text-gray-600'>Kelola data panel dan ongkos kirim</p>
        </div>

        {/* Master Data Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          {/* Panel Card */}
          <Link
            href="/master/panel"
            className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow block border-2 border-transparent hover:border-brand-primary'
          >
            <div className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Data Panel</h3>
              <p className='text-gray-600 text-sm'>Kelola data panel dinding dan lantai untuk proyek konstruksi</p>
              <div className='mt-4 text-sm text-brand-primary font-medium'>Kelola Panel →</div>
            </div>
          </Link>

          {/* Ongkir Card */}
          <Link
            href="/master/ongkir"
            className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow block border-2 border-transparent hover:border-brand-primary'
          >
            <div className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Data Ongkos Kirim</h3>
              <p className='text-gray-600 text-sm'>Kelola biaya pengiriman berdasarkan provinsi tujuan</p>
              <div className='mt-4 text-sm text-brand-primary font-medium'>Kelola Ongkir →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
