'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservationId = searchParams.get('id');
  const whatsappLink = searchParams.get('whatsapp');

  useEffect(() => {
    if (!reservationId) {
      // If no ID, redirect back to home
      router.push('/');
    }
  }, [reservationId, router]);

  if (!reservationId) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Check strokeWidth={1} className="w-10 h-10 text-accent-primary" />
        </div>
        
        <h1 className="font-serif text-4xl text-primary mb-4">Your Order is Confirmed</h1>
        
        <p className="text-primary/70 mb-8 leading-relaxed">
          We are honored to receive your request. A WANAS Client Services representative will reach out shortly to finalize your order.
        </p>
        
        {whatsappLink && (
          <Link
            href={decodeURIComponent(whatsappLink)}
            target="_blank"
            className="inline-block px-8 py-4 bg-inverted text-inverted tracking-widest text-sm uppercase hover:bg-accent-primary transition-colors mb-8"
          >
            Contact Client Services on WhatsApp
          </Link>
        )}
        
        <div className="bg-primary p-6 border border-primary/30 mb-8">
          <p className="text-xs uppercase tracking-wider text-primary/60 mb-2">Reference Number</p>
          <p className="font-mono text-lg text-primary">{reservationId}</p>
        </div>
        
        <p className="text-sm text-primary/60 mb-12">
          Our customer care team will contact you shortly to confirm your order and arrange delivery details.
        </p>
        
        <Link 
          href="/"
          className="inline-block px-8 py-4 bg-inverted text-inverted tracking-widest text-sm uppercase hover:bg-inverted/90 transition-colors"
        >
          Return to The Atelier
        </Link>
      </div>
    </div>
  );
}

export default function ReservationSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
