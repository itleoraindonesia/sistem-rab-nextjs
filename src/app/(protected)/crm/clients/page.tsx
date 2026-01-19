'use client';

import { useState } from 'react';
import ClientsTable from '@/components/crm/ClientsTable';
import EditClientModal from '@/components/crm/EditClientModal';
import Link from 'next/link';
import { Client } from '@/lib/supabaseClient';

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleEditSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger table refresh
  };

  return (
    <div className="min-h-screen bg-white">
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

        {/* Table */}
        <ClientsTable 
          key={refreshKey} 
          onClientSelect={handleClientSelect} 
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
