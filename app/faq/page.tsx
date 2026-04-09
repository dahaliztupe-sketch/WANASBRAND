'use client';

import { RevealOnScroll } from '@/components/RevealOnScroll';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-primary text-primary pt-20 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-5xl font-serif mb-12 tracking-tight">FAQ</h1>
          <div className="space-y-8 text-lg">
            <details className="border-b border-primary/10 pb-6">
              <summary className="font-serif text-2xl cursor-pointer">Shipping</summary>
              <p className="mt-4 text-primary/70">We offer worldwide shipping with premium courier services to ensure your pieces arrive in pristine condition.</p>
            </details>
            <details className="border-b border-primary/10 pb-6">
              <summary className="font-serif text-2xl cursor-pointer">Returns</summary>
              <p className="mt-4 text-primary/70">We accept returns within 14 days of receipt, provided the items are in their original condition and packaging.</p>
            </details>
            <details className="border-b border-primary/10 pb-6">
              <summary className="font-serif text-2xl cursor-pointer">Sizing</summary>
              <p className="mt-4 text-primary/70">Please refer to our Size Guide for detailed measurements to ensure the perfect fit.</p>
            </details>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
