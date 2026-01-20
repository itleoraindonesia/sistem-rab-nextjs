import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseClient = null

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error('Error initializing supabase client:', error)
  }
}

export const supabase = supabaseClient
