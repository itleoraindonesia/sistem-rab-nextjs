'use client';

import { useState, useEffect } from 'react';
import ClientsTable from '@/components/crm/ClientsTable';
import EditClientModal from '@/components/crm/EditClientModal';
import ConnectionStatus from '@/components/crm/ConnectionStatus';
import Link from 'next/link';
import { Client } from '@/hooks/useClients';
import { useQueryClient } from '@tanstack/react-query';
import { VALID_KEBUTUHAN } from '@/lib/crm/validators';

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Filter states - di parent component
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

  return (
    <div className="min-h-screen bg-white">
      <ConnectionStatus />
      <div className="max-w-7xl mx-auto md:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Daftar Client</h1>
          </div>

          <Link
            href="/crm/input"
            className="w-full sm:w-auto text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium shadow-sm hover:shadow transition-all"
          >
            + Input Data Baru
          </Link>
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
