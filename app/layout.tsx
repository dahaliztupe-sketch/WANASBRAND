import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";
import { useEffect } from "react";
import { useSelectionStore } from "@/store/useSelectionStore";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "WANAS | Handcrafted Fashion House",
    template: "%s | WANAS"
  },
  description: "WANAS is a luxury fashion house dedicated to handcrafted excellence and timeless elegance. Based in Egypt, serving the world.",
  keywords: ["fashion", "luxury", "handcrafted", "egyptian fashion", "couture", "wanas"],
  authors: [{ name: "WANAS Atelier" }],
  creator: "WANAS",
  publisher: "WANAS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wanasbrand.com",
    siteName: "WANAS",
    title: "WANAS | Handcrafted Fashion House",
    description: "Luxury handcrafted fashion from the heart of Egypt.",
    images: [
      {
        url: "https://wanasbrand.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WANAS Fashion House",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WANAS | Handcrafted Fashion House",
    description: "Luxury handcrafted fashion from the heart of Egypt.",
    images: ["https://wanasbrand.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WANAS',
  },
};

export const viewport = {
  themeColor: '#FAF9F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import CookieBanner from "@/components/CookieBanner";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AtelierTour } from "@/components/admin/AtelierTour";
import ServiceWorkerRegistration from "@/components/PWA/ServiceWorkerRegistration";
import InstallPrompt from "@/components/PWA/InstallPrompt";
import PushNotificationModal from "@/components/PushNotificationModal";
import { GlobalConcierge } from "@/components/GlobalConcierge";
import { CustomCursor } from "@/components/CustomCursor";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FirebaseBoot } from "@/components/FirebaseBoot";
import { NetworkStatus } from "@/components/NetworkStatus";
import { SmoothScrolling } from "@/components/SmoothScrolling";
import { SelectionBag } from "@/components/SelectionBag";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WANAS",
    "url": "https://wanasbrand.com",
    "logo": "https://wanasbrand.com/logo.png",
    "sameAs": [
      "https://instagram.com/wanas.brand",
      "https://facebook.com/wanas.brand"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+201090946772",
      "contactType": "customer service",
      "areaServed": "Worldwide",
      "availableLanguage": ["English", "Arabic"]
    }
  };

  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased pb-16 lg:pb-0 cursor-none md:cursor-auto">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SmoothScrolling>
            <ErrorBoundary>
              <NetworkStatus />
              <FirebaseBoot />
              <CustomCursor />
              <StructuredData data={organizationJsonLd} />
              <AnnouncementBar />
              <Header />
              {children}
              <Footer />
              <BottomNav />
              <SelectionBag />
              <AtelierTour />
              <CookieBanner />
              <PushNotificationModal />
              <ServiceWorkerRegistration />
              <InstallPrompt />
              <GlobalConcierge />
              <Toaster position="bottom-center" toastOptions={{ className: 'font-sans text-sm rounded-sm border border-primary/10 shadow-xl' }} />
            </ErrorBoundary>
          </SmoothScrolling>
        </ThemeProvider>
      </body>
    </html>
  );
}
