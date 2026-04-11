'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, MapPin, Clock, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { trackOrder, trackByToken } from './actions';
import { toast } from 'sonner';
import Image from 'next/image';

function TrackContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [orderId, setOrderId] = useState('');
  const [privacyKey, setPrivacyKey] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      handleTrackByToken(token);
    }
  }, [token]);

  const handleTrackByToken = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await trackByToken(token);
      if (result.success && result.data) {
        if (result.data.needsVerification) {
          setOrderId(result.data.orderNumber);
          toast.info('Please enter the last 4 digits of your phone number to unlock tracking.');
        } else {
          setTrackingData(result.data);
        }
      } else {
        setError(result.error || 'Failed to track order.');
        toast.error(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrackingData(null);
    
    try {
      const result = await trackOrder(orderId, privacyKey);
      if (result.success) {
        setTrackingData(result.data);
      } else {
        setError(result.error || 'Failed to track order.');
        toast.error(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-16">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-serif text-primary italic">Reservation Timeline</h1>
        <p className="text-primary/60 font-light">Securely track your concierge request.</p>
      </header>

      {/* Tracking Form */}
      {!trackingData && (
        <div className="bg-primary p-12 border border-primary/30 shadow-sm">
          <form onSubmit={handleTrack} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-primary/40">Reservation ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. #WNS-10001"
                className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-primary/40">Privacy Key (Last 4 digits of phone)</label>
              <input
                type="text"
                value={privacyKey}
                onChange={(e) => setPrivacyKey(e.target.value)}
                placeholder="e.g. 6772"
                maxLength={4}
                className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-inverted text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Unlock Tracking'}
            </button>
          </form>
        </div>
      )}

      {/* Error State */}
      {error && !trackingData && (
        <div className="bg-red-50 border border-red-100 p-4 flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle strokeWidth={1} className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Tracking Results */}
      <AnimatePresence>
        {trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary p-12 border border-primary/30 shadow-sm space-y-12"
          >
            <div className="flex items-center justify-between pb-8 border-b border-primary/10">
              <div className="space-y-1">
                <h2 className="text-xl font-serif text-primary uppercase tracking-widest">
                  {trackingData.status.replace('_', ' ')}
                </h2>
                <p className="text-xs text-primary/50 uppercase tracking-widest">
                  <bdi>{trackingData.id}</bdi>
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-0 relative">
              <div className="absolute left-[5.5px] top-2 bottom-2 w-[1px] bg-primary/10" />
              {trackingData.steps.map((step: any, i: number) => {
                const isActive = step.completed && (i === trackingData.steps.length - 1 || !trackingData.steps[i + 1].completed);
                return (
                  <div key={i} className="flex items-start gap-8 pb-12 last:pb-0 relative">
                    <div className={`w-3 h-3 rounded-full mt-1.5 z-10 ${isActive ? 'bg-accent-primary ring-4 ring-accent-primary/20' : step.completed ? 'bg-inverted' : 'bg-primary/10'}`} />
                    <div className="space-y-1">
                      <span className={`text-[10px] uppercase tracking-[0.2em] block ${isActive ? 'text-accent-primary font-bold' : step.completed ? 'text-primary' : 'text-primary/40'}`}>
                        {step.status}
                      </span>
                      {isActive && (
                        <p className="text-xs text-primary/60 font-light italic">Current Status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Items Snapshot */}
            <div className="space-y-8 pt-8 border-t border-primary/10">
              <div className="flex items-center gap-3">
                <ShoppingBag strokeWidth={1} className="w-4 h-4 text-accent-primary" />
                <h3 className="text-xs uppercase tracking-[0.2em] text-primary/40 font-bold">Your Selection</h3>
              </div>
              <div className="space-y-6">
                {trackingData.items?.map((item: any) => (
                  <div key={item.variant.sku} className="flex gap-6 items-center">
                    <div className="w-16 h-20 bg-inverted/5 relative overflow-hidden flex-shrink-0">
                      {item.coverImageURL ? (
                        <Image 
                          src={item.coverImageURL} 
                          alt={item.productName} 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/10">
                          <Package strokeWidth={1} className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-serif text-sm text-primary">{item.productName}</p>
                      <p className="text-[10px] uppercase tracking-widest text-primary/40">
                        {item.variant.size} / {item.variant.color}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-primary/30 py-20 px-6">
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <TrackContent />
      </Suspense>
    </main>
  );
}

