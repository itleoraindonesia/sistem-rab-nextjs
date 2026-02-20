'use client';

import { MasterDataProvider } from '../context/MasterDataContext';
import QueryProvider from './QueryProvider';
import { AuthProvider } from './AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <MasterDataProvider>
          {children}
        </MasterDataProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
