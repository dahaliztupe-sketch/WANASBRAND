// lib/utils/loadLocale.ts

export async function loadArtLocale(language: string) {
  try {
    if (language === 'ar') {
      const mod = await import('@/lib/locales/art.ar');
      return mod.artAr;
    } else {
      const mod = await import('@/lib/locales/art.en');
      return mod.artEn;
    }
  } catch (error) {
    console.error(`Failed to load art locale for ${language}`, error);
    return {};
  }
}
