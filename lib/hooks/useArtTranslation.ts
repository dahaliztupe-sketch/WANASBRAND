import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/store/useLanguageStore';
import { loadArtLocale } from '@/lib/utils/loadLocale';

export function useArtTranslation() {
  const { language } = useLanguageStore();
  const [artT, setArtT] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    loadArtLocale(language).then((translations) => {
      if (isMounted) {
        setArtT(translations);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [language]);

  return { artT, isLoading };
}
