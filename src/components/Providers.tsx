'use client';

import { MasterDataProvider } from '../context/MasterDataContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MasterDataProvider>
      {children}
    </MasterDataProvider>
  );
}
