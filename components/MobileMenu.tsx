'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, Menu } from 'lucide-react';

export function MobileMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <button 
        className="lg:hidden p-2 text-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Menu strokeWidth={1} className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-md flex flex-col items-center justify-center space-y-8 text-primary"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-8 right-8 p-2 text-primary hover:text-accent-primary transition-colors"
            >
              <X strokeWidth={1} className="w-8 h-8" />
            </button>
            <nav className="flex flex-col items-center gap-8 text-3xl font-serif">
              <Link href="/" onClick={() => setIsOpen(false)}>The Atelier</Link>
              <Link href="/collections" onClick={() => setIsOpen(false)}>Collections</Link>
              <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setIsOpen(false)}>Dashboard</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
