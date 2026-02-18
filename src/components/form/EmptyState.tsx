"use client";

import { Package } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "Data Tidak Tersedia",
  description = "Tidak ada data panel yang tersedia saat ini.",
}: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        
        <p className="text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
}
