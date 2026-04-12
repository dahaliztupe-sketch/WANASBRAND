'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '@/lib/utils/haptics';
import { useSelectionStore } from '@/store/useSelectionStore';
import { Gift, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function ReservePage() {
  const router = useRouter();
  const { items, giftingDetails, setGiftingDetails } = useSelectionStore();
  const [isGift, setIsGift] = useState(giftingDetails.isGift);
  const [governorate, setGovernorate] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [settings, setSettings] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot state
  const { t } = useTranslation();

  const subtotal = items.reduce((acc, item) => acc + item.priceAtPurchase * item.quantity, 0);

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    };
    fetchSettings();

    // Fetch user data for pre-filling
    import('@/lib/firebase/client').then(({ auth }) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      });
      return () => unsubscribe();
    });
  }, []);

  useEffect(() => {
    if (!settings) return;
    
    if (governorate === 'Cairo' || governorate === 'Giza') {
      setShippingFee(settings.shippingRateCairoGiza || 0);
    } else if (governorate) {
      setShippingFee(settings.shippingRateOther || 0);
    } else {
      setShippingFee(0);
    }
  }, [governorate, settings]);

  const totalAmount = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    triggerHaptic();
    setIsSubmitting(true);
    
    // Egyptian phone validation: 010, 011, 012, 015 followed by 8 digits
    const phoneInput = (e.target as any).phone.value;
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phoneInput)) {
      import('sonner').then(({ toast }) => toast.error(t.reserve.errors.invalidPhone));
      setIsSubmitting(false);
      return;
    }

    try {
      // Create snapshot items for referential integrity (Task 3)
      const snapshotItems = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        priceAtPurchase: item.priceAtPurchase,
        quantity: item.quantity,
        variant: item.variant,
        coverImageURL: item.image || '', // Ensure we have a snapshot of the image
        recommendedByAI: item.recommendedByAI || false,
      }));

      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          customerData: {
            fullName: (e.target as any).fullName.value,
            email: (e.target as any).email.value,
            phone: phoneInput,
            city: governorate,
            address: (e.target as any).address.value,
            giftingDetails: { 
              isGift, 
              recipientName: (e.target as any).recipientName?.value, 
              handwrittenNote: (e.target as any).handwrittenNote?.value 
            }
          },
          items: snapshotItems,
          subtotal,
          shippingFee,
          totalAmount,
          website, // Honeypot field
        }),
      });

      if (response.ok) {
        useSelectionStore.getState().clearSelection();
        router.push('/reserve/success');
      } else {
        const errorData = await response.json();
        import('sonner').then(({ toast }) => toast.error(errorData.error || t.reserve.errors.failed));
      }
    } catch (error: any) {
      console.error('Reservation error:', error);
      import('sonner').then(({ toast }) => toast.error(error.message || t.reserve.errors.failed));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="flex-1 p-8 md:p-24">
        <div className="max-w-xl mx-auto space-y-12">
          <h1 className="text-4xl font-serif text-primary italic">{t.reserve.title}</h1>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Honeypot field */}
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

            <div className="space-y-8">
              <div className="group">
                <label className="text-[10px] uppercase tracking-widest text-primary/40 group-focus-within:text-accent-primary transition-colors">{t.reserve.fullName}</label>
                <input name="fullName" type="text" defaultValue={userData?.fullName || ''} required className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors" />
              </div>

              <div className="group">
                <label className="text-[10px] uppercase tracking-widest text-primary/40 group-focus-within:text-accent-primary transition-colors">{t.reserve.email}</label>
                <input name="email" type="email" defaultValue={userData?.email || ''} required className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors" />
              </div>
              
              <div className="group">
                <label className="text-[10px] uppercase tracking-widest text-primary/40 group-focus-within:text-accent-primary transition-colors">{t.reserve.phone}</label>
                <input name="phone" type="tel" defaultValue={userData?.phone || ''} placeholder={t.reserve.phonePlaceholder} required className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors" />
              </div>

              <div className="group">
                <label className="text-[10px] uppercase tracking-widest text-primary/40 group-focus-within:text-accent-primary transition-colors">{t.reserve.governorate}</label>
                <select 
                  name="city" 
                  required 
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>{t.reserve.selectGovernorate}</option>
                  {[
                    'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Beheira', 'Fayoum', 'Gharbiya', 
                    'Ismailia', 'Monufia', 'Minya', 'Qalyubia', 'New Valley', 'Suez', 'Aswan', 'Assiut', 
                    'Beni Suef', 'Port Said', 'Damietta', 'Sharkia', 'South Sinai', 'Kafr El Sheikh', 
                    'Matrouh', 'Luxor', 'Qena', 'North Sinai', 'Sohag'
                  ].sort().map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              <div className="group">
                <label className="text-[10px] uppercase tracking-widest text-primary/40 group-focus-within:text-accent-primary transition-colors">{t.reserve.address}</label>
                <input name="address" type="text" required className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            {/* Gifting Suite */}
            <div className="space-y-6">
              <button 
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setIsGift(!isGift);
                }}
                className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-primary hover:text-accent-primary transition-colors"
              >
                <Gift strokeWidth={1} className={`w-4 h-4 ${isGift ? 'text-accent-primary' : ''}`} />
                {isGift ? t.reserve.removeGift : t.reserve.isGift}
              </button>
              
              <AnimatePresence>
                {isGift && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-6 overflow-hidden"
                  >
                    <input name="recipientName" type="text" placeholder={t.reserve.recipientName} className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors" />
                    <textarea name="handwrittenNote" placeholder={t.reserve.handwrittenNote} className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors min-h-[100px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-inverted text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 strokeWidth={1} className="w-4 h-4 animate-spin" /> : t.reserve.submit}
            </button>
          </form>
        </div>
      </div>

      {/* Right: Sticky Order Summary */}
      <div className="md:w-1/3 bg-primary/50 p-8 md:p-24 border-l border-primary/5">
        <div className="sticky top-24 space-y-8">
          <h2 className="text-xl font-serif">{t.reserve.summary}</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.variant.sku} className="flex justify-between text-sm">
                <span>{item.productName} x {item.quantity}</span>
                <span><bdi>EGP {(item.priceAtPurchase * item.quantity).toLocaleString()}</bdi></span>
              </div>
            ))}
            <div className="flex justify-between text-sm text-primary/60 italic">
              <span>{t.reserve.shippingFee}</span>
              <span>{shippingFee > 0 ? <bdi>{`EGP ${shippingFee.toLocaleString()}`}</bdi> : t.reserve.calculatedCheckout}</span>
            </div>
          </div>
          <div className="border-t border-primary/10 pt-4 flex justify-between font-bold">
            <span>{t.reserve.total}</span>
            <span><bdi>EGP {totalAmount.toLocaleString()}</bdi></span>
          </div>
        </div>
      </div>
    </div>
  );
}
