import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

// Types
export interface Client {
  id: string
  nama: string
  whatsapp?: string
  instagram_username?: string
  kebutuhan: string
  produk?: string
  kabupaten?: string
  provinsi?: string
  luasan?: string
  status?: string
  tracking_source?: string
  created_at: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export interface ClientFilters {
  page?: number
  search?: string
  filterKebutuhan?: string
  sortBy?: 'created_at' | 'nama'
  sortOrder?: 'asc' | 'desc'
}

export interface DashboardStats {
  total: number
  prospek: number
  closing: number
  byKabupaten: { name: string; value: number }[]
  byStatus: { name: string; value: number }[]
  byProduk: { name: string; value: number }[]
  byKebutuhan: { name: string; value: number }[]
  byWeek: { day: string; date: string; count: number }[]
}

const ITEMS_PER_PAGE = 20

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: ClientFilters) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string | null) => [...clientKeys.details(), id] as const,
  stats: () => [...clientKeys.all, 'stats'] as const,
}

// Hook: Fetch clients list
export function useClients(filters: ClientFilters = {}) {
  const { 
    page = 1, 
    search = '', 
    filterKebutuhan = '',
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = filters

  // Stabilize query key to prevent unnecessary refetches
  const queryKey = clientKeys.list({
    page,
    search,
    filterKebutuhan,
    sortBy,
    sortOrder
  })

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      // Check supabase client availability
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      console.log(`[useClients] Fetching page ${page}, range ${from}-${to}`)

      try {
        let query = supabase
          .from('clients')
          .select('*', { count: 'exact' })

        if (filterKebutuhan) query = query.eq('kebutuhan', filterKebutuhan)
        
        if (search && search.trim() !== '') {
          const searchTerm = search.trim()
          query = query.or(`nama.ilike.%${searchTerm}%,whatsapp.ilike.%${searchTerm}%,kabupaten.ilike.%${searchTerm}%`)
        }

        query = query
          .order(sortBy, { ascending: sortOrder === 'asc' })
          .range(from, to)

        const { data, error, count } = await query

        if (error) {
          // Don't throw for abort errors - they're normal cancellations
          if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
            console.log('[useClients] Request cancelled (AbortError)')
            return { 
              data: [], 
              totalCount: 0,
              page,
              totalPages: 0
            }
          }
          
          console.error('[useClients] Supabase Error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw new Error(error.message || 'Database query failed')
        }

        console.log(`[useClients] Fetched ${data?.length} clients, total: ${count}`)

        return { 
          data: (data as Client[]) || [], 
          totalCount: count || 0,
          page,
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
        }
      } catch (err: any) {
        // Don't throw for abort errors - they're normal cancellations
        if (err?.message?.includes('AbortError') || err?.message?.includes('aborted')) {
          console.log('[useClients] Request cancelled (AbortError)')
          return { 
            data: [], 
            totalCount: 0,
            page,
            totalPages: 0
          }
        }
        
        console.error('[useClients] Unexpected error:', err)
        throw new Error(err?.message || 'Failed to fetch clients')
      }
    },
    // Keep previous data during pagination for better UX
    placeholderData: (previousData: any) => previousData,
    // Use global defaults (30 min stale, 24 hours gc)
  })
}

// Hook: Fetch single client
export function useClient(id: string | null) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: async () => {
      if (!id) return null
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Client
    },
    enabled: !!id,
  })
}

// Hook: Fetch client stats
export function useClientStats() {
  return useQuery({
    queryKey: clientKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      // Check supabase client availability
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      try {
        const { data: clients, error } = await supabase
          .from('clients')
          .select('id, created_at, status, kabupaten, kebutuhan, produk')
          .order('created_at', { ascending: false })

        if (error) {
          // Don't throw for abort errors - they're normal cancellations
          if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
            console.log('[useClientStats] Request cancelled (AbortError)')
            return {
              total: 0,
              prospek: 0,
              closing: 0,
              byKabupaten: [],
              byStatus: [],
              byProduk: [],
              byKebutuhan: [],
              byWeek: [],
            }
          }
          
          console.error('[useClientStats] Supabase Error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw new Error(error.message || 'Database query failed')
        }

      const typedClients = clients as Client[] | null

      if (!typedClients || typedClients.length === 0) {
        return {
          total: 0,
          prospek: 0,
          closing: 0,
          byKabupaten: [],
          byStatus: [],
          byProduk: [],
          byKebutuhan: [],
          byWeek: [],
        }
      }

      // 1. Calculate Summary Stats
      const prospekStatus = ['IG_Lead', 'WA_Negotiation', 'Quotation_Sent', 'Follow_Up']
      const closingStatus = ['Invoice_Deal', 'WIP', 'Finish']

      const prospekCount = typedClients.filter(c => c.status && prospekStatus.includes(c.status)).length
      const closingCount = typedClients.filter(c => c.status && closingStatus.includes(c.status)).length

      // 2. By Kabupaten
      const kabupatenMap = new Map<string, number>()
      typedClients.forEach(c => {
        if (c.kabupaten && c.kabupaten.trim() !== '' && c.kabupaten !== '-') {
          kabupatenMap.set(c.kabupaten, (kabupatenMap.get(c.kabupaten) || 0) + 1)
        }
      })
      const byKabupaten = Array.from(kabupatenMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

      // 3. By Status
      const statusMap = new Map<string, number>()
      typedClients.forEach(c => {
        const s = c.status || 'Unknown'
        statusMap.set(s, (statusMap.get(s) || 0) + 1)
      })
      
      const statusOrder = ['IG_Lead', 'WA_Negotiation', 'Quotation_Sent', 'Follow_Up', 'Invoice_Deal', 'WIP', 'Finish', 'Cancelled']
      const byStatus = statusOrder.map(s => ({
        name: s.replace(/_/g, ' '),
        value: statusMap.get(s) || 0
      })).filter(item => item.value > 0)
      
      Array.from(statusMap.entries()).forEach(([key, value]) => {
        if (!statusOrder.includes(key)) {
          byStatus.push({ name: key, value })
        }
      })

      // 4. By Produk
      const produkMap = new Map<string, number>()
      typedClients.forEach(c => {
        if (c.produk && c.produk.trim() !== '' && c.produk !== '-') {
          produkMap.set(c.produk, (produkMap.get(c.produk) || 0) + 1)
        }
      })
      const byProduk = Array.from(produkMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

      // 5. By Kebutuhan
      const kebutuhanMap = new Map<string, number>()
      typedClients.forEach(c => {
        if (c.kebutuhan && c.kebutuhan.trim() !== '' && c.kebutuhan !== '-') {
          kebutuhanMap.set(c.kebutuhan, (kebutuhanMap.get(c.kebutuhan) || 0) + 1)
        }
      })
      const byKebutuhan = Array.from(kebutuhanMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

      // 6. By Week
      const weekMap = new Map<string, number>()
      const today = new Date()
      
      const getLocalDateKey = (d: Date) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateKey = getLocalDateKey(date)
        weekMap.set(dateKey, 0)
      }

      typedClients.forEach(c => {
        const clientDate = new Date(c.created_at)
        const dateKey = getLocalDateKey(clientDate)
        if (weekMap.has(dateKey)) {
          weekMap.set(dateKey, (weekMap.get(dateKey) || 0) + 1)
        }
      })

      const byWeek = Array.from(weekMap.entries())
        .map(([dateKey, count]) => {
          const [y, m, d] = dateKey.split('-').map(Number)
          const date = new Date(y, m - 1, d)
          const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
          const dayName = dayNames[date.getDay()]
          return { day: dayName, date: dateKey, count }
        })

      return {
        total: typedClients.length,
        prospek: prospekCount,
        closing: closingCount,
        byKabupaten,
        byStatus,
        byProduk,
        byKebutuhan,
        byWeek,
      }
      } catch (err: any) {
        // Don't throw for abort errors - they're normal cancellations
        if (err?.message?.includes('AbortError') || err?.message?.includes('aborted')) {
          console.log('[useClientStats] Request cancelled (AbortError)')
          return {
            total: 0,
            prospek: 0,
            closing: 0,
            byKabupaten: [],
            byStatus: [],
            byProduk: [],
            byKebutuhan: [],
            byWeek: [],
          }
        }
        
        console.error('[useClientStats] Unexpected error:', err)
        throw new Error(err?.message || 'Failed to fetch client stats')
      }
    },
    placeholderData: (previousData: any) => previousData,
  })
}

// Hook: Create client
export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientData: Partial<Client>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single()
      
      if (error) throw error
      return data as Client
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all })
    },
  })
}

// Hook: Update client
export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Client
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all })
    },
  })
}

// Hook: Delete client
export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all })
    },
  })
}

// Hook: Bulk create clients
export function useBulkCreateClients() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clients: Partial<Client>[]) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(clients)
        .select()
      
      if (error) throw error
      return data as Client[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all })
    },
  })
}
