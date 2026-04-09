'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { MessageCircle, ShieldCheck, Truck, RotateCcw, Wind, Layers, Feather, Camera, X } from 'lucide-react';
import { VariantSelector } from '@/components/VariantSelector';
import FeaturedProducts from '@/components/FeaturedProducts';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import ARViewer from '@/components/ARViewer';
import { motion, AnimatePresence } from 'motion/react';

import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Product } from '@/types';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAROpen, setIsAROpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const q = query(collection(db, 'products'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setProduct(null);
        } else {
          const doc = querySnapshot.docs[0];
          setProduct({ id: doc.id, ...doc.data() } as Product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center"><div className="w-12 h-12 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) notFound();

  const mainImage = product.images?.[0] || 'https://picsum.photos/seed/gown/1920/1080';
  const whatsappLink = `https://wa.me/201090946772?text=Greetings WANAS Atelier. I am inquiring about ${product.name} (Ref: ${product.id}).`;

  return (
    <main className="min-h-screen bg-primary font-serif selection:bg-accent-primary selection:text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 grid lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Image Section - Fabric Loupe */}
        <div className="relative aspect-[3/4] bg-primary overflow-hidden rounded-sm group cursor-crosshair">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-150 origin-center"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 linen-texture opacity-20 pointer-events-none" />
          <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[8px] uppercase tracking-[0.3em] text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Fabric Loupe Active
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col justify-center space-y-12">
          <RevealOnScroll>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <p className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold">Atelier Silhouette</p>
                <span className="w-12 h-px bg-primary/10"></span>
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary/40">{product.category}</p>
              </div>
              <h1 className="text-5xl lg:text-8xl font-light tracking-tighter text-primary leading-[0.9] text-balance">{product.name}</h1>
              <p className="text-3xl font-light text-primary/60 tracking-tight">EGP {product.price.toLocaleString()}</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="space-y-8">
              <p className="text-xl leading-relaxed text-primary/80 max-w-xl font-light text-balance">
                {product.description}
              </p>
              
              {/* Stylist Note */}
              <blockquote className="border-l-2 border-accent-primary pl-8 py-2 italic text-primary/60 text-lg font-light max-w-lg">
                &quot;This silhouette is designed to capture the essence of modern grace, blending architectural structure with fluid movement.&quot;
              </blockquote>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-10 border-y border-primary/10">
            <div className="flex items-center gap-4 text-primary/60">
              <ShieldCheck strokeWidth={1} className="w-5 h-5 text-accent-primary" />
              <span className="text-[10px] uppercase tracking-widest">Authenticity Guaranteed</span>
            </div>
            <div className="flex items-center gap-4 text-primary/60">
              <Truck strokeWidth={1} className="w-5 h-5 text-accent-primary" />
              <span className="text-[10px] uppercase tracking-widest">Complimentary Shipping</span>
            </div>
          </div>

          <VariantSelector product={product} />
          
          <div className="pt-6 space-y-4">
            {product.glbModelUrl && (
              <div className="space-y-3">
                <button 
                  onClick={() => setIsAROpen(true)}
                  className="w-full flex items-center justify-center gap-4 py-6 bg-[#E6B8B8]/10 text-[#3D2B1F] border border-[#E6B8B8]/30 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#E6B8B8]/20 transition-all active:scale-[0.98] group"
                >
                  <Camera strokeWidth={1} className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  View in Your Sanctuary
                </button>
                <p className="text-[9px] text-primary/40 uppercase tracking-[0.2em] text-center italic">
                  Visualize the silhouette and fabric drape in your own space before reserving.
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
              Concierge Service
            </a>
          </div>
        </div>
      </div>

      {/* Fabric Story Section */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-primary/5">
        <RevealOnScroll className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="relative aspect-square bg-secondary overflow-hidden rounded-sm">
            <Image
              src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1000&auto=format&fit=crop"
              alt="Fabric Macro"
              fill
              className="object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 linen-texture opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
          
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-accent-primary font-bold">Sensory Experience</span>
              <h2 className="text-4xl md:text-6xl font-serif font-light text-primary">The Fabric Story</h2>
              <p className="text-primary/60 leading-relaxed font-light text-lg">
                Sourced from the finest mills, this silhouette features a unique blend of natural fibers that offer an unparalleled tactile experience.
              </p>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-primary/40">
                  <span className="flex items-center gap-2"><Feather size={14} /> Softness</span>
                  <span>9.5/10</span>
                </div>
                <div className="h-px w-full bg-primary/10 relative">
                  <div className="absolute inset-y-0 left-0 bg-accent-primary w-[95%]" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-primary/40">
                  <span className="flex items-center gap-2"><Wind size={14} /> Breathability</span>
                  <span>8.0/10</span>
                </div>
                <div className="h-px w-full bg-primary/10 relative">
                  <div className="absolute inset-y-0 left-0 bg-accent-primary w-[80%]" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-primary/40">
                  <span className="flex items-center gap-2"><Layers size={14} /> Weight</span>
                  <span>Lightweight</span>
                </div>
                <div className="h-px w-full bg-primary/10 relative">
                  <div className="absolute inset-y-0 left-0 bg-accent-primary w-[30%]" />
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Complete the Silhouette */}
      <div className="max-w-7xl mx-auto px-6 py-32 border-t border-primary/5">
        <h2 className="text-4xl md:text-5xl font-serif font-light mb-20 text-center text-primary">Complete the Silhouette</h2>
        <FeaturedProducts />
      </div>

      {/* AR Modal */}
      <AnimatePresence>
        {isAROpen && product.glbModelUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex justify-between items-center px-8 h-24 border-b border-primary/5">
              <div className="space-y-1">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent-primary">Virtual Sanctuary</h3>
                <p className="text-sm font-serif text-primary/60">{product.name} — Silhouette Study</p>
              </div>
              <button 
                onClick={() => setIsAROpen(false)}
                className="p-4 hover:bg-primary/5 rounded-full transition-colors text-primary"
              >
                <X strokeWidth={1} size={24} />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <ARViewer src={product.glbModelUrl} alt={product.name} poster={mainImage} />
            </div>

            <div className="p-8 text-center border-t border-primary/5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40">
                Move your device to scan the floor and place the silhouette.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
