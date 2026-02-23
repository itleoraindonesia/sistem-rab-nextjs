"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon Container */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-brand-primary/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-brand-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileQuestion className="w-16 h-16 text-brand-primary drop-shadow-sm" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404</h1>
          <h2 className="text-xl font-semibold text-gray-800">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-500 leading-relaxed">
            Maaf, halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau memang tidak pernah ada di Leora ERP.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          
          <Link 
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary-dark focus:ring-4 focus:ring-brand-primary/30 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
