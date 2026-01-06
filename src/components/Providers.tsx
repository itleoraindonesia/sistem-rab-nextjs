'use client';

import { AuthProvider } from '../context/AuthContext';
import { MasterDataProvider } from '../context/MasterDataContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MasterDataProvider>
        {children}
      </MasterDataProvider>
    </AuthProvider>
  );
}
