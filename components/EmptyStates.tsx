'use client';

import Link from 'next/link';
import { ShoppingBag, Heart, Package, ArrowRight, Ghost } from 'lucide-react';
import { motion } from 'motion/react';

import { useTranslation } from '@/lib/hooks/useTranslation';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'orders';
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

const icons = {
  cart: ShoppingBag,
  wishlist: Heart,
  orders: Package,
};

export default function EmptyState({ type, title, description, ctaText, ctaLink = '/collections' }: EmptyStateProps) {
  const Icon = icons[type];
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-48 px-6 text-center"
    >
      <div className="relative mb-16">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-accent-primary rounded-full blur-3xl" 
        />
        <Icon className="w-32 h-32 text-primary/10 stroke-[0.3px] relative z-10" />
      </div>
      <h3 className="text-4xl md:text-5xl font-serif text-primary mb-8 tracking-tight italic">{title}</h3>
      <p className="text-primary/40 font-light max-w-md mb-20 leading-relaxed text-lg">
        {description || t.emptyStates.descriptions[type]}
      </p>
      <Link 
        href={ctaLink}
        className="group relative inline-flex items-center justify-center px-16 py-6 bg-transparent border border-primary/20 text-primary text-[10px] uppercase tracking-[0.4em] font-bold overflow-hidden transition-all hover:border-primary"
      >
        <span className="absolute inset-0 w-0 bg-primary transition-all duration-[800ms] ease-out group-hover:w-full" />
        <span className="relative z-10 group-hover:text-primary-foreground group-hover:invert dark:group-hover:invert-0 transition-colors duration-500">
          {ctaText || t.emptyStates.cta}
        </span>
      </Link>
    </motion.div>
  );
}
