import CRMDashboard from '@/components/crm/CRMDashboard';
import Link from 'next/link';

export default function CRMDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto lg:p-6">
        {/* Header & Actions */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">CRM Dashboard</h1>
            <p className="text-gray-600">Statistik dan overview data client & prospek</p>
          </div>

          <div className="flex gap-3 justify-between">
            <Link
              href="/crm/clients"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Lihat Semua Client
            </Link>
            <Link
              href="/crm/input"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium border border-transparent"
            >
              + Input Data Baru
            </Link>
          </div>
        </div>

        {/* Dashboard */}
        <CRMDashboard />
      </div>
    </div>
  );
}
