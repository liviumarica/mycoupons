'use client';

import { Toaster } from '@coupon-management/ui';
import { OfflineIndicator } from './OfflineIndicator';

/**
 * Client-side providers wrapper
 * This component wraps all client-side providers and components
 * that need to be used in the root layout
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineIndicator />
      {children}
      <Toaster />
    </>
  );
}
