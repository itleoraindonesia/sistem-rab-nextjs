// Re-export from new location to avoid breaking existing imports
export { supabase } from './supabase/client'
export type { User as SupabaseUser } from '../types/database'

// Legacy exports for backward compatibility
export type Client = {
  id: number
  nama: string
  whatsapp: string
  kebutuhan: string
  lokasi: string
  luasan: number | null
  created_at: string
  updated_at: string
}
