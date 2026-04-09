'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '@/types';
import Image from 'next/image';
import { useSelectionStore } from '@/store/useSelectionStore';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import ConciergeChat from './ConciergeChat';

interface ProductDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDrawer({ product, isOpen, onClose }: ProductDrawerProps) {
  const { addItem } = useSelectionStore();
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  if (!isOpen || !product) return null;

  const handleReserve = () => {
    const variant = product.variants[0];
    if (!variant) {
      toast.error('No variants available');
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      variant: variant,
      image: product.images[0] || '',
      priceAtPurchase: product.price,
      quantity: 1,
    });
    toast.success('Added to selection');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-inverted/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-primary p-8 shadow-2xl h-full overflow-y-auto">
        <button onClick={onClose} className="mb-8 text-primary/50 hover:text-primary">
          <X strokeWidth={1} size={24} />
        </button>
        
        <div className="relative aspect-[3/4] bg-inverted/5 mb-8">
          <Image src={product.images[0] || ''} alt={product.name} fill className="object-cover" />
        </div>
        
        <h2 className="font-serif text-2xl text-primary mb-4">{product.name}</h2>
        <p className="text-primary/70 mb-8">{product.description}</p>
        <p className="text-lg text-primary mb-8">{formatPrice(product.price)}</p>
        
        <button
          onClick={handleReserve}
          className="w-full py-4 bg-inverted text-inverted tracking-widest text-sm uppercase hover:bg-inverted/90 transition-colors mb-4"
        >
          Reserve
        </button>
        <button
          onClick={() => setIsConciergeOpen(true)}
          className="block w-full py-4 border border-primary/20 text-primary text-center tracking-widest text-sm uppercase hover:bg-primary/5 transition-colors"
        >
          Request Concierge
        </button>
      </div>

      {isConciergeOpen && <ConciergeChat onClose={() => setIsConciergeOpen(false)} />}
    </div>
  );
}
