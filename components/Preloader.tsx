'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  useEffect(() => {
    // Orchestrate the sequence:
    // Delay (0.2s) + Reveal (0.8s) + Hold (1.5s) = 2.5s total before triggering exit
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FDFBF7] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        transition: { duration: 0.6, ease: "easeIn" } 
      }}
    >
      {/* Subtle Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} 
      />

      {/* The "Golden Thread" Accent */}
      <motion.div
        className="absolute top-1/2 left-0 w-full h-[1px] bg-[#D4AF37] origin-center"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ 
          scaleX: [0, 1, 0], 
          opacity: [0, 0.5, 0] 
        }}
        transition={{ 
          duration: 2.3, 
          delay: 0.2, 
          ease: "easeInOut", 
          times: [0, 0.5, 1] 
        }}
      />

      {/* Breathing Logo */}
      <motion.h1
        className="relative z-10 font-serif text-5xl md:text-7xl tracking-[0.2em] text-[#D4AF37] uppercase"
        initial={{ 
          opacity: 0, 
          filter: "blur(4px)", 
          scale: 0.9,
          textShadow: "0px 0px 0px rgba(212, 175, 55, 0)"
        }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
          scale: 1.05,
          textShadow: "0px 0px 20px rgba(212, 175, 55, 0.4)"
        }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: "easeOut",
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          filter: "blur(4px)",
          transition: { duration: 0.6, ease: "easeIn" }
        }}
      >
        WANAS
      </motion.h1>
    </motion.div>
  );
}
