'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useLetters, letterKeys, type LettersFilters } from '@/hooks/useLetters';
import type { LetterWithRelations } from '@/lib/supabase/letters';
import { ChevronRight, Loader2, ExternalLink } from 'lucide-react';

interface OutgoingLettersTableProps {
  searchTerm: string;
  filterStatus: string;
  filterDocType: string;
}

const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG: Record<string, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  DRAFT: { label: 'Draft', bgClass: 'bg-gray-50', textClass: 'text-gray-700', dotClass: 'bg-gray-400' },
  SUBMITTED_TO_REVIEW: { label: 'Under Review', bgClass: 'bg-orange-50', textClass: 'text-orange-700', dotClass: 'bg-orange-500' },
  REVIEWED: { label: 'Reviewed', bgClass: 'bg-blue-50', textClass: 'text-blue-700', dotClass: 'bg-blue-500' },
  APPROVED: { label: 'Approved', bgClass: 'bg-green-50', textClass: 'text-green-700', dotClass: 'bg-green-500' },
  REJECTED: { label: 'Rejected', bgClass: 'bg-red-50', textClass: 'text-red-700', dotClass: 'bg-red-500' },
  REVISION_REQUESTED: { label: 'Needs Revision', bgClass: 'bg-yellow-50', textClass: 'text-yellow-700', dotClass: 'bg-yellow-500' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, bgClass: 'bg-gray-100', textClass: 'text-gray-800', dotClass: 'bg-gray-400' };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${config.bgClass} ${config.textClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}></span>
      {config.label}
    </span>
  );
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OutgoingLettersTable({ searchTerm, filterStatus, filterDocType }: OutgoingLettersTableProps) {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'letter_date' | 'document_number'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  
  const isPageChangingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm !== debouncedSearch) {
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filters: LettersFilters = {
    page,
    search: debouncedSearch,
    status: filterStatus || undefined,
    document_type_id: filterDocType ? parseInt(filterDocType) : undefined,
    sortBy,
    sortOrder,
    limit: ITEMS_PER_PAGE,
  };

  const { data, isLoading, error, refetch, isFetching } = useLetters(filters);

  const letters = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const prefetchPage = useCallback(async (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages) return;
    
    const queryKey = letterKeys.list({
      page: targetPage,
      search: debouncedSearch,
      status: filterStatus || undefined,
      document_type_id: filterDocType ? parseInt(filterDocType) : undefined,
      sortBy,
      sortOrder,
      limit: ITEMS_PER_PAGE,
    });

    const cachedData = queryClient.getQueryData(queryKey);
    if (cachedData) return;

    const from = (targetPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        let query = supabase
          .from('outgoing_letters')
          .select(`
            *,
            document_type:document_types(*),
            company:instansi(*),
            created_by:users!outgoing_letters_created_by_id_fkey(id, nama, email)
          `, { count: 'exact' });

        if (filterStatus) query = query.eq('status', filterStatus);
        if (filterDocType) query = query.eq('document_type_id', parseInt(filterDocType));
        if (debouncedSearch && debouncedSearch.trim() !== '') {
          const search = debouncedSearch.trim();
          query = query.or(`document_number.ilike.%${search}%,subject.ilike.%${search}%,recipient_company.ilike.%${search}%`);
        }

        query = query
          .order(sortBy, { ascending: sortOrder === 'asc' })
          .range(from, to);

        const { data: prefetchedData, error, count } = await query;
        if (error) throw new Error(error.message);

        return {
          data: (prefetchedData as LetterWithRelations[]) || [],
          totalCount: count || 0,
          page: targetPage,
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
        };
      },
    });
  }, [queryClient, debouncedSearch, filterStatus, filterDocType, sortBy, sortOrder, totalPages]);

  const handleSort = (column: 'created_at' | 'letter_date' | 'document_number') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
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
          {isFetching ? 'Memuat...' : 'Coba Lagi'}
        </button>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Memuat data surat...</div>
      </div>
    );
  }

  if (!isLoading && (!data || letters.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-gray-500">Tidak ada data surat keluar</div>
        {(searchTerm || filterStatus || filterDocType) && (
          <div className="text-sm text-gray-400 mt-1">Coba ubah filter pencarian</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>
            Menampilkan {letters.length} dari {totalCount} surat
          </span>
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Memperbarui...</span>
            </span>
          )}
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500 w-12">No</th>
                <th 
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('document_number')}
                >
                  <div className="flex items-center gap-1">
                    No Ref
                    {sortBy === 'document_number' && (
                      <span className="text-xs text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Instansi</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Kategori</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Perihal</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Penerima</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th 
                  className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('letter_date')}
                >
                  <div className="flex items-center gap-1">
                    Tanggal
                    {sortBy === 'letter_date' && (
                      <span className="text-xs text-gray-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {letters.map((letter, index) => (
                <tr
                  key={letter.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {((page - 1) * ITEMS_PER_PAGE) + index + 1}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {letter.document_number || <span className="text-gray-400 italic">Pending</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]" title={letter.company?.nama || '-'}>
                    {letter.company?.nama || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {letter.document_type?.name || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 truncate max-w-[200px]" title={letter.subject}>
                    {letter.subject}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm truncate max-w-[120px]" title={letter.recipient_company || '-'}>
                    {letter.recipient_company || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={letter.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(letter.letter_date)}
                  </td>
                  <td className="px-4 py-3">
                    <Link 
                      href={`/documents/outgoing-letter/${letter.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors"
                    >
                      Detail
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

      <div className="md:hidden">
        <div className="space-y-3">
          {letters.map((letter) => (
            <Link
              key={letter.id}
              href={`/documents/outgoing-letter/${letter.id}`}
              className="block bg-white p-3 rounded-lg border border-gray-200 shadow-sm active:scale-[0.99] transition-transform"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2 min-w-0">
                  <div className="font-mono text-xs text-gray-500">
                    {letter.document_number || <span className="italic">Pending</span>}
                  </div>
                  <div className="font-semibold text-gray-900 truncate mt-0.5">{letter.subject}</div>
                </div>
                <StatusBadge status={letter.status} />
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Instansi:</span>
                  <span className="truncate max-w-[150px]">{letter.company?.nama || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Penerima:</span>
                  <span className="truncate max-w-[150px]">{letter.recipient_company || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kategori:</span>
                  <span>{letter.document_type?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanggal:</span>
                  <span>{formatDate(letter.letter_date)}</span>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={(e) => { e.preventDefault(); handlePageChange(Math.max(1, page - 1)); }}
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
              onClick={(e) => { e.preventDefault(); handlePageChange(Math.min(totalPages, page + 1)); }}
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
