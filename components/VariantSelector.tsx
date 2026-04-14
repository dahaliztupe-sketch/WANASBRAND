'use client';

import { useState } from 'react';
import { ShoppingBag, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useQueryState, parseAsBoolean } from 'nuqs';

import { useSelectionStore } from '@/store/useSelectionStore';
import { triggerHaptic } from '@/lib/utils/haptics';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Product } from '@/types';

import { WaitlistModal } from './WaitlistModal';

export function VariantSelector({ product, recommendedByAI }: { product: Product, recommendedByAI?: boolean }) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const { addItem } = useSelectionStore();
  const [, setIsBagOpen] = useQueryState('bag', parseAsBoolean.withDefault(false));
  const { t } = useTranslation();

  const variants = product.variants || [];
  const allOutOfStock = variants.length > 0 && variants.every(v => v.stock === 0);

  const handleAddToBag = () => {
    if (!selectedVariant) {
      toast.error(t.product.variantSelector.pleaseSelectSize);
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      variant: selectedVariant,
      quantity: 1,
      priceAtPurchase: product.price,
      image: product.images[0],
      recommendedByAI,
    });
    triggerHaptic();
    toast.success(t.product.variantSelector.addedToSelection);
    setIsBagOpen(true);
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-secondary font-bold">{t.product.variantSelector.selectSize}</h3>
          <button className="text-[10px] uppercase tracking-[0.2em] text-primary/40 border-b border-primary/10 pb-1 hover:text-primary transition-colors">{t.product.variantSelector.sizeGuide}</button>
        </div>
        <div className="flex flex-wrap gap-4">
          {variants.filter(v => v.isActive !== false).map((variant) => (
            <button
              key={variant.sku}
              onClick={() => setSelectedVariant(variant)}
              aria-label={`Select size ${variant.size}${variant.stock === 0 ? ' (Out of stock)' : ''}`}
              aria-pressed={selectedVariant?.sku === variant.sku}
              aria-disabled={variant.stock === 0}
              className={`min-w-[64px] h-[64px] border text-xs font-sans tracking-widest transition-all duration-500 flex items-center justify-center ${
                selectedVariant?.sku === variant.sku ? 'border-primary bg-primary text-primary-foreground invert dark:invert-0' : 'border-primary/20 hover:border-primary/50'
              } ${variant.stock === 0 ? 'opacity-30 cursor-not-allowed relative overflow-hidden' : ''}`}
            >
              {variant.size}
              {variant.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[120%] h-px bg-primary/30 rotate-[35deg]"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      <motion.button 
        whileTap={{ scale: 0.98 }}
        disabled={!selectedVariant && !allOutOfStock}
        onClick={() => {
          if (allOutOfStock || (selectedVariant && selectedVariant.stock === 0)) {
            setIsWaitlistModalOpen(true);
          } else {
            handleAddToBag();
          }
        }}
        className="w-full py-6 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-accent-primary hover:text-white transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed invert dark:invert-0"
      >
        {(allOutOfStock || (selectedVariant && selectedVariant.stock === 0)) ? (
          <>
            <Clock strokeWidth={1} className="w-4 h-4" />
            {t.product.variantSelector.joinWaitlist}
          </>
        ) : (
          <>
            <ShoppingBag strokeWidth={1} className="w-4 h-4" />
            {t.product.variantSelector.placeInBasket}
          </>
        )}
      </motion.button>

      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        productId={product.id}
        variantId={selectedVariant?.sku || ''}
        productName={product.name}
        variantName={selectedVariant ? `${selectedVariant.size} ${selectedVariant.color ? `- ${selectedVariant.color}` : ''}` : ''}
      />
    </div>
  );
}
