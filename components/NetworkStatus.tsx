'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initial check
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-red-900 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-md"
        >
          <WifiOff size={16} />
          <span className="text-xs uppercase tracking-widest font-medium">You are currently offline. Some features may be unavailable.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
