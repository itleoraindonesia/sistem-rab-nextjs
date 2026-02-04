import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Client, supabase } from '@/lib/supabaseClient';
import { formatWhatsAppDisplay, formatDate, formatLuasan } from '@/lib/crm/formatters';
import { getFirstName } from '@/lib/utils/nameUtils';
import { MessageCircle, MapPin, ChevronRight } from 'lucide-react';

interface ClientsTableProps {
  onClientSelect?: (client: Client) => void;
  searchTerm: string;
  filterKebutuhan: string;
}

const ITEMS_PER_PAGE = 20;

export default function ClientsTable({ onClientSelect, searchTerm, filterKebutuhan }: ClientsTableProps) {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'nama'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    console.log('[ClientsTable] Search term changed:', searchTerm);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm !== debouncedSearch) {
        console.log('[ClientsTable] Resetting to page 1 due to search');
        setPage(1); 
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchClients = async ({ signal }: { signal: AbortSignal }) => {
    if (!supabase) throw new Error('Database connection unavailable');

    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      console.log(`[ClientsTable] Fetching page ${page} (range ${from}-${to})`);

      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });
        // .abortSignal(signal); // Temporarily removed to prevent premature aborts

      if (filterKebutuhan) query = query.eq('kebutuhan', filterKebutuhan);
      
      if (debouncedSearch && debouncedSearch.trim() !== '') {
         const searchTerm = debouncedSearch.trim();
         query = query.or(`nama.ilike.%${searchTerm}%,whatsapp.ilike.%${searchTerm}%,kabupaten.ilike.%${searchTerm}%`);
      }

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('AbortError')) {
           console.warn('[ClientsTable] Fetch aborted or incomplete');
        } else {
           console.error('[ClientsTable] Supabase error:', error);
        }
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`[ClientsTable] Fetched ${data?.length} rows for page ${page}`);
      return { data: (data as Client[]) || [], totalCount: count || 0 };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        console.log('[ClientsTable] Request aborted gracefully');
        throw error;
      }
      console.error('[ClientsTable] Unexpected error:', error);
      throw error;
    }
  };

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['clients', page, debouncedSearch, filterKebutuhan, sortBy, sortOrder],
    queryFn: fetchClients,
    placeholderData: (previousData) => previousData, // Keep showing old data while refetching
  });

  const clients = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Debug: Log query state
  console.log('[ClientsTable] Query State:', {
    hasData: !!data,
    isLoading,
    isFetching,
    clientsCount: clients.length,
    totalCount,
    queryKey: ['clients', page, debouncedSearch, filterKebutuhan, sortBy, sortOrder]
  });

  const handleSort = (column: 'created_at' | 'nama') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  if (error && (error as any).name !== 'AbortError') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 bg-white rounded-lg border border-gray-200">
        <div className="text-red-500">Error: {(error as Error).message}</div>
        <div className="text-sm text-gray-500">Pastikan koneksi internet Anda aktif dan coba lagi.</div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isFetching ? '🔄 Loading...' : '🔄 Retry'}
        </button>
      </div>
    );
  }

  // Show loading ONLY on initial load (no data at all)
  // If we have cached data, show it even while refetching
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // If no data after loading finished, show empty state
  if (!isLoading && (!data || clients.length === 0)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Tidak ada data client</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Count & Pagination Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Menampilkan {clients.length} dari {totalCount} client
          {isFetching && !isLoading && <span className="ml-2 text-primary animate-pulse">🔄 Memperbarui data...</span>}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 w-12">No</th>
                  <th 
                    className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 group"
                    onClick={() => handleSort('nama')}
                  >
                    <div className="flex items-center gap-1">
                      Nama Client
                      {sortBy === 'nama' && (
                        <span className="text-xs text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Lokasi</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Kebutuhan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Produk</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Luas/Keliling</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Kontak</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                       <div className="flex flex-col items-center justify-center p-4">
                          <p className="text-gray-400 mb-2">Belum ada data client yang sesuai filter.</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((client, index) => (
                    <tr
                      key={client.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => onClientSelect?.(client)}
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {((page - 1) * ITEMS_PER_PAGE) + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                           {/* Avatar Initials */}
                           <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                              {getFirstName(client.nama)[0]?.toUpperCase() || 'C'}
                           </div>
                           <div>
                              <div className="font-semibold text-gray-900">{client.nama}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                 {formatDate(client.created_at)}
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                         <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate max-w-[120px]" title={client.kabupaten || ''}>{client.kabupaten || '-'}</span>
                         </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {client.kebutuhan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate" title={client.produk || ''}>
                        {client.produk || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {formatLuasan(client.luasan, client.kebutuhan)}
                      </td>
                      <td className="px-4 py-3">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          client.status === 'Finish' || client.status === 'Invoice_Deal' ? 'bg-green-50 text-green-700 border-green-200' :
                          client.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          client.status === 'IG_Lead' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                           <span className={`h-1.5 w-1.5 rounded-full ${
                             client.status === 'Finish' || client.status === 'Invoice_Deal' ? 'bg-green-500' :
                             client.status === 'Cancelled' ? 'bg-red-500' :
                             client.status === 'IG_Lead' ? 'bg-blue-500' :
                             'bg-yellow-500'
                           }`}></span>
                          {client.status?.replace(/_/g, ' ') || 'New'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                         {client.whatsapp && client.whatsapp !== '-' ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://wa.me/${client.whatsapp?.replace(/^0/, '62').replace(/[^0-9]/g, '')}`, '_blank');
                              }}
                              className="h-8 w-8 flex items-center justify-center rounded-full text-green-600 hover:bg-green-50 transition-colors border border-transparent hover:border-green-200"
                              title="Chat WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden relative">
        <div className="space-y-3">
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
                  {client.whatsapp && client.whatsapp !== '-' ? (
                    <a 
                      href={`https://wa.me/${client.whatsapp?.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  ) : (
                    <div 
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed"
                      title="Nomor WhatsApp tidak tersedia"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 border border-gray-200">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

       {/* Pagination Controls */}
       {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Sebelumnya
          </button>
          
          <span className="text-sm text-gray-600 font-medium">
            Halaman {page} dari {totalPages}
          </span>

          <button
            onClick={() => {
               console.log('[ClientsTable] Next Page Clicked. Current:', page, 'Total:', totalPages);
               setPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={page >= totalPages || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}
