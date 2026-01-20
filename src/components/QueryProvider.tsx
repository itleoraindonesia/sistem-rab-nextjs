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
            // Dengan SSR, biasanya kita ingin menyetel staleTime default
            // di atas 0 untuk menghindari pengambilan ulang segera di klien
            staleTime: 60 * 1000, // 1 minute default
            gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
            retry: 2, // Retry failed requests 2 times
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
            refetchOnWindowFocus: true, // Refetch when window regains focus
            refetchOnReconnect: true, // Refetch when internet reconnects
            networkMode: 'online', // Only run queries when online
          },
          mutations: {
            retry: 1, // Retry mutations once
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
