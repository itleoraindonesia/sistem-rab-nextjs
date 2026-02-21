import BulkInputForm from '@/components/crm/BulkInputForm';
import Link from 'next/link';
import { supabase } from "@/lib/supabase/client";

export default function CRMInputPage() {
  return (
    <div className="min-h-screen bg-white">
 <div className=" md:">


        {/* Main Content */}
        <div className="mb-6">
          <BulkInputForm />
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2 text-sm">💡 Tips Input Cepat:</h3>
          <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
            <li><strong>Pilih sumber data</strong> (IG/WA) sebelum paste.</li>
            <li><strong>Format IG (7 kolom):</strong> Username, Nama, WA, Kebutuhan, Produk, Kabupaten, Luasan.</li>
            <li><strong>Format WA (6 kolom):</strong> Nama, WA, Kebutuhan, Produk, Kabupaten, Luasan.</li>
            <li><strong>Nomor HP / Kabupaten tidak ada?</strong> Gunakan tanda <code className="bg-gray-200 px-1 rounded">-</code> (minus) untuk kolom WA atau Kabupaten.</li>
            <li><strong>Copy-Paste</strong> langsung dari Excel/Sheets. Sistem auto-koreksi format WA & kapitalisasi.</li>
            <li><strong>Lokasi</strong> wajib nama Kabupaten/Kota valid. Sistem akan memberi saran jika typo.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
