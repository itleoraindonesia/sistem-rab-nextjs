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
            staleTime: 1 * 60 * 1000, // Data fresh for 1 minute
            gcTime: 60 * 60 * 1000, // Keep in cache for 60 minutes
            refetchInterval: 10 * 60 * 1000, // Background refresh every 10 mins
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 3,
            networkMode: 'always',
          },
          mutations: {
            retry: 3,
            networkMode: 'always',
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
