import { collection, getDocs, query, where } from 'firebase/firestore';
import { MetadataRoute } from 'next';

import { db } from '@/lib/firebase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wanasbrand.com';

  // Static routes
  const routes = ['', '/about', '/contact', '/collections', '/faq', '/returns', '/size-guide'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    // Fetch published products
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('status', '==', 'Published'));
    const snapshot = await getDocs(q);

    const productRoutes = snapshot.docs.map((doc) => ({
      url: `${baseUrl}/product/${doc.data().slug || doc.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...routes, ...productRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
