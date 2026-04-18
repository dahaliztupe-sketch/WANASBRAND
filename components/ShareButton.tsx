'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  label?: string;
}

export function ShareButton({ title, text, url, className = '', label }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url: shareUrl });
      } catch {
        // User cancelled or error — silently ignore
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 transition-colors ${className}`}
      aria-label="Share this product"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="check" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <Check size={14} strokeWidth={1.5} className="text-green-600" />
          </motion.span>
        ) : (
          <motion.span key="share" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <Share2 size={14} strokeWidth={1.5} />
          </motion.span>
        )}
      </AnimatePresence>
      {label && <span>{label}</span>}
    </button>
  );
}
