import ClientsTable from '@/components/crm/ClientsTable';
import Link from 'next/link';

export default function ClientsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <nav className="flex gap-2 text-sm text-gray-600 mb-2">
              <Link href="/crm" className="hover:text-blue-600">
                CRM
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Daftar Client</span>
            </nav>
            <h1 className="text-3xl font-bold">Daftar Client</h1>
          </div>

          <Link
            href="/crm/input"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Input Data Baru
          </Link>
        </div>

        {/* Table */}
        <ClientsTable />
      </div>
    </div>
  );
}
