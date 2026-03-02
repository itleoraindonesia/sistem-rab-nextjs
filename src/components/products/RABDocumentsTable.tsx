import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRABDocuments, type RABDocument } from '@/hooks/useRABDocuments';
import { useQueryClient } from '@tanstack/react-query';
import { rabDocumentKeys } from '@/hooks/useRABDocuments';
import { supabase } from '@/lib/supabase/client';
import { formatDateToWIB } from '@/lib/utils/dateUtils';
import { FileText, MapPin, ChevronRight, Loader2, Eye } from 'lucide-react';

interface RABDocumentsTableProps {
  searchTerm: string;
  filterStatus: string;
}

const ITEMS_PER_PAGE = 20;

export default function RABDocumentsTable({ searchTerm, filterStatus }: RABDocumentsTableProps) {
  const router = useRouter();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'project_name' | 'no_ref' | 'total'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  
  const isPageChangingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error, refetch, isFetching } = useRABDocuments({
    page,
    search: debouncedSearch,
    filterStatus,
    sortBy,
    sortOrder
  });

  const documents = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const prefetchPage = useCallback(async (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages) return;
    
    const queryKey = rabDocumentKeys.list({
      page: targetPage,
      search: debouncedSearch,
      filterStatus,
      sortBy,
      sortOrder
    });

    const cachedData = queryClient.getQueryData(queryKey);
    if (cachedData) return;

    const from = (targetPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        let query = supabase
          .from('rab_documents')
          .select('*', { count: 'exact' })
          .is('deleted_at', null);

        if (filterStatus) query = query.eq('status', filterStatus);
        
        if (debouncedSearch && debouncedSearch.trim() !== '') {
          const searchTerm = debouncedSearch.trim();
          query = query.or(`project_name.ilike.%${searchTerm}%,no_ref.ilike.%${searchTerm}%,location_kabupaten.ilike.%${searchTerm}%`);
        }

        query = query
          .order(sortBy, { ascending: sortOrder === 'asc' })
          .range(from, to);

        const { data: prefetchedData, error, count } = await query;

        if (error) throw new Error(error.message);

        return { 
          data: (prefetchedData as RABDocument[]) || [], 
          totalCount: count || 0,
          page: targetPage,
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
        };
      },
    });
  }, [queryClient, debouncedSearch, filterStatus, sortBy, sortOrder, totalPages]);

  const handleSort = (column: 'created_at' | 'project_name' | 'no_ref' | 'total') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (isPageChangingRef.current) return;
    
    isPageChangingRef.current = true;
    setPage(newPage);
    
    setTimeout(() => {
      isPageChangingRef.current = false;
    }, 300);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
      draft: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      sent: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      approved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    };
    
    const config = statusConfig[status || 'draft'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config?.bg || 'bg-gray-50'} ${config?.text || 'text-gray-700'} ${config?.border || 'border-gray-200'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'approved' ? 'bg-green-500' : status === 'sent' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
        {status || 'draft'}
      </span>
    );
  };

  if (error && (error as any).name !== 'AbortError') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 bg-white rounded-lg border border-gray-200">
        <div className="text-red-500">Error: {(error as Error).message}</div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isFetching ? 'Loading...' : 'Retry'}
        </button>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isLoading && (!data || documents.length === 0)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Tidak ada data dokumen</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>
            Menampilkan {documents.length} dari {totalCount} dokumen
          </span>
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Memperbarui...</span>
            </span>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500 w-12">No</th>
                <th 
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 group"
                  onClick={() => handleSort('no_ref')}
                >
                  <div className="flex items-center gap-1">
                    No Ref
                    {sortBy === 'no_ref' && (
                      <span className="text-xs text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 group"
                  onClick={() => handleSort('project_name')}
                >
                  <div className="flex items-center gap-1">
                    Nama Proyek
                    {sortBy === 'project_name' && (
                      <span className="text-xs text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Lokasi</th>
                <th 
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 group"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center gap-1">
                    Total
                    {sortBy === 'total' && (
                      <span className="text-xs text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th 
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 group"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Tanggal
                    {sortBy === 'created_at' && (
                      <span className="text-xs text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center p-4">
                      <p className="text-gray-400 mb-2">Belum ada data dokumen.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                      {((page - 1) * ITEMS_PER_PAGE) + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-xs text-gray-600">{doc.no_ref || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{doc.project_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-600">
                        {doc.client_profile?.nama || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate max-w-[120px]" title={doc.location_kabupaten || ''}>
                          {doc.location_kabupaten || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-medium text-gray-900">
                      {formatCurrency(doc.total)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {doc.created_at ? formatDateToWIB(doc.created_at) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/products/panel-lantai-dinding/${doc.id}`);
                          }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Desktop Pagination */}
      {totalPages > 1 && (
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            onMouseEnter={() => prefetchPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 shrink-0"
          >
            {isFetching && page > 1 ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>←</span>
            )}
            Sebelumnya
          </button>
          
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-600 font-medium">
              Halaman {page} dari {totalPages}
            </span>
            {isFetching && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary inline ml-2" />
            )}
          </div>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            onMouseEnter={() => prefetchPage(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 shrink-0"
          >
            Selanjutnya
            {isFetching && page < totalPages ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>→</span>
            )}
          </button>
        </div>
      )}

      {/* Mobile Card Layout */}
      <div className="md:hidden">
        <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
            Tidak ada data dokumen ditemukan
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm active:scale-[0.99] transition-transform relative"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{doc.project_name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <FileText className="w-3 h-3" />
                    {doc.no_ref || '-'}
                  </div>
                </div>
                {getStatusBadge(doc.status)}
              </div>

              <div className="flex justify-between items-end">
                <div className="text-xs text-gray-600">
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {doc.location_kabupaten || '-'}
                  </div>
                  <div className="font-medium text-primary mt-1">
                    {formatCurrency(doc.total)}
                  </div>
                </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/products/${doc.id}`)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
              </div>
            </div>
          ))
        )}
        </div>
        
        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {isFetching && page > 1 ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <span>←</span>
              )}
              Sebelumnya
            </button>
            
            <div className="flex items-center gap-1.5">
              {isFetching && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              )}
              <span className="text-xs text-gray-600 font-medium">
                {page} / {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              Selanjutnya
              {isFetching && page < totalPages ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <span>→</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
