import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, setDoc, doc, serverTimestamp } from 'firebase/firestore';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Aggregate Orders & Revenue
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const totalOrders = ordersSnap.size;
    let totalRevenue = 0;
    
    ordersSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'confirmed' || data.status === 'delivered') {
        totalRevenue += data.totalAmount || 0;
      }
    });

    // 2. Aggregate Users
    const usersSnap = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnap.size;

    // 3. Aggregate Reservations
    const reservationsSnap = await getDocs(collection(db, 'reservations'));
    const totalReservations = reservationsSnap.size;

    // 4. Write to stats/latest
    const statsRef = doc(db, 'stats', 'latest');
    await setDoc(statsRef, {
      totalOrders,
      totalRevenue,
      totalUsers,
      totalReservations,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        totalUsers,
        totalReservations,
      }
    });
  } catch (error) {
    console.error('Cron Analytics Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update analytics' }, { status: 500 });
  }
}
