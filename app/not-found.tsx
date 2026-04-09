'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Wind } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center bg-primary">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-24"
      >
        <div className="absolute inset-0 bg-accent-primary/5 rounded-full scale-[3] blur-3xl animate-pulse" />
        <Wind strokeWidth={1} className="w-32 h-32 text-primary/10 stroke-[0.5px] relative z-10" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-serif text-primary mb-8 tracking-tight">
          Page Not Found.
        </h1>
        <p className="text-primary/40 font-light max-w-md mx-auto mb-16 leading-relaxed italic text-lg">
          This piece is out of reach. Let us guide you back to the collection.
        </p>
        
        <Link 
          href="/"
          className="group inline-flex items-center gap-8 text-[10px] uppercase tracking-[0.4em] text-primary hover:text-accent-primary transition-all duration-700"
        >
          <div className="w-12 h-[1px] bg-inverted/20 group-hover:w-20 group-hover:bg-accent-primary transition-all duration-700" />
          Return to The Atelier
          <div className="w-12 h-[1px] bg-inverted/20 group-hover:w-20 group-hover:bg-accent-primary transition-all duration-700" />
        </Link>
      </motion.div>

      <div className="absolute bottom-12 text-[10px] uppercase tracking-[0.5em] text-primary/20">
        Error 404 — Page Not Found
      </div>
    </div>
  );
}
