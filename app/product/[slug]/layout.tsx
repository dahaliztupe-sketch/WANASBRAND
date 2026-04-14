import { Metadata } from 'next';

import { db } from '@/lib/firebase/server';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const firestore = db;
  
  if (!firestore) {
    return { title: 'Product Not Found' };
  }

  try {
    const snapshot = await firestore.collection('products').where('slug', '==', slug).limit(1).get();
    
    if (snapshot.empty) {
      return { title: 'Product Not Found' };
    }

    const product = snapshot.docs[0].data();

    return {
      title: `${product.name} | WANAS`,
      description: product.description,
      openGraph: {
        title: `${product.name} | WANAS`,
        description: product.description,
        images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | WANAS`,
        description: product.description,
        images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'WANAS Product' };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
