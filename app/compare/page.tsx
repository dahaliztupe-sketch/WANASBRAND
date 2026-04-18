'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Check, X, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

import { collection, getDocs, where, query, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useQuickViewStore } from '@/store/useQuickViewStore';

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids') || '';
  const ids = idsParam.split(',').filter(Boolean).slice(0, 3);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useTranslation();
  const { open: openQuickView } = useQuickViewStore();
  const isAr = language === 'ar';

  useEffect(() => {
    const fetchProducts = async () => {
      if (ids.length === 0) { setLoading(false); return; }
      const fetched: Product[] = [];
      for (const id of ids) {
        try {
          const docRef = doc(db, 'products', id);
          const snap = await getDoc(docRef);
          if (snap.exists()) fetched.push({ ...snap.data() as Product, id: snap.id });
        } catch { /* ignore */ }
      }
      setProducts(fetched);
      setLoading(false);
    };
    fetchProducts();
  }, [idsParam]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-t border-accent-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (products.length < 2) {
    return (
      <div className="min-h-screen pt-32 text-center px-6">
        <p className="text-primary/50 mb-6">{isAr ? 'أضيفي منتجين على الأقل للمقارنة' : 'Add at least 2 products to compare'}</p>
        <Link href="/collections" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest py-3 px-8 bg-primary text-inverted">
          {isAr ? <ArrowLeft size={12} /> : null}
          {isAr ? 'العودة للمجموعات' : 'Browse Collections'}
          {!isAr ? <ArrowLeft size={12} className="rotate-180" /> : null}
        </Link>
      </div>
    );
  }

  const ATTRIBUTES = [
    { key: 'price', label: isAr ? 'السعر' : 'Price', render: (p: Product) => formatPrice(p.price) },
    { key: 'category', label: isAr ? 'الفئة' : 'Category', render: (p: Product) => p.category },
    { key: 'description', label: isAr ? 'الوصف' : 'Description', render: (p: Product) => <span className="text-primary/60 text-xs line-clamp-3">{p.description}</span> },
    { key: 'variants', label: isAr ? 'المقاسات المتاحة' : 'Available Sizes', render: (p: Product) => {
      const sizes = [...new Set(p.variants?.filter(v => v.stock > 0).map(v => v.size))];
      return sizes.length > 0 ? sizes.join(', ') : (isAr ? 'غير متوفر' : 'Out of stock');
    }},
    { key: 'inStock', label: isAr ? 'التوفر' : 'Availability', render: (p: Product) => {
      const inStock = p.variants?.some(v => v.stock > 0);
      return inStock
        ? <span className="text-green-600 flex items-center gap-1"><Check size={12} /> {isAr ? 'متوفر' : 'In Stock'}</span>
        : <span className="text-red-500 flex items-center gap-1"><X size={12} /> {isAr ? 'غير متوفر' : 'Out of Stock'}</span>;
    }},
  ];

  return (
    <main className="min-h-screen bg-primary pt-24 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link href="/collections" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/50 hover:text-primary transition-colors mb-12">
          <ArrowLeft size={12} strokeWidth={1.5} />
          {isAr ? 'العودة' : 'Back to Collections'}
        </Link>

        <h1 className="font-serif text-4xl text-primary mb-16 text-center">
          {isAr ? 'مقارنة المنتجات' : 'Product Comparison'}
        </h1>

        {/* Products grid */}
        <div className={`grid grid-cols-${products.length} gap-6 mb-16`}>
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col"
            >
              <div className="relative aspect-[3/4] overflow-hidden mb-4 cursor-pointer group" onClick={() => openQuickView(product)}>
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="33vw" />
                ) : (
                  <div className="w-full h-full bg-secondary" />
                )}
              </div>
              <h2 className="font-serif text-xl text-primary mb-1">{product.name}</h2>
              <p className="text-accent-primary text-[10px] uppercase tracking-widest font-bold mb-4">{formatPrice(product.price)}</p>
              <Link
                href={`/product/${product.slug}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-primary text-inverted text-[9px] uppercase tracking-widest hover:bg-accent-primary transition-colors"
              >
                <ShoppingBag size={12} strokeWidth={1.5} />
                {isAr ? 'عرض المنتج' : 'View Product'}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Attributes table */}
        <div className="border border-primary/10">
          {ATTRIBUTES.map((attr, attrIdx) => (
            <div key={attr.key} className={`grid grid-cols-${products.length + 1} ${attrIdx % 2 === 0 ? 'bg-secondary/30' : ''}`}>
              <div className="p-4 border-e border-primary/10">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60">{attr.label}</span>
              </div>
              {products.map((product) => (
                <div key={product.id} className="p-4 text-sm text-primary border-e border-primary/10 last:border-e-0">
                  {attr.render(product)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-t border-accent-primary rounded-full animate-spin" />
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
