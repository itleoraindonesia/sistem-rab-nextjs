"use client";

import { Truck } from "lucide-react";

export default function PagarBetonPage() {
  return (
 <div className=' '>
      <div className='space-y-6'>
        {/* Header */}
        <div className='mb-4'>
          <h1 className='text-2xl font-bold text-brand-primary'>Pagar Beton</h1>
          <p className='text-gray-600'>Produk pagar beton precast</p>
        </div>

        {/* Coming Soon Card */}
        <div className='bg-white rounded-lg shadow p-8'>
          <div className='flex flex-col items-center justify-center text-center py-12'>
            <div className='bg-blue-50 p-6 rounded-full mb-6'>
              <Truck className='w-16 h-16 text-blue-600' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-3'>
              Produk Pagar Beton Segera Hadir
            </h2>
            <p className='text-gray-600 max-w-md'>
              Fitur untuk produk pagar beton sedang dalam pengembangan dan akan segera tersedia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
