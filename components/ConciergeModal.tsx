'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { z } from 'zod';

import { useTranslation } from '@/lib/hooks/useTranslation';

const conciergeSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  contactMethod: z.enum(['whatsapp', 'phone']),
  vibe: z.enum(['styling', 'sizing']),
  consent: z.literal(true, {
    message: 'You must consent to data processing',
  }),
});

interface ConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof conciergeSchema>) => void;
  isSubmitting: boolean;
}

export function ConciergeModal({ isOpen, onClose, onSubmit, isSubmitting }: ConciergeModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    contactMethod: 'whatsapp',
    vibe: 'styling',
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = conciergeSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverted/20 backdrop-blur-sm">
      <div className="bg-primary/90 backdrop-blur-md w-full max-w-lg p-8 shadow-2xl border border-primary/50 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-primary/50 hover:text-primary">
          <X strokeWidth={1} size={24} />
        </button>
        
        <h2 className="font-serif text-2xl text-primary mb-6">{t.conciergeModal.title}</h2>
        <p className="text-sm text-primary/70 mb-8">{t.conciergeModal.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-primary mb-2">{t.conciergeModal.fullName}</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full border-b border-primary/20 py-2 bg-transparent focus:outline-none focus:border-primary"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{t.conciergeModal.errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-primary mb-2">{t.conciergeModal.phone}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full border-b border-primary/20 py-2 bg-transparent focus:outline-none focus:border-primary"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{t.conciergeModal.errors.phone}</p>}
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-wider text-primary mb-2">{t.conciergeModal.contactMethod}</label>
            <select
              value={formData.contactMethod}
              onChange={(e) => setFormData({...formData, contactMethod: e.target.value as 'whatsapp' | 'phone'})}
              className="w-full border-b border-primary/20 py-2 bg-transparent focus:outline-none focus:border-primary"
            >
              <option value="whatsapp">{t.conciergeModal.whatsapp}</option>
              <option value="phone">{t.conciergeModal.phoneCall}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-primary mb-2">{t.conciergeModal.vibe}</label>
            <select
              value={formData.vibe}
              onChange={(e) => setFormData({...formData, vibe: e.target.value as 'styling' | 'sizing'})}
              className="w-full border-b border-primary/20 py-2 bg-transparent focus:outline-none focus:border-primary"
            >
              <option value="styling">{t.conciergeModal.styling}</option>
              <option value="sizing">{t.conciergeModal.sizing}</option>
            </select>
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                className="mt-1 accent-charcoal-dark"
              />
              <span className="text-xs text-primary/70 leading-relaxed">
                {t.conciergeModal.consent}
              </span>
            </label>
            {errors.consent && <p className="text-red-500 text-xs mt-1">{t.conciergeModal.errors.consent}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-inverted text-inverted tracking-widest text-sm uppercase hover:bg-accent-primary transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t.conciergeModal.submitting : t.conciergeModal.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
