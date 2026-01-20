'use client';

import { MasterDataProvider } from '../context/MasterDataContext';
import QueryProvider from './QueryProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <MasterDataProvider>
        {children}
      </MasterDataProvider>
    </QueryProvider>
  );
}
