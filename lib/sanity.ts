import { createClient } from '@sanity/client';

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
    return results.reduce((acc: Record<string, string>, curr: { key: string; text: string }) => {
      acc[curr.key] = curr.text;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching translations from Sanity:', error);
    return {};
  }
}
