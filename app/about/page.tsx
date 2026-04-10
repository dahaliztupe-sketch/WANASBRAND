'use client';

import { RevealOnScroll } from '@/components/RevealOnScroll';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-primary text-primary overflow-hidden pb-32">
      {/* Hero Editorial Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop"
            alt="The WANAS Atelier"
            fill
            className="object-cover opacity-40"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/60 to-primary" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          <RevealOnScroll>
            <p className="text-[10px] uppercase tracking-[0.8em] text-accent-primary font-bold mb-8">
              Est. 2024
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <h1 className="text-6xl md:text-8xl lg:text-[12rem] font-serif font-light tracking-tighter leading-[0.85] text-primary mix-blend-difference dark:mix-blend-normal">
              The <span className="italic text-accent-primary">Atelier</span>
            </h1>
          </RevealOnScroll>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 space-y-48 mt-24">
        {/* Philosophy - Asymmetrical Overlap */}
        <section className="grid lg:grid-cols-12 gap-12 lg:gap-0 items-center">
          <div className="lg:col-span-7 relative aspect-[4/5] lg:aspect-square bg-secondary overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
              alt="Philosophy"
              fill
              className="object-cover transition-transform duration-[5s] hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="lg:col-span-6 lg:-ml-32 z-10 bg-primary/95 backdrop-blur-xl p-12 lg:p-20 shadow-2xl">
            <RevealOnScroll>
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <span className="w-16 h-px bg-accent-primary"></span>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold">01. Philosophy</span>
                </div>
                <h2 className="text-4xl lg:text-6xl font-serif text-primary leading-tight">
                  Quiet <br/><span className="italic text-accent-primary">Confidence</span>
                </h2>
                <p className="text-lg font-light leading-loose text-primary/80 font-sans">
                  At WANAS, we believe that true luxury lies in the quiet confidence of a timeless silhouette. Our design ethos is rooted in the pursuit of understated elegance—where every line is intentional, and every curve serves a purpose.
                </p>
                <p className="text-lg font-light leading-loose text-primary/80 font-sans">
                  We reject the fleeting nature of trends in favor of garments that transcend seasons, becoming cherished staples in the modern woman&apos;s wardrobe.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Craftsmanship - Editorial Grid */}
        <section className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-32">
            <RevealOnScroll>
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <span className="w-16 h-px bg-accent-primary"></span>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold">02. Craftsmanship</span>
                </div>
                <h2 className="text-4xl lg:text-6xl font-serif text-primary leading-tight">
                  The Art of <br/><span className="italic text-accent-primary">Tailoring</span>
                </h2>
                <p className="text-lg font-light leading-loose text-primary/80 font-sans">
                  Our dedication to excellence begins with the source. We meticulously curate the finest natural fibers—from the lustrous drape of heritage silk to the breathable, structured refinement of artisanal linen.
                </p>
              </div>
            </RevealOnScroll>
          </div>
          
          <div className="lg:col-span-7 grid gap-12">
            <RevealOnScroll delay={0.2}>
              <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=1200&auto=format&fit=crop"
                  alt="Craftsmanship Detail"
                  fill
                  className="object-cover transition-transform duration-[4s] hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.4}>
              <div className="relative aspect-[16/9] w-4/5 ml-auto bg-secondary overflow-hidden shadow-xl -mt-32 z-10">
                <Image
                  src="https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=1200&auto=format&fit=crop"
                  alt="Fabric Detail"
                  fill
                  className="object-cover transition-transform duration-[4s] hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Concierge Experience - Centered Minimal */}
        <section className="relative py-32 border-y border-primary/10">
          <RevealOnScroll>
            <div className="max-w-3xl mx-auto text-center space-y-12">
              <div className="flex items-center justify-center gap-6">
                <span className="w-8 h-px bg-accent-primary"></span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold">03. The Experience</span>
                <span className="w-8 h-px bg-accent-primary"></span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-serif text-primary leading-tight">
                A Personal <br/><span className="italic text-accent-primary">Dialogue</span>
              </h2>
              <p className="text-xl font-light leading-loose text-primary/80 font-sans text-balance">
                To ensure that every WANAS garment is a perfect extension of the wearer, we operate exclusively through a concierge-led reservation model. By bypassing direct checkout, we invite a personal dialogue, allowing our team to guide you through sizing and bespoke considerations.
              </p>
            </div>
          </RevealOnScroll>
        </section>
      </div>
    </div>
  );
}
