import BulkInputForm from '@/components/crm/BulkInputForm';
import Link from 'next/link';

export default function CRMInputPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex gap-2 text-sm text-gray-600">
            <Link href="/crm" className="hover:text-blue-600">
              CRM
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Input Data</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <BulkInputForm />
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Copy-paste langsung dari Excel atau Google Sheets</li>
            <li>• Format: <strong>Nama, WA, Kebutuhan, Kabupaten/Kota, Luasan</strong></li>
            <li>• Provinsi akan otomatis terisi dari database berdasarkan Kabupaten</li>
            <li>• Format WA otomatis dinormalisasi (08xxx → 628xxx)</li>
            <li>• Kebutuhan tidak case-sensitive (rumah = RUMAH = Rumah)</li>
            <li>• Luasan boleh kosong (opsional)</li>
            <li>• Data dengan error akan di-skip otomatis saat save</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
