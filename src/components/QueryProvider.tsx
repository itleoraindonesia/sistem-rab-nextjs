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
            // Optimized caching strategy for persistence (reduce loading states)
            staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes (no refetch on navigate)
            gcTime: 15 * 60 * 1000, // Keep in memory for 15 minutes before garbage collection
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false, // Disable refetch on window focus (prevent annoying loaders)
            refetchOnReconnect: true,
            refetchOnMount: false, // Only fetch if stale (prevents reload on page navigation)
            networkMode: 'online',
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
