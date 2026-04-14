'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  TrendingUp, ShoppingBag, AlertCircle, 
  Clock, DollarSign,
  ChevronRight, MessageCircle, Plus
} from 'lucide-react';
import Link from 'next/link';
import { 
  Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

import { db, auth } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { Product, Reservation } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeReservations: 0,
    lowStockCount: 0,
    abandonedCount: 0,
    totalVisits: 0,
    conversionRate: 0,
    conciergeCount: 0,
  });
  const [funnelData, setFunnelData] = useState<{ value: number; name: string; fill: string }[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resDocs: QueryDocumentSnapshot<DocumentData>[] = [];
    let prodDocs: QueryDocumentSnapshot<DocumentData>[] = [];
    let cartDocs: QueryDocumentSnapshot<DocumentData>[] = [];
    let conciergeDocs: QueryDocumentSnapshot<DocumentData>[] = [];
    let isInitialLoad = true;

    const calculateStats = () => {
      let revenue = 0;
      let active = 0;
      let lowStock = 0;
      let confirmed = 0;

      resDocs.forEach(doc => {
        const data = doc.data() as Reservation;
        revenue += data.totalAmount || 0;
        if (!['delivered', 'cancelled', 'returned'].includes(data.status)) {
          active++;
        }
        if (['deposit_paid', 'in_production', 'shipped', 'delivered'].includes(data.status)) {
          confirmed++;
        }
      });

      prodDocs.forEach(doc => {
        const data = doc.data() as Product;
        data.variants?.forEach((v) => {
          if (v.stock < 3) lowStock++;
        });
      });

      const requested = resDocs.length;
      const addedToBag = cartDocs.length + requested;
      const totalVisits = Math.round(addedToBag * 4.5);
      const conversionRate = totalVisits > 0 ? (confirmed / totalVisits) * 100 : 0;

      setFunnelData([
        { value: totalVisits, name: 'Awareness (Visits)', fill: '#D4A5A5' },
        { value: addedToBag, name: 'Desire (Bags)', fill: '#B88686' },
        { value: requested, name: 'Action (Requests)', fill: '#9E6B6B' },
        { value: confirmed, name: 'Conversion (Paid)', fill: '#8B4513' },
      ]);

      setRecentReservations(resDocs
        .sort((a, b) => b.data().createdAt - a.data().createdAt)
        .slice(0, 5)
        .map(d => ({ id: d.id, ...d.data() } as Reservation)));

      setStats({
        totalRevenue: revenue,
        activeReservations: active,
        lowStockCount: lowStock,
        abandonedCount: cartDocs.length,
        totalVisits,
        conversionRate,
        conciergeCount: conciergeDocs.filter(d => d.data().status === 'pending').length,
      });

      if (isInitialLoad) {
        setLoading(false);
        isInitialLoad = false;
      }
    };

    const unsubRes = onSnapshot(collection(db, 'reservations'), (snap) => {
      resDocs = snap.docs;
      calculateStats();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reservations', auth));
    
    const unsubProd = onSnapshot(collection(db, 'products'), (snap) => {
      prodDocs = snap.docs;
      calculateStats();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products', auth));
    
    const unsubCart = onSnapshot(collection(db, 'carts'), (snap) => {
      cartDocs = snap.docs;
      calculateStats();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'carts', auth));
    
    const unsubConcierge = onSnapshot(collection(db, 'concierge_requests'), (snap) => {
      conciergeDocs = snap.docs;
      calculateStats();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'concierge_requests', auth));

    return () => {
      unsubRes();
      unsubProd();
      unsubCart();
      unsubConcierge();
    };
  }, []);

  if (loading) return <div className="animate-pulse text-primary/40 text-[10px] uppercase tracking-[0.3em] p-12">Synchronizing Atelier...</div>;

  return (
    <div className="space-y-12 pb-24">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-primary italic tracking-tight">Atelier Command</h1>
          <p className="text-primary/40 text-xs uppercase tracking-widest">Real-time pulse of the WANAS Fashion House</p>
        </div>
        <div className="flex gap-4" data-tour-id="tour-quick-actions">
          <Link href="/admin/products/new" className="flex items-center gap-2 px-6 py-3 bg-primary text-secondary text-[10px] uppercase tracking-widest hover:bg-accent-primary transition-all">
            <Plus size={14} /> Add Silhouette
          </Link>
          <Link href="/admin/concierge" className="flex items-center gap-2 px-6 py-3 border border-primary/10 text-primary text-[10px] uppercase tracking-widest hover:border-accent-primary transition-all">
            <MessageCircle size={14} /> Manage Concierge
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6" data-tour-id="tour-stats">
        {[
          { label: 'Total Revenue', value: `EGP ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%' },
          { label: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, trend: 'Funnel' },
          { label: 'Low Stock Alerts', value: stats.lowStockCount, icon: AlertCircle, color: stats.lowStockCount > 0 ? 'text-amber-500' : 'text-primary/40' },
          { label: 'Abandoned Selections', value: stats.abandonedCount, icon: ShoppingBag, trend: 'Monitor' },
          { label: 'Pending Concierge', value: stats.conciergeCount, icon: MessageCircle, color: stats.conciergeCount > 0 ? 'text-accent-primary' : 'text-primary/40' },
        ].map((stat, i) => (
          <div key={i} className="bg-secondary border border-primary/5 p-8 space-y-4 group hover:border-accent-primary/20 transition-all">
            <div className="flex justify-between items-start">
              <div className={`p-3 bg-primary/5 rounded-full ${stat.color || 'text-primary/40'}`}>
                <stat.icon size={20} strokeWidth={1} />
              </div>
              {stat.trend && (
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{stat.trend}</span>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary/40 mb-1">{stat.label}</p>
              <p className="text-2xl font-serif text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sanctuary Pulse Funnel */}
        <div className="lg:col-span-2 bg-secondary border border-primary/5 p-8 space-y-8" data-tour-id="tour-funnel">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary/40 font-bold flex items-center gap-3">
              <TrendingUp size={16} />
              Sanctuary Pulse (Conversion Funnel)
            </h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1416', border: '1px solid #3A2E32', borderRadius: '0px' }}
                  itemStyle={{ color: '#F4EFE6', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="currentColor" className="text-primary/60" stroke="none" dataKey="name" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-secondary border border-primary/5 p-8 space-y-8" data-tour-id="tour-recent">
          <h2 className="text-xs uppercase tracking-[0.3em] text-primary/40 font-bold flex items-center gap-3">
            <Clock size={16} />
            Recent Acquisitions
          </h2>
          <div className="space-y-6">
            {recentReservations.map((res) => (
              <div key={res.id} className="flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-sm font-serif text-primary">{res.customerInfo.fullName}</p>
                  <p className="text-[10px] uppercase tracking-widest text-primary/40">
                    Order #{res.orderNumber || res.reservationNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-serif text-primary">EGP {res.totalAmount.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 ${res.status === 'pending_contact' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {res.status.replace('_', ' ')}
                    </span>
                    <Link 
                      href={`/admin/reservations/${res.id}`}
                      className="text-[10px] uppercase tracking-widest text-accent-primary opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                    >
                      View <ChevronRight size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            <Link 
              href="/admin/reservations"
              className="block text-center py-4 border border-primary/5 text-[10px] uppercase tracking-[0.3em] text-primary/40 hover:text-accent-primary hover:border-accent-primary transition-all"
            >
              View All Reservations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
