'use client';

import { useState } from 'react';
import ClientsTable from '@/components/crm/ClientsTable';
import EditClientModal from '@/components/crm/EditClientModal';
import ConnectionStatus from '@/components/crm/ConnectionStatus';
import Link from 'next/link';
import { Client } from '@/hooks/useClients';
import { useQueryClient } from '@tanstack/react-query';
import { VALID_KEBUTUHAN } from '@/lib/crm/validators';
import { useAllClients } from '@/hooks/useAllClients';
import { FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();
  
  const { refetch: fetchAllClients } = useAllClients();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKebutuhan, setFilterKebutuhan] = useState<string>('');

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['clients', 'stats'] });
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const result = await fetchAllClients();
      const clients = result.data || [];

      const exportData = clients.map((client: Client) => ({
        'Nama': client.nama || '-',
        'WhatsApp': client.whatsapp || '-',
        'Instagram': client.instagram_username || '-',
        'Kebutuhan': client.kebutuhan || '-',
        'Produk': client.produk || '-',
        'Kabupaten': client.kabupaten || '-',
        'Provinsi': client.provinsi || '-',
        'Luasan': client.luasan || '-',
        'Status': client.status || '-',
        'Tracking Source': client.tracking_source || '-',
        'Tanggal Input': client.created_at ? new Date(client.created_at).toLocaleDateString('id-ID') : '-',
        'Tanggal Update': client.updated_at ? new Date(client.updated_at).toLocaleDateString('id-ID') : '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

      const colWidths = [
        { wch: 25 }, { wch: 18 }, { wch: 20 }, { wch: 20 },
        { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 15 },
        { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }
      ];
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(
        workbook,
        `clients_export_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ConnectionStatus />
      <div className="max-w-7xl mx-auto md:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Daftar Client</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportToExcel}
              disabled={isExporting}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4" />
              {isExporting ? 'Mengexport...' : 'Export Excel'}
            </button>

            <Link
              href="/crm/input"
              className="w-full sm:w-auto text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium shadow-sm hover:shadow transition-all"
            >
              + Input Data Baru
            </Link>
          </div>
        </div>

        {/* Filters - Di parent, tidak akan re-render saat table loading */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search */}
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Cari Nama, WA, atau Lokasi..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filter Kebutuhan */}
            <div>
              <select
                value={filterKebutuhan}
                onChange={(e) => setFilterKebutuhan(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              >
                <option value="">Semua Kebutuhan</option>
                {VALID_KEBUTUHAN.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filter */}
          {(searchTerm || filterKebutuhan) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterKebutuhan('');
                }}
                className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                ✕ Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Table - Komponen terpisah, hanya menerima filter values */}
        <ClientsTable 
          onClientSelect={handleClientSelect}
          searchTerm={searchTerm}
          filterKebutuhan={filterKebutuhan}
        />

        {/* Edit Modal */}
        <EditClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          client={selectedClient}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
}
