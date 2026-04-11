import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Product } from '@/types';
import ProductClient from '@/components/ProductClient';
import { StructuredData } from '@/components/StructuredData';
import ARViewerWrapper from '@/components/ARViewerWrapper';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | WANAS Atelier`,
      description: product.description.slice(0, 160),
      url: `https://wanasbrand.com/product/${slug}`,
      siteName: 'WANAS Atelier',
      images: product.images?.[0] ? [
        {
          url: product.images[0],
          width: 1200,
          height: 630,
          alt: product.name,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wanasbrand',
      title: `${product.name} | WANAS Atelier`,
      description: product.description.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'EGP',
      'product:availability': (product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0) > 0 ? 'instock' : 'oos',
      'product:condition': 'new',
      'product:brand': 'WANAS',
      'product:category': product.category,
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "WANAS"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://wanasbrand.com/product/${product.slug}`,
      "priceCurrency": "EGP",
      "price": product.price,
      "availability": totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "category": product.category
  };

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://wanasbrand.com/product/${product.slug}`
      }
    ]
  };

  return (
    <>
      <StructuredData data={productSchema} />
      <StructuredData data={breadcrumbSchema} />
      <ProductClient product={product} />
      {product.modelUrl && <ARViewerWrapper modelUrl={product.modelUrl} onClose={() => {}} />}
    </>
  );
}

