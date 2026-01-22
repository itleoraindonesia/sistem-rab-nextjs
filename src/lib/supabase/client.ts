import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Custom fetch with timeout and retry logic to prevent hanging requests
const fetchWithTimeout = async (url: RequestInfo | URL, options: RequestInit = {}, maxRetries = 3) => {
  const timeout = 30000; // 30 seconds timeout (increased from 10s)
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      if (timerId) clearTimeout(timerId);
      
      // Only retry on network errors or 5xx errors
      if (!response.ok && response.status >= 500 && attempt < maxRetries) {
        console.log(`Fetch failed with status ${response.status}, retrying (${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }
      
      return response;
    } catch (error: any) {
      if (timerId) clearTimeout(timerId);
      
      // Only retry on network errors or abort errors
      if ((error.name === 'AbortError' || error.name === 'TypeError') && attempt < maxRetries) {
        console.log(`Fetch failed with ${error.name}, retrying (${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
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
