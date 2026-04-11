import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'WANAS | Handcrafted Fashion House',
  description: 'WANAS is a luxury fashion house dedicated to handcrafted excellence and timeless elegance. Based in Egypt, serving the world.',
  openGraph: {
    title: 'WANAS | Handcrafted Fashion House',
    description: 'Luxury handcrafted fashion from the heart of Egypt.',
    url: 'https://wanasbrand.com',
    siteName: 'WANAS',
    images: [
      {
        url: 'https://wanasbrand.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WANAS Fashion House',
      },
    ],
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
};

export default function LandingPage() {
  return <HomeClient />;
}



