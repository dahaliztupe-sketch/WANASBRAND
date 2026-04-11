'use client';

import { useState } from 'react';
import { ConciergeLogo } from './ConciergeLogo';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'motion/react';

const ConciergeChat = dynamic(() => import('./ConciergeChat'), {
  ssr: false,
});

export function GlobalConcierge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-8 right-6 z-40 w-14 h-14 bg-primary text-accent-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform border border-accent-primary/20"
        aria-label="Open Concierge"
      >
        <ConciergeLogo className="w-8 h-8" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            <div className="absolute inset-0 pointer-events-auto">
              <ConciergeChat onClose={() => setIsOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
