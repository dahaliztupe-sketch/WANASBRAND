'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Trash2, Heart } from 'lucide-react';
import { toast } from 'sonner';

import { useWishlistStore } from '@/store/useWishlistStore';
import { useSelectionStore } from '@/store/useSelectionStore';
import { triggerHaptic } from '@/lib/utils/haptics';
import { Product } from '@/types';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useSelectionStore();

  const handleMoveToBag = (product: Product) => {
    triggerHaptic();
    // Default to first variant if available
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      addItem({
        productId: product.id,
        productName: product.name,
        variant: variant,
        quantity: 1,
        priceAtPurchase: product.price,
        image: product.images[0],
      });
      removeItem(product.id);
      toast.success(`${product.name} moved to your bag.`);
    } else {
      toast.error('This item is currently unavailable.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-accent-primary/5 flex items-center justify-center text-accent-primary/20">
          <Heart strokeWidth={1} className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif text-primary">The Vault is Empty</h2>
          <p className="text-primary/40 font-light italic">Your curated selections will appear here.</p>
        </div>
        <Link 
          href="/collections/all" 
          className="px-8 py-4 bg-inverted text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-serif text-primary tracking-wide">The Vault</h1>
        <p className="text-primary/50 font-light tracking-wide">Your private collection of desired pieces.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {items.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`group space-y-6 ${idx % 3 === 1 ? 'lg:mt-12' : idx % 3 === 2 ? 'lg:mt-24' : ''}`}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-inverted/5">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              
              {/* Actions Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <button
                  onClick={() => handleMoveToBag(product)}
                  className="flex-1 bg-inverted text-inverted py-4 text-[8px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent-primary transition-colors"
                >
                  <ShoppingBag className="w-3 h-3" />
                  Move to Bag
                </button>
                <button
                  onClick={() => {
                    triggerHaptic();
                    removeItem(product.id);
                    toast.info('Item removed from The Vault.');
                  }}
                  className="w-12 bg-white/90 text-primary py-4 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <Link href={`/product/${product.slug || product.id}`} className="font-serif text-lg text-primary hover:text-accent-primary transition-colors">
                  {product.name}
                </Link>
                <p className="text-sm text-primary/60">EGP {product.price.toLocaleString()}</p>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-primary/40">{product.category}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
