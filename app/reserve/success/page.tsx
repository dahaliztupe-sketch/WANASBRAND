'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

export default function ReservationSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full space-y-12"
      >
        <div className="flex flex-col items-center gap-8">
          <motion.svg 
            width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <motion.path 
              d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path 
              d="m9 11 3 3L22 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.5, duration: 1, ease: "easeInOut" }}
            />
          </motion.svg>
          
          <div className="space-y-4">
            <h1 className="font-serif text-5xl italic text-primary">Your Selection is Reserved.</h1>
            <p className="text-primary/60 font-light leading-relaxed tracking-wide text-lg">
              Our concierge team is reviewing your request. You will be contacted via WhatsApp shortly to finalize sizing, deposit, and delivery.
            </p>
          </div>
        </div>

        <div className="pt-8">
          <Link 
            href="/track?token=magicToken" 
            className="px-12 py-4 bg-inverted text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all duration-700 shadow-xl"
          >
            Track Your Request
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
