'use client';

import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  /** Show the full wordmark below the monogram (default: true) */
  showWordmark?: boolean;
  /** Show the animated gold thread (default: true) */
  animated?: boolean;
  /** Compact mode: tighter proportions for small contexts */
  compact?: boolean;
}

export function Logo({
  className = 'w-28 h-auto',
  showWordmark = true,
  animated = true,
  compact = false,
}: LogoProps) {
  const height = showWordmark ? (compact ? 80 : 100) : (compact ? 60 : 70);
  const vb = `0 0 120 ${height}`;

  return (
    <svg
      viewBox={vb}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="WANAS Atelier"
    >
      <defs>
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#F0D060" />
          <stop offset="50%"  stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#A0820D" />
        </linearGradient>
      </defs>

      {/* Outer diamond frame — luxury touch */}
      {!compact && (
        <motion.rect
          x="55" y="5" width="10" height="10"
          transform="rotate(45 60 10)"
          fill="url(#gold-gradient)"
          initial={animated ? { opacity: 0, scale: 0 } : {}}
          animate={animated ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.8 }}
          style={{ originX: '60px', originY: '10px' }}
        />
      )}

      {/* Subtle serif serifs on W ends — refined detail */}
      <motion.g
        initial={animated ? { opacity: 0 } : {}}
        animate={animated ? { opacity: 0.35 } : {}}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <line x1="28" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="0.8" />
        <line x1="88" y1="20" x2="92" y2="20" stroke="currentColor" strokeWidth="0.8" />
      </motion.g>

      {/* The Monogram 'W' — geometric, refined strokes */}
      <motion.path
        d="M30 20 L45 58 L60 30 L75 58 L90 20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animated ? { pathLength: 0, opacity: 0 } : {}}
        animate={animated ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />

      {/* The Golden Thread — signature weave */}
      <motion.path
        d="M12 38 C 30 12, 48 72, 66 36 C 76 18, 88 14, 108 32"
        stroke="url(#gold-gradient)"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
        filter="url(#logo-glow)"
        initial={animated ? { pathLength: 0, opacity: 0 } : {}}
        animate={animated ? { pathLength: 1, opacity: 0.9 } : {}}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
      />

      {/* Hairline underline for wordmark */}
      {showWordmark && (
        <motion.line
          x1="32" y1={compact ? 65 : 74}
          x2="88" y2={compact ? 65 : 74}
          stroke="url(#gold-gradient)"
          strokeWidth="0.5"
          initial={animated ? { scaleX: 0, opacity: 0 } : {}}
          animate={animated ? { scaleX: 1, opacity: 0.6 } : {}}
          transition={{ duration: 0.8, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: '60px' }}
        />
      )}

      {/* The Wordmark */}
      {showWordmark && (
        <motion.text
          x="60"
          y={compact ? 80 : 92}
          textAnchor="middle"
          fontFamily="var(--font-serif), 'Playfair Display', 'Georgia', serif"
          fontSize={compact ? 13 : 15}
          fontWeight="400"
          letterSpacing="0.35em"
          fill="currentColor"
          initial={animated ? { opacity: 0, y: compact ? 85 : 98 } : {}}
          animate={animated ? { opacity: 1, y: compact ? 80 : 92 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 1.3 }}
        >
          WANAS
        </motion.text>
      )}
    </svg>
  );
}

/** Minimal icon-only version for favicons and small spaces */
export function LogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#F0D060" />
          <stop offset="50%"  stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#A0820D" />
        </linearGradient>
      </defs>
      <path
        d="M30 15 L45 53 L60 25 L75 53 L90 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 35 C 30 10, 48 68, 66 32 C 76 15, 88 12, 108 28"
        stroke="url(#gm-gold)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}
