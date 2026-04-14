'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Heart } from 'lucide-react';
import { toast } from 'sonner';

import { triggerHaptic } from '@/lib/utils/haptics';
import { useSelectionStore } from '@/store/useSelectionStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>('story');
  const { addItem } = useSelectionStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const sizes = Array.from(new Set(product.variants?.map(v => v.size) || []));

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast('Removed from The Vault');
    } else {
      addToWishlist(product);
      triggerHaptic();
      toast('Added to The Vault');
    }
  };

  const handleAddToSelection = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const variant = product.variants?.find(v => v.size === selectedSize);
    if (!variant) {
      toast.error('Selected variant not found');
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      variant: variant,
      image: product.images[0] || `https://images.unsplash.com/photo-1594913785162-e6786b42dea3?q=80&w=800&auto=format&fit=crop`,
      priceAtPurchase: product.price,
      quantity: 1,
    });
    
    toast.success('Item added to shopping bag');
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-6 break-words whitespace-normal text-balance leading-tight text-primary">{product.name}</h1>
        <p className="text-xl text-primary/80 tracking-widest font-light">{formatPrice(product.price)}</p>
      </div>

      {/* Size Selector */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm uppercase tracking-widest text-primary/70">Select Size</span>
          <button className="text-xs uppercase tracking-widest text-primary/50 hover:text-primary underline underline-offset-4">
            Size Guide
          </button>
        </div>
        <div className="flex gap-4 flex-wrap">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-sm uppercase tracking-widest transition-all duration-300 min-h-[44px] min-w-[44px] ${
                selectedSize === size
                  ? 'border border-primary bg-inverted text-inverted shadow-md'
                  : 'border border-primary/10 text-primary hover:border-primary/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-6">
        <div className="flex gap-4">
          <button
            onClick={() => {
              triggerHaptic();
              handleAddToSelection();
            }}
            className="flex-1 bg-inverted text-inverted py-5 uppercase tracking-widest text-sm hover:bg-accent-primary transition-all duration-500 shadow-xl min-h-[44px] flex items-center justify-center"
          >
            Add to Shopping Bag
          </button>
          <button 
            onClick={handleWishlistToggle}
            className="w-16 flex items-center justify-center border border-primary/20 hover:border-primary transition-colors"
            aria-label="Toggle Wishlist"
          >
            <Heart strokeWidth={1} className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-accent-primary text-accent-primary' : 'text-primary'}`} />
          </button>
        </div>
        <Link 
          href="https://wa.me/yournumber" 
          target="_blank"
          className="text-center text-[10px] uppercase tracking-[0.3em] text-primary/40 hover:text-primary transition-colors underline underline-offset-8"
        >
          Unsure about sizing? Speak with Customer Care.
        </Link>
      </div>

      {/* Stylist Note */}
      <div className="bg-primary/5 p-8 border-l-2 border-accent-primary shadow-sm">
        <p className="font-serif italic text-lg text-primary/80 leading-relaxed">
          &quot;Stylist Note: Complete the silhouette by pairing this piece with our signature evening accessories.&quot;
        </p>
      </div>

      {/* Accordions */}
      <div className="border-t border-primary/10">
        {[
          { id: 'story', title: 'Product Details', content: product.description },
          { id: 'fabric', title: 'Fabric & Care', content: '100% Mulberry Silk. Dry clean only. Do not bleach. Iron on low heat if necessary.' },
          { id: 'shipping', title: 'Shipping & Returns', content: 'Complimentary express shipping on all orders. Returns accepted within 14 days of delivery in original condition.' },
        ].map((section) => (
          <div key={section.id} className="border-b border-primary/10">
            <button
              onClick={() => toggleAccordion(section.id)}
              className="w-full flex justify-between items-center py-6 text-sm uppercase tracking-widest text-primary/80 hover:text-primary transition-colors"
            >
              {section.title}
              {openAccordion === section.id ? (
                <Minus strokeWidth={1} className="w-4 h-4" />
              ) : (
                <Plus strokeWidth={1} className="w-4 h-4" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                openAccordion === section.id ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-primary/70 leading-relaxed font-light">
                {section.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
