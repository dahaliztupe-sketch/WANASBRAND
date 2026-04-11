import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Language = 'en' | 'ar';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => {
        set({ language: lang });
        if (typeof document !== 'undefined') {
          document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
        }
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
