'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase/client';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { Package, Heart, RotateCcw, ArrowRight, Clock, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { Reservation } from '@/types';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function AccountDashboard() {
  const [recentOrders, setRecentOrders] = useState<Reservation[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useTranslation();

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      fetchData(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (uid: string) => {
    try {
      // Fetch User Data for Tier
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
      if (!userDoc.empty) {
        setUserData(userDoc.docs[0].data());
      }

      // Fetch Recent Orders
      const q = query(
        collection(db, 'reservations'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(2)
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      setRecentOrders(orders);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'account_dashboard', auth);
    } finally {
      setLoading(false);
    }
  };

  const isInnerCircle = userData?.tier === 'InnerCircle';

  return (
    <div className="space-y-32 pb-32">
      {/* Welcome Header - Editorial */}
      <div className="relative pt-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 border-b border-primary/10 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <span className="w-12 h-px bg-accent-primary"></span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold">{t.account.privateAtelier}</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-primary tracking-tighter leading-[0.9]">
              {t.account.welcome} <br />
              <span className="italic text-accent-primary">{auth.currentUser?.displayName?.split(' ')[0] || t.account.client}</span>
            </h1>
            {isInnerCircle ? (
              <p className="text-primary/60 font-sans text-lg max-w-md leading-loose">
                {t.account.innerCircleDesc}
              </p>
            ) : (
              <p className="text-primary/60 font-sans text-lg max-w-md leading-loose">
                {t.account.memberDesc}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-6">
            <div className={`relative w-32 h-32 rounded-full bg-secondary flex items-center justify-center border border-primary/10 ${isInnerCircle ? 'shadow-[0_0_40px_rgba(212,165,165,0.2)] border-accent-primary/50' : ''}`}>
              <span className="text-5xl font-serif text-primary/40">
                {auth.currentUser?.displayName?.[0] || 'A'}
              </span>
              {isInnerCircle && (
                <div className="absolute -bottom-2 bg-accent-primary text-primary-foreground text-[9px] uppercase tracking-[0.3em] px-4 py-2 font-bold">
                  {t.account.innerCircle}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.3em] text-primary/40 font-bold">
              <Clock strokeWidth={1} className="w-4 h-4" />
              {t.account.joined} {new Date(auth.currentUser?.metadata.creationTime || Date.now()).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Minimalist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
        {[
          { label: t.account.activeOrders, value: recentOrders.length, icon: Package },
          { label: t.account.theVault, value: '12', icon: Heart },
          { label: t.account.returnsPending, value: '0', icon: RotateCcw },
        ].map((stat, idx) => (
          <div key={idx} className="group relative p-8 border border-primary/10 hover:border-accent-primary/50 transition-colors duration-700 bg-secondary/30">
            <div className="absolute top-0 end-0 p-6 opacity-20 group-hover:opacity-100 group-hover:text-accent-primary transition-all duration-700">
              <stat.icon className="w-8 h-8 stroke-[1px]" />
            </div>
            <div className="space-y-6">
              <span className="text-5xl font-serif text-primary block">{stat.value}</span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary/50 font-bold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Details - Asymmetrical */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Recent Orders */}
        <section className="lg:col-span-7 space-y-12">
          <div className="flex items-center justify-between border-b border-primary/10 pb-6">
            <h2 className="text-3xl font-serif text-primary">{t.account.recentAcquisitions}</h2>
            <Link href="/account/orders" className="text-[9px] uppercase tracking-[0.3em] text-accent-primary hover:text-primary transition-colors font-bold flex items-center gap-2 group">
              {t.account.viewArchive} <ArrowRight strokeWidth={1} className={`w-3 h-3 transition-transform ${locale === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
            </Link>
          </div>
          
          <div className="space-y-8">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-40 bg-secondary/50 animate-pulse" />)
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link 
                  key={order.id} 
                  href={`/account/orders/${order.id}`}
                  className="block p-8 border border-primary/10 hover:border-accent-primary/50 transition-colors duration-700 group bg-secondary/20"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40 font-bold">{t.account.order} <bdi>{order.reservationNumber}</bdi></p>
                      <p className="text-lg font-serif text-primary">{new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <span className="px-4 py-2 bg-primary/5 text-primary text-[9px] uppercase tracking-[0.3em] font-bold border border-primary/10">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-6 border-t border-primary/10">
                    <p className="text-2xl font-serif text-primary"><bdi>{order.totalAmount.toLocaleString()} EGP</bdi></p>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-accent-primary font-bold group-hover:text-primary transition-colors">{t.account.viewDetails}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-24 text-center border border-primary/10 bg-secondary/20">
                <p className="text-primary/40 text-lg font-serif italic">{t.account.emptyArchive}</p>
                <Link href="/collections" className="inline-block mt-6 text-[9px] uppercase tracking-[0.3em] text-accent-primary font-bold hover:text-primary transition-colors border-b border-accent-primary/30 pb-1">
                  {t.account.exploreCollection}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Atelier Details Summary */}
        <section className="lg:col-span-5 space-y-12">
          <div className="flex items-center justify-between border-b border-primary/10 pb-6">
            <h2 className="text-3xl font-serif text-primary">{t.account.atelierProfile}</h2>
            <button className="text-[9px] uppercase tracking-[0.3em] text-accent-primary hover:text-primary transition-colors font-bold">
              {t.account.editDetails}
            </button>
          </div>
          
          <div className="bg-secondary/30 p-10 border border-primary/10 space-y-12">
            <div className="flex items-start gap-6 group">
              <MapPin strokeWidth={1} className="w-6 h-6 text-primary/30 mt-1 group-hover:text-accent-primary transition-colors" />
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40 font-bold">{t.account.primaryAddress}</p>
                <p className="text-base text-primary leading-loose font-sans font-light">
                  {auth.currentUser?.displayName || t.account.guestUser}<br />
                  <span className="text-primary/60 italic">{t.account.addAddress}</span>
                </p>
              </div>
            </div>
            
            <div className="w-full h-px bg-primary/10"></div>
            
            <div className="flex items-start gap-6 group">
              <CreditCard strokeWidth={1} className="w-6 h-6 text-primary/30 mt-1 group-hover:text-accent-primary transition-colors" />
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40 font-bold">{t.account.paymentMethod}</p>
                <p className="text-base text-primary leading-loose font-sans font-light">
                  {t.account.noPayment}<br />
                  <span className="text-primary/60 italic">{t.account.saveDetails}</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
