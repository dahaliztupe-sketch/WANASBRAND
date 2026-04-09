'use client';

import { RevealOnScroll } from '@/components/RevealOnScroll';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Hero Editorial Image */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <Image
          src="https://picsum.photos/seed/atelier/1920/1080"
          alt="The WANAS Atelier"
          fill
          className="object-cover"
          priority
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-24">
        <RevealOnScroll>
          <h1 className="text-6xl md:text-8xl font-serif font-light mb-24 tracking-tight text-center">The Atelier Story</h1>
        </RevealOnScroll>

        <div className="space-y-32">
          {/* Philosophy */}
          <RevealOnScroll>
            <section className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-serif font-light">The WANAS Philosophy</h2>
                <p className="text-lg font-light leading-loose text-primary/80">
                  At WANAS, we believe that true luxury lies in the quiet confidence of a timeless silhouette. Our design ethos is rooted in the pursuit of understated elegance—where every line is intentional, and every curve serves a purpose. We reject the fleeting nature of trends in favor of garments that transcend seasons, becoming cherished staples in the modern woman&apos;s wardrobe.
                </p>
              </div>
              <div className="aspect-square bg-secondary/20" />
            </section>
          </RevealOnScroll>

          {/* Craftsmanship */}
          <RevealOnScroll>
            <section className="grid md:grid-cols-2 gap-16 items-center">
              <div className="aspect-square bg-secondary/20 order-2 md:order-1" />
              <div className="space-y-6 order-1 md:order-2">
                <h2 className="text-4xl font-serif font-light">The Craftsmanship</h2>
                <p className="text-lg font-light leading-loose text-primary/80">
                  Our dedication to excellence begins with the source. We meticulously curate the finest natural fibers—from the lustrous drape of heritage silk to the breathable, structured refinement of artisanal linen. Each piece is brought to life through meticulous tailoring, where traditional techniques are honored and perfected by our master artisans to ensure a flawless fit and unparalleled longevity.
                </p>
              </div>
            </section>
          </RevealOnScroll>

          {/* Concierge Experience */}
          <RevealOnScroll>
            <section className="text-center space-y-8 max-w-3xl mx-auto">
              <h2 className="text-4xl font-serif font-light">The Concierge Experience</h2>
              <p className="text-lg font-light leading-loose text-primary/80">
                To ensure that every WANAS garment is a perfect extension of the wearer, we operate exclusively through a concierge-led reservation model. By bypassing direct checkout, we invite a personal dialogue, allowing our team to guide you through sizing and bespoke considerations. This deliberate approach ensures that your experience is as flawless as the tailoring itself, guaranteeing a garment that fits not just your body, but your lifestyle.
              </p>
            </section>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
