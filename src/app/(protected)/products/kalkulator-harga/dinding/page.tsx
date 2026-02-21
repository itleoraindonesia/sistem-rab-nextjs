"use client";

import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KalkulatorDindingPage() {
  return (
    <div className="min-h-screen bg-surface-secondary">
 <div >
        <Link 
          href="/products/kalkulator-harga" 
          className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Menu Kalkulator</span>
        </Link>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <Building2 className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kalkulator Dinding</h2>
            <p className="text-gray-600 mb-6">
              Perhitungan bata, batako, dan bata ringan.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-yellow-800 mb-2">Akan Hadir:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Bata merah</li>
                <li>• Batako</li>
                <li>• Bata ringan (hebel)</li>
                <li>• Kamprot/acian</li>
              </ul>
            </div>
            <Link 
              href="/products/kalkulator-harga"
              className="inline-block mt-6 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              Lihat Kalkulator Lainnya
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
