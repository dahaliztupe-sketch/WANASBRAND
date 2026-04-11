'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toast } from 'sonner';
import { RevealOnScroll } from './RevealOnScroll';
import { triggerHaptic } from '@/lib/utils/haptics';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'Published'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data() as Product;
          return { ...data, id: doc.id };
        });
        setProducts(productsData);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.LIST, 'products', auth);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`flex flex-col items-start ${
            i === 0 ? 'md:col-span-6 md:col-start-1' :
            i === 1 ? 'md:col-span-4 md:col-start-8 md:mt-48' :
            'md:col-span-8 md:col-start-3 md:mt-32'
          }`}>
            <div className={`w-full ${
              i === 0 ? 'aspect-[3/4]' :
              i === 1 ? 'aspect-[4/5]' :
              'aspect-[16/9]'
            } mb-8 bg-primary/5 animate-pulse rounded-sm`}></div>
            <div className="h-6 bg-primary/5 animate-pulse rounded-sm w-3/4 mb-2"></div>
            <div className="h-4 bg-primary/5 animate-pulse rounded-sm w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="text-center py-24 bg-primary/5 rounded-2xl border border-primary/10 backdrop-blur-sm">
        <h3 className="font-serif text-2xl text-primary mb-3 italic">{t.featuredProducts.curatingTitle}</h3>
        <p className="text-primary/60 font-light max-w-md mx-auto px-6 leading-relaxed">
          {t.featuredProducts.curatingDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-8">
      {products.map((product, idx) => (
        <RevealOnScroll 
          key={product.id} 
          delay={idx * 0.1}
          className={`group flex flex-col items-start cursor-pointer ${
            idx === 0 ? 'md:col-span-6 md:col-start-1' :
            idx === 1 ? 'md:col-span-4 md:col-start-8 md:mt-48' :
            'md:col-span-8 md:col-start-3 md:mt-32'
          }`}
        >
          <Link href={`/product/${product.slug}`} className="w-full">
            <div className={`relative w-full ${
              idx === 0 ? 'aspect-[3/4]' :
              idx === 1 ? 'aspect-[4/5]' :
              'aspect-[16/9]'
            } mb-8 overflow-hidden bg-primary shadow-sm group-hover:shadow-xl transition-all duration-700`}>
              <Image
                src={product.images[0] || `https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop`}
                alt={product.name}
                fill
                quality={100}
                priority={idx === 0}
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
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h3 className="font-serif text-3xl md:text-4xl tracking-tight break-words whitespace-normal text-balance leading-snug group-hover:text-accent-primary transition-colors text-primary">
                {product.name}
              </h3>
              <p className="text-secondary text-[10px] uppercase tracking-[0.3em] font-bold">
                <bdi>{formatPrice(product.price)}</bdi>
              </p>
            </div>
          </Link>
        </RevealOnScroll>
      ))}
    </div>
  );
}
