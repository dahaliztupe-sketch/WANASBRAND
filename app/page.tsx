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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-gradient">
        <div className="absolute inset-0 linen-texture pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-24 pb-12">
          
          {/* Left Side: Massive Typography */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-12 z-20"
          >
            <span className="text-[10px] uppercase tracking-[0.8em] text-accent-primary font-bold block">
              The Atelier
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-[11rem] font-serif text-primary tracking-tighter leading-[0.85] whitespace-pre-line mix-blend-difference dark:mix-blend-normal">
              Redefining <br /> <span className="italic text-accent-primary">Modern</span> <br /> Grace.
            </h1>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="flex flex-col sm:flex-row items-start gap-8 pt-8"
            >
              <Link 
                href="/collections"
                className="group relative px-12 py-5 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.4em] font-bold overflow-hidden transition-all hover:bg-accent-primary hover:text-white invert dark:invert-0"
              >
                <span className="relative z-10">Explore Collection</span>
              </Link>
              <Link 
                href="/reserve"
                className="px-12 py-5 border border-primary/20 text-primary text-[10px] uppercase tracking-[0.4em] font-bold backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:invert dark:hover:invert-0 transition-all"
              >
                Private Viewing
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side: Overlapping Images */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
            className="lg:col-span-5 relative h-[60vh] lg:h-[80vh] w-full hidden md:block"
          >
            <div className="absolute top-0 right-0 w-[80%] h-[90%] bg-secondary overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1974&auto=format&fit=crop"
                alt="Editorial Fashion"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1.5, delay: 1 }}
              className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary p-2 shadow-2xl"
            >
              <div className="relative w-full h-full bg-secondary overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=2026&auto=format&fit=crop"
                  alt="Detail Shot"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-6 md:left-12 flex flex-col items-center gap-4"
        >
          <span className="text-[8px] uppercase tracking-[0.4em] text-primary/40 rotate-90 origin-left translate-y-8">Scroll</span>
          <div className="w-px h-24 bg-gradient-to-b from-primary/20 to-transparent mt-8" />
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
      <section className="relative py-48 px-6 bg-primary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2000&auto=format&fit=crop"
            alt="Atelier Background"
            fill
            className="object-cover grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary" />

        <RevealOnScroll className="relative z-10 max-w-4xl mx-auto text-center space-y-16">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-px h-24 bg-accent-primary/50" />
            <span className="text-[10px] uppercase tracking-[0.6em] text-accent-primary font-bold">Private Client Services</span>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-5xl md:text-8xl font-serif leading-[1.1] text-primary">
              Personalized <br />
              <span className="italic text-accent-primary">Atelier</span> Service
            </h2>
            <p className="text-primary/60 font-sans leading-relaxed text-lg max-w-2xl mx-auto">
              Experience fashion like never before. Our dedicated ambassadors are here to guide you through a personalized journey, from selection to final fitting, ensuring every piece is a perfect reflection of your essence.
            </p>
          </div>

          <div className="pt-8">
            <Link 
              href="/reserve"
              className="group relative inline-flex items-center justify-center px-16 py-6 bg-transparent border border-primary/20 text-primary text-[10px] uppercase tracking-[0.4em] font-bold overflow-hidden transition-all hover:border-primary"
            >
              <span className="absolute inset-0 w-0 bg-primary transition-all duration-[800ms] ease-out group-hover:w-full" />
              <span className="relative z-10 group-hover:text-primary-foreground group-hover:invert dark:group-hover:invert-0 transition-colors duration-500">
                Book a Consultation
              </span>
            </Link>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}


