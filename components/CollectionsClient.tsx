'use client';

import { ChevronDown } from 'lucide-react';
import { Suspense, useState } from 'react';

import ProductGrid from '@/components/ProductGrid';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import { Product } from '@/types';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function CollectionsClient({ initialProductsPromise }: { initialProductsPromise: Promise<{ products: Product[], lastDocId: string | null }> }) {
  const [viewMode, setViewMode] = useState<'grid' | 'model'>('grid');
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full min-h-screen bg-primary">
      {/* Header */}
      <section className="pt-48 pb-24 px-6 text-center max-w-6xl mx-auto">
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif tracking-tighter break-words whitespace-normal text-balance leading-[0.85] text-primary mix-blend-difference dark:mix-blend-normal">
          {t.collections.titleLine1} <br /><span className="italic text-accent-primary">{t.collections.titleLine2}</span>
        </h1>
        <p className="text-primary/50 text-[10px] uppercase tracking-[0.6em] mt-12 font-bold">
          {t.collections.subtitle}
        </p>
      </section>

      {/* Filters (Sticky) */}
      <div className="sticky top-20 z-40 bg-primary/95 backdrop-blur-md border-y border-primary/5 py-1">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-primary/70">
          <div className="flex gap-4 md:gap-8">
            <button className="flex items-center gap-2 hover:text-primary transition-colors min-h-[44px] px-2">
              {t.collections.filters.category} <ChevronDown strokeWidth={1} className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-2 hover:text-primary transition-colors min-h-[44px] px-2">
              {t.collections.filters.size} <ChevronDown strokeWidth={1} className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-2 hover:text-primary transition-colors min-h-[44px] px-2">
              {t.collections.filters.sortBy} <ChevronDown strokeWidth={1} className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 border-r border-primary/10 pr-6 mr-6">
              <button 
                onClick={() => setViewMode('grid')}
                className={`transition-colors ${viewMode === 'grid' ? 'text-primary' : 'text-primary/30'}`}
                aria-label="Switch to Grid View"
              >
                {t.collections.view.grid}
              </button>
              <button 
                onClick={() => setViewMode('model')}
                className={`transition-colors ${viewMode === 'model' ? 'text-primary' : 'text-primary/30'}`}
                aria-label="Switch to Model View"
              >
                {t.collections.view.model}
              </button>
            </div>
            <div className="hidden lg:flex items-center min-h-[44px] text-primary/40">
              {t.collections.showingAll}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <Suspense fallback={
          <div className={`grid gap-x-8 gap-y-16 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        }>
          <ProductGrid viewMode={viewMode} initialProductsPromise={initialProductsPromise} />
        </Suspense>
      </section>
    </div>
  );
}
