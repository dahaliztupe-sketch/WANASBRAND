'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, Star, ShieldCheck, Clock } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

import FeaturedProducts from '@/components/FeaturedProducts';
import { RevealOnScroll } from '@/components/RevealOnScroll';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-primary text-primary overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden mesh-gradient">
        <div className="absolute inset-0 linen-texture pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-12 px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <span className="text-[10px] uppercase tracking-[0.8em] text-primary/40 font-light block">
              The Atelier
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif text-primary tracking-tighter leading-[0.85] whitespace-pre-line">
              Redefining <br /> Modern Grace.
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <Link 
              href="/collections"
              className="group relative px-16 py-6 bg-primary text-primary-foreground text-xs uppercase tracking-[0.4em] font-bold overflow-hidden transition-all hover:bg-accent-primary hover:text-white invert dark:invert-0"
            >
              <span className="relative z-10">Explore Collection</span>
            </Link>
            <Link 
              href="/reserve"
              className="px-16 py-6 border border-primary/20 text-primary text-xs uppercase tracking-[0.4em] font-bold backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:invert dark:hover:invert-0 transition-all"
            >
              Private Viewing
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[8px] uppercase tracking-[0.4em] text-primary/30">Discover</span>
          <div className="w-px h-16 bg-gradient-to-b from-primary/20 to-transparent" />
        </motion.div>
      </section>

      {/* Featured Collection */}
      <section className="py-32 px-6 bg-secondary/30">
        <RevealOnScroll className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary/40 font-bold">Current Season</span>
              <h2 className="text-4xl md:text-5xl font-serif text-primary">The Midnight Soirée</h2>
            </div>
            <Link 
              href="/collections"
              className="text-xs uppercase tracking-widest font-bold border-b border-primary pb-2 hover:text-accent-primary hover:border-accent-primary transition-all"
            >
              View Full Collection
            </Link>
          </div>

          <FeaturedProducts />
        </RevealOnScroll>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 bg-primary">
        <RevealOnScroll className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold">Our Philosophy</span>
              <h2 className="text-4xl md:text-6xl font-serif text-primary leading-tight">
                Crafting <span className="italic">Timeless</span> <br />
                Grace for the <br />
                Modern Silhouette.
              </h2>
            </div>
            <p className="text-primary/60 font-sans leading-relaxed max-w-md">
              At WANAS, we believe that fashion is a form of architectural grace. Our pieces are meticulously crafted to empower and inspire, blending traditional craftsmanship with contemporary silhouette.
            </p>
            <div className="grid grid-cols-2 gap-12 pt-8">
              <div className="space-y-4">
                <Star strokeWidth={1} className="w-6 h-6 text-accent-primary" />
                <h3 className="text-xs uppercase tracking-widest font-bold">Exquisite Quality</h3>
                <p className="text-xs text-primary/40 leading-relaxed font-sans">Only the finest fabrics sourced from around the globe.</p>
              </div>
              <div className="space-y-4">
                <ShieldCheck strokeWidth={1} className="w-6 h-6 text-accent-primary" />
                <h3 className="text-xs uppercase tracking-widest font-bold">Authenticity</h3>
                <p className="text-xs text-primary/40 leading-relaxed font-sans">Every piece comes with a digital certificate of authenticity.</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] bg-secondary overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
              alt="Craftsmanship"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
        </RevealOnScroll>
      </section>

      {/* Concierge Section */}
      <section className="py-32 px-6 bg-primary text-primary text-center border-t border-primary/5">
        <RevealOnScroll className="max-w-3xl mx-auto space-y-12">
          <Clock strokeWidth={1} className="w-12 h-12 mx-auto text-accent-primary stroke-[1px]" />
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-serif leading-tight">
              Personalized <br />
              <span className="italic">Atelier</span> Service
            </h2>
            <p className="text-primary/40 font-sans leading-relaxed text-sm max-w-xl mx-auto">
              Experience fashion like never before. Our dedicated ambassadors are here to guide you through a personalized journey, from selection to final fitting.
            </p>
          </div>
          <Link 
            href="/reserve"
            className="inline-block px-12 py-5 bg-primary text-primary-foreground text-xs uppercase tracking-[0.3em] font-bold hover:bg-accent-primary hover:text-white invert dark:invert-0 transition-all"
          >
            Book a Consultation
          </Link>
        </RevealOnScroll>
      </section>
    </main>
  );
}


