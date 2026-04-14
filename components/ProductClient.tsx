'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageCircle, ShieldCheck, Truck, Wind, Layers, Camera, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';

import { VariantSelector } from '@/components/VariantSelector';
import FeaturedProducts from '@/components/FeaturedProducts';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { Product } from '@/types';
import { useTranslation } from '@/lib/hooks/useTranslation';

const ARViewer = dynamic(() => import('@/components/ARViewer'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40 text-[10px] uppercase tracking-widest">Loading Virtual Sanctuary...</div>
});

interface ProductClientProps {
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  const [isAROpen, setIsAROpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAROpen(false);
    };

    if (isAROpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isAROpen]);

  const mainImage = product.images?.[0] || 'https://picsum.photos/seed/gown/1920/1080';
  const whatsappLink = `https://wa.me/201090946772?text=Greetings WANAS Atelier. I am inquiring about ${product.name} (Ref: ${product.id}).`;

  return (
    <main className="min-h-screen bg-primary font-serif selection:bg-accent-primary selection:text-white pb-32">
      <div className="w-full max-w-[1600px] mx-auto px-6 pt-12 lg:pt-24 grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
        
        {/* Left Content Section - Sticky */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-16 lg:sticky lg:top-24 z-20">
          <RevealOnScroll>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <p className="text-[10px] uppercase tracking-[0.6em] text-accent-primary font-bold">{t.product.atelierSilhouette}</p>
                <span className="w-16 h-px bg-primary/20"></span>
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary/40">{product.category}</p>
              </div>
              <h1 className="text-6xl lg:text-[7rem] font-light tracking-tighter text-primary leading-[0.85] text-balance mix-blend-difference dark:mix-blend-normal">
                {product.name}
              </h1>
              <p className="text-2xl font-serif italic text-primary/60 tracking-tight">
                <bdi>EGP {product.price.toLocaleString()}</bdi>
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="space-y-10">
              <p className="text-lg leading-loose text-primary/80 max-w-md font-sans font-light">
                {product.description}
              </p>
              
              {/* Stylist Note */}
              <blockquote className="border-l border-accent-primary pl-8 py-2 italic text-primary/60 text-lg font-serif max-w-sm">
                {t.product.stylistNote}
              </blockquote>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-y border-primary/10">
            <div className="flex items-center gap-4 text-primary/60">
              <ShieldCheck strokeWidth={1} className="w-5 h-5 text-accent-primary" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold">{t.product.authenticity}</span>
            </div>
            <div className="flex items-center gap-4 text-primary/60">
              <Truck strokeWidth={1} className="w-5 h-5 text-accent-primary" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold">{t.product.shipping}</span>
            </div>
          </div>

          <div className="space-y-8">
            <VariantSelector product={product} recommendedByAI={typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('ref') === 'concierge'} />
            
            <div className="pt-4 space-y-4">
              {product.modelUrl && (
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsAROpen(true)}
                    className="w-full flex items-center justify-center gap-4 py-6 bg-secondary text-primary border border-primary/10 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary/5 transition-all active:scale-[0.98] group"
                    aria-label="View product in Augmented Reality"
                  >
                    <Camera strokeWidth={1} className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {t.product.viewInAR}
                  </button>
                  <p className="text-[9px] text-primary/40 uppercase tracking-[0.2em] text-center italic font-serif">
                    {t.product.arDescription}
                  </p>
                </div>
              )}

              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-4 py-6 border border-primary/20 text-primary text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary hover:text-primary-foreground hover:invert dark:hover:invert-0 transition-all active:scale-[0.98]"
              >
                <MessageCircle strokeWidth={1} className="w-4 h-4" />
                {t.product.concierge}
              </a>
            </div>
          </div>
        </div>

        {/* Right Image Section - Massive Parallax */}
        <div className="lg:col-span-7 relative">
          <div className="relative w-full aspect-[3/4] lg:aspect-[2/3] bg-secondary overflow-hidden group cursor-crosshair shadow-2xl">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover object-top transition-transform duration-[2s] ease-out group-hover:scale-125 origin-center"
              priority
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 linen-texture opacity-20 pointer-events-none" />
            <div className="absolute bottom-8 left-8 bg-primary/80 backdrop-blur-md px-6 py-3 rounded-none text-[8px] uppercase tracking-[0.4em] text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-primary/10">
              {t.product.fabricLoupe}
            </div>
          </div>
          
          {/* Secondary Image Overlap */}
          {product.images && product.images.length > 1 && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="hidden lg:block absolute -bottom-32 -left-32 w-2/3 aspect-square bg-primary p-4 shadow-2xl z-30"
            >
              <div className="relative w-full h-full overflow-hidden bg-secondary">
                <Image
                  src={product.images[1]}
                  alt={`${product.name} Detail`}
                  fill
                  className="object-cover transition-transform duration-[3s] hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Fabric Story Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-48 mt-32 border-t border-primary/10">
        <RevealOnScroll className="grid lg:grid-cols-12 gap-16 lg:gap-0 items-center">
          <div className="lg:col-span-7 relative aspect-[4/3] bg-secondary overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1000&auto=format&fit=crop"
              alt="Fabric Macro"
              fill
              className="object-cover opacity-90 transition-transform duration-[4s] hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="lg:col-span-5 lg:-ml-16 z-10 bg-primary/95 backdrop-blur-xl p-12 lg:p-16 shadow-2xl space-y-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold flex items-center gap-4">
              <span className="w-8 h-px bg-accent-primary"></span>
              {t.product.material.subtitle}
            </span>
            <h2 className="text-4xl lg:text-6xl font-serif text-primary leading-tight">{t.product.material.titleLine1} <br/><span className="italic text-accent-primary">{t.product.material.titleLine2}</span></h2>
            <p className="text-primary/70 font-sans leading-loose text-lg">
              {t.product.material.description}
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-primary/10">
              <div className="space-y-3">
                <Wind strokeWidth={1} className="w-6 h-6 text-accent-primary" />
                <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold">{t.product.material.breathable}</h3>
              </div>
              <div className="space-y-3">
                <Layers strokeWidth={1} className="w-6 h-6 text-accent-primary" />
                <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold">{t.product.material.structured}</h3>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Complete the Silhouette */}
      <div className="max-w-7xl mx-auto px-6 py-32 border-t border-primary/5">
        <h2 className="text-4xl md:text-5xl font-serif font-light mb-20 text-center text-primary">{t.product.completeSilhouette}</h2>
        <FeaturedProducts />
      </div>

      {/* AR Modal */}
      <AnimatePresence>
        {isAROpen && product.modelUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex justify-between items-center px-8 h-24 border-b border-primary/5">
              <div className="space-y-1">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent-primary">{t.product.ar.title}</h3>
                <p className="text-sm font-serif text-primary/60">{product.name} — {t.product.ar.subtitle}</p>
              </div>
              <button 
                onClick={() => setIsAROpen(false)}
                className="p-4 hover:bg-primary/5 rounded-full transition-colors text-primary"
                aria-label="Close Augmented Reality viewer"
              >
                <X strokeWidth={1} size={24} />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <ARViewer modelUrl={product.modelUrl} onClose={() => setIsAROpen(false)} />
            </div>

            <div className="p-8 text-center border-t border-primary/5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40">
                {t.product.ar.instruction}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
