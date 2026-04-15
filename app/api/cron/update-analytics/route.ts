import { NextResponse } from 'next/server';
import { collection, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';

import { db } from '@/lib/firebase/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // 1. Aggregate Reservations & Revenue
    const reservationsSnap = await getDocs(collection(db, 'reservations'));
    const totalReservations = reservationsSnap.size;
    let totalRevenue = 0;
    
    reservationsSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'deposit_paid' || data.status === 'delivered' || data.status === 'shipped') {
        totalRevenue += data.financials?.total || data.totalAmount || 0;
      }
    });

    // 2. Aggregate Users
    const usersSnap = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnap.size;

    // 3. Write to stats/latest
    const statsRef = doc(db, 'stats', 'latest');
    await setDoc(statsRef, {
      totalReservations,
      totalRevenue,
      totalUsers,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      stats: {
        totalReservations,
        totalRevenue,
        totalUsers,
      }
    });
  } catch (error) {
    console.error('Cron Analytics Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update analytics' }, { status: 500 });
  }
}
