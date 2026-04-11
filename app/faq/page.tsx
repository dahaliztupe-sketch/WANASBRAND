'use client';

import { RevealOnScroll } from '@/components/RevealOnScroll';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function FAQPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-primary text-primary pt-20 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-5xl font-serif mb-12 tracking-tight">{t.faq.title}</h1>
          <div className="space-y-8 text-lg">
            <details className="border-b border-primary/10 pb-6">
              <summary className="font-serif text-2xl cursor-pointer">{t.faq.shipping.question}</summary>
              <p className="mt-4 text-primary/70">{t.faq.shipping.answer}</p>
            </details>
            <details className="border-b border-primary/10 pb-6">
              <summary className="font-serif text-2xl cursor-pointer">{t.faq.returns.question}</summary>
              <p className="mt-4 text-primary/70">{t.faq.returns.answer}</p>
            </details>
            <details className="border-b border-primary/10 pb-6">
              <summary className="font-serif text-2xl cursor-pointer">{t.faq.sizing.question}</summary>
              <p className="mt-4 text-primary/70">{t.faq.sizing.answer}</p>
            </details>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
