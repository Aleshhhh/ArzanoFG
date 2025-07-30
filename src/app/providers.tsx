'use client';

import { AppProvider } from '@/context/AppContext';
import { ReactNode } from 'react';
import { PrimeReactProvider } from 'primereact/api';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrimeReactProvider>
      <AppProvider>{children}</AppProvider>
    </PrimeReactProvider>
  );
}
