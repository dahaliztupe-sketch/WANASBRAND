import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Tajawal } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";
import { LanguageWrapper } from "@/components/LanguageWrapper";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-serif", display: "swap" });
const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-arabic", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://wanasbrand.com"),
  title: {
    default: "WANAS | Handcrafted Fashion House",
    template: "%s | WANAS"
  },
  description: "WANAS is a luxury fashion house dedicated to handcrafted excellence and timeless elegance. Based in Egypt, serving the world.",
  keywords: ["fashion", "luxury", "handcrafted", "egyptian fashion", "couture", "wanas", "atelier", "high-end dresses"],
  authors: [{ name: "WANAS Atelier" }],
  creator: "WANAS",
  publisher: "WANAS",
  alternates: {
    canonical: "/",
    languages: {
      'en-US': '/en',
      'ar-EG': '/ar',
      'x-default': '/',
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wanasbrand.com",
    siteName: "WANAS Atelier",
    title: "WANAS | Handcrafted Fashion House",
    description: "Luxury handcrafted fashion from the heart of Egypt. Timeless elegance and modern grace.",
    images: [
      {
        url: "https://wanasbrand.com/og-main.jpg",
        width: 1200,
        height: 630,
        alt: "WANAS Atelier - Handcrafted Fashion House",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@wanasbrand",
    creator: "@wanasbrand",
    title: "WANAS | Handcrafted Fashion House",
    description: "Luxury handcrafted fashion from the heart of Egypt.",
    images: ["https://wanasbrand.com/og-main.jpg"],
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
  maximumScale: 5,
  userScalable: true,
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
import AudioBranding from "@/components/AudioBranding";
import { Toaster } from "sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get('language')?.value;
  const initialLang = languageCookie === 'ar' ? 'ar' : 'en';
  const initialDir = initialLang === 'ar' ? 'rtl' : 'ltr';

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WANAS",
    "alternateName": "WANAS Atelier",
    "url": "https://wanasbrand.com",
    "logo": "https://wanasbrand.com/logo.png",
    "description": "Luxury fashion house dedicated to handcrafted excellence and timeless elegance.",
    "sameAs": [
      "https://instagram.com/wanas.brand",
      "https://facebook.com/wanas.brand",
      "https://twitter.com/wanasbrand"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+201090946772",
      "contactType": "customer service",
      "areaServed": "Worldwide",
      "availableLanguage": ["English", "Arabic"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    }
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WANAS",
    "url": "https://wanasbrand.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://wanasbrand.com/collections?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang={initialLang} dir={initialDir} className={`${montserrat.variable} ${playfair.variable} ${tajawal.variable}`} suppressHydrationWarning>
      <body className={`antialiased pb-16 lg:pb-0 cursor-none md:cursor-auto rtl:tracking-normal ltr:tracking-wide ${initialLang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <LanguageWrapper>
              <SmoothScrolling>
                <ErrorBoundary>
                <NetworkStatus />
                <FirebaseBoot />
                <AudioBranding />
                <CustomCursor />
                <StructuredData data={organizationJsonLd} />
                <StructuredData data={websiteJsonLd} />
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
            </LanguageWrapper>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
