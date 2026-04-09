'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toast } from 'sonner';
import { RevealOnScroll } from './RevealOnScroll';
import { triggerHaptic } from '@/lib/utils/haptics';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        console.error("Error fetching featured products:", err);
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
        const message = err instanceof Error ? err.message : "Permission Denied";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-full aspect-[3/4] mb-8 bg-primary/5 animate-pulse rounded-sm"></div>
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
        <h3 className="font-serif text-2xl text-primary mb-3 italic">Curating the Collection</h3>
        <p className="text-primary/60 font-light max-w-md mx-auto px-6 leading-relaxed">
          Our latest collection is currently being prepared for its debut. 
          Each piece is selected to bring tranquility and craftsmanship to your wardrobe.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {products.map((product, idx) => (
        <RevealOnScroll key={product.id} delay={idx * 0.1}>
          <Link href={`/product/${product.slug}`} className="group flex flex-col items-center cursor-pointer">
            <div className="relative w-full aspect-[3/4] mb-8 overflow-hidden bg-primary shadow-sm group-hover:shadow-md transition-shadow duration-500">
              <Image
                src={product.images[0] || `https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop`}
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
            </div>
            <h3 className="font-serif text-2xl tracking-tight break-words whitespace-normal text-balance text-center leading-snug group-hover:text-accent-primary transition-colors text-primary">
              {product.name}
            </h3>
            <p className="mt-2 text-secondary text-sm uppercase tracking-widest font-light">
              {formatPrice(product.price)}
            </p>
          </Link>
        </RevealOnScroll>
      ))}
    </div>
  );
}
