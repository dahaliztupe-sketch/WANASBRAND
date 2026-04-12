import { useState, useEffect } from 'react';

import { useLanguageStore } from '@/lib/store/useLanguageStore';
import { en } from '@/locales/en';
import { ar } from '@/locales/ar';
import { Translations } from '@/types';

export function useTranslation() {
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always return 'en' during SSR and initial hydration to match server HTML
  const currentLanguage = mounted ? language : 'en';
  const t = (currentLanguage === 'en' ? en : ar) as Translations;
  
  return { t, language: currentLanguage, locale: currentLanguage };
}
