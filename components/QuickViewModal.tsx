'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Product } from '@/types';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useShoppingBagStore } from '@/store/useShoppingBagStore';
import { useWishlistStore } from '@/store/useWishlistStore';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { t } = useTranslation();
  const { addItem } = useShoppingBagStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    if (isOpen) {
      setSelectedVariantIdx(0);
      setActiveImageIdx(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, product]);

  if (!product) return null;

  const availableVariants = product.variants?.filter((v) => v.stock > 0) ?? [];
  const selectedVariant = availableVariants[selectedVariantIdx];
  const inWishlist = isInWishlist(product.id);

  const handleAddToBag = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, 1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-primary/70 backdrop-blur-md p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="bg-secondary w-full max-w-3xl max-h-[90vh] overflow-hidden border border-primary/10 shadow-2xl flex flex-col md:flex-row"
          >
            {/* Left: Image */}
            <div className="relative md:w-1/2 aspect-[3/4] md:aspect-auto bg-primary/5 flex-shrink-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {product.images?.[activeImageIdx] ? (
                    <Image
                      src={product.images[activeImageIdx]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary" />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Image thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-3 start-3 flex gap-1.5">
                  {product.images.slice(0, 4).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`w-8 h-8 relative overflow-hidden border-2 transition-all ${activeImageIdx === i ? 'border-accent-primary' : 'border-white/50'}`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="32px" />
                    </button>
                  ))}
                </div>
              )}

              {/* Wishlist */}
              <button
                onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                className="absolute top-3 end-3 w-9 h-9 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={16}
                  strokeWidth={1.5}
                  className={inWishlist ? 'fill-accent-primary text-accent-primary' : 'text-primary'}
                />
              </button>
            </div>

            {/* Right: Info */}
            <div className="flex flex-col flex-1 p-6 md:p-8 overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-accent-primary font-bold mb-2">{product.category}</p>
                  <h2 className="font-serif text-2xl text-primary leading-tight">{product.name}</h2>
                  <p className="text-sm text-secondary mt-1">{product.price.toLocaleString()} EGP</p>
                </div>
                <button onClick={onClose} className="text-primary/30 hover:text-primary transition-colors p-1 -mt-1 -me-1">
                  <X strokeWidth={1} size={22} />
                </button>
              </div>

              <p className="text-sm text-secondary leading-relaxed mb-6 line-clamp-3">{product.description}</p>

              {availableVariants.length > 0 ? (
                <>
                  <div className="mb-6">
                    <p className="text-[9px] uppercase tracking-widest text-primary/50 mb-3 font-bold">
                      {t.product.variantSelector.selectSize}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableVariants.map((v, i) => (
                        <button
                          key={v.sku}
                          onClick={() => setSelectedVariantIdx(i)}
                          className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                            selectedVariantIdx === i
                              ? 'border-accent-primary bg-accent-primary/5 text-accent-primary'
                              : 'border-primary/20 text-primary hover:border-primary/50'
                          }`}
                        >
                          {v.size}
                          {v.color && ` · ${v.color}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddToBag}
                    disabled={!selectedVariant}
                    className="w-full py-4 bg-primary text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-40 mb-4"
                  >
                    <ShoppingBag size={14} strokeWidth={1.5} />
                    {t.product.variantSelector.placeInBasket}
                  </button>
                </>
              ) : (
                <div className="py-4 border border-primary/10 text-center text-[10px] uppercase tracking-widest text-primary/40 mb-4">
                  Out of Stock
                </div>
              )}

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-3 border border-primary/10 text-[10px] uppercase tracking-widest text-primary/60 hover:border-primary/30 hover:text-primary transition-all"
              >
                View Full Details
                <ArrowRight size={12} strokeWidth={1.5} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
