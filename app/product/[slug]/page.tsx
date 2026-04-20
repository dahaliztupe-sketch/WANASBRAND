import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { db } from '@/lib/firebase/server';
import { Product } from '@/types';
import ProductClient from '@/components/ProductClient';
import { StructuredData } from '@/components/StructuredData';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  if (!db) return null;
  try {
    const snapshot = await db
      .collection('products')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0]!;
    return { id: doc.id, ...doc.data() } as Product;
  } catch (error) {
    console.error('[ProductPage] Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found | WANAS' };
  }

  const description = product.description.slice(0, 155) + '…';

  return {
    title: `${product.name} | WANAS Atelier`,
    description,
    openGraph: {
      title: `${product.name} | WANAS Atelier`,
      description,
      url: `https://wanasbrand.com/product/${slug}`,
      siteName: 'WANAS Atelier',
      images: product.images?.[0]
        ? [{ url: product.images[0], width: 1200, height: 1500, alt: product.name }]
        : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wanasbrand',
      title: `${product.name} | WANAS Atelier`,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    alternates: {
      canonical: `/product/${slug}`,
      languages: {
        en: `https://wanasbrand.com/en/product/${slug}`,
        ar: `https://wanasbrand.com/ar/product/${slug}`,
      },
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'EGP',
      'product:availability':
        (product.variants?.reduce((acc, v) => acc + (v.stock ?? 0), 0) ?? 0) > 0
          ? 'instock'
          : 'oos',
      'product:condition': 'new',
      'product:brand': 'WANAS',
      'product:category': product.category,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const totalStock =
    product.variants?.reduce((acc, v) => acc + (v.stock ?? 0), 0) ?? 0;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images ?? [],
    description: product.description,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'WANAS' },
    offers: {
      '@type': 'Offer',
      url: `https://wanasbrand.com/product/${product.slug}`,
      priceCurrency: 'EGP',
      price: product.price,
      availability:
        totalStock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'WANAS Atelier' },
    },
    category: product.category,
    ...(product.fabricInfo && {
      material: product.fabricInfo.composition,
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wanasbrand.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: 'https://wanasbrand.com/collections',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://wanasbrand.com/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <StructuredData data={productSchema} />
      <StructuredData data={breadcrumbSchema} />
      <ProductClient product={product} />
    </>
  );
}
