import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://wanas.vercel.app',
      lastModified: new Date(),
    },
    // Add other pages here
  ];
}
