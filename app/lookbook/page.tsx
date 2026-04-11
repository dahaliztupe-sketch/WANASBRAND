'use client';

import ShoppableLookbook from '@/components/ShoppableLookbook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useArtTranslation } from '@/lib/hooks/useArtTranslation';

export default function LookbookPage() {
  const { t } = useTranslation();
  const { artT, isLoading } = useArtTranslation();
  
  return (
    <main className="min-h-screen bg-primary pt-24">
      <header className="px-6 max-w-7xl mx-auto mb-16">
        <h1 className="font-serif text-5xl text-primary mb-4 italic">{t.lookbook.title}</h1>
        <p className="text-primary/60 text-sm uppercase tracking-widest">{t.lookbook.subtitle}</p>
        {!isLoading && artT && (
          <p className="text-primary/40 text-xs mt-4">{artT.lookbook.mood} - {artT.lookbook.architecture}</p>
        )}
      </header>
      <ShoppableLookbook />
    </main>
  );
}
