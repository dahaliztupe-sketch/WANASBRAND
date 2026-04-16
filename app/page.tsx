import { Metadata } from 'next';

import HomeClient from '@/components/HomeClient';
import DatabaseUnavailable from '@/components/DatabaseUnavailable';
import { db } from '@/lib/firebase/server';
import { Product } from '@/types';

export const metadata: Metadata = {
  title: 'WANAS | Handcrafted Fashion House',
  description: 'WANAS is a luxury fashion house dedicated to handcrafted excellence and timeless elegance. Based in Egypt, serving the world.',
  openGraph: {
    title: 'WANAS | Handcrafted Fashion House',
    description: 'Luxury handcrafted fashion from the heart of Egypt.',
    url: 'https://wanasbrand.com',
    siteName: 'WANAS',
    images: [
      {
        url: 'https://wanasbrand.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WANAS Fashion House',
      },
    ],
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
};

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const firestore = db;
    if (!firestore) return [];
    
    const snapshot = await firestore.collection('products')
      .where('status', '==', 'Published')
      .limit(3)
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export default async function LandingPage() {
  if (!db) {
    return (
      <main className="min-h-screen bg-primary flex items-center justify-center p-6">
        <DatabaseUnavailable />
      </main>
    );
  }

  const featuredProductsPromise = getFeaturedProducts();
  
  return <HomeClient featuredProductsPromise={featuredProductsPromise} />;
}



