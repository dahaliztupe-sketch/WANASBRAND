'use client';

import { useTranslation } from '@/lib/hooks/useTranslation';

export default function ReturnsPage() {
  const { t } = useTranslation();
  
  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-serif font-light mb-16 tracking-tight text-foreground">{t.returns.title}</h1>
      <div className="space-y-12 text-lg font-light leading-loose text-foreground/80">
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">{t.returns.philosophy.title}</h2>
          <p>{t.returns.philosophy.content}</p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">{t.returns.delicateFabric.title}</h2>
          <p>{t.returns.delicateFabric.content}</p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">{t.returns.depositRefunds.title}</h2>
          <p>{t.returns.depositRefunds.content}</p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">{t.returns.customOrders.title}</h2>
          <p>{t.returns.customOrders.content}</p>
        </section>
      </div>
    </main>
  );
}
