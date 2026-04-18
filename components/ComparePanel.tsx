'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, GitCompare, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useCompareStore } from '@/store/useCompareStore';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { formatPrice } from '@/lib/utils';

export function ComparePanel() {
  const { items, isOpen, removeItem, clear, close, toggle } = useCompareStore();
  const { language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) return null;

  const isAr = language === 'ar';

  return (
    <AnimatePresence>
      {(isOpen || items.length > 0) && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-4 start-4 end-4 md:start-auto md:end-4 md:w-80 z-50"
        >
          <div className="bg-primary border border-primary/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <GitCompare size={14} strokeWidth={1.5} className="text-accent-primary" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                  {isAr ? 'مقارنة المنتجات' : 'Compare'} ({items.length}/3)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsExpanded(e => !e)} className="text-primary/40 hover:text-primary transition-colors">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                <button onClick={close} className="text-primary/40 hover:text-primary transition-colors">
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Items preview */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 p-3">
                    {items.map((product) => (
                      <div key={product.id} className="flex-1 relative group">
                        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                          {product.images[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="w-full h-full bg-secondary" />
                          )}
                          <button
                            onClick={() => removeItem(product.id)}
                            className="absolute top-1 end-1 w-5 h-5 bg-primary/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={8} className="text-inverted" />
                          </button>
                        </div>
                        <p className="text-[9px] font-serif text-primary truncate mt-1">{product.name}</p>
                        <p className="text-[8px] text-accent-primary font-bold">{formatPrice(product.price)}</p>
                      </div>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: 3 - items.length }).map((_, i) => (
                      <div key={i} className="flex-1 aspect-[3/4] border border-dashed border-primary/20 flex items-center justify-center">
                        <span className="text-[8px] text-primary/30 uppercase tracking-widest">+</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-2 px-3 pb-3">
              {items.length >= 2 ? (
                <Link
                  href={`/compare?ids=${items.map(p => p.id).join(',')}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-accent-primary text-primary text-[9px] uppercase tracking-widest font-bold hover:bg-primary hover:text-inverted transition-colors"
                >
                  <ExternalLink size={10} strokeWidth={2} />
                  {isAr ? 'قارن الآن' : 'Compare Now'}
                </Link>
              ) : (
                <div className="flex-1 py-2 text-center text-[8px] text-primary/30 uppercase tracking-widest border border-dashed border-primary/15">
                  {isAr ? 'أضيفي منتجاً آخر للمقارنة' : 'Add another item to compare'}
                </div>
              )}
              <button
                onClick={clear}
                className="px-3 py-2 border border-primary/10 text-[9px] uppercase tracking-widest text-primary/50 hover:text-primary hover:border-primary/30 transition-colors"
              >
                {isAr ? 'مسح' : 'Clear'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
