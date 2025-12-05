'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

/**
 * Displays a banner when the user is offline
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 px-4 py-3 text-white shadow-lg"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
            <WifiOff className="h-5 w-5" />
            <p className="text-sm font-medium">
              You are currently offline. Some features may not be available.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
