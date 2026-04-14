'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';

// Dynamically import the Preloader with ssr: false to avoid hydration mismatches
const Preloader = dynamic(() => import('./Preloader'), { ssr: false });

export function PreloaderWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  // Prevent scrolling while the preloader is active
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      
      {/* Render children immediately so SEO and background rendering are not blocked. */}
      {children}
    </>
  );
}
