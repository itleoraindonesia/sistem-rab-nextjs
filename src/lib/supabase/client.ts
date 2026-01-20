import { createBrowserClient } from '@supabase/ssr'

// Get environment variables - support both new publishable key and legacy anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging
console.log('🔍 Supabase Client Init:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
  keyPrefix: supabaseKey ? supabaseKey.substring(0, 15) + '...' : 'MISSING',
  keyLength: supabaseKey?.length || 0,
  envVars: {
    hasPublishableKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
})

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables missing:', {
    NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: !!supabaseKey
  })
  console.error('Please check your .env file and ensure both variables are set correctly.')
}

let supabaseClient = null
try {
  if (supabaseUrl && supabaseKey) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase client created successfully')
  }
} catch (error) {
  console.error('❌ Error creating Supabase client:', error)
}

export const supabase = supabaseClient
