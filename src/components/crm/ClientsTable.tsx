'use client';

import { useState, useEffect } from 'react';
import { Client, supabase } from '@/lib/supabaseClient';
import { formatWhatsAppDisplay, formatDate, formatLuasan } from '@/lib/crm/formatters';
import { VALID_KEBUTUHAN } from '@/lib/crm/validators';

interface ClientsTableProps {
  onClientSelect?: (client: Client) => void;
}

export default function ClientsTable({ onClientSelect }: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKebutuhan, setFilterKebutuhan] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_at' | 'nama'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchClients();
  }, [sortBy, sortOrder]);

  const fetchClients = async () => {
    if (!supabase) {
      console.error('Supabase not configured');
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('clients')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: 'created_at' | 'nama') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        client.nama.toLowerCase().includes(search) ||
        client.whatsapp.includes(search) ||
        client.lokasi.toLowerCase().includes(search);
      
      if (!matchesSearch) return false;
    }

    // Kebutuhan filter
    if (filterKebutuhan && client.kebutuhan !== filterKebutuhan) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">🔍 Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nama, WA, atau Lokasi..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Kebutuhan */}
          <div>
            <label className="block text-sm font-medium mb-1">Kebutuhan</label>
            <select
              value={filterKebutuhan}
              onChange={(e) => setFilterKebutuhan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterKebutuhan('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Menampilkan {filteredClients.length} dari {clients.length} client
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nama')}
                >
                  Nama {sortBy === 'nama' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left">WhatsApp</th>
                <th className="px-4 py-3 text-left">Kebutuhan</th>
                <th className="px-4 py-3 text-left">Lokasi</th>
                <th className="px-4 py-3 text-left">Luasan</th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  Tanggal {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data client
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, index) => (
                  <tr
                    key={client.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onClientSelect?.(client)}
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{client.nama}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {formatWhatsAppDisplay(client.whatsapp)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {client.kebutuhan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{client.lokasi}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatLuasan(client.luasan, client.kebutuhan)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(client.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
