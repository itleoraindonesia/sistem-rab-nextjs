import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Client } from './useClients'

export function useAllClients() {
  return useQuery({
    queryKey: ['clients', 'all'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[useAllClients] Supabase Error:', error)
        throw new Error(error.message || 'Database query failed')
      }

      return (data as Client[]) || []
    },
    staleTime: 5 * 60 * 1000,
    enabled: false,
  })
}
