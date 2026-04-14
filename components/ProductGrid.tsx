'use client';

import { useState, use } from 'react';

import { Product } from '@/types';
import { getProducts } from '@/lib/services/product.service';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { auth } from '@/lib/firebase/client';
import { useTranslation } from '@/lib/hooks/useTranslation';

import { RevealOnScroll } from './RevealOnScroll';
import ProductCard from './ProductCard';

export default function ProductGrid({ viewMode = 'grid', initialProductsPromise }: { viewMode?: 'grid' | 'model', initialProductsPromise: Promise<{ products: Product[], lastDocId: string | null }> }) {
  const initialData = use(initialProductsPromise);
  const [products, setProducts] = useState<Product[]>(initialData.products);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error] = useState<string | null>(null);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(initialData.lastDocId);
  const [hasMore, setHasMore] = useState(initialData.products.length >= 12);
  const { t } = useTranslation();

  const loadMore = async () => {
    if (!lastCreatedAt || loadingMore) return;
    setLoadingMore(true);
    try {
      const { products: moreProducts, lastVisible } = await getProducts(12, lastCreatedAt);
      setProducts(prev => [...prev, ...moreProducts]);
      setLastCreatedAt(lastVisible);
      if (moreProducts.length < 12) setHasMore(false);
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.LIST, 'products', auth);
    } finally {
      setLoadingMore(false);
    }
  };

  if (error || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center max-w-2xl mx-auto">
        <h3 className="font-serif text-3xl text-primary mb-4 italic">{t.productGrid.emptyTitle}</h3>
        <p className="text-primary/60 font-light leading-relaxed tracking-wide">
          {t.productGrid.emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`grid gap-y-32 gap-x-8 w-full ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-12' : 'grid-cols-1 md:grid-cols-2'}`}>
        {products.map((product, idx) => (
          <RevealOnScroll 
            key={product.id} 
            delay={(idx % 3) * 0.1}
            className={viewMode === 'grid' ? `group flex flex-col items-start cursor-pointer ${
              idx % 3 === 0 ? 'md:col-span-6 md:col-start-1' :
              idx % 3 === 1 ? 'md:col-span-4 md:col-start-8 md:mt-48' :
              'md:col-span-8 md:col-start-3 md:mt-32'
            }` : 'group flex flex-col items-center cursor-pointer'}
          >
            <ProductCard product={product} viewMode={viewMode} idx={idx} />
          </RevealOnScroll>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-16 flex justify-center w-full">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-8 py-3 border border-primary/20 text-primary text-xs uppercase tracking-widest hover:bg-inverted hover:text-inverted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <span className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></span>
                {t.productGrid.loading}
              </>
            ) : (
              t.productGrid.loadMore
            )}
          </button>
        </div>
      )}
    </div>
  );
}
