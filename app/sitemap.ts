import { MetadataRoute } from 'next';

import { db } from '@/lib/firebase/server';

export const revalidate = 3600; // Re-generate sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wanasbrand.com';

  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/collections',
    '/faq',
    '/returns',
    '/size-guide',
    '/concierge',
    '/style-quiz',
    '/lookbook',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
    alternates: {
      languages: {
        en: `${baseUrl}/en${route}`,
        ar: `${baseUrl}/ar${route}`,
      },
    },
  }));

  if (!db) {
    return staticRoutes;
  }

  try {
    const snapshot = await db
      .collection('products')
      .where('status', '==', 'Published')
      .limit(500)
      .get();

    const productRoutes = snapshot.docs.map((doc) => {
      const data = doc.data();
      const slug = (data.slug as string | undefined) || doc.id;
      const updatedAt =
        data.updatedAt && typeof data.updatedAt === 'object' && 'seconds' in data.updatedAt
          ? new Date((data.updatedAt as { seconds: number }).seconds * 1000).toISOString()
          : new Date().toISOString();

      return {
        url: `${baseUrl}/product/${slug}`,
        lastModified: updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
        alternates: {
          languages: {
            en: `${baseUrl}/en/product/${slug}`,
            ar: `${baseUrl}/ar/product/${slug}`,
          },
        },
      };
    });

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error('[Sitemap] Error generating dynamic routes:', error);
    return staticRoutes;
  }
}
