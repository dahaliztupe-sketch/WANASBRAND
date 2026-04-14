'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { motion } from 'motion/react';
import { updateCartItem } from '@/app/actions/cart';
import { triggerHaptic } from '@/lib/utils/haptics';

export function AddToCartButton({ sku, userId }: { sku: string, userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useOptimistic<'idle' | 'adding'>('idle', (_, action: 'idle' | 'adding') => action);

  const handleAdd = async () => {
    triggerHaptic(20);
    startTransition(async () => {
      setOptimisticStatus('adding');
      await updateCartItem(userId, sku, 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    });
  };

  const status = showSuccess ? 'success' : optimisticStatus;

  return (
    <motion.button
      onClick={handleAdd}
      whileTap={{ scale: 0.98 }}
      disabled={status !== 'idle'}
      className="w-full bg-primary text-inverted py-4 text-xs uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 disabled:opacity-80"
    >
      {status === 'success' ? (
        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          ✔ Added to Sanctuary
        </motion.span>
      ) : (
        <span>{status === 'adding' ? 'Adding...' : 'Add to Bag'}</span>
      )}
    </motion.button>
  );
}
