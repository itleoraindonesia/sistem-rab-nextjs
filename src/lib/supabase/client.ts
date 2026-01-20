import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// If environment variables are missing, we still export a "client" to avoid
// type errors throughout the application, but it won't be able to connect.
export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseKey || ''
)
