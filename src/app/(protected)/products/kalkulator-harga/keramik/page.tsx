"use client";

import { Grid3X3, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KalkulatorKeramikPage() {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-6">
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
              <Grid3X3 className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kalkulator Keramik</h2>
            <p className="text-gray-600 mb-6">
              Hitung kebutuhan keramik lantai dan dinding.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-yellow-800 mb-2">Akan Hadir:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Kebutuhan lantai</li>
                <li>• Kebutuhan dinding</li>
                <li>• Pemotongan/waste</li>
                <li>• Adhesive/perekat</li>
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
