'use client';

import { use } from 'react';
import { motion } from 'motion/react';

import { Product } from '@/types';
import { useTranslation } from '@/lib/hooks/useTranslation';
import ProductCard, { type BentoSize } from './ProductCard';
import { RevealOnScroll } from './RevealOnScroll';

const FEATURED_SIZES: BentoSize[] = ['hero', 'tall', 'wide'];
const FEATURED_GRID_CLASS = [
  'col-span-12 md:col-span-7 row-span-2',
  'col-span-12 md:col-span-5 row-span-2',
  'col-span-12 row-span-1',
];

export default function FeaturedProducts({ featuredProductsPromise = Promise.resolve([]) }: { featuredProductsPromise?: Promise<Product[]> }) {
  const products = use(featuredProductsPromise);
  const { t } = useTranslation();

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-24 bg-primary/5 border border-primary/10">
        <h3 className="font-serif text-2xl text-primary mb-3 italic">{t.featuredProducts.curatingTitle}</h3>
        <p className="text-primary/60 font-light max-w-md mx-auto px-6 leading-relaxed">
          {t.featuredProducts.curatingDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-1 md:gap-1.5 auto-rows-[260px] md:auto-rows-[340px] lg:auto-rows-[380px]">
      {products.slice(0, 3).map((product, idx) => (
        <RevealOnScroll
          key={product.id}
          delay={idx * 0.12}
          className={FEATURED_GRID_CLASS[idx] ?? 'col-span-12'}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
          >
            <ProductCard
              product={product}
              viewMode="grid"
              idx={idx}
              bentoSize={FEATURED_SIZES[idx]}
            />
          </motion.div>
        </RevealOnScroll>
      ))}
    </div>
  );
}
