'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

import { ProductInfo } from '@/components/ProductInfo';
import { Product } from '@/types';
import { db, auth } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';

const ARViewer = dynamic(() => import('./ARViewer'), { ssr: false });

import { triggerHaptic } from '@/lib/utils/haptics';

import { RevealOnScroll } from './RevealOnScroll';

export default function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isAROpen, setIsAROpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setProduct({ ...data, id: docSnap.id });
        } else {
          setProduct(null);
        }
      } catch (err: unknown) {
        handleFirestoreError(err, OperationType.GET, 'products/' + id, auth);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-pulse font-serif text-xl text-primary/50 tracking-widest">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-primary/60 font-serif italic mb-4">Unable to load product details.</p>
          <p className="text-xs font-mono text-red-500/50 uppercase tracking-tighter">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
    return null;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Smooth lens position with a slight offset for a more organic feel
    setLensPos({
      x: x - 100, // 100 is half of lens width (200px)
      y: y - 100,
      bgX: (x / rect.width) * 100,
      bgY: (y / rect.height) * 100
    });
  };

  const images = product.images?.length > 0 ? product.images : [`https://images.unsplash.com/photo-1594913785162-e6786b42dea3?q=80&w=1200&auto=format&fit=crop`];

  return (
    <div className="w-full min-h-screen bg-primary">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row">
        
        {/* Left Side: Image Stack (60%) */}
        <div className="w-full lg:w-[60%] flex flex-col gap-4 p-4 lg:p-8">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative w-full aspect-[3/4] bg-primary overflow-hidden shadow-sm cursor-none group"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Image
                src={img}
                alt={`${product.name} - View ${idx + 1}`}
                fill
                quality={100}
                className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
                priority={idx === 0}
              />
              {/* Lens - The Fabric Loupe */}
              <div 
                className={`absolute w-48 h-48 rounded-full border border-primary/40 shadow-[0_0_50px_rgba(0,0,0,0.2)] pointer-events-none overflow-hidden z-20 transition-opacity duration-500 backdrop-blur-[2px] ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                style={{ 
                  top: lensPos.y, 
                  left: lensPos.x,
                  backgroundImage: `url(${img})`,
                  backgroundSize: '400% 400%',
                  backgroundPosition: `${lensPos.bgX}% ${lensPos.bgY}%`,
                  boxShadow: '0 0 0 9999px rgba(26, 26, 26, 0.05), 0 0 50px rgba(0,0,0,0.2)'
                }}
              >
                {/* Subtle crosshair in lens */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-full h-[0.5px] bg-primary" />
                  <div className="h-full w-[0.5px] bg-primary absolute" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Sticky Info Panel (40%) */}
        <div className="w-full lg:w-[40%] p-8 lg:p-16 lg:py-24">
          <div className="sticky top-32">
            <ProductInfo product={product} />
            <button
              className="mt-8 w-full py-4 border border-primary/20 text-primary tracking-widest text-sm uppercase hover:bg-inverted hover:text-inverted transition-colors"
              onClick={() => {
                triggerHaptic();
                setIsAROpen(true);
              }}
            >
              View in Your Space
            </button>
          </div>
        </div>

      </div>

      {isAROpen && product.modelUrl && (
        <ARViewer modelUrl={product.modelUrl} onClose={() => setIsAROpen(false)} />
      )}

      {/* The Fabric Story Section - Below the fold */}
      <RevealOnScroll>
        <section className="py-16 px-6 bg-primary border-t border-primary/5">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center">
            {/* Left: Macro Fabric Shot Placeholder */}
            <div className="w-full lg:w-1/2 relative aspect-square bg-primary flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="text-[10px] uppercase tracking-[0.5em] text-primary mb-8">Macro Texture No. 01</span>
                <h3 className="font-serif text-3xl text-primary italic">The WANAS Weave</h3>
              </div>
              {/* Subtle line art overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 L 100 100 M 100 0 L 0 100" stroke="currentColor" fill="transparent" strokeWidth="0.05" />
              </svg>
            </div>

            {/* Right: Technical Elegance */}
            <div className="w-full lg:w-1/2 flex flex-col gap-16">
              <div>
                <span className="text-[10px] uppercase tracking-[0.5em] text-accent-primary mb-6 block">The Fabric Story</span>
                <h2 className="text-4xl md:text-5xl font-serif text-primary mb-8">Impeccable Tailoring</h2>
                <p className="text-primary/60 leading-relaxed font-light text-lg">
                  Our commitment to high fashion begins with the drape. Every piece is tailored with exquisite craftsmanship, ensuring a silhouette that transcends the ordinary and captures true allure.
                </p>
              </div>

              <div className="space-y-12">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary/40 mb-4 block">Fabric Composition</span>
                  <p className="text-xl font-serif text-primary">{product.fabricInfo?.composition || '100% Organic Egyptian Linen'}</p>
                </div>

                <div className="space-y-8">
                  {[
                    { label: 'Softness', value: product.fabricInfo?.softness || 95 },
                    { label: 'Breathability', value: product.fabricInfo?.breathability || 88 },
                    { label: 'Warmth', value: product.fabricInfo?.warmth || 72 },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-primary/60">{stat.label}</span>
                        <span className="text-[10px] font-mono text-primary/40">{stat.value}%</span>
                      </div>
                      <div className="h-[1px] w-full bg-inverted/5 relative">
                        <div 
                          className="absolute inset-y-0 start-0 bg-accent-primary transition-all duration-1000" 
                          style={{ width: `${stat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>
    </div>
  );
}
