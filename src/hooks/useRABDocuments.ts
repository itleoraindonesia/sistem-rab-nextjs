import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export interface RABDocument {
  id: string
  no_ref: string | null
  project_name: string
  location_kabupaten: string | null
  location_provinsi: string | null
  client_profile: {
    nama?: string
    no_hp?: string
    email?: string
  } | null
  snapshot: any | null
  status: string | null
  total: number | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  panel_lantai_id: string | null
  panel_dinding_id: string | null
}

export interface RABDocumentFilters {
  page?: number
  search?: string
  filterStatus?: string
  sortBy?: 'created_at' | 'project_name' | 'no_ref' | 'total'
  sortOrder?: 'asc' | 'desc'
}

export const RAB_DOCUMENT_STATUS = ['draft', 'sent', 'approved'] as const

const ITEMS_PER_PAGE = 20

export const rabDocumentKeys = {
  all: ['rab_documents'] as const,
  lists: () => [...rabDocumentKeys.all, 'list'] as const,
  list: (filters: RABDocumentFilters) => [...rabDocumentKeys.lists(), filters] as const,
  details: () => [...rabDocumentKeys.all, 'detail'] as const,
  detail: (id: string | null) => [...rabDocumentKeys.details(), id] as const,
}

export function useRABDocuments(filters: RABDocumentFilters = {}) {
  const { 
    page = 1, 
    search = '', 
    filterStatus = '',
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = filters

  const queryKey = rabDocumentKeys.list({
    page,
    search,
    filterStatus,
    sortBy,
    sortOrder
  })

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      try {
        let query = supabase
          .from('rab_documents')
          .select('*', { count: 'exact' })
          .is('deleted_at', null)

        if (filterStatus) {
          query = query.eq('status', filterStatus)
        }
        
        if (search && search.trim() !== '') {
          const searchTerm = search.trim()
          query = query.or(`project_name.ilike.%${searchTerm}%,no_ref.ilike.%${searchTerm}%,location_kabupaten.ilike.%${searchTerm}%`)
        }

        query = query
          .order(sortBy, { ascending: sortOrder === 'asc' })
          .range(from, to)

        const { data, error, count } = await query

        if (error) {
          if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
            return { 
              data: [], 
              totalCount: 0,
              page,
              totalPages: 0
            }
          }
          throw new Error(error.message || 'Database query failed')
        }

        return { 
          data: (data as RABDocument[]) || [], 
          totalCount: count || 0,
          page,
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
        }
      } catch (err: any) {
        if (err?.message?.includes('AbortError') || err?.message?.includes('aborted')) {
          return { 
            data: [], 
            totalCount: 0,
            page,
            totalPages: 0
          }
        }
        throw new Error(err?.message || 'Failed to fetch RAB documents')
      }
    },
    placeholderData: (previousData: any) => previousData,
  })
}

export function useRABDocument(id: string | null) {
  return useQuery({
    queryKey: rabDocumentKeys.detail(id),
    queryFn: async () => {
      if (!id) return null
      
      const { data, error } = await supabase
        .from('rab_documents')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as RABDocument
    },
    enabled: !!id,
  })
}

export function useUpdateRABDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RABDocument> & { id: string }) => {
      const { data, error } = await supabase
        .from('rab_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as RABDocument
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rabDocumentKeys.all })
    },
  })
}

export function useDeleteRABDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rab_documents')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rabDocumentKeys.all })
    },
  })
}
