'use client';

import Link from 'next/link';
import { ShoppingBag, Heart, Package, ArrowRight, Ghost } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'orders';
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
}

const icons = {
  cart: ShoppingBag,
  wishlist: Heart,
  orders: Package,
};

const standardDescriptions = {
  cart: "Your shopping bag is empty.",
  wishlist: "Your wishlist is empty.",
  orders: "No orders found.",
};

export default function EmptyState({ type, title, description, ctaText = 'Explore The Collection', ctaLink = '/collections' }: EmptyStateProps) {
  const Icon = icons[type];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-40 px-6 text-center"
    >
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-accent-primary/5 rounded-full scale-[2] blur-3xl" />
        <Icon className="w-24 h-24 text-primary/20 stroke-[0.5px] relative z-10" />
      </div>
      <h3 className="text-3xl font-serif text-primary mb-6 tracking-tight">{title}</h3>
      <p className="text-primary/40 font-light max-w-md mb-16 leading-relaxed">
        {standardDescriptions[type] || description}
      </p>
      <Link 
        href={ctaLink}
        className="group flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] text-primary hover:text-accent-primary transition-all duration-700"
      >
        <div className="w-8 h-[1px] bg-inverted/20 group-hover:w-12 group-hover:bg-accent-primary transition-all duration-700" />
        {ctaText}
        <div className="w-8 h-[1px] bg-inverted/20 group-hover:w-12 group-hover:bg-accent-primary transition-all duration-700" />
      </Link>
    </motion.div>
  );
}
