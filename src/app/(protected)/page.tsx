"use client";

import Link from "next/link";
import CommitRecap from "@/components/CommitRecap";
import { Calculator, UserPlus, Users, FileText, Folder, ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className=''>
      <div className='space-y-6'>
        {/* Header */}
        <div className='mb-4'>
          <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-600'>Selamat datang di Leora ERP</p>
        </div>

        {/* Akses Cepat */}
        <div>
          <h2 className='text-lg font-semibold text-gray-800 mb-3'>Akses Cepat</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Link 
            href='/products/kalkulator-harga' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-emerald-300 hover:shadow-md hover:ring-1 hover:ring-emerald-100 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl flex items-center justify-center border border-emerald-100/50 text-emerald-600 shadow-sm'>
                <Calculator className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors mb-1'>Kalkulator Harga</h3>
              <p className='text-sm text-gray-500'>Kalkulasi harga produk dan material</p>
            </div>
          </Link>
          
          <Link 
            href='/crm/input' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-blue-300 hover:shadow-md hover:ring-1 hover:ring-blue-100 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl flex items-center justify-center border border-blue-100/50 text-blue-600 shadow-sm'>
                <UserPlus className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-blue-700 transition-colors mb-1'>Input CRM</h3>
              <p className='text-sm text-gray-500'>Input data client dan prospek baru</p>
            </div>
          </Link>
          
          <Link 
            href='/crm/clients' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-indigo-300 hover:shadow-md hover:ring-1 hover:ring-indigo-100 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl flex items-center justify-center border border-indigo-100/50 text-indigo-600 shadow-sm'>
                <Users className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors mb-1'>Data Client</h3>
              <p className='text-sm text-gray-500'>Kelola data client dan prospek</p>
            </div>
          </Link>

          <Link 
            href='/meeting' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-violet-300 hover:shadow-md hover:ring-1 hover:ring-violet-100 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl flex items-center justify-center border border-violet-100/50 text-violet-600 shadow-sm'>
                <FileText className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-violet-700 transition-colors mb-1'>Minutes of Meeting</h3>
              <p className='text-sm text-gray-500'>Dokumentasi notulen rapat</p>
            </div>
          </Link>

          <Link 
            href='/files' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-orange-300 hover:shadow-md hover:ring-1 hover:ring-orange-100 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl flex items-center justify-center border border-orange-100/50 text-orange-600 shadow-sm'>
                <Folder className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-orange-700 transition-colors mb-1'>File Manager</h3>
              <p className='text-sm text-gray-500'>Kelola file dan dokumen</p>
            </div>
          </Link>
        </div>

        {/* Pembaruan Terbaru */}
        <div className='mt-8'>
          <CommitRecap />
        </div>
      </div>
      </div>
      </div>
  );
}
