'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[WANAS Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold mb-8">
        Something went wrong
      </p>

      <h1 className="text-5xl md:text-6xl font-serif text-primary mb-6 tracking-tight">
        An Error Occurred
      </h1>

      <div className="w-16 h-px bg-accent-primary/40 mb-8" />

      <p className="text-base text-secondary max-w-sm mb-12 leading-relaxed font-light">
        We encountered an unexpected issue. Our team has been notified. Please try again or return to the atelier.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button
          onClick={reset}
          className="px-10 py-3.5 bg-primary text-inverted text-[10px] tracking-[0.3em] uppercase hover:bg-accent-primary transition-colors duration-300 min-w-[180px]"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-10 py-3.5 border border-primary/20 text-primary text-[10px] tracking-[0.3em] uppercase hover:border-accent-primary hover:text-accent-primary transition-colors duration-300 min-w-[180px]"
        >
          Return to Atelier
        </Link>
      </div>

      {error.digest && (
        <p className="mt-16 text-[9px] tracking-widest text-primary/20 uppercase font-light">
          Error reference: {error.digest}
        </p>
      )}

      <div className="mt-8 text-[9px] tracking-[0.4em] uppercase text-primary/30 font-light">
        © WANAS Atelier
      </div>
    </div>
  );
}
