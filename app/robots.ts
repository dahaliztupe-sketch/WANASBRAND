import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/account/private'],
    },
    sitemap: 'https://wanasbrand.com/sitemap.xml',
  };
}
