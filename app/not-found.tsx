'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#FDFBF7] relative overflow-hidden">
      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <Logo className="w-32 h-auto mb-16 text-primary" />
        
        <h1 className="text-4xl md:text-6xl font-serif text-primary mb-8 tracking-[0.2em] uppercase">
          Page Not Found
        </h1>
        
        <div className="w-24 h-[1px] bg-[#D4AF37] mb-12 opacity-50" />
        
        <p className="text-primary/60 font-light max-w-md mx-auto mb-16 leading-loose tracking-widest uppercase text-[10px]">
          The piece you are looking for is currently out of reach.<br/>
          Let us guide you back to the heart of the atelier.
        </p>
        
        <Link 
          href="/"
          className="group relative px-12 py-5 overflow-hidden border border-[#D4AF37]/30 transition-all duration-700 hover:border-[#D4AF37]"
        >
          <span className="relative z-10 text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] group-hover:text-primary transition-colors duration-700">
            Return Home
          </span>
          <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
        </Link>
      </motion.div>

      <div className="absolute bottom-12 text-[9px] uppercase tracking-[0.6em] text-primary/20 font-bold">
        Error 404 — WANAS Atelier
      </div>
    </div>
  );
}
