'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Check, Loader2 } from 'lucide-react';

import { useTranslation } from '@/lib/hooks/useTranslation';

interface NotifyMeModalProps {
  productId: string;
  productName: string;
  sku: string;
  size: string;
  color?: string;
  isOpen: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function NotifyMeModal({ productId, productName, sku, size, color, isOpen, onClose }: NotifyMeModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setStatus('loading');
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variantId: sku,
          productName,
          variantName: `${size}${color ? ` - ${color}` : ''}`,
          contactInfo: email,
        }),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-primary/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="bg-secondary w-full max-w-md border border-primary/10 shadow-2xl"
          >
            <div className="flex items-start justify-between p-6 border-b border-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
                  <Bell strokeWidth={1} size={16} className="text-accent-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-primary text-lg leading-none">{t.product?.notifyMe ?? 'Notify Me'}</h3>
                  <p className="text-[9px] uppercase tracking-widest text-primary/40 mt-1">{productName}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-primary/30 hover:text-primary transition-colors p-1">
                <X size={20} strokeWidth={1} />
              </button>
            </div>

            <div className="p-6">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center gap-4 py-6"
                >
                  <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center">
                    <Check size={20} className="text-accent-primary" strokeWidth={1.5} />
                  </div>
                  <p className="font-serif text-primary text-lg">
                    {t.product?.notifyMeSuccess ?? "You're on the list"}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-primary/40">
                    {size} {color ? `· ${color}` : ''}
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-8 py-3 bg-primary text-inverted text-[10px] uppercase tracking-widest hover:bg-accent-primary transition-colors"
                  >
                    Continue Browsing
                  </button>
                </motion.div>
              ) : (
                <>
                  <p className="text-sm text-secondary leading-relaxed mb-6">
                    {t.product?.notifyMeDesc ?? 'We will notify you the moment this piece returns to stock.'}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-primary/40 mb-3">
                    Size: <span className="text-primary">{size}</span>
                    {color && <> · Color: <span className="text-primary">{color}</span></>}
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.product?.notifyMeEmail ?? 'Your email address'}
                      required
                      className="w-full bg-primary/5 border border-primary/10 px-4 py-3 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent-primary/50 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-3.5 bg-primary text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {status === 'loading' ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        t.product?.notifyMeSubmit ?? 'Notify Me'
                      )}
                    </button>
                    {status === 'error' && (
                      <p className="text-[10px] text-red-400 text-center tracking-wide">
                        Something went wrong. Please try again.
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
