/**
 * Product Structured Data (Schema.org) Component.
 */

interface ProductSchemaProps {
  product: {
    name: string;
    description: string;
    image: string;
    price: number;
    sku: string;
    brand: string;
  };
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image],
    "description": product.description,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": `https://wanasbrand.com/product/${product.sku}`,
      "priceCurrency": "EGP",
      "price": product.price,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
