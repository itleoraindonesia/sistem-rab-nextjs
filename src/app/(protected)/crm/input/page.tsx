import BulkInputForm from '@/components/crm/BulkInputForm';
import Link from 'next/link';

export default function CRMInputPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto md:p-6">


        {/* Main Content */}
        <div className="mb-6">
          <BulkInputForm />
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Pilih sumber data terlebih dahulu</strong> (Instagram atau WhatsApp)</li>
            <li>• <strong>Instagram:</strong> 7 kolom - Username, Nama, WA, Kebutuhan, Produk, Kabupaten, Luasan</li>
            <li>• <strong>WhatsApp:</strong> 6 kolom - Nama, WA, Kebutuhan, Produk, Kabupaten, Luasan</li>
            <li>• Copy-paste langsung dari Excel atau Google Sheets</li>
            <li>• Format WA otomatis dinormalisasi (08xxx → 628xxx)</li>
            <li>• Kebutuhan tidak case-sensitive (rumah = RUMAH = Rumah)</li>
            <li>• Lokasi harus berupa nama Kabupaten/Kota yang valid</li>
            <li>• Sistem akan memberikan saran jika kabupaten tidak ditemukan</li>
            <li>• Luasan boleh kosong (opsional)</li>
            <li>• <strong>Duplicate handling:</strong> Data Instagram dengan WA sama akan update data WhatsApp existing</li>
            <li>• Data dengan error akan di-skip otomatis saat save</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
