'use client';

import { useState, useEffect } from 'react';
import { Client, supabase } from '@/lib/supabaseClient';
import { formatWhatsAppDisplay, formatDate, formatLuasan } from '@/lib/crm/formatters';
import { VALID_KEBUTUHAN } from '@/lib/crm/validators';
import { MessageCircle, MapPin, ChevronRight } from 'lucide-react';

interface ClientsTableProps {
  onClientSelect?: (client: Client) => void;
}

  const ITEMS_PER_PAGE = 20;

  export default function ClientsTable({ onClientSelect }: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterKebutuhan, setFilterKebutuhan] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_at' | 'nama'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [retryCount, setRetryCount] = useState(0);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filterKebutuhan]);

  useEffect(() => {
    fetchClients();
  }, [page, debouncedSearch, filterKebutuhan, sortBy, sortOrder, retryCount]);

  // Auto-refresh when page becomes visible after being hidden for a while
  useEffect(() => {
    let lastHiddenTime: number | null = null;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Track when page was hidden
        lastHiddenTime = Date.now();
      } else if (document.visibilityState === 'visible') {
        // Only refresh if page was hidden for more than 5 minutes
        const hiddenDuration = lastHiddenTime ? Date.now() - lastHiddenTime : 0;
        const FIVE_MINUTES = 5 * 60 * 1000;
        
        if (hiddenDuration > FIVE_MINUTES && !loading) {
          console.log('ClientsTable: Page was hidden for', Math.round(hiddenDuration / 1000), 'seconds, refreshing data...');
          setRetryCount(prev => prev + 1);
        }
        lastHiddenTime = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading]);

  const fetchClients = async () => {
    console.log('ClientsTable: Starting fetchClients...');
    setLoading(true);
    setError(null);
    
    if (!supabase) {
      console.error('ClientsTable: Supabase not configured');
      setError('Database connection unavailable');
      setLoading(false);
      return;
    }

    try {
      // Calculate range
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      console.log('ClientsTable: Building query...');
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });

      // Apply Filter
      if (filterKebutuhan) {
        query = query.eq('kebutuhan', filterKebutuhan);
      }

      // Apply Search
      if (debouncedSearch) {
        // Search across multiple columns using 'or'
        query = query.or(`nama.ilike.%${debouncedSearch}%,whatsapp.ilike.%${debouncedSearch}%,kabupaten.ilike.%${debouncedSearch}%`);
      }

      // Apply Sorting & Pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to);

      // Create timeout promise (increased to 30 seconds for debugging)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 30 seconds - check Supabase connection')), 30000);
      });

      console.log('ClientsTable: Executing query...');
      const result = await Promise.race([
        query,
        timeoutPromise
      ]) as any;

      const { data, error, count } = result;

      console.log('ClientsTable: Query result:', { 
        dataCount: data?.length || 0, 
        totalCount: count,
        error: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null 
      });

      if (error) {
        console.error('ClientsTable: Query error:', error);
        throw error;
      }

      setClients(data || []);
      setTotalCount(count || 0);
      console.log('ClientsTable: Data updated successfully');
    } catch (error) {
      console.error('ClientsTable: Error fetching clients:', error);
      setError(error instanceof Error ? error.message : 'Failed to load clients');
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
    setPage(1); // Reset to page 1 on sort change
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 bg-white rounded-lg border border-gray-200">
        <div className="text-red-500">Error: {error}</div>
        <button 
          onClick={() => setRetryCount(prev => prev + 1)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  if (loading && page === 1 && clients.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
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

      {/* Results Count & Pagination Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Menampilkan {clients.length} dari {totalCount} client
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">No</th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('nama')}
                  >
                    Nama {sortBy === 'nama' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left">Kabupaten</th>
                  <th className="px-4 py-3 text-left">Kebutuhan</th>
                  <th className="px-4 py-3 text-left">Produk</th>
                  <th className="px-4 py-3 text-left">Luasan/Keliling</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data client
                    </td>
                  </tr>
                ) : (
                  clients.map((client, index) => (
                    <tr
                      key={client.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onClientSelect?.(client)}
                    >
                      <td className="px-4 py-3 text-gray-500">{((page - 1) * ITEMS_PER_PAGE) + index + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        <div>{client.nama}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{formatWhatsAppDisplay(client.whatsapp)}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{client.kabupaten}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {client.kebutuhan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {client.produk || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatLuasan(client.luasan, client.kebutuhan)}
                      </td>
                      <td className="px-4 py-3">
                         <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${
                          client.status === 'Finish' || client.status === 'Invoice_Deal' ? 'bg-green-100 text-green-800 border-green-200' :
                          client.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                          client.status === 'IG_Lead' ? 'bg-primary/10 text-primary border-primary/20' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {client.status?.replace(/_/g, ' ') || 'New Lead'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {clients.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
            Tidak ada data client ditemukan
          </div>
        ) : (
          clients.map((client) => (
            <div 
              key={client.id}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm active:scale-[0.99] transition-transform relative"
              onClick={() => onClientSelect?.(client)}
            >
              {/* Header: Name and Status */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{client.nama}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3" />
                    {client.kabupaten || 'Lokasi tidak ada'}
                  </div>
                </div>
                <span className={`shrink-0 inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                  client.status === 'Finish' || client.status === 'Invoice_Deal' ? 'bg-green-100 text-green-800 border-green-200' :
                  client.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                  client.status === 'IG_Lead' ? 'bg-primary/10 text-primary border-primary/20' :
                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {client.status?.replace(/_/g, ' ') || 'New'}
                </span>
              </div>

              {/* Body: Product Info */}
              <div className="flex justify-between items-end">
                <div className="text-xs text-gray-600">
                  <div className="font-medium text-primary mb-0.5">{client.kebutuhan}</div>
                  <div className="truncate max-w-[180px]">{client.produk || '-'}</div>
                  <div className="text-gray-400 mt-0.5">{formatLuasan(client.luasan, client.kebutuhan)}</div>
                </div>

                 {/* Actions */}
                <div className="flex gap-2">
                  <a 
                    href={`https://wa.me/${client.whatsapp?.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 border border-gray-200">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

       {/* Pagination Controls */}
       {totalCount > 0 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          
          <span className="text-sm text-gray-600">
            Halaman {page} dari {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
