'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectionStore } from '@/store/useSelectionStore';
import { createReservation } from '@/lib/services/reservation.service';
import { auth } from '@/lib/firebase/client';
import Image from 'next/image';
import { ConciergeModal } from '@/components/ConciergeModal';
import { z } from 'zod';
import { formatPrice } from '@/lib/utils';
import { triggerHaptic } from '@/lib/utils/haptics';

// Re-defining schema for type inference if not exported from component
const conciergeSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  contactMethod: z.enum(['whatsapp', 'phone']),
  vibe: z.enum(['styling', 'sizing']),
  consent: z.literal(true, {
    message: 'You must consent to data processing',
  }),
});

export default function ReservationPage() {
  const router = useRouter();
  const { items, clearSelection } = useSelectionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

  const handleSubmit = async (formData: z.infer<typeof conciergeSchema>) => {
    setError(null);

    if (!auth.currentUser) {
      setError('Please sign in to submit a reservation.');
      return;
    }

    if (items.length === 0) {
      setError('Your selection bag is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      triggerHaptic();
      const { id: reservationId, whatsappLink } = await createReservation(formData, items, totalAmount);
      clearSelection();
      router.push(`/reservation/success?id=${reservationId}&whatsapp=${encodeURIComponent(whatsappLink)}`);
    } catch (err: unknown) {
      console.error('Reservation error:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit reservation. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-8">
        <h1 className="font-serif text-3xl text-primary mb-4">Your Selection is Empty</h1>
        <p className="text-primary/70 mb-8">Please add items to your selection bag before proceeding.</p>
        <button
          onClick={() => router.push('/collections')}
          className="px-8 py-3 bg-inverted text-inverted tracking-widest text-sm uppercase hover:bg-accent-primary transition-colors"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-4xl text-primary mb-12 text-center">Complete Your Reservation</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Action Section */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-12 border border-primary/5 bg-primary shadow-sm">
            <h2 className="font-serif text-2xl text-primary mb-6">Concierge Consultation</h2>
            <p className="text-sm text-primary/60 mb-8 text-center max-w-md">
              A piece of art requires a personal touch. Click below to request a consultation with our concierge team.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-12 py-5 bg-inverted text-inverted tracking-widest text-sm uppercase hover:bg-accent-primary transition-colors"
            >
              Request Consultation
            </button>
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-5">
            <div className="bg-primary p-8 shadow-sm border border-primary/5 sticky top-24">
              <h2 className="font-serif text-2xl text-primary mb-6">Your Selection</h2>
              
              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.variant.sku} className="flex gap-4">
                    <div className="relative w-20 h-24 bg-inverted/5 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-primary">{item.productName}</h3>
                        <p className="text-xs text-primary/60 mt-1">Size: {item.variant.size}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-primary/60">Qty: {item.quantity}</span>
                        <span className="text-sm text-primary">{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-primary/10 pt-6 space-y-4">
                <div className="flex justify-between text-sm text-primary/70">
                  <span>Subtotal (Excl. VAT)</span>
                  <span>{formatPrice(totalAmount / 1.14)}</span>
                </div>
                <div className="flex justify-between text-sm text-primary/70">
                  <span>VAT (14%)</span>
                  <span>{formatPrice(totalAmount - (totalAmount / 1.14))}</span>
                </div>
                <div className="flex justify-between text-sm text-primary/70">
                  <span>Shipping</span>
                  <span>Calculated by concierge</span>
                </div>
                <div className="flex justify-between text-lg font-serif text-primary pt-4 border-t border-primary/10">
                  <span>Estimated Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConciergeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
