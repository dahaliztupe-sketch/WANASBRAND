'use client';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  productData?: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    availability: string;
  };
}

export default function SEO({ 
  title = 'WANAS | The Digital Atelier', 
  description = 'Ultra-luxury curated selections for the modern wardrobe.', 
  image = 'https://wanasbrand.com/og-image.jpg', 
  url = 'https://wanasbrand.com',
  type = 'website',
  productData
}: SEOProps) {
  const fullTitle = title.includes('WANAS') ? title : `${title} | WANAS`;

  const jsonLd = productData ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productData.name,
    "image": [productData.image],
    "description": productData.description,
    "sku": productData.name.toLowerCase().replace(/\s+/g, '-'),
    "brand": {
      "@type": "Brand",
      "name": "WANAS"
    },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": productData.currency,
      "price": productData.price,
      "availability": `https://schema.org/${productData.availability}`,
      "itemCondition": "https://schema.org/NewCondition"
    }
  } : {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WANAS",
    "url": "https://wanasbrand.com",
    "logo": "https://wanasbrand.com/logo.png",
    "sameAs": [
      "https://instagram.com/wanas.brand",
      "https://facebook.com/wanas.brand"
    ]
  };

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
