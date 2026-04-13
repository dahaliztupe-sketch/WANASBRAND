/**
 * CDN & Caching Strategy for WANAS.
 */

export const cdnConfig = {
  staticAssets: {
    cacheControl: 'public, max-age=31536000, immutable',
  },
  apiResponses: {
    cacheControl: 'public, s-maxage=60, stale-while-revalidate=30',
  },
  images: {
    cacheControl: 'public, max-age=86400',
  }
};
