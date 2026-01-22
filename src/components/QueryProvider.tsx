'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimized caching strategy for better data freshness
            staleTime: 45 * 1000, // 45 seconds default (reduced from 1 minute)
            gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes (increased)
            retry: 3, // Retry failed requests 3 times (increased from 2)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
            refetchOnWindowFocus: true, // Refetch when window regains focus
            refetchOnReconnect: true, // Refetch when internet reconnects
            refetchOnMount: true, // Refetch when component mounts (better freshness)
            networkMode: 'online', // Only run queries when online
          },
          mutations: {
            retry: 2, // Retry mutations twice (increased from 1)
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
