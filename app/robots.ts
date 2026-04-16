import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/collections', '/product'],
      disallow: ['/admin', '/api', '/account'],
    },
    sitemap: 'https://wanasbrand.com/sitemap.xml',
  };
}
