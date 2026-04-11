'use client';

import { useEffect, useState, use } from 'react';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { motion, AnimatePresence } from 'motion/react';
import { Reservation } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Printer, X, Award, Package } from 'lucide-react';
import { triggerHaptic } from '@/lib/utils/haptics';
import { TrackingTimeline } from '@/components/TrackingTimeline';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const { t, locale } = useTranslation();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'reservations', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Reservation);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `reservations/${id}`, auth);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="h-96 bg-inverted/5 animate-pulse" />;
  if (!order) return <div className="text-center py-20">{t.orderDetails.notFound}</div>;

  return (
    <div className="space-y-16">
      <Link 
        href="/account/orders" 
        className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-primary/40 hover:text-accent-primary transition-colors group"
      >
        <ArrowLeft strokeWidth={1} className={`w-4 h-4 transition-transform ${locale === 'ar' ? 'group-hover:translate-x-1 rotate-180' : 'group-hover:-translate-x-1'}`} />
        {t.orderDetails.backToCollection}
      </Link>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 border-b border-primary/5 pb-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-serif text-primary tracking-wide italic">
            <span dir="ltr">{t.orderDetails.order} {order.orderNumber}</span>
          </h1>
          <p className="text-primary/50 font-light tracking-widest uppercase text-xs">
            {t.orderDetails.acquiredOn} {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <button 
          onClick={() => {
            triggerHaptic();
            setShowCertificate(true);
          }}
          className="flex items-center gap-4 px-8 py-4 border border-accent-primary/30 text-accent-primary text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary hover:text-inverted transition-all group"
        >
          <ShieldCheck strokeWidth={1} className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {t.orderDetails.viewCertificate}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <h2 className="text-xl font-serif text-primary tracking-wide">{t.orderDetails.acquiredPieces}</h2>
          <div className="space-y-8">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-8 items-center bg-inverted/[0.01] border border-primary/5 p-8 group">
                <div className="relative w-40 h-52 overflow-hidden bg-inverted/5 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-serif text-primary mb-1">{item.productName}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-primary/40 font-bold">
                        <span dir="ltr">{item.variant.sku}</span>
                      </p>
                    </div>
                    <p className="text-lg font-serif text-primary"><span dir="ltr">EGP {item.priceAtPurchase.toLocaleString()}</span></p>
                  </div>
                  <div className="flex gap-8 text-xs text-primary/60">
                    <div>
                      <span className="uppercase tracking-widest text-[10px] text-primary/30 block mb-1">{t.orderDetails.size}</span>
                      {item.variant.size}
                    </div>
                    <div>
                      <span className="uppercase tracking-widest text-[10px] text-primary/30 block mb-1">{t.orderDetails.color}</span>
                      {item.variant.color}
                    </div>
                    <div>
                      <span className="uppercase tracking-widest text-[10px] text-primary/30 block mb-1">{t.orderDetails.quantity}</span>
                      {item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-12">
          <section className="space-y-8 bg-inverted/[0.02] p-8 border border-primary/5">
            <TrackingTimeline reservation={order} />
          </section>

          <section className="space-y-8 bg-inverted/[0.02] p-8 border border-primary/5">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary/40 font-bold border-b border-primary/5 pb-4">{t.orderDetails.financialSummary}</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-primary/60">
                <span>{t.orderDetails.subtotal}</span>
                <span><span dir="ltr">EGP {order.financials.subtotal.toLocaleString()}</span></span>
              </div>
              <div className="flex justify-between text-primary/60">
                <span>{t.orderDetails.vat}</span>
                <span><span dir="ltr">EGP {order.financials.vat.toLocaleString()}</span></span>
              </div>
              <div className="flex justify-between text-primary/60">
                <span>{t.orderDetails.shipping}</span>
                <span><span dir="ltr">EGP {order.financials.shippingFee.toLocaleString()}</span></span>
              </div>
              <div className="h-[1px] bg-primary/5 w-full my-4" />
              <div className="flex justify-between text-xl font-serif text-primary">
                <span>{t.orderDetails.total}</span>
                <span><span dir="ltr">EGP {order.totalAmount.toLocaleString()}</span></span>
              </div>
            </div>
          </section>

          <section className="space-y-8 bg-inverted/[0.02] p-8 border border-primary/5">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary/40 font-bold border-b border-primary/5 pb-4">{t.orderDetails.deliveryDetails}</h2>
            <div className="space-y-4 text-sm text-primary/60 leading-relaxed">
              <p className="font-medium text-primary">{order.customerInfo.fullName}</p>
              <p>{order.customerInfo.phone}</p>
              <p>{order.customerInfo.address}</p>
            </div>
          </section>
        </aside>
      </div>

      {/* Authenticity Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#FDFCFB] p-12 md:p-24 shadow-2xl overflow-hidden"
            >
              {/* WANAS Seal Background */}
              <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <Award className="w-[600px] h-[600px]" />
              </div>

              <button 
                onClick={() => setShowCertificate(false)}
                className="absolute top-8 end-8 text-primary/20 hover:text-primary transition-colors"
              >
                <X strokeWidth={1} className="w-6 h-6" />
              </button>

              <div className="relative space-y-16 text-center">
                <div className="space-y-4">
                  <h2 className="text-[10px] uppercase tracking-[0.5em] text-accent-primary font-bold">{t.orderDetails.certificate.title}</h2>
                  <div className="w-12 h-[1px] bg-accent-primary/30 mx-auto" />
                </div>

                <div className="space-y-8">
                  <h3 className="text-6xl font-serif text-[#1A1A1A] italic">{t.orderDetails.certificate.atelier}</h3>
                  <p className="max-w-xl mx-auto text-sm text-[#4A4A4A] leading-relaxed font-light italic">
                    {t.orderDetails.certificate.description.replace('{orderNumber}', order.orderNumber || order.reservationNumber)}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-[#1A1A1A]/5">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/30 block mb-2">{t.orderDetails.certificate.orderId}</span>
                    <span className="text-xs font-serif text-[#1A1A1A]">{order.orderNumber || order.reservationNumber}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/30 block mb-2">{t.orderDetails.certificate.issueDate}</span>
                    <span className="text-xs font-serif text-[#1A1A1A]">{new Date().toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/30 block mb-2">{t.orderDetails.certificate.material}</span>
                    <span className="text-xs font-serif text-[#1A1A1A]">{t.orderDetails.certificate.materialValue}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/30 block mb-2">{t.orderDetails.certificate.status}</span>
                    <span className="text-xs font-serif text-[#1A1A1A]">{t.orderDetails.certificate.statusValue}</span>
                  </div>
                </div>

                <div className="pt-12 flex flex-col items-center gap-6">
                  <div className="w-24 h-24 rounded-full border border-accent-primary/20 flex items-center justify-center">
                    <Award strokeWidth={1} className="w-12 h-12 text-accent-primary/40" />
                  </div>
                  <p className="text-[8px] uppercase tracking-[0.4em] text-[#1A1A1A]/40">{t.orderDetails.certificate.authenticatedBy}</p>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="mt-12 inline-flex items-center gap-3 text-[8px] uppercase tracking-widest text-accent-primary hover:text-primary transition-colors no-print"
                >
                  <Printer className="w-3 h-3" />
                  {t.orderDetails.certificate.print}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
