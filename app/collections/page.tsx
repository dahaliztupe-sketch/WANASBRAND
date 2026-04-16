import { Metadata } from 'next';

import CollectionsClient from '@/components/CollectionsClient';
import { StructuredData } from '@/components/StructuredData';
import DatabaseUnavailable from '@/components/DatabaseUnavailable';
import { db } from '@/lib/firebase/server';
import { Product } from '@/types';

export const metadata: Metadata = {
  title: 'The Collection | WANAS Atelier',
  description: 'Explore our curated collection of handcrafted luxury fashion. Each piece is a masterpiece of design and craftsmanship.',
  openGraph: {
    title: 'The Collection | WANAS Atelier',
    description: 'Luxury handcrafted fashion silhouettes.',
    images: [
      {
        url: 'https://wanasbrand.com/collections-og.jpg',
        width: 1200,
        height: 630,
        alt: 'WANAS Collections',
      },
    ],
  },
  alternates: {
    canonical: '/collections',
  },
};

export const dynamic = 'force-dynamic';

async function getInitialProducts(): Promise<{ products: Product[], lastDocId: string | null }> {
  try {
    const firestore = db;
    if (!firestore) return { products: [], lastDocId: null };
    
    const snapshot = await firestore.collection('products')
      .where('status', '==', 'Published')
      .limit(12)
      .get();
      
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    
    const lastDocId = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
    
    return { products, lastDocId };
  } catch (error) {
    console.error('Error fetching initial products:', error);
    return { products: [], lastDocId: null };
  }
}

export default async function CollectionsPage() {
  if (!db) {
    return (
      <main className="min-h-screen bg-primary flex items-center justify-center p-6">
        <DatabaseUnavailable />
      </main>
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://wanasbrand.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Collections",
        "item": "https://wanasbrand.com/collections"
      }
    ]
  };

  const initialProductsPromise = getInitialProducts();

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <CollectionsClient initialProductsPromise={initialProductsPromise} />
    </>
  );
}

