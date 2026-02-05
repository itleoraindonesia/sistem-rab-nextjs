'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// Create QueryClient with optimal settings for data persistence across navigation
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000, // Data fresh for 30 minutes
        gcTime: 24 * 60 * 60 * 1000, // Keep in memory cache for 24 hours (survives tab switch)
        refetchInterval: false, // No automatic refetch
        refetchOnMount: false, // Don't refetch on mount - use cache
        refetchOnWindowFocus: false, // Don't refetch on focus to avoid AbortError
        refetchOnReconnect: false, // Don't auto-refetch on reconnect
        retry: 3,
        networkMode: 'offlineFirst', // Use cache when offline
        // Keep data in cache even when component unmounts
        structuralSharing: true, // Enable structural sharing for better cache efficiency
      },
      mutations: {
        retry: 3,
        networkMode: 'offlineFirst',
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
