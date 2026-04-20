import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';

/**
 * Real-time Business Intelligence & Analytics for WANAS Atelier.
 * All values derived from live Firestore data.
 */

export const getBusinessDashboard = async () => {
  try {
    const reservationsSnap = await getDocs(collection(db, 'reservations'));
    const reservations = reservationsSnap.docs.map(d => d.data());

    const confirmed = reservations.filter(r => r.status === 'confirmed' || r.status === 'delivered');
    const revenue = confirmed.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const aov = revenue / (confirmed.length || 1);

    const usersSnap = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnap.size;

    const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const recentReservationsSnap = await getDocs(
      query(collection(db, 'reservations'), where('createdAt', '>=', thirtyDaysAgo))
    );
    const recentRevenue = recentReservationsSnap.docs
      .map(d => d.data())
      .filter(r => r.status === 'confirmed' || r.status === 'delivered')
      .reduce((acc, r) => acc + (r.totalAmount || 0), 0);

    const conversionRate = totalUsers > 0 ? confirmed.length / totalUsers : 0;
    const clv = totalUsers > 0 ? revenue / totalUsers : 0;

    const uniqueCustomersWithReservation = new Set(confirmed.map(r => r.userId).filter(Boolean));
    const activeRate = totalUsers > 0 ? uniqueCustomersWithReservation.size / totalUsers : 0;
    const churnRate = 1 - activeRate;

    return {
      revenue,
      recentRevenue,
      averageReservationValue: aov,
      totalReservations: reservations.length,
      confirmedReservations: confirmed.length,
      totalCustomers: totalUsers,
      activeCustomers: uniqueCustomersWithReservation.size,
      conversionRate: parseFloat(conversionRate.toFixed(4)),
      churnRate: parseFloat(churnRate.toFixed(4)),
      clv: parseFloat(clv.toFixed(2)),
    };
  } catch (error) {
    console.error('[Analytics] Error fetching business dashboard:', error);
    return null;
  }
};

export const analyzeCheckoutFunnel = async () => {
  try {
    const eventsSnap = await getDocs(
      query(collection(db, 'analytics_events'), limit(5000))
    );
    const events = eventsSnap.docs.map(d => d.data());

    const count = (type: string) => events.filter(e => e.type === type).length;

    const productViewed   = count('product_viewed');
    const itemAdded       = count('item_added');
    const checkoutStarted = count('checkout_started');

    const reservationsSnap = await getDocs(collection(db, 'reservations'));
    const reservationCreated = reservationsSnap.size;

    return {
      productViewed:    productViewed    || 0,
      itemAdded:        itemAdded        || 0,
      checkoutStarted:  checkoutStarted  || 0,
      reservationCreated,
      addToViewRatio:   productViewed > 0 ? (itemAdded / productViewed) : 0,
      checkoutToAddRatio: itemAdded > 0   ? (checkoutStarted / itemAdded) : 0,
      conversionRatio:  checkoutStarted > 0 ? (reservationCreated / checkoutStarted) : 0,
    };
  } catch (error) {
    console.error('[Analytics] Error analyzing checkout funnel:', error);
    return {
      productViewed: 0,
      itemAdded: 0,
      checkoutStarted: 0,
      reservationCreated: 0,
      addToViewRatio: 0,
      checkoutToAddRatio: 0,
      conversionRatio: 0,
    };
  }
};

export const getTopProducts = async (limitCount = 10) => {
  try {
    const reservationsSnap = await getDocs(collection(db, 'reservations'));
    const productMap: Record<string, { name: string; revenue: number; count: number }> = {};

    for (const doc of reservationsSnap.docs) {
      const data = doc.data();
      if (!Array.isArray(data.items)) continue;
      for (const item of data.items) {
        const pid = item.productId || item.id;
        if (!pid) continue;
        if (!productMap[pid]) {
          productMap[pid] = { name: item.name || pid, revenue: 0, count: 0 };
        }
        productMap[pid].revenue += (item.price || 0) * (item.quantity || 1);
        productMap[pid].count += item.quantity || 1;
      }
    }

    return Object.entries(productMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limitCount);
  } catch (error) {
    console.error('[Analytics] Error fetching top products:', error);
    return [];
  }
};

export const getRevenueByPeriod = async (days = 30) => {
  try {
    const since = Timestamp.fromDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
    const snap = await getDocs(
      query(
        collection(db, 'reservations'),
        where('createdAt', '>=', since),
        orderBy('createdAt', 'asc'),
        limit(1000)
      )
    );

    const byDate: Record<string, number> = {};
    for (const doc of snap.docs) {
      const data = doc.data();
      if (data.status !== 'confirmed' && data.status !== 'delivered') continue;
      const date = (data.createdAt as Timestamp).toDate().toISOString().split('T')[0]!;
      byDate[date] = (byDate[date] ?? 0) + (data.totalAmount || 0);
    }

    return Object.entries(byDate).map(([date, revenue]) => ({ date, revenue }));
  } catch (error) {
    console.error('[Analytics] Error fetching revenue by period:', error);
    return [];
  }
};
