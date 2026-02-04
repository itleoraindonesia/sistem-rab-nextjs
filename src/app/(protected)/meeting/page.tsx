"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, FileDown, Loader2, Search, MapPin, Calendar, Clock, ChevronRight, MoreHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui"
import Button from "@/components/ui/Button"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"

const ITEMS_PER_PAGE = 10;

export default function MoMPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMeetings = async ({ signal }: { signal: AbortSignal }) => {
    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      console.log(`[MeetingPage] Fetching page ${page} (range ${from}-${to})`);

      let query = supabase
        .from('mom_meetings')
        .select(`
          *,
          users!mom_meetings_created_by_fkey (
            nama
          )
          )
        `, { count: 'exact' })
        // .abortSignal(signal); // Temporarily removed to prevent premature aborts

      if (filterType) query = query.eq('meeting_type', filterType);
      
      if (debouncedSearch && debouncedSearch.trim() !== '') {
          const term = debouncedSearch.trim();
          query = query.or(`title.ilike.%${term}%,meeting_number.ilike.%${term}%`);
      }

      const { data, error, count } = await query
        .order('meeting_date', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      console.log(`[MeetingPage] Fetched ${data?.length} rows for page ${page}`);
      return { data: data || [], totalCount: count || 0 };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        console.log('[MeetingPage] Request aborted gracefully');
        throw error;
      }
      console.error('[MeetingPage] Unexpected error:', error);
      throw error;
    }
  }

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['mom-meetings', page, debouncedSearch, filterType],
    queryFn: fetchMeetings,
    placeholderData: (previousData: any) => previousData, // Prevent flickering
  })

  const meetings = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (error && (error as any).name !== 'AbortError') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Error loading meetings: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto md:p-6">
      <div className="space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">Minutes of Meeting (MoM)</h1>
            <p className="text-gray-600">Dokumentasi notulen rapat internal dan eksternal</p>
          </div>

          <div className="flex gap-3">
             <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Link href="/meeting/baru">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat MoM Baru
                </Button>
              </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Cari Judul atau No Meeting..."
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Filter Type */}
            <div>
                <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                <option value="">Semua Tipe Meeting</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
                </select>
            </div>
            </div>
            
             {/* Reset Filter */}
            {(searchTerm || filterType) && (
            <div className="flex justify-end">
                <button
                onClick={() => {
                    setSearchTerm('');
                    setFilterType('');
                }}
                className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
                >
                ✕ Reset Filter
                </button>
            </div>
            )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center text-sm text-gray-600">
             <div>
                Menampilkan {meetings.length} dari {totalCount} meeting
                {isFetching && !isLoading && <span className="ml-2 text-primary">🔄 Memperbarui...</span>}
            </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">No/Judul</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Waktu & Lokasi</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Tipe</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Peserta</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Pembuat</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && page === 1 && meetings.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                <div className="flex justify-center items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading data...
                                </div>
                            </td>
                        </tr>
                    ) : meetings.length === 0 ? (
                         <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                Belum ada meeting yang sesuai filter.
                            </td>
                        </tr>
                    ) : (
                        meetings.map((mom: any) => (
                         <tr key={mom.id} className="border-b border-gray-100 hover:bg-gray-50 group transition-colors">
                            <td className="px-4 py-3">
                                <div className="font-semibold text-gray-900">{mom.title}</div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">{mom.meeting_number || '-'}</div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-gray-700">
                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                    <span>{new Date(mom.meeting_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                    <span>
                                        {new Date(mom.meeting_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </td>
                             <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                                    mom.meeting_type === 'internal' 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                {mom.meeting_type === 'internal' ? 'Internal' : 'External'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {/* Mock avatars for participants count */}
                                    {Array.isArray(mom.participants) && mom.participants.slice(0, 3).map((_: any, i: number) => (
                                        <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            {typeof _ === 'string' ? _[0].toUpperCase() : 'U'}
                                        </div>
                                    ))}
                                    {Array.isArray(mom.participants) && mom.participants.length > 3 && (
                                         <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600">
                                            +{mom.participants.length - 3}
                                        </div>
                                    )}
                                </div>
                                {(!mom.participants || mom.participants.length === 0) && <span className="text-gray-400 text-xs">-</span>}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    mom.status === 'published' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${mom.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                    {mom.status === 'published' ? 'Published' : 'Draft'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                 {mom.users?.nama?.split(' ')[0] || 'System'}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Link href={`/meeting/${mom.id}`}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </Link>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
            {isLoading && page === 1 && meetings.length === 0 ? (
                 <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500 flex flex-col items-center">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span>Loading data...</span>
                </div>
            ) : meetings.length === 0 ? (
                <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
                    Tidak ada meeting yang ditemukan
                </div>
            ) : (
                meetings.map((mom: any) => (
                    <div 
                        key={mom.id} 
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-brand-primary/50 transition-colors relative"
                    >
                        {/* Header Row: Status & Type */}
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                                    mom.status === 'published' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${mom.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                    {mom.status === 'published' ? 'PUB' : 'DFT'}
                                </span>
                                 <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${
                                    mom.meeting_type === 'internal' 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                {mom.meeting_type === 'internal' ? 'INT' : 'EXT'}
                                </span>
                             </div>
                             <div className="text-[10px] text-gray-400 font-mono">
                                {mom.meeting_number || ''}
                             </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
                            {mom.title}
                        </h3>

                        {/* Details */}
                        <div className="flex flex-col gap-1.5 text-xs text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span>{new Date(mom.meeting_date).toLocaleDateString("id-ID", { weekday: 'short', day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span>{new Date(mom.meeting_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <span className="truncate max-w-[200px]">{mom.location || 'Lokasi tidak ditentukan'}</span>
                            </div>
                        </div>

                        {/* Footer: Participants & Action */}
                        <div className="flex justify-between items-center border-t pt-3 mt-1">
                             <div className="flex items-center gap-2">
                                <div className="flex -space-x-1.5 overflow-hidden">
                                     {Array.isArray(mom.participants) && mom.participants.slice(0, 3).map((_: any, i: number) => (
                                        <div key={i} className="inline-block h-5 w-5 rounded-full ring-1 ring-white bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                            {typeof _ === 'string' ? _[0].toUpperCase() : 'U'}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] text-gray-500">
                                    {mom.participants?.length || 0} Peserta
                                </span>
                             </div>

                             <Link href={`/meeting/${mom.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 bg-gray-50 border border-gray-200">
                                    <ChevronRight className="h-4 w-4 text-gray-600" />
                                </Button>
                             </Link>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Pagination Controls */}
        {totalCount > 0 && (
        <div className="flex justify-center items-center gap-4 mt-6 pb-8">
            <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
            Sebelumnya
            </button>
            
            <span className="text-sm text-gray-600">
            Halaman {page} dari {totalPages}
            </span>

            <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
            Selanjutnya
            </button>
        </div>
        )}

      </div>
    </div>
  )
}
