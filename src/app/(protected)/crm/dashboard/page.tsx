import CRMDashboard from '@/components/crm/CRMDashboard';
import Link from 'next/link';

export default function CRMDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">CRM Dashboard</h1>
          <p className="text-gray-600">Statistik dan overview data client & prospek</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex gap-3">
          <Link
            href="/crm/input"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Input Data Baru
          </Link>
          <Link
            href="/crm/clients"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            📋 Lihat Semua Client
          </Link>
        </div>

        {/* Dashboard */}
        <CRMDashboard />
      </div>
    </div>
  );
}
