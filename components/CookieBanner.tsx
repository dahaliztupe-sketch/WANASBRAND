'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('wanas_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('wanas_cookie_consent', 'true');
    setIsVisible(false);
    // Initialize tracking scripts here if needed
    window.dispatchEvent(new Event('wanas_consent_accepted'));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-6 md:px-12 bg-primary border-t border-primary/5 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-primary text-sm font-light tracking-wide text-center md:text-left max-w-2xl">
              To provide a personalized sanctuary, <span className="font-serif italic text-accent-primary">WANAS</span> uses essential cookies. 
              By continuing, you agree to our <a href="/privacy" className="underline hover:text-accent-primary transition-colors">Privacy Policy</a>.
            </p>
            <div className="flex items-center gap-8">
              <button
                onClick={handleAccept}
                className="bg-inverted text-inverted px-10 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-accent-primary transition-all duration-500 shadow-sm"
              >
                Accept & Continue
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-primary/40 hover:text-primary transition-colors"
              >
                <X strokeWidth={1} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
