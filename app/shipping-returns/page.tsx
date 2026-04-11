'use client';

import { useTranslation } from '@/lib/hooks/useTranslation';

export default function ShippingReturnsPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-primary py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl text-primary mb-12">{t.shippingReturns.title}</h1>
        
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-primary mb-4">{t.shippingReturns.reservation.title}</h2>
          <p className="text-primary/70 leading-relaxed">
            {t.shippingReturns.reservation.content}
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-primary mb-4">{t.shippingReturns.shipping.title}</h2>
          <p className="text-primary/70 leading-relaxed">
            {t.shippingReturns.shipping.content}
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-primary mb-4">{t.shippingReturns.returns.title}</h2>
          <p className="text-primary/70 leading-relaxed">
            {t.shippingReturns.returns.content}
          </p>
        </section>
      </div>
    </div>
  );
}
