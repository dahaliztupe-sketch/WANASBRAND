'use client';

import { useTranslation } from '@/lib/hooks/useTranslation';

export default function PrivacyPage() {
  const { t } = useTranslation();
  
  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-serif font-light mb-16 tracking-tight text-foreground">{t.privacy.title}</h1>
      <div className="space-y-12 text-lg font-light leading-loose text-foreground/80">
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">{t.privacy.commitment.title}</h2>
          <p>{t.privacy.commitment.content}</p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">{t.privacy.dataCollection.title}</h2>
          <p>{t.privacy.dataCollection.content}</p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">{t.privacy.security.title}</h2>
          <p>{t.privacy.security.content}</p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">{t.privacy.contact.title}</h2>
          <p>{t.privacy.contact.content}</p>
        </section>
      </div>
    </main>
  );
}
