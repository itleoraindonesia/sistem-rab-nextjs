'use client';

import { HardHat } from 'lucide-react';

export default function KonstruksiPage() {
  return (
    <div className="min-h-screen bg-white">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">Konstruksi</h1>
            <p className="text-gray-600">Manajemen dan overview data konstruksi</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HardHat className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Halaman Konstruksi</h2>
            <p className="text-gray-500">Fitur dalam pengembangan</p>
          </div>
        </div>
      </div>
    </div>
  );
}