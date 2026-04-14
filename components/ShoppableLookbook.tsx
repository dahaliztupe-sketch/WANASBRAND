'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

import { db } from '@/lib/firebase/client';
import { ProductDrawer } from '@/components/ProductDrawer';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useWishlistStore } from '@/store/useWishlistStore';
import { triggerHaptic } from '@/lib/utils/haptics';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function ShoppableLookbook() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { t } = useTranslation();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // Prevent opening the drawer when clicking wishlist
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast(t.productGrid.removedFromVault);
    } else {
      addToWishlist(product);
      triggerHaptic();
      toast(t.productGrid.addedToVault);
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'Published'),
          limit(2)
        );
        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching lookbook products:", err);
        if (err && typeof err === 'object' && 'code' in err && err.code === 'permission-denied') {
          console.error('Missing or insufficient permissions. Please check Firestore security rules.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto w-full">
      {/* SEO Fallback for Crawlers & Accessibility (WAN-032) */}
      <noscript>
        <div className="p-8 bg-secondary text-primary border border-primary/10 mb-8">
          <h2 className="font-serif text-2xl mb-4">Featured in this Lookbook</h2>
          <ul className="space-y-4">
            {products.map(p => (
              <li key={p.id} className="border-b border-primary/5 pb-4">
                <a href={`/product/${p.slug || p.id}`} className="group">
                  <span className="block font-serif text-lg group-hover:text-accent-primary transition-colors">{p.name}</span>
                  <span className="text-sm text-secondary">{formatPrice(p.price)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </noscript>
      <div className="sr-only" aria-live="polite">
        <h2>Shoppable Lookbook: {t.lookbook.architecture}</h2>
        <p>Explore our curated collection through this interactive lookbook. Featured pieces include:</p>
        <ul>
          {products.map(p => (
            <li key={p.id}>
              <a href={`/product/${p.slug || p.id}`}>{p.name} - {formatPrice(p.price)}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col lg:flex-row gap-24 items-center">
        {/* Left: Mood Image Placeholder */}
        <div className="w-full lg:w-3/5 relative aspect-[4/5] bg-accent-primary/10 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-primary/30 mb-8">{t.lookbook.mood}</span>
            <h3 className="font-serif text-4xl md:text-6xl text-primary/20 leading-tight">
              {t.lookbook.architecture}
            </h3>
          </div>
          {/* Subtle line art overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0, 50 0, 100 100" stroke="currentColor" fill="transparent" strokeWidth="0.1" />
          </svg>
        </div>

        {/* Right: Floating Product Cards */}
        <div className="w-full lg:w-2/5 relative min-h-[600px] flex flex-col justify-center">
          {loading ? (
            <div className="animate-pulse flex flex-col gap-12">
              <div className="w-64 h-80 bg-primary shadow-diffused ml-auto" />
              <div className="w-64 h-80 bg-primary shadow-diffused -mt-20" />
            </div>
          ) : (
            <>
              {products[0] && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="relative z-10 ml-auto w-4/5 shadow-diffused bg-primary p-6 group cursor-pointer"
                  onClick={() => handleProductClick(products[0])}
                >
                  <div className="relative block">
                    <div className="aspect-[3/4] bg-primary/5 mb-6 overflow-hidden relative">
                       <Image 
                        src={products[0].images[0] || 'https://images.unsplash.com/photo-1594913785162-e6786b42dea3?q=80&w=800&auto=format&fit=crop'}
                        alt={products[0].name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={true}
                        quality={85}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <button 
                        onClick={(e) => handleWishlistToggle(e, products[0])} 
                        className="absolute top-4 right-4 z-10 p-2 bg-primary/80 rounded-full hover:bg-primary transition-colors"
                      >
                        <Heart strokeWidth={1} className={`w-4 h-4 ${isInWishlist(products[0].id) ? 'fill-accent-primary text-accent-primary' : 'text-primary'}`} />
                      </button>
                    </div>
                    <h4 className="font-serif text-xl text-primary mb-2">{products[0].name}</h4>
                    <p className="text-xs uppercase tracking-widest text-secondary">{formatPrice(products[0].price)}</p>
                  </div>
                </motion.div>
              )}

              {products[1] && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="relative z-20 -mt-32 mr-auto w-4/5 shadow-diffused bg-primary p-6 group cursor-pointer"
                  onClick={() => handleProductClick(products[1])}
                >
                  <div className="relative block">
                    <div className="aspect-[3/4] bg-primary/5 mb-6 overflow-hidden relative">
                      <Image 
                        src={products[1].images[0] || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop'}
                        alt={products[1].name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={85}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <button 
                        onClick={(e) => handleWishlistToggle(e, products[1])} 
                        className="absolute top-4 right-4 z-10 p-2 bg-primary/80 rounded-full hover:bg-primary transition-colors"
                      >
                        <Heart strokeWidth={1} className={`w-4 h-4 ${isInWishlist(products[1].id) ? 'fill-accent-primary text-accent-primary' : 'text-primary'}`} />
                      </button>
                    </div>
                    <h4 className="font-serif text-xl text-primary mb-2">{products[1].name}</h4>
                    <p className="text-xs uppercase tracking-widest text-secondary">{formatPrice(products[1].price)}</p>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
      <ProductDrawer product={selectedProduct} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </section>
  );
}
