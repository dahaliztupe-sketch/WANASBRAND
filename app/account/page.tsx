'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase/client';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { Package, Heart, RotateCcw, ArrowRight, Clock, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { Reservation } from '@/types';

export default function AccountDashboard() {
  const [recentOrders, setRecentOrders] = useState<Reservation[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      try {
        // Fetch User Data for Tier
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid)));
        if (!userDoc.empty) {
          setUserData(userDoc.docs[0].data());
        }

        // Fetch Recent Orders
        const q = query(
          collection(db, 'reservations'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(2)
        );
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
        setRecentOrders(orders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isInnerCircle = userData?.tier === 'InnerCircle';

  return (
    <div className="space-y-16">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-primary/5 pb-12">
        <div className="flex items-center gap-8">
          <div className={`relative w-24 h-24 rounded-full bg-accent-primary/5 flex items-center justify-center border border-primary/5 ${isInnerCircle ? 'shadow-[0_0_30px_rgba(212,165,165,0.3)] border-accent-primary/30' : ''}`}>
            <span className="text-3xl font-serif text-accent-primary">
              {auth.currentUser?.displayName?.[0] || 'A'}
            </span>
            {isInnerCircle && (
              <div className="absolute -bottom-2 -right-2 bg-accent-primary text-inverted text-[8px] uppercase tracking-widest px-2 py-1 rounded-full">
                Inner Circle
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-serif text-primary mb-2 tracking-wide">
              Welcome back, {auth.currentUser?.displayName?.split(' ')[0] || 'Atelier Client'}
            </h1>
            {isInnerCircle ? (
              <p className="text-accent-primary font-serif italic tracking-wide">
                Your private concierge is on standby.
              </p>
            ) : (
              <p className="text-primary/50 font-light tracking-wide">
                Member of the WANAS Atelier
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-primary/40">
            <Clock strokeWidth={1} className="w-4 h-4 stroke-[1px]" />
            Joined {new Date(auth.currentUser?.metadata.creationTime || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Active Orders', value: recentOrders.length, icon: Package, color: 'text-blue-500' },
          { label: 'The Vault', value: '12', icon: Heart, color: 'text-accent-primary' },
          { label: 'Returns Pending', value: '0', icon: RotateCcw, color: 'text-amber-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-inverted/[0.02] p-8 border border-primary/5 group hover:border-accent-primary/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <stat.icon className={`w-6 h-6 stroke-[1.5px] ${stat.color}`} />
              <span className="text-3xl font-serif text-primary">{stat.value}</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-primary/40">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Recent Orders */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-serif text-primary tracking-wide">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs uppercase tracking-widest text-accent-primary hover:text-primary transition-colors">
              View All
            </Link>
          </div>
          
          <div className="space-y-6">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-32 bg-inverted/5 animate-pulse" />)
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link 
                  key={order.id} 
                  href={`/account/orders/${order.id}`}
                  className="block p-6 border border-primary/5 hover:border-accent-primary/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-primary/40 mb-1">Order {order.reservationNumber}</p>
                      <p className="text-sm font-medium text-primary">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-[10px] uppercase tracking-widest font-medium">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-serif text-primary">${order.totalAmount.toLocaleString()}</p>
                    <ArrowRight strokeWidth={1} className="w-4 h-4 text-primary/20 group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center border border-dashed border-primary/10">
                <p className="text-primary/40 text-sm font-light italic">No recent orders found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Atelier Details Summary */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-serif text-primary tracking-wide">Atelier Details</h2>
            <button className="text-xs uppercase tracking-widest text-accent-primary hover:text-primary transition-colors">
              Edit
            </button>
          </div>
          
          <div className="bg-inverted/[0.02] p-8 border border-primary/5 space-y-8">
            <div className="flex items-start gap-6">
              <MapPin strokeWidth={1} className="w-5 h-5 text-primary/30 mt-1" />
              <div>
                <p className="text-xs uppercase tracking-widest text-primary/40 mb-2">Primary Atelier Address</p>
                <p className="text-sm text-primary leading-relaxed font-light">
                  {auth.currentUser?.displayName || 'Guest User'}<br />
                  Add your address to expedite your next acquisition.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <CreditCard strokeWidth={1} className="w-5 h-5 text-primary/30 mt-1" />
              <div>
                <p className="text-xs uppercase tracking-widest text-primary/40 mb-2">Payment Method</p>
                <p className="text-sm text-primary leading-relaxed font-light">
                  No payment methods saved.<br />
                  Securely save your details for a seamless boutique experience.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
