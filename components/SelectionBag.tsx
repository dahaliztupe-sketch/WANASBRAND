'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Minus, Gift } from 'lucide-react';
import { useSelectionStore } from '@/store/useSelectionStore';
import { triggerHaptic } from '@/lib/utils/haptics';
import { CountdownTimer } from './CountdownTimer';
import Link from 'next/link';
import Image from 'next/image';

export function SelectionBag() {
  const { items, isBagOpen, closeBag, removeItem, updateQuantity, giftingDetails, setGiftingDetails } = useSelectionStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const estimatedTotal = items.reduce((acc, item) => acc + item.priceAtPurchase * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isBagOpen && (
        <div 
          className="fixed inset-0 bg-inverted/50 backdrop-blur-md z-50 transition-opacity"
          onClick={closeBag}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-primary z-[60] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${
          isBagOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-primary/10">
          <h2 className="text-2xl font-serif tracking-wide text-primary">Selection Bag</h2>
          <button onClick={closeBag} className="text-primary/60 hover:text-primary transition-colors w-11 h-11 flex items-center justify-center">
            <X className="w-6 h-6" strokeWidth={1} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-primary/50">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-6">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              <p className="text-sm uppercase tracking-widest mb-4">Your wardrobe selection is currently empty.</p>
              <p className="text-xs text-center text-primary/40 mb-6 px-4">Discover our latest silhouettes.</p>
              <button onClick={closeBag} className="text-primary hover:text-primary/70 transition-colors underline underline-offset-4">
                Continue Exploring
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.variant.sku} className="flex flex-col gap-4">
                  <div className="flex gap-6">
                    <div className="relative w-24 h-32 bg-primary/5">
                      <Image 
                        src={item.image} 
                        alt={item.productName} 
                        fill 
                        quality={90}
                        className="object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-serif text-lg break-words whitespace-normal text-balance leading-snug text-primary">{item.productName}</h3>
                          <button onClick={() => removeItem(item.variant.sku)} className="text-primary/40 hover:text-primary w-11 h-11 flex items-center justify-center -mt-3 -mr-3">
                            <X strokeWidth={1} className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-primary/60 uppercase tracking-wider mb-2">Size: {item.variant.size} | Color: {item.variant.color}</p>
                        <p className="text-sm text-primary">EGP {item.priceAtPurchase.toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-primary/20">
                          <button 
                            className="w-11 h-11 flex items-center justify-center text-primary/60 hover:text-primary"
                            onClick={() => {
                              triggerHaptic();
                              updateQuantity(item.variant.sku, Math.max(1, item.quantity - 1));
                            }}
                          >
                            <Minus strokeWidth={1} className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-primary">{item.quantity}</span>
                          <button 
                            className="w-11 h-11 flex items-center justify-center text-primary/60 hover:text-primary"
                            onClick={() => {
                              triggerHaptic();
                              updateQuantity(item.variant.sku, item.quantity + 1);
                            }}
                          >
                            <Plus strokeWidth={1} className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {item.holdExpiresAt && (
                    <div className="pl-[120px]">
                      <CountdownTimer expiresAt={item.holdExpiresAt} />
                    </div>
                  )}
                </div>
              ))}

              {/* Gifting Section */}
              <div className="border-t border-primary/10 pt-8 mt-4">
                <button 
                  onClick={() => {
                    triggerHaptic();
                    setGiftingDetails({ ...giftingDetails, isGift: !giftingDetails.isGift });
                  }}
                  className="flex items-center gap-3 text-sm uppercase tracking-widest text-primary hover:text-primary/70 transition-colors mb-6"
                >
                  <Gift strokeWidth={1} className={`w-5 h-5 ${giftingDetails.isGift ? 'text-primary' : ''}`} />
                  {giftingDetails.isGift ? 'Remove Gift Options' : 'Make this a Gift'}
                </button>
                
                {giftingDetails.isGift && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <input 
                      type="text"
                      placeholder="To: (Recipient Name)"
                      value={giftingDetails.recipientName || ''}
                      onChange={(e) => setGiftingDetails({ ...giftingDetails, recipientName: e.target.value })}
                      className="w-full bg-primary border border-primary/10 p-4 text-sm text-primary focus:border-primary outline-none transition-colors"
                    />
                    <textarea 
                      placeholder="Write your warm wishes here..."
                      value={giftingDetails.handwrittenNote || ''}
                      onChange={(e) => setGiftingDetails({ ...giftingDetails, handwrittenNote: e.target.value })}
                      className="w-full bg-primary border border-primary/10 p-4 text-sm text-primary focus:border-primary outline-none transition-colors min-h-[100px]"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-8 border-t border-primary/10 bg-primary">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm uppercase tracking-widest text-primary/70">Estimated Total</span>
              <span className="text-xl font-serif text-primary">EGP {estimatedTotal.toLocaleString()}</span>
            </div>
            <Link 
              href="/reserve" 
              onClick={() => {
                triggerHaptic();
                closeBag();
              }}
              className="w-full block text-center bg-inverted text-inverted py-4 uppercase tracking-widest text-[10px] hover:bg-inverted/90 transition-colors"
            >
              Proceed to Reservation
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
