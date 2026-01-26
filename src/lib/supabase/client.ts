import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Custom fetch with timeout and retry logic to prevent hanging requests
const fetchWithTimeout = async (url: RequestInfo | URL, options: RequestInit = {}, maxRetries = 3) => {
  const timeout = 15000; // 15 seconds timeout (Reduced from 30s to detect hangs faster)
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timerId);
      
      // Retry on 5xx server errors
      if (!response.ok && response.status >= 500 && attempt < maxRetries) {
        console.warn(`[Supabase] Server error ${response.status}, retrying (${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); 
        continue;
      }
      
      return response;
    } catch (error: any) {
      clearTimeout(timerId);
      
      const isTimeout = error.name === 'AbortError';
      const isNetworkError = error.name === 'TypeError' && error.message === 'Failed to fetch';
      
      // Retry on Timeout or Network Error
      if ((isTimeout || isNetworkError) && attempt < maxRetries) {
        console.warn(`[Supabase] Request ${isTimeout ? 'timed out' : 'failed'}, retrying (${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); 
        continue;
      }
      
      // If it's the last attempt and it timed out, throw a clear error
      if (isTimeout) {
        throw new Error('Request timeout: Connection to Supabase is unstable or hanging.');
      }
      
      throw error;
    }
  }
  
  throw new Error('Max retries reached');
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
