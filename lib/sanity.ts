import { createClient } from '@sanity/client';
import ar from '@/locales/ar';
import en from '@/locales/en';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: true, // set to false for ISR/fresh data
  apiVersion: '2024-01-01',
});

export async function fetchTranslations(lang: 'en' | 'ar') {
  try {
    const query = `*[_type == "translation"]{ key, "text": text_${lang} }`;
    const results = await sanityClient.fetch(query);
    
    if (!results || results.length === 0) {
      console.warn('⚠️ Sanity returned empty translations, using local fallback.');
      return lang === 'ar' ? ar : en;
    }
    
    return results.reduce((acc: any, item: any) => {
      acc[item.key] = item.text;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error('❌ Error fetching from Sanity, using local fallback:', error);
    return lang === 'ar' ? ar : en;
  }
}
