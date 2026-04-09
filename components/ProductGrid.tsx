'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toast } from 'sonner';
import { getProducts } from '@/lib/services/product.service';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

import { RevealOnScroll } from './RevealOnScroll';
import { ProductSkeleton } from './ProductSkeleton';
import { triggerHaptic } from '@/lib/utils/haptics';

export default function ProductGrid({ viewMode = 'grid' }: { viewMode?: 'grid' | 'model' }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast('Removed from The Vault');
    } else {
      addToWishlist(product);
      triggerHaptic();
      toast('Added to The Vault');
    }
  };

  const fetchInitialProducts = async () => {
    try {
      const { products: initialProducts, lastVisible } = await getProducts(12);
      setProducts(initialProducts);
      setLastDoc(lastVisible);
      if (initialProducts.length < 12) setHasMore(false);
    } catch (err: unknown) {
      console.error("Error fetching products:", err);
      const message = err instanceof Error ? err.message : "Permission Denied";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const { products: moreProducts, lastVisible } = await getProducts(12, lastDoc);
      setProducts(prev => [...prev, ...moreProducts]);
      setLastDoc(lastVisible);
      if (moreProducts.length < 12) setHasMore(false);
    } catch (err: unknown) {
      console.error("Error loading more products:", err);
      toast.error("Failed to load more pieces");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInitialProducts();
  }, []);

  if (loading) {
    return (
      <div className={`grid gap-x-8 gap-y-16 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center max-w-2xl mx-auto">
        <h3 className="font-serif text-3xl text-primary mb-4 italic">Our collection is being prepared</h3>
        <p className="text-primary/60 font-light leading-relaxed tracking-wide">
          Each piece in the WANAS collection is crafted with intentionality and care. 
          We are currently preparing our next selection of ready-to-wear essentials. 
          Please check back shortly or contact our customer care team for private viewings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`grid gap-x-8 gap-y-16 w-full ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
        {products.map((product, idx) => (
          <RevealOnScroll key={product.id} delay={(idx % 4) * 0.1}>
            <Link 
              href={`/product/${product.slug}`} 
              className="group flex flex-col cursor-pointer"
            >
              <div className={`relative w-full mb-6 overflow-hidden bg-primary shadow-sm group-hover:shadow-md transition-all duration-700 ${viewMode === 'grid' ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}>
                <Image
                  src={product.images[0] || `https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop`}
                  alt={product.name}
                  fill
                  quality={100}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                  className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={(e) => handleWishlistToggle(e, product)} 
                  className="absolute top-4 right-4 z-10 p-2 bg-primary/80 rounded-full hover:bg-primary transition-colors"
                >
                  <Heart strokeWidth={1} className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-accent-primary text-accent-primary' : 'text-primary'}`} />
                </button>
                {/* Quick Add Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-primary/80 backdrop-blur-sm">
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      triggerHaptic();
                      toast('Quick Add coming soon.'); 
                    }}
                    className="w-full py-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest hover:bg-accent-primary transition-colors invert dark:invert-0"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-serif text-lg tracking-tight group-hover:text-accent-primary transition-colors text-primary">
                  {product.name}
                </h2>
                <p className="text-primary/50 text-[10px] uppercase tracking-[0.2em] font-light">
                  {product.category}
                </p>
                <p className="text-primary/70 text-xs tracking-widest font-medium mt-1">
                  {formatPrice(product.price)}
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
                Loading...
              </>
            ) : (
              'Load More Pieces'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
