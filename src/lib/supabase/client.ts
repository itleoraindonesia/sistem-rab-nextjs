import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Custom fetch with timeout to prevent hanging requests
const fetchWithTimeout = (url: RequestInfo | URL, options: RequestInit = {}) => {
  const timeout = 10000; // 10 seconds timeout
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
};

// If environment variables are missing, we still export a "client" to avoid
// type errors throughout the application, but it won't be able to connect.
export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    global: {
      fetch: fetchWithTimeout,
    },
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
