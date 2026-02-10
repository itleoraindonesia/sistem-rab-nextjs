'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// Create QueryClient with session-based caching
// Cache only exists during browser session, fresh data on page reload
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes during session
        gcTime: 0, // Clear cache when browser/tab closes (session-based)
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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
