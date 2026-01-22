// Re-export from new location to avoid breaking existing imports
export { supabase } from './supabase/client'
export type { SupabaseClient } from '@supabase/supabase-js'
import type { Tables } from '../types/database'
export type SupabaseUser = Tables<'users'>

// Legacy exports for backward compatibility
export type Client = {
  id: number
  nama: string
  whatsapp: string
  kebutuhan: string
  kabupaten: string
  provinsi?: string
  luasan: number | null
  produk?: string | null
  tracking_source?: 'instagram_only' | 'whatsapp_only' | null
  instagram_username?: string | null
  created_by?: string | null
  updated_by?: string | null
  status?: 'IG_Lead' | 'WA_Negotiation' | 'Quotation_Sent' | 'Follow_Up' | 'Invoice_Deal' | 'WIP' | 'Finish' | 'Cancelled'
  created_at: string
  updated_at: string
}
