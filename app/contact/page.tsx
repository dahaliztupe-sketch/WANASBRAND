'use client';

import { useState } from 'react';

import { RevealOnScroll } from '@/components/RevealOnScroll';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function ContactPage() {
  const { t } = useTranslation();
  const [website, setWebsite] = useState('');

  return (
    <div className="min-h-screen bg-primary text-primary pt-20 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-5xl font-serif mb-12 tracking-tight">{t.contact.title}</h1>
          <div className="space-y-8">
            <p className="text-lg leading-relaxed text-primary/80">
              {t.contact.description}
            </p>
            <div className="bg-primary/5 p-8 space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] font-medium">{t.contact.whatsapp}</p>
              <a href="https://wa.me/1234567890" className="text-xl hover:text-accent-primary transition-colors">+1 (234) 567-890</a>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Honeypot field */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <input type="text" placeholder={t.contact.form.name} className="w-full bg-primary border border-primary/10 px-4 py-3 outline-none focus:border-accent-primary" />
              <input type="email" placeholder={t.contact.form.email} className="w-full bg-primary border border-primary/10 px-4 py-3 outline-none focus:border-accent-primary" />
              <textarea placeholder={t.contact.form.message} className="w-full bg-primary border border-primary/10 px-4 py-3 h-32 outline-none focus:border-accent-primary"></textarea>
              <button type="submit" className="bg-inverted text-inverted px-8 py-3 uppercase tracking-[0.2em] text-[10px] hover:bg-accent-primary transition-colors">{t.contact.form.send}</button>
            </form>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
