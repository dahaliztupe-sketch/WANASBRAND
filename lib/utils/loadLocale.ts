// lib/utils/loadLocale.ts

export async function loadArtLocale(language: string) {
  try {
    if (language === 'ar') {
      const module = await import('@/lib/locales/art.ar');
      return module.artAr;
    } else {
      const module = await import('@/lib/locales/art.en');
      return module.artEn;
    }
  } catch (error) {
    console.error(`Failed to load art locale for ${language}`, error);
    return {};
  }
}
