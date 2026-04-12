'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
}

export function WaitlistModal({ isOpen, onClose, productId, variantId, productName, variantName }: WaitlistModalProps) {
  const [contactInfo, setContactInfo] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, locale } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          variantId,
          productName,
          variantName,
          contactInfo,
          website, // Honeypot field
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      toast.success(t.waitlistModal.successToast);
      onClose();
      setContactInfo('');
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error(t.waitlistModal.errorToast);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverted/50 backdrop-blur-sm p-4">
      <div className="bg-primary w-full max-w-md p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className={`absolute top-4 ${locale === 'ar' ? 'left-4' : 'right-4'} p-2 text-primary/50 hover:text-primary transition-colors`}
        >
          <X strokeWidth={1} className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-light text-primary mb-2">{t.waitlistModal.title}</h2>
          <p className="text-primary/60 font-light">
            {productName} - {variantName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field - hidden from users */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="contact" className="block text-[10px] uppercase tracking-widest text-primary/50 mb-2">
              {t.waitlistModal.contactLabel}
            </label>
            <input
              type="text"
              id="contact"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder={t.waitlistModal.contactPlaceholder}
              className="w-full border-b border-primary/50 py-3 px-0 bg-transparent focus:border-primary focus:ring-0 transition-colors text-sm font-light placeholder:text-primary/30"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !contactInfo.trim()}
            className="w-full py-4 bg-inverted text-inverted text-xs uppercase tracking-[0.2em] font-semibold hover:bg-inverted/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t.waitlistModal.joining : t.waitlistModal.join}
          </button>
        </form>
      </div>
    </div>
  );
}
