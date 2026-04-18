'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface RecentlyViewedProps {
  excludeId?: string;
}

export function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
  const [mounted, setMounted] = useState(false);
  const { items } = useRecentlyViewedStore();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const visible = items.filter((item) => item.id !== excludeId);
  if (visible.length === 0) return null;

  return (
    <section className="w-full max-w-[1600px] mx-auto px-6 py-24 border-t border-primary/5">
      <div className="flex items-center gap-4 mb-12">
        <Clock strokeWidth={1} className="w-4 h-4 text-accent-primary" />
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary/50 font-bold">
          {t.product?.recentlyViewed ?? 'Recently Viewed'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
        {visible.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Link href={`/product/${item.slug}`} className="group flex flex-col gap-3">
              <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 12vw"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-serif text-primary truncate group-hover:text-accent-primary transition-colors">
                  {item.name}
                </p>
                <p className="text-[9px] uppercase tracking-widest text-primary/40 mt-0.5 font-bold">
                  {item.price.toLocaleString()} EGP
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
