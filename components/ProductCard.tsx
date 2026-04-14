'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useWishlistStore } from '@/store/useWishlistStore';
import { triggerHaptic } from '@/lib/utils/haptics';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'model';
  idx: number;
}

export default function ProductCard({ product, viewMode = 'grid', idx }: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const { t } = useTranslation();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeItem(product.id);
      toast(t.featuredProducts.removedFromVault);
    } else {
      addItem(product);
      triggerHaptic();
      toast(t.featuredProducts.addedToVault);
    }
  };

  return (
    <Link 
      href={`/product/${product.slug}`} 
      className="group flex flex-col items-start cursor-pointer w-full"
    >
      <div className={`relative w-full mb-6 overflow-hidden bg-[#FDFBF7] shadow-sm group-hover:shadow-xl transition-all duration-700 ${
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
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          className="object-cover object-center transition-transform duration-[2s] group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700" />
        
        <button 
          onClick={handleWishlistToggle} 
          className="absolute top-6 end-6 z-10 p-3 bg-[#FDFBF7]/90 backdrop-blur-md rounded-full hover:bg-[#FDFBF7] transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-500"
        >
          <Heart strokeWidth={1} className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#1A1A1A]'}`} />
        </button>
      </div>

      <div className={`flex ${viewMode === 'grid' ? 'flex-col md:flex-row md:items-end justify-between gap-4 w-full' : 'flex-col items-center text-center gap-2'}`}>
        <div className="space-y-1">
          <h2 className="font-serif text-3xl md:text-4xl leading-snug tracking-tight text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h2>
          <p className="font-tajawal text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/50">
            {product.category}
          </p>
        </div>
        <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold">
          <bdi>{formatPrice(product.price)}</bdi>
        </p>
      </div>
    </Link>
  );
}
