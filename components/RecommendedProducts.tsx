'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Product } from '@/types';
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import { getRecommendedProducts } from '@/lib/services/personalization';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { formatPrice } from '@/lib/utils';
import { useLanguageStore } from '@/lib/store/useLanguageStore';
import { ProductCardSkeleton } from '@/components/Skeletons';

interface RecommendedProductsProps {
  currentProductId?: string;
  title?: string;
  maxItems?: number;
}

export default function RecommendedProducts({
  currentProductId,
  maxItems = 4,
}: RecommendedProductsProps) {
  const { items: recentlyViewed } = useRecentlyViewedStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const viewedForRecs = recentlyViewed
      .filter((i) => i.id !== currentProductId)
      .map((i) => ({ id: i.id, category: i.category, price: i.price }));

    setLoading(true);
    getRecommendedProducts(viewedForRecs, maxItems)
      .then((recs) => {
        if (!cancelled) {
          setProducts(recs.filter((p) => p.id !== currentProductId));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [recentlyViewed, currentProductId, maxItems]);

  if (!loading && products.length === 0) return null;

  const visibleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2;
  const canPrev = activeIndex > 0;
  const canNext = activeIndex + visibleCount < products.length;

  const headingAr = 'قد يعجبكِ أيضاً';
  const headingEn = 'You May Also Like';
  const heading = language === 'ar' ? headingAr : headingEn;

  return (
    <section className="py-24 border-t border-primary/5">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-accent-primary font-bold mb-3">
              {language === 'ar' ? 'تنسيقات مقترحة' : 'Curated For You'}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-primary tracking-tight">
              {heading}
            </h2>
          </div>

          {/* Navigation Arrows */}
          {!loading && products.length > visibleCount && (
            <div className="flex gap-3">
              <button
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={!canPrev}
                className="w-10 h-10 border border-primary/10 flex items-center justify-center text-primary/40 hover:text-accent-primary hover:border-accent-primary transition-all disabled:opacity-20 disabled:pointer-events-none"
                aria-label={language === 'ar' ? 'السابق' : 'Previous'}
              >
                {language === 'ar' ? (
                  <ArrowRight strokeWidth={1} size={16} />
                ) : (
                  <ArrowLeft strokeWidth={1} size={16} />
                )}
              </button>
              <button
                onClick={() => setActiveIndex((i) => Math.min(products.length - visibleCount, i + 1))}
                disabled={!canNext}
                className="w-10 h-10 border border-primary/10 flex items-center justify-center text-primary/40 hover:text-accent-primary hover:border-accent-primary transition-all disabled:opacity-20 disabled:pointer-events-none"
                aria-label={language === 'ar' ? 'التالي' : 'Next'}
              >
                {language === 'ar' ? (
                  <ArrowLeft strokeWidth={1} size={16} />
                ) : (
                  <ArrowRight strokeWidth={1} size={16} />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Product Cards */}
        <div ref={containerRef} className="overflow-hidden">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: maxItems }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {products.slice(activeIndex, activeIndex + Math.max(4, maxItems)).map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.7,
                      delay: idx * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="group flex flex-col gap-4"
                    >
                      <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                            <span className="text-primary/10 font-serif text-2xl">W</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-end gap-4">
                        <div className="min-w-0">
                          <h3 className="text-base font-serif text-primary group-hover:text-accent-primary transition-colors duration-300 truncate">
                            {product.name}
                          </h3>
                          <p className="text-[9px] uppercase tracking-[0.25em] text-primary/40 mt-1 font-bold">
                            {product.category}
                          </p>
                        </div>
                        <p className="text-[10px] font-bold tracking-widest text-primary/60 shrink-0">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
