'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-6 right-6 z-50 md:bottom-12 md:left-auto md:right-12 md:w-96"
        >
          <div className="bg-primary border border-primary/10 p-6 shadow-2xl rounded-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent-primary">Experience WANAS</h3>
                <p className="text-sm font-serif text-primary/80">Add to your home sanctuary for the full experience.</p>
              </div>
              <button onClick={() => setShowPrompt(false)} className="text-primary/40 hover:text-primary">
                <X size={16} />
              </button>
            </div>
            <button
              onClick={handleInstall}
              className="w-full py-4 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.4em] font-bold flex items-center justify-center gap-3 hover:bg-accent-primary hover:text-white transition-all invert dark:invert-0"
            >
              <Download size={14} />
              Install Application
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
