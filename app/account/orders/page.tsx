'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Package, ArrowRight, Clock, Calendar, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Reservation } from '@/types';
import Image from 'next/image';

const statusMap: Record<string, { label: string; color: string }> = {
  'pending_contact': { label: 'Awaiting Consultation', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  'contacted': { label: 'In Consultation', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  'deposit_paid': { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  'in_production': { label: 'In the Atelier', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  'shipped': { label: 'En Route', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  'delivered': { label: 'Delivered', color: 'bg-green-50 text-green-600 border-green-100' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100' },
  'returned': { label: 'Returned', color: 'bg-gray-50 text-gray-600 border-gray-100' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'reservations'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-inverted/5 animate-pulse rounded-sm" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-accent-primary/5 flex items-center justify-center text-accent-primary/20">
          <Package strokeWidth={1} className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif text-primary">No Acquisitions Yet</h2>
          <p className="text-primary/40 font-light italic">Your collection history will appear here.</p>
        </div>
        <Link 
          href="/collections/all" 
          className="px-8 py-4 bg-inverted text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all"
        >
          Begin Your Journey
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-serif text-primary tracking-wide">My Collection</h1>
        <p className="text-primary/50 font-light tracking-wide">A history of your curated acquisitions and bespoke requests.</p>
      </header>

      <div className="space-y-12">
        {orders.map((order, idx) => {
          const status = statusMap[order.status] || { label: order.status, color: 'bg-gray-50 text-gray-600 border-gray-100' };
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-inverted/[0.01] border border-primary/5 hover:border-accent-primary/20 transition-all duration-500 overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary/40 font-bold">
                      Order {order.orderNumber || order.reservationNumber}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-primary/60">
                      <div className="flex items-center gap-2">
                        <Calendar strokeWidth={1} className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-primary/10" />
                      <div className="flex items-center gap-2">
                        <ShoppingBag strokeWidth={1} className="w-3 h-3" />
                        {order.items.length} {order.items.length === 1 ? 'Piece' : 'Pieces'}
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 border text-[10px] uppercase tracking-widest font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                  <div className="flex -space-x-4 overflow-hidden">
                    {order.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="relative w-20 h-24 border-2 border-primary/5 bg-white overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-20 h-24 border-2 border-primary/5 bg-inverted/5 flex items-center justify-center text-xs text-primary/40 font-serif italic">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-6">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-primary/40 mb-1">Total Value</p>
                      <p className="text-2xl font-serif text-primary">EGP {order.totalAmount.toLocaleString()}</p>
                    </div>
                    <Link 
                      href={`/account/orders/${order.id}`}
                      className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-accent-primary hover:text-primary transition-all group/link"
                    >
                      View Details
                      <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
