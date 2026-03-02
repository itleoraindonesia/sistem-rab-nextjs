'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import ConnectionStatus from '@/components/crm/ConnectionStatus';
import RABDocumentsTable from '@/components/products/RABDocumentsTable';
import Button from '@/components/ui/Button';
import { useRABDocuments, RAB_DOCUMENT_STATUS } from '@/hooks/useRABDocuments';

export default function ListRAB() {
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data } = useRABDocuments({
    search: searchTerm,
    filterStatus,
  });

  const documents = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const exportData = documents.map((doc) => ({
        'No Ref': doc.no_ref || '-',
        'Proyek': doc.project_name,
        'Kabupaten': doc.location_kabupaten || '-',
        'Client': doc.client_profile?.nama || '-',
        'Total':
          doc.total !== null && doc.total !== undefined
            ? new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(doc.total)
            : '-',
        'Status': doc.status,
        'Tanggal': doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID') : '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dokumen RAB');

      XLSX.writeFile(
        workbook,
        `dokumen_rab_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const stats = {
    total: totalCount,
    draft: documents.filter(d => d.status === 'draft').length,
    sent: documents.filter(d => d.status === 'sent').length,
    approved: documents.filter(d => d.status === 'approved').length,
  };

  return (
    <div className="min-h-screen bg-white">
      <ConnectionStatus />
      <div className="md:">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">Panel Lantai & Dinding</h1>
            <p className='text-gray-600'>Kelola dokumen RAB panel lantai dan dinding</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={exportToExcel} disabled={isExporting}>
              <FileDown className="mr-2 h-4 w-4" />
              {isExporting ? 'Mengexport...' : 'Export Excel'}
            </Button>

            <Button onClick={() => router.push("/products/panel-lantai-dinding/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Baru
            </Button>
          </div>
        </div>

        {/* Statistik */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8'>
          {[
            {
              name: "Total Dokumen",
              value: stats.total,
              bgColor: "bg-blue-50",
              textColor: "text-blue-800",
              dotColor: "text-blue-500",
            },
            {
              name: "Draft",
              value: stats.draft,
              bgColor: "bg-yellow-50",
              textColor: "text-yellow-800",
              dotColor: "text-yellow-500",
            },
            {
              name: "Terkirim",
              value: stats.sent,
              bgColor: "bg-indigo-50",
              textColor: "text-indigo-800",
              dotColor: "text-indigo-500",
            },
            {
              name: "Disetujui",
              value: stats.approved,
              bgColor: "bg-green-50",
              textColor: "text-green-800",
              dotColor: "text-green-500",
            },
          ].map((stat) => (
            <div
              key={stat.name}
              className={`${stat.bgColor} rounded-lg shadow p-4 md:p-6 border border-gray-100`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p
                    className={`text-xs md:text-sm font-medium ${stat.textColor}`}
                  >
                    {stat.name}
                  </p>
                  <p className='text-xl md:text-2xl font-bold text-gray-900'>
                    {stat.value}
                  </p>
                </div>
                <div className={`text-sm font-medium ${stat.dotColor}`}>•</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Cari Nama Proyek, No Ref, atau Lokasi..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              >
                <option value="">Semua Status</option>
                {RAB_DOCUMENT_STATUS.map(st => (
                  <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || filterStatus) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                }}
                className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                ✕ Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <RABDocumentsTable 
          searchTerm={searchTerm}
          filterStatus={filterStatus}
        />
      </div>
    </div>
  );
}
