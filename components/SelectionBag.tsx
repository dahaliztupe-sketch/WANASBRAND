'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Minus, Gift } from 'lucide-react';
import { useSelectionStore } from '@/store/useSelectionStore';
import { triggerHaptic } from '@/lib/utils/haptics';
import { CountdownTimer } from './CountdownTimer';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '@/lib/hooks/useTranslation';

export function SelectionBag() {
  const { items, isBagOpen, closeBag, removeItem, updateQuantity, giftingDetails, setGiftingDetails } = useSelectionStore();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBag();
    };

    if (isBagOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isBagOpen, closeBag]);

  if (!mounted) return null;

  const estimatedTotal = items.reduce((acc, item) => acc + item.priceAtPurchase * item.quantity, 0);

  return (
    <AnimatePresence>
      {isBagOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 bg-primary/20 backdrop-blur-md z-50"
            onClick={closeBag}
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 end-0 h-full w-full sm:w-[500px] bg-primary/90 backdrop-blur-2xl z-[60] shadow-2xl flex flex-col border-s border-primary/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 md:p-12 pb-6">
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-[0.4em] text-accent-primary font-bold">{t.selectionBag.subtitle}</span>
                <h2 className="text-4xl font-serif tracking-tight text-primary italic">{t.selectionBag.title}</h2>
              </div>
              <button onClick={closeBag} className="text-primary/40 hover:text-primary transition-transform hover:rotate-90 duration-500 w-11 h-11 flex items-center justify-center">
                <X className="w-8 h-8" strokeWidth={0.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-8 flex flex-col gap-12">
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="flex flex-col items-center justify-center h-full text-primary/50 space-y-8"
                >
                  <div className="w-px h-24 bg-primary/20" />
                  <p className="text-[10px] uppercase tracking-[0.4em] text-center leading-loose">
                    {t.selectionBag.empty}
                  </p>
                  <button onClick={closeBag} className="text-xs font-serif italic text-primary hover:text-accent-primary transition-colors border-b border-primary/20 pb-1">
                    {t.selectionBag.return}
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-12 pt-8">
                  {items.map((item, index) => (
                    <motion.div 
                      key={item.variant.sku} 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (index * 0.1), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col gap-6 group"
                    >
                      <div className="flex gap-8">
                        <div className="relative w-32 aspect-[3/4] bg-secondary overflow-hidden">
                          <Image 
                            src={item.image} 
                            alt={item.productName} 
                            fill 
                            quality={90}
                            className="object-cover object-center transition-transform duration-1000 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-2">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-serif text-2xl break-words whitespace-normal text-balance leading-snug text-primary">{item.productName}</h3>
                              <button onClick={() => removeItem(item.variant.sku)} className="text-primary/30 hover:text-accent-primary transition-colors">
                                <X strokeWidth={1} className="w-5 h-5" />
                              </button>
                            </div>
                            <p className="text-[10px] text-primary/50 uppercase tracking-[0.2em] mb-4">
                              {item.variant.size} <span className="mx-2">|</span> {item.variant.color}
                            </p>
                            <p className="text-sm text-primary font-medium tracking-widest">
                              <bdi>EGP {item.priceAtPurchase.toLocaleString()}</bdi>
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-6 mt-6">
                            <div className="flex items-center gap-4">
                              <button 
                                className="text-primary/40 hover:text-primary transition-colors"
                                onClick={() => {
                                  triggerHaptic();
                                  updateQuantity(item.variant.sku, Math.max(1, item.quantity - 1));
                                }}
                              >
                                <Minus strokeWidth={1} className="w-4 h-4" />
                              </button>
                              <span className="w-4 text-center text-xs font-sans text-primary">{item.quantity}</span>
                              <button 
                                className="text-primary/40 hover:text-primary transition-colors"
                                onClick={() => {
                                  triggerHaptic();
                                  updateQuantity(item.variant.sku, item.quantity + 1);
                                }}
                              >
                                <Plus strokeWidth={1} className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {item.holdExpiresAt && (
                        <div className="ps-[160px]">
                          <CountdownTimer expiresAt={item.holdExpiresAt} />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Gifting Section */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="border-t border-primary/10 pt-12 mt-8"
                  >
                      <button 
                      onClick={() => {
                        triggerHaptic();
                        setGiftingDetails({ ...giftingDetails, isGift: !giftingDetails.isGift });
                      }}
                      className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-primary hover:text-accent-primary transition-colors mb-8"
                    >
                      <Gift strokeWidth={1} className={`w-4 h-4 ${giftingDetails.isGift ? 'text-accent-primary' : ''}`} />
                      {giftingDetails.isGift ? t.selectionBag.gifting.removeGift : t.selectionBag.gifting.makeGift}
                    </button>
                    
                    <AnimatePresence>
                      {giftingDetails.isGift && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-6 overflow-hidden"
                        >
                          <input 
                            type="text"
                            placeholder={t.selectionBag.gifting.recipientPlaceholder}
                            value={giftingDetails.recipientName || ''}
                            onChange={(e) => setGiftingDetails({ ...giftingDetails, recipientName: e.target.value })}
                            className="w-full bg-transparent border-b border-primary/20 pb-4 text-sm text-primary placeholder:text-primary/30 focus:border-primary outline-none transition-colors font-serif italic"
                          />
                          <textarea 
                            placeholder={t.selectionBag.gifting.notePlaceholder}
                            value={giftingDetails.handwrittenNote || ''}
                            onChange={(e) => setGiftingDetails({ ...giftingDetails, handwrittenNote: e.target.value })}
                            className="w-full bg-transparent border-b border-primary/20 pb-4 text-sm text-primary placeholder:text-primary/30 focus:border-primary outline-none transition-colors min-h-[100px] resize-none font-serif italic"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="p-8 md:p-12 border-t border-primary/10 bg-primary/50 backdrop-blur-md"
              >
                <div className="flex justify-between items-end mb-8">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50">{t.selectionBag.total}</span>
                  <span className="text-3xl font-serif text-primary">
                    <bdi>EGP {estimatedTotal.toLocaleString()}</bdi>
                  </span>
                </div>
                <Link 
                  href="/reserve" 
                  onClick={() => {
                    triggerHaptic();
                    closeBag();
                  }}
                  className="group relative w-full flex items-center justify-center py-6 bg-primary text-primary-foreground overflow-hidden transition-all invert dark:invert-0"
                >
                  <span className="absolute inset-0 w-0 bg-accent-primary transition-all duration-[800ms] ease-out group-hover:w-full" />
                  <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] font-bold group-hover:text-white transition-colors duration-500">
                    {t.selectionBag.submit}
                  </span>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
