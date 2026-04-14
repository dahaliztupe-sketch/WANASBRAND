'use client';

import React from 'react';
import { motion } from 'motion/react';

export function Logo({ className = "w-32 h-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      dir="ltr"
    >
      {/* The Monogram 'W' */}
      <path
        d="M30 20 L45 60 L60 30 L75 60 L90 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* The Golden Thread (Animated) */}
      <motion.path
        d="M15 40 C 35 15, 55 75, 70 40 C 80 20, 90 15, 105 35"
        stroke="#D4AF37"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
      />
      
      {/* The Wordmark */}
      <text
        x="60"
        y="90"
        textAnchor="middle"
        fontFamily="var(--font-serif), 'Playfair Display', serif"
        fontSize="18"
        fontWeight="400"
        letterSpacing="0.3em"
        fill="currentColor"
      >
        WANAS
      </text>
    </svg>
  );
}
