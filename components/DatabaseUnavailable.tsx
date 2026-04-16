'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function DatabaseUnavailable() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-8 bg-secondary/20 border border-primary/5 rounded-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-6 bg-accent-primary/10 rounded-full"
      >
        <AlertCircle className="w-12 h-12 text-accent-primary stroke-[1px]" />
      </motion.div>
      
      <div className="space-y-4 max-w-md">
        <h2 className="text-3xl font-serif text-primary italic">Atelier Connection Interrupted</h2>
        <p className="text-primary/60 font-sans text-sm leading-relaxed">
          Our digital sanctuary is currently undergoing maintenance or experiencing a connection issue. 
          The handcrafted details you seek are temporarily unavailable.
        </p>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent-primary transition-all invert dark:invert-0"
      >
        <RefreshCw className="w-4 h-4" />
        Retry Connection
      </button>
      
      <p className="text-[9px] uppercase tracking-widest text-primary/30 font-bold">
        Error Code: FIREBASE_ADMIN_UNAVAILABLE
      </p>
    </div>
  );
}
