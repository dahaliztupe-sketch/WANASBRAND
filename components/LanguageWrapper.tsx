'use client';

import { useLanguageStore } from '@/lib/store/useLanguageStore';
import { useEffect } from 'react';
import { useHydrated } from '@/lib/hooks/useHydrated';

export function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useLanguageStore();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated) {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, hydrated]);

  return <>{children}</>;
}
