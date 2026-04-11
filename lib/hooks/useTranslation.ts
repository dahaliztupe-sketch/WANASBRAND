import { useLanguageStore } from '@/lib/store/useLanguageStore';
import { en } from '@/lib/locales/en';
import { ar } from '@/lib/locales/ar';
import { useState, useEffect } from 'react';

export function useTranslation() {
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always return 'en' during SSR and initial hydration to match server HTML
  const currentLanguage = mounted ? language : 'en';
  const t = currentLanguage === 'en' ? en : ar;
  
  return { t, language: currentLanguage, locale: currentLanguage };
}
