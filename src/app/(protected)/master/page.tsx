"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase/client";

export default function MasterData() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setIsAdmin(userData?.role === 'admin');
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
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
