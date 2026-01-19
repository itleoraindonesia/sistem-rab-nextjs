"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className=''>
      <div className='space-y-6'>
        {/* Header */}
        <div className='mb-4'>
          <h1 className='text-2xl font-bold text-brand-primary'>Dashboard</h1>
          <p className='text-gray-600'>Selamat datang di Sistem RAB Leora</p>
        </div>

        {/* Quick Links */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Link href='/produk-rab/panel-lantai-dinding' className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition'>
            <h3 className='font-semibold text-lg mb-2'>Panel Lantai & Dinding</h3>
            <p className='text-sm text-gray-600'>Kelola dokumen RAB panel lantai dan dinding</p>
          </Link>
          
          <Link href='/crm' className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition'>
            <h3 className='font-semibold text-lg mb-2'>Marketing</h3>
            <p className='text-sm text-gray-600'>Kelola data client dan prospek</p>
          </Link>
          
          <Link href='/dokumen' className='bg-white rounded-lg shadow p-6 hover:shadow-lg transition'>
            <h3 className='font-semibold text-lg mb-2'>Administrasi</h3>
            <p className='text-sm text-gray-600'>Kelola dokumen perusahaan</p>
          </Link>
        </div>

        {/* Tips Cepat */}
        <div className='mt-8 grid grid-cols-1 gap-6'>
          <div className='bg-brand-primary text-white rounded-lg p-6'>
            <h3 className='font-bold text-lg mb-2'>💡 Tips Sistem RAB Leora</h3>
            <ul className='space-y-2 text-sm opacity-90'>
              <li>• Gunakan status 'Draft' untuk simpan sementara</li>
              <li>
                • Ubah ke 'Terkirim' ketika dokumen telah akan diprint dan
                dikirimkan ke klien. Harga akan terkunci jika sudah terkirim.
              </li>
              <li>
                • Jika sudah disetujui klien, maka ubah dokumen ke "Disetujui"
                maka dokumen sudah terkunci.
              </li>
              <li>• Export Excel untuk analisis lanjutan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
