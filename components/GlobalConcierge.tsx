'use client';

import { useState } from 'react';
import { Bot } from 'lucide-react';
import ConciergeChat from './ConciergeChat';
import { AnimatePresence, motion } from 'motion/react';

export function GlobalConcierge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-8 right-6 z-40 w-14 h-14 bg-accent-primary text-inverted rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open Concierge"
      >
        <Bot size={24} />
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
