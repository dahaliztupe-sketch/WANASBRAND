'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(() => true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-accent-primary/20 p-4 z-50 flex items-center justify-between gap-4 shadow-2xl">
      <p className="text-xs text-primary/70 leading-relaxed">
        We use cookies to enhance your experience. By continuing to browse, you agree to our use of cookies. 
        <Link href="/privacy" className="underline underline-offset-4 ml-2">Learn more</Link>.
      </p>
      <button 
        onClick={accept}
        className="px-6 py-2 bg-accent-primary text-inverted text-xs uppercase tracking-widest hover:bg-inverted transition-colors whitespace-nowrap"
      >
        Accept
      </button>
    </div>
  );
}
