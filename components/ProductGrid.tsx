'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toast } from 'sonner';
import { getProducts } from '@/lib/services/product.service';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { auth } from '@/lib/firebase/client';

import { RevealOnScroll } from './RevealOnScroll';
import { ProductSkeleton } from './ProductSkeleton';
import { triggerHaptic } from '@/lib/utils/haptics';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function ProductGrid({ viewMode = 'grid', initialProductsPromise }: { viewMode?: 'grid' | 'model', initialProductsPromise: Promise<{ products: Product[], lastDocId: string | null }> }) {
  const initialData = use(initialProductsPromise);
  const [products, setProducts] = useState<Product[]>(initialData.products);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(initialData.lastDocId);
  const [hasMore, setHasMore] = useState(initialData.products.length >= 12);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { t } = useTranslation();

  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast(t.featuredProducts.removedFromVault);
    } else {
      addToWishlist(product);
      triggerHaptic();
      toast(t.featuredProducts.addedToVault);
    }
  };

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
            <Link 
              href={`/product/${product.slug}`} 
              className="w-full"
            >
              <div className={`relative w-full mb-8 overflow-hidden bg-primary shadow-sm group-hover:shadow-xl transition-all duration-700 ${
                viewMode === 'grid' ? (
                  idx % 3 === 0 ? 'aspect-[3/4]' :
                  idx % 3 === 1 ? 'aspect-[4/5]' :
                  'aspect-[16/9]'
                ) : 'aspect-[3/4]'
              }`}>
                <Image
                  src={product.images[0] || `https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop`}
                  alt={product.name}
                  fill
                  quality={100}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                  className="object-cover object-center transition-transform duration-[2s] group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700" />
                <button 
                  onClick={(e) => handleWishlistToggle(e, product)} 
                  className="absolute top-6 end-6 z-10 p-3 bg-primary/90 backdrop-blur-md rounded-full hover:bg-primary transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-500"
                >
                  <Heart strokeWidth={1} className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-accent-primary text-accent-primary' : 'text-primary'}`} />
                </button>
                {/* Quick Add Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out bg-primary/90 backdrop-blur-md">
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      triggerHaptic();
                      toast(t.productGrid.quickAddComingSoon); 
                    }}
                    className="w-full py-4 bg-transparent border border-primary/20 text-primary text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-primary hover:text-primary-foreground hover:invert dark:hover:invert-0 transition-all"
                  >
                    {t.productGrid.quickAdd}
                  </button>
                </div>
              </div>
              <div className={`flex ${viewMode === 'grid' ? 'flex-col md:flex-row md:items-end justify-between gap-4' : 'flex-col items-center text-center gap-2'}`}>
                <div className="space-y-1">
                  <h2 className={`font-serif tracking-tight group-hover:text-accent-primary transition-colors text-primary ${viewMode === 'grid' ? 'text-3xl md:text-4xl leading-snug' : 'text-2xl'}`}>
                    {product.name}
                  </h2>
                  <p className="text-primary/50 text-[10px] uppercase tracking-[0.3em] font-bold">
                    {product.category}
                  </p>
                </div>
                <p className="text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">
                  <bdi>{formatPrice(product.price)}</bdi>
                </p>
              </div>
            </Link>
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
