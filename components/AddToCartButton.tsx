'use client';

import { useOptimistic, startTransition } from 'react';
import { motion } from 'motion/react';
import { updateCartItem } from '@/app/actions/cart';

export function AddToCartButton({ sku, userId }: { sku: string, userId: string }) {
  const [status, setStatus] = useOptimistic<'idle' | 'success'>('idle');

  const handleAdd = async () => {
    startTransition(() => setStatus('success'));
    await updateCartItem(userId, sku, 1);
    setTimeout(() => startTransition(() => setStatus('idle')), 2000);
  };

  return (
    <motion.button
      onClick={handleAdd}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-primary text-inverted py-4 text-xs uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2"
    >
      {status === 'success' ? (
        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          ✔ Added to Sanctuary
        </motion.span>
      ) : (
        <span>Add to Bag</span>
      )}
    </motion.button>
  );
}
