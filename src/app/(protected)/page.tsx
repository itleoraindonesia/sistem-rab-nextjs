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
          <h1 className='text-3xl font-bold text-brand-primary'>Dashboard</h1>
          <p className='text-gray-600 mt-1'>Selamat datang di Leora ERP</p>
        </div>

        {/* Akses Cepat */}
        <div>
          <h2 className='text-lg font-semibold text-gray-800 mb-3'>Akses Cepat</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Link 
            href='/products/kalkulator-harga' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-brand-primary/40 hover:shadow-md hover:ring-1 hover:ring-brand-primary/20 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-brand-primary shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300'>
                <Calculator className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-accent group-hover:text-brand-primary transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-brand-primary transition-colors mb-1'>Kalkulator Harga</h3>
              <p className='text-sm text-gray-500'>Kalkulasi harga produk dan material</p>
            </div>
          </Link>
          
          <Link 
            href='/crm/input' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-brand-primary/40 hover:shadow-md hover:ring-1 hover:ring-brand-primary/20 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-brand-primary shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300'>
                <UserPlus className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-accent group-hover:text-brand-primary transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-brand-primary transition-colors mb-1'>Input CRM</h3>
              <p className='text-sm text-gray-500'>Input data client dan prospek baru</p>
            </div>
          </Link>
          
          <Link 
            href='/crm/clients' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-brand-primary/40 hover:shadow-md hover:ring-1 hover:ring-brand-primary/20 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-brand-primary shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300'>
                <Users className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-accent group-hover:text-brand-primary transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-brand-primary transition-colors mb-1'>Data Client</h3>
              <p className='text-sm text-gray-500'>Kelola data client dan prospek</p>
            </div>
          </Link>

          <Link 
            href='/meeting' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-brand-primary/40 hover:shadow-md hover:ring-1 hover:ring-brand-primary/20 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-brand-primary shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300'>
                <FileText className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-accent group-hover:text-brand-primary transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-brand-primary transition-colors mb-1'>Minutes of Meeting</h3>
              <p className='text-sm text-gray-500'>Dokumentasi notulen rapat</p>
            </div>
          </Link>

          <Link 
            href='/files' 
            className='group flex flex-col p-5 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-brand-primary/40 hover:shadow-md hover:ring-1 hover:ring-brand-primary/20 transition-all duration-300'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-brand-primary shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300'>
                <Folder className='w-6 h-6' />
              </div>
              <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-accent group-hover:text-brand-primary transition-all shadow-sm'>
                <ArrowRight className='w-4 h-4' />
              </div>
            </div>
            <div>
              <h3 className='font-semibold text-lg text-gray-900 group-hover:text-brand-primary transition-colors mb-1'>File Manager</h3>
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
