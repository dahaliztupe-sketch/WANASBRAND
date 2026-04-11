import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wanasbrand.com';

  // Fetch all published products for the sitemap
  // Note: In a real server-side sitemap, we'd use firebase-admin or a server-side fetch.
  // Since we are in Next.js App Router, we can use the client SDK if configured for server-side or use a fetch.
  // For this environment, we'll assume the client SDK works in this context or mock the dynamic part if needed.
  
  let productEntries: MetadataRoute.Sitemap = [];
  
  try {
    const q = query(collection(db, 'products'), where('status', '==', 'Published'));
    const snapshot = await getDocs(q);
    productEntries = snapshot.docs.map((doc) => ({
      url: `${baseUrl}/product/${doc.data().slug}`,
      lastModified: doc.data().updatedAt ? new Date(doc.data().updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating sitemap products:', error);
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reserve`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  return [...staticPages, ...productEntries];
}
