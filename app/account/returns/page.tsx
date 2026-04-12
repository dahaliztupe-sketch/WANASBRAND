'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { Reservation, ReservationItem } from '@/types';
import { triggerHaptic } from '@/lib/utils/haptics';

export default function ReturnsPage() {
  const [orders, setOrders] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Reservation | null>(null);
  const [selectedItem, setSelectedItem] = useState<ReservationItem | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'reservations'),
          where('userId', '==', auth.currentUser.uid),
          where('status', '==', 'delivered')
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders for returns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSubmit = async () => {
    if (!selectedOrder || !selectedItem || !reason) return;
    
    triggerHaptic();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'returnRequests'), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        orderId: selectedOrder.id,
        orderNumber: selectedOrder.orderNumber || selectedOrder.reservationNumber,
        item: selectedItem,
        reason,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      setSuccess(true);
      toast.success('Return request submitted successfully.');
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error('Failed to submit return request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8"
      >
        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
          <CheckCircle2 strokeWidth={1} className="w-12 h-12" />
        </div>
        <div className="space-y-4 max-w-md">
          <h2 className="text-3xl font-serif text-primary">Request Received</h2>
          <p className="text-primary/60 font-light leading-relaxed italic">
            Your request is received. A WANAS Ambassador will contact you to arrange a white-glove collection.
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/account'}
          className="px-8 py-4 bg-inverted text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all"
        >
          Return to Overview
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-serif text-primary tracking-wide">Atelier Services</h1>
        <p className="text-primary/50 font-light tracking-wide italic">
          Frame returns as a complimentary collection service, ensuring your wardrobe remains perfectly curated.
        </p>
      </header>

      <div className="max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] border transition-colors ${step >= s ? 'bg-inverted text-inverted border-inverted' : 'border-primary/10 text-primary/20'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-[1px] ${step > s ? 'bg-inverted' : 'bg-primary/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-serif text-primary">Select an Acquisition</h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-24 bg-inverted/5 animate-pulse" />)}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setStep(2);
                      }}
                      className="w-full flex items-center justify-between p-6 border border-primary/5 hover:border-accent-primary/30 transition-all group text-left"
                    >
                      <div className="flex items-center gap-6">
                        <Package strokeWidth={1} className="w-6 h-6 text-primary/20 group-hover:text-accent-primary transition-colors" />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-primary/40 mb-1">Order {order.orderNumber || order.reservationNumber}</p>
                          <p className="text-sm font-medium text-primary">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ChevronRight strokeWidth={1} className="w-4 h-4 text-primary/20 group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border border-dashed border-primary/10 rounded-sm space-y-4">
                  <AlertCircle strokeWidth={1} className="w-8 h-8 text-primary/20 mx-auto" />
                  <p className="text-primary/40 text-sm font-light italic">No eligible orders found for returns.</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && selectedOrder && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-serif text-primary">Select Item to Refine</h2>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedItem(item);
                      setStep(3);
                    }}
                    className="w-full flex items-center justify-between p-6 border border-primary/5 hover:border-accent-primary/30 transition-all group text-left"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-16 bg-inverted/5 relative overflow-hidden">
                        <Image 
                          src={item.image} 
                          alt={item.productName} 
                          fill 
                          className="object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{item.productName}</p>
                        <p className="text-[10px] uppercase tracking-widest text-primary/40">{item.variant.size} / {item.variant.color}</p>
                      </div>
                    </div>
                    <ChevronRight strokeWidth={1} className="w-4 h-4 text-primary/20 group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep(1)}
                className="text-[10px] uppercase tracking-widest text-primary/40 hover:text-primary transition-colors"
              >
                Back to Orders
              </button>
            </motion.div>
          )}

          {step === 3 && selectedItem && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-serif text-primary">Reason for Service</h2>
              <div className="space-y-6">
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border-b border-primary/20 py-4 bg-transparent outline-none focus:border-primary transition-colors appearance-none cursor-pointer text-sm"
                >
                  <option value="" disabled>Select a Reason</option>
                  <option value="Refining the Fit">Refining the Fit (Alteration)</option>
                  <option value="Changed Mind">Changed Mind (Return)</option>
                  <option value="Fabric Note">Fabric Note (Quality Check)</option>
                </select>
                
                <div className="bg-accent-primary/5 p-6 border border-accent-primary/10">
                  <p className="text-xs text-accent-primary leading-relaxed italic">
                    Note: Our white-glove collection service will be arranged at your convenience. A WANAS Ambassador will contact you within 24 hours.
                  </p>
                </div>

                <div className="flex gap-4 pt-8">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 border border-primary/10 text-[10px] uppercase tracking-widest text-primary/40 hover:text-primary hover:border-primary transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!reason || isSubmitting}
                    className="flex-[2] py-4 bg-inverted text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Collection Service'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
