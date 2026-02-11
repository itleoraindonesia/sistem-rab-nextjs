'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';

// Create QueryClient with persistent caching across sessions
// Cache persists for 10 minutes, but invalidates on new login session
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes (even after tab close)
        refetchInterval: false, // No automatic refetch
        refetchOnMount: true, // Always fetch fresh data when component mounts
        refetchOnWindowFocus: false, // Don't refetch on focus to avoid AbortError
        refetchOnReconnect: false, // Don't auto-refetch on reconnect
        retry: 3,
        networkMode: 'online', // Require network connection
        structuralSharing: true, // Enable structural sharing for better cache efficiency
      },
      mutations: {
        retry: 3,
        networkMode: 'online',
      },
    },
  });

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  // Invalidate all queries on new session (new login)
  useEffect(() => {
    const currentSessionId = sessionStorage.getItem('session_id');
    const storedSessionId = localStorage.getItem('last_session_id');

    // If session ID changed, it's a new login - invalidate all cache
    if (currentSessionId && currentSessionId !== storedSessionId) {
      queryClient.invalidateQueries();
      localStorage.setItem('last_session_id', currentSessionId);
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
