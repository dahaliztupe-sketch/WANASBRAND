'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, GitCompare, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useQuickViewStore } from '@/store/useQuickViewStore';
import { useCompareStore } from '@/store/useCompareStore';
import { triggerHaptic } from '@/lib/utils/haptics';
import { useTranslation } from '@/lib/hooks/useTranslation';

export type BentoSize = 'hero' | 'tall' | 'wide' | 'compact' | 'feature';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'model';
  idx: number;
  bentoSize?: BentoSize;
}

const ASPECT_MAP: Record<BentoSize, string> = {
  hero: 'aspect-[3/4]',
  tall: 'aspect-[4/5]',
  wide: 'aspect-[16/9]',
  compact: 'aspect-square',
  feature: 'aspect-[2/3]',
};

export default function ProductCard({ product, viewMode = 'grid', idx, bentoSize }: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const { open: openQuickView } = useQuickViewStore();
  const { addItem: addToCompare, removeItem: removeFromCompare, isInCompare } = useCompareStore();
  const { t } = useTranslation();

  const isBento = !!bentoSize;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeItem(product.id);
      toast(t.featuredProducts.removedFromVault);
    } else {
      addItem(product);
      triggerHaptic();
      toast(t.featuredProducts.addedToVault);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic();
    openQuickView(product);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
      triggerHaptic();
    }
  };

  const imageAspect = bentoSize
    ? ASPECT_MAP[bentoSize]
    : viewMode === 'grid'
    ? idx % 3 === 0
      ? 'aspect-[3/4]'
      : idx % 3 === 1
      ? 'aspect-[4/5]'
      : 'aspect-[16/9]'
    : 'aspect-[3/4]';

  if (isBento) {
    return (
      <Link
        href={`/product/${product.slug}`}
        className="group relative block w-full h-full overflow-hidden bg-[#1A1A1A] cursor-pointer"
      >
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop'}
          alt={product.name}
          fill
          quality={90}
          sizes="(max-width: 768px) 100vw, 50vw"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          className="object-cover object-center transition-transform duration-[2.5s] ease-out group-hover:scale-110"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-75 group-hover:opacity-95 transition-opacity duration-700" />

        <div className="absolute top-3 end-3 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <button
            onClick={handleWishlistToggle}
            className="p-2 bg-black/60 backdrop-blur-md hover:bg-[#D4AF37] transition-all duration-300 group/btn"
            aria-label="Toggle wishlist"
          >
            <Heart strokeWidth={1} className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white'}`} />
          </button>
          <button
            onClick={handleQuickView}
            className="p-2 bg-black/60 backdrop-blur-md hover:bg-[#D4AF37] transition-all duration-300 group/btn"
            aria-label="Quick View"
          >
            <Eye strokeWidth={1} className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={handleCompare}
            className="p-2 bg-black/60 backdrop-blur-md hover:bg-[#D4AF37] transition-all duration-300 group/btn"
            aria-label="Compare"
          >
            <GitCompare strokeWidth={1} className={`w-3.5 h-3.5 ${isInCompare(product.id) ? 'text-[#D4AF37]' : 'text-white'}`} />
          </button>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 z-10">
          {product.category && (
            <span className="block text-[8px] uppercase tracking-[0.4em] text-white/50 font-bold mb-1.5">
              {product.category}
            </span>
          )}
          <div className="flex items-end justify-between gap-3">
            <h2 className={`font-serif text-white leading-tight transition-colors duration-300 group-hover:text-[#D4AF37] ${
              bentoSize === 'hero' || bentoSize === 'feature'
                ? 'text-2xl md:text-3xl lg:text-4xl'
                : bentoSize === 'wide'
                ? 'text-xl md:text-2xl'
                : 'text-xl'
            }`}>
              {product.name}
            </h2>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[#D4AF37] text-[9px] uppercase tracking-[0.3em] font-bold hidden sm:block">
                <bdi>{formatPrice(product.price)}</bdi>
              </span>
              <div className="w-7 h-7 flex items-center justify-center border border-white/20 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] transition-all duration-300 flex-shrink-0">
                <ArrowUpRight strokeWidth={1.5} className="w-3.5 h-3.5 text-white group-hover:text-black transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col items-start cursor-pointer w-full"
    >
      <div className={`relative w-full mb-6 overflow-hidden bg-[#FDFBF7] shadow-sm group-hover:shadow-xl transition-all duration-700 ${imageAspect}`}>
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop'}
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

        <div className="absolute top-4 end-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleWishlistToggle}
            className="p-2.5 bg-[#FDFBF7]/90 backdrop-blur-md rounded-full hover:bg-[#FDFBF7] transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-500"
            aria-label="Toggle wishlist"
          >
            <Heart strokeWidth={1} className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#1A1A1A]'}`} />
          </button>
          <button
            onClick={handleQuickView}
            className="p-2.5 bg-[#FDFBF7]/90 backdrop-blur-md rounded-full hover:bg-[#FDFBF7] transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-500 delay-75"
            aria-label="Quick View"
          >
            <Eye strokeWidth={1} className="w-4 h-4 text-[#1A1A1A]" />
          </button>
          <button
            onClick={handleCompare}
            className="p-2.5 bg-[#FDFBF7]/90 backdrop-blur-md rounded-full hover:bg-[#FDFBF7] transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-500 delay-150"
            aria-label="Add to Compare"
          >
            <GitCompare strokeWidth={1} className={`w-4 h-4 ${isInCompare(product.id) ? 'text-[#D4AF37]' : 'text-[#1A1A1A]'}`} />
          </button>
        </div>

        <div className="absolute bottom-0 inset-x-0 py-2.5 bg-[#1A1A1A]/80 backdrop-blur-sm text-center opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-500">
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#FDFBF7]/90 font-bold">Quick View</span>
        </div>
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
