import { Metadata } from 'next';
import CollectionsClient from '@/components/CollectionsClient';
import { StructuredData } from '@/components/StructuredData';

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

export default function CollectionsPage() {
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

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <CollectionsClient />
    </>
  );
}

